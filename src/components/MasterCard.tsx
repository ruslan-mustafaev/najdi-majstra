import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { Master } from '../types';
import { ServiceIndicators, ServiceType } from './ServiceIndicators';

interface MasterCardProps {
  master: Master;
  featured?: boolean;
  onClick?: () => void;
}

export const MasterCard: React.FC<MasterCardProps> = ({ master, featured = false, onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  // Определяем какие индикаторы показывать
  const getServiceIndicators = () => {
    const services = master.emergencyServices || [];
    const indicators = [];
    
    if (services.includes('urgent')) {
      indicators.push({ color: 'bg-red-500', label: 'Akútna porucha' });
    }
    if (services.includes('regular')) {
      indicators.push({ color: 'bg-blue-500', label: 'Pravidelný servis' });
    }
    if (services.includes('realization')) {
      indicators.push({ color: 'bg-green-500', label: 'Plánovaná realizácia' });
    }
    
    return indicators;
  };

  // Генерируем разные комбинации индикаторов для демонстрации (макет)
  const getMockServiceTypes = (masterId: string): ServiceType[] => {
    const combinations: ServiceType[][] = [
      ['urgent'], // только аварийные
      ['regular'], // только сервис
      ['realization'], // только реализация
      ['urgent', 'regular'], // аварийные + сервис
      ['regular', 'realization'], // сервис + реализация
      ['urgent', 'realization'], // аварийные + реализация
      ['urgent', 'regular', 'realization'], // все три
      [], // без индикаторов
    ];
    
    // Используем ID мастера для получения стабильной комбинации
    const index = parseInt(masterId) % combinations.length;
    return combinations[index] || [];
  };

  const serviceTypes = getMockServiceTypes(master.id);
  const serviceIndicators = getServiceIndicators();

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer ${
        featured ? 'ring-2 ring-[#4169e1] ring-opacity-20' : ''
      }`}
      onClick={handleClick}
      style={{ height: '320px', width: '100%' }} // Принудительно задаем размеры
    >
      {/* Photo with availability indicator and rating */}
      <div className="relative" style={{ height: '180px' }}>
        <img
          src={master.profileImage}
          alt={master.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to default avatar if image fails to load
            e.currentTarget.src = '/placeholder-avatar.svg';
          }}
        />
        
        {/* Availability indicator */}
        <div className="absolute top-3 right-3">
          <div className={`w-4 h-4 rounded-full border-2 border-white ${
            master.available ? 'bg-green-500' : 'bg-red-500'
          }`} />
        </div>

        {/* Rating badge */}
        <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full flex items-center space-x-1">
          <Star className="text-yellow-400 fill-current" size={14} />
          <span className="font-medium text-sm">{master.rating}</span>
          <span className="text-xs">({master.reviewCount})</span>
        </div>

        {/* Service type indicators - новый компонент */}
        <div className="absolute bottom-3 left-3">
          <ServiceIndicators 
            services={serviceTypes}
            size="medium"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col justify-between" style={{ height: '140px' }}>
        {/* Title and location - fixed height */}
        <div style={{ height: '60px' }}>
          <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">
            {master.profession} - {master.name}
          </h3>
          <div className="flex items-center text-gray-600 text-xs">
            <MapPin size={12} className="mr-1 flex-shrink-0" />
            <span className="truncate">{master.location}</span>
          </div>
        </div>

        {/* Experience - fixed height */}
        <div className="text-center" style={{ height: '30px' }}>
          <div className="font-semibold text-[#4169e1] text-sm">
            {master.experience}
          </div>
        </div>
        
        {/* Button - fixed height */}
        <div style={{ height: '36px' }}>
          <button 
            className="w-full bg-[#4169e1] text-white py-2 rounded-lg font-medium hover:bg-[#3558d4] transition-colors text-sm"
            onClick={handleClick}
          >
            Zobraziť profil
          </button>
        </div>
      </div>
    </div>
  );
};