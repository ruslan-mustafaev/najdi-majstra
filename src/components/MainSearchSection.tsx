import React, { useState, useRef, useEffect } from 'react';
import { Search, Zap, Settings, Wrench, ChevronDown } from 'lucide-react';

// Компонент интерактивного градиента
const InteractiveGradient = () => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 50, y: 50 });
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-102"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
          #4169e1 0%, 
          #5a7bff 25%, 
          #6c8cff 50%, 
          #7a9dff 75%, 
          #4169e1 100%)`
      }}
    >
      {/* Дополнительный слой для глубины */}
      <div 
        className="absolute inset-0 opacity-60 transition-all duration-500"
        style={{
          background: `radial-gradient(ellipse 80% 60% at ${mousePosition.x}% ${mousePosition.y}%, 
            rgba(255, 255, 255, 0.2) 0%, 
            rgba(65, 105, 225, 0.3) 30%, 
            transparent 70%)`
        }}
      />
    </div>
  );
};

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

export const MainSearchSection = ({ onSearch, onMasterClick }) => {
  const [filters, setFilters] = useState({
    city: '',
    profession: '',
    availability: '',
    experience: ''
  });

  const [openSelect, setOpenSelect] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [currentServiceType, setCurrentServiceType] = useState('urgent');
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  const [recommendedMasterIds, setRecommendedMasterIds] = useState([]);

  const handleSelectToggle = (selectName, isOpen) => {
    if (isOpen) {
      setOpenSelect(selectName);
    } else {
      setOpenSelect(null);
    }
  };

  useEffect(() => {
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

  const handleServiceButtonClick = (serviceType) => {
    setCurrentServiceType(serviceType);
    setChatOpen(true);
  };

  const cityOptions = [
    { value: '', label: '- Vyberte mesto -', isRegion: false },
    { value: 'Bratislava', label: 'Bratislava', isRegion: false },
    { value: 'Košice', label: 'Košice', isRegion: false },
    { value: 'Prešov', label: 'Prešov', isRegion: false },
  ];

  const professionOptions = [
    { value: '', label: '- Vyberte profesiu -' },
    { value: 'Elektrikár', label: 'Elektrikár', isRegion: false },
    { value: 'Inštalatér', label: 'Inštalatér', isRegion: false },
    { value: 'Murár', label: 'Murár', isRegion: false },
  ];

  const availabilityOptions = [
    { value: '', label: '- Dostupnosť -' },
    { value: 'Dostupný teraz', label: 'Dostupný teraz' },
    { value: 'Tento týždeň', label: 'Tento týždeň' },
    { value: 'Tento mesiac', label: 'Tento mesiac' }
  ];

  const experienceOptions = [
    { value: '', label: '- Odbornosť -' },
    { value: '1 rok a viac', label: '1 rok a viac' },
    { value: '3 roky a viac', label: '3 roky a viac' },
    { value: '5 rokov a viac', label: '5 rokov a viac' },
  ];

  return (
    <>
      <section className="relative text-white py-16 pt-32 overflow-hidden">
        {/* Интерактивный градиент как фон */}
        <InteractiveGradient />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight drop-shadow-lg">
              Nájdite kvalitných remeselníkov
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-md">
              Rýchlo, spoľahlivo, overené
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button 
                onClick={() => handleServiceButtonClick('urgent')}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 backdrop-blur-sm border border-white/10"
              >
                <Zap size={20} />
                <span>Urgentná oprava</span>
              </button>
              <button 
                onClick={() => handleServiceButtonClick('regular')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 backdrop-blur-sm border border-white/10"
              >
                <Settings size={20} />
                <span>Pravidelná služba</span>
              </button>
              <button 
                onClick={() => handleServiceButtonClick('realization')}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 backdrop-blur-sm border border-white/10"
              >
                <Wrench size={20} />
                <span>Realizácia</span>
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
                  label="Mesto"
                  value={filters.city}
                  onChange={(value) => setFilters(prev => ({ ...prev, city: value }))}
                  options={cityOptions}
                  placeholder="- Vyberte mesto -"
                  isOpen={openSelect === 'city'}
                  onToggle={(isOpen) => handleSelectToggle('city', isOpen)}
                />
                
                <CustomSelect
                  label="Profesia"
                  value={filters.profession}
                  onChange={(value) => setFilters(prev => ({ ...prev, profession: value }))}
                  options={professionOptions}
                  placeholder="- Vyberte profesiu -"
                  isOpen={openSelect === 'profession'}
                  onToggle={(isOpen) => handleSelectToggle('profession', isOpen)}
                />
                
                <CustomSelect
                  label="Dostupnosť"
                  value={filters.availability}
                  onChange={(value) => setFilters(prev => ({ ...prev, availability: value }))}
                  options={availabilityOptions}
                  placeholder="- Dostupnosť -"
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
                  <span>Hľadať</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};