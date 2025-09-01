import { supabase } from './supabase';

export const getTopRatedMasters = async () => {
  try {
    const { data, error } = await supabase
      .from('masters')
      .select('*')
      .eq('is_active', true)
      .eq('profile_completed', true)
      .order('rating', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading masters:', error);
      return [];
    }

    // Преобразуем данные из базы в формат Master
    return (data || []).map(master => ({
      id: master.id,
      name: master.name || 'Без имени',
      profession: master.profession || 'Мастер',
      location: master.location || 'Не указано',
      rating: master.rating || 4.5,
      reviewCount: master.reviews_count || 0,
      available: master.is_active,
      profileImage: master.profile_photo || '', // Real photo from database or empty for default avatar
      workImages: [], // Will be loaded from database when implemented
      description: master.description || 'Профессиональный мастер с опытом работы',
      services: [], // Will be loaded from database
      experience: 'Informácie z profilu',
      certifications: [], // Will be loaded from database
      expertise: [], // Will be loaded from database
      teamSize: 'individual' as const,
      serviceTypes: ['individuals'], // Will be loaded from database
      languages: ['Slovenčina'], // Will be loaded from database
      priceRange: 'Informácie z profilu',
      subscriptionPlan: 'standard' as const,
      communicationStyle: 'Informácie z profilu',
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
        phone: master.phone || '+421 9xx xxx xxx',
        email: master.email || '',
        website: '', // Will be loaded from database
        socialMedia: {}
      },
      availability: {
        schedule: '8:00 - 18:00',
        workRadius: master.location + ' + okolie'
      }
    }));
  } catch (error) {
    console.error('Get masters error:', error);
    return [];
  }
};