import { supabase } from './supabase';

// Кеш для мастеров
let mastersCache: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

export const getTopRatedMasters = async () => {
  try {
    // Проверяем кеш
    const now = Date.now();
    if (mastersCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Returning cached masters');
      return mastersCache;
    }

    const { data, error } = await supabase
      .from('masters')
      .select('*')
      .eq('is_active', true)
      .eq('profile_completed', true)
      .or('is_deleted.is.null,is_deleted.eq.false')
      .is('deleted_at', null)
      .order('rating', { ascending: false })
      .limit(10);
      
    if (error) {
      console.error('Error loading masters:', error);
      return mastersCache || [];
    }

    // Преобразуем данные из базы в формат Master
    const masters = (data || []).map(master => ({
      id: master.id, // Оставляем UUID как есть
      name: master.name || 'Без имени',
      profession: master.profession || 'Majster',
      location: master.location || 'Не указано',
      rating: master.rating || 4.5,
      reviewCount: master.reviews_count || 0,
      available: master.is_active,
      profileImage: master.profile_image_url || '/placeholder-avatar.svg',
      workImages: master.work_images_urls || [],
      workVideos: master.work_video_url || [], // Теперь массив видео
      description: master.description || 'Profesionálny majster s pracovnými skúsenosťami',
      services: ['Opravy', 'Inštalácie', 'Servis'],
      experience: '5+ rokov',
      certifications: ['Odborná spôsobilosť'],
      expertise: ['Všeobecné práce'],
      teamSize: 'individual' as const,
      serviceTypes: ['individuals'],
      languages: ['Slovenčina'],
      priceRange: '25-45 €/hod',
      subscriptionPlan: 'standard',
      communicationStyle: 'Profesionálne a vecne',
      workingHours: {
        monday: '8:00 - 18:00',
        tuesday: '8:00 - 18:00',
        wednesday: '8:00 - 18:00',
        thursday: '8:00 - 18:00',
        friday: '8:00 - 18:00',
        saturday: '9:00 - 16:00',
        sunday: '9:00 - 15:00'
      },
      contact: {
        phone: master.phone || '+421 9xx xxx xxx',
        email: master.email || '',
        website: '',
        socialMedia: {}
      },
      availability: {
        schedule: '8:00 - 18:00',
        workRadius: 'Lokálne + 50km'
      }
    }));

    // Сохраняем в кеш
    mastersCache = masters;
    cacheTimestamp = Date.now();

    return masters;
  } catch (error) {
    console.error('Get masters error:', error);
    return mastersCache || [];
  }
};