import { ChatMessage, AIResponse } from '../types';
import { getTopRatedMasters } from '../../../lib/mastersApi';

export class RealizationService {
  private systemPrompt = `
Si špecializovaný AI asistent pre REALIZÁCIU PROJEKTOV na platforme najdiMajstra.sk.

KONTEXT: Používatelia plánujú stavebné, opravárenské projekty a rekonštrukcie rôzneho rozsahu.

TVOJA ÚLOHA:
- Pomôcť štruktúrovať projekt
- Vybrať tím špecializovaných majstrov
- Dať odporúčania k etapám prác
- Posúdiť zložitosť a časové rámce

ŠTÝL KOMUNIKÁCIE:
- Profesionálne a detailne
- Systémový prístup k plánovaniu
- Dôraz na kvalite a termínoch
- Konzultačný tón

PRIORITY:
1. Skúsenosti s realizáciou podobných projektov
2. Dostupnosť tímu špecializovaných majstrov
3. Portfólio dokončených prác
4. Dodržanie termínov a rozpočtu

KĽÚČOVÉ OTÁZKY:
- Aký typ projektu sa plánuje?
- Aký rozsah prác?
- Sú pripravené plány/projekt?
- Aké termíny realizácie?
- Aký rozpočet je stanovený?
`;

  getInitialMessage(language: 'sk' | 'en' = 'sk'): string {
    if (language === 'en') {
      return `🏗️ **PROJECT REALIZATION** 🏗️

Excellent! I'll help organize your project from planning to completion.

**Tell me about your project:**

🏠 **Project type:**
• Construction from scratch
• Major renovation
• Reconstruction
• Finishing work
• Engineering systems

📐 **Work scope:**
• Object area
• Number of rooms
• Number of floors

📋 **Project readiness:**
• Do you have ready drawings/plans?
• Do you need project development?
• Are permits obtained?

⏱️ **Time frame:**
• Desired start dates
• Planned duration

💰 **Project budget**

Based on this information, I'll select a team of professionals and create a realization plan!`;
    }

    return `🏗️ **REALIZÁCIA PROJEKTOV** 🏗️

Výborne! Pomôžem zorganizovať váš projekt od plánovania po dokončenie.

**Povedzte mi o vašom projekte:**

🏠 **Typ projektu:**
• Stavba od základov
• Kapitálna rekonštrukcia
• Prestavba
• Dokončovacie práce
• Inžinierske systémy

📐 **Rozsah prác:**
• Plocha objektu
• Počet miestností
• Počet podlaží

📋 **Pripravenosť projektu:**
• Máte hotové výkresy/plány?
• Potrebujete vypracovanie projektu?
• Sú získané povolenia?

⏱️ **Časové rámce:**
• Želané termíny začiatku
• Plánované trvanie

💰 **Rozpočet projektu**

Na základe týchto informácií vyberiem tím profesionálov a zostavím plán realizácie!`;
  }

  async processMessage(userMessage: string, conversationHistory: ChatMessage[], language: 'sk' | 'en' = 'sk'): Promise<AIResponse> {
    // Simulácia spracovania AI
    await new Promise(resolve => setTimeout(resolve, 2000));

    const lowerMessage = userMessage.toLowerCase();
    
    // Hľadanie vhodných majstrov pre realizáciu
    const projectMasters = this.findProjectMasters(userMessage);

    let response = '';

    // Analýza typu projektu
    if (lowerMessage.includes('строительство') || lowerMessage.includes('дом')) {
      if (language === 'en') {
        response += `🏠 **HOUSE CONSTRUCTION**

**Main stages:**
1️⃣ **Preparatory** (2-4 weeks)
   • Project development/correction
   • Obtaining permits
   • Site preparation

2️⃣ **Foundation work** (2-3 weeks)
   • Earthwork
   • Foundation construction
   • Waterproofing

3️⃣ **Wall construction** (4-8 weeks)
   • Masonry/frame
   • Floors
   • Roofing

4️⃣ **Engineering systems** (3-4 weeks)
   • Electrical
   • Plumbing
   • Heating

5️⃣ **Finishing work** (6-10 weeks)
   • Interior finishing
   • Exterior finishing

`;
      } else {
        response += `🏠 **STAVBA DOMU**

**Hlavné etapy:**
1️⃣ **Prípravná** (2-4 týždne)
   • Vypracovanie/úprava projektu
   • Získanie povolení
   • Príprava pozemku

2️⃣ **Základové práce** (2-3 týždne)
   • Zemné práce
   • Zriadenie základov
   • Hydroizolácia

3️⃣ **Stavba stien** (4-8 týždňov)
   • Murivo/konštrukcia
   • Stropy
   • Strecha

4️⃣ **Inžinierske systémy** (3-4 týždne)
   • Elektrina
   • Sanitárne zariadenia
   • Vykurovanie

5️⃣ **Dokončovacie práce** (6-10 týždňov)
   • Vnútorné dokončenie
   • Vonkajšie dokončenie

`;
      }
    } else if (lowerMessage.includes('ремонт') || lowerMessage.includes('реконструкция')) {
      response += `🔨 **КАПИТАЛЬНЫЙ РЕМОНТ**

**Этапы реализации:**
1️⃣ **Демонтаж** (1-2 недели)
   • Снос перегородок
   • Демонтаж старых систем
   • Вывоз мусора

2️⃣ **Черновые работы** (3-4 недели)
   • Возведение перегородок
   • Стяжка пола
   • Штукатурка стен

3️⃣ **Инженерия** (2-3 недели)
   • Прокладка коммуникаций
   • Электромонтаж
   • Сантехника

4️⃣ **Чистовая отделка** (4-6 недель)
   • Напольные покрытия
   • Покраска/обои
   • Установка сантехники

`;
    } else if (lowerMessage.includes('кухня') || lowerMessage.includes('ванная')) {
      response += `🛁 **РЕМОНТ ПОМЕЩЕНИЙ**

**Специфика работ:**
• Повышенная влажность (ванная)
• Сложные коммуникации (кухня)
• Точные замеры для мебели
• Качественная вентиляция

**Сроки:** 2-4 недели
**Особенности:** Нужны специалисты по плитке, сантехнике, мебели

`;
    } else if (lowerMessage.includes('офис') || lowerMessage.includes('коммерческ')) {
      response += `🏢 **КОММЕРЧЕСКИЕ ОБЪЕКТЫ**

**Особенности:**
• Соблюдение норм безопасности
• Минимальные простои бизнеса
• Работа в нерабочее время
• Согласование с управляющими компаниями

**Дополнительно:**
• Пожарная сигнализация
• Системы безопасности
• Специальное освещение

`;
    }

    // Všeobecné odporúčania k projektu
    if (language === 'en') {
      response += `📊 **PROJECT RECOMMENDATIONS:**

💡 **Planning:**
• Reserve 15-20% time buffer
• Provide 10-15% budget reserve
• Agree all changes in writing

🔍 **Quality control:**
• Phased work acceptance
• Photo documentation of hidden work
• Check compliance with project

📋 **Documentation:**
• Contracts with each contractor
• Work completion certificates
• Warranty obligations

`;
    } else {
      response += `📊 **ODPORÚČANIA K PROJEKTU:**

💡 **Plánovanie:**
• Naplánujte si 15-20% časovú rezervu
• Predpokladajte 10-15% rozpočtovú rezervu
• Odsúhlaste všetky zmeny písomne

🔍 **Kontrola kvality:**
• Postupné preberanie prác
• Fotodokumentácia skrytých prác
• Kontrola súladu s projektom

📋 **Dokumentácia:**
• Zmluvy s každým dodávateľom
• Zápisnice o vykonaných prácach
• Záručné záväzky

`;
    }

    // Informácie o majstroch
    if (projectMasters.length > 0) {
      if (language === 'en') {
        response += `✅ Found ${projectMasters.length} specialists for your project!

**Team includes:**
• Experienced foremen and team leaders
• Specialists of different profiles
• Masters with portfolio of similar work
• Contractors working in teams

**All masters:**
• Have project work experience
• Provide warranties
• Meet deadlines
• Work under contracts`;
      } else {
        response += `✅ Našiel som ${projectMasters.length} špecializovaných majstrov pre váš projekt!

**Tím zahŕňa:**
• Skúsených stavbyvedúcich a brigadírov
• Špecializovaných majstrov rôznych profilov
• Majstrov s portfóliom podobných prác
• Realizátorov pracujúcich v tíme

**Všetci majstri:**
• Majú skúsenosti s projektovou prácou
• Poskytujú záruky
• Dodržiavajú termíny
• Pracujú na základe zmlúv`;
      }
    } else {
      if (language === 'en') {
        response += `🔍 For team selection, please specify:

• Exact type and scope of project
• Your location
• Planned timeline
• Budget framework
• Special requirements`;
      } else {
        response += `🔍 Pre výber tímu upresnite:

• Presný typ a rozsah projektu
• Vaše umiestnenie
• Plánované termíny
• Rozpočtové rámce
• Osobitné požiadavky`;
      }
    }

    return {
      message: response,
      recommendedMasters: projectMasters.length > 0 ? projectMasters : undefined
    };
  }

  private findProjectMasters(userMessage: string): string[] {
    const lowerMessage = userMessage.toLowerCase();
    
    // Return empty array for now - will be implemented with real database
    // TODO: Implement real master search based on database
    return [];
  }

  updateSystemPrompt(newPrompt: string): void {
    this.systemPrompt = newPrompt;
  }

  getSystemPrompt(): string {
    return this.systemPrompt;
  }
}