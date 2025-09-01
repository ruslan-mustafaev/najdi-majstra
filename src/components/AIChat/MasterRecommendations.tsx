import React from 'react';
import { X, Star, MapPin, Phone } from 'lucide-react';
import { getTopRatedMasters } from '../../lib/mastersApi';
import { useLanguage } from '../../hooks/useLanguage';
import { translations } from '../../data/translations';

interface MasterRecommendationsProps {
  isOpen: boolean;
  onClose: () => void;
  masterIds: string[];
  onMasterClick: (masterId: string) => void;
}

export const MasterRecommendations: React.FC<MasterRecommendationsProps> = ({
  isOpen,
  onClose,
  masterIds,
  onMasterClick
}) => {
  const { language } = useLanguage();
  const t = translations.aiChat[language];
  
  if (!isOpen) return null;

  // For now, show empty state - will be implemented with real database
  const recommendedMasters: any[] = [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold">{t.recommendationsTitle}</h2>
            <p className="text-white/80 text-sm">
              {t.recommendationsSubtitle.replace('{count}', recommendedMasters.length.toString())}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Masters List */}
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {language === 'sk' 
                ? 'Odporúčania majstrov budú dostupné po implementácii vyhľadávania v databáze'
                : 'Master recommendations will be available after implementing database search'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};