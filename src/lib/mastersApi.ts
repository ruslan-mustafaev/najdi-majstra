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
    // Очищаем поврежденный кеш
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
    console.log('Masters cached successfully:', masters.length);
  } catch (error) {
    console.error('Error saving cache:', error);
  }
};

// Функция очистки кеша при ошибках
const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    console.log('Cache cleared due to connection issues');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

export const getTopRatedMasters = async () => {
  try {
    // Проверяем подключение к базе данных
    const isConnected = await checkConnection();
    if (!isConnected) {
      console.warn('Database connection failed, clearing cache');
      clearCache();
      throw new Error('Database connection failed');
    }

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
    
    // При ошибке подключения очищаем кеш и возвращаем пустой массив
    clearCache();
    throw error; // Пробрасываем ошибку дальше для обработки в компоненте
  }
};

const loadFromDatabase = async () => {
  console.log('=== LOADING MASTERS FROM DATABASE ===');
  console.log('Supabase client exists:', !!supabase);

  try {
    // Проверяем подключение перед запросом
    const isConnected = await checkConnection();
    if (!isConnected) {
      throw new Error('Database connection check failed');
    }

    const { data, error } = await supabase
      .from('masters')
      .select('*')
      .eq('is_active', true)
      .eq('profile_completed', true)
      .limit(10);

    console.log('✅ Query completed!');
    console.log('Data received:', data?.length || 0, 'masters');

    if (error) {
      console.error('❌ SUPABASE ERROR:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        status: (error as any).status
      });
      
      // При ошибке базы данных очищаем кеш
      clearCache();
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
  if (masters.length > 0) {
    saveCacheToStorage(masters);
  }

  console.log(`✅ Successfully loaded ${masters.length} masters from database`);
  return masters;

  } catch (err) {
    console.error('❌ Exception in loadFromDatabase:', err);
    clearCache();
    throw err;
  }
};