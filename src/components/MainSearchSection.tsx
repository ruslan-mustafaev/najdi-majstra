import React, { useState, useRef, useEffect } from 'react';
import { Search, Zap, Settings, Wrench, ChevronDown } from 'lucide-react';

// Компонент дышащего градиента
const BreathingGradient = () => {
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
      className="absolute inset-0 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <style>
        {`
          .breathing-bg {
            animation: containerPulse 4s ease-in-out infinite;
          }

          .gradient-overlay {
            animation: breathingGlow 3s ease-in-out infinite;
          }

          .wave-layer-1 {
            animation: waveMotion1 5s ease-in-out infinite;
          }

          .wave-layer-2 {
            animation: waveMotion2 4s ease-in-out infinite reverse;
          }

          .wave-layer-3 {
            animation: waveMotion3 6s ease-in-out infinite;
          }

          .inner-glow {
            animation: innerGlow 3.5s ease-in-out infinite;
          }

          @keyframes containerPulse {
            0%, 100% { 
              transform: scale(1);
              box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
            }
            50% { 
              transform: scale(1.02);
              box-shadow: 0 0 50px rgba(147, 51, 234, 0.5);
            }
          }

          @keyframes breathingGlow {
            0%, 100% {
              opacity: 0.8;
              transform: scale(1) rotate(0deg);
            }
            50% {
              opacity: 1;
              transform: scale(1.05) rotate(2deg);
            }
          }

          @keyframes waveMotion1 {
            0%, 100% {
              transform: translateX(-10%) translateY(-5%) rotate(0deg) scale(1);
              opacity: 0.6;
            }
            33% {
              transform: translateX(5%) translateY(-10%) rotate(3deg) scale(1.1);
              opacity: 0.8;
            }
            66% {
              transform: translateX(-5%) translateY(5%) rotate(-2deg) scale(0.95);
              opacity: 0.7;
            }
          }

          @keyframes waveMotion2 {
            0%, 100% {
              transform: translateX(5%) translateY(10%) rotate(0deg) scale(1);
              opacity: 0.5;
            }
            50% {
              transform: translateX(-10%) translateY(-5%) rotate(-4deg) scale(1.15);
              opacity: 0.7;
            }
          }

          @keyframes waveMotion3 {
            0%, 100% {
              transform: translateX(0%) translateY(-8%) rotate(0deg) scale(1);
              opacity: 0.4;
            }
            25% {
              transform: translateX(8%) translateY(3%) rotate(2deg) scale(1.05);
              opacity: 0.6;
            }
            75% {
              transform: translateX(-3%) translateY(8%) rotate(-3deg) scale(0.9);
              opacity: 0.5;
            }
          }

          @keyframes innerGlow {
            0%, 100% {
              transform: scale(1);
              opacity: 0.6;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.9;
            }
          }
        `}
      </style>
      
      <div className="absolute inset-0 breathing-bg">
        {/* Базовый градиент */}
        <div 
          className="absolute inset-0 gradient-overlay transition-all duration-300 ease-out"
          style={{
            background: `radial-gradient(ellipse 120% 80% at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.8) 0%, rgba(147, 51, 234, 0.6) 30%, rgba(236, 72, 153, 0.4) 60%, rgba(59, 130, 246, 0.2) 100%)`,
            filter: 'blur(1px)'
          }}
        />
        
        {/* Волновые слои */}
        <div 
          className="absolute inset-0 wave-layer-1"
          style={{
            width: '120%',
            height: '120%',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.2) 50%, rgba(236, 72, 153, 0.1) 100%)',
            borderRadius: '50%',
            filter: 'blur(2px)',
            transformOrigin: 'center',
            transform: `translate(${offsetX * 20}px, ${offsetY * 20}px) scale(${1 + intensity * 0.1}) rotate(${offsetX * 5}deg)`
          }}
        />
        
        <div 
          className="absolute wave-layer-2"
          style={{
            top: '10%',
            left: '10%',
            width: '100%',
            height: '100%',
            background: `radial-gradient(ellipse ${100 + intensity * 20}% ${100 + intensity * 15}% at ${mousePosition.x}% ${mousePosition.y}%, rgba(147, 51, 234, ${0.4 + intensity * 0.1}) 0%, rgba(59, 130, 246, 0.2) 40%, transparent 80%)`,
            borderRadius: '40%',
            filter: 'blur(3px)',
            transform: `translate(${offsetX * 15}px, ${offsetY * 15}px) rotate(${offsetY * 8}deg) scale(${1 + intensity * 0.15})`
          }}
        />
        
        <div 
          className="absolute wave-layer-3"
          style={{
            top: '-10%',
            left: '-10%',
            width: '120%',
            height: '120%',
            background: `linear-gradient(${45 + offsetX * 30}deg, rgba(236, 72, 153, ${0.2 + intensity * 0.1}) 0%, rgba(59, 130, 246, ${0.3 + intensity * 0.1}) 50%, rgba(147, 51, 234, 0.1) 100%)`,
            borderRadius: '60%',
            filter: 'blur(4px)',
            transform: `translate(${offsetX * 10}px, ${offsetY * 10}px) rotate(${offsetY * -6}deg) scale(${1 + intensity * 0.08})`
          }}
        />
        
        {/* Внутреннее свечение */}
        <div 
          className="absolute inner-glow transition-all duration-300"
          style={{
            top: '15%',
            left: '15%',
            width: '70%',
            height: '70%',
            background: `radial-gradient(ellipse ${100 + intensity * 40}% ${100 + intensity * 30}% at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 255, 255, ${0.1 + intensity * 0.15}) 0%, rgba(147, 51, 234, ${0.3 + intensity * 0.2}) 30%, rgba(59, 130, 246, 0.2) 70%, transparent 100%)`,
            borderRadius: '50%',
            filter: 'blur(1px)',
            transform: `translate(${offsetX * 30}px, ${offsetY * 30}px) scale(${1 + intensity * 0.4}) rotate(${offsetX * 10}deg)`
          }}
        />
      </div>
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
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const sectionRef = useRef(null);
  
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

  const handleMouseMove = (e) => {
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setMousePosition({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 50, y: 50 });
  };

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
      <section 
        ref={sectionRef}
        className="relative text-white py-16 pt-32 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Дышащий градиент как фон */}
        <BreathingGradient onMouseMove={mousePosition} />
        
        <div className="container mx-auto px-4 relative z-10" style={{ pointerEvents: 'none' }}>
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
                style={{ pointerEvents: 'auto' }}
              >
                <Zap size={20} />
                <span>Urgentná oprava</span>
              </button>
              <button 
                onClick={() => handleServiceButtonClick('regular')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 backdrop-blur-sm border border-white/10"
                style={{ pointerEvents: 'auto' }}
              >
                <Settings size={20} />
                <span>Pravidelná služba</span>
              </button>
              <button 
                onClick={() => handleServiceButtonClick('realization')}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 backdrop-blur-sm border border-white/10"
                style={{ pointerEvents: 'auto' }}
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