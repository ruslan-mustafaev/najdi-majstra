import { supabase } from './supabase';

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
}