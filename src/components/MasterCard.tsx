import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { Master } from '../types';

interface MasterCardProps {
  master: Master;
  featured?: boolean;
  onClick?: () => void;
}

export const MasterCard: React.FC<MasterCardProps> = ({ master, featured = false, onClick }) => {
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Button clicked for master:', master.id, master.name);
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer ${
        featured ? 'ring-2 ring-[#4169e1] ring-opacity-20' : ''
      }`}
      onClick={onClick}
      style={{ height: '320px', width: '100%' }} // Принудительно задаем размеры
    >
      {/* Photo with availability indicator and rating */}
      <div className="relative" style={{ height: '180px' }}>
        <img
          src={master.profileImage}
          alt={master.name}
          className="w-full h-full object-cover"
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
            onClick={handleButtonClick}
          >
            Zobraziť profil
          </button>
        </div>
      </div>
    </div>
  );
};