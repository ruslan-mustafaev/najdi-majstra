import React from 'react';
import { Bell, Shield, CreditCard, HelpCircle } from 'lucide-react';

export const SettingsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Bell size={20} />
          <span>Notifikácie</span>
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email notifikácie</p>
              <p className="text-sm text-gray-600">Dostávať emaily o nových kontaktoch</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">SMS notifikácie</p>
              <p className="text-sm text-gray-600">Dostávať SMS o urgentných požiadavkách</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Shield size={20} />
          <span>Súkromie</span>
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Verejný profil</p>
              <p className="text-sm text-gray-600">Váš profil je viditeľný pre všetkých</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Zobraziť telefón</p>
              <p className="text-sm text-gray-600">Telefónne číslo viditeľné v profile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <CreditCard size={20} />
          <span>Predplatné</span>
        </h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">Štandardný plán</p>
              <p className="text-sm text-blue-700">Základné funkcie zadarmo</p>
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors">
              Upgradovať
            </button>
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <HelpCircle size={20} />
          <span>Pomoc a podpora</span>
        </h3>
        <div className="space-y-3">
          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <p className="font-medium text-gray-900">Často kladené otázky</p>
            <p className="text-sm text-gray-600">Odpovede na najčastejšie otázky</p>
          </button>
          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <p className="font-medium text-gray-900">Kontaktovať podporu</p>
            <p className="text-sm text-gray-600">Napíšte nám, ak potrebujete pomoc</p>
          </button>
          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <p className="font-medium text-gray-900">Návod na používanie</p>
            <p className="text-sm text-gray-600">Kompletný návod pre majstrov</p>
          </button>
        </div>
      </div>
    </div>
  );
};