import React from 'react';
import { useEffect } from 'react';
import { ArrowLeft, Filter } from 'lucide-react';
import { Master } from '../types';
import { MasterCard } from './MasterCard';
import { NoResults } from './NoResults';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../data/translations';

interface SearchResultsProps {
  masters: Master[];
  filters: {
    city: string;
    profession: string;
    availability: string;
    priceRange: string;
  };
  onBack: () => void;
  onMasterClick: (master: Master) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ 
  masters, 
  filters, 
  onBack, 
  onMasterClick 
}) => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { language } = useLanguage();
  const t = translations[language];

  const getFilterSummary = () => {
    const activeFilters = [];
    if (filters.city && filters.city !== `- ${t.search.city} -`) activeFilters.push(filters.city);
    if (filters.profession && filters.profession !== `- ${t.search.profession} -`) activeFilters.push(filters.profession);
    if (filters.availability && filters.availability !== `- ${t.search.availability} -`) activeFilters.push(filters.availability);
    if (filters.priceRange && filters.priceRange !== `- ${t.search.priceRange} -`) activeFilters.push(filters.priceRange);
    
    return activeFilters.length > 0 ? activeFilters.join(', ') : 
      (language === 'sk' ? 'Všetky kategórie' : 'All categories');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>{language === 'sk' ? 'Späť na hlavnú stránku' : 'Back to main page'}</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'sk' ? 'Výsledky vyhľadávania' : 'Search Results'}
              </h1>
              <div className="flex items-center space-x-2 text-gray-600 mt-2">
                <Filter size={16} />
                <span className="text-sm">{getFilterSummary()}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {language === 'sk' ? 'Nájdených' : 'Found'}: <span className="font-semibold">{masters.length}</span> {language === 'sk' ? 'majstrov' : 'masters'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {masters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {masters.map((master) => (
              <MasterCard
                key={master.id}
                master={master}
                onClick={() => onMasterClick(master)}
              />
            ))}
          </div>
        ) : (
          <NoResults />
        )}
      </div>
    </div>
  );
};