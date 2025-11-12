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

🚨🚨🚨 ABSOLUTELY CRITICAL RULE 🚨🚨🚨
NEVER, UNDER ANY CIRCUMSTANCES, WRITE MESSAGES AS IF YOU WERE THE CLIENT!
NEVER INVENT WHAT THE CLIENT NEEDS!
NEVER SPEAK FOR THE CLIENT!

COMPLETELY FORBIDDEN EXAMPLES - NEVER DO THIS:
❌ "Hi. I need to service my boiler..."
❌ "Hello! I need regular air conditioning service in Bratislava."
❌ "Hello, I want maintenance for..."
❌ "I need to fix..."
❌ Any sentences where you pretend to be the client
❌ Any sentences where you say what client needs, if they haven't told you yet

YOU ARE AN ASSISTANT - ONLY RESPOND TO WHAT THE CLIENT WRITES!
DON'T SPEAK FOR CLIENT! DON'T WRITE FOR CLIENT! DON'T INVENT FOR CLIENT!

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

WHEN YOU HAVE ENOUGH INFORMATION AND MASTERS FOUND:
- If from same city: "I found masters for regular service in your area. Check recommendations below, and feel free to continue chatting!"
- If from nearby cities: "I couldn't find masters in [city], but I found [number] masters in nearby areas who can help you. Check them below!"

WHEN NO MASTERS FOUND ANYWHERE:
Say: "I couldn't find any available masters for this service at the moment. Please try searching through the main page or contact support."

IMPORTANT:
- Extract city/region from response
- Extract service type (heating/electrical/plumbing)
- Respond naturally
- NO markdown formatting
- User can continue conversation after seeing masters`;
    }

    return `TVOJA IDENTITA: Si AI asistent pre pravidelné servisovanie na platforme najdiMajstra.sk. Vytvoril ťa tím Najdimajstra Dev-Interactive team.

=== ABSOLÚTNE KRITICKÉ PRAVIDLO ===
TY SI ASISTENT, NIE KLIENT!
TY REAGUJ NA SPRÁVY KLIENTA, NIKDY NEPIŠ ZA NEHO!

ZAKÁZANÉ (NIKDY TOTO NEROB):
❌ NIKDY nezačínaj odpoveď ako klient: "Ahoj. Potrebujem..."
❌ NIKDY nepiš vety typu: "Ahoj! Potrebujem pravidelný servis klimatizácie..."
❌ NIKDY nevymýšľaj, čo klient potrebuje
❌ NIKDY nehovor za klienta prvú osobou ("potrebujem", "chcem", "mám")

POVOLENÉ (TAKTO ODPOVEDAJ):
✅ "Výborne, pravidelný servis je dobrá voľba. Čo potrebuješ servisovať?"
✅ "Rozumiem. V akom meste sa nachádzaš?"
✅ "Môžem ti pomôcť nájsť majstra. Aký typ servisu hľadáš?"

PAMÄTAJ: TY LEN ODPOVEDAŠ NA TO, ČO KLIENT NAPÍŠE. NEKOMUNIKUJ ZA KLIENTA!

TVOJA ÚLOHA:
Pomôcť nájsť majstra pre pravidelné servisovanie zariadení. Buď priateľský a profesionálny.

ŠTÝL KOMUNIKÁCIE:
- Nepoužívaj ŽIADNE markdown formátovanie (bez *, **, _, atď.)
- Písaj bežný text bez zvýraznenia
- Buď priateľský ale vecný
- Opýtaj sa len na potrebné informácie
- Max 3-4 vety naraz

KEĎ SA OPÝTAJÚ KTO ŤA VYTVORIL:
Odpovedz v slovenčine: "Vytvoril ma tím Najdimajstra Dev-Interactive team."
Odpovedz v angličtine: "I was created by the Najdimajstra Dev-Interactive team."

PRÍKLAD SPRÁVNEJ ODPOVEDE:
"Výborne, pravidelný servis je vždy dobrá investícia. Čo potrebuješ servisovať (kotol, elektriku, klimatizáciu) a kde sa nachádzaš?"

KEĎ MÁŠ DOSTATOK INFORMÁCIÍ A NAŠLI SA MAJSTRI:
- Ak sú z rovnakého mesta: "Našiel som majstrov pre pravidelný servis vo vašej lokalite. Pozrite si odporúčania nižšie a pokojne pokračujte v rozhovore!"
- Ak sú zo susedných miest: "V meste [mesto] som nenašiel dostupných majstrov, ale našiel som [počet] majstrov v okolí, ktorí vám môžu pomôcť. Pozrite si ich nižšie!"

KEĎ SA NENAŠLI ŽIADNI MAJSTRI NIKDE:
Povedz: "Momentálne som nenašiel žiadnych dostupných majstrov pre túto službu. Skúste prosím hľadať cez hlavnú stránku alebo kontaktujte podporu."

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

      let recommendedMasters: string[] | undefined;

      if (this.conversationState.hasLocation && this.conversationState.hasServiceDescription) {
        console.log(`🎯 [REGULAR] Both location and service found! Searching for masters...`);
        const result = await this.findServiceMastersWithContext();

        if (result.masters.length > 0) {
          recommendedMasters = result.masters;
          console.log(`✅ [REGULAR] Returning ${result.masters.length} recommended masters`);

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
          console.log(`⚠️ [REGULAR] No masters found with these criteria`);

          // Inform AI that NO masters were found at all
          messages.push({
            role: 'system',
            content: 'SYSTEM: 0 masters found anywhere. Tell the user no masters are currently available and suggest they try the main search page or contact support.'
          });
        }
      } else {
        console.log(`⏳ [REGULAR] Waiting for more info. Location: ${this.conversationState.hasLocation}, Service: ${this.conversationState.hasServiceDescription}`);
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
    const cityDeclensions: { [key: string]: string } = {
      'bratislava': 'bratislava', 'bratislavy': 'bratislava', 'bratislave': 'bratislava', 'bratislavu': 'bratislava', 'bratislavou': 'bratislava',
      'košice': 'košice', 'košíc': 'košice', 'kosice': 'košice', 'kosic': 'košice', 'košiciach': 'košice', 'košiciam': 'košice',
      'prešov': 'prešov', 'prešova': 'prešov', 'presov': 'prešov', 'presova': 'prešov', 'prešove': 'prešov', 'presove': 'prešov',
      'žilina': 'žilina', 'žiliny': 'žilina', 'zilina': 'žilina', 'ziliny': 'žilina', 'žiline': 'žilina', 'ziline': 'žilina',
      'banská bystrica': 'banská bystrica', 'banskej bystrice': 'banská bystrica', 'banskej bystrici': 'banská bystrica', 'banska bystrica': 'banská bystrica', 'banskej bystricy': 'banská bystrica',
      'nitra': 'nitra', 'nitry': 'nitra', 'nitre': 'nitra',
      'trnava': 'trnava', 'trnavy': 'trnava', 'trnave': 'trnava',
      'trenčín': 'trenčín', 'trenčína': 'trenčín', 'trencin': 'trenčín', 'trencina': 'trenčín', 'trenčíne': 'trenčín', 'trencine': 'trenčín',
      'martin': 'martin', 'martina': 'martin', 'martine': 'martin',
      'poprad': 'poprad', 'popradu': 'poprad', 'poprade': 'poprad',
      'prievidza': 'prievidza', 'prievidze': 'prievidza', 'prievidzi': 'prievidza',
      'zvolen': 'zvolen', 'zvolena': 'zvolen', 'zvolene': 'zvolen',
      'považská bystrica': 'považská bystrica', 'považskej bystrice': 'považská bystrica', 'povazska bystrica': 'považská bystrica', 'povazskej bystrice': 'považská bystrica', 'považskej bystrici': 'považská bystrica',
      'nové zámky': 'nové zámky', 'nových zámkov': 'nové zámky', 'nove zamky': 'nové zámky', 'novych zamkov': 'nové zámky', 'nových zámkoch': 'nové zámky',
      'michalovce': 'michalovce', 'michaloviec': 'michalovce', 'michalovciach': 'michalovce',
      'komárno': 'komárno', 'komárna': 'komárno', 'komarno': 'komárno', 'komarna': 'komárno', 'komárne': 'komárno',
      'levice': 'levice', 'levíc': 'levice', 'leviciach': 'levice',
      'humenné': 'humenné', 'humenného': 'humenné', 'humenne': 'humenné', 'humenneho': 'humenné', 'humennom': 'humenné',
      'bardejov': 'bardejov', 'bardejova': 'bardejov', 'bardejove': 'bardejov',
      'liptovský mikuláš': 'liptovský mikuláš', 'liptovského mikuláša': 'liptovský mikuláš', 'liptovsky mikulas': 'liptovský mikuláš', 'liptovského mikulasa': 'liptovský mikuláš', 'liptovskom mikuláši': 'liptovský mikuláš'
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
      { keywords: ['kotol', 'kúrenie', 'radiátor', 'vykurovani'], type: 'Plynár' },
      { keywords: ['elektr', 'električ', 'prúd', 'svetl', 'oprava'], type: 'Elektrikár' },
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

  private async findServiceMastersWithContext(): Promise<{ masters: string[], fromNearby: boolean }> {
    try {
      console.log(`🔍 [REGULAR] Searching masters with params:`, {
        location: this.conversationState.location,
        profession: this.conversationState.serviceType,
        serviceType: 'regular'
      });

      // First try: search in specific city
      let masters = await searchMastersByLocation({
        location: this.conversationState.location,
        profession: this.conversationState.serviceType,
        serviceType: 'regular',
        limit: 5
      });

      console.log(`✅ [REGULAR] Found ${masters.length} masters in ${this.conversationState.location}`);

      // If no masters found in the specific city, try broader search
      if (masters.length === 0) {
        console.log(`🔍 [REGULAR] No masters in ${this.conversationState.location}, searching in nearby areas...`);

        masters = await searchMastersByLocation({
          profession: this.conversationState.serviceType,
          serviceType: 'regular',
          limit: 5
        });

        console.log(`✅ [REGULAR] Found ${masters.length} masters in nearby areas`);

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
      console.error('[REGULAR] Error finding service masters:', error);
      return { masters: [], fromNearby: false };
    }
  }

  resetConversationState(): void {
    this.conversationState = {
      hasLocation: false,
      hasServiceDescription: false
    };
  }
}
