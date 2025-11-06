import { ChatMessage, AIResponse } from '../types';
import { callOpenRouter, OpenRouterMessage } from '../../../lib/openRouterApi';
import { searchMastersByLocation } from '../../../lib/masterSearchApi';

export class UrgentService {
  private conversationState: {
    problemType?: string;
    location?: string;
    urgencyLevel?: 'critical' | 'high' | 'medium';
    hasLocation: boolean;
    hasProblemDescription: boolean;
  } = {
    hasLocation: false,
    hasProblemDescription: false
  };

  private getSystemPrompt(language: 'sk' | 'en'): string {
    if (language === 'en') {
      return `You are an AI assistant for emergency repairs on najdiMajstra.sk platform.

YOUR TASK:
Help find a master for urgent repairs. Be friendly, concise, and direct.

COMMUNICATION STYLE:
- Do NOT use ANY markdown formatting (no *, **, _, etc.)
- Write plain text without highlighting
- Be concise and direct - max 2-3 sentences at a time
- Ask only for MOST IMPORTANT: WHAT is broken and WHERE (city)
- Do not ask more than 2 questions at a time

EXAMPLE OF CORRECT RESPONSE:
"I understand, electrical failure is unpleasant. I need to know just two things: what exactly is not working (whole apartment or outlet) and in which part of the city are you located?"

EXAMPLE OF INCORRECT RESPONSE:
"**I understand** you have a problem. **Please answer:**
1. What is broken?
2. Is it dangerous?
3. Where are you located?"

IMPORTANT:
- Extract city/region from response
- Extract problem type (electrical/water/gas/heating)
- Respond naturally
- NO markdown formatting
- Maximum 3 sentences`;
    }

    return `Si AI asistent pre akútne opravy na platforme najdiMajstra.sk.

TVOJA ÚLOHA:
Pomôcť nájsť vhodného majstra pre naliehavú opravu. Buď priateľský, vecný a stručný.

ŠTÝL KOMUNIKÁCIE:
- Nepoužívaj ŽIADNE markdown formátovanie (bez *, **, _, atď.)
- Písaj bežný text bez zvýraznenia
- Buď stručný a priamy - max 2-3 vety naraz
- Opýtaj sa len na NAJDÔLEŽITEJŠIE: ČO sa pokazilo a KDE (mesto)
- Nekladaj viac ako 2 otázky naraz

PRÍKLAD SPRÁVNEJ ODPOVEDE:
"Rozumiem, elektrická porucha je nepríjemná. Potrebujem vedieť len dve veci: čo presne nefunguje (celý byt alebo zásuvka) a v ktorej časti Bratislavy sa nachádzaš?"

PRÍKLAD NESPRÁVNEJ ODPOVEDE:
"**Rozumiem,** že máš problém. **Odpovedz mi prosím:**
1. Čo sa pokazilo?
2. Je to nebezpečné?
3. Kde sa nachádzaš?"

DÔLEŽITÉ:
- Extrahuj mesto/región z odpovede
- Extrahuj typ problému (elektrika/voda/plyn/kúrenie)
- Odpovedaj v slovenčine prirodzene
- ŽIADNE markdown formátovanie
- Maximum 3 vety`;
  }

  getInitialMessage(language: 'sk' | 'en' = 'sk'): string {
    if (language === 'en') {
      return `Hi! I understand you have an urgent problem and need quick help.

⚠️ If life is threatened - immediately call 112!

Please describe: What is broken and where are you located (city)? I will help you find an available master.`;
    }

    return `Ahoj! Rozumiem, že máš naliehavý problém a potrebuješ rýchlu pomoc.

⚠️ Ak je ohrozený život - okamžite volaj 112!

Opíš mi prosím: Čo sa pokazilo a kde sa nachádzaš (mesto)? Pomôžem ti nájsť dostupného majstra.`;
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

      if (this.conversationState.hasLocation && this.conversationState.hasProblemDescription) {
        const masters = await this.findUrgentMasters();
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
      'martin', 'poprad', 'prievidza', 'zvolen', 'považská bystrica', 'nové zámky', 'michalovce',
      'komárno', 'levice', 'humenné', 'bardejov', 'liptovský mikuláš'
    ];

    locationKeywords.forEach(city => {
      if (lowerMessage.includes(city)) {
        this.conversationState.location = city;
        this.conversationState.hasLocation = true;
      }
    });

    const problemKeywords = [
      { keywords: ['elektr', 'električ', 'prúd', 'svetl', 'zásuvk', 'istič'], type: 'Elektrikár' },
      { keywords: ['vod', 'potrubie', 'kohútik', 'kanalizác', 'zatápa', 'tečie'], type: 'Inštalatér' },
      { keywords: ['plyn', 'kotol', 'kúrenie', 'radiátor'], type: 'Plynár' },
      { keywords: ['strech', 'zateka', 'okn', 'dver'], type: 'Stavbár' }
    ];

    problemKeywords.forEach(problem => {
      if (problem.keywords.some(kw => lowerMessage.includes(kw))) {
        this.conversationState.problemType = problem.type;
        this.conversationState.hasProblemDescription = true;
      }
    });

    const criticalKeywords = ['plyn', 'dym', 'iskr', 'požiar', 'zatopa'];
    if (criticalKeywords.some(kw => lowerMessage.includes(kw))) {
      this.conversationState.urgencyLevel = 'critical';
    }
  }

  private async findUrgentMasters(): Promise<string[]> {
    try {
      const masters = await searchMastersByLocation({
        location: this.conversationState.location,
        profession: this.conversationState.problemType,
        serviceType: 'urgent',
        limit: 5
      });

      return masters.map(m => m.id);
    } catch (error) {
      console.error('Error finding urgent masters:', error);
      return [];
    }
  }

  resetConversationState(): void {
    this.conversationState = {
      hasLocation: false,
      hasProblemDescription: false
    };
  }
}