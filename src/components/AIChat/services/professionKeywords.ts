/**
 * Complete list of all professions from the filter with their keywords
 * Used by AI services to detect profession type from user messages
 */

export interface ProfessionKeyword {
  keywords: string[];
  type: string;
}

export const professionKeywords: ProfessionKeyword[] = [
  // Projektové profesie
  { keywords: ['architekt', 'projekt', 'návrh'], type: 'Architekt' },
  { keywords: ['dizajn', 'interiér', 'interior'], type: 'Interiérový dizajnér' },
  { keywords: ['krajin', 'záhrad', 'landscape'], type: 'Krajinný architekt' },
  { keywords: ['statik', 'statick', 'nosnosť'], type: 'Statik' },
  { keywords: ['projektant', 'projekt'], type: 'Projektant' },
  { keywords: ['energie', 'energetick', 'audit'], type: 'Energetický audítor' },
  { keywords: ['geodet', 'geoméri', 'zameriav', 'surveyor'], type: 'Geodet' },
  { keywords: ['požiar', 'požiarn', 'fire', 'safety'], type: 'Požiarny technik' },
  { keywords: ['bozp', 'bezpečn', 'koordin', 'safety coordinator'], type: 'BOZP koordinátor' },
  { keywords: ['rozpočt', 'náklad', 'cena', 'kalkulác', 'estimator'], type: 'Rozpočtár' },
  { keywords: ['technick', 'dozor', 'supervision'], type: 'Technický dozor' },
  { keywords: ['autorsk', 'dozor', 'author'], type: 'Autorský dozor' },

  // Stavebné profesie
  { keywords: ['stavbyved', 'stavbár', 'stavba', 'murovanie', 'construction manager'], type: 'Stavbyvedúci' },
  { keywords: ['murár', 'múr', 'tehla', 'murovanie', 'mason'], type: 'Murár' },
  { keywords: ['betón', 'concrete', 'zabetonov'], type: 'Betónár' },
  { keywords: ['tesár', 'drevo', 'krov', 'carpenter'], type: 'Tesár' },
  { keywords: ['pokrývač', 'strech', 'krytina', 'roof'], type: 'Pokrývač' },
  { keywords: ['izolác', 'zateplen', 'insulation'], type: 'Izolatér' },
  { keywords: ['železobetón', 'výstuz', 'armovanie', 'reinforced'], type: 'Železobetónár' },
  { keywords: ['staveb', 'robotn', 'práce', 'worker'], type: 'Stavebný robotník' },
  { keywords: ['demolác', 'búranie', 'demolition'], type: 'Demolačník' },
  { keywords: ['výkop', 'bagr', 'excavat'], type: 'Výkopový robotník' },

  // Interiérové práce
  { keywords: ['maliar', 'maľb', 'farba', 'natier', 'paint'], type: 'Maliar' },
  { keywords: ['podlah', 'floor', 'laminát', 'vinyl'], type: 'Podlahár' },
  { keywords: ['obklad', 'dlaž', 'tile', 'keramika'], type: 'Obkladač' },
  { keywords: ['sadrokart', 'rigips', 'drywall', 'stena'], type: 'Sadrokartónár' },
  { keywords: ['tapet', 'wallpaper'], type: 'Tapetár' },
  { keywords: ['parket', 'drevo', 'podlaha'], type: 'Parkettár' },
  { keywords: ['kuchyn', 'kitchen', 'linka'], type: 'Kuchynský dizajnér' },
  { keywords: ['stolár', 'nábyt', 'furniture', 'skriňa'], type: 'Stolár' },
  { keywords: ['dekorát', 'decorator', 'výzdoba'], type: 'Dekoratér' },
  { keywords: ['čalún', 'upholster'], type: 'Čalúnnik' },

  // Technické profesie
  { keywords: ['elektr', 'električ', 'prúd', 'svetl', 'zásuvk', 'istič', 'electric'], type: 'Elektrikár' },
  { keywords: ['vod', 'vodoinštalat', 'potrubie', 'kohútik', 'kanalizác', 'zatápa', 'tečie', 'plumber'], type: 'Vodoinštalatér' },
  { keywords: ['plyn', 'plynár', 'gas'], type: 'Plynár' },
  { keywords: ['kúren', 'kotol', 'radiátor', 'heating'], type: 'Kúrenár' },
  { keywords: ['klimatizác', 'chladenie', 'air condition'], type: 'Klimatizačný technik' },
  { keywords: ['solár', 'solar', 'panel'], type: 'Technik solárnych systémov' },
  { keywords: ['tepeln', 'čerpadl', 'heat pump'], type: 'Technik tepelných čerpadiel' },
  { keywords: ['bezpečnostn', 'alarm', 'security', 'kamera'], type: 'Technik bezpečnostných systémov' },
  { keywords: ['smart home', 'automatizác', 'inteligent'], type: 'Smart home technik' },
  { keywords: ['výťah', 'elevator', 'lift'], type: 'Výťahový technik' },
  { keywords: ['bazén', 'pool', 'swimming'], type: 'Bazénový technik' },
  { keywords: ['studňa', 'well', 'vrt'], type: 'Studniar' },

  // Exteriérové práce
  { keywords: ['fasád', 'facade', 'omietk'], type: 'Fasádnik' },
  { keywords: ['záhrad', 'garden', 'trávnik', 'kosenie'], type: 'Záhradník' },
  { keywords: ['plot', 'fence', 'oplotenie'], type: 'Plotár' },
  { keywords: ['terasa', 'terrace', 'deck'], type: 'Tesár terás' },
  { keywords: ['dlaž', 'paver', 'chodník'], type: 'Dlažbár' },
  { keywords: ['strešn', 'okn', 'roof window', 'velux'], type: 'Montážnik strešných okien' },
  { keywords: ['klampiar', 'tinsmith', 'žľab', 'oplechovanie'], type: 'Klampiar' },
  { keywords: ['komín', 'chimney', 'komínár'], type: 'Komínár' },
  { keywords: ['pergol', 'pergola'], type: 'Montážnik pergol' },
  { keywords: ['zimn', 'záhrad', 'winter garden', 'skleník'], type: 'Montážnik zimných záhrad' },
  { keywords: ['altán', 'gazebo', 'altánok'], type: 'Staviteľ altánkov' },
  { keywords: ['osvetlen', 'lighting', 'lampa', 'svetlo'], type: 'Osvetľovací technik' },

  // Špecializované služby
  { keywords: ['upratov', 'clean', 'čisten'], type: 'Upratovač' },
  { keywords: ['sťahov', 'moving', 'sťahovanie', 'nábytek'], type: 'Sťahovák' },
  { keywords: ['auto', 'mechani', 'oprava', 'servis', 'motor'], type: 'Automechanik' },
  { keywords: ['fotograf', 'photo', 'foto'], type: 'Fotograf' }
];

/**
 * Extract profession type from user message
 * Returns the FIRST matching profession (order matters!)
 */
export function extractProfessionType(message: string): string | undefined {
  const lowerMessage = message.toLowerCase();

  // Find all matching professions
  const matches: { type: string; keywordLength: number }[] = [];

  for (const profession of professionKeywords) {
    for (const keyword of profession.keywords) {
      if (lowerMessage.includes(keyword)) {
        matches.push({
          type: profession.type,
          keywordLength: keyword.length
        });
        break; // Stop checking other keywords for this profession
      }
    }
  }

  if (matches.length === 0) {
    return undefined;
  }

  // Return the profession with the longest matching keyword (most specific)
  matches.sort((a, b) => b.keywordLength - a.keywordLength);
  return matches[0].type;
}
