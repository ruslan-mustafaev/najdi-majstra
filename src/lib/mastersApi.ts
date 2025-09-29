import { supabase } from './supabase';

// Демо-данные для случаев когда Supabase недоступен
const getDemoMasters = () => {
  return [
    {
      id: 'demo-1',
      name: 'Ján Novák',
      profession: 'Elektrikár',
      location: 'Bratislava',
      rating: 4.8,
      reviewCount: 24,
      available: true,
      profileImage: '/placeholder-avatar.svg',
      workImages: [],
      workVideos: [],
      description: 'Skúsený elektrikár s 10-ročnou praxou. Špecializujem sa na domáce a komerčné elektroinštalácie.',
      services: ['Elektroinštalácie', 'Opravy', 'Revízie'],
      experience: '10+ rokov',
      certifications: ['Elektrotechnická spôsobilosť'],
      expertise: ['Domáce inštalácie', 'Priemyselné systémy'],
      teamSize: 'individual' as const,
      serviceTypes: ['individuals'],
      languages: ['Slovenčina'],
      priceRange: '30-50 €/hod',
      subscriptionPlan: 'standard',
      communicationStyle: 'Profesionálne a vecne',
      workingHours: {
        monday: '8:00 - 18:00',
        tuesday: '8:00 - 18:00',
        wednesday: '8:00 - 18:00',
        thursday: '8:00 - 18:00',
        friday: '8:00 - 18:00',
        saturday: '9:00 - 16:00',
        sunday: 'Zatvorené'
      },
      contact: {
        phone: '+421 905 123 456',
        email: 'jan.novak@email.sk',
        website: '',
        socialMedia: {}
      },
      availability: {
        schedule: '8:00 - 18:00',
        workRadius: 'Bratislava + 30km'
      }
    },
    {
      id: 'demo-2',
      name: 'Peter Kováč',
      profession: 'Vodoinštalatér',
      location: 'Košice',
      rating: 4.6,
      reviewCount: 18,
      available: true,
      profileImage: '/placeholder-avatar.svg',
      workImages: [],
      workVideos: [],
      description: 'Profesionálny vodoinštalatér. Ponúkam komplexné služby v oblasti sanitárnych inštalácií.',
      services: ['Inštalácie', 'Opravy', 'Servis'],
      experience: '7+ rokov',
      certifications: ['Odborná spôsobilosť'],
      expertise: ['Sanitárne systémy'],
      teamSize: 'individual' as const,
      serviceTypes: ['individuals'],
      languages: ['Slovenčina'],
      priceRange: '25-40 €/hod',
      subscriptionPlan: 'standard',
      communicationStyle: 'Priateľsky a profesionálny',
      workingHours: {
        monday: '7:00 - 17:00',
        tuesday: '7:00 - 17:00',
        wednesday: '7:00 - 17:00',
        thursday: '7:00 - 17:00',
        friday: '7:00 - 17:00',
        saturday: '8:00 - 14:00',
        sunday: 'Zatvorené'
      },
      contact: {
        phone: '+421 907 654 321',
        email: 'peter.kovac@email.sk',
        website: '',
        socialMedia: {}
      },
      availability: {
        schedule: '7:00 - 17:00',
        workRadius: 'Košice + 25km'
      }
    },
    {
      id: 'demo-3',
      name: 'Mária Svobodová',
      profession: 'Maliar',
      location: 'Žilina',
      rating: 4.9,
      reviewCount: 31,
      available: false,
      profileImage: '/placeholder-avatar.svg',
      workImages: [],
      workVideos: [],
      description: 'Špecializujem sa na interiérové a exteriérové maľovanie. Používam len kvalitné materiály.',
      services: ['Maľovanie', 'Tapetovanie', 'Dekorácie'],
      experience: '12+ rokov',
      certifications: ['Certifikát maľovania'],
      expertise: ['Interiéry', 'Exteriéry'],
      teamSize: 'small-team' as const,
      serviceTypes: ['individuals'],
      languages: ['Slovenčina', 'Čeština'],
      priceRange: '20-35 €/hod',
      subscriptionPlan: 'professional',
      communicationStyle: 'Kreatívny prístup',
      workingHours: {
        monday: '8:00 - 16:00',
        tuesday: '8:00 - 16:00',
        wednesday: '8:00 - 16:00',
        thursday: '8:00 - 16:00',
        friday: '8:00 - 16:00',
        saturday: 'Na dohode',
        sunday: 'Zatvorené'
      },
      contact: {
        phone: '+421 903 789 012',
        email: 'maria.svobodova@email.sk',
        website: '',
        socialMedia: {}
      },
      availability: {
        schedule: '8:00 - 16:00',
        workRadius: 'Žilina + 40km'
      }
    }
  ];
};

export const getTopRatedMasters = async () => {
  try {
    // Проверяем доступность Supabase с таймаутом
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    );

    const dataPromise = supabase
      .from('masters')
      .select('*')
      .eq('is_active', true)
      .eq('profile_completed', true)
      .neq('is_deleted', true)
      .is('deleted_at', null)
      .order('rating', { ascending: false })
      .limit(10);

    const { data, error } = await Promise.race([dataPromise, timeoutPromise]);

    if (error) {
      console.error('Error loading masters:', error);
      // Возвращаем демо-данные если Supabase недоступен
      return getDemoMasters();
    }

    if (!data || data.length === 0) {
      console.log('No masters found in database, returning demo data');
      return getDemoMasters();
    }

    // Преобразуем данные из базы в формат Master
    return data.map(master => ({
      id: master.id,
      name: master.name || 'Bez mena',
      profession: master.profession || 'Majster',
      location: master.location || 'Slovensko',
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
  } catch (error) {
    console.error('Get masters error:', error);
    // В случае любой ошибки возвращаем демо-данные
    return getDemoMasters();
  }
};