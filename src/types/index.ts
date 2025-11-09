export interface Master {
  id: string;
  userId?: string;
  slug?: string;
  name: string;
  profession: string;
  location: string;
  rating: number;
  reviewCount: number;
  available: boolean;
  profileImage: string;
  workImages: string[];
  workVideos?: string[];
  description: string;
  services: string[];
  experience: string;
  certifications: string[];
  expertise: string[];
  teamSize: 'individual' | 'small-team';
  serviceTypes: ('companies' | 'individuals')[];
  languages: string[];
  priceRange: string;
  age?: number;
  subscriptionPlan?: string;
  subscriptionEndDate?: string;
  communicationStyle?: string;
  workingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      tiktok?: string;
      youtube?: string;
      twitter?: string;
    };
  };
  availability: {
    schedule: string;
    workRadius: string;
  };
  serviceRegular?: boolean;
  serviceUrgent?: boolean;
  serviceRealization?: boolean;
  workAbroad?: boolean;
}

export interface Language {
  code: 'sk' | 'en';
  name: string;
  flag: string;
}

export interface FilterOptions {
  location: string;
  profession: string;
  availability: string;
  priceRange: string;
}