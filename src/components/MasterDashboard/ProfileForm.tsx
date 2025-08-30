import React from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface ProfileData {
  name: string;
  profession: string;
  location: string;
  description: string;
  contact: {
    phone: string;
    email: string;
    website: string;
    socialMedia: {
      facebook: string;
      instagram: string;
      linkedin: string;
      youtube: string;
      tiktok: string;
      twitter: string;
      telegram: string;
    };
  };
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
  profileData: ProfileData;
  editingField: string | null;
  onEdit: (field: string) => void;
  onSave: (field: string, value: any) => void;
  onCancel: () => void;
  onChange: (field: string, value: any) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  profileData,
  editingField,
  onEdit,
  onSave,
  onCancel,
  onChange
}) => {
  const professionOptions = [
    'Elektrikár',
    'Vodoinštalatér', 
    'Plynár',
    'Maliar',
    'Murár',
    'Tesár',
    'Klampiar',
    'Podlahár',
    'Obkladač',
    'Sadrokartonista',
    'Kaderníčka',
    'Kozmetička',
    'Masér',
    'Automechanik',
    'Záhradník',
    'Upratovačka',
    'Interiérový dizajnér',
    'Bezpečnostné systémy',
    'Iné'
  ];

  const locationOptions = [
    'Bratislava',
    'Košice', 
    'Prešov',
    'Žilina',
    'Banská Bystrica',
    'Nitra',
    'Trnava',
    'Trenčín',
    'Martin',
    'Poprad',
    'Prievidza',
    'Zvolen',
    'Považská Bystrica',
    'Nové Zámky',
    'Michalovce',
    'Spišská Nová Ves',
    'Komárno',
    'Levice',
    'Liptovský Mikuláš',
    'Ružomberok',
    'Dolný Kubín',
    'Rimavská Sobota',
    'Lučenec',
    'Senica',
    'Dunajská Streda',
    'Bardejov',
    'Topoľčany',
    'Čadca',
    'Piešťany',
    'Trebišov',
    'Malacky',
    'Rožňava',
    'Turčianske Teplice',
    'Sobrance',
    'Gbely',
    'Skalica',
    'Námestovo',
    'Kežmarok',
    'Vysoké Tatry',
    'Spišské Podhradie',
    'Bojnice',
    'Rajecké Teplice',
    'Iné'
  ];

  const renderField = (
    label: string,
    field: string,
    value: string,
    type: 'text' | 'textarea' | 'select' = 'text',
    options?: string[]
  ) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {editingField === field ? (
          <div className="flex space-x-2">
            <button
              onClick={() => onSave(field, value)}
              className="text-green-600 hover:text-green-700"
            >
              <Check size={16} />
            </button>
            <button
              onClick={onCancel}
              className="text-red-600 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onEdit(field)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Edit2 size={16} />
          </button>
        )}
      </div>
      
      {editingField === field ? (
        type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
            rows={4}
            autoFocus
          />
        ) : type === 'select' ? (
          <select
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
            autoFocus
          >
            {options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
            autoFocus
          />
        )
      ) : (
        <p className="text-gray-900">{value || 'Nie je zadané'}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderField('Meno a priezvisko', 'name', profileData.name)}
        {renderField('Profesia', 'profession', profileData.profession, 'select', professionOptions)}
        {renderField('Mesto', 'location', profileData.location, 'select', locationOptions)}
        {renderField('Telefón', 'contact.phone', profileData.contact.phone)}
        {renderField('Email', 'contact.email', profileData.contact.email)}
        {renderField('Webstránka', 'contact.website', profileData.contact.website)}
      </div>
      
      <div>
        {renderField('Popis služieb', 'description', profileData.description, 'textarea')}
      </div>
    </div>
  );
};