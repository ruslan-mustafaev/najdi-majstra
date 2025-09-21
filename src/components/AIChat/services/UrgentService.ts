import { ChatMessage, AIResponse } from '../types';
import { getTopRatedMasters } from '../../../lib/mastersApi';

export class UrgentService {
  private systemPrompt = `
Si špecializovaný AI asistent pre AKÚTNE OPRAVY na platforme najdiMajstra.sk.

KONTEXT: Používatelia sa na teba obracajú s NALIEHAVÝMI poruchami a haváriami, ktoré vyžadujú okamžitý zásah.

TVOJA ÚLOHA:
- Pomôcť rýchlo diagnostikovať problém
- Posúdiť úroveň nebezpečenstva situácie
- Nájsť vhodných majstrov pre akútny výjazd
- Dať základné odporúčania pre bezpečnosť

ŠTÝL KOMUNIKÁCIE:
- Rýchlo a vecne
- Najprv bezpečnosť, potom všetko ostatné
- Kladieš konkrétne otázky pre rýchlu diagnostiku
- Prejavuješ pochopenie naliehavosti situácie

PRIORITY:
1. BEZPEČNOSŤ nadovšetko
2. Rýchlosť reakcie
3. Dostupnosť majstra TERAZ
4. Skúsenosti s havárijными situáciami

KĽÚČOVÉ OTÁZKY:
- Je ohrozená bezpečnosť?
- Dá sa problém dočasne vyriešiť?
- Kde presne sa porucha stala?
- Kedy je potrebný majster?
`;

  getInitialMessage(language: 'sk' | 'en' = 'sk'): string {
    if (language === 'en') {
      return `🚨 **EMERGENCY HELP** 🚨

I understand you have an urgent problem! I will help you quickly find a master for emergency repair.

**First about safety:**
⚠️ If there is a threat to life - immediately call emergency services!

**Describe the situation:**
• What exactly is broken/not working?
• Is there a smell of gas, smoke, water on the floor?
• When did this happen?
• Where are you located?

The faster I get information - the faster I'll find a suitable master! ⚡`;
    }

    return `🚨 **AKÚTNA POMOC** 🚨

Rozumiem, že máte naliehavý problém! Pomôžem vám rýchlo nájsť majstra pre akútnu opravu.

**Najprv o bezpečnosti:**
⚠️ Ak je ohrozený život - okamžite volajte záchranné služby!

**Opíšte situáciu:**
• Čo presne sa pokazilo/nefunguje?
• Je cítiť plyn, dym, voda na podlahe?
• Kedy sa to stalo?
• Kde sa nachádzate?

Čím rýchlejšie dostanem informácie - tým rýchlejšie nájdem vhodného majstra! ⚡`;
  }

  async processMessage(userMessage: string, conversationHistory: ChatMessage[], language: 'sk' | 'en' = 'sk'): Promise<AIResponse> {
    // Simulácia spracovania AI
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerMessage = userMessage.toLowerCase();
    
    // Analýza bezpečnosti
    const dangerKeywords = ['газ', 'дым', 'искры', 'вода', 'затопление', 'короткое замыкание'];
    const hasDanger = dangerKeywords.some(keyword => lowerMessage.includes(keyword));

    // Hľadanie vhodných majstrov
    const urgentMasters = this.findUrgentMasters(userMessage);

    let response = '';

    if (hasDanger) {
      if (language === 'en') {
        response = `⚠️ **ATTENTION! POTENTIALLY DANGEROUS SITUATION!**

Immediately:
1. Ensure safety (turn off electricity/gas/water)
2. Ventilate the room if there are odors
3. Do not use electrical appliances near water

`;
      } else {
        response = `⚠️ **POZOR! POTENCIÁLNE NEBEZPEČNÁ SITUÁCIA!**

Okamžite:
1. Zabezpečte bezpečnosť (vypnite elektrinu/plyn/vodu)
2. Vyvetrajte miestnosť ak sú cítiť pachy
3. Nepoužívajte elektrické spotrebiče pri vode

`;
      }
    }

    // Generovanie odpovede na základe typu problému
    if (lowerMessage.includes('электр') || lowerMessage.includes('свет') || lowerMessage.includes('розетка')) {
      if (language === 'en') {
        response += `🔌 **ELECTRICAL PROBLEM**

First aid:
• Turn off the circuit breaker
• Do not touch bare wires
• Check if water got on the wiring

`;
      } else {
        response += `🔌 **ELEKTRICKÝ PROBLÉM**

Prvá pomoc:
• Vypnite istič v rozvádzači
• Nedotýkajte sa holých vodičov
• Skontrolujte, či sa nedostala voda na elektroinštaláciu

`;
      }
    } else if (lowerMessage.includes('вода') || lowerMessage.includes('труба') || lowerMessage.includes('кран')) {
      if (language === 'en') {
        response += `💧 **WATER PROBLEM**

Urgent actions:
• Turn off the main water valve
• Remove valuables from the flood zone
• Photograph damage for insurance

`;
      } else {
        response += `💧 **PROBLÉM S VODOU**

Naliehavé kroky:
• Uzavrite hlavný ventil vody
• Odstráňte cenné veci zo zóny zatopenia
• Odfotografujte škody pre poisťovňu

`;
      }
    } else if (lowerMessage.includes('газ') || lowerMessage.includes('котел')) {
      if (language === 'en') {
        response += `🔥 **GAS EQUIPMENT**

CRITICALLY IMPORTANT:
• Turn off gas at the apartment entrance
• Open windows for ventilation
• DO NOT turn on lights and electrical appliances
• If you smell gas - immediately leave the premises

`;
      } else {
        response += `🔥 **PLYNOVÉ ZARIADENIE**

KRITICKY DÔLEŽITÉ:
• Uzavrite plyn na vstupe do bytu
• Otvorte okná na vetranie
• NEZAPÍNAJTE svetlá a elektrické spotrebiče
• Pri vôni plynu - okamžite opustite priestory

`;
      }
    }

    // Pridávame informácie o majstroch
    if (urgentMasters.length > 0) {
      if (language === 'en') {
        response += `✅ Found ${urgentMasters.length} masters for emergency call!

All of them:
• Work with emergency calls
• Available for urgent departure
• Have experience with similar situations
• Are located in your area`;
      } else {
        response += `✅ Našiel som ${urgentMasters.length} majstrov pre akútny výjazd!

Všetci:
• Pracujú s havárijnými výjazdmi
• Sú dostupní pre naliehavý výjazd
• Majú skúsenosti s podobnými situáciami
• Nachádzajú sa vo vašom regióne`;
      }
    } else {
      if (language === 'en') {
        response += `🔍 Looking for suitable masters...

Please specify:
• In which area do you need a visit?
• What type of work is required?`;
      } else {
        response += `🔍 Hľadám vhodných majstrov...

Upresnite prosím:
• V ktorom regióne potrebujete výjazd?
• Aký typ práce je potrebný?`;
      }
    }

    return {
      message: response,
      recommendedMasters: urgentMasters.length > 0 ? urgentMasters : undefined
    };
  }

  private async findUrgentMasters(userMessage: string): Promise<string[]> {
    const lowerMessage = userMessage.toLowerCase();
    const urgentMasters: string[] = [];

    const masters = await getTopRatedMasters();
    masters.forEach(master => {
      // Проверяем доступность для экстренных вызовов
      const hasEmergencyService = master.services.some(service => 
        service.toLowerCase().includes('поhotovos') || 
        service.toLowerCase().includes('24/7') ||
        service.toLowerCase().includes('экстренн') ||
        service.toLowerCase().includes('срочн')
      );

      // Проверяем доступность мастера
      const isAvailable = master.available;

      // Проверяем соответствие профессии
      let isProfessionMatch = false;
      
      if (lowerMessage.includes('электр') || lowerMessage.includes('свет')) {
        isProfessionMatch = master.profession.toLowerCase().includes('электр');
      } else if (lowerMessage.includes('вода') || lowerMessage.includes('труб')) {
        isProfessionMatch = master.profession.toLowerCase().includes('водо');
      } else if (lowerMessage.includes('газ') || lowerMessage.includes('котел')) {
        isProfessionMatch = master.profession.toLowerCase().includes('газ') || 
                           master.profession.toLowerCase().includes('плын');
      }

      if ((hasEmergencyService || isAvailable) && (isProfessionMatch || hasEmergencyService)) {
        urgentMasters.push(master.id);
      }
    });

    return urgentMasters.slice(0, 5); // Максимум 5 рекомендаций
  }

  // Метод для настройки промпта (можно изменять для разных сценариев)
  updateSystemPrompt(newPrompt: string): void {
    this.systemPrompt = newPrompt;
  }

  getSystemPrompt(): string {
    return this.systemPrompt;
  }
}