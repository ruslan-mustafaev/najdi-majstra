import React from 'react';
import { SearchX } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../data/translations';

export const NoResults: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center max-w-2xl mx-auto my-8">
      <SearchX className="mx-auto text-yellow-600 mb-4" size={48} />
      <h3 className="text-xl font-semibold text-yellow-800 mb-2">
        {t.search.noResults}
      </h3>
      <p className="text-yellow-700">
        {language === 'sk' 
          ? 'Možno ste náročný, skontrolujte filter a skúste ubrať nejakú požiadavku.'
          : 'Maybe you are too demanding, check the filter and try to remove some requirement.'
        }
      </p>
    </div>
  );
};