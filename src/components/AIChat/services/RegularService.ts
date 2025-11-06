import { ChatMessage, AIResponse } from '../types';
import { callOpenRouter, OpenRouterMessage } from '../../../lib/openRouterApi';
import { searchMastersByLocation } from '../../../lib/masterSearchApi';

export class RegularService {
  private conversationState: {
    serviceType?: string;
    location?: string;
    hasLocation: boolean;
    hasServiceDescription: boolean;
  } = {
    hasLocation: false,
    hasServiceDescription: false
  };

  private getSystemPrompt(language: 'sk' | 'en'): string {
    if (language === 'en') {
      return `You are a specialized AI assistant for REGULAR MAINTENANCE on the najdiMajstra.sk platform.

CONTEXT: Users plan regular technical maintenance, prevention, and scheduled work.

YOUR TASK:
- Help compile a regular maintenance plan
- Select masters for permanent cooperation
- Give recommendations on service frequency
- Explain the importance of prevention

COMMUNICATION STYLE:
- Thorough and professional
- Emphasis on long-term perspective
- Educational approach
- Planning and system

PRIORITIES:
1. Master quality and reliability
2. Experience with regular service
3. Reasonable service price
4. Suitable working time

KEY QUESTIONS:
- What equipment needs servicing?
- How often was service performed before?
- What budget is planned?
- Any time preferences?

IMPORTANT:
- Extract location (city/region) from user messages
- Extract service type (heating/electrical/plumbing/etc)
- Respond in Slovak naturally`;
    }

    return `Si špecializovaný AI asistent pre PRAVIDELNÉ SERVISOVANIE na platforme najdiMajstra.sk.

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

DÔLEŽITÉ:
- Extrahuj lokalitu (mesto/región) z používateľských správ
- Extrahuj typ servisu (kúrenie/elektrické/vodoinštalácia/etc)
- Odpovedaj v slovenčine prirodzene`;
  }

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
    try {
      this.extractInformation(userMessage);

      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: this.getSystemPrompt(language)
        }
      ];

      conversationHistory.forEach(msg => {
        if (msg.sender === 'user') {
          messages.push({ role: 'user', content: msg.content });
        } else if (msg.sender === 'ai') {
          messages.push({ role: 'assistant', content: msg.content });
        }
      });

      messages.push({ role: 'user', content: userMessage });

      const aiResponse = await callOpenRouter(messages);

      let recommendedMasters: string[] | undefined;

      if (this.conversationState.hasLocation && this.conversationState.hasServiceDescription) {
        const masters = await this.findServiceMasters();
        if (masters.length > 0) {
          recommendedMasters = masters;
        }
      }

      return {
        message: aiResponse,
        recommendedMasters
      };
    } catch (error) {
      console.error('Error processing message with AI:', error);

      return {
        message: language === 'sk'
          ? 'Prepáčte, nastala chyba pri spracovaní vašej správy. Prosím, skúste to znovu alebo kontaktujte podporu.'
          : 'Sorry, an error occurred while processing your message. Please try again or contact support.',
        recommendedMasters: undefined
      };
    }
  }

  private extractInformation(userMessage: string): void {
    const lowerMessage = userMessage.toLowerCase();

    const locationKeywords = [
      'bratislava', 'košice', 'prešov', 'žilina', 'banská bystrica', 'nitra', 'trnava', 'trenčín',
      'martin', 'poprad', 'prievidza', 'zvolen', 'považská bystrica', 'nové zámky', 'michalovce'
    ];

    locationKeywords.forEach(city => {
      if (lowerMessage.includes(city)) {
        this.conversationState.location = city;
        this.conversationState.hasLocation = true;
      }
    });

    const serviceKeywords = [
      { keywords: ['kotol', 'kúrenie', 'radiátor', 'vykurovani'], type: 'Plynár' },
      { keywords: ['elektr', 'električ', 'prúd', 'svetl'], type: 'Elektrikár' },
      { keywords: ['vod', 'potrubie', 'kohútik', 'kanalizác'], type: 'Inštalatér' },
      { keywords: ['klimatizáci', 'vetranie'], type: 'Klimatizácie' }
    ];

    serviceKeywords.forEach(service => {
      if (service.keywords.some(kw => lowerMessage.includes(kw))) {
        this.conversationState.serviceType = service.type;
        this.conversationState.hasServiceDescription = true;
      }
    });
  }

  private async findServiceMasters(): Promise<string[]> {
    try {
      const masters = await searchMastersByLocation({
        location: this.conversationState.location,
        profession: this.conversationState.serviceType,
        serviceType: 'regular',
        limit: 5
      });

      return masters.map(m => m.id);
    } catch (error) {
      console.error('Error finding service masters:', error);
      return [];
    }
  }

  resetConversationState(): void {
    this.conversationState = {
      hasLocation: false,
      hasServiceDescription: false
    };
  }
}
