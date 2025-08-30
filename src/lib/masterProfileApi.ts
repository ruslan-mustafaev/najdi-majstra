import { supabase } from './supabase';

export interface MasterProfile {
  name: string;
  profession: string;
  phone: string;
  location: string;
  description: string;
  profile_completed: boolean;
}

export const saveMasterProfile = async (profileData: MasterProfile): Promise<MasterProfile> => {
  try {
    // Получаем текущего пользователя
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Подготавливаем данные для вставки/обновления
    const masterData = {
      user_id: user.id,
      name: profileData.name,
      profession: profileData.profession,
      phone: profileData.phone,
      location: profileData.location,
      description: profileData.description,
      profile_completed: profileData.profile_completed,
      updated_at: new Date().toISOString()
    };

    // Проверяем, существует ли уже профиль
    const { data: existingProfile } = await supabase
      .from('masters')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    
    if (existingProfile) {
      // Обновляем существующий профиль
      const { data, error } = await supabase
        .from('masters')
        .update(masterData)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Создаем новый профиль
      const { data, error } = await supabase
        .from('masters')
        .insert(masterData)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    return {
      name: result.name,
      profession: result.profession,
      phone: result.phone,
      location: result.location,
      description: result.description,
      profile_completed: result.profile_completed
    };
    
  } catch (error) {
    console.error('Error saving master profile:', error);
    throw error;
  }
};