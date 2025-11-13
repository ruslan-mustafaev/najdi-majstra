import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Star, MapPin } from 'lucide-react';
import { ChatMessage } from './types';
import { AIService } from './AIService';
import { useLanguage } from '../../hooks/useLanguage';
import { translations } from '../../data/translations';
import { MasterSearchResult } from '../../lib/masterSearchApi';
import { supabase } from '../../lib/supabase';

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
  const [recommendedMasters, setRecommendedMasters] = useState<MasterSearchResult[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiService = new AIService();

  // Debug logging for recommended masters
  useEffect(() => {
    console.log('🎨 Recommended Masters State Updated:', recommendedMasters);
  }, [recommendedMasters]);

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
      setRecommendedMasters([]); // Clear recommended masters
      setShowRecommendations(true); // Reset visibility
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
      setRecommendedMasters([]); // Clear recommended masters
      setShowRecommendations(true); // Reset visibility
    }
    if (!isOpen) {
      // Clear everything when chat is closed
      setRecommendedMasters([]);
      setShowRecommendations(true);
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

      // If there are recommended masters, load their full data and display
      if (response.recommendedMasters && response.recommendedMasters.length > 0) {
        onMasterRecommendation?.(response.recommendedMasters);

        // Load full master data by IDs returned from AI service
        try {
          const { data: mastersData, error } = await supabase
            .from('masters')
            .select('*')
            .in('id', response.recommendedMasters);

          if (error) {
            console.error('Error loading masters:', error);
            return;
          }

          if (!mastersData || mastersData.length === 0) {
            console.log('⚠️ No master data found for IDs:', response.recommendedMasters);
            return;
          }

          // Get reviews for rating calculation
          const masterUserIds = mastersData.map(m => m.user_id);
          const { data: reviewsData } = await supabase
            .from('master_reviews')
            .select('master_id, rating')
            .in('master_id', masterUserIds);

          // Calculate ratings
          const ratingsMap = new Map();
          const reviewCountMap = new Map();

          (reviewsData || []).forEach(review => {
            if (!ratingsMap.has(review.master_id)) {
              ratingsMap.set(review.master_id, []);
            }
            ratingsMap.get(review.master_id).push(review.rating);
          });

          ratingsMap.forEach((ratings, masterId) => {
            const avgRating = ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length;
            ratingsMap.set(masterId, Math.round(avgRating * 10) / 10);
            reviewCountMap.set(masterId, ratings.length);
          });

          // Transform to MasterSearchResult format
          const masters = mastersData.map(master => ({
            id: master.id,
            slug: master.slug,
            name: master.name || 'Majster',
            profession: master.profession || 'Majster',
            location: master.location || 'Slovensko',
            rating: ratingsMap.get(master.user_id) || 0,
            reviewCount: reviewCountMap.get(master.user_id) || 0,
            available: master.is_available ?? master.is_active,
            profileImage: master.profile_image_url || '/placeholder-avatar.svg',
            hourlyRateMin: master.hourly_rate_min || 0,
            hourlyRateMax: master.hourly_rate_max || 0,
            serviceArea: master.service_area || 'lokálne'
          }));

          console.log('✅ Loaded master details:', masters.length, masters);
          setRecommendedMasters(masters);
          setShowRecommendations(true);
        } catch (error) {
          console.error('Error loading recommended masters:', error);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Prepáčte, nastala chyba pri spracovaní vašej správy. Prosím, skúste to znovu alebo kontaktujte podporu.',
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

        {/* Recommended Masters Cards */}
        {recommendedMasters.length > 0 && showRecommendations && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {language === 'sk' ? 'Odporúčaní majstri:' : 'Recommended Masters:'}
              </h3>
              <button
                onClick={() => setShowRecommendations(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                title={language === 'sk' ? 'Skryť odporúčania' : 'Hide recommendations'}
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto">
              {recommendedMasters.map((master) => (
                <div
                  key={master.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    console.log('Card clicked, navigating to:', `/profile/${master.slug}`);
                    window.location.href = `/profile/${master.slug}`;
                  }}
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={master.profileImage}
                      alt={master.name}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                        {master.name}
                      </h4>
                      <p className="text-[#4169e1] font-medium mb-2">
                        {master.profession}
                      </p>
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <MapPin size={14} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{master.location}</span>
                      </div>
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-1">
                          <Star className="text-yellow-400 fill-current" size={16} />
                          <span className="font-medium">{master.rating}</span>
                          <span className="text-gray-500 text-sm">({master.reviewCount})</span>
                        </div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          master.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-1 ${
                            master.available ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          {master.available ? (language === 'sk' ? 'Dostupný' : 'Available') : (language === 'sk' ? 'Obsadený' : 'Busy')}
                        </div>
                      </div>
                      {master.hourlyRateMin > 0 && (
                        <p className="text-sm text-gray-600 mb-2">
                          {master.hourlyRateMin}€ - {master.hourlyRateMax}€ / {language === 'sk' ? 'hod' : 'hr'}
                        </p>
                      )}
                      <button
                        className="w-full bg-[#4169e1] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#3558d4] transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Button clicked, navigating to:', `/profile/${master.slug}`);
                          console.log('Master data:', master);
                          window.location.href = `/profile/${master.slug}`;
                        }}
                      >
                        {language === 'sk' ? 'Zobraziť profil' : 'View Profile'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6 border-t border-gray-200">
          {/* Show recommendations button if hidden */}
          {recommendedMasters.length > 0 && !showRecommendations && (
            <div className="mb-4">
              <button
                onClick={() => setShowRecommendations(true)}
                className="w-full bg-blue-50 text-[#4169e1] px-4 py-3 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2 border border-blue-200"
              >
                <Bot size={20} />
                <span>
                  {language === 'sk'
                    ? `Zobraziť ${recommendedMasters.length} odporúčaných majstrov`
                    : `Show ${recommendedMasters.length} recommended masters`
                  }
                </span>
              </button>
            </div>
          )}
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