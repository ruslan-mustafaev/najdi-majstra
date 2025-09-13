// components/masterdashboard/ProfileContact.tsx

import React from 'react';
import { Phone, Mail, Globe, Calendar, Clock } from 'lucide-react';
import { BaseProfileProps } from './types';

export const ProfileContact: React.FC<BaseProfileProps> = ({
  profileData,
  editingField,
  onFieldChange,
  onNestedFieldChange,
  onStartEditing,
  onSave,
  isSaving
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Kalendár a kontakt</h3>
        
        {/* Availability Schedule */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pracovný čas
          </label>
          {editingField === 'schedule' ? (
            <input
              type="text"
              placeholder="napr. 7:00 - 19:00 alebo Nonstop 24/7"
              value={profileData.availability.schedule}
              onChange={(e) => onNestedFieldChange('availability', 'schedule', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
            />
          ) : (
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
              onClick={() => onStartEditing('schedule')}
            >
              <Clock size={16} className="text-gray-500" />
              <span>{profileData.availability.schedule || 'Nevyplnené - kliknite pre úpravu'}</span>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefón
            </label>
            {editingField === 'phone' ? (
              <input
                type="tel"
                placeholder="+421 9xx xxx xxx"
                value={profileData.contact.phone}
                onChange={(e) => onNestedFieldChange('contact', 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
              />
            ) : (
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                onClick={() => onStartEditing('phone')}
              >
                <Phone size={16} className="text-gray-500" />
                <span>{profileData.contact.phone || 'Nevyplnené - kliknite pre úpravu'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            {editingField === 'email' ? (
              <input
                type="email"
                placeholder="vas@email.sk"
                value={profileData.contact.email}
                onChange={(e) => onNestedFieldChange('contact', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
              />
            ) : (
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                onClick={() => onStartEditing('email')}
              >
                <Mail size={16} className="text-gray-500" />
                <span>{profileData.contact.email || 'Nevyplnené - kliknite pre úpravu'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webstránka (voliteľné)
            </label>
            {editingField === 'website' ? (
              <input
                type="url"
                placeholder="www.vasa-stranka.sk"
                value={profileData.contact.website}
                onChange={(e) => onNestedFieldChange('contact', 'website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
              />
            ) : (
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                onClick={() => onStartEditing('website')}
              >
                <Globe size={16} className="text-gray-500" />
                <span>{profileData.contact.website || 'Nevyplnené - kliknite pre úpravu'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Calendar Preview */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Calendar size={16} className="text-gray-500" />
            <span className="text-sm font-medium">Kalendár dostupnosti</span>
          </div>
          <p className="text-xs text-gray-600">
            Detailný kalendár nájdete v záložke "Kalendár dostupnosti"
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onSave}
            disabled={isSaving}
            className="bg-[#4169e1] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#3558d4] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Ukladám...</span>
              </>
            ) : (
              <span>Uložiť rozvrh</span>
            )}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3">💡 Tipy pre úspech</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Kompletne vyplnený profil má 3x vyššiu šancu na zákazku</li>
          <li>• Kvalitné fotky zvyšujú dôveryhodnosť o 85%</li>
          <li>• Rýchla odpoveď (do 1h) zvyšuje úspešnosť o 60%</li>
          <li>• Pozitivné hodnotenia sú kľúčom k úspechu</li>
        </ul>
      </div>
    </div>
  );
};