import { supabase } from './supabase';

export interface MasterSearchParams {
  location?: string;
  profession?: string;
  serviceType?: 'urgent' | 'regular' | 'realization';
  limit?: number;
}

export interface MasterSearchResult {
  id: string;
  slug: string;
  name: string;
  profession: string;
  location: string;
  rating: number;
  reviewCount: number;
  available: boolean;
  profileImage: string;
  hourlyRateMin: number;
  hourlyRateMax: number;
  serviceArea: string;
}

export async function searchMastersByLocation(params: MasterSearchParams): Promise<MasterSearchResult[]> {
  try {
    console.log('🔎 searchMastersByLocation called with params:', params);

    let query = supabase
      .from('masters')
      .select('*')
      .eq('is_active', true)
      .eq('profile_completed', true);

    if (params.location) {
      const locationLower = params.location.toLowerCase();
      console.log(`📍 Filtering by location: "${locationLower}"`);
      query = query.or(`location.ilike.%${locationLower}%,service_area.ilike.%${locationLower}%`);
    }

    if (params.profession) {
      console.log(`💼 Filtering by profession: "${params.profession}"`);
      query = query.ilike('profession', `%${params.profession}%`);
    }

    if (params.serviceType === 'urgent') {
      console.log('⚡ Filtering by service_urgent = true');
      query = query.eq('service_urgent', true);
    } else if (params.serviceType === 'regular') {
      console.log('📅 Filtering by service_regular = true');
      query = query.eq('service_regular', true);
    } else if (params.serviceType === 'realization') {
      console.log('🏗️ Filtering by service_realization = true');
      query = query.eq('service_realization', true);
    }

    query = query.limit(params.limit || 10);

    const { data, error } = await query;

    console.log('📊 Query result:', { foundMasters: data?.length || 0, error });

    if (error) {
      console.error('Master search error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    const masterUserIds = data.map(m => m.user_id);
    const { data: reviewsData } = await supabase
      .from('master_reviews')
      .select('master_id, rating')
      .in('master_id', masterUserIds);

    const ratingsMap = new Map();
    const reviewCountMap = new Map();

    (reviewsData || []).forEach(review => {
      if (!ratingsMap.has(review.master_id)) {
        ratingsMap.set(review.master_id, []);
      }
      ratingsMap.get(review.master_id).push(review.rating);
    });

    ratingsMap.forEach((ratings, masterId) => {
      const avgRating = ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length;
      ratingsMap.set(masterId, Math.round(avgRating * 10) / 10);
      reviewCountMap.set(masterId, ratings.length);
    });

    const masters = data.map(master => ({
      id: master.id,
      slug: master.slug,
      name: master.name || 'Majster',
      profession: master.profession || 'Majster',
      location: master.location || 'Slovensko',
      rating: ratingsMap.get(master.user_id) || 0,
      reviewCount: reviewCountMap.get(master.user_id) || 0,
      available: master.is_available ?? master.is_active,
      profileImage: master.profile_image_url || '/placeholder-avatar.svg',
      hourlyRateMin: master.hourly_rate_min || 0,
      hourlyRateMax: master.hourly_rate_max || 0,
      serviceArea: master.service_area || 'lokálne'
    }));

    masters.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.reviewCount - a.reviewCount;
    });

    return masters;
  } catch (error) {
    console.error('Search masters error:', error);
    throw error;
  }
}
