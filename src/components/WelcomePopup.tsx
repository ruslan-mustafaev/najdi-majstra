import React, { useState } from 'react';
import { X, Users, Search, Cookie } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../data/translations';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUserTypeSelect: (type: 'client' | 'master') => void;
  onAuthRequired: (type: 'client' | 'master') => void;
}

export const WelcomePopup: React.FC<WelcomePopupProps> = ({ isOpen, onClose, onUserTypeSelect, onAuthRequired }) => {
  const { language } = useLanguage();
  const t = translations[language];
  const [cookiesAccepted, setCookiesAccepted] = useState(false);

  if (!isOpen) return null;

  const handleOptionSelect = (option: 'master' | 'client') => {
    if (cookiesAccepted) {
      onAuthRequired(option);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md mx-auto relative shadow-2xl">
        
        {/* Red delete section */}
        <div className="bg-red-500 text-white text-center py-3 rounded-t-2xl">
          <div className="font-semibold">{t.popup.clearSpace}</div>
          <div className="text-sm mt-1">{t.popup.clearSpaceMessage}</div>
        </div>

        <div className="p-6">
          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {t.popup.title}
            </h2>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Client Option */}
            <div className="border-2 border-gray-200 rounded-lg p-4 text-center relative">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="text-white" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t.popup.clientOption.title}
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                {t.popup.clientOption.description}
              </p>
              
              {/* Red delete button */}
              <div className="bg-red-500 text-white text-xs px-3 py-1 rounded mb-2">
                {t.popup.clientOption.redButton}
              </div>
              
              {/* Green action button */}
              <button
                onClick={() => handleOptionSelect('client')}
                disabled={!cookiesAccepted}
                className="w-full bg-green-500 text-white py-2 px-3 rounded text-xs font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t.popup.clientOption.button}
              </button>
            </div>

            {/* Master Option */}
            <div className="border-2 border-blue-500 rounded-lg p-4 text-center relative">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="text-white" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {t.popup.masterOption.title}
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                {t.popup.masterOption.description}
              </p>
              
              {/* Red delete button */}
              <div className="bg-red-500 text-white text-xs px-3 py-1 rounded mb-2">
                {t.popup.masterOption.redButton}
              </div>
              
              {/* Green action button */}
              <button
                onClick={() => handleOptionSelect('master')}
                disabled={!cookiesAccepted}
                className="w-full bg-green-500 text-white py-2 px-3 rounded text-xs font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t.popup.masterOption.button}
              </button>
            </div>
          </div>

          {/* Registration promo */}
          <div className="bg-red-500 text-white text-center py-3 rounded mb-4 text-sm">
            {t.popup.registrationPromo}
          </div>

          {/* Cookies */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="cookies"
              checked={cookiesAccepted}
              onChange={(e) => setCookiesAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <label htmlFor="cookies" className="text-sm text-gray-600 cursor-pointer flex items-center">
                <Cookie size={16} className="mr-2" />
                {t.popup.cookies}
              </label>
              <a href="#" className="text-blue-500 hover:underline text-sm">
                {t.popup.privacy}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};