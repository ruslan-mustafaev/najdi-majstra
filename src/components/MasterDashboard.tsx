import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Building, CreditCard, Calendar, Settings, Camera, Save, Eye, Star, MapPin, Phone, Mail, Award, Users, Euro, Clock, Plus, Trash2, Edit3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { PhotoUpload } from './PhotoUpload';
import { DefaultAvatar } from './DefaultAvatar';
import { saveMasterProfile, MasterProfile } from '../lib/masterProfileApi';

interface MasterDashboardProps {
  onBack: () => void;
  onProfileUpdate: (profileData: any) => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({ onBack, onProfileUpdate }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<MasterProfile>({
    name: user?.user_metadata?.full_name || '',
    profession: '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    location: user?.user_metadata?.location || '',
    description: '',
    is_active: true,
    profile_completed: false,
    profilePhoto: '',
    workPhotos: []
  });

  const [subscriptionPlan, setSubscriptionPlan] = useState('standard');
  const [workingHours, setWorkingHours] = useState({
    monday: '8:00 - 17:00',
    tuesday: '8:00 - 17:00',
    wednesday: '8:00 - 17:00',
    thursday: '8:00 - 17:00',
    friday: '8:00 - 17:00',
    saturday: '9:00 - 16:00',
    sunday: 'Zatvorené'
  });

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'navigation', label: 'Navigácia', icon: Building },
    { id: 'payments', label: 'Platby', icon: CreditCard },
    { id: 'subscription', label: 'Predplatné', icon: Star },
    { id: 'calendar', label: 'Kalendár dostupnosti', icon: Calendar },
    { id: 'settings', label: 'Nastavenia', icon: Settings }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
  };

  const handleWorkingHoursChange = (day: string, value: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: value
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const savedProfile = await saveMasterProfile({
        ...profileData,
        profile_completed: true
      });
      
      setSuccess(language === 'sk' ? 'Profil úspešne uložený!' : 'Profile saved successfully!');
      onProfileUpdate(savedProfile);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setError(language === 'sk' ? 'Chyba pri ukladaní profilu' : 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Photo Upload */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Profilová fotografia</h3>
        <PhotoUpload
          type="profile"
          currentPhotos={profileData.profilePhoto ? [profileData.profilePhoto] : []}
          onPhotosChange={(photos) => setProfileData(prev => ({ ...prev, profilePhoto: photos[0] || '' }))}
          maxPhotos={1}
        />
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Základné informácie</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="Vaše meno a priezvisko"
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
              placeholder="Napr. Elektrikár, Inštalatér, Murár"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
              placeholder="vas@email.sk"
              required
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
              Lokalita *
            </label>
            <input
              type="text"
              name="location"
              value={profileData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
              placeholder="Mesto, okres"
              required
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Popis služieb</h3>
        <textarea
          name="description"
          value={profileData.description}
          onChange={handleInputChange}
          rows={6}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none resize-none"
          placeholder="Opíšte svoje služby, skúsenosti a špecializáciu..."
        />
      </div>

      {/* Work Photos */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Ukážky práce</h3>
        <PhotoUpload
          type="work"
          currentPhotos={profileData.workPhotos || []}
          onPhotosChange={(photos) => setProfileData(prev => ({ ...prev, workPhotos: photos }))}
          maxPhotos={10}
        />
      </div>

      {/* Save Button */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Uložiť profil</h3>
            <p className="text-gray-600 text-sm">Všetky zmeny budú uložené do vášho profilu</p>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="bg-[#4169e1] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#3558d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Save size={20} />
            )}
            <span>{loading ? 'Ukladám...' : 'Uložiť profil'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderNavigationTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Navigácia a dostupnosť</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Oblasť pôsobenia
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
              placeholder="Napr. Bratislava + 50km okolie"
              defaultValue={profileData.location + " + okolie"}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Dopravné prostriedky
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span>Auto</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Dodávka</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Nákladné auto</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Platobné metódy</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Akceptované platby
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span>Hotovosť</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                <span>Bankový prevod</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Platobná karta</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Online platby</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Cenové rozpätie za hodinu
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                placeholder="Od €"
              />
              <input
                type="number"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                placeholder="Do €"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Predplatné plány</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Standard Plan */}
          <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
            subscriptionPlan === 'standard' ? 'border-[#4169e1] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`} onClick={() => setSubscriptionPlan('standard')}>
            <h4 className="font-semibold text-gray-900 mb-2">Standard</h4>
            <p className="text-2xl font-bold text-gray-900 mb-2">Zadarmo</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Základný profil</li>
              <li>• 3 fotky práce</li>
              <li>• Základná podpora</li>
            </ul>
          </div>

          {/* Professional Plan */}
          <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
            subscriptionPlan === 'professional' ? 'border-[#4169e1] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`} onClick={() => setSubscriptionPlan('professional')}>
            <h4 className="font-semibold text-gray-900 mb-2">Professional</h4>
            <p className="text-2xl font-bold text-gray-900 mb-2">€19/mes</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Rozšírený profil</li>
              <li>• 10 fotiek práce</li>
              <li>• Prioritná podpora</li>
              <li>• Kalendár dostupnosti</li>
            </ul>
          </div>

          {/* Professional Expert Plan */}
          <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
            subscriptionPlan === 'professional-expert' ? 'border-[#4169e1] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`} onClick={() => setSubscriptionPlan('professional-expert')}>
            <h4 className="font-semibold text-gray-900 mb-2">Professional Expert</h4>
            <p className="text-2xl font-bold text-gray-900 mb-2">€39/mes</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Všetko z Professional</li>
              <li>• Neobmedzené fotky</li>
              <li>• Video prezentácia</li>
              <li>• Analytika</li>
            </ul>
          </div>

          {/* Premier Plan */}
          <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
            subscriptionPlan === 'premier' ? 'border-[#4169e1] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`} onClick={() => setSubscriptionPlan('premier')}>
            <h4 className="font-semibold text-gray-900 mb-2">Premier</h4>
            <p className="text-2xl font-bold text-gray-900 mb-2">€79/mes</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Všetko z Expert</li>
              <li>• Top pozícia v výsledkoch</li>
              <li>• Osobný manažér</li>
              <li>• Marketing podpora</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCalendarTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Pracovné hodiny</h3>
        <div className="space-y-4">
          {Object.entries(workingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center space-x-4">
              <div className="w-24 text-sm font-medium capitalize">
                {day === 'monday' ? 'Pondelok' :
                 day === 'tuesday' ? 'Utorok' :
                 day === 'wednesday' ? 'Streda' :
                 day === 'thursday' ? 'Štvrtok' :
                 day === 'friday' ? 'Piatok' :
                 day === 'saturday' ? 'Sobota' : 'Nedeľa'}
              </div>
              <input
                type="text"
                value={hours}
                onChange={(e) => handleWorkingHoursChange(day, e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                placeholder="8:00 - 17:00 alebo 'Zatvorené'"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Dostupnosť na výjazdy</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Akútne výjazdy
            </label>
            <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none">
              <option>Dostupný 24/7</option>
              <option>Dostupný v pracovných hodinách</option>
              <option>Nedostupný pre akútne výjazdy</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Minimálny čas na objednávku
            </label>
            <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none">
              <option>Okamžite</option>
              <option>1 hodina vopred</option>
              <option>1 deň vopred</option>
              <option>1 týždeň vopred</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Nastavenia účtu</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Aktívny profil</p>
              <p className="text-sm text-gray-600">Váš profil je viditeľný pre klientov</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profileData.is_active}
                onChange={(e) => setProfileData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Emailové notifikácie</p>
              <p className="text-sm text-gray-600">Dostávať notifikácie o nových objednávkach</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Zmena hesla</h3>
        <div className="space-y-4">
          <input
            type="password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
            placeholder="Aktuálne heslo"
          />
          <input
            type="password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
            placeholder="Nové heslo"
          />
          <input
            type="password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
            placeholder="Potvrdiť nové heslo"
          />
          <button className="bg-[#4169e1] text-white px-6 py-2 rounded-lg hover:bg-[#3558d4] transition-colors">
            Zmeniť heslo
          </button>
        </div>
      </div>
    </div>
  );

  // Profile Preview Component
  const ProfilePreview = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative h-48 bg-gradient-to-br from-[#4169e1] to-[#5a7bff]">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end space-x-4">
            {profileData.profilePhoto ? (
              <img
                src={profileData.profilePhoto}
                alt="Profile"
                className="w-20 h-20 rounded-full border-4 border-white object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-4 border-white bg-white flex items-center justify-center">
                <DefaultAvatar size="lg" />
              </div>
            )}
            <div className="text-white flex-1">
              <h3 className="text-xl font-bold">{profileData.name || 'Vaše meno'}</h3>
              <p className="text-white/90">{profileData.profession || 'Vaša profesia'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <Star className="text-yellow-400 fill-current" size={16} />
            <span className="font-medium">4.5</span>
            <span className="text-gray-600 text-sm">(0 hodnotení)</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin size={14} className="mr-1" />
            <span>{profileData.location || 'Vaša lokalita'}</span>
          </div>
        </div>
        
        <p className="text-gray-700 text-sm mb-3 line-clamp-3">
          {profileData.description || 'Váš popis služieb sa zobrazí tu...'}
        </p>
        
        <button className="w-full bg-[#4169e1] text-white py-2 rounded-lg font-medium text-sm">
          Zobraziť profil
        </button>
      </div>
    </div>
  );

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
        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Dashboard</h2>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                        activeTab === tab.id
                          ? 'bg-[#4169e1] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'navigation' && renderNavigationTab()}
            {activeTab === 'payments' && renderPaymentsTab()}
            {activeTab === 'subscription' && renderSubscriptionTab()}
            {activeTab === 'calendar' && renderCalendarTab()}
            {activeTab === 'settings' && renderSettingsTab()}
          </div>

          {/* Right Sidebar - Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Eye size={20} />
                <span>Náhľad profilu</span>
              </h3>
              <ProfilePreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};