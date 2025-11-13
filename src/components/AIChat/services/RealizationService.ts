import { ChatMessage, AIResponse } from '../types';
import { callOpenRouter, OpenRouterMessage } from '../../../lib/openRouterApi';
import { searchMastersByLocation } from '../../../lib/masterSearchApi';
import { extractProfessionType } from './professionKeywords';

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

🚨🚨🚨 ABSOLUTELY CRITICAL RULE 🚨🚨🚨
NEVER, UNDER ANY CIRCUMSTANCES, WRITE MESSAGES AS IF YOU WERE THE CLIENT!
NEVER INVENT WHAT THE CLIENT NEEDS!
NEVER SPEAK FOR THE CLIENT!

COMPLETELY FORBIDDEN EXAMPLES - NEVER DO THIS:
❌ "Hi. I need to renovate my house..."
❌ "Hello! I want to renovate the bathroom in Bratislava."
❌ "Hello, I want to build..."
❌ "I need..."
❌ Any sentences where you pretend to be the client
❌ Any sentences where you say what client needs, if they haven't told you yet

YOU ARE AN ASSISTANT - ONLY RESPOND TO WHAT THE CLIENT WRITES!
DON'T SPEAK FOR CLIENT! DON'T WRITE FOR CLIENT! DON'T INVENT FOR CLIENT!

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

WHEN YOU HAVE ENOUGH INFORMATION AND MASTERS FOUND:
- If from same city: "I found suitable masters for your project in your area. Check recommendations below, and feel free to ask if you need another project!"
- If from nearby cities: "I couldn't find masters in [city], but I found [number] masters in nearby areas who can help you. Check them below!"

WHEN NO MASTERS FOUND ANYWHERE:
Say: "I couldn't find any available masters for this project at the moment. Please try searching through the main page or contact support."

IMPORTANT:
- Extract city/region from response
- Extract project type (construction/renovation/finishing)
- Respond naturally
- NO markdown formatting
- User can continue conversation after seeing masters`;
    }

    return `Si AI asistent pre realizáciu projektov na platforme najdiMajstra.sk.
Bol si vytvorený tímom Najdimajstra Dev-Interactive team.

🚨🚨🚨 ABSOLÚTNE KRITICKÉ PRAVIDLO 🚨🚨🚨
NIKDY, ZA ŽIADNYCH OKOLNOSTÍ, NEPIŠ SPRÁVY AKO KEBY SI BOL KLIENT!
NIKDY NEVMÝŠĽAJ ČO KLIENT POTREBUJE!
NIKDY NEHOVOR ZA KLIENTA!

ÚPLNE ZAKÁZANÉ PRÍKLADY - NIKDY ICH NEUROB:
❌ "Ahoj. Potrebujem zrekonštruovať dom..."
❌ "Ahoj! Chcem zrekonštruovať kúpeľňu v Bratislave."
❌ "Dobrý deň, chcem postaviť..."
❌ "Potrebujem..."
❌ Akékoľvek vety, kde sa tváriš ako klient
❌ Akékoľvek vety, kde hovoriš čo klient potrebuje, ak ti to ešte nepovedal

SI ASISTENT - LEN REAGUJ NA TO, ČO KLIENT NAPÍŠE!
NEHOVOR ZA KLIENTA! NEPÍŠ ZA KLIENTA! NEVMÝŠĽAJ ZA KLIENTA!

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

KEĎ MÁŠ DOSTATOK INFORMÁCIÍ A NAŠLI SA MAJSTRI:
- Ak sú z rovnakého mesta: "Našiel som vhodných majstrov pre váš projekt vo vašej lokalite. Pozrite si odporúčania nižšie a pokojne sa opýtajte!"
- Ak sú zo susedných miest: "V meste [mesto] som nenašiel dostupných majstrov, ale našiel som [počet] majstrov v okolí, ktorí vám môžu pomôcť. Pozrite si ich nižšie!"

KEĎ SA NENAŠLI ŽIADNI MAJSTRI NIKDE:
Povedz: "Momentálne som nenašiel žiadnych dostupných majstrov pre tento projekt. Skúste prosím hľadať cez hlavnú stránku alebo kontaktujte podporu."

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
        const result = await this.findProjectMastersWithContext();

        if (result.masters.length > 0) {
          recommendedMasters = result.masters;
          console.log(`✅ [REALIZATION] Returning ${result.masters.length} recommended masters`);

          // Inform AI where the masters are from
          if (result.fromNearby) {
            messages.push({
              role: 'system',
              content: `SYSTEM: ${result.masters.length} masters found BUT NOT in ${this.conversationState.location}. They are from nearby cities/areas. Tell the user you couldn't find masters in their exact city (${this.conversationState.location}), but you found ${result.masters.length} masters in nearby areas who can help.`
            });
          } else {
            messages.push({
              role: 'system',
              content: `SYSTEM: ${result.masters.length} masters found in ${this.conversationState.location}. Tell them you found masters in their city.`
            });
          }
        } else {
          console.log(`⚠️ [REALIZATION] No masters found with these criteria`);

          // Inform AI that NO masters were found at all
          messages.push({
            role: 'system',
            content: 'SYSTEM: 0 masters found anywhere. Tell the user no masters are currently available and suggest they try the main search page or contact support.'
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

    // Cities with ALL declensions (nominative, genitive, dative, accusative, locative, instrumental)
    const locationKeywords = [
      { name: 'bratislava', variants: ['bratislava', 'bratislavy', 'bratislave', 'bratislavu', 'bratislavou'] },
      { name: 'košice', variants: ['košice', 'košíc', 'kosice', 'kosic', 'košiciach', 'košiciam'] },
      { name: 'prešov', variants: ['prešov', 'prešova', 'presov', 'presova', 'prešove', 'presove'] },
      { name: 'žilina', variants: ['žilina', 'žiliny', 'zilina', 'ziliny', 'žiline', 'ziline'] },
      { name: 'banská bystrica', variants: ['banská bystrica', 'banskej bystrice', 'banskej bystrici', 'banska bystrica', 'banskej bystricy'] },
      { name: 'nitra', variants: ['nitra', 'nitry', 'nitre'] },
      { name: 'trnava', variants: ['trnava', 'trnavy', 'trnave'] },
      { name: 'trenčín', variants: ['trenčín', 'trenčína', 'trencin', 'trencina', 'trenčíne', 'trencine'] },
      { name: 'martin', variants: ['martin', 'martina', 'martine'] },
      { name: 'poprad', variants: ['poprad', 'popradu', 'poprade'] },
      { name: 'prievidza', variants: ['prievidza', 'prievidze', 'prievidzi'] },
      { name: 'zvolen', variants: ['zvolen', 'zvolena', 'zvolene'] },
      { name: 'považská bystrica', variants: ['považská bystrica', 'považskej bystrice', 'povazska bystrica', 'povazskej bystrice', 'považskej bystrici'] },
      { name: 'nové zámky', variants: ['nové zámky', 'nových zámkov', 'nove zamky', 'novych zamkov', 'nových zámkoch'] },
      { name: 'michalovce', variants: ['michalovce', 'michaloviec', 'michalovciach'] },
      { name: 'komárno', variants: ['komárno', 'komárna', 'komarno', 'komarna', 'komárne'] },
      { name: 'levice', variants: ['levice', 'levíc', 'leviciach'] },
      { name: 'humenné', variants: ['humenné', 'humenného', 'humenne', 'humenneho', 'humennom'] },
      { name: 'bardejov', variants: ['bardejov', 'bardejova', 'bardejove'] },
      { name: 'liptovský mikuláš', variants: ['liptovský mikuláš', 'liptovského mikuláša', 'liptovsky mikulas', 'liptovského mikulasa', 'liptovskom mikuláši'] }
    ];

    locationKeywords.forEach(cityObj => {
      if (cityObj.variants.some(variant => lowerMessage.includes(variant))) {
        this.conversationState.location = cityObj.name;
        this.conversationState.hasLocation = true;
        console.log(`📍 [REALIZATION] Found location: ${cityObj.name}`);
      }
    });

    // Extract profession type using shared keywords
    const professionType = extractProfessionType(lowerMessage);
    if (professionType) {
      this.conversationState.projectType = professionType;
      this.conversationState.hasProjectDescription = true;
      console.log(`💼 [REALIZATION] Found project type: "${professionType}"`);
    }
  }

  private async findProjectMastersWithContext(): Promise<{ masters: string[], fromNearby: boolean }> {
    try {
      console.log(`🔍 [REALIZATION] Searching masters with params:`, {
        location: this.conversationState.location,
        profession: this.conversationState.projectType,
        serviceType: 'realization'
      });

      // First try: search in specific city
      let masters = await searchMastersByLocation({
        location: this.conversationState.location,
        profession: this.conversationState.projectType,
        serviceType: 'realization',
        limit: 6
      });

      console.log(`✅ [REALIZATION] Found ${masters.length} masters in ${this.conversationState.location}`);

      // If no masters found in the specific city, try broader search
      if (masters.length === 0) {
        console.log(`🔍 [REALIZATION] No masters in ${this.conversationState.location}, searching in nearby areas...`);

        masters = await searchMastersByLocation({
          profession: this.conversationState.projectType,
          serviceType: 'realization',
          limit: 6
        });

        console.log(`✅ [REALIZATION] Found ${masters.length} masters in nearby areas`);

        return {
          masters: masters.map(m => m.id),
          fromNearby: true
        };
      }

      return {
        masters: masters.map(m => m.id),
        fromNearby: false
      };
    } catch (error) {
      console.error('Error finding project masters:', error);
      return { masters: [], fromNearby: false };
    }
  }

  resetConversationState(): void {
    this.conversationState = {
      hasLocation: false,
      hasProjectDescription: false
    };
  }
}
