import React from 'react';
import { User, BarChart3, Settings, ArrowLeft } from 'lucide-react';

interface NavigationTabsProps {
  activeTab: 'profile' | 'analytics' | 'settings';
  onTabChange: (tab: 'profile' | 'analytics' | 'settings') => void;
  onBack: () => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  onBack
}) => {
  const tabs = [
    { id: 'profile' as const, label: 'Profil', icon: User },
    { id: 'analytics' as const, label: 'Analytika', icon: BarChart3 },
    { id: 'settings' as const, label: 'Nastavenia', icon: Settings }
  ];

  return (
    <div className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Späť na hlavnú stránku</span>
        </button>
        
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-[#4169e1] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};