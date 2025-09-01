import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, FileText, Save, Loader2, Settings, Eye } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { saveMasterProfile, MasterProfile } from '../lib/masterProfileApi';
import { useLanguage } from '../hooks/useLanguage';

interface MasterDashboardProps {
  onBack: () => void;
  onProfileUpdate: (profileData: any) => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({ onBack, onProfileUpdate }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<MasterProfile>({
    name: '',
    profession: '',
    email: '',
    phone: '',
    location: '',
    description: '',
    is_active: true,
    profile_completed: false
  });

  // Load existing profile data
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim(),
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        location: user.user_metadata?.location || ''
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
    setSuccess(null);
  };

  const validateForm = () => {
    if (!profileData.name.trim()) {
      setError(language === 'sk' ? 'Meno je povinné' : 'Name is required');
      return false;
    }
    if (!profileData.profession.trim()) {
      setError(language === 'sk' ? 'Profesia je povinná' : 'Profession is required');
      return false;
    }
    if (!profileData.email.trim()) {
      setError(language === 'sk' ? 'Email je povinný' : 'Email is required');
      return false;
    }
    if (!profileData.phone.trim()) {
      setError(language === 'sk' ? 'Telefón je povinný' : 'Phone is required');
      return false;
    }
    if (!profileData.location.trim()) {
      setError(language === 'sk' ? 'Lokalita je povinná' : 'Location is required');
      return false;
    }
    if (!profileData.description.trim()) {
      setError(language === 'sk' ? 'Popis je povinný' : 'Description is required');
      return false;
    }
    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const updatedProfile = {
        ...profileData,
        profile_completed: true
      };

      await saveMasterProfile(updatedProfile);
      
      setSuccess(language === 'sk' ? 'Profil bol úspešne uložený!' : 'Profile saved successfully!');
      onProfileUpdate(updatedProfile);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(language === 'sk' ? 'Chyba pri ukladaní profilu. Skúste znovu.' : 'Error saving profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const professionOptions = [
    'Elektrikár',
    'Vodoinštalatér', 
    'Maliar',
    'Plynár',
    'Interiérový dizajnér',
    'Bezpečnostné systémy',
    'Podlahár',
    'Čistenie a upratovanie',
    'Automechanik',
    'Kaderníčka',
    'Murár',
    'Tesár',
    'Klampiar',
    'Pokrývač',
    'Záhradník',
    'Iné'
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>{language === 'sk' ? 'Späť na hlavnú stránku' : 'Back to main page'}</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'sk' ? 'Dashboard majstra' : 'Master Dashboard'}
              </h1>
              <p className="text-gray-600">
                {language === 'sk' ? 'Spravujte svoj profil a nastavenia' : 'Manage your profile and settings'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'profile'
                      ? 'border-[#4169e1] text-[#4169e1]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <User size={16} />
                    <span>{language === 'sk' ? 'Profil' : 'Profile'}</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'settings'
                      ? 'border-[#4169e1] text-[#4169e1]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Settings size={16} />
                    <span>{language === 'sk' ? 'Nastavenia' : 'Settings'}</span>
                  </div>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Success Message */}
                  {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                      {success}
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          {language === 'sk' ? 'Celé meno' : 'Full Name'} *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                            placeholder={language === 'sk' ? 'Vaše meno a priezvisko' : 'Your full name'}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          {language === 'sk' ? 'Profesia' : 'Profession'} *
                        </label>
                        <select
                          name="profession"
                          value={profileData.profession}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                          required
                        >
                          <option value="">{language === 'sk' ? 'Vyberte profesiu' : 'Select profession'}</option>
                          {professionOptions.map((profession) => (
                            <option key={profession} value={profession}>
                              {profession}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Email *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                            placeholder="vas@email.sk"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          {language === 'sk' ? 'Telefón' : 'Phone'} *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                            placeholder="+421 9xx xxx xxx"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        {language === 'sk' ? 'Lokalita' : 'Location'} *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          name="location"
                          value={profileData.location}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                          placeholder={language === 'sk' ? 'Mesto, región' : 'City, region'}
                          required
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        {language === 'sk' ? 'Popis služieb' : 'Service Description'} *
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 text-gray-400" size={20} />
                        <textarea
                          name="description"
                          value={profileData.description}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none resize-none"
                          placeholder={language === 'sk' ? 'Opíšte svoje služby, skúsenosti a špecializáciu...' : 'Describe your services, experience and specialization...'}
                          required
                        />
                      </div>
                    </div>

                    {/* Profile Status */}
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={profileData.is_active}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-[#4169e1] rounded focus:ring-[#4169e1]"
                        />
                        <span className="text-gray-700">
                          {language === 'sk' ? 'Profil je aktívny' : 'Profile is active'}
                        </span>
                      </label>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => window.open(`/profile/${user?.id}`, '_blank')}
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center space-x-2"
                      >
                        <Eye size={20} />
                        <span>{language === 'sk' ? 'Náhľad profilu' : 'Preview Profile'}</span>
                      </button>
                      
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#4169e1] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#3558d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>{language === 'sk' ? 'Ukladá sa...' : 'Saving...'}</span>
                          </>
                        ) : (
                          <>
                            <Save size={20} />
                            <span>{language === 'sk' ? 'Uložiť profil' : 'Save Profile'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {language === 'sk' ? 'Nastavenia účtu' : 'Account Settings'}
                  </h3>
                  
                  {/* Account Info */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      {language === 'sk' ? 'Informácie o účte' : 'Account Information'}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{language === 'sk' ? 'Email:' : 'Email:'}</span>
                        <span className="font-medium">{user?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{language === 'sk' ? 'Typ účtu:' : 'Account Type:'}</span>
                        <span className="font-medium capitalize">{user?.user_metadata?.user_type || 'master'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{language === 'sk' ? 'Registrovaný:' : 'Registered:'}</span>
                        <span className="font-medium">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString('sk-SK') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Status */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      {language === 'sk' ? 'Stav profilu' : 'Profile Status'}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{language === 'sk' ? 'Profil dokončený:' : 'Profile Completed:'}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          profileData.profile_completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {profileData.profile_completed 
                            ? (language === 'sk' ? 'Áno' : 'Yes')
                            : (language === 'sk' ? 'Nie' : 'No')
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{language === 'sk' ? 'Profil aktívny:' : 'Profile Active:'}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          profileData.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {profileData.is_active 
                            ? (language === 'sk' ? 'Áno' : 'Yes')
                            : (language === 'sk' ? 'Nie' : 'No')
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-900 mb-3">
                      {language === 'sk' ? 'Ďalšie kroky' : 'Next Steps'}
                    </h4>
                    <ul className="space-y-2 text-blue-800">
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{language === 'sk' ? 'Dokončite váš profil v záložke "Profil"' : 'Complete your profile in the "Profile" tab'}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{language === 'sk' ? 'Pridajte fotografie vašej práce' : 'Add photos of your work'}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{language === 'sk' ? 'Nastavte dostupnosť a pracovné hodiny' : 'Set availability and working hours'}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};