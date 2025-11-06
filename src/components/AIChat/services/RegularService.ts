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
      return `You are an AI assistant for regular maintenance on najdiMajstra.sk platform.

YOUR TASK:
Help find masters for regular equipment maintenance. Be friendly and professional.

COMMUNICATION STYLE:
- Do NOT use ANY markdown formatting (no *, **, _, etc.)
- Write plain text without highlighting
- Be friendly but concise
- Ask only for necessary information
- Max 3-4 sentences at a time

EXAMPLE OF CORRECT RESPONSE:
"Great, regular maintenance is always a good investment. What do you need to service (boiler, electrical, air conditioning) and where are you located?"

IMPORTANT:
- Extract city/region from response
- Extract service type (heating/electrical/plumbing)
- Respond naturally
- NO markdown formatting`;
    }

    return `Si AI asistent pre pravidelné servisovanie na platforme najdiMajstra.sk.

TVOJA ÚLOHA:
Pomôcť nájsť majstra pre pravidelné servisovanie zariadení. Buď priateľský a profesionálny.

ŠTÝL KOMUNIKÁCIE:
- Nepoužívaj ŽIADNE markdown formátovanie (bez *, **, _, atď.)
- Písaj bežný text bez zvýraznenia
- Buď priateľský ale vecný
- Opýtaj sa len na potrebné informácie
- Max 3-4 vety naraz

PRÍKLAD SPRÁVNEJ ODPOVEDE:
"Výborne, pravidelný servis je vždy dobrá investícia. Čo potrebuješ servisovať (kotol, elektriku, klimatizáciu) a kde sa nachádzaš?"

DÔLEŽITÉ:
- Extrahuj mesto/región z odpovede
- Extrahuj typ servisu (kúrenie/elektrické/vodoinštalácia)
- Odpovedaj v slovenčine prirodzene
- ŽIADNE markdown formátovanie`;
  }

  getInitialMessage(language: 'sk' | 'en' = 'sk'): string {
    if (language === 'en') {
      return `Hi! Great decision, regular maintenance saves a lot of trouble.

What do you need to service (e.g., boiler, air conditioning, electrical) and in which city are you located?`;
    }

    return `Ahoj! Výborné rozhodnutie, pravidelný servis ušetrí veľa starostí.

Čo potrebuješ servisovať (napríklad kotol, klimatizáciu, elektriku) a v akom meste sa nachádzaš?`;
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
