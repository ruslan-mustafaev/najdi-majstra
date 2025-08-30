import React from 'react';
import { User, MapPin, Phone, Mail, Globe, FileText, Clock, Euro, Users, Briefcase } from 'lucide-react';

interface ProfileFormData {
  name: string;
  profession: string;
  phone: string;
  location: string;
  description: string;
  experience: string;
  hourlyRate: string;
  teamSize: 'individual' | 'small-team';
  serviceTypes: string[];
  website: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    twitter: string;
    tiktok: string;
  };
  workRadius: string;
  services: string[];
  expertise: string[];
  languages: string[];
  certifications: string[];
  availability: string;
  workingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

interface ProfileFormProps {
  formData: ProfileFormData;
  onFormDataChange: (data: Partial<ProfileFormData>) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ formData, onFormDataChange }) => {
  const handleInputChange = (field: string, value: any) => {
    onFormDataChange({ [field]: value });
  };

  const handleNestedChange = (parent: string, field: string, value: string) => {
    onFormDataChange({
      [parent]: {
        ...formData[parent],
        [field]: value
      }
    });
  };

  const handleArrayChange = (field: string, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    onFormDataChange({ [field]: array });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-6">Základné informácie</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            <User size={16} className="inline mr-2" />
            Meno a priezvisko
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
            placeholder="Vaše meno a priezvisko"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            <Briefcase size={16} className="inline mr-2" />
            Profesia
          </label>
          <input
            type="text"
            value={formData.profession}
            onChange={(e) => handleInputChange('profession', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
            placeholder="Napr. Elektrikár, Vodoinštalatér"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            <Phone size={16} className="inline mr-2" />
            Telefón
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
            placeholder="+421 9xx xxx xxx"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            <MapPin size={16} className="inline mr-2" />
            Lokalita
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
            placeholder="Mesto, región"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            <Clock size={16} className="inline mr-2" />
            Skúsenosti
          </label>
          <select
            value={formData.experience}
            onChange={(e) => handleInputChange('experience', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
          >
            <option value="">Vyberte skúsenosti</option>
            <option value="1 rok">1 rok</option>
            <option value="2-3 roky">2-3 roky</option>
            <option value="5 rokov">5 rokov</option>
            <option value="viac ako 10 rokov">viac ako 10 rokov</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            <Euro size={16} className="inline mr-2" />
            Hodinová sadzba (€)
          </label>
          <input
            type="text"
            value={formData.hourlyRate}
            onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
            placeholder="25-45"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            <Users size={16} className="inline mr-2" />
            Veľkosť tímu
          </label>
          <select
            value={formData.teamSize}
            onChange={(e) => handleInputChange('teamSize', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
          >
            <option value="individual">Individuálne</option>
            <option value="small-team">Malý tím</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            <Globe size={16} className="inline mr-2" />
            Webstránka (voliteľné)
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
            placeholder="https://vasa-stranka.sk"
          />
        </div>
      </div>

      {/* Description */}
      <div className="mt-6">
        <label className="block text-gray-700 text-sm font-medium mb-2">
          <FileText size={16} className="inline mr-2" />
          Popis služieb
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
          placeholder="Opíšte svoje služby, skúsenosti a špecializáciu..."
        />
      </div>

      {/* Services */}
      <div className="mt-6">
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Služby (oddelené čiarkami)
        </label>
        <input
          type="text"
          value={formData.services.join(', ')}
          onChange={(e) => handleArrayChange('services', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
          placeholder="Inštalácie, Opravy, Servis, Pohotovosť"
        />
      </div>

      {/* Expertise */}
      <div className="mt-6">
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Špecializácia (oddelené čiarkami)
        </label>
        <input
          type="text"
          value={formData.expertise.join(', ')}
          onChange={(e) => handleArrayChange('expertise', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
          placeholder="LED osvetlenie, Inteligentné systémy, Rozvádzače"
        />
      </div>

      {/* Languages */}
      <div className="mt-6">
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Jazyky (oddelené čiarkami)
        </label>
        <input
          type="text"
          value={formData.languages.join(', ')}
          onChange={(e) => handleArrayChange('languages', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
          placeholder="Slovenčina, Čeština, Angličtina"
        />
      </div>

      {/* Certifications */}
      <div className="mt-6">
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Certifikáty (oddelené čiarkami)
        </label>
        <input
          type="text"
          value={formData.certifications.join(', ')}
          onChange={(e) => handleArrayChange('certifications', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
          placeholder="Elektrotechnická spôsobilosť, Certifikát BOZP"
        />
      </div>
    </div>
  );
};