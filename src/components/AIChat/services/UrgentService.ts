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
      return `You are a specialized AI assistant for EMERGENCY REPAIRS on the najdiMajstra.sk platform.

CONTEXT: Users contact you with URGENT failures and emergencies requiring immediate intervention.

YOUR TASK:
- Help quickly diagnose the problem
- Assess the danger level of the situation
- Find suitable masters for emergency call
- Provide basic safety recommendations

COMMUNICATION STYLE:
- Fast and to the point
- Safety first, then everything else
- Ask specific questions for quick diagnosis
- Show understanding of urgency

PRIORITIES:
1. SAFETY above all
2. Speed of response
3. Master availability NOW
4. Experience with emergency situations

KEY QUESTIONS:
- Is safety threatened?
- Can the problem be temporarily solved?
- Where exactly did the failure occur?
- When is a master needed?

IMPORTANT:
- You MUST extract the location (city/region) from user messages
- Ask for location if not provided
- Extract problem type (elektrické/vodoinštalácia/plyn/kúrenie/etc)
- Respond in Slovak language naturally and conversationally`;
    }

    return `Si špecializovaný AI asistent pre AKÚTNE OPRAVY na platforme najdiMajstra.sk.

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
4. Skúsenosti s havárijnymi situáciami

KĽÚČOVÉ OTÁZKY:
- Je ohrozená bezpečnosť?
- Dá sa problém dočasne vyriešiť?
- Kde presne sa porucha stala?
- Kedy je potrebný majster?

DÔLEŽITÉ:
- MUSÍŠ extrahovať lokalitu (mesto/región) z používateľských správ
- Opýtaj sa na lokalitu ak nie je uvedená
- Extrahuj typ problému (elektrické/vodoinštalácia/plyn/kúrenie/etc)
- Odpovedaj v slovenčine prirodzene a konverzačne`;
  }

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