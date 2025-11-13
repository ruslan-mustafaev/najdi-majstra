import { ChatMessage, AIResponse } from '../types';
import { callOpenRouter, OpenRouterMessage } from '../../../lib/openRouterApi';
import { searchMastersByLocation } from '../../../lib/masterSearchApi';
import { extractProfessionType } from './professionKeywords';

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

🚨🚨🚨 ABSOLUTELY CRITICAL RULE 🚨🚨🚨
NEVER, UNDER ANY CIRCUMSTANCES, WRITE MESSAGES AS IF YOU WERE THE CLIENT!
NEVER INVENT WHAT THE CLIENT NEEDS!
NEVER SPEAK FOR THE CLIENT!

COMPLETELY FORBIDDEN EXAMPLES - NEVER DO THIS:
❌ "Hi. My water is not flowing..."
❌ "Hello! I have an urgent problem with electricity in Bratislava."
❌ "Hello, I have a problem with electricity..."
❌ "I need help with heating..."
❌ Any sentences where you pretend to be the client
❌ Any sentences where you say what client needs, if they haven't told you yet

YOU ARE AN ASSISTANT - ONLY RESPOND TO WHAT THE CLIENT WRITES!
DON'T SPEAK FOR CLIENT! DON'T WRITE FOR CLIENT! DON'T INVENT FOR CLIENT!

YOUR TASK:
Help find a master for urgent repairs. Be friendly, concise, and direct.

COMMUNICATION STYLE:
- Do NOT use ANY markdown formatting (no *, **, _, etc.)
- Write plain text without highlighting
- Be concise and direct - max 2-3 sentences at a time
- Ask only for MOST IMPORTANT: WHAT is broken and WHERE (city)
- Do not ask more than 2 questions at a time

CORRECT CONVERSATION EXAMPLE:
User: "Hi"
You: "Hi! What is broken and in which city are you located?"

User: "My electricity is broken in Bratislava"
You: "I understand, electrical problem in Bratislava. Is the whole house down or just part?"

WHEN YOU HAVE ENOUGH INFORMATION AND MASTERS FOUND:
- If from same city: "I found available masters in your area. Check recommendations below, and feel free to ask me anything else!"
- If from nearby cities: "I couldn't find masters in [city], but I found [number] masters in nearby areas who can help you. Check them below!"

WHEN NO MASTERS FOUND ANYWHERE:
Say: "I couldn't find any available masters for this service at the moment. Please try searching through the main page or contact support."

IMPORTANT:
- Extract city/region from user response
- Extract problem type (electrical/water/gas/heating)
- Respond naturally
- NO markdown formatting
- Maximum 3 sentences
- User can continue conversation after seeing masters`;
    }

    return `Si AI asistent pre akútne opravy na platforme najdiMajstra.sk.
Bol si vytvorený tímom Najdimajstra Dev-Interactive team.

🚨🚨🚨 ABSOLÚTNE KRITICKÉ PRAVIDLO 🚨🚨🚨
NIKDY, ZA ŽIADNYCH OKOLNOSTÍ, NEPIŠ SPRÁVY AKO KEBY SI BOL KLIENT!
NIKDY NEVMÝŠĽAJ ČO KLIENT POTREBUJE!
NIKDY NEHOVOR ZA KLIENTA!

ÚPLNE ZAKÁZANÉ PRÍKLADY - NIKDY ICH NEUROB:
❌ "Ahoj. Netečie mi voda..."
❌ "Ahoj! Mám náliehavý problém s elektrinou v Bratislave."
❌ "Dobrý deň, mám problém s elektrinou..."
❌ "Potrebujem pomoc s kúrením..."
❌ Akékoľvek vety, kde sa tváriš ako klient
❌ Akékoľvek vety, kde hovoriš čo klient potrebuje, ak ti to ešte nepovedal

SI ASISTENT - LEN REAGUJ NA TO, ČO KLIENT NAPÍŠE!
NEHOVOR ZA KLIENTA! NEPÍŠ ZA KLIENTA! NEVMÝŠĽAJ ZA KLIENTA!

KEĎ SA OPÝTAJÚ KTO ŤA VYTVORIL:
Odpovedz v slovenčine: "Vytvoril ma tím Najdimajstra Dev-Interactive team."
Odpovedz v angličtine: "I was created by the Najdimajstra Dev-Interactive team."

TVOJA ÚLOHA:
Pomôcť nájsť vhodného majstra pre naliehavú opravu. Buď priateľský, vecný a stručný.

ŠTÝL KOMUNIKÁCIE:
- Nepoužívaj ŽIADNE markdown formátovanie (bez *, **, _, atď.)
- Písaj bežný text bez zvýraznenia
- Buď stručný a priamy - max 2-3 vety naraz
- Opýtaj sa len na NAJDÔLEŽITEJŠIE: ČO sa pokazilo a KDE (mesto)
- Nekladaj viac ako 2 otázky naraz

SPRÁVNY PRÍKLAD KONVERZÁCIE:
Používateľ: "Ahoj"
Ty: "Ahoj! Čo sa pokazilo a v akom meste sa nachádzaš?"

Používateľ: "Pokazila sa mi elektrina v Bratislave"
Ty: "Rozumiem, problém s elektrinou v Bratislave. Nefunguje celý dom alebo len časť?"

KEĎ MÁŠ DOSTATOK INFORMÁCIÍ A NAŠLI SA MAJSTRI:
- Ak sú z rovnakého mesta: "Našiel som dostupných majstrov vo vašej lokalite. Pozrite si odporúčania nižšie a pokojne sa ma opýtajte na čokoľvek ďalšie!"
- Ak sú zo susedných miest: "V meste [mesto] som nenašiel dostupných majstrov, ale našiel som [počet] majstrov v okolí, ktorí vám môžu pomôcť. Pozrite si ich nižšie!"

KEĎ SA NENAŠLI ŽIADNI MAJSTRI NIKDE:
Povedz: "Momentálne som nenašiel žiadnych dostupných majstrov pre túto službu. Skúste prosím hľadať cez hlavnú stránku alebo kontaktujte podporu."

DÔLEŽITÉ:
- Extrahuj mesto/región z odpovede používateľa
- Extrahuj typ problému (elektrika/voda/plyn/kúrenie)
- Odpovedaj v slovenčine prirodzene
- ŽIADNE markdown formátovanie
- Maximum 3 vety
- Používateľ môže pokračovať v konverzácii po zobrazení majstrov`;
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
      // Extract information from ALL user messages in the conversation
      const allUserMessages = conversationHistory
        .filter(msg => msg.sender === 'user')
        .map(msg => msg.content)
        .join(' ') + ' ' + userMessage;

      console.log(`🔍 ALL USER MESSAGES:`, allUserMessages);
      this.extractInformation(allUserMessages);

      console.log(`📊 Conversation state:`, {
        hasLocation: this.conversationState.hasLocation,
        location: this.conversationState.location,
        hasProblemDescription: this.conversationState.hasProblemDescription,
        problemType: this.conversationState.problemType
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

      if (this.conversationState.hasLocation && this.conversationState.hasProblemDescription) {
        console.log(`🎯 Both location and problem found! Searching for masters...`);
        const result = await this.findUrgentMastersWithContext();

        if (result.masters.length > 0) {
          recommendedMasters = result.masters;
          console.log(`✅ Returning ${result.masters.length} recommended masters (type: ${result.serviceType})`);

          // Inform AI where the masters are from and what type
          if (result.serviceType === 'alternative') {
            // Masters from same city but do regular/realization service
            const msg = language === 'sk'
              ? `SYSTEM: Našiel si ${result.masters.length} majstrov v meste ${this.conversationState.location}, ale nie sú to majstri pre akútne poruchy. Sú to majstri pre pravidelný servis a plánovanú realizáciu. Povedz používateľovi: "V Nitre som nenašiel majstrov pre akútne poruchy, ale našiel som ${result.masters.length} ${this.conversationState.problemType?.toLowerCase()} v meste ${this.conversationState.location}, ktorí sa venujú pravidelnému servisu a plánovanej realizácii. Možno by vám mohli pomôcť aj v naliehavej situácii. Pozrite si ich nižšie!"`
              : `SYSTEM: You found ${result.masters.length} masters in ${this.conversationState.location}, but they are not urgent service masters. They do regular service and planned realization. Tell the user: "I didn't find urgent service masters in ${this.conversationState.location}, but I found ${result.masters.length} ${this.conversationState.problemType?.toLowerCase()} who do regular service and planned realization. Maybe they could help in urgent situation too. Check them below!"`;

            messages.push({
              role: 'system',
              content: msg
            });
          } else if (result.fromNearby) {
            // Urgent masters from nearby cities
            messages.push({
              role: 'system',
              content: `SYSTEM: ${result.masters.length} masters found BUT NOT in ${this.conversationState.location}. They are from nearby cities/areas. Tell the user you couldn't find masters in their exact city (${this.conversationState.location}), but you found ${result.masters.length} masters in nearby areas who can help.`
            });
          } else {
            // Urgent masters from the same city
            messages.push({
              role: 'system',
              content: `SYSTEM: ${result.masters.length} masters found in ${this.conversationState.location}. Tell them you found masters in their city.`
            });
          }
        } else {
          console.log(`⚠️ No masters found with these criteria`);

          // Inform AI that NO masters were found at all
          messages.push({
            role: 'system',
            content: 'SYSTEM: 0 masters found anywhere. Tell the user no masters are currently available and suggest they try the main search page or contact support.'
          });
        }
      } else {
        console.log(`⏳ Waiting for more info. Location: ${this.conversationState.hasLocation}, Problem: ${this.conversationState.hasProblemDescription}`);
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
      // Bratislava - all forms
      'bratislava': 'bratislava',
      'bratislavy': 'bratislava', // genitive: z Bratislavy
      'bratislave': 'bratislava', // locative: v Bratislave
      'bratislavu': 'bratislava', // accusative
      'bratislavou': 'bratislava', // instrumental

      // Košice - all forms
      'košice': 'košice',
      'košíc': 'košice', // genitive: z Košíc
      'kosice': 'košice',
      'kosic': 'košice',
      'košiciach': 'košice', // locative: v Košiciach
      'košiciam': 'košice',

      // Prešov - all forms
      'prešov': 'prešov',
      'prešova': 'prešov', // genitive: z Prešova
      'presov': 'prešov',
      'presova': 'prešov',
      'prešove': 'prešov', // locative: v Prešove
      'presove': 'prešov',

      // Žilina - all forms
      'žilina': 'žilina',
      'žiliny': 'žilina', // genitive: zo Žiliny
      'zilina': 'žilina',
      'ziliny': 'žilina',
      'žiline': 'žilina', // locative: v Žiline
      'ziline': 'žilina',

      // Banská Bystrica - all forms
      'banská bystrica': 'banská bystrica',
      'banskej bystrice': 'banská bystrica', // genitive: z Banskej Bystrice
      'banskej bystrici': 'banská bystrica', // locative: v Banskej Bystrici
      'banska bystrica': 'banská bystrica',
      'banskej bystricy': 'banská bystrica',

      // Nitra - all forms
      'nitra': 'nitra',
      'nitry': 'nitra', // genitive: z Nitry
      'nitre': 'nitra', // locative: v Nitre

      // Trnava - all forms
      'trnava': 'trnava',
      'trnavy': 'trnava', // genitive: z Trnavy
      'trnave': 'trnava', // locative: v Trnave

      // Trenčín - all forms
      'trenčín': 'trenčín',
      'trenčína': 'trenčín', // genitive: z Trenčína
      'trencin': 'trenčín',
      'trencina': 'trenčín',
      'trenčíne': 'trenčín', // locative: v Trenčíne
      'trencine': 'trenčín',

      // Martin - all forms
      'martin': 'martin',
      'martina': 'martin', // genitive: z Martina
      'martine': 'martin', // locative: v Martine

      // Poprad - all forms
      'poprad': 'poprad',
      'popradu': 'poprad', // genitive: z Popradu
      'poprade': 'poprad', // locative: v Poprade

      // Prievidza - all forms
      'prievidza': 'prievidza',
      'prievidze': 'prievidza', // genitive: z Prievidze
      'prievidzi': 'prievidza', // locative: v Prievidzi

      // Zvolen - all forms
      'zvolen': 'zvolen',
      'zvolena': 'zvolen', // genitive: zo Zvolena
      'zvolene': 'zvolen', // locative: vo Zvolene

      // Považská Bystrica - all forms
      'považská bystrica': 'považská bystrica',
      'považskej bystrice': 'považská bystrica', // genitive: z Považskej Bystrice
      'povazska bystrica': 'považská bystrica',
      'povazskej bystrice': 'považská bystrica',
      'považskej bystrici': 'považská bystrica', // locative

      // Nové Zámky - all forms
      'nové zámky': 'nové zámky',
      'nových zámkov': 'nové zámky', // genitive: z Nových Zámkov
      'nove zamky': 'nové zámky',
      'novych zamkov': 'nové zámky',
      'nových zámkoch': 'nové zámky', // locative: v Nových Zámkoch

      // Michalovce - all forms
      'michalovce': 'michalovce',
      'michaloviec': 'michalovce', // genitive: z Michaloviec
      'michalovciach': 'michalovce', // locative: v Michalovciach

      // Komárno - all forms
      'komárno': 'komárno',
      'komárna': 'komárno', // genitive: z Komárna
      'komarno': 'komárno',
      'komarna': 'komárno',
      'komárne': 'komárno', // locative: v Komárne

      // Levice - all forms
      'levice': 'levice',
      'levíc': 'levice', // genitive: z Levíc
      'leviciach': 'levice', // locative: v Leviciach

      // Humenné - all forms
      'humenné': 'humenné',
      'humenného': 'humenné', // genitive: z Humenného
      'humenne': 'humenné',
      'humenneho': 'humenné',
      'humennom': 'humenné', // locative: v Humennom

      // Bardejov - all forms
      'bardejov': 'bardejov',
      'bardejova': 'bardejov', // genitive: z Bardejova
      'bardejove': 'bardejov', // locative: v Bardejove

      // Liptovský Mikuláš - all forms
      'liptovský mikuláš': 'liptovský mikuláš',
      'liptovského mikuláša': 'liptovský mikuláš', // genitive: z Liptovského Mikuláša
      'liptovsky mikulas': 'liptovský mikuláš',
      'liptovského mikulasa': 'liptovský mikuláš',
      'liptovskom mikuláši': 'liptovský mikuláš' // locative: v Liptovskom Mikuláši
    };

    // Main cities
    const locationKeywords = [
      'bratislava', 'košice', 'prešov', 'žilina', 'banská bystrica', 'nitra', 'trnava', 'trenčín',
      'martin', 'poprad', 'prievidza', 'zvolen', 'považská bystrica', 'nové zámky', 'michalovce',
      'komárno', 'levice', 'humenné', 'bardejov', 'liptovský mikuláš'
    ];

    // Districts map to main cities
    const districtMapping: { [key: string]: string } = {
      'petržalka': 'bratislava',
      'petrzalka': 'bratislava',
      'rača': 'bratislava',
      'ráča': 'bratislava',
      'raca': 'bratislava',
      'karlova ves': 'bratislava',
      'karlova': 'bratislava',
      'dúbravka': 'bratislava',
      'dubravka': 'bratislava',
      'lamač': 'bratislava',
      'lamac': 'bratislava',
      'nové mesto': 'bratislava',
      'nove mesto': 'bratislava',
      'staré mesto': 'bratislava',
      'stare mesto': 'bratislava',
      'ružinov': 'bratislava',
      'ruzinov': 'bratislava',
      'vrakuňa': 'bratislava',
      'vrakuna': 'bratislava',
      'podunajské biskupice': 'bratislava',
      'podunajske biskupice': 'bratislava'
    };

    // Check for districts first
    let foundLocation = false;
    Object.keys(districtMapping).forEach(district => {
      if (lowerMessage.includes(district)) {
        this.conversationState.location = districtMapping[district];
        this.conversationState.hasLocation = true;
        foundLocation = true;
        console.log(`🗺️ Found district "${district}" → city "${districtMapping[district]}"`);
      }
    });

    // If no district found, check for city declensions (including "v Nitre", "v Bratislave", etc.)
    if (!foundLocation) {
      Object.keys(cityDeclensions).forEach(declension => {
        if (lowerMessage.includes(declension)) {
          this.conversationState.location = cityDeclensions[declension];
          this.conversationState.hasLocation = true;
          foundLocation = true;
          console.log(`🗺️ Found city declension "${declension}" → city "${cityDeclensions[declension]}"`);
        }
      });
    }

    // Fallback to basic city names
    if (!foundLocation) {
      locationKeywords.forEach(city => {
        if (lowerMessage.includes(city)) {
          this.conversationState.location = city;
          this.conversationState.hasLocation = true;
          console.log(`🗺️ Found city "${city}"`);
        }
      });
    }

    // Extract profession type using shared keywords
    const professionType = extractProfessionType(lowerMessage);
    if (professionType) {
      this.conversationState.problemType = professionType;
      this.conversationState.hasProblemDescription = true;
      console.log(`🔧 Found problem type: "${professionType}"`);
    }

    const criticalKeywords = ['plyn', 'dym', 'iskr', 'požiar', 'zatopa'];
    if (criticalKeywords.some(kw => lowerMessage.includes(kw))) {
      this.conversationState.urgencyLevel = 'critical';
    }
  }

  private async findUrgentMastersWithContext(): Promise<{ masters: string[], fromNearby: boolean, serviceType?: string }> {
    try {
      console.log(`🔍 Searching masters with params:`, {
        location: this.conversationState.location,
        profession: this.conversationState.problemType,
        serviceType: 'urgent'
      });

      // Step 1: Search for urgent masters in the specific city
      let masters = await searchMastersByLocation({
        location: this.conversationState.location,
        profession: this.conversationState.problemType,
        serviceType: 'urgent',
        limit: 5
      });

      console.log(`✅ Found ${masters.length} urgent masters in ${this.conversationState.location}`);

      if (masters.length > 0) {
        return {
          masters: masters.map(m => m.id),
          fromNearby: false,
          serviceType: 'urgent'
        };
      }

      // Step 2: No urgent masters in the city, try regular/realization masters in the SAME city
      console.log(`🔍 No urgent masters in ${this.conversationState.location}, trying regular/realization masters in same city...`);

      const regularMasters = await searchMastersByLocation({
        location: this.conversationState.location,
        profession: this.conversationState.problemType,
        serviceType: 'regular',
        limit: 3
      });

      const realizationMasters = await searchMastersByLocation({
        location: this.conversationState.location,
        profession: this.conversationState.problemType,
        serviceType: 'realization',
        limit: 3
      });

      // Combine and deduplicate
      const allLocalMasters = [...regularMasters, ...realizationMasters];
      const uniqueLocalMasters = Array.from(
        new Map(allLocalMasters.map(m => [m.id, m])).values()
      );

      console.log(`✅ Found ${uniqueLocalMasters.length} regular/realization masters in ${this.conversationState.location}`);

      if (uniqueLocalMasters.length > 0) {
        return {
          masters: uniqueLocalMasters.slice(0, 5).map(m => m.id),
          fromNearby: false,
          serviceType: 'alternative'
        };
      }

      // Step 3: No masters in the city at all, try urgent masters in nearby areas
      console.log(`🔍 No masters in ${this.conversationState.location}, searching urgent masters in nearby areas...`);

      masters = await searchMastersByLocation({
        profession: this.conversationState.problemType,
        serviceType: 'urgent',
        limit: 5
      });

      console.log(`✅ Found ${masters.length} urgent masters in nearby areas`);

      return {
        masters: masters.map(m => m.id),
        fromNearby: true,
        serviceType: 'urgent'
      };
    } catch (error) {
      console.error('❌ Error finding urgent masters:', error);
      return { masters: [], fromNearby: false };
    }
  }

  resetConversationState(): void {
    this.conversationState = {
      hasLocation: false,
      hasProblemDescription: false
    };
  }
}