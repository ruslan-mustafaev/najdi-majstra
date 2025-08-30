import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { NavigationTabs } from './MasterDashboard/NavigationTabs';
import { ProfileForm } from './MasterDashboard/ProfileForm';
import { SocialMediaForm } from './MasterDashboard/SocialMediaForm';
import { WorkingHoursForm } from './MasterDashboard/WorkingHoursForm';
import { ProfileStatus } from './MasterDashboard/ProfileStatus';
import { AnalyticsTab } from './MasterDashboard/AnalyticsTab';
import { SettingsTab } from './MasterDashboard/SettingsTab';
import { saveMasterProfile, type MasterProfile } from '../lib/masterProfileApi';

interface MasterDashboardProps {
  onBack: () => void;
  onProfileUpdate?: (profileData: any) => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({ onBack, onProfileUpdate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'analytics' | 'settings'>('profile');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    profession: '',
    location: '',
    description: '',
    contact: {
      phone: '',
      email: '',
      website: '',
      socialMedia: {
        facebook: '',
        instagram: '',
        linkedin: '',
        youtube: '',
        tiktok: '',
        twitter: '',
        telegram: ''
      }
    },
    workingHours: {
      monday: '8:00 - 17:00',
      tuesday: '8:00 - 17:00',
      wednesday: '8:00 - 17:00',
      thursday: '8:00 - 17:00',
      friday: '8:00 - 17:00',
      saturday: '9:00 - 16:00',
      sunday: 'Zatvorené'
    }
  });

  // Initialize profile data from user
  useEffect(() => {
    if (user) {
      const userData = user.user_metadata || {};
      setProfileData({
        name: userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || '',
        profession: userData.profession || '',
        location: userData.location || '',
        description: userData.description || '',
        contact: {
          phone: userData.phone || user.phone || '',
          email: user.email || '',
          website: userData.website || '',
          socialMedia: userData.social_media || {
            facebook: '',
            instagram: '',
            linkedin: '',
            youtube: '',
            tiktok: '',
            twitter: '',
            telegram: ''
          }
        },
        workingHours: userData.working_hours || {
          monday: '8:00 - 17:00',
          tuesday: '8:00 - 17:00',
          wednesday: '8:00 - 17:00',
          thursday: '8:00 - 17:00',
          friday: '8:00 - 17:00',
          saturday: '9:00 - 16:00',
          sunday: 'Zatvorené'
        }
      });
      
      // Check if profile is already saved
      setIsProfileSaved(userData.profile_saved === true);
    }
  }, [user]);

  const handleEdit = (field: string) => {
    setEditingField(field);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Подготавливаем данные для сохранения в базу
      const profileForDB: MasterProfile = {
        name: profileData.name,
        profession: profileData.profession,
        phone: profileData.contact.phone,
        location: profileData.location,
        description: profileData.description,
        profile_completed: true
      };

      // Сохраняем в базу данных
      const savedProfile = await saveMasterProfile(profileForDB);
      
      setEditingField(null);
      setHasChanges(false);
      setIsProfileSaved(true);
      
      console.log('Profile saved to database:', savedProfile);
      
      if (onProfileUpdate) {
        onProfileUpdate(savedProfile);
      }
      
    } catch (error) {
      console.error('Profile save error:', error);
      alert('Chyba pri ukladaní profilu. Skúste to znova.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldSave = (field: string, value: any) => {
    setProfileData(prev => {
      const newData = { ...prev };
      const fieldPath = field.split('.');
      
      let current = newData;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        if (!current[fieldPath[i]]) {
          current[fieldPath[i]] = {};
        }
        current = current[fieldPath[i]];
      }
      current[fieldPath[fieldPath.length - 1]] = value;
      
      return newData;
    });
    
    setEditingField(null);
    setHasChanges(true);
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  const handleChange = (field: string, value: any) => {
    setProfileData(prev => {
      const newData = { ...prev };
      const fieldPath = field.split('.');
      
      let current = newData;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        if (!current[fieldPath[i]]) {
          current[fieldPath[i]] = {};
        }
        current = current[fieldPath[i]];
      }
      current[fieldPath[fieldPath.length - 1]] = value;
      
      return newData;
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8">
            <ProfileForm
              profileData={profileData}
              editingField={editingField}
              onEdit={handleEdit}
              onSave={handleFieldSave}
              onCancel={handleCancel}
              onChange={handleChange}
            />
            
            <SocialMediaForm
              socialMedia={profileData.contact.socialMedia}
              editingField={editingField}
              onEdit={handleEdit}
              onSave={handleFieldSave}
              onCancel={handleCancel}
              onChange={handleChange}
            />
            
            <WorkingHoursForm
              workingHours={profileData.workingHours}
              editingField={editingField}
              onEdit={handleEdit}
              onSave={handleFieldSave}
              onCancel={handleCancel}
              onChange={handleChange}
            />
          </div>
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
      <NavigationTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={onBack}
      />

      <div className="container mx-auto px-4 py-8">
        <ProfileStatus
          isProfileSaved={isProfileSaved}
          hasChanges={hasChanges}
          isSaving={isSaving}
          onSave={handleSave}
        />

        {renderTabContent()}
      </div>
    </div>
  );
};