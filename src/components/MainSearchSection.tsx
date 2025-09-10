import React from 'react';
import { Search, Zap, Settings, Wrench, ChevronDown } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../data/translations';
import { ChatWindow } from './AIChat/ChatWindow';
import { MasterRecommendations } from './AIChat/MasterRecommendations';
import { ServiceType } from './AIChat/types';

interface MainSearchSectionProps {
  onSearch: (filters: {
    city: string;
    profession: string;
    availability: string;
    priceRange: string;
  }) => void;
  onMasterClick?: (masterId: string) => void;
}

const CustomSelect = ({ label, value, onChange, options, placeholder, isOpen, onToggle }) => {
  const handleSelect = (optionValue) => {
    const option = options.find(opt => opt.value === optionValue);
    if (!option?.isRegion) {
      onChange(optionValue);
      onToggle(false);
    }
  };

  return (
    <div className="relative">
      <label className="block text-gray-700 text-sm font-medium mb-2">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400 hover:shadow-md text-left flex justify-between items-center"
          onClick={() => onToggle(!isOpen)}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value || placeholder}
          </span>
          <ChevronDown 
            size={16} 
            className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={index}
                type="button"
                className={`w-full px-4 py-2 text-left transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg ${
                  option.isRegion 
                    ? 'font-bold text-gray-900 bg-gray-100 cursor-default' 
                    : 'hover:bg-blue-50 hover:text-[#4169e1] pl-8'
                }`}
                onClick={() => handleSelect(option.value)}
                disabled={option.isRegion}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const MainSearchSection: React.FC<MainSearchSectionProps> = ({ onSearch, onMasterClick }) => {
  const { language } = useLanguage();
  const t = translations[language];
  
  const [filters, setFilters] = React.useState({
    city: '',
    profession: '',
    availability: '',
    experience: ''
  });

  const [openSelect, setOpenSelect] = React.useState(null);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [currentServiceType, setCurrentServiceType] = React.useState<ServiceType>('urgent');
  const [recommendationsOpen, setRecommendationsOpen] = React.useState(false);
  const [recommendedMasterIds, setRecommendedMasterIds] = React.useState<string[]>([]);

  const handleSelectToggle = (selectName, isOpen) => {
    if (isOpen) {
      setOpenSelect(selectName);
    } else {
      setOpenSelect(null);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setOpenSelect(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearch = () => {
    onSearch(filters);
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
    if (onMasterClick) {
      onMasterClick(masterId);
    }
  };

  const cityOptions = [
    { value: '', label: `- ${t.search.city} -`, isRegion: false },
    { value: 'Banskobystrický kraj', label: 'Banskobystrický kraj', isRegion: false },
    { value: 'Bratislavský kraj', label: 'Bratislavský kraj', isRegion: false },
    { value: 'Košický kraj', label: 'Košický kraj', isRegion: false },
    { value: 'Nitriansky kraj', label: 'Nitriansky kraj', isRegion: false },
    { value: 'Prešovský kraj', label: 'Prešovský kraj', isRegion: false },
    { value: 'Trenčiansky kraj', label: 'Trenčiansky kraj', isRegion: false },
    { value: 'Trnavský kraj', label: 'Trnavský kraj', isRegion: false },
    { value: 'Žilinský kraj', label: 'Žilinský kraj', isRegion: false },
    { value: 'region-bb', label: 'Banskobystrický kraj - mestá', isRegion: true },
    { value: 'Banská Bystrica', label: 'Banská Bystrica', isRegion: false },
    { value: 'Fiľakovo', label: 'Fiľakovo', isRegion: false },
    { value: 'Lučenec', label: 'Lučenec', isRegion: false },
    { value: 'Rimavská Sobota', label: 'Rimavská Sobota', isRegion: false },
    { value: 'Zvolen', label: 'Zvolen', isRegion: false },
    { value: 'region-ba', label: 'Bratislavský kraj - mestá', isRegion: true },
    { value: 'Bratislava', label: 'Bratislava', isRegion: false },
    { value: 'Bratislava - Devín', label: 'Bratislava - Devín', isRegion: false },
    { value: 'Bratislava - Devínska Nová Ves', label: 'Bratislava - Devínska Nová Ves', isRegion: false },
    { value: 'Malacky', label: 'Malacky', isRegion: false },
    { value: 'Pezinok', label: 'Pezinok', isRegion: false },
    { value: 'Senec', label: 'Senec', isRegion: false },
    { value: 'region-ke', label: 'Košický kraj - mestá', isRegion: true },
    { value: 'Košice', label: 'Košice', isRegion: false },
    { value: 'Michalovce', label: 'Michalovce', isRegion: false },
    { value: 'Rožňava', label: 'Rožňava', isRegion: false },
    { value: 'Spišská Nová Ves', label: 'Spišská Nová Ves', isRegion: false },
    { value: 'Trebišov', label: 'Trebišov', isRegion: false },
    { value: 'region-nr', label: 'Nitriansky kraj - mestá', isRegion: true },
    { value: 'Nitra', label: 'Nitra', isRegion: false },
    { value: 'Komárno', label: 'Komárno', isRegion: false },
    { value: 'Levice', label: 'Levice', isRegion: false },
    { value: 'Nové Zámky', label: 'Nové Zámky', isRegion: false },
    { value: 'Topoľčany', label: 'Topoľčany', isRegion: false },
    { value: 'region-po', label: 'Prešovský kraj - mestá', isRegion: true },
    { value: 'Prešov', label: 'Prešov', isRegion: false },
    { value: 'Bardejov', label: 'Bardejov', isRegion: false },
    { value: 'Humenné', label: 'Humenné', isRegion: false },
    { value: 'Poprad', label: 'Poprad', isRegion: false },
    { value: 'Stará Ľubovňa', label: 'Stará Ľubovňa', isRegion: false },
    { value: 'Svidník', label: 'Svidník', isRegion: false },
    { value: 'region-tn', label: 'Trenčiansky kraj - mestá', isRegion: true },
    { value: 'Trenčín', label: 'Trenčín', isRegion: false },
    { value: 'Bánovce nad Bebravou', label: 'Bánovce nad Bebravou', isRegion: false },
    { value: 'Myjava', label: 'Myjava', isRegion: false },
    { value: 'Partizánske', label: 'Partizánske', isRegion: false },
    { value: 'Považská Bystrica', label: 'Považská Bystrica', isRegion: false },
    { value: 'Prievidza', label: 'Prievidza', isRegion: false },
    { value: 'region-tt', label: 'Trnavský kraj - mestá', isRegion: true },
    { value: 'Trnava', label: 'Trnava', isRegion: false },
    { value: 'Dunajská Streda', label: 'Dunajská Streda', isRegion: false },
    { value: 'Galanta', label: 'Galanta', isRegion: false },
    { value: 'Hlohovec', label: 'Hlohovec', isRegion: false },
    { value: 'Piešťany', label: 'Piešťany', isRegion: false },
    { value: 'Senica', label: 'Senica', isRegion: false },
    { value: 'region-za', label: 'Žilinský kraj - mestá', isRegion: true },
    { value: 'Žilina', label: 'Žilina', isRegion: false },
    { value: 'Bytča', label: 'Bytča', isRegion: false },
    { value: 'Čadca', label: 'Čadca', isRegion: false },
    { value: 'Dolný Kubín', label: 'Dolný Kubín', isRegion: false },
    { value: 'Liptovský Mikuláš', label: 'Liptovský Mikuláš', isRegion: false },
    { value: 'Martin', label: 'Martin', isRegion: false },
    { value: 'Námestovo', label: 'Námestovo', isRegion: false },
    { value: 'Ružomberok', label: 'Ružomberok', isRegion: false },
    { value: 'Turčianske Teplice', label: 'Turčianske Teplice', isRegion: false }
  ];

  const professionOptions = [
    { value: '', label: `- ${t.search.profession} -` },
    { value: 'region-projektove', label: '1. Projektové profesie', isRegion: true },
    { value: 'Architekt', label: 'Architekt', isRegion: false },
    { value: 'Stavebný inžinier', label: 'Stavebný inžinier', isRegion: false },
    { value: 'Statik', label: 'Statik', isRegion: false },
    { value: 'Projektant TZB', label: 'Projektant TZB', isRegion: false },
    { value: 'Projektant dopravných stavieb / Inžinier pre vonkajšie plochy', label: 'Projektant dopravných stavieb / Inžinier pre vonkajšie plochy', isRegion: false },
    { value: 'Špecialista OZE', label: 'Špecialista OZE', isRegion: false },
    { value: 'Geodet', label: 'Geodet', isRegion: false },
    { value: 'Rozpočtár', label: 'Rozpočtár', isRegion: false },
    { value: 'Interiérový dizajnér', label: 'Interiérový dizajnér', isRegion: false },
    { value: 'Technik pre inžinierske siete', label: 'Technik pre inžinierske siete', isRegion: false },
    { value: 'Projektant vonkajších rozvodov', label: 'Projektant vonkajších rozvodov', isRegion: false },
    { value: 'region-dozorne', label: '2. Dozorné a manažérske profesie', isRegion: true },
    { value: 'Stavebník / Investor', label: 'Stavebník / Investor', isRegion: false },
    { value: 'Projektový manažér', label: 'Projektový manažér', isRegion: false },
    { value: 'Stavbyvedúci', label: 'Stavbyvedúci', isRegion: false },
    { value: 'Stavebný dozor', label: 'Stavebný dozor', isRegion: false },
    { value: 'Koordinátor BOZP', label: 'Koordinátor BOZP', isRegion: false },
    { value: 'Právnik pre stavebné právo', label: 'Právnik pre stavebné právo', isRegion: false },
    { value: 'region-interier', label: '3. Profesie pre interiér', isRegion: true },
    { value: 'Inštalatér', label: 'Inštalatér', isRegion: false },
    { value: 'Elektrikár', label: 'Elektrikár', isRegion: false },
    { value: 'Sadrokartonista', label: 'Sadrokartonista', isRegion: false },
    { value: 'Omietkar', label: 'Omietkar', isRegion: false },
    { value: 'Maliar / Natierač', label: 'Maliar / Natierač', isRegion: false },
    { value: 'Obkladač', label: 'Obkladač', isRegion: false },
    { value: 'Podlahár', label: 'Podlahár', isRegion: false },
    { value: 'Stolár / Interiérový montážnik', label: 'Stolár / Interiérový montážnik', isRegion: false },
    { value: 'Štukatér', label: 'Štukatér', isRegion: false },
    { value: 'Kameník', label: 'Kameník', isRegion: false },
    { value: 'region-exterier', label: '4. Profesie pre exteriér', isRegion: true },
    { value: 'Bagrista / Zemné práce', label: 'Bagrista / Zemné práce', isRegion: false },
    { value: 'Murár', label: 'Murár', isRegion: false },
    { value: 'Tesár', label: 'Tesár', isRegion: false },
    { value: 'Elektrikár (exteriér)', label: 'Elektrikár', isRegion: false },
    { value: 'Betonár', label: 'Betonár', isRegion: false },
    { value: 'Klampiar / Pokrývač', label: 'Klampiar / Pokrývač', isRegion: false },
    { value: 'Fasádnik / Izolatér', label: 'Fasádnik / Izolatér', isRegion: false },
    { value: 'Okenár / Dvereár', label: 'Okenár / Dvereár', isRegion: false },
    { value: 'Stavebný zámočník', label: 'Stavebný zámočník', isRegion: false },
    { value: 'Dláždič / Cestár', label: 'Dláždič / Cestár', isRegion: false },
    { value: 'Terénny úpravca / Záhradník', label: 'Terénny úpravca / Záhradník', isRegion: false },
    { value: 'region-specializacie', label: '5. Profesie a špecializácie', isRegion: true },
    { value: 'Technik pre inteligentné domácnosti', label: 'Technik pre inteligentné domácnosti', isRegion: false },
    { value: 'Špecialista na obnoviteľné zdroje energie', label: 'Špecialista na obnoviteľné zdroje energie', isRegion: false },
    { value: 'Akustický inžinier', label: 'Akustický inžinier', isRegion: false },
    { value: 'Revízny technik', label: 'Revízny technik', isRegion: false },
    { value: 'Fotovoltik / Montážnik', label: 'Fotovoltik / Montážnik', isRegion: false }
  ];

  const availabilityOptions = [
    { value: '', label: `- ${t.search.availability} -` },
    { value: 'Dostupný teraz', label: 'Dostupný teraz' },
    { value: 'Tento týždeň', label: 'Tento týždeň' },
    { value: 'Tento mesiac', label: 'Tento mesiac' }
  ];

  const experienceOptions = [
    { value: '', label: '- Odbornosť -' },
    { value: '1 rok a viac', label: '1 rok a viac' },
    { value: '3 roky a viac', label: '3 roky a viac' },
    { value: '5 rokov a viac', label: '5 rokov a viac' },
    { value: '10 rokov a viac', label: '10 rokov a viac' },
    { value: '20 rokov a viac', label: '20 rokov a viac' }
  ];

  return (
    <>
      <section className="relative text-white py-16 pt-32 overflow-hidden">
        <div className="absolute inset-0 animate-smooth-gradient"></div>
        
        <div className="container mx-auto px-4">
          <style jsx>{`
            @keyframes smooth-gradient {
              0% {
                background: linear-gradient(45deg, #4169e1, #5a7bff, #6c8cff, #7a9dff, #4169e1);
                background-size: 600% 600%;
                background-position: 0% 0%;
              }
              50% {
                background: linear-gradient(45deg, #4169e1, #5a7bff, #6c8cff, #7a9dff, #4169e1);
                background-size: 600% 600%;
                background-position: 100% 100%;
              }
              100% {
                background: linear-gradient(45deg, #4169e1, #5a7bff, #6c8cff, #7a9dff, #4169e1);
                background-size: 600% 600%;
                background-position: 0% 0%;
              }
            }

            .animate-smooth-gradient {
              animation: smooth-gradient 30s ease infinite;
            }
          `}</style>
          <div className="text-center max-w-4xl mx-auto mb-12 relative z-10">
            <h2 className="relative z-10 text-4xl md:text-5xl font-bold mb-6 leading-tight drop-shadow-lg">
              {t.hero.title}
            </h2>
            <p className="relative z-10 text-xl md:text-2xl text-white/90 mb-8 drop-shadow-md">
              {t.hero.subtitle}
            </p>

            <div className="relative z-10 flex flex-wrap justify-center gap-4 mb-12">
              <button 
                onClick={() => handleServiceButtonClick('urgent')}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 backdrop-blur-sm border border-white/10"
              >
                <Zap size={20} />
                <span>{t.hero.urgentRepair}</span>
              </button>
              <button 
                onClick={() => handleServiceButtonClick('regular')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 backdrop-blur-sm border border-white/10"
              >
                <Settings size={20} />
                <span>{t.hero.regularService}</span>
              </button>
              <button 
                onClick={() => handleServiceButtonClick('realization')}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 backdrop-blur-sm border border-white/10"
              >
                <Wrench size={20} />
                <span>{t.hero.realization}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8 shadow-md">
        <div className="container mx-auto px-4">
          <div className="relative bg-gray-50 rounded-2xl p-6 max-w-6xl mx-auto transition-all duration-500 group border-2 border-transparent hover:border-[#4169e1] hover:shadow-[8px_8px_24px_rgba(65,105,225,0.5)]">
            
            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute -inset-x-20 -top-20 bottom-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-12 transform translate-x-[-200%] group-hover:translate-x-[400%] transition-transform duration-1000 ease-in-out"></div>
            </div>
            
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
                  label="Odbornosť"
                  value={filters.experience}
                  onChange={(value) => setFilters(prev => ({ ...prev, experience: value }))}
                  options={experienceOptions}
                  placeholder="- Odbornosť -"
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

      <ChatWindow
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        serviceType={currentServiceType}
        onMasterRecommendation={handleMasterRecommendation}
      />

      <MasterRecommendations
        isOpen={recommendationsOpen}
        onClose={() => setRecommendationsOpen(false)}
        masterIds={recommendedMasterIds}
        onMasterClick={handleRecommendedMasterClick}
      />
    </>
  );
};