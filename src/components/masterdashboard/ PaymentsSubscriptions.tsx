// components/masterdashboard/PaymentsSubscriptions.tsx

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const PaymentsSubscriptions: React.FC = () => {
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Platby a predplatné</h2>
      
      {/* Subscription Plans */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2">Využite teraz garantovanú dotovanú cenu</h3>
          <p className="text-gray-600">Nestratíte pozornosť a zákaziek bude viac.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Standard Plan */}
          <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 transition-colors">
            <div className="text-center">
              <h4 className="font-semibold text-lg mb-2">Štandard</h4>
              <div className="mb-3">
                <span className="text-gray-500 line-through text-sm">z 19,9€</span>
                <div className="text-2xl font-bold text-green-600">9,9€</div>
                <span className="text-sm text-gray-600">mesačne</span>
              </div>
              <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                Vybrať plán
              </button>
            </div>
          </div>

          {/* Professional Plan */}
          <div className="border-2 border-blue-500 rounded-xl p-4 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">Populárne</span>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-lg mb-2">Professional</h4>
              <div className="mb-3">
                <span className="text-gray-500 line-through text-sm">z 39,9€</span>
                <div className="text-2xl font-bold text-green-600">19,9€</div>
                <span className="text-sm text-gray-600">mesačne</span>
              </div>
              <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                Vybrať plán
              </button>
            </div>
          </div>

          {/* Professional + Expert Plan */}
          <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 transition-colors">
            <div className="text-center">
              <h4 className="font-semibold text-lg mb-2">Professional + Expert</h4>
              <p className="text-xs text-gray-600 mb-2">na zvyšovanie zisku</p>
              <div className="mb-3">
                <span className="text-gray-500 line-through text-sm">z 59€</span>
                <div className="text-2xl font-bold text-green-600">25,5€</div>
                <span className="text-sm text-gray-600">mesačne</span>
              </div>
              <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                Vybrať plán
              </button>
            </div>
          </div>

          {/* Premier Top Profi Plan */}
          <div className="border-2 border-yellow-400 rounded-xl p-4 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">VIP</span>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-lg mb-1">Premier Top Profi</h4>
              <p className="text-xs text-gray-600 mb-2">+osobný konzultant, budovanie firmy, automatizácia, koučing</p>
              <div className="mb-3">
                <span className="text-gray-500 line-through text-sm">z 9999€</span>
                <div className="text-2xl font-bold text-green-600">4979€</div>
                <span className="text-sm text-gray-600">mesačne</span>
              </div>
              <button className="w-full bg-yellow-400 text-black py-2 rounded-lg hover:bg-yellow-500 transition-colors font-semibold">
                Vybrať VIP plán
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Discount Coupons */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Zľavové kupóny</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-2xl font-bold text-green-600">25%</span>
                <p className="text-sm text-gray-600">zľava</p>
              </div>
              <button 
                onClick={() => handleCopyCoupon('SAVE25')}
                className="flex items-center space-x-2 bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors"
              >
                {copiedCoupon === 'SAVE25' ? <Check size={16} /> : <Copy size={16} />}
                <span className="text-sm">SAVE25</span>
              </button>
            </div>
          </div>
          
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-2xl font-bold text-blue-600">50%</span>
                <p className="text-sm text-gray-600">zľava</p>
              </div>
              <button 
                onClick={() => handleCopyCoupon('HALF50')}
                className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
              >
                {copiedCoupon === 'HALF50' ? <Check size={16} /> : <Copy size={16} />}
                <span className="text-sm">HALF50</span>
              </button>
            </div>
          </div>
          
          <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-2xl font-bold text-purple-600">100%</span>
                <p className="text-sm text-gray-600">zdarma</p>
              </div>
              <button 
                onClick={() => handleCopyCoupon('FREE100')}
                className="flex items-center space-x-2 bg-purple-500 text-white px-3 py-1 rounded-lg hover:bg-purple-600 transition-colors"
              >
                {copiedCoupon === 'FREE100' ? <Check size={16} /> : <Copy size={16} />}
                <span className="text-sm">FREE100</span>
              </button>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Automatické mesačné predplatné. Systém vám automaticky vyšle faktúru.
        </p>
      </div>
    </div>
  );
};