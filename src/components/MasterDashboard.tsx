import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, AlertTriangle, CheckCircle, User, Mail, Phone, MapPin, Briefcase, FileText, Settings, Zap, Wrench } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { saveMasterProfile, MasterProfile } from '../lib/masterProfileApi';
import { FileUploadManager } from './FileUpload/FileUploadManager';
import { supabase } from '../lib/supabase';
import { getCityOptions, getProfessionOptions } from '../data/filterOptions';

interface MasterDashboardProps {
  onBack: () => void;
  onProfileUpdate?: (profileData: any) => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({ onBack, onProfileUpdate }) => {
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const [serviceTypes, setServiceTypes] = useState({
    urgent: false,
    regular: false,
    realization: false
  });

  // Загружаем существующий профиль при монтировании
  useEffect(() => {
    loadExistingProfile();
  }, [user]);

  const loadExistingProfile = async () => {
    if (!user?.id) return;

    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('masters')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfileData({
          name: data.name || '',
          profession: data.profession || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          description: data.description || '',
          is_active: data.is_active ?? true,
          profile_completed: data.profile_completed ?? false
        });

        // Загружаем настройки сервисов (если есть)
        const services = data.emergency_services || [];
        setServiceTypes({
          urgent: services.includes('urgent'),
          regular: services.includes('regular'),
          realization: services.includes('realization')
        });
      } else {
        // Если профиль не найден, заполняем базовыми данными из auth
        setProfileData(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          location: user.user_metadata?.location || ''
        }));
      }
    } catch (error) {
      console.error('Unexpected error loading profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProfileData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleServiceTypeChange = (serviceType: 'urgent' | 'regular' | 'realization', checked: boolean) => {
    setServiceTypes(prev => ({
      ...prev,
      [serviceType]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    setMessage(null);

    try {
      // Подготавливаем данные для сохранения
      const selectedServices = Object.entries(serviceTypes)
        .filter(([_, selected]) => selected)
        .map(([service, _]) => service);

      const dataToSave = {
        ...profileData,
        profile_completed: true
      };

      // Сохраняем основной профиль
      await saveMasterProfile(dataToSave);

      // Обновляем настройки сервисов отдельно
      const { error: servicesError } = await supabase
        .from('masters')
        .update({
          emergency_services: selectedServices,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (servicesError) {
        console.error('Error updating services:', servicesError);
      }

      setMessage({
        type: 'success',
        text: language === 'sk' ? 'Profil bol úspešne uložený!' : 'Profile saved successfully!'
      });

      if (onProfileUpdate) {
        onProfileUpdate(dataToSave);
      }

      // Скрываем сообщение через 3 секунды
      setTimeout(() => setMessage(null), 3000);

    } catch (error) {
      console.error('Save profile error:', error);
      setMessage({
        type: 'error',
        text: language === 'sk' ? 'Chyba pri ukladaní profilu' : 'Error saving profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    setDeleteLoading(true);
    try {
      // Удаляем профиль мастера из базы данных
      const { error: masterError } = await supabase
        .from('masters')
        .delete()
        .eq('user_id', user.id);

      if (masterError) {
        console.error('Error deleting master profile:', masterError);
      }

      // Удаляем пользователя из auth
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (authError) {
        console.error('Error deleting user:', authError);
        // Если не удалось удалить через admin API, пробуем обычный способ
        await signOut();
      } else {
        await signOut();
      }

      setMessage({
        type: 'success',
        text: language === 'sk' ? 'Účet bol úspešne zmazaný' : 'Account successfully deleted'
      });

      // Перенаправляем на главную страницу
      setTimeout(() => {
        onBack();
      }, 2000);

    } catch (error) {
      console.error('Delete account error:', error);
      setMessage({
        type: 'error',
        text: language === 'sk' ? 'Chyba pri mazaní účtu' : 'Error deleting account'
      });
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const cityOptions = getCityOptions(language);
  const professionOptions = getProfessionOptions(language);

  if (loadingProfile) {
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
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                {language === 'sk' ? 'Môj Profil' : 'My Profile'}
              </h1>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 size={20} />
                <span>{language === 'sk' ? 'Zmazať účet' : 'Delete Account'}</span>
              </button>
            </div>

            {/* Success/Error Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle size={20} />
                ) : (
                  <AlertTriangle size={20} />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Základné informácie */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <User size={20} className="text-[#4169e1]" />
                  <span>{language === 'sk' ? 'Základné informácie' : 'Basic Information'}</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      {language === 'sk' ? 'Meno a priezvisko *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                      placeholder={language === 'sk' ? 'Vaše meno a priezvisko' : 'Your full name'}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      {language === 'sk' ? 'Profesia *' : 'Profession *'}
                    </label>
                    <select
                      name="profession"
                      value={profileData.profession}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                      required
                    >
                      <option value="">{language === 'sk' ? '- Vyberte profesiu -' : '- Select Profession -'}</option>
                      {professionOptions.slice(1).map((option, index) => (
                        <option 
                          key={index} 
                          value={option.value}
                          disabled={option.isRegion}
                          className={option.isRegion ? 'font-bold bg-gray-100' : ''}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      {language === 'sk' ? 'Telefón *' : 'Phone *'}
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

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      {language === 'sk' ? 'Mesto *' : 'City *'}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <select
                        name="location"
                        value={profileData.location}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                        required
                      >
                        <option value="">{language === 'sk' ? '- Vyberte mesto -' : '- Select City -'}</option>
                        {cityOptions.slice(2).map((option, index) => (
                          <option 
                            key={index} 
                            value={option.value}
                            disabled={option.isRegion}
                            className={option.isRegion ? 'font-bold bg-gray-100' : ''}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Popis služieb */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <FileText size={20} className="text-[#4169e1]" />
                  <span>{language === 'sk' ? 'Popis služieb' : 'Service Description'}</span>
                </h2>
                
                <textarea
                  name="description"
                  value={profileData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                  placeholder={language === 'sk' ? 'Opíšte svoje služby, skúsenosti a špecializáciu...' : 'Describe your services, experience and specialization...'}
                />
              </div>

              {/* Čo riešim - Service Types */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Settings size={20} className="text-[#4169e1]" />
                  <span>{language === 'sk' ? 'Čo riešim' : 'What I Handle'}</span>
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="urgent"
                      checked={serviceTypes.urgent}
                      onChange={(e) => handleServiceTypeChange('urgent', e.target.checked)}
                      className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                    />
                    <label htmlFor="urgent" className="flex items-center space-x-2 text-gray-700">
                      <Zap size={20} className="text-red-500" />
                      <span className="font-medium">Akútne poruchy</span>
                      <span className="text-sm text-gray-500">- Havárie, naliehavé opravy</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="regular"
                      checked={serviceTypes.regular}
                      onChange={(e) => handleServiceTypeChange('regular', e.target.checked)}
                      className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="regular" className="flex items-center space-x-2 text-gray-700">
                      <Settings size={20} className="text-blue-500" />
                      <span className="font-medium">Pravidelný servis</span>
                      <span className="text-sm text-gray-500">- Údržba, kontroly, prevencie</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="realization"
                      checked={serviceTypes.realization}
                      onChange={(e) => handleServiceTypeChange('realization', e.target.checked)}
                      className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
                    />
                    <label htmlFor="realization" className="flex items-center space-x-2 text-gray-700">
                      <Wrench size={20} className="text-green-500" />
                      <span className="font-medium">Plánované realizácie</span>
                      <span className="text-sm text-gray-500">- Projekty, rekonštrukcie, stavby</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Nastavenia profilu */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Settings size={20} className="text-[#4169e1]" />
                  <span>{language === 'sk' ? 'Nastavenia profilu' : 'Profile Settings'}</span>
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={profileData.is_active}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-[#4169e1] rounded focus:ring-[#4169e1]"
                    />
                    <label htmlFor="is_active" className="text-gray-700">
                      {language === 'sk' ? 'Profil je aktívny (viditeľný pre klientov)' : 'Profile is active (visible to clients)'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Fotografie a videá */}
              <div>
                <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <Briefcase size={20} className="text-[#4169e1]" />
                  <span>{language === 'sk' ? 'Ukážky práce' : 'Work Samples'}</span>
                </h2>
                
                <div className="space-y-8">
                  {/* Work Images */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {language === 'sk' ? 'Fotografie práce' : 'Work Photos'}
                    </h3>
                    <FileUploadManager
                      fileType="work-images"
                      onUploadComplete={(urls) => {
                        console.log('Work images uploaded:', urls);
                      }}
                    />
                  </div>

                  {/* Work Videos */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {language === 'sk' ? 'Video ukážky práce' : 'Work Videos'}
                    </h3>
                    <FileUploadManager
                      fileType="work-videos"
                      onUploadComplete={(urls) => {
                        console.log('Work videos uploaded:', urls);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#4169e1] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#3558d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save size={20} />
                  <span>
                    {loading 
                      ? (language === 'sk' ? 'Ukladám...' : 'Saving...') 
                      : (language === 'sk' ? 'Uložiť profil' : 'Save Profile')
                    }
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === 'sk' ? 'Zmazať účet' : 'Delete Account'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'sk' ? 'Táto akcia je nevratná' : 'This action cannot be undone'}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                {language === 'sk' 
                  ? 'Naozaj chcete zmazať svoj účet? Všetky vaše údaje budú natrvalo odstránené.'
                  : 'Are you sure you want to delete your account? All your data will be permanently removed.'
                }
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {language === 'sk' ? 'Zrušiť' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{language === 'sk' ? 'Mažem...' : 'Deleting...'}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>{language === 'sk' ? 'Zmazať' : 'Delete'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};