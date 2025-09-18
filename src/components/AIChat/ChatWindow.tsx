import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage } from './types';
import { AIService } from './AIService';
import { useLanguage } from '../../hooks/useLanguage';
import { translations } from '../../data/translations';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: 'urgent' | 'regular' | 'realization';
  onMasterRecommendation?: (masterIds: string[]) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  onClose,
  serviceType,
  onMasterRecommendation
}) => {
  const { language } = useLanguage();
  const t = translations.aiChat[language];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiService = new AIService();

  const serviceTypeLabels = {
    urgent: t.serviceTypes.urgent,
    regular: t.serviceTypes.regular,
    realization: t.serviceTypes.realization
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Reset messages when service type changes
    if (isOpen) {
      const initialMessage = aiService.getInitialMessage(serviceType, language);
      setMessages([{
        id: '1',
        content: initialMessage,
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
  }, [serviceType, language]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize conversation based on service type
      const initialMessage = aiService.getInitialMessage(serviceType, language);
      setMessages([{
        id: '1',
        content: initialMessage,
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
  }, [isOpen, serviceType, language]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiService.processMessage(inputValue, serviceType, messages, language);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: 'ai',
        timestamp: new Date(),
        recommendedMasters: response.recommendedMasters
      };

      setMessages(prev => [...prev, aiMessage]);

      // If there are recommended masters, notify parent component
      if (response.recommendedMasters && response.recommendedMasters.length > 0) {
        onMasterRecommendation?.(response.recommendedMasters);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: language === 'sk' ? 'Prepáčte, nastala chyba. Skúste to prosím znovu.' : 'Sorry, an error occurred. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#4169e1] to-[#5a7bff] text-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <Bot size={24} />
            <div>
              <h2 className="text-xl font-bold">{t.title} - {serviceTypeLabels[serviceType]}</h2>
              <p className="text-white/80 text-sm">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-[#4169e1] text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.sender === 'ai' && (
                    <Bot size={20} className="text-[#4169e1] mt-1 flex-shrink-0" />
                  )}
                  {message.sender === 'user' && (
                    <User size={20} className="text-white mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.recommendedMasters && message.recommendedMasters.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <p className="text-sm font-medium text-blue-800 mb-2">
                          {language === 'sk' 
                            ? `Odporúčaní majstri (${message.recommendedMasters.length}):`
                            : `Recommended masters (${message.recommendedMasters.length}):`
                          }
                        </p>
                        <div className="text-xs text-blue-600">
                          {language === 'sk' 
                            ? 'Kliknite na "Zobraziť odporúčania" pre detaily'
                            : 'Click "View recommendations" for details'
                          }
                        </div>
                      </div>
                    )}
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString('sk-SK', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center space-x-2">
                <Bot size={20} className="text-[#4169e1]" />
                <Loader2 size={16} className="animate-spin text-[#4169e1]" />
                <span className="text-gray-600">{t.typing}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-4">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t.placeholder}
              className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-[#4169e1] text-white px-6 py-3 rounded-xl hover:bg-[#3558d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send size={20} />
              <span>{t.sendButton}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};