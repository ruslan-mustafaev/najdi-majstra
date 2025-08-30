import React from 'react';
import { Bell, Shield, CreditCard, HelpCircle } from 'lucide-react';

export const SettingsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          <Bell size={20} className="mr-2 text-[#4169e1]" />
          Notifikácie
        </h3>
        <div className="space-y-4">
          {[
            { label: 'Nové kontakty od klientov', enabled: true },
            { label: 'Nové hodnotenia', enabled: true },
            { label: 'Pripomienky termínov', enabled: false },
            { label: 'Marketingové správy', enabled: false }
          ].map((setting, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">{setting.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={setting.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4169e1]"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          <Shield size={20} className="mr-2 text-[#4169e1]" />
          Súkromie a bezpečnosť
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Viditeľnosť profilu</h4>
            <p className="text-gray-600 text-sm mb-3">Kto môže vidieť váš profil a kontaktné údaje</p>
            <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none">
              <option>Všetci registrovaní používatelia</option>
              <option>Len overení klienti</option>
              <option>Len prémiový klienti</option>
            </select>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Zobrazenie telefónu</h4>
            <p className="text-gray-600 text-sm mb-3">Kedy sa zobrazí váš telefón klientom</p>
            <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none">
              <option>Okamžite po otvorení profilu</option>
              <option>Po kliknutí na "Kontakt"</option>
              <option>Len po registrácii klienta</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          <CreditCard size={20} className="mr-2 text-[#4169e1]" />
          Predplatné
        </h3>
        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-semibold text-blue-800">Štandardný plán</h4>
              <p className="text-blue-700 text-sm">Aktuálne aktívny plán</p>
            </div>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              AKTÍVNY
            </span>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Upgradovať na Premium
          </button>
        </div>
      </div>

      {/* Help */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          <HelpCircle size={20} className="mr-2 text-[#4169e1]" />
          Pomoc a podpora
        </h3>
        <div className="space-y-3">
          <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            📚 Návod na používanie
          </button>
          <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            💬 Kontaktovať podporu
          </button>
          <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            ❓ Často kladené otázky
          </button>
        </div>
      </div>
    </div>
  );
};