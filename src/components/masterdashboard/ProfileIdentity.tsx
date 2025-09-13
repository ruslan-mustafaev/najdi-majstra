// components/masterdashboard/ProfileIdentity.tsx

import React from 'react';
import { MapPin, Clock, Save, X } from 'lucide-react';
import { BaseProfileProps, PROFESSIONS, EXPERIENCE_LEVELS, SERVICE_TYPES } from './types';

export const ProfileIdentity: React.FC<BaseProfileProps> = ({
  profileData,
  editingField,
  hasChanges,
  onFieldChange,
  onNestedFieldChange,
  onStartEditing,
  onSave,
  onCancel
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Identita a detaily</h3>
        {hasChanges && (
          <div className="flex space-x-2">
            <button
              onClick={onSave}
              className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-1"
            >
              <Save size={16} />
              <span>Uložiť</span>
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-1"
            >
              <X size={16} />
              <span>Zrušiť</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Name & Profession */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meno a profesia
          </label>
          {editingField === 'name-profession' ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Vaše meno"
                value={profileData.name}
                onChange={(e) => onFieldChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
              />
              <select
                value={profileData.profession}
                onChange={(e) => onFieldChange('profession', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
              >
                <option value="">Vyberte profesiu</option>
                {PROFESSIONS.map(prof => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
            </div>
          ) : (
            <p 
              className="text-gray-900 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
              onClick={() => onStartEditing('name-profession')}
            >
              {profileData.profession && profileData.name 
                ? `${profileData.profession} - ${profileData.name}`
                : 'Nevyplnené - kliknite pre úpravu'
              }
            </p>
          )}
        </div>

        {/* Location & Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lokalita a dostupnosť
          </label>
          {editingField === 'location' ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Mesto/región"
                value={profileData.location}
                onChange={(e) => onFieldChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Pracovný rádius (napr. +50km)"
                value={profileData.workRadius}
                onChange={(e) => onFieldChange('workRadius', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
              />
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="available"
                  checked={profileData.availability.available}
                  onChange={(e) => onNestedFieldChange('availability', 'available', e.target.checked)}
                  className="w-4 h-4 text-[#4169e1] rounded focus:ring-[#4169e1]"
                />
                <label htmlFor="available" className="text-sm">Som momentálne dostupný</label>
              </div>
            </div>
          ) : (
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
              onClick={() => onStartEditing('location')}
            >
              <MapPin size={16} className="text-gray-500" />
              <span>{profileData.location || 'Nevyplnené - kliknite pre úpravu'}</span>
              <div className={`w-3 h-3 rounded-full ${
                profileData.availability.available ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>
          )}
        </div>

        {/* Social Media */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sociálne siete (voliteľné)
          </label>
          {editingField === 'social' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Facebook používateľ"
                  value={profileData.contact.socialMedia?.facebook || ''}
                  onChange={(e) => onNestedFieldChange('contact', 'socialMedia', {
                    ...profileData.contact.socialMedia,
                    facebook: e.target.value
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent text-sm"
                />
                <input
                  type="text"
                  placeholder="Instagram používateľ"
                  value={profileData.contact.socialMedia?.instagram || ''}
                  onChange={(e) => onNestedFieldChange('contact', 'socialMedia', {
                    ...profileData.contact.socialMedia,
                    instagram: e.target.value
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent text-sm"
                />
                <input
                  type="text"
                  placeholder="YouTube kanál"
                  value={profileData.contact.socialMedia?.youtube || ''}
                  onChange={(e) => onNestedFieldChange('contact', 'socialMedia', {
                    ...profileData.contact.socialMedia,
                    youtube: e.target.value
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent text-sm"
                />
                <input
                  type="text"
                  placeholder="TikTok používateľ"
                  value={profileData.contact.socialMedia?.tiktok || ''}
                  onChange={(e) => onNestedFieldChange('contact', 'socialMedia', {
                    ...profileData.contact.socialMedia,
                    tiktok: e.target.value
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent text-sm"
                />
              </div>
            </div>
          ) : (
            <div 
              className="cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
              onClick={() => onStartEditing('social')}
            >
              {profileData.contact.socialMedia && Object.values(profileData.contact.socialMedia).some(v => v) ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(profileData.contact.socialMedia).map(([platform, handle]) => (
                    handle && (
                      <span key={platform} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {platform}: @{handle}
                      </span>
                    )
                  ))}
                </div>
              ) : (
                <span className="text-gray-500">Nevyplnené - kliknite pre úpravu</span>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Čo robíte a ponúkate (max 1000 znakov)
          </label>
          <p className="text-sm text-gray-600 mb-2">
            1. Opíšte konkrétne to s čím viete pomôcť vašemu zákazníkovy.<br/>
            2. Vypíšte všetko čo robíte, všetky slová podľa ktorých<br/>
            by vás vedel váš zákazník vyhľadať
          </p>
          {editingField === 'description' ? (
            <textarea
              placeholder="Opíšte svoju prácu a služby..."
              value={profileData.description}
              onChange={(e) => onFieldChange('description', e.target.value)}
              maxLength={1000}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
            />
          ) : (
            <p 
              className="text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors min-h-[2.5rem]"
              onClick={() => onStartEditing('description')}
            >
              {profileData.description || 'Nevyplnené - kliknite pre úpravu'}
            </p>
          )}
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vek (voliteľné)
          </label>
          {editingField === 'age' ? (
            <input
              type="number"
              placeholder="Váš vek"
              min="18"
              max="80"
              value={profileData.age || ''}
              onChange={(e) => onFieldChange('age', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
            />
          ) : (
            <p 
              className="text-gray-900 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
              onClick={() => onStartEditing('age')}
            >
              {profileData.age ? `${profileData.age} rokov` : 'Nevyplnené - kliknite pre úpravu'}
            </p>
          )}
        </div>

        {/* Services */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Čo riešim
          </label>
          {editingField === 'services' ? (
            <div className="space-y-2">
              {SERVICE_TYPES.map(service => (
                <label key={service} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={profileData.serviceTypes.includes(service)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onFieldChange('serviceTypes', [...profileData.serviceTypes, service]);
                      } else {
                        onFieldChange('serviceTypes', profileData.serviceTypes.filter(s => s !== service));
                      }
                    }}
                    className="w-4 h-4 text-[#4169e1] rounded focus:ring-[#4169e1]"
                  />
                  <span className="text-sm">{service}</span>
                </label>
              ))}
            </div>
          ) : (
            <p 
              className="text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
              onClick={() => onStartEditing('services')}
            >
              {profileData.serviceTypes.length > 0 
                ? profileData.serviceTypes.join(', ')
                : 'Nevyplnené - kliknite pre úpravu'
              }
            </p>
          )}
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ako dlho to robím
          </label>
          {editingField === 'experience' ? (
            <select
              value={profileData.experience}
              onChange={(e) => onFieldChange('experience', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
            >
              <option value="">Vyberte skúsenosti</option>
              {EXPERIENCE_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          ) : (
            <p 
              className="text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
              onClick={() => onStartEditing('experience')}
            >
              {profileData.experience || 'Nevyplnené - kliknite pre úpravu'}
            </p>
          )}
        </div>

        {/* Team Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tím
          </label>
          {editingField === 'team' ? (
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="teamSize"
                  value="individual"
                  checked={profileData.teamSize === 'individual'}
                  onChange={(e) => onFieldChange('teamSize', e.target.value as 'individual' | 'small-team')}
                  className="w-4 h-4 text-[#4169e1] focus:ring-[#4169e1]"
                />
                <span className="text-sm">Som sám jednotlivec</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="teamSize"
                  value="small-team"
                  checked={profileData.teamSize === 'small-team'}
                  onChange={(e) => onFieldChange('teamSize', e.target.value as 'individual' | 'small-team')}
                  className="w-4 h-4 text-[#4169e1] focus:ring-[#4169e1]"
                />
                <span className="text-sm">Som jednotlivec s partiou (2-3 členov)</span>
              </label>
            </div>
          ) : (
            <p 
              className="text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
              onClick={() => onStartEditing('team')}
            >
              {profileData.teamSize === 'individual' ? 'Jednotlivec' : 'Malý tím'}
            </p>
          )}
        </div>

        {/* Hourly Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hodinová sadzba
          </label>
          {editingField === 'hourlyRate' ? (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="25"
                value={profileData.hourlyRate}
                onChange={(e) => onFieldChange('hourlyRate', e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
              />
              <span className="text-gray-600">€/hod</span>
            </div>
          ) : (
            <p 
              className="text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
              onClick={() => onStartEditing('hourlyRate')}
            >
              {profileData.hourlyRate ? `${profileData.hourlyRate} €/hod` : 'Nevyplnené - kliknite pre úpravu'}
            </p>
          )}
          <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-800">
              💡 <strong>AI Tip:</strong> Odporúčaná cena pre vašu oblasť: 25-45 €/hod
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};