export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  recommendedMasters?: string[];
}

export type ServiceType = 'urgent' | 'regular' | 'realization';

export interface AIResponse {
  message: string;
  recommendedMasters?: string[];
}