import { ChatMessage, AIResponse } from '../types';
import { callOpenRouter, OpenRouterMessage } from '../../../lib/openRouterApi';
import { searchMastersByLocation } from '../../../lib/masterSearchApi';

export class RealizationService {
  private conversationState: {
    projectType?: string;
    location?: string;
    hasLocation: boolean;
    hasProjectDescription: boolean;
  } = {
    hasLocation: false,
    hasProjectDescription: false
  };

  private getSystemPrompt(language: 'sk' | 'en'): string {
    if (language === 'en') {
      return `You are an AI assistant for project realization on najdiMajstra.sk platform.

YOUR TASK:
Help find suitable masters for construction and renovation projects. Be professional and friendly.

COMMUNICATION STYLE:
- Do NOT use ANY markdown formatting (no *, **, _, etc.)
- Write plain text without highlighting
- Be professional but friendly
- Gradually ask for details
- Max 3-4 sentences at a time

EXAMPLE OF CORRECT RESPONSE:
"Interesting project! To help you, I need to know what type of work it is (renovation, construction, finishing) and where the property is located?"

IMPORTANT:
- Extract city/region from response
- Extract project type (construction/renovation/finishing)
- Respond naturally
- NO markdown formatting`;
    }

    return `Si AI asistent pre realizáciu projektov na platforme najdiMajstra.sk.

TVOJA ÚLOHA:
Pomôcť nájsť vhodných majstrov pre stavebné a rekonštrukčné projekty. Buď profesionálny a priateľský.

ŠTÝL KOMUNIKÁCIE:
- Nepoužívaj ŽIADNE markdown formátovanie (bez *, **, _, atď.)
- Písaj bežný text bez zvýraznenia
- Buď profesionálny ale priateľský
- Postupne sa dopytuj na detaily
- Max 3-4 vety naraz

PRÍKLAD SPRÁVNEJ ODPOVEDE:
"Zaujímavý projekt! Aby som ti vedel pomôcť, potrebujem vedieť o aký typ prác ide (rekonštrukcia, stavba, dokončovanie) a kde sa nachádza nehnuteľnosť?"

DÔLEŽITÉ:
- Extrahuj mesto/región z odpovede
- Extrahuj typ projektu (stavba/rekonštrukcia/dokončovanie)
- Odpovedaj v slovenčine prirodzene
- ŽIADNE markdown formátovanie`;
  }

  getInitialMessage(language: 'sk' | 'en' = 'sk'): string {
    if (language === 'en') {
      return `Hi! I'll help you find suitable masters for your project.

Please tell me: what type of work are you planning (construction, renovation, finishing) and in which city?`;
    }

    return `Ahoj! Pomôžem ti nájsť vhodných majstrov pre tvoj projekt.

Povedz mi prosím: aký typ prác plánuješ (stavba, rekonštrukcia, dokončovanie) a v akom meste?`;
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

      if (this.conversationState.hasLocation && this.conversationState.hasProjectDescription) {
        const masters = await this.findProjectMasters();
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

    const projectKeywords = [
      { keywords: ['stavba', 'dom', 'budova'], type: 'Stavbár' },
      { keywords: ['rekonštrukc', 'prestavba', 'renováci'], type: 'Stavbár' },
      { keywords: ['dokončova', 'omietk', 'malova'], type: 'Maľovanie' },
      { keywords: ['elektr', 'elektroinštaláci'], type: 'Elektrikár' },
      { keywords: ['vodoinštaláci', 'kanalizáci'], type: 'Inštalatér' }
    ];

    projectKeywords.forEach(project => {
      if (project.keywords.some(kw => lowerMessage.includes(kw))) {
        this.conversationState.projectType = project.type;
        this.conversationState.hasProjectDescription = true;
      }
    });
  }

  private async findProjectMasters(): Promise<string[]> {
    try {
      const masters = await searchMastersByLocation({
        location: this.conversationState.location,
        profession: this.conversationState.projectType,
        serviceType: 'realization',
        limit: 6
      });

      return masters.map(m => m.id);
    } catch (error) {
      console.error('Error finding project masters:', error);
      return [];
    }
  }

  resetConversationState(): void {
    this.conversationState = {
      hasLocation: false,
      hasProjectDescription: false
    };
  }
}
