import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, MapPin, Phone, Mail, FileText, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { saveMasterProfile, MasterProfile } from '../lib/masterProfileApi';
import { PhotoUpload } from './PhotoUpload';
import { supabase } from '../lib/supabase';

interface MasterDashboardProps {
  onBack: () => void;
  onProfileUpdate?: (profileData: any) => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({ onBack, onProfileUpdate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [profileData, setProfileData] = useState<MasterProfile>({
    name: '',
    profession: '',
    email: user?.email || '',
    phone: '',
    location: '',
    description: '',
    is_active: true,
    profile_completed: false,
    profilePhoto: '',
    workPhotos: []
  });

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        console.log('Loading profile for user:', user.id);
        
        const { data, error } = await supabase
          .from('masters')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.log('No existing profile found, creating new:', error);
          // No existing profile - use default values with user email
          setProfileData(prev => ({
            ...prev,
            email: user.email || ''
          }));
        } else {
          console.log('Loaded profile data:', data);
          // Profile found - populate form
          setProfileData({
            name: data.name || '',
            profession: data.profession || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            location: data.location || '',
            description: data.description || '',
            is_active: data.is_active ?? true,
            profile_completed: data.profile_completed ?? false,
            profilePhoto: data.profile_photo || '',
            workPhotos: [] // Will be loaded from storage when implemented
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleInputChange = (field: keyof MasterProfile, value: string | boolean) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Check if required fields are filled
      const isProfileComplete = !!(
        profileData.name && 
        profileData.profession && 
        profileData.location && 
        profileData.description
      );

      const dataToSave = {
        ...profileData,
        profile_completed: isProfileComplete
      };

      console.log('Saving profile data:', dataToSave);
      
      const savedProfile = await saveMasterProfile(dataToSave);
      
      console.log('Profile saved successfully:', savedProfile);
      
      // Update local state with saved data
      setProfileData(prev => ({
        ...prev,
        ...savedProfile,
        profile_completed: isProfileComplete
      }));
      
      setSaveSuccess(true);
      
      // Call parent callback if provided
      if (onProfileUpdate) {
        onProfileUpdate(savedProfile);
      }

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveError(error instanceof Error ? error.message : 'Chyba pri ukladaní profilu');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (label: string, value: string, field: keyof MasterProfile, type: 'text' | 'textarea' = 'text', placeholder?: string) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    const handleSaveField = () => {
      handleInputChange(field, tempValue);
      setIsEditing(false);
    };

    const handleCancel = () => {
      setTempValue(value);
      setIsEditing(false);
    };

    if (isEditing) {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          {type === 'textarea' ? (
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
              rows={4}
              placeholder={placeholder}
            />
          ) : (
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
              placeholder={placeholder}
            />
          )}
          <div className="flex space-x-2">
            <button
              onClick={handleSaveField}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
            >
              Uložiť
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
            >
              Zrušiť
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-[#4169e1] transition-colors min-h-[44px] flex items-center"
        >
          {value ? (
            <span className="text-gray-900">{value}</span>
          ) : (
            <span className="text-[#4169e1] hover:underline">
              Nevyplnené - kliknite pre úpravu
            </span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4169e1] mx-auto"></div>
            <p className="text-gray-600 mt-4">Načítavam profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Späť na hlavnú stránku</span>
            </button>
            
            <div className="flex items-center space-x-4">
              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Ukladám...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Uložiť</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Success/Error Messages */}
        {saveSuccess && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
            <CheckCircle size={20} />
            <span>Profil bol úspešne uložený!</span>
          </div>
        )}

        {saveError && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
            <AlertCircle size={20} />
            <span>{saveError}</span>
          </div>
        )}

        {/* Profile Completion Status */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Stav profilu</h3>
              <p className="text-blue-700 text-sm">
                {profileData.profile_completed 
                  ? 'Váš profil je kompletný a viditeľný pre klientov'
                  : 'Dokončite profil pre zobrazenie na stránke'
                }
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              profileData.profile_completed 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {profileData.profile_completed ? 'Kompletný' : 'Nekompletný'}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-[#4169e1] text-[#4169e1]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Profil
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'calendar'
                    ? 'border-[#4169e1] text-[#4169e1]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Kalendár
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'projects'
                    ? 'border-[#4169e1] text-[#4169e1]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Projekty
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'payments'
                    ? 'border-[#4169e1] text-[#4169e1]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Platby
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Profile Photo */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Profilová fotka</h3>
                  <PhotoUpload
                    type="profile"
                    currentPhotos={profileData.profilePhoto ? [profileData.profilePhoto] : []}
                    onPhotosChange={(photos) => handleInputChange('profilePhoto', photos[0] || '')}
                    className="mb-4"
                  />
                </div>

                {/* Identity and Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
                    <User size={20} className="text-[#4169e1]" />
                    <span>Identita a detaily</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField(
                      'Meno a profesia', 
                      profileData.name, 
                      'name', 
                      'text',
                      'Napr. Ján Novák'
                    )}
                    
                    {renderField(
                      'Vek (voliteľné)', 
                      '', // Age is not in our current schema
                      'name', // Placeholder field
                      'text',
                      'Napr. 35 rokov'
                    )}
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Lokalita a dostupnosť</label>
                      <div className="flex items-center space-x-2">
                        <MapPin size={16} className="text-gray-400" />
                        <div
                          onClick={() => {
                            const newLocation = prompt('Zadajte vašu lokalitu:', profileData.location);
                            if (newLocation !== null) {
                              handleInputChange('location', newLocation);
                            }
                          }}
                          className="cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-[#4169e1] transition-colors min-h-[44px] flex items-center flex-1"
                        >
                          {profileData.location ? (
                            <span className="text-gray-900">{profileData.location}</span>
                          ) : (
                            <span className="text-[#4169e1] hover:underline">
                              Nevyplnené - kliknite pre úpravu
                            </span>
                          )}
                        </div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    </div>

                    {renderField(
                      'Sociálne siete (voliteľné)', 
                      '', // Social media not in current schema
                      'name', // Placeholder field
                      'text',
                      'Facebook, Instagram, LinkedIn...'
                    )}
                  </div>
                </div>

                {/* What I Do */}
                <div>
                  <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
                    <FileText size={20} className="text-[#4169e1]" />
                    <span>Čo robím (max 1000 znakov)</span>
                  </h3>
                  
                  {renderField(
                    '', 
                    profileData.description, 
                    'description', 
                    'textarea',
                    'Opíšte vaše služby, skúsenosti a špecializáciu...'
                  )}
                </div>

                {/* What I Solve */}
                <div>
                  <h3 className="text-lg font-semibold mb-6">Čo riešim</h3>
                  
                  {renderField(
                    '', 
                    profileData.profession, 
                    'profession', 
                    'text',
                    'Napr. Inštalatér, Elektrikár, Murár...'
                  )}
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-6">Kontaktné údaje</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <Mail size={16} className="text-gray-400" />
                        <span className="text-gray-700">{profileData.email}</span>
                        <span className="text-xs text-gray-500">(z registrácie)</span>
                      </div>
                    </div>
                    
                    {renderField(
                      'Telefón', 
                      profileData.phone, 
                      'phone', 
                      'text',
                      '+421 9xx xxx xxx'
                    )}
                  </div>
                </div>

                {/* Work Photos */}
                <div>
                  <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
                    <Camera size={20} className="text-[#4169e1]" />
                    <span>Ukážky práce</span>
                  </h3>
                  
                  <PhotoUpload
                    type="work"
                    currentPhotos={profileData.workPhotos || []}
                    onPhotosChange={(photos) => handleInputChange('workPhotos', photos)}
                  />
                </div>

                {/* Profile Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Stav profilu</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${profileData.name ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span>Meno: {profileData.name ? 'Vyplnené' : 'Nevyplnené'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${profileData.profession ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span>Profesia: {profileData.profession ? 'Vyplnené' : 'Nevyplnené'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${profileData.location ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span>Lokalita: {profileData.location ? 'Vyplnené' : 'Nevyplnené'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${profileData.description ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span>Popis: {profileData.description ? 'Vyplnené' : 'Nevyplnené'}</span>
                    </div>
                  </div>
                  
                  {!profileData.profile_completed && (
                    <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                      <p className="text-yellow-800 text-sm">
                        ⚠️ Pre zobrazenie na stránke vyplňte všetky povinné polia (meno, profesia, lokalita, popis)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Kalendár práce</h3>
                <p className="text-gray-600">Funkcia bude dostupná čoskoro</p>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Moje projekty</h3>
                <p className="text-gray-600">Funkcia bude dostupná čoskoro</p>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Platby a faktúry</h3>
                <p className="text-gray-600">Funkcia bude dostupná čoskoro</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};