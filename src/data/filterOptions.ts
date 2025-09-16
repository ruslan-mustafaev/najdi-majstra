import { translations } from './translations';

export interface FilterOption {
  value: string;
  label: string;
  isRegion?: boolean;
}

export const getCityOptions = (language: 'sk' | 'en'): FilterOption[] => {
  const t = translations[language];
  
  return [
    { value: '', label: `- ${t.search.city} -`, isRegion: false },
    
    // Kraje (Regions)
    { value: 'Banskobystrický kraj', label: 'Banskobystrický kraj', isRegion: false },
    { value: 'Bratislavský kraj', label: 'Bratislavský kraj', isRegion: false },
    { value: 'Košický kraj', label: 'Košický kraj', isRegion: false },
    { value: 'Nitriansky kraj', label: 'Nitriansky kraj', isRegion: false },
    { value: 'Prešovský kraj', label: 'Prešovský kraj', isRegion: false },
    { value: 'Trenčiansky kraj', label: 'Trenčiansky kraj', isRegion: false },
    { value: 'Trnavský kraj', label: 'Trnavský kraj', isRegion: false },
    { value: 'Žilinský kraj', label: 'Žilinský kraj', isRegion: false },
    
    // Banskobystrický kraj - cities
    { value: 'region-bb', label: 'Banskobystrický kraj - mestá', isRegion: true },
    { value: 'Banská Bystrica', label: 'Banská Bystrica', isRegion: false },
    { value: 'Fiľakovo', label: 'Fiľakovo', isRegion: false },
    { value: 'Lučenec', label: 'Lučenec', isRegion: false },
    { value: 'Rimavská Sobota', label: 'Rimavská Sobota', isRegion: false },
    { value: 'Zvolen', label: 'Zvolen', isRegion: false },
    
    // Bratislavský kraj - cities
    { value: 'region-ba', label: 'Bratislavský kraj - mestá', isRegion: true },
    { value: 'Bratislava', label: 'Bratislava', isRegion: false },
    { value: 'Bratislava - Devín', label: 'Bratislava - Devín', isRegion: false },
    { value: 'Bratislava - Devínska Nová Ves', label: 'Bratislava - Devínska Nová Ves', isRegion: false },
    { value: 'Malacky', label: 'Malacky', isRegion: false },
    { value: 'Pezinok', label: 'Pezinok', isRegion: false },
    { value: 'Senec', label: 'Senec', isRegion: false },
    
    // Košický kraj - cities
    { value: 'region-ke', label: 'Košický kraj - mestá', isRegion: true },
    { value: 'Košice', label: 'Košice', isRegion: false },
    { value: 'Michalovce', label: 'Michalovce', isRegion: false },
    { value: 'Rožňava', label: 'Rožňava', isRegion: false },
    { value: 'Spišská Nová Ves', label: 'Spišská Nová Ves', isRegion: false },
    { value: 'Trebišov', label: 'Trebišov', isRegion: false },
    
    // Nitriansky kraj - cities
    { value: 'region-nr', label: 'Nitriansky kraj - mestá', isRegion: true },
    { value: 'Nitra', label: 'Nitra', isRegion: false },
    { value: 'Komárno', label: 'Komárno', isRegion: false },
    { value: 'Levice', label: 'Levice', isRegion: false },
    { value: 'Nové Zámky', label: 'Nové Zámky', isRegion: false },
    { value: 'Topoľčany', label: 'Topoľčany', isRegion: false },
    
    // Prešovský kraj - cities
    { value: 'region-po', label: 'Prešovský kraj - mestá', isRegion: true },
    { value: 'Prešov', label: 'Prešov', isRegion: false },
    { value: 'Bardejov', label: 'Bardejov', isRegion: false },
    { value: 'Humenné', label: 'Humenné', isRegion: false },
    { value: 'Poprad', label: 'Poprad', isRegion: false },
    { value: 'Stará Ľubovňa', label: 'Stará Ľubovňa', isRegion: false },
    { value: 'Svidník', label: 'Svidník', isRegion: false },
    
    // Trenčiansky kraj - cities
    { value: 'region-tn', label: 'Trenčiansky kraj - mestá', isRegion: true },
    { value: 'Trenčín', label: 'Trenčín', isRegion: false },
    { value: 'Bánovce nad Bebravou', label: 'Bánovce nad Bebravou', isRegion: false },
    { value: 'Myjava', label: 'Myjava', isRegion: false },
    { value: 'Partizánske', label: 'Partizánske', isRegion: false },
    { value: 'Považská Bystrica', label: 'Považská Bystrica', isRegion: false },
    { value: 'Prievidza', label: 'Prievidza', isRegion: false },
    
    // Trnavský kraj - cities
    { value: 'region-tt', label: 'Trnavský kraj - mestá', isRegion: true },
    { value: 'Trnava', label: 'Trnava', isRegion: false },
    { value: 'Dunajská Streda', label: 'Dunajská Streda', isRegion: false },
    { value: 'Galanta', label: 'Galanta', isRegion: false },
    { value: 'Hlohovec', label: 'Hlohovec', isRegion: false },
    { value: 'Piešťany', label: 'Piešťany', isRegion: false },
    { value: 'Senica', label: 'Senica', isRegion: false },
    
    // Žilinský kraj - cities
    { value: 'region-za', label: 'Žilinský kraj - mestá', isRegion: true },
    { value: 'Žilina', label: 'Žilina', isRegion: false },
    { value: 'Bytča', label: 'Bytča', isRegion: false },
    { value: 'Čadca', label: 'Čadca', isRegion: false },
    { value: 'Dolný Kubín', label: 'Dolný Kubín', isRegion: false },
    { value: 'Liptovský Mikuláš', label: 'Liptovský Mikuláš', isRegion: false },
    { value: 'Martin', label: 'Martin', isRegion: false },
    { value: 'Námestovo', label: 'Námestovo', isRegion: false },
    { value: 'Ružomberok', label: 'Ružomberok', isRegion: false },
    { value: 'Turčianske Teplice', label: 'Turčianske Teplice', isRegion: false }
  ];
};

export const getProfessionOptions = (language: 'sk' | 'en'): FilterOption[] => {
  const t = translations[language];
  
  return [
    { value: '', label: `- ${t.search.profession} -` },
    
    // 1. Projektové profesie
    { value: 'region-projektove', label: '1. Projektové profesie', isRegion: true },
    { value: 'Architekt', label: 'Architekt', isRegion: false },
    { value: 'Stavebný inžinier', label: 'Stavebný inžinier', isRegion: false },
    { value: 'Statik', label: 'Statik', isRegion: false },
    { value: 'Projektant TZB', label: 'Projektant TZB', isRegion: false },
    { value: 'Projektant dopravných stavieb / Inžinier pre vonkajšie plochy', label: 'Projektant dopravných stavieb / Inžinier pre vonkajšie plochy', isRegion: false },
    { value: 'Špecialista OZE', label: 'Špecialista OZE', isRegion: false },
    { value: 'Geodet', label: 'Geodet', isRegion: false },
    { value: 'Rozpočtár', label: 'Rozpočtár', isRegion: false },
    { value: 'Interiérový dizajnér', label: 'Interiérový dizajnér', isRegion: false },
    { value: 'Technik pre inžinierske siete', label: 'Technik pre inžinierske siete', isRegion: false },
    { value: 'Projektant vonkajších rozvodov', label: 'Projektant vonkajších rozvodov', isRegion: false },
    
    // 2. Dozorné a manažérske profesie
    { value: 'region-dozorne', label: '2. Dozorné a manažérske profesie', isRegion: true },
    { value: 'Stavebník / Investor', label: 'Stavebník / Investor', isRegion: false },
    { value: 'Projektový manažér', label: 'Projektový manažér', isRegion: false },
    { value: 'Stavbyvedúci', label: 'Stavbyvedúci', isRegion: false },
    { value: 'Stavebný dozor', label: 'Stavebný dozor', isRegion: false },
    { value: 'Koordinátor BOZP', label: 'Koordinátor BOZP', isRegion: false },
    { value: 'Právnik pre stavebné právo', label: 'Právnik pre stavebné právo', isRegion: false },
    
    // 3. Profesie pre interiér
    { value: 'region-interier', label: '3. Profesie pre interiér', isRegion: true },
    { value: 'Inštalatér', label: 'Inštalatér', isRegion: false },
    { value: 'Elektrikár', label: 'Elektrikár', isRegion: false },
    { value: 'Sadrokartonista', label: 'Sadrokartonista', isRegion: false },
    { value: 'Omietkar', label: 'Omietkar', isRegion: false },
    { value: 'Maliar / Natierač', label: 'Maliar / Natierač', isRegion: false },
    { value: 'Obkladač', label: 'Obkladač', isRegion: false },
    { value: 'Podlahár', label: 'Podlahár', isRegion: false },
    { value: 'Stolár / Interiérový montážnik', label: 'Stolár / Interiérový montážnik', isRegion: false },
    { value: 'Štukatér', label: 'Štukatér', isRegion: false },
    { value: 'Kameník', label: 'Kameník', isRegion: false },
    
    // 4. Profesie pre exteriér
    { value: 'region-exterier', label: '4. Profesie pre exteriér', isRegion: true },
    { value: 'Bagrista / Zemné práce', label: 'Bagrista / Zemné práce', isRegion: false },
    { value: 'Murár', label: 'Murár', isRegion: false },
    { value: 'Tesár', label: 'Tesár', isRegion: false },
    { value: 'Elektrikár (exteriér)', label: 'Elektrikár', isRegion: false },
    { value: 'Betonár', label: 'Betonár', isRegion: false },
    { value: 'Klampiar / Pokrývač', label: 'Klampiar / Pokrývač', isRegion: false },
    { value: 'Fasádnik / Izolatér', label: 'Fasádnik / Izolatér', isRegion: false },
    { value: 'Okenár / Dvereár', label: 'Okenár / Dvereár', isRegion: false },
    { value: 'Stavebný zámočník', label: 'Stavebný zámočník', isRegion: false },
    { value: 'Dláždič / Cestár', label: 'Dláždič / Cestár', isRegion: false },
    { value: 'Terénny úpravca / Záhradník', label: 'Terénny úpravca / Záhradník', isRegion: false },
    
    // 5. Profesie a špecializácie
    { value: 'region-specializacie', label: '5. Profesie a špecializácie', isRegion: true },
    { value: 'Technik pre inteligentné domácnosti', label: 'Technik pre inteligentné domácnosti', isRegion: false },
    { value: 'Špecialista na obnoviteľné zdroje energie', label: 'Špecialista na obnoviteľné zdroje energie', isRegion: false },
    { value: 'Akustický inžinier', label: 'Akustický inžinier', isRegion: false },
    { value: 'Revízny technik', label: 'Revízny technik', isRegion: false },
    { value: 'Fotovoltik / Montážnik', label: 'Fotovoltik / Montážnik', isRegion: false }
  ];
};

export const getAvailabilityOptions = (language: 'sk' | 'en'): FilterOption[] => {
  const t = translations[language];
  
  return [
    { value: '', label: `- ${t.search.availability} -` },
    { value: 'Dostupný teraz', label: language === 'sk' ? 'Dostupný teraz' : 'Available now' },
    { value: 'Tento týždeň', label: language === 'sk' ? 'Tento týždeň' : 'This week' },
    { value: 'Tento mesiac', label: language === 'sk' ? 'Tento mesiac' : 'This month' }
  ];
};

export const getExperienceOptions = (language: 'sk' | 'en'): FilterOption[] => {
  return [
    { value: '', label: language === 'sk' ? '- Odbornosť -' : '- Expertise -' },
    { value: '1 rok a viac', label: language === 'sk' ? '1 rok a viac' : '1+ years' },
    { value: '3 roky a viac', label: language === 'sk' ? '3 roky a viac' : '3+ years' },
    { value: '5 rokov a viac', label: language === 'sk' ? '5 rokov a viac' : '5+ years' },
    { value: '10 rokov a viac', label: language === 'sk' ? '10 rokov a viac' : '10+ years' },
    { value: '20 rokov a viac', label: language === 'sk' ? '20 rokov a viac' : '20+ years' }
  ];
};