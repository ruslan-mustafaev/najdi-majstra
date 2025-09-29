import React, { useState, useRef, useEffect } from 'react';
import { Zap, Settings, Wrench } from 'lucide-react';
import { CustomSelect } from './CustomSelect';
import { ChatWindow } from './AIChat/ChatWindow';
import { getCityOptions, getProfessionOptions, getAvailabilityOptions, getExperienceOptions } from '../data/filterOptions';
import { useLanguage } from '../hooks/useLanguage';

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
            transform: `translate(${(mousePosition.x - 50) * 0.05}px, ${(mousePosition.y - 50) * 0.05}px)`
          }}
        />
        
        <div 
          className="absolute wave-layer-2"
          style={{
            top: '10%',
            left: '10%',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 30% 70%, rgba(147, 51, 234, 0.4) 0%, rgba(59, 130, 246, 0.2) 40%, transparent 80%)',
            borderRadius: '40%',
            filter: 'blur(3px)',
            transform: `translate(${(mousePosition.x - 50) * 0.03}px, ${(mousePosition.y - 50) * 0.03}px)`
          }}
        />
        
        <div 
          className="absolute wave-layer-3"
          style={{
            top: '-10%',
            left: '-10%',
            width: '120%',
            height: '120%',
            background: 'linear-gradient(45deg, rgba(236, 72, 153, 0.2) 0%, rgba(59, 130, 246, 0.3) 50%, rgba(147, 51, 234, 0.1) 100%)',
            borderRadius: '60%',
            filter: 'blur(4px)',
            transform: `translate(${(mousePosition.x - 50) * 0.02}px, ${(mousePosition.y - 50) * 0.02}px)`
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
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(147, 51, 234, 0.3) 30%, rgba(59, 130, 246, 0.2) 70%, transparent 100%)',
            borderRadius: '50%',
            filter: 'blur(1px)',
            transform: `translate(${(mousePosition.x - 50) * 0.1}px, ${(mousePosition.y - 50) * 0.1}px) scale(${1 + (Math.max(0.3, 1 - Math.sqrt(Math.pow(mousePosition.x - 50, 2) + Math.pow(mousePosition.y - 50, 2)) / 100)) * 0.3})`
          }}
        />
      </div>
    </div>
  );
};

interface MainSearchSectionProps {
  onFiltersChange: (filters: any) => void;
  onMasterClick: (masterId: string) => void;
}

export const MainSearchSection: React.FC<MainSearchSectionProps> = ({ onFiltersChange, onMasterClick }) => {
  const { language } = useLanguage();
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
  const [selectedServiceType, setSelectedServiceType] = useState<'urgent' | 'regular' | 'realization'>('urgent');

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

  // ИСПРАВЛЕНО: Вызываем onFiltersChange только при реальном изменении фильтров
  useEffect(() => {
    // Проверяем, есть ли реальные изменения в фильтрах
    const hasActiveFilters = filters.city || filters.profession || filters.availability || filters.experience;
    if (hasActiveFilters) {
      onFiltersChange(filters);
    }
  }, [filters.city, filters.profession, filters.availability, filters.experience]); // Убрали onFiltersChange из зависимостей!

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleServiceButtonClick = (serviceType: string) => {
    console.log('Service type selected:', serviceType);
    setSelectedServiceType(serviceType as 'urgent' | 'regular' | 'realization');
    setChatOpen(true);
  };

  // Получаем опции фильтров
  const cityOptions = getCityOptions(language);
  const professionOptions = getProfessionOptions(language);
  const availabilityOptions = getAvailabilityOptions(language);
  const experienceOptions = getExperienceOptions(language);

  return (
    <>
      <section 
        ref={sectionRef}
        className="relative text-white py-16 pt-32 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Дышащий градиент как фон */}
        <BreathingGradient />
        
        <div className="container mx-auto px-4 relative z-10" style={{ pointerEvents: 'none' }}>
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight drop-shadow-lg">
              Najväčší slovenský predajca majstrov a expertov v stavebníctve
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-md">
              Rýchlo, lacno a jednoducho nájdite kvalifikovaného odborníka zo svojej lokality
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button 
                onClick={() => handleServiceButtonClick('urgent')}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 backdrop-blur-sm border border-white/10"
                style={{ pointerEvents: 'auto' }}
              >
                <Zap size={20} />
                <span>Akútna porucha</span>
              </button>
              <button 
                onClick={() => handleServiceButtonClick('regular')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 backdrop-blur-sm border border-white/10"
                style={{ pointerEvents: 'auto' }}
              >
                <Settings size={20} />
                <span>Pravidelný servis</span>
              </button>
              <button 
                onClick={() => handleServiceButtonClick('realization')}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 backdrop-blur-sm border border-white/10"
                style={{ pointerEvents: 'auto' }}
              >
                <Wrench size={20} />
                <span>Plánovaná realizácia</span>
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
                  label={language === 'sk' ? 'Mesto' : 'City'}
                  value={filters.city}
                  onChange={(value) => handleFilterChange('city', value)}
                  options={cityOptions}
                  placeholder={language === 'sk' ? '- Mesto -' : '- City -'}
                  isOpen={openSelect === 'city'}
                  onToggle={(isOpen) => handleSelectToggle('city', isOpen)}
                />
                
                <CustomSelect
                  label={language === 'sk' ? 'Profesia' : 'Profession'}
                  value={filters.profession}
                  onChange={(value) => handleFilterChange('profession', value)}
                  options={professionOptions}
                  placeholder={language === 'sk' ? '- Profesia -' : '- Profession -'}
                  isOpen={openSelect === 'profession'}
                  onToggle={(isOpen) => handleSelectToggle('profession', isOpen)}
                />
                
                <CustomSelect
                  label={language === 'sk' ? 'Dostupnosť' : 'Availability'}
                  value={filters.availability}
                  onChange={(value) => handleFilterChange('availability', value)}
                  options={availabilityOptions}
                  placeholder={language === 'sk' ? '- Dostupnosť -' : '- Availability -'}
                  isOpen={openSelect === 'availability'}
                  onToggle={(isOpen) => handleSelectToggle('availability', isOpen)}
                />
                
                <CustomSelect
                  label={language === 'sk' ? 'Skúsenosti' : 'Experience'}
                  value={filters.experience}
                  onChange={(value) => handleFilterChange('experience', value)}
                  options={experienceOptions}
                  placeholder={language === 'sk' ? '- Skúsenosti -' : '- Experience -'}
                  isOpen={openSelect === 'experience'}
                  onToggle={(isOpen) => handleSelectToggle('experience', isOpen)}
                />
              </div>
              
              {/* Информация о мгновенном поиске */}
              <div className="text-center text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                <p>
                  {language === 'sk' 
                    ? '🔍 Výsledky sa zobrazujú automaticky pri výbere filtrov'
                    : '🔍 Results are displayed automatically when selecting filters'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chat Window */}
      <ChatWindow
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        serviceType={selectedServiceType}
        onMasterRecommendation={(masterIds) => {
          console.log('Recommended masters:', masterIds);
          // Здесь можно добавить логику для отображения рекомендованных мастеров
        }}
      />
    </>
  );
};