import { Master } from '../types';

// Обновляем интерфейс для поддержки множественных видео
export const mockMasters: Master[] = [
  {
    id: '1',
    name: 'Ján Novák',
    profession: 'Elektrikár',
    location: 'Bratislava',
    rating: 4.8,
    reviewCount: 127,
    available: true,
    profileImage: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    workImages: [
      'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    workVideos: [],
    description: 'Profesionálny elektrikár s 15-ročnými skúsenosťami. Špecializujem sa na elektroinštalácie v bytoch a domoch.',
    services: ['Elektroinštalácie', 'Opravy', 'Revízie'],
    experience: 'viac ako 10 rokov',
    certifications: ['Odborná spôsobilosť'],
    expertise: ['Bytové elektroinštalácie'],
    teamSize: 'individual',
    serviceTypes: ['individuals'],
    languages: ['Slovenčina'],
    priceRange: '35-50 €/hod',
    subscriptionPlan: 'professional',
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
      phone: '+421 905 123 456',
      email: 'jan.novak@email.sk'
    },
    availability: {
      schedule: '8:00 - 18:00',
      workRadius: 'Bratislava + 30km'
    }
  },
  {
    id: '2',
    name: 'Peter Kováč',
    profession: 'Vodoinštalatér',
    location: 'Košice',
    rating: 4.9,
    reviewCount: 89,
    available: true,
    profileImage: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
    workImages: [
      'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    workVideos: [],
    description: 'Skúsený vodoinštalatér a plynár. Poskytujeme 24/7 pohotovostnú službu.',
    services: ['Vodovodné práce', 'Plynové inštalácie', 'Pohotovosť'],
    experience: '5 rokov a viac',
    certifications: ['Plynárska licencia'],
    expertise: ['Sanitárne zariadenia'],
    teamSize: 'small-team',
    serviceTypes: ['individuals', 'companies'],
    languages: ['Slovenčina'],
    priceRange: '30-45 €/hod',
    subscriptionPlan: 'standard',
    workingHours: {
      monday: '7:00 - 19:00',
      tuesday: '7:00 - 19:00',
      wednesday: '7:00 - 19:00',
      thursday: '7:00 - 19:00',
      friday: '7:00 - 19:00',
      saturday: '8:00 - 16:00',
      sunday: 'Pohotovosť'
    },
    contact: {
      phone: '+421 907 654 321',
      email: 'peter.kovac@email.sk'
    },
    availability: {
      schedule: '7:00 - 19:00',
      workRadius: 'Košice + 50km'
    }
  },
  {
    id: '3',
    name: 'Mária Svobodová',
    profession: 'Maliar',
    location: 'Žilina',
    rating: 4.7,
    reviewCount: 156,
    available: false,
    profileImage: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    workImages: [
      'https://images.pexels.com/photos/1669799/pexels-photo-1669799.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    workVideos: [],
    description: 'Profesionálne maľovanie interiérov a exteriérov. Špecializácia na dekoratívne techniky.',
    services: ['Maľovanie', 'Tapetovanie', 'Dekorácie'],
    experience: 'viac ako 10 rokov',
    certifications: ['Certifikát maľovania'],
    expertise: ['Dekoratívne maľovanie'],
    teamSize: 'individual',
    serviceTypes: ['individuals'],
    languages: ['Slovenčina', 'Čeština'],
    priceRange: '25-40 €/hod',
    subscriptionPlan: 'professional',
    workingHours: {
      monday: '8:00 - 17:00',
      tuesday: '8:00 - 17:00',
      wednesday: '8:00 - 17:00',
      thursday: '8:00 - 17:00',
      friday: '8:00 - 17:00',
      saturday: 'Na dohode',
      sunday: 'Zatvorené'
    },
    contact: {
      phone: '+421 903 789 012',
      email: 'maria.svobodova@email.sk'
    },
    availability: {
      schedule: '8:00 - 17:00',
      workRadius: 'Žilina + 40km'
    }
  },
  {
    id: '4',
    name: 'Tomáš Horváth',
    profession: 'Stolár',
    location: 'Nitra',
    rating: 4.6,
    reviewCount: 73,
    available: true,
    profileImage: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
    workImages: [
      'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    workVideos: [],
    description: 'Výroba nábytku na mieru, opravy a renovácie starého nábytku.',
    services: ['Nábytok na mieru', 'Opravy', 'Renovácie'],
    experience: '5 rokov a viac',
    certifications: ['Stolárska licencia'],
    expertise: ['Nábytok na mieru'],
    teamSize: 'individual',
    serviceTypes: ['individuals'],
    languages: ['Slovenčina'],
    priceRange: '28-42 €/hod',
    subscriptionPlan: 'standard',
    workingHours: {
      monday: '7:30 - 18:00',
      tuesday: '7:30 - 18:00',
      wednesday: '7:30 - 18:00',
      thursday: '7:30 - 18:00',
      friday: '7:30 - 18:00',
      saturday: '8:00 - 14:00',
      sunday: 'Zatvorené'
    },
    contact: {
      phone: '+421 908 345 678',
      email: 'tomas.horvath@email.sk'
    },
    availability: {
      schedule: '7:30 - 18:00',
      workRadius: 'Nitra + 35km'
    }
  },
  {
    id: '5',
    name: 'Eva Kratochvílová',
    profession: 'Záhradník',
    location: 'Trnava',
    rating: 4.9,
    reviewCount: 201,
    available: true,
    profileImage: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    workImages: [
      'https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    workVideos: [],
    description: 'Komplexné záhradnícke služby, návrh a realizácia záhrad, údržba zelene.',
    services: ['Návrh záhrad', 'Údržba', 'Výsadba'],
    experience: 'viac ako 10 rokov',
    certifications: ['Záhradnícka licencia'],
    expertise: ['Krajinná architektúra'],
    teamSize: 'small-team',
    serviceTypes: ['individuals', 'companies'],
    languages: ['Slovenčina'],
    priceRange: '22-35 €/hod',
    subscriptionPlan: 'professional-expert',
    workingHours: {
      monday: '6:00 - 18:00',
      tuesday: '6:00 - 18:00',
      wednesday: '6:00 - 18:00',
      thursday: '6:00 - 18:00',
      friday: '6:00 - 18:00',
      saturday: '7:00 - 15:00',
      sunday: 'Sezónne'
    },
    contact: {
      phone: '+421 902 567 890',
      email: 'eva.kratochvilova@email.sk'
    },
    availability: {
      schedule: '6:00 - 18:00',
      workRadius: 'Trnava + 60km'
    }
  }
];

export type { Master };