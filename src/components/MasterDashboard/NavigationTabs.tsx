import React from 'react';
import { User, Calendar, BarChart3, Settings } from 'lucide-react';

interface NavigationTabsProps {
  activeTab: 'profile' | 'schedule' | 'analytics' | 'settings';
  onTabChange: (tab: 'profile' | 'schedule' | 'analytics' | 'settings') => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'profile' as const, label: 'Profil', icon: User },
    { id: 'schedule' as const, label: 'Rozvrh', icon: Calendar },
    { id: 'analytics' as const, label: 'Štatistiky', icon: BarChart3 },
    { id: 'settings' as const, label: 'Nastavenia', icon: Settings }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">Navigácia</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                activeTab === tab.id
                  ? 'border-[#4169e1] bg-blue-50 text-[#4169e1]'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={24} />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};