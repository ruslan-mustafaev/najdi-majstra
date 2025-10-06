import { supabase } from './supabase';

export interface MasterProfile {
  name: string;
  profession: string;
  email: string;
  phone: string;
  location: string;
  description: string;
  communication_style?: string;
  is_active?: boolean;
  is_available?: boolean;
  profile_completed?: boolean;
  service_regular?: boolean;
  service_urgent?: boolean;
  service_realization?: boolean;
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
      communication_style: profileData.communication_style || null,
      is_active: profileData.is_active ?? true,
      is_available: profileData.is_available ?? false,
      profile_completed: profileData.profile_completed ?? true,
      service_regular: profileData.service_regular ?? false,
      service_urgent: profileData.service_urgent ?? false,
      service_realization: profileData.service_realization ?? false,
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