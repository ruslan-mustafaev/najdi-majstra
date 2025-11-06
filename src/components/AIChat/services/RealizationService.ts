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
      return `You are a specialized AI assistant for PROJECT REALIZATION on the najdiMajstra.sk platform.

CONTEXT: Users plan construction, repair projects, and reconstructions of various scales.

YOUR TASK:
- Help structure the project
- Select a team of specialized masters
- Give recommendations on work stages
- Assess complexity and timeframes

COMMUNICATION STYLE:
- Professional and detailed
- Systematic planning approach
- Emphasis on quality and deadlines
- Consultative tone

PRIORITIES:
1. Experience with similar project realization
2. Availability of specialized master team
3. Portfolio of completed work
4. Meeting deadlines and budget

KEY QUESTIONS:
- What type of project is planned?
- What scope of work?
- Are plans/project ready?
- What realization timeframes?
- What budget is set?

IMPORTANT:
- Extract location (city/region) from user messages
- Extract project type (construction/renovation/finishing/etc)
- Respond in Slovak naturally`;
    }

    return `Si špecializovaný AI asistent pre REALIZÁCIU PROJEKTOV na platforme najdiMajstra.sk.

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

DÔLEŽITÉ:
- Extrahuj lokalitu (mesto/región) z používateľských správ
- Extrahuj typ projektu (stavba/rekonštrukcia/dokončovanie/etc)
- Odpovedaj v slovenčine prirodzene`;
  }

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
