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

🚨 ABSOLUTELY CRITICAL RULE 🚨
NEVER, UNDER ANY CIRCUMSTANCES, WRITE MESSAGES AS IF YOU WERE THE CLIENT!

FORBIDDEN EXAMPLES:
❌ "Hi. My water is not flowing..."
❌ "Hello, I have a problem with electricity..."
❌ "I need help with heating..."
❌ Any sentences that start from the client's perspective

YOU ARE AN ASSISTANT - YOU ANSWER QUESTIONS, NOT CREATE THEM!

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

🚨 ABSOLÚTNE KRITICKÉ PRAVIDLO 🚨
NIKDY, ZA ŽIADNYCH OKOLNOSTÍ, NEPIŠ SPRÁVY AKO KEBY SI BOL KLIENT!

ZAKÁZANÉ PRÍKLADY:
❌ "Ahoj. Netečie mi voda..."
❌ "Dobrý deň, mám problém s elektrinou..."
❌ "Potrebujem pomoc s kúrením..."
❌ Akékoľvek vety, ktoré začínajú z pohľadu klienta

SI ASISTENT - ODPOVEDÁŠ NA OTÁZKY, NIE ICH VYMÝŠĽAŠ!

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
          console.log(`✅ Returning ${result.masters.length} recommended masters`);

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
      'michalovciach': 'michalovce',
      'komárno': 'komárno',
      'komarno': 'komárno',
      'komárne': 'komárno',
      'levice': 'levice',
      'leviciach': 'levice',
      'humenné': 'humenné',
      'humenne': 'humenné',
      'humennom': 'humenné',
      'bardejov': 'bardejov',
      'bardejove': 'bardejov',
      'liptovský mikuláš': 'liptovský mikuláš',
      'liptovsky mikulas': 'liptovský mikuláš',
      'liptovskom mikuláši': 'liptovský mikuláš'
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
        console.log(`🔧 Found problem type: "${problem.type}"`);
      }
    });

    const criticalKeywords = ['plyn', 'dym', 'iskr', 'požiar', 'zatopa'];
    if (criticalKeywords.some(kw => lowerMessage.includes(kw))) {
      this.conversationState.urgencyLevel = 'critical';
    }
  }

  private async findUrgentMastersWithContext(): Promise<{ masters: string[], fromNearby: boolean }> {
    try {
      console.log(`🔍 Searching masters with params:`, {
        location: this.conversationState.location,
        profession: this.conversationState.problemType,
        serviceType: 'urgent'
      });

      // First try: search in specific city
      let masters = await searchMastersByLocation({
        location: this.conversationState.location,
        profession: this.conversationState.problemType,
        serviceType: 'urgent',
        limit: 5
      });

      console.log(`✅ Found ${masters.length} masters in ${this.conversationState.location}`);

      // If no masters found in the specific city, try broader search without location filter
      if (masters.length === 0) {
        console.log(`🔍 No masters in ${this.conversationState.location}, searching in nearby areas...`);

        masters = await searchMastersByLocation({
          profession: this.conversationState.problemType,
          serviceType: 'urgent',
          limit: 5
        });

        console.log(`✅ Found ${masters.length} masters in nearby areas`);

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