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

export const WelcomePopup: React.FC<WelcomePopupProps> = ({ 
  isOpen, 
  onClose, 
  onUserTypeSelect, 
  onAuthRequired 
}) => {
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md sm:max-w-3xl mx-auto relative animate-in zoom-in-95 duration-300 shadow-2xl max-h-[95vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
        >
          <X size={16} className="text-gray-600" />
        </button>

        <div className="p-6 sm:p-10">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#4169e1] to-[#6366f1] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Users className="text-white" size={28} />
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
              {t.popup.title}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Выберите тип аккаунта для продолжения работы с платформой
            </p>
          </div>

          {/* Options - Mobile Layout */}
          <div className="sm:hidden space-y-4 mb-6">
            {/* Client Option - Mobile */}
            <div 
              className="relative overflow-hidden border-2 border-gray-200 rounded-2xl hover:border-[#4169e1] transition-all duration-300 cursor-pointer group bg-gradient-to-br from-white via-gray-50 to-blue-50/30 hover:shadow-lg"
              onClick={() => cookiesAccepted && handleOptionSelect('client')}
            >
              <div className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4169e1] to-[#6366f1] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-md">
                    <Search className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {t.popup.clientOption.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-snug">
                      Ищите услуги мастеров
                    </p>
                  </div>
                </div>
                <button
                  disabled={!cookiesAccepted}
                  className="w-full mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-base shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:hover:scale-100"
                >
                  {t.popup.clientOption.button}
                </button>
              </div>
            </div>

            {/* Master Option - Mobile */}
            <div 
              className="relative overflow-hidden border-2 border-gray-200 rounded-2xl hover:border-[#4169e1] transition-all duration-300 cursor-pointer group bg-gradient-to-br from-white via-gray-50 to-purple-50/30 hover:shadow-lg"
              onClick={() => cookiesAccepted && handleOptionSelect('master')}
            >
              <div className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8b5cf6] to-[#a855f7] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-md">
                    <Users className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {t.popup.masterOption.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-snug">
                      Предлагайте свои услуги
                    </p>
                  </div>
                </div>
                <button
                  disabled={!cookiesAccepted}
                  className="w-full mt-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-base shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:hover:scale-100"
                >
                  {t.popup.masterOption.button}
                </button>
              </div>
            </div>
          </div>

          {/* Options - Desktop Layout */}
          <div className="hidden sm:grid grid-cols-2 gap-8 mb-8">
            {/* Client Option - Desktop */}
            <div 
              className="relative overflow-hidden border-2 border-gray-200 rounded-3xl hover:border-[#4169e1] transition-all duration-300 cursor-pointer group bg-gradient-to-br from-white via-gray-50 to-blue-50/30 hover:shadow-2xl"
              onClick={() => cookiesAccepted && handleOptionSelect('client')}
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#4169e1] to-[#6366f1] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                  <Search className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  {t.popup.clientOption.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Найдите идеального мастера для ваших задач
                </p>
                <button
                  disabled={!cookiesAccepted}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100"
                >
                  {t.popup.clientOption.button}
                </button>
              </div>
              {/* Decorative element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            </div>

            {/* Master Option - Desktop */}
            <div 
              className="relative overflow-hidden border-2 border-gray-200 rounded-3xl hover:border-[#4169e1] transition-all duration-300 cursor-pointer group bg-gradient-to-br from-white via-gray-50 to-purple-50/30 hover:shadow-2xl"
              onClick={() => cookiesAccepted && handleOptionSelect('master')}
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#8b5cf6] to-[#a855f7] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                  <Users className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  {t.popup.masterOption.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Развивайте свой бизнес и привлекайте новых клиентов
                </p>
                <button
                  disabled={!cookiesAccepted}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100"
                >
                  {t.popup.masterOption.button}
                </button>
              </div>
              {/* Decorative element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            </div>
          </div>

          {/* Registration promo */}
          <div className="text-center mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-gray-100">
            <p className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed">
              {t.popup.registrationPromo}
            </p>
          </div>

          {/* Cookies Consent */}
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="relative">
                <input
                  type="checkbox"
                  id="cookies"
                  checked={cookiesAccepted}
                  onChange={(e) => setCookiesAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 sm:w-6 sm:h-6 text-[#4169e1] rounded-md focus:ring-[#4169e1] focus:ring-2 border-2 border-gray-300 cursor-pointer"
                />
              </div>
              <label htmlFor="cookies" className="flex-1 cursor-pointer">
                <div className="flex items-center space-x-2 mb-2">
                  <Cookie size={16} className="sm:w-5 sm:h-5 text-[#4169e1]" />
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">
                    {t.popup.cookies}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Нажимая продолжить, вы соглашаетесь с использованием файлов cookie и{' '}
                  <a 
                    href="#" 
                    className="text-[#4169e1] hover:underline font-medium"
                  >
                    {t.popup.privacy}
                  </a>
                </p>
              </label>
            </div>
          </div>

          {/* Helper text */}
          {!cookiesAccepted && (
            <div className="mt-4 text-center">
              <p className="text-xs sm:text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                ⚠️ Примите соглашение с файлами cookie для продолжения
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};