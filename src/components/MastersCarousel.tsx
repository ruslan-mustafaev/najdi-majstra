import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { MasterCard } from './MasterCard';
import { Master } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../data/translations';

interface MastersCarouselProps {
  masters: Master[];
  title: string;
  onMasterClick?: (master: Master) => void;
}

export const MastersCarousel: React.FC<MastersCarouselProps> = ({ masters, title, onMasterClick }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { language } = useLanguage();
  const t = translations[language];

  const itemsPerPage = 25; // 5x5 grid
  const totalPages = Math.ceil(masters.length / itemsPerPage);

  const getCurrentPageMasters = () => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return masters.slice(startIndex, endIndex);
  };

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  // Handle mouse wheel scroll
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      // Scroll down - next page
      nextPage();
    } else {
      // Scroll up - previous page  
      prevPage();
    }
  };
  // Auto-rotate pages
  useEffect(() => {
    if (totalPages <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentPage(prev => (prev >= totalPages - 1 ? 0 : prev + 1));
    }, 8000);

    return () => clearInterval(interval);
  }, [totalPages]);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {totalPages > 1 && (
            <div className="flex flex-col space-y-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50"
              >
                <ChevronUp size={24} />
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage >= totalPages - 1}
                className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50"
              >
                <ChevronDown size={24} />
              </button>
            </div>
          )}
        </div>

        {/* 5x5 Grid */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 h-[600px] overflow-y-auto transition-all duration-300 pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-600"
          onWheel={(e) => {
            // Allow native scroll behavior for this container
            e.stopPropagation();
          }}
          style={{
            gridAutoRows: '320px' // Принудительно задаем высоту всех строк
          }}
        >
          {getCurrentPageMasters().map((master) => (
            <MasterCard 
              key={master.id}
              master={master} 
              featured={master.rating > 9}
              onClick={() => onMasterClick?.(master)}
            />
          ))}
        </div>

        {/* Page indicator */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 hover:scale-125 ${
                  index === currentPage ? 'bg-[#4169e1]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* Page info */}
        {totalPages > 1 && (
          <div className="text-center mt-4 text-gray-600 bg-white/50 backdrop-blur-sm rounded-lg py-2 px-4 inline-block mx-auto">
            <span className="text-sm">
              Stránka {currentPage + 1} z {totalPages} 
              ({masters.length} {language === 'sk' ? 'majstrov celkom' : 'masters total'})
            </span>
            <div className="text-xs text-gray-500 mt-1">
              💡 Použite koliesko myši pre listovanie
            </div>
          </div>
        )}
      </div>
    </section>
  );
};