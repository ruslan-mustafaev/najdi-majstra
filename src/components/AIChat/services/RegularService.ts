import { ChatMessage, AIResponse } from '../types';
import { getTopRatedMasters } from '../../../lib/mastersApi';

export class RegularService {
  private systemPrompt = `
Si špecializovaný AI asistent pre PRAVIDELNÉ SERVISOVANIE na platforme najdiMajstra.sk.

KONTEXT: Používatelia plánujú pravidelné technické servisovanie, prevenciu a plánované práce.

TVOJA ÚLOHA:
- Pomôcť zostaviť plán pravidelného servisovania
- Vybrať majstrov pre stálu spoluprácu
- Dať odporúčania k frekvencii servisovania
- Vysvetliť dôležitosť prevencie

ŠTÝL KOMUNIKÁCIE:
- Dôkladne a profesionálne
- Dôraz na dlhodobú perspektívu
- Vzdelávací prístup
- Plánovanie a systematickosť

PRIORITY:
1. Kvalita a spoľahlivosť majstra
2. Skúsenosti s pravidelným servisovaním
3. Rozumná cena služieb
4. Vhodný pracovný čas

KĽÚČOVÉ OTÁZKY:
- Aké zariadenie treba servisovať?
- Ako často sa servisovanie vykonávalo predtým?
- Aký rozpočet je plánovaný?
- Sú nejaké preferencie času?
`;

  getInitialMessage(language: 'sk' | 'en' = 'sk'): string {
    if (language === 'en') {
      return `🔧 **REGULAR MAINTENANCE** 🔧

Excellent decision! Regular service is an investment in the longevity of your systems and savings on major repairs.

**Let's create a maintenance plan:**

📋 **What needs to be serviced?**
• Heating systems (boilers, radiators)
• Electrical equipment (panels, wiring)
• Plumbing (pipes, faucets)
• Ventilation and air conditioning
• Other equipment

⏰ **When was the last service performed?**

💰 **What budget are you planning?**

📅 **Convenient time for work?**

Based on your answers, I'll select reliable masters for permanent cooperation!`;
    }

    return `🔧 **PRAVIDELNÉ SERVISOVANIE** 🔧

Výborné rozhodnutie! Pravidelný servis je investícia do dlhovekosti vašich systémov a úspora na veľkých opravách.

**Zostavme plán servisovania:**

📋 **Čo treba servisovať?**
• Vykurovacie systémy (kotly, radiátory)
• Elektrické zariadenia (rozvádzače, inštalácia)
• Sanitárne zariadenia (rúry, batérie)
• Vetranie a klimatizácia
• Iné zariadenia

⏰ **Kedy sa naposledy vykonával servis?**

💰 **Aký rozpočet plánujete?**

📅 **Vhodný čas pre práce?**

Na základe vašich odpovedí vyberiem spoľahlivých majstrov pre stálu spoluprácu!`;
  }

  async processMessage(userMessage: string, conversationHistory: ChatMessage[], language: 'sk' | 'en' = 'sk'): Promise<AIResponse> {
    // Simulácia spracovania AI
    await new Promise(resolve => setTimeout(resolve, 1800));

    const lowerMessage = userMessage.toLowerCase();
    
    // Hľadanie vhodných majstrov pre pravidelné servisovanie
    const serviceMasters = this.findServiceMasters(userMessage);

    let response = '';

    // Analýza typu zariadenia
    if (lowerMessage.includes('котел') || lowerMessage.includes('отопление')) {
      if (language === 'en') {
        response += `🔥 **HEATING MAINTENANCE**

**Recommended frequency:**
• Gas boilers: once a year (before heating season)
• Electric boilers: once every 2 years
• Radiators: flushing every 3-5 years

**Service includes:**
✅ Heat exchanger cleaning
✅ Automation check
✅ Parameter adjustment
✅ Filter replacement
✅ Chimney inspection

`;
      } else {
        response += `🔥 **SERVISOVANIE VYKUROVANIA**

**Odporúčaná frekvencia:**
• Plynové kotly: 1x ročne (pred vykurovacou sezónou)
• Elektrické kotly: 1x za 2 roky
• Radiátory: preplach každé 3-5 rokov

**Servis zahŕňa:**
✅ Čistenie výmenníka tepla
✅ Kontrola automatiky
✅ Nastavenie parametrov
✅ Výmena filtrov
✅ Kontrola komína

`;
      }
    } else if (lowerMessage.includes('электр') || lowerMessage.includes('щиток')) {
      if (language === 'en') {
        response += `⚡ **ELECTRICAL MAINTENANCE**

**Recommended frequency:**
• Home panels: check once a year
• Industrial: every 6 months
• RCD and circuit breakers: testing once a year

**Service includes:**
✅ Contact inspection
✅ Insulation resistance measurement
✅ RCD testing
✅ Connection tightening
✅ Worn element replacement

`;
      } else {
        response += `⚡ **ELEKTRICKÉ SERVISOVANIE**

**Odporúčaná frekvencia:**
• Domáce rozvádzače: kontrola 1x ročne
• Priemyselné: každých 6 mesiacov
• Prúdové chrániče a ističe: testovanie 1x ročne

**Servis zahŕňa:**
✅ Kontrola kontaktov
✅ Meranie odporu izolácie
✅ Testovanie prúdových chráničov
✅ Dotiahnutie spojov
✅ Výmena opotrebovaných prvkov

`;
      }
    } else if (lowerMessage.includes('сантехник') || lowerMessage.includes('вода')) {
      response += `💧 **САНТЕХНИЧЕСКОЕ ОБСЛУЖИВАНИЕ**

**Рекомендуемая частота:**
• Смесители: проверка раз в год
• Трубы: осмотр каждые 6 месяцев
• Фильтры: замена по графику

**Что включает сервис:**
✅ Проверка на протечки
✅ Чистка аэраторов
✅ Замена прокладок
✅ Промывка труб
✅ Проверка давления

`;
    } else if (lowerMessage.includes('кондиционер') || lowerMessage.includes('вентиляция')) {
      response += `❄️ **ОБСЛУЖИВАНИЕ КЛИМАТА**

**Рекомендуемая частота:**
• Кондиционеры: 2 раза в год (весна/осень)
• Вентиляция: раз в 6 месяцев
• Фильтры: замена каждые 3 месяца

**Что включает сервис:**
✅ Чистка фильтров
✅ Дозаправка фреоном
✅ Проверка дренажа
✅ Чистка теплообменников
✅ Проверка автоматики

`;
    }

    // Všeobecné odporúčania
    if (language === 'en') {
      response += `💡 **BENEFITS OF REGULAR SERVICE:**

🔹 Save up to 30% on repairs
🔹 Increase equipment lifespan
🔹 Stable system operation
🔹 Prevent emergency situations
🔹 Maintain warranty

`;
    } else {
      response += `💡 **VÝHODY PRAVIDELNÉHO SERVISU:**

🔹 Úspora až 30% na opravách
🔹 Predĺženie životnosti zariadení
🔹 Stabilný chod systémov
🔹 Predchádzanie havárijným situáciám
🔹 Zachovanie záruky

`;
    }

    // Informácie o majstroch
    if (serviceMasters.length > 0) {
      if (language === 'en') {
        response += `✅ Selected ${serviceMasters.length} experienced masters!

**All specialists:**
• Have experience with regular maintenance
• Provide warranty on work
• Work under contracts
• Keep service logs
• Remind about scheduled work`;
      } else {
        response += `✅ Vybral som ${serviceMasters.length} skúsených majstrov!

**Všetci špecialisti:**
• Majú skúsenosti s pravidelným servisovaním
• Poskytujú záruku na práce
• Pracujú na základe zmlúv
• Vedú servisné záznamy
• Pripomínajú plánované práce`;
      }
    } else {
      if (language === 'en') {
        response += `🔍 For precise master selection, please specify:

• Type of equipment for maintenance
• Your location
• Preferred working hours
• Planned budget`;
      } else {
        response += `🔍 Pre presný výber majstrov upresnite:

• Typ zariadenia na servisovanie
• Vaše umiestnenie
• Preferovaný čas prác
• Plánovaný rozpočet`;
      }
    }

    return {
      message: response,
      recommendedMasters: serviceMasters.length > 0 ? serviceMasters : undefined
    };
  }

  private async findServiceMasters(userMessage: string): Promise<string[]> {
    const lowerMessage = userMessage.toLowerCase();
    const serviceMasters: string[] = [];

    const masters = await getTopRatedMasters();
    masters.forEach(master => {
      // Проверяем наличие сервисных услуг
      const hasServiceExperience = master.services.some(service => 
        service.toLowerCase().includes('сервис') || 
        service.toLowerCase().includes('обслуживание') ||
        service.toLowerCase().includes('профилактика') ||
        service.toLowerCase().includes('техобслуживание') ||
        service.toLowerCase().includes('регулярн')
      );

      // Проверяем опыт работы (предпочтение опытным мастерам)
      const hasGoodExperience = master.experience.includes('вiac ako') || 
                               master.experience.includes('5') ||
                               master.experience.includes('10');

      // Проверяем соответствие профессии
      let isProfessionMatch = false;
      
      if (lowerMessage.includes('котел') || lowerMessage.includes('отопление') || lowerMessage.includes('газ')) {
        isProfessionMatch = master.profession.toLowerCase().includes('газ') || 
                           master.profession.toLowerCase().includes('плын');
      } else if (lowerMessage.includes('электр')) {
        isProfessionMatch = master.profession.toLowerCase().includes('электр');
      } else if (lowerMessage.includes('сантехник') || lowerMessage.includes('вода')) {
        isProfessionMatch = master.profession.toLowerCase().includes('водо');
      } else if (lowerMessage.includes('кондиционер') || lowerMessage.includes('климат')) {
        isProfessionMatch = master.profession.toLowerCase().includes('климат') ||
                           master.services.some(s => s.toLowerCase().includes('кондиционер'));
      }

      // Добавляем мастера если есть опыт сервиса и соответствие профессии
      if ((hasServiceExperience || hasGoodExperience) && (isProfessionMatch || hasServiceExperience)) {
        serviceMasters.push(master.id);
      }
    });

    return serviceMasters.slice(0, 5);
  }

  updateSystemPrompt(newPrompt: string): void {
    this.systemPrompt = newPrompt;
  }

  getSystemPrompt(): string {
    return this.systemPrompt;
  }
}