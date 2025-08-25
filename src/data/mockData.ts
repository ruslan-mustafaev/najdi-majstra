import { Master } from '../types';

export const mockMasters: Master[] = [
  {
    id: '1',
    name: 'Peter Šuraba',
    profession: 'Elektrikár',
    location: 'Bratislava',
    rating: 9.2,
    reviewCount: 47,
    available: true,
    age: 42,
    profileImage: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    workImages: [
      'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/159358/multimeter-digital-hand-tool-159358.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    workVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Profesionálny elektrikár s 15-ročnými skúsenosťami. Špecializujem sa na inštalácie, opravy a modernizácie elektrických systémov.',
    services: ['Inštalácie', 'Opravy', 'Modernizácie', 'Pohotovostný servis'],
    experience: 'viac ako 10 rokov',
    certifications: ['Elektrotechnická spôsobilosť', 'Certifikát BOZP'],
    expertise: ['Domáce elektrorozvádzače', 'LED osvetlenie', 'Inteligentné systémy'],
    teamSize: 'small-team',
    serviceTypes: ['companies', 'individuals'],
    languages: ['Slovenčina', 'Čeština', 'Angličtina'],
    priceRange: '30-50 €/hod',
    subscriptionPlan: 'professional',
    communicationStyle: 'Priamo rýchlo a vecne',
    workingHours: {
      monday: '7:00 - 19:00',
      tuesday: '7:00 - 19:00',
      wednesday: '7:00 - 19:00',
      thursday: '7:00 - 19:00',
      friday: '7:00 - 19:00',
      saturday: '8:00 - 16:00',
      sunday: 'Zatvorené'
    },
    contact: {
      phone: '+421 905 123 456',
      email: 'peter.suraba@email.sk',
      website: 'www.elektrikar-suraba.sk'
    },
    availability: {
      schedule: '7:00 - 19:00',
      workRadius: 'Bratislava + 50km'
    }
  },
  {
    id: '2',
    name: 'Marek Novák',
    profession: 'Vodoinštalatér',
    location: 'Košice',
    rating: 8.8,
    reviewCount: 32,
    available: true,
    age: 35,
    profileImage: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
    workImages: [
      'https://images.pexels.com/photos/8985021/pexels-photo-8985021.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/8985166/pexels-photo-8985166.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    description: 'Odborník na vodovodné a kanalizačné systémy. Rýchle riešenie porúch a kvalitné inštalácie.',
    services: ['Opravy', 'Inštalácie', 'Pohotovosť 24/7', 'Čistenie odpadov'],
    experience: '5 rokov',
    certifications: ['Vodoinštalatérska licencia'],
    expertise: ['Moderné kúpeľne', 'Tepelné čerpadlá', 'Solárne systémy'],
    teamSize: 'individual',
    serviceTypes: ['individuals'],
    languages: ['Slovenčina', 'Maďarčina'],
    priceRange: '15-30 €/m²',
    subscriptionPlan: 'standard',
    communicationStyle: 'Viem sa rozprávať o všetkom',
    workingHours: {
      monday: '8:00 - 20:00',
      tuesday: '8:00 - 20:00',
      wednesday: '8:00 - 20:00',
      thursday: '8:00 - 20:00',
      friday: '8:00 - 20:00',
      saturday: '9:00 - 18:00',
      sunday: '10:00 - 16:00'
    },
    contact: {
      phone: '+421 907 654 321',
      email: 'marek@voda-kosice.sk'
    },
    availability: {
      schedule: 'Nonstop 24/7',
      workRadius: 'Košice + okolie'
    }
  },
  {
    id: '3',
    name: 'Jana Kováčová',
    profession: 'Maliar',
    location: 'Žilina',
    rating: 9.5,
    reviewCount: 58,
    available: false,
    age: 38,
    profileImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    workImages: [
      'https://images.pexels.com/photos/1329711/pexels-photo-1329711.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/6474471/pexels-photo-6474471.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    workVideo: 'https://www.youtube.com/embed/sample-painting-video',
    description: 'Profesionálne maľovanie interiérov a exteriérov. Špecializácia na dekoratívne techniky a obnovu fasád.',
    services: ['Interiéry', 'Exteriéry', 'Dekoratívne techniky', 'Renovácie'],
    experience: 'viac ako 10 rokov',
    certifications: ['Certifikát maľovania', 'Kurz dekoratívnych techník'],
    expertise: ['Benátske štukové', 'Marmorino', 'Airless striekanie'],
    teamSize: 'small-team',
    serviceTypes: ['companies', 'individuals'],
    languages: ['Slovenčina', 'Nemčina'],
    priceRange: '15-30 €/m²',
    subscriptionPlan: 'professional-expert',
    communicationStyle: 'Musím komunikovať každý detail',
    workingHours: {
      monday: '8:00 - 16:00',
      tuesday: '8:00 - 16:00',
      wednesday: '8:00 - 16:00',
      thursday: '8:00 - 16:00',
      friday: '8:00 - 16:00',
      saturday: 'Zatvorené',
      sunday: 'Zatvorené'
    },
    contact: {
      phone: '+421 904 987 654',
      email: 'jana.kovacova@maliar.sk'
    },
    availability: {
      schedule: '8:00 - 16:00',
      workRadius: 'Žilinský kraj'
    }
  },
  {
    id: '11',
    name: 'Andrej Kováč',
    profession: 'Plynár',
    location: 'Žilina',
    rating: 9.6,
    reviewCount: 73,
    available: true,
    profileImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
    workImages: [
      'https://images.pexels.com/photos/8985021/pexels-photo-8985021.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    description: 'Certifikovaný plynár s 20-ročnými skúsenosťami. Špecializujem sa na inštalácie plynových zariadení, kotlov a bezpečnostné kontroly.',
    services: ['Inštalácie kotlov', 'Plynové rozvody', 'Servis', 'Revízie'],
    experience: 'viac ako 10 rokov',
    certifications: ['Plynárska licencia', 'Certifikát BOZP', 'Kurz kotlov'],
    expertise: ['Kondenzačné kotly', 'Tepelné čerpadlá', 'Plynové sporáky'],
    teamSize: 'individual',
    serviceTypes: ['companies', 'individuals'],
    languages: ['Slovenčina', 'Čeština'],
    priceRange: '30-50 €/hod',
    subscriptionPlan: 'premier',
    communicationStyle: 'Uprednostňujem v komunikácii dobrý pocit',
    contact: {
      phone: '+421 903 456 789',
      email: 'andrej.kovac@plynar.sk',
      website: 'www.kovac-plynar.sk'
    },
    availability: {
      schedule: '7:00 - 20:00',
      workRadius: 'Žilinský kraj'
    }
  },
  {
    id: '12',
    name: 'Silvia Nováková',
    profession: 'Interiérový dizajnér',
    location: 'Bratislava',
    rating: 9.8,
    reviewCount: 91,
    available: true,
    profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    workImages: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    description: 'Kreatívny interiérový dizajnér s vášňou pre moderné a funkčné riešenia. Vytváram jedinečné priestory podľa potrieb klientov.',
    services: ['Návrh interiérov', '3D vizualizácie', 'Výber materiálov', 'Dozor realizácie'],
    experience: '5 rokov',
    certifications: ['Diplom interiérového dizajnu', 'Kurz 3D modelovania'],
    expertise: ['Moderný štýl', 'Minimalizmus', 'Skandinávsky dizajn'],
    teamSize: 'individual',
    serviceTypes: ['individuals'],
    languages: ['Slovenčina', 'Angličtina', 'Nemčina'],
    priceRange: '15-80 €',
    subscriptionPlan: 'professional',
    communicationStyle: 'Spájam odbornosť a skúsenosti',
    contact: {
      phone: '+421 905 789 123',
      email: 'silvia@interier-design.sk',
      website: 'www.silvia-design.sk'
    },
    availability: {
      schedule: '9:00 - 18:00',
      workRadius: 'Bratislava + 100km'
    }
  },
  {
    id: '13',
    name: 'Róbert Štefan',
    profession: 'Bezpečnostné systémy',
    location: 'Košice',
    rating: 9.1,
    reviewCount: 56,
    available: false,
    profileImage: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
    workImages: [
      'https://images.pexels.com/photos/430208/pexels-photo-430208.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/2882509/pexels-photo-2882509.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    description: 'Expert na bezpečnostné systémy, kamery a alarmy. Zabezpečujem domy, firmy a priemyselné objekty najmodernejšími technológiami.',
    services: ['Kamerové systémy', 'Alarmy', 'Prístupové systémy', 'Smart home'],
    experience: 'viac ako 10 rokov',
    certifications: ['Certifikát bezpečnostných systémov', 'Kurz IP kamier'],
    expertise: ['IP kamery', 'Bezdrôtové alarmy', 'Biometrické systémy'],
    teamSize: 'small-team',
    serviceTypes: ['companies', 'individuals'],
    languages: ['Slovenčina', 'Maďarčina', 'Angličtina'],
    priceRange: '35-60 €/hod',
    subscriptionPlan: 'professional-expert',
    communicationStyle: 'Komunikujem jasne to čo vidím',
    contact: {
      phone: '+421 907 321 654',
      email: 'robert@security-systems.sk',
      website: 'www.stefan-security.sk'
    },
    availability: {
      schedule: '8:00 - 17:00',
      workRadius: 'Východné Slovensko'
    }
  },
  {
    id: '14',
    name: 'Michal Procházka',
    profession: 'Podlahár',
    location: 'Trenčín',
    rating: 8.9,
    reviewCount: 42,
    available: true,
    profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    workImages: [
      'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    description: 'Profesionálny podlahár s bohatými skúsenosťami v pokládke všetkých typov podláh. Kvalita a presnosť sú mojou prioritou.',
    services: ['Laminátové podlahy', 'Parkety', 'Vinyl', 'Dlažby'],
    experience: 'viac ako 10 rokov',
    certifications: ['Certifikát podlahára', 'Kurz moderných materiálov'],
    expertise: ['Luxusné parkety', 'Vodotesné podlahy', 'Podlahové kúrenie'],
    teamSize: 'individual',
    serviceTypes: ['individuals'],
    languages: ['Slovenčina', 'Čeština'],
    priceRange: '20-40 €/m²',
    subscriptionPlan: 'standard',
    communicationStyle: 'Rozdeľujem zákazky každá je jedinečná',
    contact: {
      phone: '+421 904 654 987',
      email: 'michal@podlahy-trencin.sk'
    },
    availability: {
      schedule: '7:00 - 16:00',
      workRadius: 'Trenčiansky kraj'
    }
  },
  {
    id: '15',
    name: 'Zuzana Králiková',
    profession: 'Čistenie a upratovanie',
    location: 'Nitra',
    rating: 9.7,
    reviewCount: 128,
    available: true,
    profileImage: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    workImages: [
      'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/4239119/pexels-photo-4239119.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    description: 'Profesionálne upratovacie služby pre domácnosti aj firmy. Používam ekologické prostriedky a moderné technológie čistenia.',
    services: ['Domáce upratovanie', 'Kancelárske priestory', 'Čistenie okien', 'Generálne upratovanie'],
    experience: '5 rokov',
    certifications: ['Kurz profesionálneho upratovania', 'Certifikát BOZP'],
    expertise: ['Ekologické čistenie', 'Čistenie kobercov', 'Dezinfekcia'],
    teamSize: 'small-team',
    serviceTypes: ['companies', 'individuals'],
    languages: ['Slovenčina', 'Angličtina'],
    priceRange: '12-25 €/hod',
    subscriptionPlan: 'professional',
    communicationStyle: 'Premyslene po tom, čo mám informácie',
    contact: {
      phone: '+421 908 147 258',
      email: 'zuzana@cistenie-nitra.sk'
    },
    availability: {
      schedule: '6:00 - 22:00',
      workRadius: 'Nitriansky kraj'
    }
  },
  {
    id: '16',
    name: 'Vladimír Novák',
    profession: 'Automechanik',
    location: 'Banská Bystrica',
    rating: 9.0,
    reviewCount: 67,
    available: true,
    profileImage: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    workImages: [
      'https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3806290/pexels-photo-3806290.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    description: 'Skúsený automechanik s vlastnou dielňou. Špecializujem sa na diagnostiku, opravy motorov a pravidelné servisné prehliadky.',
    services: ['Diagnostika', 'Opravy motorov', 'STK príprava', 'Výmena oleja'],
    experience: 'viac ako 10 rokov',
    certifications: ['Automechanická licencia', 'Kurz modernej diagnostiky'],
    expertise: ['Diesel motory', 'Elektronika vozidiel', 'Klimatizácie'],
    teamSize: 'small-team',
    serviceTypes: ['individuals'],
    languages: ['Slovenčina', 'Nemčina'],
    priceRange: '25-45 €/hod',
    subscriptionPlan: 'standard',
    communicationStyle: 'Komunikujem len to čo musím',
    contact: {
      phone: '+421 903 789 456',
      email: 'vladimir@autoservis-bb.sk',
      website: 'www.novak-autoservis.sk'
    },
    availability: {
      schedule: '7:00 - 18:00',
      workRadius: 'Banskobystrický kraj'
    }
  },
  {
    id: '17',
    name: 'Katarína Svobodová',
    profession: 'Kaderníčka',
    location: 'Prešov',
    rating: 9.4,
    reviewCount: 156,
    available: true,
    profileImage: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400',
    workImages: [
      'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3993450/pexels-photo-3993450.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    description: 'Kreatívna kaderníčka s vášňou pre moderné trendy. Ponúkam strihanie, farbenie, styling a svadobné účesy v príjemnom prostredí.',
    services: ['Strihanie', 'Farbenie', 'Styling', 'Svadobné účesy'],
    experience: '5 rokov',
    certifications: ['Kaderníckka licencia', 'Kurz moderných techník'],
    expertise: ['Balayage', 'Keratínové ošetrenia', 'Predĺženie vlasov'],
    teamSize: 'individual',
    serviceTypes: ['individuals'],
    languages: ['Slovenčina', 'Angličtina'],
    priceRange: '15-80 €',
    subscriptionPlan: 'premier',
    communicationStyle: 'Všetko je má byť tak ako je',
    contact: {
      phone: '+421 905 369 147',
      email: 'katarina@salon-presov.sk'
    },
    availability: {
      schedule: '9:00 - 19:00',
      workRadius: 'Prešov + okolie'
    }
  }
];

export type { Master };