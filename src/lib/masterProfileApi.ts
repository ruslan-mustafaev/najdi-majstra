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
  // Здесь будет ваш реальный API вызов
  const response = await fetch('/api/master/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData)
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при сохранении профиля');
  }
  
  return response.json();
};