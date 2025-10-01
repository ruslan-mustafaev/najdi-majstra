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
    // Также очищаем другие связанные кеши
    Object.keys(localStorage).forEach(key => {
      if (key.includes('masters') || key.includes('cache')) {
        localStorage.removeItem(key);
      }
    });
    console.log('Cache cleared due to connection issues');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

export const getTopRatedMasters = async () => {
  try {
    console.log('🚀 Starting getTopRatedMasters...');
    
    // Проверяем подключение к базе данных
    const isConnected = await checkConnection();
    if (!isConnected) {
      console.warn('❌ Database connection failed, clearing cache');
      clearCache();
      throw new Error('Database connection failed');
    }

    // Проверяем кеш в localStorage
    const cachedMasters = loadCacheFromStorage();
    if (cachedMasters && cachedMasters.length > 0) {
      console.log('📦 Using cached masters:', cachedMasters.length);
      // Запускаем обновление в фоне
      setTimeout(() => {
        console.log('🔄 Updating cache in background...');
        loadFromDatabase().catch(err => {
          console.warn('Background update failed:', err);
        });
      }, 100);
      return cachedMasters;
    }

    console.log('🔄 Loading fresh data from database...');
    return await loadFromDatabase();
  } catch (error) {
    console.error('❌ Get masters error:', error);
    
    // При ошибке подключения только логируем, не очищаем кеш агрессивно
    console.warn('Masters loading failed, but keeping existing cache');
    throw error; // Пробрасываем ошибку дальше для обработки в компоненте
  }
};

const loadFromDatabase = async () => {
  console.log('📊 === LOADING MASTERS FROM DATABASE ===');
  console.log('Supabase client exists:', !!supabase);

  try {
    // Проверяем подключение перед запросом
    const isConnected = await checkConnection();
    if (!isConnected) {
      throw new Error('Database connection check failed');
    }

    console.log('🔍 Executing database query...');
    const { data, error } = await supabase
      .from('masters')
      .select('*')
      .eq('is_active', true)
      .eq('profile_completed', true)
      .limit(10);

    console.log('✅ Database query completed!');
    console.log('📈 Data received:', data?.length || 0, 'masters');

    if (error) {
      console.error('❌ SUPABASE DATABASE ERROR:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        status: (error as any).status,
        timestamp: new Date().toISOString()
      });
      
      // Только логируем ошибку, не очищаем сессию
      console.warn('Database error, but preserving session');
      
      throw error;
    }

    // Преобразуем данные из базы в формат Master
    console.log('🔄 Converting database records to Master format...');
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
      console.log('💾 Saving to cache:', masters.length, 'masters');
      saveCacheToStorage(masters);
    }

    console.log(`✅ Successfully loaded ${masters.length} masters from database`);
    return masters;

  } catch (err) {
    console.error('❌ Exception in loadFromDatabase:', {
      error: err,
      timestamp: new Date().toISOString(),
      stack: err instanceof Error ? err.stack : 'No stack trace'
    });
    clearCache();
    throw err;
  }
};