import { supabase } from './supabase'; // путь к вашему supabase клиенту

export interface MasterProfile {
  name: string;
  profession: string;
  age?: number;
  location: string;
  work_radius: string;
  description: string;
  experience: string;
  services: string;
  expertise: string;
  team_size: 'individual' | 'small-team';
  service_types: string[];
  languages: string;
  hourly_rate: string;
  availability: {
    schedule: string;
    available: boolean;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
    social_media?: {
      facebook?: string;
      instagram?: string;
      youtube?: string;
      tiktok?: string;
    };
  };
  certifications: string[];
  profile_completed: boolean;
}

export const saveMasterProfile = async (profileData: MasterProfile): Promise<MasterProfile> => {
  try {
    // Получаем текущего пользователя
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Пользователь не авторизован');
    }

    // Подготавливаем данные для Supabase (добавляем user_id)
    const dataForSupabase = {
      ...profileData,
      user_id: user.id,
      updated_at: new Date().toISOString()
    };

    // Сохраняем в таблицу master_profiles (замените название таблицы на ваше)
    const { data, error } = await supabase
      .from('master_profiles') // название вашей таблицы
      .upsert(dataForSupabase, { 
        onConflict: 'user_id' // обновляем если профиль уже существует
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Ошибка Supabase: ${error.message}`);
    }

    console.log('Profile saved to Supabase:', data);
    return data as MasterProfile;

  } catch (error) {
    console.error('Save profile error:', error);
    throw error;
  }
};