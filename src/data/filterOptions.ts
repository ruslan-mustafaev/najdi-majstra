import { useLanguage } from '../hooks/useLanguage';

export interface FilterOption {
  value: string;
  label: string;
  isRegion?: boolean;
}

// Города Словакии по регионам
export const getCityOptions = (language: 'sk' | 'en' = 'sk'): FilterOption[] => {
  const emptyOption = {
    value: '',
    label: language === 'sk' ? '- Mesto -' : '- City -'
  };

  const allSlovakiaOption = {
    value: 'Celé Slovensko',
    label: language === 'sk' ? 'Celé Slovensko' : 'All Slovakia'
  };

  const cities = [
    emptyOption,
    allSlovakiaOption,
    
    // Bratislavský kraj
    { value: '', label: language === 'sk' ? 'BRATISLAVSKÝ KRAJ' : 'BRATISLAVA REGION', isRegion: true },
    { value: 'Bratislava', label: 'Bratislava' },
    { value: 'Malacky', label: 'Malacky' },
    { value: 'Pezinok', label: 'Pezinok' },
    { value: 'Senec', label: 'Senec' },
    { value: 'Stupava', label: 'Stupava' },
    { value: 'Svätý Jur', label: 'Svätý Jur' },
    
    // Trnavský kraj
    { value: '', label: language === 'sk' ? 'TRNAVSKÝ KRAJ' : 'TRNAVA REGION', isRegion: true },
    { value: 'Trnava', label: 'Trnava' },
    { value: 'Dunajská Streda', label: 'Dunajská Streda' },
    { value: 'Galanta', label: 'Galanta' },
    { value: 'Hlohovec', label: 'Hlohovec' },
    { value: 'Piešťany', label: 'Piešťany' },
    { value: 'Senica', label: 'Senica' },
    { value: 'Skalica', label: 'Skalica' },
    
    // Trenčiansky kraj
    { value: '', label: language === 'sk' ? 'TRENČIANSKY KRAJ' : 'TRENČÍN REGION', isRegion: true },
    { value: 'Trenčín', label: 'Trenčín' },
    { value: 'Bánovce nad Bebravou', label: 'Bánovce nad Bebravou' },
    { value: 'Ilava', label: 'Ilava' },
    { value: 'Myjava', label: 'Myjava' },
    { value: 'Nové Mesto nad Váhom', label: 'Nové Mesto nad Váhom' },
    { value: 'Partizánske', label: 'Partizánske' },
    { value: 'Považská Bystrica', label: 'Považská Bystrica' },
    { value: 'Prievidza', label: 'Prievidza' },
    { value: 'Púchov', label: 'Púchov' },
    
    // Nitriansky kraj
    { value: '', label: language === 'sk' ? 'NITRIANSKY KRAJ' : 'NITRA REGION', isRegion: true },
    { value: 'Nitra', label: 'Nitra' },
    { value: 'Komárno', label: 'Komárno' },
    { value: 'Levice', label: 'Levice' },
    { value: 'Nové Zámky', label: 'Nové Zámky' },
    { value: 'Šaľa', label: 'Šaľa' },
    { value: 'Topoľčany', label: 'Topoľčany' },
    { value: 'Zlaté Moravce', label: 'Zlaté Moravce' },
    
    // Žilinský kraj
    { value: '', label: language === 'sk' ? 'ŽILINSKÝ KRAJ' : 'ŽILINA REGION', isRegion: true },
    { value: 'Žilina', label: 'Žilina' },
    { value: 'Bytča', label: 'Bytča' },
    { value: 'Čadca', label: 'Čadca' },
    { value: 'Dolný Kubín', label: 'Dolný Kubín' },
    { value: 'Kysucké Nové Mesto', label: 'Kysucké Nové Mesto' },
    { value: 'Liptovský Mikuláš', label: 'Liptovský Mikuláš' },
    { value: 'Martin', label: 'Martin' },
    { value: 'Námestovo', label: 'Námestovo' },
    { value: 'Ružomberok', label: 'Ružomberok' },
    { value: 'Turčianske Teplice', label: 'Turčianske Teplice' },
    { value: 'Tvrdošín', label: 'Tvrdošín' },
    
    // Banskobystrický kraj
    { value: '', label: language === 'sk' ? 'BANSKOBYSTRICKÝ KRAJ' : 'BANSKÁ BYSTRICA REGION', isRegion: true },
    { value: 'Banská Bystrica', label: 'Banská Bystrica' },
    { value: 'Banská Štiavnica', label: 'Banská Štiavnica' },
    { value: 'Brezno', label: 'Brezno' },
    { value: 'Detva', label: 'Detva' },
    { value: 'Krupina', label: 'Krupina' },
    { value: 'Lučenec', label: 'Lučenec' },
    { value: 'Poltár', label: 'Poltár' },
    { value: 'Revúca', label: 'Revúca' },
    { value: 'Rimavská Sobota', label: 'Rimavská Sobota' },
    { value: 'Veľký Krtíš', label: 'Veľký Krtíš' },
    { value: 'Zvolen', label: 'Zvolen' },
    { value: 'Žarnovica', label: 'Žarnovica' },
    { value: 'Žiar nad Hronom', label: 'Žiar nad Hronom' },
    
    // Prešovský kraj
    { value: '', label: language === 'sk' ? 'PREŠOVSKÝ KRAJ' : 'PREŠOV REGION', isRegion: true },
    { value: 'Prešov', label: 'Prešov' },
    { value: 'Bardejov', label: 'Bardejov' },
    { value: 'Humenné', label: 'Humenné' },
    { value: 'Kežmarok', label: 'Kežmarok' },
    { value: 'Levoča', label: 'Levoča' },
    { value: 'Medzilaborce', label: 'Medzilaborce' },
    { value: 'Poprad', label: 'Poprad' },
    { value: 'Sabinov', label: 'Sabinov' },
    { value: 'Snina', label: 'Snina' },
    { value: 'Stará Ľubovňa', label: 'Stará Ľubovňa' },
    { value: 'Stropkov', label: 'Stropkov' },
    { value: 'Svidník', label: 'Svidník' },
    { value: 'Vranov nad Topľou', label: 'Vranov nad Topľou' },
    
    // Košický kraj
    { value: '', label: language === 'sk' ? 'KOŠICKÝ KRAJ' : 'KOŠICE REGION', isRegion: true },
    { value: 'Košice', label: 'Košice' },
    { value: 'Gelnica', label: 'Gelnica' },
    { value: 'Michalovce', label: 'Michalovce' },
    { value: 'Rožňava', label: 'Rožňava' },
    { value: 'Sobrance', label: 'Sobrance' },
    { value: 'Spišská Nová Ves', label: 'Spišská Nová Ves' },
    { value: 'Trebišov', label: 'Trebišov' }
  ];

  return cities;
};

// Профессии по категориям
export const getProfessionOptions = (language: 'sk' | 'en' = 'sk'): FilterOption[] => {
  const emptyOption = {
    value: '',
    label: language === 'sk' ? '- Profesia -' : '- Profession -'
  };

  const professions = [
    emptyOption,
    
    // Projektové profesie
    { value: '', label: language === 'sk' ? 'PROJEKTOVÉ PROFESIE' : 'PROJECT PROFESSIONS', isRegion: true },
    { value: 'Architekt', label: language === 'sk' ? 'Architekt' : 'Architect' },
    { value: 'Interiérový dizajnér', label: language === 'sk' ? 'Interiérový dizajnér' : 'Interior Designer' },
    { value: 'Krajinný architekt', label: language === 'sk' ? 'Krajinný architekt' : 'Landscape Architect' },
    { value: 'Statik', label: language === 'sk' ? 'Statik' : 'Structural Engineer' },
    { value: 'Projektant', label: language === 'sk' ? 'Projektant' : 'Project Designer' },
    { value: 'Energetický audítor', label: language === 'sk' ? 'Energetický audítor' : 'Energy Auditor' },
    { value: 'Geodet', label: language === 'sk' ? 'Geodet' : 'Surveyor' },
    { value: 'Požiarny technik', label: language === 'sk' ? 'Požiarny technik' : 'Fire Safety Engineer' },
    { value: 'BOZP koordinátor', label: language === 'sk' ? 'BOZP koordinátor' : 'Safety Coordinator' },
    { value: 'Rozpočtár', label: language === 'sk' ? 'Rozpočtár' : 'Cost Estimator' },
    { value: 'Technický dozor', label: language === 'sk' ? 'Technický dozor' : 'Technical Supervision' },
    { value: 'Autorský dozor', label: language === 'sk' ? 'Autorský dozor' : 'Author Supervision' },
    
    // Stavebné profesie
    { value: '', label: language === 'sk' ? 'STAVEBNÉ PROFESIE' : 'CONSTRUCTION PROFESSIONS', isRegion: true },
    { value: 'Stavbyvedúci', label: language === 'sk' ? 'Stavbyvedúci' : 'Construction Manager' },
    { value: 'Murár', label: language === 'sk' ? 'Murár' : 'Mason' },
    { value: 'Betónár', label: language === 'sk' ? 'Betónár' : 'Concrete Worker' },
    { value: 'Tesár', label: language === 'sk' ? 'Tesár' : 'Carpenter' },
    { value: 'Pokrývač', label: language === 'sk' ? 'Pokrývač' : 'Roofer' },
    { value: 'Izolatér', label: language === 'sk' ? 'Izolatér' : 'Insulation Specialist' },
    { value: 'Železobetónár', label: language === 'sk' ? 'Železobetónár' : 'Reinforced Concrete Worker' },
    { value: 'Stavebný robotník', label: language === 'sk' ? 'Stavebný robotník' : 'Construction Worker' },
    { value: 'Demolačník', label: language === 'sk' ? 'Demolačník' : 'Demolition Specialist' },
    { value: 'Výkopové práce', label: language === 'sk' ? 'Výkopové práce' : 'Excavation Work' },
    
    // Interiérové práce
    { value: '', label: language === 'sk' ? 'INTERIÉROVÉ PRÁCE' : 'INTERIOR WORK', isRegion: true },
    { value: 'Maliar', label: language === 'sk' ? 'Maliar' : 'Painter' },
    { value: 'Podlahár', label: language === 'sk' ? 'Podlahár' : 'Flooring Specialist' },
    { value: 'Obkladač', label: language === 'sk' ? 'Obkladač' : 'Tiler' },
    { value: 'Sadrokartónár', label: language === 'sk' ? 'Sadrokartónár' : 'Drywall Specialist' },
    { value: 'Tapetár', label: language === 'sk' ? 'Tapetár' : 'Wallpaper Installer' },
    { value: 'Parkettár', label: language === 'sk' ? 'Parkettár' : 'Parquet Installer' },
    { value: 'Kuchynský dizajnér', label: language === 'sk' ? 'Kuchynský dizajnér' : 'Kitchen Designer' },
    { value: 'Nábytok na mieru', label: language === 'sk' ? 'Nábytok na mieru' : 'Custom Furniture' },
    { value: 'Dekoratér', label: language === 'sk' ? 'Dekoratér' : 'Decorator' },
    { value: 'Čalúnnik', label: language === 'sk' ? 'Čalúnnik' : 'Upholsterer' },
    
    // Technické profesie
    { value: '', label: language === 'sk' ? 'TECHNICKÉ PROFESIE' : 'TECHNICAL PROFESSIONS', isRegion: true },
    { value: 'Elektrikár', label: language === 'sk' ? 'Elektrikár' : 'Electrician' },
    { value: 'Vodoinštalatér', label: language === 'sk' ? 'Vodoinštalatér' : 'Plumber' },
    { value: 'Plynár', label: language === 'sk' ? 'Plynár' : 'Gas Technician' },
    { value: 'Kúrenár', label: language === 'sk' ? 'Kúrenár' : 'Heating Technician' },
    { value: 'Klimatizácie', label: language === 'sk' ? 'Klimatizácie' : 'Air Conditioning' },
    { value: 'Solárne systémy', label: language === 'sk' ? 'Solárne systémy' : 'Solar Systems' },
    { value: 'Tepelné čerpadlá', label: language === 'sk' ? 'Tepelné čerpadlá' : 'Heat Pumps' },
    { value: 'Bezpečnostné systémy', label: language === 'sk' ? 'Bezpečnostné systémy' : 'Security Systems' },
    { value: 'Smart home', label: language === 'sk' ? 'Smart home' : 'Smart Home' },
    { value: 'Výťahy', label: language === 'sk' ? 'Výťahy' : 'Elevators' },
    { value: 'Bazény', label: language === 'sk' ? 'Bazény' : 'Swimming Pools' },
    { value: 'Studne', label: language === 'sk' ? 'Studne' : 'Wells' },
    
    // Exteriérové práce
    { value: '', label: language === 'sk' ? 'EXTERIÉROVÉ PRÁCE' : 'EXTERIOR WORK', isRegion: true },
    { value: 'Fasáda', label: language === 'sk' ? 'Fasáda' : 'Facade' },
    { value: 'Záhradník', label: language === 'sk' ? 'Záhradník' : 'Gardener' },
    { value: 'Oplotenie', label: language === 'sk' ? 'Oplotenie' : 'Fencing' },
    { value: 'Terasy', label: language === 'sk' ? 'Terasy' : 'Terraces' },
    { value: 'Dlažby', label: language === 'sk' ? 'Dlažby' : 'Paving' },
    { value: 'Strešné okná', label: language === 'sk' ? 'Strešné okná' : 'Roof Windows' },
    { value: 'Žľaby', label: language === 'sk' ? 'Žľaby' : 'Gutters' },
    { value: 'Komíny', label: language === 'sk' ? 'Komíny' : 'Chimneys' },
    { value: 'Pergoly', label: language === 'sk' ? 'Pergoly' : 'Pergolas' },
    { value: 'Zimné záhrady', label: language === 'sk' ? 'Zimné záhrady' : 'Winter Gardens' },
    { value: 'Altánky', label: language === 'sk' ? 'Altánky' : 'Gazebos' },
    { value: 'Osvetlenie exteriéru', label: language === 'sk' ? 'Osvetlenie exteriéru' : 'Exterior Lighting' },
    
    // Špecializované služby
    { value: '', label: language === 'sk' ? 'ŠPECIALIZOVANÉ SLUŽBY' : 'SPECIALIZED SERVICES', isRegion: true },
    { value: 'Čistenie a upratovanie', label: language === 'sk' ? 'Čistenie a upratovanie' : 'Cleaning Services' },
    { value: 'Sťahovanie', label: language === 'sk' ? 'Sťahovanie' : 'Moving Services' },
    { value: 'Automechanik', label: language === 'sk' ? 'Automechanik' : 'Auto Mechanic' },
    { value: 'Kaderníčka', label: language === 'sk' ? 'Kaderníčka' : 'Hairdresser' },
    { value: 'Masér', label: language === 'sk' ? 'Masér' : 'Massage Therapist' },
    { value: 'Osobný tréner', label: language === 'sk' ? 'Osobný tréner' : 'Personal Trainer' },
    { value: 'Fotografovanie', label: language === 'sk' ? 'Fotografovanie' : 'Photography' },
    { value: 'Catering', label: language === 'sk' ? 'Catering' : 'Catering' },
    { value: 'Hudobník', label: language === 'sk' ? 'Hudobník' : 'Musician' },
    { value: 'Moderátor', label: language === 'sk' ? 'Moderátor' : 'Host/MC' }
  ];

  return professions;
};

// Dostupnosť
export const getAvailabilityOptions = (language: 'sk' | 'en' = 'sk'): FilterOption[] => [
  {
    value: '',
    label: language === 'sk' ? '- Dostupnosť -' : '- Availability -'
  },
  {
    value: 'Dostupný teraz',
    label: language === 'sk' ? 'Dostupný teraz' : 'Available now'
  },
  {
    value: 'Tento týždeň',
    label: language === 'sk' ? 'Tento týždeň' : 'This week'
  },
  {
    value: 'Tento mesiac',
    label: language === 'sk' ? 'Tento mesiac' : 'This month'
  },
  {
    value: 'Budúci mesiac',
    label: language === 'sk' ? 'Budúci mesiac' : 'Next month'
  },
  {
    value: 'Flexibilný',
    label: language === 'sk' ? 'Flexibilný' : 'Flexible'
  }
];

// Skúsenosti
export const getExperienceOptions = (language: 'sk' | 'en' = 'sk'): FilterOption[] => [
  {
    value: '',
    label: language === 'sk' ? '- Skúsenosti -' : '- Experience -'
  },
  {
    value: '1 rok a viac',
    label: language === 'sk' ? '1 rok a viac' : '1+ years'
  },
  {
    value: '3 roky a viac',
    label: language === 'sk' ? '3 roky a viac' : '3+ years'
  },
  {
    value: '5 rokov a viac',
    label: language === 'sk' ? '5 rokov a viac' : '5+ years'
  },
  {
    value: 'viac ako 10 rokov',
    label: language === 'sk' ? 'Viac ako 10 rokov' : '10+ years'
  },
  {
    value: 'Začiatočník',
    label: language === 'sk' ? 'Začiatočník' : 'Beginner'
  }
];

// Cenové rozpätie
export const getPriceRangeOptions = (language: 'sk' | 'en' = 'sk'): FilterOption[] => [
  {
    value: '',
    label: language === 'sk' ? '- Cenové rozpätie -' : '- Price Range -'
  },
  {
    value: '10-20 €/hod',
    label: '10-20 €/hod'
  },
  {
    value: '20-30 €/hod',
    label: '20-30 €/hod'
  },
  {
    value: '30-50 €/hod',
    label: '30-50 €/hod'
  },
  {
    value: '50+ €/hod',
    label: '50+ €/hod'
  },
  {
    value: 'Dohodou',
    label: language === 'sk' ? 'Dohodou' : 'By agreement'
  }
];