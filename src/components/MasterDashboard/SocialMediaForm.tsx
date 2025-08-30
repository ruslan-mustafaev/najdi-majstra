import React from 'react';
import { Edit2, Check, X, Facebook, Instagram, Linkedin, Youtube, Twitter } from 'lucide-react';

interface SocialMediaData {
  facebook: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  tiktok: string;
  twitter: string;
  telegram: string;
}

interface SocialMediaFormProps {
  socialMedia: SocialMediaData;
  editingField: string | null;
  onEdit: (field: string) => void;
  onSave: (field: string, value: any) => void;
  onCancel: () => void;
  onChange: (field: string, value: any) => void;
}

export const SocialMediaForm: React.FC<SocialMediaFormProps> = ({
  socialMedia,
  editingField,
  onEdit,
  onSave,
  onCancel,
  onChange
}) => {
  const socialPlatforms = [
    { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/vasprofil' },
    { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/vasprofil' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/vasprofil' },
    { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@vasprofil' },
    { key: 'twitter', label: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/vasprofil' },
    { key: 'tiktok', label: 'TikTok', icon: null, placeholder: 'https://tiktok.com/@vasprofil' },
    { key: 'telegram', label: 'Telegram', icon: null, placeholder: '@vasprofil' }
  ];

  const renderSocialField = (platform: typeof socialPlatforms[0]) => {
    const fieldKey = `contact.socialMedia.${platform.key}`;
    const value = socialMedia[platform.key] || '';
    const Icon = platform.icon;

    return (
      <div key={platform.key} className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            {Icon && <Icon size={16} />}
            <span>{platform.label}</span>
          </label>
          {editingField === fieldKey ? (
            <div className="flex space-x-2">
              <button
                onClick={() => onSave(fieldKey, value)}
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
              onClick={() => onEdit(fieldKey)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>
        
        {editingField === fieldKey ? (
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
            placeholder={platform.placeholder}
            autoFocus
          />
        ) : (
          <p className="text-gray-900 break-all">
            {value || 'Nie je zadané'}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sociálne siete</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {socialPlatforms.map(renderSocialField)}
      </div>
    </div>
  );
};