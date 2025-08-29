// src/lib/masterProfileApi.ts
import { supabase } from './supabase'

export interface MasterProfile {
  id?: string
  user_id?: string
  name?: string
  profession?: string
  email?: string
  phone?: string
  location?: string
  description?: string
  is_active?: boolean
  profile_completed?: boolean
  created_at?: string
  updated_at?: string
}

// Сохранить профиль мастера
export const saveMasterProfile = async (profileData: MasterProfile) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Пользователь не авторизован')

    // Проверяем, есть ли уже профиль
    const { data: existingProfile } = await supabase
      .from('masters')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const profilePayload = {
      ...profileData,
      user_id: user.id,
      email: user.email,
    }

    if (existingProfile) {
      // Обновляем
      const { data, error } = await supabase
        .from('masters')
        .update(profilePayload)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Создаем новый
      const { data, error } = await supabase
        .from('masters')
        .insert([profilePayload])
        .select()
        .single()

      if (error) throw error
      return data
    }
  } catch (error) {
    console.error('Ошибка сохранения профиля:', error)
    throw error
  }
}