import { supabase } from './supabase';
import { checkConnection } from './supabase';

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
        return JSON.parse(cached);
      } else {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      }
    }
  } catch (error) {
    console.error('Error loading cache:', error);
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
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

// Функция очистки кеша при ошибках (НЕ ТРОГАЕТ СЕССИЮ!)
const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    // Очищаем ТОЛЬКО кеши мастеров, НЕ ТРОГАЕМ supabase сессию!
    Object.keys(localStorage).forEach(key => {
      if ((key.includes('masters') || key.includes('cache')) && !key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

export const getTopRatedMasters = async () => {
  console.log('🔍 MASTERS_API: getTopRatedMasters called');

  try {
    // Сначала проверяем кеш - если есть, отдаем его сразу
    const cachedMasters = loadCacheFromStorage();
    console.log('📦 MASTERS_API: Cache check result:', {
      hasCached: !!cachedMasters,
      count: cachedMasters?.length || 0
    });

    if (cachedMasters && cachedMasters.length > 0) {
      console.log('✅ MASTERS_API: Returning cached masters');
      // Запускаем обновление в фоне без проверки подключения
      setTimeout(() => {
        loadFromDatabase().catch(err => {
          console.warn('Background update failed:', err.message);
        });
      }, 100);
      return cachedMasters;
    }

    // Если кеша нет, проверяем подключение и загружаем
    console.log('🔌 MASTERS_API: No cache, checking connection...');
    const isConnected = await checkConnection();
    console.log('🔌 MASTERS_API: Connection result:', isConnected);

    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    console.log('📡 MASTERS_API: Loading from database...');
    const result = await loadFromDatabase();
    console.log('✅ MASTERS_API: Loaded from DB:', result.length, 'masters');
    return result;
  } catch (error) {
    console.error('❌ MASTERS_API: Get masters error:', error);
    throw error;
  }
};

const loadFromDatabase = async () => {
  console.log('💾 LOAD_DB: Starting database load...');

  try {
    // Проверяем подключение перед запросом
    console.log('🔌 LOAD_DB: Checking connection...');
    const isConnected = await checkConnection();
    console.log('🔌 LOAD_DB: Connection check result:', isConnected);

    if (!isConnected) {
      throw new Error('Database connection check failed');
    }

    console.log('📡 LOAD_DB: Executing query to masters table...');
    const { data, error } = await supabase
      .from('masters')
      .select('*')
      .eq('is_active', true)
      .eq('profile_completed', true)
      .limit(10);

    console.log('📊 LOAD_DB: Query result:', {
      hasData: !!data,
      count: data?.length || 0,
      hasError: !!error,
      error: error?.message
    });

    if (error) {
      console.error('❌ LOAD_DB: Database error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });

      throw error;
    }

    // Преобразуем данные из базы в формат Master
    const masters = (data || []).map(master => ({
      id: master.id,
      name: master.name || 'Без имени',
      profession: master.profession || 'Majster',
      location: master.location || 'Не указано',
      rating: master.rating || 4.5,
      reviewCount: master.reviews_count || 0,
      available: master.is_available ?? master.is_active,
      profileImage: master.profile_image_url || '/placeholder-avatar.svg',
      workImages: master.work_images_urls || [],
      workVideos: master.work_video_url || [],
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
      communicationStyle: master.communication_style || undefined,
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
      },
      serviceRegular: master.service_regular ?? false,
      serviceUrgent: master.service_urgent ?? false,
      serviceRealization: master.service_realization ?? false
    }));

    // Сохраняем в кеш
    if (masters.length > 0) {
      saveCacheToStorage(masters);
    }

    return masters;

  } catch (err) {
    console.error('Exception in loadFromDatabase:', err);
    // НЕ очищаем кеш при ошибке загрузки!
    throw err;
  }
};