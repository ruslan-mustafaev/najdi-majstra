import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export const LanguageSwitcher: React.FC = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="relative inline-block">
      <button
        onClick={() => changeLanguage(language === 'sk' ? 'en' : 'sk')}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 text-white border border-white/20"
      >
        <Globe size={16} />
        <span className="text-sm font-medium uppercase">
          {language.toUpperCase()}
        </span>
      </button>
    </div>
  );
};