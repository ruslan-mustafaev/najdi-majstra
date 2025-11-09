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
  subscriptionType?: string;
  subscriptionEndDate?: string;
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

    const { data: subscriptionsData } = await supabase
      .from('subscriptions')
      .select('user_id, plan_name, current_period_end, status')
      .in('user_id', masterUserIds)
      .eq('status', 'active');

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

    const subscriptionMap = new Map();
    (subscriptionsData || []).forEach(sub => {
      subscriptionMap.set(sub.user_id, {
        planName: sub.plan_name?.toLowerCase() || 'mini',
        endDate: sub.current_period_end
      });
    });

    const masters = data.map(master => {
      const subscription = subscriptionMap.get(master.user_id);
      return {
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
        serviceArea: master.service_area || 'lokálne',
        subscriptionType: subscription?.planName || 'free',
        subscriptionEndDate: subscription?.endDate,
        hasActiveSubscription: !!subscription
      };
    });

    const getSubscriptionPriority = (type: string, hasSubscription: boolean): number => {
      if (!hasSubscription) return 999;

      const normalizedType = type.toLowerCase();
      switch(normalizedType) {
        case 'premier': return 1;
        case 'expert': return 2;
        case 'profik': return 3;
        case 'odborník': return 3;
        case 'profi': return 3;
        case 'standard': return 4;
        case 'mini': return 5;
        default: return 999;
      }
    };

    masters.sort((a, b) => {
      const priorityA = getSubscriptionPriority(a.subscriptionType || 'free', a.hasActiveSubscription);
      const priorityB = getSubscriptionPriority(b.subscriptionType || 'free', b.hasActiveSubscription);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      if (a.subscriptionEndDate && b.subscriptionEndDate) {
        const dateA = new Date(a.subscriptionEndDate).getTime();
        const dateB = new Date(b.subscriptionEndDate).getTime();
        if (dateA !== dateB) {
          return dateB - dateA;
        }
      }

      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }

      if (b.reviewCount !== a.reviewCount) {
        return b.reviewCount - a.reviewCount;
      }

      if (a.available !== b.available) {
        return a.available ? -1 : 1;
      }

      return 0;
    });

    return masters;
  } catch (error) {
    console.error('Search masters error:', error);
    throw error;
  }
}
