import React from 'react';
import { Star, MapPin, Globe } from 'lucide-react';
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

  const getServiceTypes = (): ServiceType[] => {
    const types: ServiceType[] = [];

    if (master.serviceUrgent) {
      types.push('urgent');
    }
    if (master.serviceRegular) {
      types.push('regular');
    }
    if (master.serviceRealization) {
      types.push('realization');
    }

    return types;
  };

  const serviceTypes = getServiceTypes();

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer ${
        featured ? 'ring-2 ring-[#4169e1] ring-opacity-20' : ''
      }`}
      onClick={handleClick}
    >
      {/* Photo with availability indicator and rating */}
      <div className="relative" style={{ height: '180px' }}>
        <img
          src={master.profileImage}
          alt={master.name}
          className="w-full h-full object-cover object-center bg-gray-100"
          onError={(e) => {
            // Fallback to default avatar if image fails to load
            e.currentTarget.src = '/placeholder-avatar.svg';
          }}
        />
        
        {/* Availability indicator or Globe icon for work abroad */}
        <div className="absolute top-3 right-3">
          {master.workAbroad ? (
            <div className="relative group">
              <Globe size={18} className="text-[#4169e1] drop-shadow-lg" />
              <div className="absolute top-full right-0 mt-2 bg-black/90 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Ochotný pracovať v zahraničí
              </div>
            </div>
          ) : (
            <div className={`w-4 h-4 rounded-full border-2 border-white ${
              master.available ? 'bg-green-500' : 'bg-red-500'
            }`} />
          )}
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
      <div className="p-3 flex flex-col justify-between">
        {/* Title and location - fixed height */}
        <div className="mb-3">
          <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">
            {master.profession} - {master.name}
          </h3>
          <div className="flex items-center text-gray-600 text-xs">
            <MapPin size={12} className="mr-1 flex-shrink-0" />
            <span className="truncate">{master.location}</span>
          </div>
        </div>

        {/* Experience - fixed height */}
        <div className="text-center mb-2">
          <div className="font-semibold text-[#4169e1] text-sm">
            {master.experience}
          </div>
        </div>

        {/* Button - fixed height */}
        <div>
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