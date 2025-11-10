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
  try {
    // Сначала проверяем кеш - если есть, отдаем его сразу
    const cachedMasters = loadCacheFromStorage();
    if (cachedMasters && cachedMasters.length > 0) {
      // Запускаем обновление в фоне без проверки подключения
      setTimeout(() => {
        loadFromDatabase().catch(err => {
          console.warn('Background update failed:', err.message);
        });
      }, 100);
      return cachedMasters;
    }

    // Если кеша нет, проверяем подключение и загружаем
    const isConnected = await checkConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    return await loadFromDatabase();
  } catch (error) {
    console.error('Get masters error:', error);
    throw error;
  }
};

const loadFromDatabase = async () => {
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
      .limit(100);

    if (error) {
      console.error('Database error:', {
        message: error.message,
        code: error.code
      });

      throw error;
    }

    // Get ratings for all masters
    const masterUserIds = (data || []).map(m => m.user_id);
    const { data: reviewsData } = await supabase
      .from('master_reviews')
      .select('master_id, rating')
      .in('master_id', masterUserIds);

    // Get subscriptions for all masters
    const { data: subscriptionsData } = await supabase
      .from('subscriptions')
      .select('user_id, plan_name, current_period_end, status')
      .in('user_id', masterUserIds)
      .eq('status', 'active');

    // Calculate average ratings
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

    // Map subscriptions by user_id
    const subscriptionMap = new Map();
    (subscriptionsData || []).forEach(sub => {
      subscriptionMap.set(sub.user_id, {
        planName: sub.plan_name?.toLowerCase() || 'mini',
        endDate: sub.current_period_end
      });
    });

    // Преобразуем данные из базы в формат Master
    const masters = (data || []).map(master => {
      const subscription = subscriptionMap.get(master.user_id);
      return {
      id: master.id,
      userId: master.user_id,
      slug: master.slug,
      name: master.name || 'Без имени',
      profession: master.profession || 'Majster',
      location: master.location || 'Не указано',
      rating: ratingsMap.get(master.user_id) || 0,
      reviewCount: reviewCountMap.get(master.user_id) || 0,
      available: master.is_available ?? master.is_active,
      profileImage: master.profile_image_url || '/placeholder-avatar.svg',
      workImages: master.work_images_urls || [],
      workVideos: master.work_video_url || [],
      description: master.description || '',
      services: ['Opravy', 'Inštalácie', 'Servis'],
      experience: master.experience_years ? `${master.experience_years} rokov` : '5+ rokov',
      certifications: master.certificates ? [master.certificates] : ['Odborná spôsobilosť'],
      expertise: ['Všeobecné práce'],
      teamSize: 'individual' as const,
      serviceTypes: ['individuals'],
      languages: ['Slovenčina'],
      priceRange: master.hourly_rate_min && master.hourly_rate_max
        ? `${master.hourly_rate_min}-${master.hourly_rate_max} €/hod`
        : '25-45 €/hod',
      subscriptionPlan: subscription?.planName || 'free',
      subscriptionEndDate: subscription?.endDate,
      hasActiveSubscription: !!subscription,
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
        website: master.website || '',
        socialMedia: {
          facebook: master.social_facebook || '',
          instagram: master.social_instagram || '',
          youtube: master.social_youtube || '',
          tiktok: master.social_tiktok || '',
          telegram: master.social_telegram || '',
          whatsapp: master.social_whatsapp || ''
        }
      },
      availability: {
        schedule: '8:00 - 18:00',
        workRadius: master.service_area || 'Lokálne + 50km'
      },
      serviceRegular: master.service_regular ?? false,
      serviceUrgent: master.service_urgent ?? false,
      serviceRealization: master.service_realization ?? false,
      experienceYears: master.experience_years || 0,
      teamType: master.team_type || 'individuálne',
      serviceArea: master.service_area || 'lokálne',
      hourlyRateMin: master.hourly_rate_min || 0,
      hourlyRateMax: master.hourly_rate_max || 0,
      certificatesText: master.certificates || '',
      socialFacebook: master.social_facebook || '',
      socialInstagram: master.social_instagram || '',
      socialYoutube: master.social_youtube || '',
      socialTiktok: master.social_tiktok || '',
      socialTelegram: master.social_telegram || '',
      socialWhatsapp: master.social_whatsapp || '',
      workAbroad: master.work_abroad || false
    };
    });

    // Sort by subscription priority
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
      const priorityA = getSubscriptionPriority(a.subscriptionPlan || 'free', a.hasActiveSubscription);
      const priorityB = getSubscriptionPriority(b.subscriptionPlan || 'free', b.hasActiveSubscription);

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