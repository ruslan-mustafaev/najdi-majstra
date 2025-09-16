import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Upload, X, Play, Plus, Trash2, Camera, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ImageUpload } from './ImageUpload';
import { saveMasterProfile, MasterProfile } from '../lib/masterProfileApi';

interface MasterDashboardProps {
  onBack: () => void;
  onProfileUpdate: (profileData: any) => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({ onBack, onProfileUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<MasterProfile>({
    name: '',
    profession: '',
    email: user?.email || '',
    phone: '',
    location: '',
    description: '',
    profile_image_url: '',
    work_images_urls: [],
    work_video_url: '',
    is_active: true,
    profile_completed: false
  });

  const [workImages, setWorkImages] = useState<Array<{ url: string; path: string }>>([]);

  useEffect(() => {
    if (user?.user_metadata) {
      setProfileData(prev => ({
        ...prev,
        name: user.user_metadata.full_name || `${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`.trim(),
        email: user.email || '',
        phone: user.user_metadata.phone || '',
        location: user.user_metadata.location || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    setError(null);
  };

  const handleProfileImageUploaded = (url: string, path: string) => {
    setProfileData(prev => ({
      ...prev,
      profile_image_url: url
    }));
    setSuccess('Profilová fotka bola úspešne nahraná!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleWorkImageUploaded = (url: string, path: string) => {
    const newImage = { url, path };
    setWorkImages(prev => [...prev, newImage]);
    setProfileData(prev => ({
      ...prev,
      work_images_urls: [...(prev.work_images_urls || []), url]
    }));
    setSuccess('Obrázok práce bol úspešne nahraný!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleWorkImageRemoved = (path: string) => {
    setWorkImages(prev => {
      const updated = prev.filter(img => img.path !== path);
      setProfileData(prevData => ({
        ...prevData,
        work_images_urls: updated.map(img => img.url)
      }));
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validácia
      if (!profileData.name || !profileData.profession || !profileData.phone || !profileData.location) {
        throw new Error('Vyplňte všetky povinné polia');
      }

      // Označíme profil ako dokončený
      const completeProfileData = {
        ...profileData,
        profile_completed: true
      };

      console.log('Saving profile data:', completeProfileData);

      const savedProfile = await saveMasterProfile(completeProfileData);
      
      setSuccess('Profil bol úspešne uložený!');
      onProfileUpdate(savedProfile);
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (err) {
      console.error('Profile save error:', err);
      setError(err instanceof Error ? err.message : 'Nastala chyba pri ukladaní profilu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Späť na hlavnú stránku</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Môj profil majstra</h1>

            {/* Success Message */}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Základné informácie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Meno a priezvisko *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                    placeholder="Vaše celé meno"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Profesia *
                  </label>
                  <input
                    type="text"
                    name="profession"
                    value={profileData.profession}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                    placeholder="napr. Elektrikár, Vodoinštalatér"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 outline-none"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Telefón *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                    placeholder="+421 9xx xxx xxx"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Mesto/Región *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                    placeholder="napr. Bratislava, Košice"
                    required
                  />
                </div>
              </div>

              {/* Popis služieb */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Popis vašich služieb
                </label>
                <textarea
                  name="description"
                  value={profileData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                  placeholder="Opíšte svoje služby, skúsenosti a špecializáciu..."
                />
              </div>

              {/* Profilová fotka */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-4">
                  Profilová fotka
                </label>
                <div className="flex items-start space-x-6">
                  {profileData.profile_image_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={profileData.profile_image_url}
                        alt="Profilová fotka"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <ImageUpload
                      currentImageUrl={profileData.profile_image_url}
                      onImageUploaded={handleProfileImageUploaded}
                      folder="profiles"
                      className="max-w-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Obrázky prác */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-4">
                  Obrázky vašich prác (max 5)
                </label>
                <ImageUpload
                  onImageUploaded={handleWorkImageUploaded}
                  onImageRemoved={handleWorkImageRemoved}
                  folder="work-images"
                  multiple={true}
                  maxImages={5}
                  currentImages={workImages}
                />
              </div>

              {/* Video práce */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-4">
                  Video vašej práce (voliteľné)
                </label>
                <div className="space-y-4">
                  <input
                    type="url"
                    name="work_video_url"
                    value={profileData.work_video_url || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  
                  {profileData.work_video_url ? (
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <iframe
                        src={profileData.work_video_url.replace('watch?v=', 'embed/')}
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                        title="Video práce"
                      />
                    </div>
                  ) : (
                    <div className="text-center">
                      <Play size={32} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Žiadne video</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Nastavenia profilu */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Nastavenia profilu</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={profileData.is_active}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-[#4169e1] rounded focus:ring-[#4169e1]"
                    />
                    <span className="text-gray-700">Môj profil je aktívny a viditeľný pre klientov</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Zrušiť
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#4169e1] text-white rounded-lg hover:bg-[#3558d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Ukladám...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Uložiť profil</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};