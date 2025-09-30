import { supabase } from './supabase';

const CACHE_DURATION = 5 * 60 * 1000; // 5 минут
const CACHE_KEY = 'masters_cache';
const CACHE_TIMESTAMP_KEY = 'masters_cache_timestamp';

// Функция для загрузки кеша из localStorage
const loadCacheFromStorage = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (cached && timestamp) {
      const now = Date.now();
      const cacheAge = now - parseInt(timestamp, 10);

      if (cacheAge < CACHE_DURATION) {
        console.log('Loaded masters from localStorage cache');
        return JSON.parse(cached);
      } else {
        console.log('Cache expired, clearing...');
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      }
    }
  } catch (error) {
    console.error('Error loading cache:', error);
  }
  return null;
};

// Функция для сохранения кеша в localStorage
const saveCacheToStorage = (masters: any[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(masters));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error saving cache:', error);
  }
};

export const getTopRatedMasters = async () => {
  try {
    // Проверяем кеш в localStorage
    const cachedMasters = loadCacheFromStorage();
    if (cachedMasters && cachedMasters.length > 0) {
      // Запускаем обновление в фоне
      setTimeout(() => {
        console.log('Updating cache in background...');
        loadFromDatabase();
      }, 100);
      return cachedMasters;
    }

    return await loadFromDatabase();
  } catch (error) {
    console.error('Get masters error:', error);
    // При ошибке возвращаем кеш из localStorage или пустой массив
    const cachedMasters = loadCacheFromStorage();
    if (cachedMasters && cachedMasters.length > 0) {
      console.log('Returning cached data due to error');
      return cachedMasters;
    }
    console.log('No cached data available, returning empty array');
    return [];
  }
};

const loadFromDatabase = async () => {
  console.log('Loading masters from database...');

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
    throw error;
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
  saveCacheToStorage(masters);

  console.log(`Loaded ${masters.length} masters from database`);
  return masters;
};