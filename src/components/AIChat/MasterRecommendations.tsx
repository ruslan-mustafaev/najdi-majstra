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
  const t = translations[language].aiChat;
  const [masters, setMasters] = React.useState([]);

  React.useEffect(() => {
    const loadMasters = async () => {
      const allMasters = await getTopRatedMasters();
      setMasters(allMasters);
    };
    if (isOpen) {
      loadMasters();
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  const recommendedMasters = masters.filter(master => 
    masterIds.includes(master.id)
  );

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedMasters.map((master) => (
              <div
                key={master.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onMasterClick(master.id)}
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={master.profileImage}
                    alt={master.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {master.name}
                    </h3>
                    <p className="text-[#4169e1] font-medium mb-2">
                      {master.profession}
                    </p>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin size={14} className="mr-1" />
                      <span>{master.location}</span>
                    </div>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="text-yellow-400 fill-current" size={16} />
                        <span className="font-medium">{master.rating}</span>
                        <span className="text-gray-500 text-sm">({master.reviewCount})</span>
                      </div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        master.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-1 ${
                          master.available ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        {master.available ? t.available : t.busy}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {master.services.slice(0, 3).map((service, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {master.experience}
                      </span>
                      <button className="bg-[#4169e1] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#3558d4] transition-colors flex items-center space-x-1">
                        <Phone size={14} />
                        <span>{t.contactButton}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};