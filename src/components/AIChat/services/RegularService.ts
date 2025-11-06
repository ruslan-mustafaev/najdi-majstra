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

WHEN YOU HAVE ENOUGH INFORMATION:
Say: "I found masters for regular service in your area. Check recommendations below, and feel free to continue chatting if you need another service!"

IMPORTANT:
- Extract city/region from response
- Extract service type (heating/electrical/plumbing)
- Respond naturally
- NO markdown formatting
- User can continue conversation after seeing masters`;
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

KEĎ MÁŠ DOSTATOK INFORMÁCIÍ:
Povedz: "Našiel som majstrov pre pravidelný servis vo vašej lokalite. Pozrite si odporúčania nižšie a pokojne pokračujte v rozhovore, ak potrebujete ďalšiu službu!"

DÔLEŽITÉ:
- Extrahuj mesto/región z odpovede
- Extrahuj typ servisu (kúrenie/elektrické/vodoinštalácia)
- Odpovedaj v slovenčine prirodzene
- ŽIADNE markdown formátovanie
- Používateľ môže pokračovať v konverzácii po zobrazení majstrov`;
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
      // Extract information from ALL user messages in the conversation
      const allUserMessages = conversationHistory
        .filter(msg => msg.sender === 'user')
        .map(msg => msg.content)
        .join(' ') + ' ' + userMessage;

      console.log(`🔍 [REGULAR] ALL USER MESSAGES:`, allUserMessages);
      this.extractInformation(allUserMessages);

      console.log(`📊 [REGULAR] Conversation state:`, {
        hasLocation: this.conversationState.hasLocation,
        location: this.conversationState.location,
        hasServiceDescription: this.conversationState.hasServiceDescription,
        serviceType: this.conversationState.serviceType
      });

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
        console.log(`🎯 [REGULAR] Both location and service found! Searching for masters...`);
        const masters = await this.findServiceMasters();
        if (masters.length > 0) {
          recommendedMasters = masters;
          console.log(`✅ [REGULAR] Returning ${masters.length} recommended masters`);
        } else {
          console.log(`⚠️ [REGULAR] No masters found with these criteria`);
        }
      } else {
        console.log(`⏳ [REGULAR] Waiting for more info. Location: ${this.conversationState.hasLocation}, Service: ${this.conversationState.hasServiceDescription}`);
      }

      return {
        message: aiResponse,
        recommendedMasters
      };
    } catch (error) {
      console.error('Error processing message with AI:', error);

      // Even if AI fails, try to find masters if we have location and service
      let recommendedMasters: string[] | undefined;
      let fallbackMessage = '';

      if (this.conversationState.hasLocation && this.conversationState.hasServiceDescription) {
        console.log(`🔧 [REGULAR] AI failed, but searching for masters anyway...`);
        const masters = await this.findServiceMasters();
        if (masters.length > 0) {
          recommendedMasters = masters;
          console.log(`✅ [REGULAR] Found ${masters.length} masters without AI`);
          fallbackMessage = language === 'sk'
            ? `Našiel som majstrov pre pravidelný servis vo vašej lokalite. Pozrite si odporúčania nižšie!`
            : `I found masters for regular service in your area. Check recommendations below!`;
        }
      }

      return {
        message: fallbackMessage || (language === 'sk'
          ? 'Prepáčte, nastala chyba. Prosím, povedzte mi aké služby potrebujete a v akom meste?'
          : 'Sorry, an error occurred. Please tell me what service you need and in which city?'),
        recommendedMasters
      };
    }
  }

  private extractInformation(userMessage: string): void {
    const lowerMessage = userMessage.toLowerCase();

    // Cities with declensions (nominative and locative forms)
    const cityDeclensions: { [key: string]: string } = {
      'bratislava': 'bratislava',
      'bratislave': 'bratislava',
      'košice': 'košice',
      'košiciach': 'košice',
      'prešov': 'prešov',
      'prešove': 'prešov',
      'žilina': 'žilina',
      'žiline': 'žilina',
      'zilina': 'žilina',
      'ziline': 'žilina',
      'banská bystrica': 'banská bystrica',
      'banskej bystrici': 'banská bystrica',
      'banska bystrica': 'banská bystrica',
      'nitra': 'nitra',
      'nitre': 'nitra',
      'trnava': 'trnava',
      'trnave': 'trnava',
      'trenčín': 'trenčín',
      'trenčíne': 'trenčín',
      'trencin': 'trenčín',
      'trencine': 'trenčín',
      'martin': 'martin',
      'martine': 'martin',
      'poprad': 'poprad',
      'poprade': 'poprad',
      'prievidza': 'prievidza',
      'prievidzi': 'prievidza',
      'zvolen': 'zvolen',
      'zvolene': 'zvolen',
      'považská bystrica': 'považská bystrica',
      'povazska bystrica': 'považská bystrica',
      'považskej bystrici': 'považská bystrica',
      'nové zámky': 'nové zámky',
      'nove zamky': 'nové zámky',
      'nových zámkoch': 'nové zámky',
      'michalovce': 'michalovce',
      'michalovciach': 'michalovce'
    };

    const locationKeywords = [
      'bratislava', 'košice', 'prešov', 'žilina', 'banská bystrica', 'nitra', 'trnava', 'trenčín',
      'martin', 'poprad', 'prievidza', 'zvolen', 'považská bystrica', 'nové zámky', 'michalovce'
    ];

    // Check for city declensions first (including "v Nitre", "v Bratislave", etc.)
    let foundLocation = false;
    Object.keys(cityDeclensions).forEach(declension => {
      if (lowerMessage.includes(declension)) {
        this.conversationState.location = cityDeclensions[declension];
        this.conversationState.hasLocation = true;
        foundLocation = true;
        console.log(`🗺️ [REGULAR] Found city declension "${declension}" → city "${cityDeclensions[declension]}"`);
      }
    });

    // Fallback to basic city names
    if (!foundLocation) {
      locationKeywords.forEach(city => {
        if (lowerMessage.includes(city)) {
          this.conversationState.location = city;
          this.conversationState.hasLocation = true;
          console.log(`🗺️ [REGULAR] Found city "${city}"`);
        }
      });
    }

    const serviceKeywords = [
      { keywords: ['kotol', 'kúrenie', 'radiátor', 'vykurovani', 'plyn'], type: 'Plynár' },
      { keywords: ['elektr', 'prúd', 'svetl', 'oprava'], type: 'Elektrikár' },
      { keywords: ['vod', 'potrubie', 'kohútik', 'kanalizác'], type: 'Inštalatér' },
      { keywords: ['klimatizáci', 'vetranie'], type: 'Klimatizácie' }
    ];

    serviceKeywords.forEach(service => {
      if (service.keywords.some(kw => lowerMessage.includes(kw))) {
        this.conversationState.serviceType = service.type;
        this.conversationState.hasServiceDescription = true;
        console.log(`🔧 [REGULAR] Found service type: "${service.type}"`);
      }
    });
  }

  private async findServiceMasters(): Promise<string[]> {
    try {
      console.log(`🔍 [REGULAR] Searching masters with params:`, {
        location: this.conversationState.location,
        profession: this.conversationState.serviceType,
        serviceType: 'regular'
      });

      const masters = await searchMastersByLocation({
        location: this.conversationState.location,
        profession: this.conversationState.serviceType,
        serviceType: 'regular',
        limit: 5
      });

      console.log(`📋 [REGULAR] Found ${masters.length} masters`);
      return masters.map(m => m.id);
    } catch (error) {
      console.error('[REGULAR] Error finding service masters:', error);
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
