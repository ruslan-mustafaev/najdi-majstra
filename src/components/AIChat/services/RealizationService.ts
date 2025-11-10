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

🚨 ABSOLUTELY CRITICAL RULE 🚨
NEVER, UNDER ANY CIRCUMSTANCES, WRITE MESSAGES AS IF YOU WERE THE CLIENT!

FORBIDDEN EXAMPLES:
❌ "Hi. I need to renovate my house..."
❌ "Hello, I want to build..."
❌ Any sentences that start from the client's perspective

YOU ARE AN ASSISTANT - YOU ANSWER QUESTIONS, NOT CREATE THEM!

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

WHEN YOU HAVE ENOUGH INFORMATION:
Say: "I found suitable masters for your project in your area. Check recommendations below, and feel free to ask if you need masters for another project!"

WHEN NO MASTERS FOUND:
Say: "I couldn't find any available masters for this project in your area at the moment. Please try searching through the main page or try again later."

IMPORTANT:
- Extract city/region from response
- Extract project type (construction/renovation/finishing)
- Respond naturally
- NO markdown formatting
- User can continue conversation after seeing masters`;
    }

    return `Si AI asistent pre realizáciu projektov na platforme najdiMajstra.sk.
Bol si vytvorený tímom Najdimajstra Dev-Interactive team.

🚨 ABSOLÚTNE KRITICKÉ PRAVIDLO 🚨
NIKDY, ZA ŽIADNYCH OKOLNOSTÍ, NEPIŠ SPRÁVY AKO KEBY SI BOL KLIENT!

ZAKÁZANÉ PRÍKLADY:
❌ "Ahoj. Potrebujem zrekonštruovať dom..."
❌ "Dobrý deň, chcem postaviť..."
❌ Akékoľvek vety, ktoré začínajú z pohľadu klienta

SI ASISTENT - ODPOVEDÁŠ NA OTÁZKY, NIE ICH VYMÝŠĽAŠ!

TVOJA ÚLOHA:
Pomôcť nájsť vhodných majstrov pre stavebné a rekonštrukčné projekty. Buď profesionálny a priateľský.

ŠTÝL KOMUNIKÁCIE:
- Nepoužívaj ŽIADNE markdown formátovanie (bez *, **, _, atď.)
- Písaj bežný text bez zvýraznenia
- Buď profesionálny ale priateľský
- Postupne sa dopytuj na detaily
- Max 3-4 vety naraz

KEĎ SA OPÝTAJÚ KTO ŤA VYTVORIL:
Odpovedz v slovenčine: "Vytvoril ma tím Najdimajstra Dev-Interactive team."
Odpovedz v angličtine: "I was created by the Najdimajstra Dev-Interactive team."

PRÍKLAD SPRÁVNEJ ODPOVEDE:
"Zaujímavý projekt! Aby som ti vedel pomôcť, potrebujem vedieť o aký typ prác ide (rekonštrukcia, stavba, dokončovanie) a kde sa nachádza nehnuteľnosť?"

KEĎ MÁŠ DOSTATOK INFORMÁCIÍ:
Povedz: "Našiel som vhodných majstrov pre váš projekt vo vašej lokalite. Pozrite si odporúčania nižšie a pokojne sa opýtajte, ak potrebujete majstrov na iný projekt!"

KEĎ SA NENAŠLI ŽIADNI MAJSTRI:
Povedz: "Momentálne som nenašiel žiadnych dostupných majstrov pre tento projekt v danej lokalite. Skúste prosím hľadať cez hlavnú stránku alebo to skúste o chvíľu znovu."

DÔLEŽITÉ:
- Extrahuj mesto/región z odpovede
- Extrahuj typ projektu (stavba/rekonštrukcia/dokončovanie)
- Odpovedaj v slovenčine prirodzene
- ŽIADNE markdown formátovanie
- Používateľ môže pokračovať v konverzácii po zobrazení majstrov`;
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
      // Extract information from ALL user messages in the conversation
      const allUserMessages = conversationHistory
        .filter(msg => msg.sender === 'user')
        .map(msg => msg.content)
        .join(' ') + ' ' + userMessage;

      console.log(`🔍 [REALIZATION] ALL USER MESSAGES:`, allUserMessages);
      this.extractInformation(allUserMessages);

      console.log(`📊 [REALIZATION] Conversation state:`, {
        hasLocation: this.conversationState.hasLocation,
        location: this.conversationState.location,
        hasProjectDescription: this.conversationState.hasProjectDescription,
        projectType: this.conversationState.projectType
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

      let recommendedMasters: string[] | undefined;

      if (this.conversationState.hasLocation && this.conversationState.hasProjectDescription) {
        console.log(`🎯 [REALIZATION] Both location and project found! Searching for masters...`);
        const masters = await this.findProjectMasters();
        if (masters.length > 0) {
          recommendedMasters = masters;
          console.log(`✅ [REALIZATION] Returning ${masters.length} recommended masters`);

          // Inform AI that masters were found
          messages.push({
            role: 'system',
            content: `SYSTEM: ${masters.length} masters found and will be displayed to the user. Tell them you found masters.`
          });
        } else {
          console.log(`⚠️ [REALIZATION] No masters found with these criteria`);

          // Inform AI that NO masters were found
          messages.push({
            role: 'system',
            content: 'SYSTEM: 0 masters found. Tell the user no masters are available at the moment and suggest they try the main search page.'
          });
        }
      } else {
        console.log(`⏳ [REALIZATION] Waiting for more info. Location: ${this.conversationState.hasLocation}, Project: ${this.conversationState.hasProjectDescription}`);
      }

      const aiResponse = await callOpenRouter(messages);

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
      { name: 'bratislava', variants: ['bratislava', 'bratislave'] },
      { name: 'košice', variants: ['košice', 'košiciach'] },
      { name: 'prešov', variants: ['prešov', 'prešove'] },
      { name: 'žilina', variants: ['žilina', 'žiline'] },
      { name: 'banská bystrica', variants: ['banská bystrica', 'banskej bystrici'] },
      { name: 'nitra', variants: ['nitra', 'nitre'] },
      { name: 'trnava', variants: ['trnava', 'trnave'] },
      { name: 'trenčín', variants: ['trenčín', 'trenčíne'] },
      { name: 'martin', variants: ['martin', 'martine'] },
      { name: 'poprad', variants: ['poprad', 'poprade'] },
      { name: 'prievidza', variants: ['prievidza', 'prievidzi'] },
      { name: 'zvolen', variants: ['zvolen', 'zvolene'] },
      { name: 'považská bystrica', variants: ['považská bystrica', 'považskej bystrici'] },
      { name: 'nové zámky', variants: ['nové zámky', 'nových zámkoch'] },
      { name: 'michalovce', variants: ['michalovce', 'michalovciach'] }
    ];

    locationKeywords.forEach(cityObj => {
      if (cityObj.variants.some(variant => lowerMessage.includes(variant))) {
        this.conversationState.location = cityObj.name;
        this.conversationState.hasLocation = true;
        console.log(`📍 [REALIZATION] Found location: ${cityObj.name}`);
      }
    });

    const projectKeywords = [
      { keywords: ['stavba', 'dom', 'budova'], type: 'Stavbár' },
      { keywords: ['rekonštrukc', 'prestavba', 'renováci'], type: 'Stavbár' },
      { keywords: ['dokončova', 'omietk', 'malova'], type: 'Maľovanie' },
      { keywords: ['elektr', 'elektroinštaláci'], type: 'Elektrikár' },
      { keywords: ['vodoinštaláci', 'kanalizáci'], type: 'Inštalatér' },
      { keywords: ['kotol', 'kúren', 'plyn'], type: 'Plynár' },
      { keywords: ['kúpeľn', 'wc'], type: 'Inštalatér' },
      { keywords: ['zateplen', 'fasád'], type: 'Stavbár' }
    ];

    projectKeywords.forEach(project => {
      if (project.keywords.some(kw => lowerMessage.includes(kw))) {
        this.conversationState.projectType = project.type;
        this.conversationState.hasProjectDescription = true;
        console.log(`💼 [REALIZATION] Found project type: ${project.type}`);
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
