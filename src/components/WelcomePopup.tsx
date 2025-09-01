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
      // Trigger authentication flow instead of direct selection
      onAuthRequired(option);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center sm:items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-l-xl rounded-r-3xl sm:rounded-2xl w-full max-w-sm sm:max-w-2xl mx-auto relative animate-in zoom-in-95 duration-300 shadow-2xl my-12 sm:my-8 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        
        <div className="p-4 sm:p-8">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-8">
            <h2 className="text-lg sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
              {t.popup.title}
            </h2>
            <p className="text-gray-600 text-xs sm:text-base leading-relaxed">
              222Potrebuje rýchlo alebo plánovanie pomôcť alebo najsť odborníka a aj pre tých ktorí chcú zvýšiť svoj príjem a mať viac zákazníkov a viac zákaziek počas celého roka. Registrujte sa zadarmo.
            </p>
          </div>

          {/* Mobile Layout */}
          <div className="sm:hidden space-y-2 mb-4">
            {/* Client Option - Mobile */}
            <div className="border-2 border-gray-200 rounded-l-lg rounded-r-2xl sm:rounded-lg p-3 hover:border-[#4169e1] transition-all duration-200 cursor-pointer group bg-gradient-to-br from-white to-gray-50">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-[#4169e1] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Search className="text-white" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold mb-0.5 text-gray-900">
                    {t.popup.clientOption.title}
                  </h3>
                  <p className="text-gray-600 text-xs leading-tight">
                    {t.popup.clientOption.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleOptionSelect('client')}
                disabled={!cookiesAccepted}
                className="w-full mt-2 bg-green-500 text-white py-2 rounded-l-lg rounded-r-2xl font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-xs shadow-md hover:shadow-lg"
              >
                {t.popup.clientOption.button}
              </button>
            </div>

            {/* Master Option - Mobile */}
            <div className="border-2 border-gray-200 rounded-l-lg rounded-r-2xl sm:rounded-lg p-3 hover:border-[#4169e1] transition-all duration-200 cursor-pointer group bg-gradient-to-br from-white to-gray-50">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-[#4169e1] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Users className="text-white" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold mb-0.5 text-gray-900">
                    {t.popup.masterOption.title}
                  </h3>
                  <p className="text-gray-600 text-xs leading-tight">
                    {t.popup.masterOption.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleOptionSelect('master')}
                disabled={!cookiesAccepted}
                className="w-full mt-2 bg-green-500 text-white py-2 rounded-l-lg rounded-r-2xl font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-xs shadow-md hover:shadow-lg"
              >
                {t.popup.masterOption.button}
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:grid grid-cols-2 gap-6 mb-8">
            {/* Client Option - Desktop */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#4169e1] transition-all duration-200 cursor-pointer group bg-gradient-to-br from-white to-gray-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#4169e1] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Search className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {t.popup.clientOption.title}
                </h3>
                <p className="text-gray-600 mb-4 text-base">
                  {t.popup.clientOption.description}
                </p>
                <button
                  onClick={() => handleOptionSelect('client')}
                  disabled={!cookiesAccepted}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-base shadow-md hover:shadow-lg"
                >
                  {t.popup.clientOption.button}
                </button>
              </div>
            </div>

            {/* Master Option - Desktop */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#4169e1] transition-all duration-200 cursor-pointer group bg-gradient-to-br from-white to-gray-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#4169e1] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {t.popup.masterOption.title}
                </h3>
                <p className="text-gray-600 mb-4 text-base">
                  {t.popup.masterOption.description}
                </p>
                <button
                  onClick={() => handleOptionSelect('master')}
                  disabled={!cookiesAccepted}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-base shadow-md hover:shadow-lg"
                >
                  {t.popup.masterOption.button}
                </button>
              </div>
            </div>
          </div>

          {/* Cookies Consent */}
          <div className="border-t pt-3 sm:pt-6 bg-white">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <input
                type="checkbox"
                id="cookies"
                checked={cookiesAccepted}
                onChange={(e) => setCookiesAccepted(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#4169e1] rounded focus:ring-[#4169e1] flex-shrink-0"
              />
              <label htmlFor="cookies" className="flex-1 text-xs sm:text-sm text-gray-600 cursor-pointer">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                  <Cookie size={10} className="sm:w-4 sm:h-4" />
                  <span className="font-medium">{t.popup.cookies}</span>
                </div>
                <a href="#" className="text-[#4169e1] hover:underline">
                  {t.popup.privacy}
                </a>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
