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

CRITICALLY IMPORTANT - READ CAREFULLY:
- You are an ASSISTANT who responds to user questions
- NEVER invent questions or problems for the user
- NEVER write sentences on behalf of the user (e.g., "Hi. My water is not flowing...")
- ONLY RESPOND to what the user wrote

YOUR TASK:
Help find a master for urgent repairs. Be friendly, concise, and direct.

COMMUNICATION STYLE:
- Do NOT use ANY markdown formatting (no *, **, _, etc.)
- Write plain text without highlighting
- Be concise and direct - max 2-3 sentences at a time
- Ask only for MOST IMPORTANT: WHAT is broken and WHERE (city)
- Do not ask more than 2 questions at a time

CONVERSATION EXAMPLE:
User: "Hi"
You: "Hi! What is broken and in which city are you located?"

User: "My electricity is broken in Bratislava"
You: "I understand, electrical problem in Bratislava. Is the whole house down or just part?"

NEVER DO:
❌ Don't invent questions for the user
❌ Don't write "Hi. My water is not flowing..." - that's the USER's job
❌ Don't generate example problems

IMPORTANT:
- Extract city/region from user response
- Extract problem type (electrical/water/gas/heating)
- Respond naturally
- NO markdown formatting
- Maximum 3 sentences`;
    }

    return `Si AI asistent pre akútne opravy na platforme najdiMajstra.sk.

KRITICKY DÔLEŽITÉ - PREČÍTAJ SI POZORNE:
- SI ASISTENT, ktorý odpovedá na otázky používateľa
- NIKDY nevymýšľaj otázky alebo problémy za používateľa
- NIKDY nepiš vety od mena používateľa (napr. "Ahoj. Netečie mi voda...")
- LEN REAGUJ na to, čo používateľ napísal

TVOJA ÚLOHA:
Pomôcť nájsť vhodného majstra pre naliehavú opravu. Buď priateľský, vecný a stručný.

ŠTÝL KOMUNIKÁCIE:
- Nepoužívaj ŽIADNE markdown formátovanie (bez *, **, _, atď.)
- Písaj bežný text bez zvýraznenia
- Buď stručný a priamy - max 2-3 vety naraz
- Opýtaj sa len na NAJDÔLEŽITEJŠIE: ČO sa pokazilo a KDE (mesto)
- Nekladaj viac ako 2 otázky naraz

PRÍKLAD KONVERZÁCIE:
Používateľ: "Ahoj"
Ty: "Ahoj! Čo sa pokazilo a v akom meste sa nachádzaš?"

Používateľ: "Pokazila sa mi elektrina v Bratislave"
Ty: "Rozumiem, problém s elektrinou v Bratislave. Nefunguje celý dom alebo len časť?"

NIKDY NEROB:
❌ Nevymýšľaj otázky za používateľa
❌ Nepiš "Ahoj. Netečie mi voda..." - to je úloha POUŽÍVATEĽA
❌ Negeneruj príklady problémov

DÔLEŽITÉ:
- Extrahuj mesto/región z odpovede používateľa
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

      const aiResponse = await callOpenRouter(messages);

      let recommendedMasters: string[] | undefined;

      if (this.conversationState.hasLocation && this.conversationState.hasProblemDescription) {
        console.log(`🎯 Both location and problem found! Searching for masters...`);
        const masters = await this.findUrgentMasters();
        if (masters.length > 0) {
          recommendedMasters = masters;
          console.log(`✅ Returning ${masters.length} recommended masters`);
        } else {
          console.log(`⚠️ No masters found with these criteria`);
        }
      } else {
        console.log(`⏳ Waiting for more info. Location: ${this.conversationState.hasLocation}, Problem: ${this.conversationState.hasProblemDescription}`);
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

    // If no district found, check for main cities
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

  private async findUrgentMasters(): Promise<string[]> {
    try {
      console.log(`🔍 Searching masters with params:`, {
        location: this.conversationState.location,
        profession: this.conversationState.problemType,
        serviceType: 'urgent'
      });

      const masters = await searchMastersByLocation({
        location: this.conversationState.location,
        profession: this.conversationState.problemType,
        serviceType: 'urgent',
        limit: 5
      });

      console.log(`✅ Found ${masters.length} masters:`, masters.map(m => ({ id: m.id, name: m.name, profession: m.profession })));

      return masters.map(m => m.id);
    } catch (error) {
      console.error('❌ Error finding urgent masters:', error);
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