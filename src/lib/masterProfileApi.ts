import { supabase } from './supabase';

export interface MasterProfile {
  name: string;
  profession: string;
  email: string;
  phone: string;
  location: string;
  description: string;
  communication_style?: string;
  work_abroad?: boolean;
  is_active?: boolean;
  is_available?: boolean;
  profile_completed?: boolean;
  service_regular?: boolean;
  service_urgent?: boolean;
  service_realization?: boolean;
  experience_years?: number;
  team_type?: string;
  service_area?: string;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  certificates?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_youtube?: string;
  social_tiktok?: string;
  social_telegram?: string;
  social_whatsapp?: string;
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
      work_abroad: profileData.work_abroad ?? false,
      is_active: profileData.is_active ?? true,
      is_available: profileData.is_available ?? false,
      profile_completed: profileData.profile_completed ?? true,
      service_regular: profileData.service_regular ?? false,
      service_urgent: profileData.service_urgent ?? false,
      service_realization: profileData.service_realization ?? false,
      experience_years: profileData.experience_years ?? 0,
      team_type: profileData.team_type || 'individuálne',
      service_area: profileData.service_area || 'lokálne',
      hourly_rate_min: profileData.hourly_rate_min ?? 0,
      hourly_rate_max: profileData.hourly_rate_max ?? 0,
      certificates: profileData.certificates || '',
      social_facebook: profileData.social_facebook || '',
      social_instagram: profileData.social_instagram || '',
      social_youtube: profileData.social_youtube || '',
      social_tiktok: profileData.social_tiktok || '',
      social_telegram: profileData.social_telegram || '',
      social_whatsapp: profileData.social_whatsapp || '',
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

    // Check if user has a subscription, if not create a default "Mini" subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!existingSubscription) {
      console.log('Creating default Mini subscription for user');
      await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_name: 'mini',
          billing_period: 'lifetime',
          status: 'active',
          amount_paid: 0,
          currency: 'EUR',
          current_period_start: new Date().toISOString()
        });
    }

    return data as MasterProfile;

  } catch (error) {
    console.error('Save profile error:', error);
    throw error;
  }
};