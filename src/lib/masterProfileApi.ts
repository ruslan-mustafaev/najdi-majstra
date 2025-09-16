import { supabase } from './supabase';

export interface MasterProfile {
  name: string;
  profession: string;
  email: string;
  phone: string;
  location: string;
  description: string;
  profile_image_url?: string;
  work_images_urls?: string[];
  work_video_url?: string;
  is_active?: boolean;
  profile_completed?: boolean;
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
      user_id: user.id,
      name: profileData.name,
      profession: profileData.profession,
      email: profileData.email,
      phone: profileData.phone,
      location: profileData.location,
      description: profileData.description,
      profile_image_url: profileData.profile_image_url,
      work_images_urls: profileData.work_images_urls || [],
      work_video_url: profileData.work_video_url,
      is_active: profileData.is_active ?? true,
      profile_completed: profileData.profile_completed ?? true,
      updated_at: new Date().toISOString()
    };

    console.log('Sending to Supabase:', dataForSupabase);

    // Сохраняем в таблицу masters
    const { data, error } = await supabase
      .from('masters')
      .upsert(dataForSupabase, { 
        onConflict: 'user_id'
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