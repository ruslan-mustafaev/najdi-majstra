import { ChatMessage, ServiceType, AIResponse } from './types';
import { UrgentService } from './services/UrgentService';
import { RegularService } from './services/RegularService';
import { RealizationService } from './services/RealizationService';

export class AIService {
  private urgentService: UrgentService;
  private regularService: RegularService;
  private realizationService: RealizationService;

  constructor() {
    this.urgentService = new UrgentService();
    this.regularService = new RegularService();
    this.realizationService = new RealizationService();
  }

  getInitialMessage(serviceType: ServiceType, language: 'sk' | 'en' = 'sk'): string {
    switch (serviceType) {
      case 'urgent':
        return this.urgentService.getInitialMessage(language);
      case 'regular':
        return this.regularService.getInitialMessage(language);
      case 'realization':
        return this.realizationService.getInitialMessage(language);
      default:
        return language === 'sk' ? 'Ako vám môžem pomôcť?' : 'How can I help you?';
    }
  }

  async processMessage(
    userMessage: string, 
    serviceType: ServiceType, 
    conversationHistory: ChatMessage[],
    language: 'sk' | 'en' = 'sk'
  ): Promise<AIResponse> {
    switch (serviceType) {
      case 'urgent':
        return this.urgentService.processMessage(userMessage, conversationHistory, language);
      case 'regular':
        return this.regularService.processMessage(userMessage, conversationHistory, language);
      case 'realization':
        return this.realizationService.processMessage(userMessage, conversationHistory, language);
      default:
        return {
          message: language === 'sk' ? 'Prepáčte, nastala chyba. Skúste to prosím znovu.' : 'Sorry, an error occurred. Please try again.',
          recommendedMasters: undefined
        };
    }
  }
}