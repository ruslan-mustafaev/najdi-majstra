import React from 'react';
import { Search, Zap, Settings, Wrench } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../data/translations';
import { ChatWindow } from './AIChat/ChatWindow';
import { MasterRecommendations } from './AIChat/MasterRecommendations';
import { ServiceType } from './AIChat/types';
import { CustomSelect } from './CustomSelect';
import { 
  getCityOptions, 
  getProfessionOptions, 
  getAvailabilityOptions, 
  getExperienceOptions 
} from '../data/filterOptions';

interface MainSearchSectionProps {
  onSearch: (filters: {
    city: string;
    profession: string;
    availability: string;
    priceRange: string;
  }) => void;
  onMasterClick?: (masterId: string) => void;
}

export const MainSearchSection: React.FC<MainSearchSectionProps> = ({ onSearch, onMasterClick }) => {
  const { language } = useLanguage();
  const t = translations[language];
  
  const [filters, setFilters] = React.useState({
    city: '',
    profession: '',
    availability: '',
    experience: ''
  });

  const [openSelect, setOpenSelect] = React.useState<string | null>(null);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [currentServiceType, setCurrentServiceType] = React.useState<ServiceType>('urgent');
  const [recommendationsOpen, setRecommendationsOpen] = React.useState(false);
  const [recommendedMasterIds, setRecommendedMasterIds] = React.useState<string[]>([]);

  // Get filter options based on current language
  const cityOptions = getCityOptions(language);
  const professionOptions = getProfessionOptions(language);
  const availabilityOptions = getAvailabilityOptions(language);
  const experienceOptions = getExperienceOptions(language);

  const handleSelectToggle = (selectName: string, isOpen: boolean) => {
    if (isOpen) {
      setOpenSelect(selectName);
    } else {
      setOpenSelect(null);
    }
  };

  // Закрытие выпадающих списков при клике вне их
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.relative')) {
        setOpenSelect(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearch = () => {
    onSearch({
      city: filters.city,
      profession: filters.profession,
      availability: filters.availability,
      priceRange: filters.experience // Using experience as priceRange for now
    });
  };

  const handleServiceButtonClick = (serviceType: ServiceType) => {
    setCurrentServiceType(serviceType);
    setChatOpen(true);
  };

  const handleMasterRecommendation = (masterIds: string[]) => {
    setRecommendedMasterIds(masterIds);
    setRecommendationsOpen(true);
  };

  const handleRecommendedMasterClick = (masterId: string) => {
    setRecommendationsOpen(false);
    setChatOpen(false);
    // Find the master and call the parent's onMasterClick
    if (onMasterClick) {
      onMasterClick(masterId);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#4169e1] via-[#5a7bff] to-[#6c8cff] text-white py-16 pt-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {t.hero.title}
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              {t.hero.subtitle}
            </p>

            {/* Service Type Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button 
                onClick={() => handleServiceButtonClick('urgent')}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Zap size={20} />
                <span>{t.hero.urgentRepair}</span>
              </button>
              <button 
                onClick={() => handleServiceButtonClick('regular')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Settings size={20} />
                <span>{t.hero.regularService}</span>
              </button>
              <button 
                onClick={() => handleServiceButtonClick('realization')}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Wrench size={20} />
                <span>{t.hero.realization}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Filter Section */}
      <section className="bg-white py-8 shadow-md">
        <div className="container mx-auto px-4">
          <div className="relative bg-gray-50 rounded-2xl p-6 max-w-6xl mx-auto transition-all duration-500 group border-2 border-transparent hover:border-[#4169e1] hover:shadow-[8px_8px_24px_rgba(65,105,225,0.5)]">
            
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute -inset-x-20 -top-20 bottom-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-12 transform translate-x-[-200%] group-hover:translate-x-[400%] transition-transform duration-1000 ease-in-out"></div>
            </div>
            
            {/* Content wrapper */}
            <div className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <CustomSelect
                  label={t.search.city}
                  value={filters.city}
                  onChange={(value) => setFilters(prev => ({ ...prev, city: value }))}
                  options={cityOptions}
                  placeholder={`- ${t.search.city} -`}
                  isOpen={openSelect === 'city'}
                  onToggle={(isOpen) => handleSelectToggle('city', isOpen)}
                />
                
                <CustomSelect
                  label={t.search.profession}
                  value={filters.profession}
                  onChange={(value) => setFilters(prev => ({ ...prev, profession: value }))}
                  options={professionOptions}
                  placeholder={`- ${t.search.profession} -`}
                  isOpen={openSelect === 'profession'}
                  onToggle={(isOpen) => handleSelectToggle('profession', isOpen)}
                />
                
                <CustomSelect
                  label={t.search.availability}
                  value={filters.availability}
                  onChange={(value) => setFilters(prev => ({ ...prev, availability: value }))}
                  options={availabilityOptions}
                  placeholder={`- ${t.search.availability} -`}
                  isOpen={openSelect === 'availability'}
                  onToggle={(isOpen) => handleSelectToggle('availability', isOpen)}
                />
                
                <CustomSelect
                  label={language === 'sk' ? 'Odbornosť' : 'Expertise'}
                  value={filters.experience}
                  onChange={(value) => setFilters(prev => ({ ...prev, experience: value }))}
                  options={experienceOptions}
                  placeholder={language === 'sk' ? '- Odbornosť -' : '- Expertise -'}
                  isOpen={openSelect === 'experience'}
                  onToggle={(isOpen) => handleSelectToggle('experience', isOpen)}
                />
              </div>
              <div className="text-center">
                <button 
                  onClick={handleSearch}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Search size={20} />
                  <span>{t.search.searchButton}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chat Window */}
      <ChatWindow
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        serviceType={currentServiceType}
        onMasterRecommendation={handleMasterRecommendation}
      />

      {/* Master Recommendations */}
      <MasterRecommendations
        isOpen={recommendationsOpen}
        onClose={() => setRecommendationsOpen(false)}
        masterIds={recommendedMasterIds}
        onMasterClick={handleRecommendedMasterClick}
      />
    </>
  );
};