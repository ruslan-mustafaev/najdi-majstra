import React, { useState } from 'react';
import { 
  User, Settings, BarChart3, Calendar, MessageSquare, Star, TrendingUp, 
  Clock, CheckCircle, Camera, Edit3, Save, X, Upload, CreditCard,
  MapPin, Phone, Mail, Globe, Award, Users, Euro, Eye, Plus,
  FileText, Bell, Shield, Palette, Navigation
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

interface MasterDashboardProps {
  onBack: () => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({ onBack }) => {
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    profession: user?.user_metadata?.profession || 'Majster',
    phone: user?.user_metadata?.phone || '',
    email: user?.email || '',
    location: user?.user_metadata?.location || '',
    website: user?.user_metadata?.website || '',
    description: user?.user_metadata?.description || 'Profesionálny majster s bohatými skúsenosťami.',
    experience: user?.user_metadata?.experience || '5 rokov',
    priceRange: user?.user_metadata?.price_range || '25-45 €/hod',
    services: user?.user_metadata?.services || ['Inštalácie', 'Opravy', 'Servis'],
    workingHours: user?.user_metadata?.working_hours || {
      monday: '8:00 - 17:00',
      tuesday: '8:00 - 17:00',
      wednesday: '8:00 - 17:00',
      thursday: '8:00 - 17:00',
      friday: '8:00 - 17:00',
      saturday: '9:00 - 15:00',
      sunday: 'Zatvorené'
    }
  });

  const masterName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Majster';

  const handleSaveProfile = () => {
    // Here you would save to Supabase
    console.log('Saving profile:', profileData);
    setIsEditing(false);
    // TODO: Implement Supabase update
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement image upload to Supabase Storage
      console.log('Uploading image:', file);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Aktívne objednávky</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Dokončené práce</p>
              <p className="text-2xl font-bold text-gray-900">47</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Hodnotenie</p>
              <p className="text-2xl font-bold text-gray-900">4.8</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Mesačný príjem</p>
              <p className="text-2xl font-bold text-gray-900">€2,450</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-6">Posledné objednávky</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((order) => (
              <div key={order} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Oprava elektroinštalácie</h4>
                    <p className="text-gray-600 text-sm">Bratislava • 2 dni</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">€150</p>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                      V procese
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-6">Rýchle akcie</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setActiveTab('profile')}
              className="w-full bg-[#4169e1] text-white py-3 rounded-lg font-medium hover:bg-[#3558d4] transition-colors flex items-center justify-center space-x-2"
            >
              <User size={20} />
              <span>Upraviť profil</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('calendar')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Calendar size={20} />
              <span>Kalendár</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('messages')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <MessageSquare size={20} />
              <span>Správy</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('analytics')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <BarChart3 size={20} />
              <span>Štatistiky</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Môj profil</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveTab('preview')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Eye size={20} />
              <span>Náhľad profilu</span>
            </button>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Edit3 size={20} />
                <span>Upraviť</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Save size={20} />
                  <span>Uložiť</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X size={20} />
                  <span>Zrušiť</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image */}
          <div className="lg:col-span-1">
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={user?.user_metadata?.profile_image || 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400'}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <h3 className="text-xl font-bold">{masterName}</h3>
              <p className="text-gray-600">{profileData.profession}</p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meno</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priezvisko</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profesia</label>
              <input
                type="text"
                value={profileData.profession}
                onChange={(e) => setProfileData(prev => ({ ...prev, profession: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefón</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mesto</label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Webstránka</label>
              <input
                type="url"
                value={profileData.website}
                onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Popis</label>
              <textarea
                value={profileData.description}
                onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skúsenosti</label>
                <select
                  value={profileData.experience}
                  onChange={(e) => setProfileData(prev => ({ ...prev, experience: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="1 rok">1 rok</option>
                  <option value="2-3 roky">2-3 roky</option>
                  <option value="5 rokov">5 rokov</option>
                  <option value="viac ako 10 rokov">viac ako 10 rokov</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cenové rozpätie</label>
                <input
                  type="text"
                  value={profileData.priceRange}
                  onChange={(e) => setProfileData(prev => ({ ...prev, priceRange: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="25-45 €/hod"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-6">Pracovné hodiny</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(profileData.workingHours).map(([day, hours]) => (
            <div key={day}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {day === 'monday' ? 'Pondelok' :
                 day === 'tuesday' ? 'Utorok' :
                 day === 'wednesday' ? 'Streda' :
                 day === 'thursday' ? 'Štvrtok' :
                 day === 'friday' ? 'Piatok' :
                 day === 'saturday' ? 'Sobota' : 'Nedeľa'}
              </label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  workingHours: { ...prev.workingHours, [day]: e.target.value }
                }))}
                disabled={!isEditing}
                placeholder="8:00 - 17:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Nastavenia</h2>
        
        <div className="space-y-6">
          {/* Navigation Settings */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Navigation size={20} className="text-blue-600" />
              <span>Navigácia stavby</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span>Zobrazovať GPS súradnice</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span>Automatická navigácia</span>
                </label>
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <CreditCard size={20} className="text-green-600" />
              <span>Platby</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferované spôsoby platby</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Hotovosť</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Karta</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Prevod</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">PayPal</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IBAN (pre prevody)</label>
                <input
                  type="text"
                  placeholder="SK89 1200 0000 1987 4263 7541"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Bell size={20} className="text-yellow-600" />
              <span>Notifikácie</span>
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span>Nové objednávky</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </label>
              <label className="flex items-center justify-between">
                <span>Správy od klientov</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </label>
              <label className="flex items-center justify-between">
                <span>Pripomienky termínov</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </label>
              <label className="flex items-center justify-between">
                <span>Marketingové správy</span>
                <input type="checkbox" className="rounded" />
              </label>
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Shield size={20} className="text-red-600" />
              <span>Súkromie</span>
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span>Zobrazovať telefónne číslo</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </label>
              <label className="flex items-center justify-between">
                <span>Zobrazovať email</span>
                <input type="checkbox" className="rounded" />
              </label>
              <label className="flex items-center justify-between">
                <span>Povoliť hodnotenia</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
            Uložiť nastavenia
          </button>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'calendar', label: 'Kalendár', icon: Calendar },
    { id: 'messages', label: 'Správy', icon: MessageSquare },
    { id: 'analytics', label: 'Štatistiky', icon: TrendingUp },
    { id: 'settings', label: 'Nastavenia', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#4169e1] to-[#5a7bff] text-white rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                Vitajte, {masterName}!
              </h2>
              <p className="text-white/80">
                Spravujte svoj profil a objednávky
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'settings' && renderSettings()}
        
        {/* Placeholder for other tabs */}
        {['calendar', 'messages', 'analytics'].includes(activeTab) && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Calendar size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <p className="text-gray-500">
              Táto sekcia bude dostupná čoskoro
            </p>
          </div>
        )}
      </div>
    </div>
  );
};