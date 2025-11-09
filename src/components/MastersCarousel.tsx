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
  const [visibleCount, setVisibleCount] = useState(25);
  const { language } = useLanguage();

  const itemsPerPage = 25;

  const getCurrentPageMasters = () => {
    return masters.slice(0, visibleCount);
  };

  const showMore = () => {
    setVisibleCount(prev => prev + itemsPerPage);
  };

  // Reset visible count when masters change
  useEffect(() => {
    setVisibleCount(25);
  }, [masters]);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        </div>

        {/* Grid - 2 columns on mobile, 5 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {getCurrentPageMasters().map((master) => (
            <MasterCard
              key={master.id}
              master={master}
              featured={master.rating > 9}
              onClick={() => {
                console.log('MasterCard onClick triggered for:', master.id);
                onMasterClick?.(master);
              }}
            />
          ))}
        </div>

        {/* Show more button */}
        {visibleCount < masters.length && (
          <div className="flex justify-center mt-8">
            <button
              onClick={showMore}
              className="px-8 py-3 bg-[#4169e1] text-white rounded-lg font-medium hover:bg-[#3558d4] transition-colors"
            >
              Zobraziť viac
            </button>
          </div>
        )}
      </div>
    </section>
  );
};