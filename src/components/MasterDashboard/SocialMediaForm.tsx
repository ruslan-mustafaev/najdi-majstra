import React from 'react';
import { Facebook, Instagram, Linkedin, Youtube, Twitter, MessageCircle } from 'lucide-react';

interface SocialMediaData {
  facebook: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  twitter: string;
  tiktok: string;
}

interface SocialMediaFormProps {
  socialMedia: SocialMediaData;
  onSocialMediaChange: (platform: string, value: string) => void;
}

export const SocialMediaForm: React.FC<SocialMediaFormProps> = ({ socialMedia, onSocialMediaChange }) => {
  const socialPlatforms = [
    { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/vasprofil', color: 'text-blue-600' },
    { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/vasprofil', color: 'text-pink-600' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/vasprofil', color: 'text-blue-700' },
    { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@vasprofil', color: 'text-red-600' },
    { key: 'twitter', label: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/vasprofil', color: 'text-blue-400' },
    { key: 'tiktok', label: 'TikTok', icon: MessageCircle, placeholder: 'https://tiktok.com/@vasprofil', color: 'text-black' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-6">Sociálne siete</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {socialPlatforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <div key={platform.key}>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                <Icon size={16} className={`inline mr-2 ${platform.color}`} />
                {platform.label}
              </label>
              <input
                type="url"
                value={socialMedia[platform.key]}
                onChange={(e) => onSocialMediaChange(platform.key, e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                placeholder={platform.placeholder}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};