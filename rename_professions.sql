/*
  Rename professions from work types to person titles

  Changes professions in masters table from describing work to describing the person:
  - "Čistenie a upratovanie" → "Upratovač"
  - "Sťahovanie" → "Sťahovák"
  - "Fotografovanie" → "Fotograf"
  etc.
*/

-- Update primary_profession
UPDATE masters SET primary_profession = 'Upratovač' WHERE primary_profession = 'Čistenie a upratovanie';
UPDATE masters SET primary_profession = 'Sťahovák' WHERE primary_profession = 'Sťahovanie';
UPDATE masters SET primary_profession = 'Fotograf' WHERE primary_profession = 'Fotografovanie';
UPDATE masters SET primary_profession = 'Klimatizačný technik' WHERE primary_profession = 'Klimatizácie';
UPDATE masters SET primary_profession = 'Technik solárnych systémov' WHERE primary_profession = 'Solárne systémy';
UPDATE masters SET primary_profession = 'Technik tepelných čerpadiel' WHERE primary_profession = 'Tepelné čerpadlá';
UPDATE masters SET primary_profession = 'Technik bezpečnostných systémov' WHERE primary_profession = 'Bezpečnostné systémy';
UPDATE masters SET primary_profession = 'Smart home technik' WHERE primary_profession = 'Smart home';
UPDATE masters SET primary_profession = 'Výťahový technik' WHERE primary_profession = 'Výťahy';
UPDATE masters SET primary_profession = 'Bazénový technik' WHERE primary_profession = 'Bazény';
UPDATE masters SET primary_profession = 'Studniar' WHERE primary_profession = 'Studne';
UPDATE masters SET primary_profession = 'Fasádnik' WHERE primary_profession = 'Fasáda';
UPDATE masters SET primary_profession = 'Plotár' WHERE primary_profession = 'Oplotenie';
UPDATE masters SET primary_profession = 'Tesár terás' WHERE primary_profession = 'Terasy';
UPDATE masters SET primary_profession = 'Dlažbár' WHERE primary_profession = 'Dlažby';
UPDATE masters SET primary_profession = 'Montážnik strešných okien' WHERE primary_profession = 'Strešné okná';
UPDATE masters SET primary_profession = 'Klampiar' WHERE primary_profession = 'Žľaby';
UPDATE masters SET primary_profession = 'Komínár' WHERE primary_profession = 'Komíny';
UPDATE masters SET primary_profession = 'Montážnik pergol' WHERE primary_profession = 'Pergoly';
UPDATE masters SET primary_profession = 'Montážnik zimných záhrad' WHERE primary_profession = 'Zimné záhrady';
UPDATE masters SET primary_profession = 'Staviteľ altánkov' WHERE primary_profession = 'Altánky';
UPDATE masters SET primary_profession = 'Osvetľovací technik' WHERE primary_profession = 'Osvetlenie exteriéru';
UPDATE masters SET primary_profession = 'Výkopový robotník' WHERE primary_profession = 'Výkopové práce';
UPDATE masters SET primary_profession = 'Stolár' WHERE primary_profession = 'Nábytok na mieru';

-- Update additional_professions array (replace each occurrence)
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Čistenie a upratovanie', 'Upratovač') WHERE 'Čistenie a upratovanie' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Sťahovanie', 'Sťahovák') WHERE 'Sťahovanie' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Fotografovanie', 'Fotograf') WHERE 'Fotografovanie' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Klimatizácie', 'Klimatizačný technik') WHERE 'Klimatizácie' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Solárne systémy', 'Technik solárnych systémov') WHERE 'Solárne systémy' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Tepelné čerpadlá', 'Technik tepelných čerpadiel') WHERE 'Tepelné čerpadlá' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Bezpečnostné systémy', 'Technik bezpečnostných systémov') WHERE 'Bezpečnostné systémy' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Smart home', 'Smart home technik') WHERE 'Smart home' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Výťahy', 'Výťahový technik') WHERE 'Výťahy' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Bazény', 'Bazénový technik') WHERE 'Bazény' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Studne', 'Studniar') WHERE 'Studne' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Fasáda', 'Fasádnik') WHERE 'Fasáda' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Oplotenie', 'Plotár') WHERE 'Oplotenie' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Terasy', 'Tesár terás') WHERE 'Terasy' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Dlažby', 'Dlažbár') WHERE 'Dlažby' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Strešné okná', 'Montážnik strešných okien') WHERE 'Strešné okná' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Žľaby', 'Klampiar') WHERE 'Žľaby' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Komíny', 'Komínár') WHERE 'Komíny' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Pergoly', 'Montážnik pergol') WHERE 'Pergoly' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Zimné záhrady', 'Montážnik zimných záhrad') WHERE 'Zimné záhrady' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Altánky', 'Staviteľ altánkov') WHERE 'Altánky' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Osvetlenie exteriéru', 'Osvetľovací technik') WHERE 'Osvetlenie exteriéru' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Výkopové práce', 'Výkopový robotník') WHERE 'Výkopové práce' = ANY(additional_professions);
UPDATE masters SET additional_professions = array_replace(additional_professions, 'Nábytok na mieru', 'Stolár') WHERE 'Nábytok na mieru' = ANY(additional_professions);
