import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { saveMasterProfile } from '../../lib/masterProfileApi';
import { NavigationTabs } from './NavigationTabs';
import { ProfileForm } from './ProfileForm';
import { SocialMediaForm } from './SocialMediaForm';
import { WorkingHoursForm } from './WorkingHoursForm';
import { ProfileStatus } from './ProfileStatus';
import { AnalyticsTab } from './AnalyticsTab';
import { SettingsTab } from './SettingsTab';

interface MasterDashboardProps {
  onBack: () => void;
  onProfileUpdate?: (profileData: any) => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({ onBack, onProfileUpdate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'analytics' | 'settings'>('profile');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    phone: '',
    location: '',
    description: '',
    experience: '',
    hourlyRate: '',
    teamSize: 'individual' as 'individual' | 'small-team',
    serviceTypes: [] as string[],
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      linkedin: '',
      youtube: '',
      twitter: '',
      tiktok: ''
    },
    workRadius: '',
    services: [] as string[],
    expertise: [] as string[],
    languages: [] as string[],
    certifications: [] as string[],
    availability: '',
    workingHours: {
      monday: '8:00 - 17:00',
      tuesday: '8:00 - 17:00',
      wednesday: '8:00 - 17:00',
      thursday: '8:00 - 17:00',
      friday: '8:00 - 17:00',
      saturday: 'Zatvorené',
      sunday: 'Zatvorené'
    }
  });

  // Load user data on component mount
  useEffect(() => {
    if (user?.user_metadata) {
      const userData = user.user_metadata;
      setFormData({
        name: userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || '',
        profession: userData.profession || '',
        phone: userData.phone || user.phone || '',
        location: userData.location || '',
        description: userData.description || '',
        experience: userData.experience || '',
        hourlyRate: userData.hourly_rate || '',
        teamSize: userData.team_size || 'individual',
        serviceTypes: userData.service_types ? userData.service_types.split(',') : [],
        website: userData.website || '',
        socialMedia: userData.social_media || {
          facebook: '',
          instagram: '',
          linkedin: '',
          youtube: '',
          twitter: '',
          tiktok: ''
        },
        workRadius: userData.work_radius || '',
        services: userData.services ? userData.services.split(',') : [],
        expertise: userData.expertise ? userData.expertise.split(',') : [],
        languages: userData.languages ? userData.languages.split(',') : ['Slovenčina'],
        certifications: userData.certifications ? userData.certifications.split(',') : [],
        availability: userData.availability || '',
        workingHours: userData.working_hours || {
          monday: '8:00 - 17:00',
          tuesday: '8:00 - 17:00',
          wednesday: '8:00 - 17:00',
          thursday: '8:00 - 17:00',
          friday: '8:00 - 17:00',
          saturday: 'Zatvorené',
          sunday: 'Zatvorené'
        }
      });
    }
  }, [user]);

  const handleFormDataChange = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleWorkingHoursChange = (day: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: value
      }
    }));
  };

  const calculateCompletionPercentage = () => {
    const requiredFields = [
      formData.name,
      formData.profession,
      formData.phone,
      formData.location,
      formData.description,
      formData.experience
    ];
    
    const filledFields = requiredFields.filter(field => field && field.trim() !== '').length;
    const optionalFields = [
      formData.services.length > 0,
      formData.expertise.length > 0,
      formData.languages.length > 0
    ].filter(Boolean).length;
    
    return Math.round(((filledFields + optionalFields * 0.5) / (requiredFields.length + 3 * 0.5)) * 100);
  };

  const isProfileSaved = user?.user_metadata?.profile_saved === true;

  const handleSaveProfile = async () => {
    setLoading(true);
    setSaveSuccess(false);

    try {
      // Save to Supabase
      await saveMasterProfile({
        name: formData.name,
        profession: formData.profession,
        phone: formData.phone,
        location: formData.location,
        description: formData.description,
        is_active: true,
        profile_completed: true
      });

      // Update user metadata in Supabase auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...user?.user_metadata,
          ...formData,
          profile_saved: true,
          full_name: formData.name,
          services: formData.services.join(','),
          expertise: formData.expertise.join(','),
          languages: formData.languages.join(','),
          certifications: formData.certifications.join(','),
          hourly_rate: formData.hourlyRate,
          team_size: formData.teamSize,
          service_types: formData.serviceTypes.join(','),
          work_radius: formData.workRadius,
          working_hours: formData.workingHours
        }
      });

      if (updateError) throw updateError;

      setSaveSuccess(true);
      
      // Notify parent component about profile update
      if (onProfileUpdate) {
        onProfileUpdate(formData);
      }

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Chyba pri ukladaní profilu. Skúste to prosím znovu.');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <ProfileForm 
              formData={formData}
              onFormDataChange={handleFormDataChange}
            />
            <SocialMediaForm 
              socialMedia={formData.socialMedia}
              onSocialMediaChange={handleSocialMediaChange}
            />
          </div>
        );
      case 'schedule':
        return (
          <WorkingHoursForm 
            workingHours={formData.workingHours}
            onWorkingHoursChange={handleWorkingHoursChange}
          />
        );
      case 'analytics':
        return <AnalyticsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Späť na hlavnú stránku</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Ukladá sa...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle size={20} />
                  <span>Uložené!</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Uložiť rozvrh</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Profile Status */}
        <ProfileStatus 
          isProfileSaved={isProfileSaved}
          isLoading={loading}
          completionPercentage={calculateCompletionPercentage()}
        />

        {/* Navigation */}
        <NavigationTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};