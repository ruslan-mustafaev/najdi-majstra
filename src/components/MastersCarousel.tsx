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
  const [showAll, setShowAll] = useState(false);
  const { language } = useLanguage();

  const itemsPerPage = 25;
  const totalPages = Math.ceil(masters.length / itemsPerPage);

  const getCurrentPageMasters = () => {
    if (showAll) {
      return masters;
    }
    const endIndex = itemsPerPage;
    return masters.slice(0, endIndex);
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

  // Reset to first page when masters change
  useEffect(() => {
    setCurrentPage(0);
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
        {!showAll && masters.length > itemsPerPage && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowAll(true)}
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