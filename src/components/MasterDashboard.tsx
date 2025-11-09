import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, FileText, Camera, Video, Settings, Save, Eye, EyeOff, Clock, Euro, Users, Award, Globe, Facebook, Instagram, Linkedin, Youtube, Twitter, MessageCircle, CheckCircle, AlertCircle, Upload, X, Image, Play, AlertTriangle, Plus, Check, Calendar, Star, Trash2, Info, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { saveMasterProfile, type MasterProfile } from '../lib/masterProfileApi';
import { MasterPortfolio } from './MasterPortfolio';
import { FileUploadManager } from './FileUpload/FileUploadManager';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { ContactHoursSelector } from './ContactHoursSelector';
import { OffersList } from './OffersList';
import { supabase } from '../lib/supabase';

const CircleEuroIcon = ({ size = 28, className = '', color = 'white' }: { size?: number; className?: string; color?: 'white' | 'black' }) => (
  <img
    src="/icon_notification_master/money.svg"
    alt="Money"
    width={size}
    height={size}
    className={className}
    style={{ filter: color === 'white' ? 'brightness(0) invert(1)' : 'brightness(0)' }}
  />
);
import * as ProjectsAPI from '../lib/projectsApi';
import { getUserActiveSubscription, type Subscription } from '../lib/subscriptionsApi';
import { getPlanPriceId } from '../lib/stripeConfig';

interface MasterDashboardProps {
  onBack: () => void;
  onProfileUpdate?: (profileData: any) => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({ onBack, onProfileUpdate }) => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'calendar' | 'portfolio' | 'projects' | 'payments' | 'offers'>('profile');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [selectedPlanForDetails, setSelectedPlanForDetails] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [masterId, setMasterId] = useState<string>('');
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [availability, setAvailability] = useState<Record<string, 'available' | 'unavailable' | 'booked'>>({});
  
  // Projects state
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [projects, setProjects] = useState<Record<string, {
    name: string;
    phases: {
      priprava: { notes: { id: string; text: string; completed: boolean }[] };
      realizacia: { notes: { id: string; text: string; completed: boolean }[] };
      ukoncenie: { notes: { id: string; text: string; completed: boolean }[] };
    };
  }>>({});
  const [newNoteText, setNewNoteText] = useState('');
  const [activePhase, setActivePhase] = useState<'priprava' | 'realizacia' | 'ukoncenie'>('priprava');
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [showContactHoursModal, setShowContactHoursModal] = useState(false);
  const [contactHoursDisplay, setContactHoursDisplay] = useState<string>('');
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [showPaymentResult, setShowPaymentResult] = useState<{show: boolean, success: boolean, message: string, planName?: string, billingPeriod?: string, isLoading?: boolean}>({show: false, success: false, message: ''});

  const handleSelectPlan = async (planKey: 'odbornik' | 'expert' | 'profik' | 'premier') => {
    if (!user) {
      alert('Musíte sa prihlásiť pre výber plánu');
      return;
    }

    const priceId = getPlanPriceId(planKey, billingPeriod);
    console.log('Selected plan:', planKey, 'Period:', billingPeriod, 'Price ID:', priceId);

    if (!priceId) {
      alert('Chyba: Price ID nie je nakonfigurovaný pre tento plán. Skontaktujte podporu.');
      return;
    }

    const currentUrl = window.location.origin;

    // Premier is a one-time payment (lifetime), not a subscription
    const checkoutMode = planKey === 'premier' ? 'payment' : 'subscription';

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert('Musíte sa prihlásiť pre výber plánu');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${currentUrl}/dashboard?tab=payments&success=true&plan=${planKey}`,
          cancel_url: `${currentUrl}/dashboard?tab=payments&canceled=true`,
          mode: checkoutMode,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data);
        alert('Chyba pri vytváraní platby: ' + (data.error || 'Neznáma chyba'));
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Chyba pri vytváraní platby');
    }
  };

  const [profileData, setProfileData] = useState<{
    name: string;
    profession: string;
    age?: number;
    location: string;
    description: string;
    experience: string;
    services: string;
    expertise: string;
    teamSize: 'individual' | 'small-team';
    serviceTypes: string[];
    languages: string;
    hourlyRate: string;
    communicationStyle: string;
    workAbroad: boolean;
    availability: {
      schedule: string;
      available: boolean;
    };
    contact: {
      phone: string;
      email: string;
      website: string;
      socialMedia?: {
        facebook?: string;
        instagram?: string;
        youtube?: string;
        tiktok?: string;
        telegram?: string;
        whatsapp?: string;
      };
    };
    certifications: string[];
    serviceRegular: boolean;
    serviceUrgent: boolean;
    serviceRealization: boolean;
    profileImageUrl?: string;
    experienceYears: number;
    teamType: string;
    serviceArea: string;
    hourlyRateMin: string;
    hourlyRateMax: string;
    certificatesText: string;
  }>({
    name: user?.user_metadata?.full_name || user?.user_metadata?.first_name + ' ' + user?.user_metadata?.last_name || '',
    profession: user?.user_metadata?.profession || '',
    location: user?.user_metadata?.location || '',
    description: user?.user_metadata?.description || '',
    experience: user?.user_metadata?.experience || '',
    services: '',
    expertise: '',
    teamSize: 'individual',
    serviceTypes: [],
    languages: '',
    hourlyRate: '',
    communicationStyle: '',
    workAbroad: false,
    availability: {
      schedule: '',
      available: true
    },
    contact: {
      phone: user?.user_metadata?.phone || '',
      email: user?.email || '',
      website: user?.user_metadata?.website || '',
      socialMedia: {
        facebook: '',
        instagram: '',
        youtube: '',
        tiktok: '',
        telegram: '',
        whatsapp: ''
      }
    },
    certifications: [],
    serviceRegular: false,
    serviceUrgent: false,
    serviceRealization: false,
    profileImageUrl: undefined,
    experienceYears: 0,
    teamType: 'individuálne',
    serviceArea: 'lokálne',
    hourlyRateMin: '',
    hourlyRateMax: '',
    certificatesText: ''
  });

  const handleSave = async () => {
  setIsSaving(true);

  try {
    // Проверяем заполненность обязательных полей для profile_completed
    const hasProfileImage = profileData.profileImageUrl && profileData.profileImageUrl !== '/placeholder-avatar.svg';

    // Получаем фото работ из БД
    let workImagesCount = 0;
    if (user) {
      const { data: masterData } = await supabase
        .from('masters')
        .select('work_images_urls')
        .eq('user_id', user.id)
        .maybeSingle();

      workImagesCount = masterData?.work_images_urls?.length || 0;
    }

    const isProfileComplete =
      profileData.name.trim().length > 0 &&
      profileData.profession.trim().length > 0 &&
      profileData.location.trim().length > 0 &&
      profileData.description.trim().length >= 20 &&
      hasProfileImage &&
      workImagesCount > 0;

    if (!isProfileComplete) {
      const missingFields: string[] = [];
      if (!profileData.name.trim()) missingFields.push('Meno');
      if (!profileData.profession.trim()) missingFields.push('Profesia');
      if (!profileData.location.trim()) missingFields.push('Lokácia');
      if (profileData.description.trim().length < 20) missingFields.push('Popis (minimálne 20 znakov)');
      if (!hasProfileImage) missingFields.push('Profilová fotka');
      if (workImagesCount === 0) missingFields.push('Aspoň 1 fotka práce');

      alert(`Pre zobrazenie vo vyhľadávaní musíte vyplniť:\n\n${missingFields.join('\n')}\n\nProfil bude uložený, ale nebude viditeľný vo vyhľadávaní.`);
    }

    // Подготавливаем данные только с полями из таблицы masters
    const profileForDB: MasterProfile = {
      name: profileData.name,
      profession: profileData.profession,
      email: profileData.contact.email,
      phone: profileData.contact.phone,
      location: profileData.location,
      description: profileData.description,
      communication_style: profileData.communicationStyle,
      work_abroad: profileData.workAbroad,
      is_active: profileData.availability.available,
      is_available: profileData.availability.available,
      profile_completed: isProfileComplete,
      service_regular: profileData.serviceRegular,
      service_urgent: profileData.serviceUrgent,
      service_realization: profileData.serviceRealization,
      experience_years: profileData.experienceYears,
      team_type: profileData.teamType,
      service_area: profileData.serviceArea,
      hourly_rate_min: profileData.hourlyRateMin ? parseFloat(profileData.hourlyRateMin) : 0,
      hourly_rate_max: profileData.hourlyRateMax ? parseFloat(profileData.hourlyRateMax) : 0,
      certificates: profileData.certificatesText,
      social_facebook: profileData.contact.socialMedia?.facebook || '',
      social_instagram: profileData.contact.socialMedia?.instagram || '',
      social_youtube: profileData.contact.socialMedia?.youtube || '',
      social_tiktok: profileData.contact.socialMedia?.tiktok || '',
      social_telegram: profileData.contact.socialMedia?.telegram || '',
      social_whatsapp: profileData.contact.socialMedia?.whatsapp || ''
    };

    // Сохраняем в Supabase
    const savedProfile = await saveMasterProfile(profileForDB);
    
    setEditingField(null);
    setHasChanges(false);
    setIsProfileSaved(true);
    
    // Call the parent callback to update the profile in the main app
    if (onProfileUpdate) {
      onProfileUpdate(savedProfile);
    }
    
    console.log('Profile saved to Supabase:', savedProfile);
    
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('Ошибка при сохранении профиля. Попробуйте снова.');
  } finally {
    setIsSaving(false);
  }
};

  const handleDeleteProfile = async () => {
  if (deleteConfirmationText !== 'ZMAZAŤ' || !user) return;
  
  setIsDeleting(true);
  try {
    // 1. Очищаем файлы из storage
    try {
      const { data: files } = await supabase.storage
        .from('profile-images')
        .list(user.id, { limit: 100 });
      
      if (files && files.length > 0) {
        const filesToDelete = files.map(file => `${user.id}/${file.name}`);
        await supabase.storage
          .from('profile-images')
          .remove(filesToDelete);
      }
    } catch (storageError) {
      console.log('Storage cleanup error:', storageError);
    }

    // 2. Помечаем профиль как удаленный (мягкое удаление)
    const { error: masterError } = await supabase
      .from('masters')
      .update({
        is_deleted: true,
        is_active: false,
        profile_completed: false,
        deleted_at: new Date().toISOString(),
        // Обнуляем персональные данные для безопасности
        name: `Deleted User ${user.id.substring(0, 8)}`,
        email: `deleted_${user.id}@deleted.com`,
        phone: '',
        description: '',
        profile_image_url: null,
        work_images_urls: [],
        work_video_url: []
      })
      .eq('user_id', user.id);

    if (masterError) {
      console.error('Error soft deleting master profile:', masterError);
      throw new Error('Chyba pri mazaní profilu');
    }

    // 3. Выходим из системы
    await signOut();
    
    // 4. Очищаем локальные данные
    localStorage.clear();
    sessionStorage.clear();
    
    // 5. Показываем сообщение и редиректим
    alert('Váš profil bol úspešne zmazaný');
    
    // Принудительный редирект на главную
    window.location.href = '/';
    
  } catch (error) {
    console.error('Delete profile error:', error);
    alert('Nastala chyba pri mazaní profilu. Skúste to znovu.');
  } finally {
    setIsDeleting(false);
  }
};

  // Check for payment result in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const canceled = params.get('canceled');
    const tab = params.get('tab');

    console.log('🔍 MasterDashboard mounted');
    console.log('🔍 URL:', window.location.href);
    console.log('🔍 Payment result params:', { success, canceled, tab });

    // Set the tab if provided
    if (tab === 'payments') {
      setActiveTab('payments');
    } else if (tab === 'offers' || tab === 'ponuky') {
      setActiveTab('offers');
    }

    if (success === 'true') {
      console.log('Payment successful! Showing loading state');
      const planParam = params.get('plan');

      // Show loading state immediately
      setShowPaymentResult({
        show: true,
        success: true,
        message: 'Spracovávam platbu...',
        isLoading: true
      });

      // Reload subscription data with delay to allow webhook to process
      const reloadSubscription = async () => {
        // Wait 3 seconds for webhook to complete
        await new Promise(resolve => setTimeout(resolve, 3000));
        let subscription = await getUserActiveSubscription();

        // If no subscription found, try again after 2 more seconds
        if (!subscription) {
          console.log('Subscription not found, retrying...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          subscription = await getUserActiveSubscription();
        }

        setActiveSubscription(subscription);
        console.log('Loaded subscription:', subscription);
        if (subscription?.current_period_end) {
          console.log('Period end raw:', subscription.current_period_end);
          console.log('Period end parsed:', new Date(subscription.current_period_end));
          console.log('Period end formatted:', new Date(subscription.current_period_end).toLocaleDateString('sk-SK'));
        }

        // Clean URL now that we have the data
        window.history.replaceState({}, '', window.location.pathname);

        // Check if we successfully got a subscription
        if (subscription) {
          // Show success modal with plan info
          setShowPaymentResult({
            show: true,
            success: true,
            message: 'Platba bola úspešne spracovaná! Váš plán je teraz aktívny.',
            planName: subscription.plan_name,
            billingPeriod: subscription.billing_period,
            isLoading: false
          });
        } else {
          // Payment went through but subscription wasn't created - show error
          console.error('Payment succeeded but subscription not found in database');
          setShowPaymentResult({
            show: true,
            success: false,
            message: 'Platba bola spracovaná, ale nepodarilo sa aktivovať predplatné. Prosím, kontaktujte podporu.',
            isLoading: false
          });
        }
      };
      reloadSubscription();
    } else if (canceled === 'true') {
      console.log('Payment canceled! Showing cancel modal');
      setShowPaymentResult({
        show: true,
        success: false,
        message: 'Platba bola zrušená. Môžete to skúsiť znovu.'
      });

      // Clean URL immediately
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Load master ID and profile data on mount
  useEffect(() => {
    const loadMasterData = async () => {
      if (!user) {
        setIsLoadingProfile(false);
        return;
      }

      setIsLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from('masters')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          // Профиль не найден - создаем новый
          console.log('Creating master profile for existing user:', user.id);
          const { data: newProfile, error: createError } = await supabase
            .from('masters')
            .insert({
              user_id: user.id,
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Nový majster',
              profession: 'Majster',
              email: user.email || '',
              phone: user.user_metadata?.phone || '',
              location: user.user_metadata?.location || '',
              description: '',
              is_active: true,
              profile_completed: false
            })
            .select()
            .maybeSingle();

          if (createError) {
            // Если ошибка duplicate key - профиль уже существует, загружаем его
            if (createError.code === '23505') {
              console.log('Profile already exists, reloading...');
              const { data: existingProfile } = await supabase
                .from('masters')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

              if (existingProfile) {
                setMasterId(existingProfile.id);
                // Update profile data with loaded values
                setProfileData(prev => ({
                  ...prev,
                  name: existingProfile.name || prev.name,
                  profession: existingProfile.profession || prev.profession,
                  location: existingProfile.location || prev.location,
                  description: (existingProfile.description && existingProfile.description !== 'Profesionálny majster') ? existingProfile.description : '',
                  communicationStyle: existingProfile.communication_style || '',
                  workAbroad: existingProfile.work_abroad || false,
                  profileImageUrl: existingProfile.profile_image_url || undefined,
                  contact: {
                    ...prev.contact,
                    phone: existingProfile.phone || prev.contact.phone,
                    email: existingProfile.email || prev.contact.email,
                    socialMedia: {
                      facebook: existingProfile.social_facebook || '',
                      instagram: existingProfile.social_instagram || '',
                      youtube: existingProfile.social_youtube || '',
                      tiktok: existingProfile.social_tiktok || '',
                      telegram: existingProfile.social_telegram || '',
                      whatsapp: existingProfile.social_whatsapp || ''
                    }
                  },
                  availability: {
                    ...prev.availability,
                    available: existingProfile.is_available ?? prev.availability.available,
                  },
                  serviceRegular: existingProfile.service_regular || false,
                  serviceUrgent: existingProfile.service_urgent || false,
                  serviceRealization: existingProfile.service_realization || false,
                  experienceYears: existingProfile.experience_years || 0,
                  teamType: existingProfile.team_type || 'individuálne',
                  serviceArea: existingProfile.service_area || 'lokálne',
                  hourlyRateMin: existingProfile.hourly_rate_min?.toString() || '',
                  hourlyRateMax: existingProfile.hourly_rate_max?.toString() || '',
                  certificatesText: existingProfile.certificates || '',
                }));
              }
              return;
            }
            console.error('Error creating master profile:', createError);
            return;
          }

          if (newProfile) {
            setMasterId(newProfile.id);
          }
          return;
        }

        setMasterId(data.id);

        // Update profile data with loaded values
        setProfileData(prev => ({
          ...prev,
          name: data.name || prev.name,
          profession: data.profession || prev.profession,
          location: data.location || prev.location,
          description: (data.description && data.description !== 'Profesionálny majster') ? data.description : '',
          communicationStyle: data.communication_style || '',
          workAbroad: data.work_abroad || false,
          profileImageUrl: data.profile_image_url || undefined,
          contact: {
            ...prev.contact,
            phone: data.phone || prev.contact.phone,
            email: data.email || prev.contact.email,
            socialMedia: {
              facebook: data.social_facebook || '',
              instagram: data.social_instagram || '',
              youtube: data.social_youtube || '',
              tiktok: data.social_tiktok || '',
              telegram: data.social_telegram || '',
              whatsapp: data.social_whatsapp || ''
            }
          },
          availability: {
            ...prev.availability,
            available: data.is_available ?? prev.availability.available,
          },
          serviceRegular: data.service_regular || false,
          serviceUrgent: data.service_urgent || false,
          serviceRealization: data.service_realization || false,
          experienceYears: data.experience_years || 0,
          teamType: data.team_type || 'individuálne',
          serviceArea: data.service_area || 'lokálne',
          hourlyRateMin: data.hourly_rate_min?.toString() || '',
          hourlyRateMax: data.hourly_rate_max?.toString() || '',
          certificatesText: data.certificates || '',
        }));
      } catch (error) {
        console.error('Error loading master data:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadMasterData();
  }, [user]);

  useEffect(() => {
    const loadSubscription = async () => {
      const subscription = await getUserActiveSubscription();
      console.log('Initial subscription load:', subscription);
      if (subscription?.current_period_end) {
        console.log('Initial period end raw:', subscription.current_period_end);
        console.log('Initial period end parsed:', new Date(subscription.current_period_end));
        console.log('Initial period end formatted:', new Date(subscription.current_period_end).toLocaleDateString('sk-SK'));
      }
      setActiveSubscription(subscription);
    };

    if (user) {
      loadSubscription();
    }
  }, [user]);

  // Load contact hours display
  useEffect(() => {
    const loadContactHours = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('master_contact_hours')
          .select('*')
          .eq('master_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          if (data.is_24_7) {
            setContactHoursDisplay('Dostupný 24/7');
          } else {
            const schedule = data.schedule as any;
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const dayLabels = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];

            const activeDays = days
              .map((day, index) => {
                if (schedule[day] && schedule[day].length > 0) {
                  const times = schedule[day].map((slot: any) => `${slot.start}-${slot.end}`).join(', ');
                  return `${dayLabels[index]}: ${times}`;
                }
                return null;
              })
              .filter(Boolean);

            if (activeDays.length > 0) {
              setContactHoursDisplay(activeDays.join(' | '));
            }
          }
        }
      } catch (error) {
        console.error('Error loading contact hours:', error);
      }
    };

    loadContactHours();
  }, [user?.id]);

  const handleFieldChange = (field: string, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleNestedFieldChange = (parentField: string, childField: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof typeof prev] as any,
        [childField]: value
      }
    }));
    setHasChanges(true);
  };

  const startEditing = (field: string) => {
    setEditingField(field);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setHasChanges(false);
  };

  // Calendar functions
  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const toggleDateAvailability = (date: Date) => {
    const dateKey = formatDateKey(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return;
    
    setAvailability(prev => {
      const current = prev[dateKey] || 'unavailable';
      let newStatus: 'available' | 'unavailable' | 'booked';
      
      if (current === 'unavailable') {
        newStatus = 'available';
      } else if (current === 'available') {
        newStatus = 'booked';
      } else {
        newStatus = 'unavailable';
      }
      
      return {
        ...prev,
        [dateKey]: newStatus
      };
    });
  };

  const setDateStatus = (date: Date, status: 'available' | 'unavailable') => {
    const dateKey = formatDateKey(date);
    setAvailability(prev => ({
      ...prev,
      [dateKey]: status
    }));
  };

  const setTodayStatus = (status: 'available' | 'unavailable') => {
    const today = new Date();
    setDateStatus(today, status);
  };

  // Load projects from database
  useEffect(() => {
    const loadProjectsData = async () => {
      if (!masterId) return;

      setIsLoadingProjects(true);
      const projectsData = await ProjectsAPI.loadProjects(masterId);
      setProjects(projectsData);
      setIsLoadingProjects(false);
    };

    loadProjectsData();
  }, [masterId]);

  // Project functions
  const addNewProject = async () => {
    if (!newProjectName.trim() || Object.keys(projects).length >= 20 || !masterId) return;

    const projectId = await ProjectsAPI.createProject(masterId, newProjectName.trim());
    if (!projectId) {
      alert('Chyba pri vytváraní projektu');
      return;
    }

    const newProject = {
      name: newProjectName.trim(),
      phases: {
        priprava: { notes: [] },
        realizacia: { notes: [] },
        ukoncenie: { notes: [] }
      }
    };

    setProjects(prev => ({
      ...prev,
      [projectId]: newProject
    }));

    setNewProjectName('');
    setShowNewProjectModal(false);
    setSelectedProject(projectId);
  };

  const addNote = async (projectId: string, phase: 'priprava' | 'realizacia' | 'ukoncenie', text: string) => {
    if (!text.trim()) return;

    const currentPhaseNotes = projects[projectId]?.phases[phase]?.notes || [];
    if (currentPhaseNotes.length >= 10) return;

    const orderIndex = currentPhaseNotes.length;
    const newNote = await ProjectsAPI.addTask(projectId, phase, text.trim(), orderIndex);

    if (!newNote) {
      alert('Chyba pri pridávaní úlohy');
      return;
    }

    setProjects(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        phases: {
          ...prev[projectId].phases,
          [phase]: {
            notes: [...currentPhaseNotes, newNote]
          }
        }
      }
    }));

    setNewNoteText('');
  };

  const toggleNoteCompletion = async (projectId: string, phase: 'priprava' | 'realizacia' | 'ukoncenie', noteId: string) => {
    const note = projects[projectId]?.phases[phase]?.notes.find(n => n.id === noteId);
    if (!note) return;

    const success = await ProjectsAPI.toggleTaskCompletion(noteId, !note.completed);
    if (!success) {
      alert('Chyba pri aktualizácii úlohy');
      return;
    }

    setProjects(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        phases: {
          ...prev[projectId].phases,
          [phase]: {
            notes: prev[projectId].phases[phase].notes.map(note =>
              note.id === noteId ? { ...note, completed: !note.completed } : note
            )
          }
        }
      }
    }));
  };

  const deleteNote = async (projectId: string, phase: 'priprava' | 'realizacia' | 'ukoncenie', noteId: string) => {
    const success = await ProjectsAPI.deleteTask(noteId);
    if (!success) {
      alert('Chyba pri mazaní úlohy');
      return;
    }

    setProjects(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        phases: {
          ...prev[projectId].phases,
          [phase]: {
            notes: prev[projectId].phases[phase].notes.filter(note => note.id !== noteId)
          }
        }
      }
    }));
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Naozaj chcete odstrániť tento projekt? Táto akcia je nevratná.')) return;

    const success = await ProjectsAPI.deleteProject(projectId);
    if (!success) {
      alert('Chyba pri mazaní projektu');
      return;
    }

    setProjects(prev => {
      const newProjects = { ...prev };
      delete newProjects[projectId];
      return newProjects;
    });

    if (selectedProject === projectId) {
      setSelectedProject(null);
    }
  };

  const calculateProjectProgress = (projectId: string) => {
    const project = projects[projectId];
    if (!project) return 0;
    
    const allNotes = [
      ...project.phases.priprava.notes,
      ...project.phases.realizacia.notes,
      ...project.phases.ukoncenie.notes
    ];
    
    if (allNotes.length === 0) return 0;
    
    const completedNotes = allNotes.filter(note => note.completed).length;
    return Math.round((completedNotes / allNotes.length) * 100);
  };

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - mondayOffset);
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const monthNames = [
    'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
    'Júl', 'August', 'September', 'Október', 'November', 'December'
  ];

  // All available professions from filter (grouped by category)
  // IMPORTANT: This list must EXACTLY match filterOptions.ts getProfessionOptions()
  const professions = [
    // Projektové profesie
    'Architekt', 'Interiérový dizajnér', 'Krajinný architekt', 'Statik', 'Projektant',
    'Energetický audítor', 'Geodet', 'Požiarny technik', 'BOZP koordinátor',
    'Rozpočtár', 'Technický dozor', 'Autorský dozor',

    // Stavebné profesie
    'Stavbyvedúci', 'Murár', 'Betónár', 'Tesár', 'Pokrývač', 'Izolatér',
    'Železobetónár', 'Stavebný robotník', 'Demolačník', 'Výkopový robotník',

    // Interiérové práce
    'Maliar', 'Podlahár', 'Obkladač', 'Sadrokartónár', 'Tapetár', 'Parkettár',
    'Kuchynský dizajnér', 'Stolár', 'Dekoratér', 'Čalúnnik',

    // Technické profesie
    'Elektrikár', 'Vodoinštalatér', 'Plynár', 'Kúrenár', 'Klimatizačný technik',
    'Technik solárnych systémov', 'Technik tepelných čerpadiel', 'Technik bezpečnostných systémov',
    'Smart home technik', 'Výťahový technik', 'Bazénový technik', 'Studniar',

    // Exteriérové práce
    'Fasádnik', 'Záhradník', 'Plotár', 'Tesár terás', 'Dlažbár', 'Montážnik strešných okien',
    'Klampiar', 'Komínár', 'Montážnik pergol', 'Montážnik zimných záhrad', 'Staviteľ altánkov', 'Osvetľovací technik',

    // Špecializované služby
    'Upratovač', 'Sťahovák', 'Automechanik', 'Fotograf'
  ];

  const experienceLevels = [
    'Začiatočník', '1 rok', '2 roky', '5 rokov', 'viac ako 10 rokov'
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-[#4169e1] transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Späť na úvod</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto md:overflow-x-visible gap-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-4 rounded-lg font-medium text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                activeTab === 'profile'
                  ? 'bg-gray-200 text-gray-900'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              Môj profil {activeSubscription && (
                <span className="ml-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">
                  {activeSubscription.plan_name?.toLowerCase() === 'mini' ? 'Mini' :
                   activeSubscription.plan_name?.toLowerCase() === 'odbornik' ? 'Odborník' :
                   activeSubscription.plan_name?.toLowerCase() === 'expert' ? 'Expert' :
                   activeSubscription.plan_name?.toLowerCase() === 'profik' ? 'Profik' :
                   activeSubscription.plan_name?.toLowerCase() === 'premier' ? 'Premier' : activeSubscription.plan_name}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-3 px-4 rounded-lg font-medium text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-gray-200 text-gray-900'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              Môj kalendár
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`py-3 px-4 rounded-lg font-medium text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                activeTab === 'portfolio'
                  ? 'bg-gray-200 text-gray-900'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              Moja recenzia
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-3 px-4 rounded-lg font-medium text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                activeTab === 'projects'
                  ? 'bg-gray-200 text-gray-900'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              Moje stavby
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`py-3 px-4 rounded-lg font-medium text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                activeTab === 'offers'
                  ? 'bg-gray-200 text-gray-900'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <CircleEuroIcon size={22} color="black" />
                Moje ponuky
              </div>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-3 px-4 rounded-lg font-medium text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                activeTab === 'payments'
                  ? 'bg-gray-200 text-gray-900'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              Moje predplatné
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'profile' && (
          <>
            {isLoadingProfile ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Loading skeleton */}
                {[1, 2, 3].map((col) => (
                  <div key={col} className="space-y-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="h-8 bg-gray-200 rounded w-3/4 mb-6 animate-pulse"></div>
                      <div className="space-y-4">
                        <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="h-8 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>
                      <div className="space-y-3">
                        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1: Photos */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2">Pridajte vaše fotky</h3>
                  {hasChanges && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm"
                      >
                        <Save size={14} />
                        <span>Uložiť</span>
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="bg-gray-500 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm"
                      >
                        <X size={14} />
                        <span>Zrušiť</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile Photo */}
                <div className="text-center mb-6">
                  <div className="w-32 h-32 mx-auto bg-gray-200 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                    {profileData.profileImageUrl ? (
                      <img
                        src={profileData.profileImageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera size={32} className="text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Profilová fotka</p>
                  <p className="text-xs text-gray-500 mb-2">Takto vyzerá na webe</p>
                  <FileUploadManager
                    fileType="avatar"
                    onUploadComplete={(urls) => {
                      console.log('Avatar uploaded:', urls);
                      if (urls && urls.length > 0) {
                        setProfileData(prev => ({ ...prev, profileImageUrl: urls[0] }));
                        setHasChanges(true);
                      }
                    }}
                  />
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800">
                      💡 <strong>Tip:</strong> Majstri s profilovou fotkou majú o 70% vyššiu šancu získať zákazku!
                      Ukážte svoju tvár - vzbudzuje to dôveru u klientov.
                    </p>
                  </div>
                </div>

                {/* Work Photos */}
                <div>
                  <h4 className="font-medium mb-3">Ukážky práce</h4>
                  <FileUploadManager
                    fileType="work-images"
                    onUploadComplete={(urls) => {
                      console.log('Work images uploaded:', urls);
                    }}
                  />
                </div>
                
                {/* Work Videos */}
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Video ukážky práce</h4>
                  <FileUploadManager
                    fileType="work-videos"
                    onUploadComplete={(urls) => {
                      console.log('Work videos uploaded:', urls);
                    }}
                  />
                  
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-800">
                      💡 <strong>Tip:</strong> Kvalitné fotky vašej práce sú najlepšia reklama! 
                      Ukážte pred/po, detaily a finálny výsledok. Video ukážky zvyšujú dôveru o 90%!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Identity & Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2">Vypíšte vašu prezentáciu</h3>
                  {hasChanges && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-1"
                      >
                        <Save size={16} />
                        <span>Uložiť</span>
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-1"
                      >
                        <X size={16} />
                        <span>Zrušiť</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Name & Profession */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                      Meno a profesia
                    </label>
                    {editingField === 'name-profession' ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Vaše meno"
                          value={profileData.name}
                          onChange={(e) => handleFieldChange('name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                        />
                        <select
                          value={profileData.profession}
                          onChange={(e) => handleFieldChange('profession', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent ${
                            !profileData.profession ? 'border-red-500 border-2' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Vyberte profesiu</option>
                          {professions.map(prof => (
                            <option key={prof} value={prof}>{prof}</option>
                          ))}
                        </select>
                        {!profileData.profession && (
                          <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                            <AlertTriangle size={16} />
                            Povinné pole! Bez neho nebude váš profil viditeľný vo vyhľadávaní.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p
                          className={`cursor-pointer hover:bg-gray-50 p-2 rounded border-2 transition-colors ${
                            !profileData.profession
                              ? 'border-red-500 text-gray-900'
                              : 'border-transparent hover:border-gray-200 text-gray-900'
                          }`}
                          onClick={() => startEditing('name-profession')}
                        >
                          {profileData.profession && profileData.name
                            ? `${profileData.profession} - ${profileData.name}`
                            : 'Nevyplnené - kliknite pre úpravu'
                          }
                        </p>
                        {!profileData.profession && (
                          <p className="text-red-600 text-sm font-medium flex items-center gap-1 mt-1">
                            <AlertTriangle size={16} />
                            Povinné pole! Bez neho nebude váš profil viditeľný vo vyhľadávaní.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Location & Availability */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                      Lokalita a dostupnosť
                    </label>
                    {editingField === 'location' ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Mesto/región"
                          value={profileData.location}
                          onChange={(e) => handleFieldChange('location', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent ${
                            !profileData.location ? 'border-red-500 border-2' : 'border-gray-300'
                          }`}
                        />
                        {!profileData.location && (
                          <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                            <AlertTriangle size={16} />
                            Povinné pole! Bez neho nebude váš profil viditeľný vo vyhľadávaní.
                          </p>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="available"
                              checked={profileData.availability.available}
                              onChange={(e) => handleNestedFieldChange('availability', 'available', e.target.checked)}
                              className="w-4 h-4 text-[#4169e1] rounded focus:ring-[#4169e1]"
                            />
                            <label htmlFor="available" className="text-sm font-medium">Chcem, aby zákazníci videli môj profil</label>
                          </div>
                          <p className="text-xs text-gray-500 ml-7">
                            Ak zrušíte označenie, váš profil nebude zobrazený na webovej stránke
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div
                          className={`flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 transition-colors ${
                            !profileData.location
                              ? 'border-red-500'
                              : 'border-transparent hover:border-gray-200'
                          }`}
                          onClick={() => startEditing('location')}
                        >
                          <MapPin size={16} className="text-gray-500" />
                          <span>{profileData.location || 'Nevyplnené - kliknite pre úpravu'}</span>
                          <div className={`w-3 h-3 rounded-full ${
                            profileData.availability.available ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                        </div>
                        {!profileData.location && (
                          <p className="text-red-600 text-sm font-medium flex items-center gap-1 mt-1">
                            <AlertTriangle size={16} />
                            Povinné pole! Bez neho nebude váš profil viditeľný vo vyhľadávaní.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Social Media */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                      Sociálne siete (voliteľné)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">Vložte úplné URL adresy k vašim profilom</p>
                    {editingField === 'social' ? (
                      <div className="space-y-2">
                        <input
                          type="url"
                          placeholder="Facebook URL (napr. https://facebook.com/vaseprofil)"
                          value={profileData.contact.socialMedia?.facebook || ''}
                          onChange={(e) => handleNestedFieldChange('contact', 'socialMedia', {
                            ...profileData.contact.socialMedia,
                            facebook: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent text-sm"
                        />
                        <input
                          type="url"
                          placeholder="Instagram URL (napr. https://instagram.com/vaseprofil)"
                          value={profileData.contact.socialMedia?.instagram || ''}
                          onChange={(e) => handleNestedFieldChange('contact', 'socialMedia', {
                            ...profileData.contact.socialMedia,
                            instagram: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent text-sm"
                        />
                        <input
                          type="url"
                          placeholder="YouTube URL (napr. https://youtube.com/@vaskanal)"
                          value={profileData.contact.socialMedia?.youtube || ''}
                          onChange={(e) => handleNestedFieldChange('contact', 'socialMedia', {
                            ...profileData.contact.socialMedia,
                            youtube: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent text-sm"
                        />
                        <input
                          type="url"
                          placeholder="TikTok URL (napr. https://tiktok.com/@vaseprofil)"
                          value={profileData.contact.socialMedia?.tiktok || ''}
                          onChange={(e) => handleNestedFieldChange('contact', 'socialMedia', {
                            ...profileData.contact.socialMedia,
                            tiktok: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent text-sm"
                        />
                        <input
                          type="url"
                          placeholder="Telegram URL (napr. https://t.me/vaseprofil)"
                          value={profileData.contact.socialMedia?.telegram || ''}
                          onChange={(e) => handleNestedFieldChange('contact', 'socialMedia', {
                            ...profileData.contact.socialMedia,
                            telegram: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent text-sm"
                        />
                        <input
                          type="url"
                          placeholder="WhatsApp URL (napr. https://wa.me/421xxxxxxxxx)"
                          value={profileData.contact.socialMedia?.whatsapp || ''}
                          onChange={(e) => handleNestedFieldChange('contact', 'socialMedia', {
                            ...profileData.contact.socialMedia,
                            whatsapp: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent text-sm"
                        />
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                        onClick={() => startEditing('social')}
                      >
                        {profileData.contact.socialMedia && Object.values(profileData.contact.socialMedia).some(v => v) ? (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(profileData.contact.socialMedia).map(([platform, url]) => (
                              url && (
                                <span key={platform} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs capitalize">
                                  {platform}
                                </span>
                              )
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">Nevyplnené - kliknite pre úpravu</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                      Čo robíte a ponúkate (max 1000 znakov)
                    </label>
                    <p className="text-sm text-gray-600 mb-2">
                      1. Opíšte konkrétne to s čím viete pomôcť vašemu zákazníkovy.<br/>
                      2. Vypíšte všetko čo robíte, všetky slová podľa ktorých<br/>
                      by vás vedel váš zákazník vyhľadať
                    </p>
                    {editingField === 'description' ? (
                      <div className="space-y-2">
                        <textarea
                          placeholder="Opíšte svoju prácu a služby..."
                          value={profileData.description}
                          onChange={(e) => handleFieldChange('description', e.target.value)}
                          maxLength={1000}
                          rows={4}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent ${
                            profileData.description.trim().length < 20 ? 'border-red-500 border-2' : 'border-gray-300'
                          }`}
                        />
                        {profileData.description.trim().length < 20 && (
                          <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                            <AlertTriangle size={16} />
                            Povinné pole! Minimum 20 znakov. Bez neho nebude váš profil viditeľný vo vyhľadávaní.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p
                          className={`text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 transition-colors min-h-[2.5rem] ${
                            profileData.description.trim().length < 20
                              ? 'border-red-500'
                              : 'border-transparent hover:border-gray-200'
                          }`}
                          onClick={() => startEditing('description')}
                        >
                          {profileData.description || 'Nevyplnené - kliknite pre úpravu'}
                        </p>
                        {profileData.description.trim().length < 20 && (
                          <p className="text-red-600 text-sm font-medium flex items-center gap-1 mt-1">
                            <AlertTriangle size={16} />
                            Povinné pole! Minimum 20 znakov. Bez neho nebude váš profil viditeľný vo vyhľadávaní.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                      Vek (voliteľné)
                    </label>
                    {editingField === 'age' ? (
                      <input
                        type="number"
                        placeholder="Váš vek"
                        min="18"
                        max="80"
                        value={profileData.age || ''}
                        onChange={(e) => handleFieldChange('age', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                      />
                    ) : (
                      <p 
                        className="text-gray-900 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                        onClick={() => startEditing('age')}
                      >
                        {profileData.age ? `${profileData.age} rokov` : 'Nevyplnené - kliknite pre úpravu'}
                      </p>
                    )}
                  </div>

                  {/* Services */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                      Čo riešim
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Tieto indikátory sa zobrazia na vašej profilovej fotke
                    </p>
                    {editingField === 'services' ? (
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border-2 border-transparent hover:border-blue-300 transition-colors">
                          <input
                            type="checkbox"
                            checked={profileData.serviceRegular}
                            onChange={(e) => handleFieldChange('serviceRegular', e.target.checked)}
                            className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                          />
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-8 bg-blue-500 rounded"></div>
                            <span className="text-sm font-medium">Pravidelný servis</span>
                          </div>
                        </label>
                        <label className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border-2 border-transparent hover:border-red-300 transition-colors">
                          <input
                            type="checkbox"
                            checked={profileData.serviceUrgent}
                            onChange={(e) => handleFieldChange('serviceUrgent', e.target.checked)}
                            className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                          />
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-8 bg-red-500 rounded"></div>
                            <span className="text-sm font-medium">Akútna porucha</span>
                          </div>
                        </label>
                        <label className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border-2 border-transparent hover:border-green-300 transition-colors">
                          <input
                            type="checkbox"
                            checked={profileData.serviceRealization}
                            onChange={(e) => handleFieldChange('serviceRealization', e.target.checked)}
                            className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
                          />
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-8 bg-green-500 rounded"></div>
                            <span className="text-sm font-medium">Plánovaná realizácia</span>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-gray-50 p-3 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                        onClick={() => startEditing('services')}
                      >
                        <div className="flex items-center space-x-3">
                          {profileData.serviceRegular && (
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-8 bg-blue-500 rounded"></div>
                              <span className="text-xs">Servis</span>
                            </div>
                          )}
                          {profileData.serviceUrgent && (
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-8 bg-red-500 rounded"></div>
                              <span className="text-xs">Porucha</span>
                            </div>
                          )}
                          {profileData.serviceRealization && (
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-8 bg-green-500 rounded"></div>
                              <span className="text-xs">Realizácia</span>
                            </div>
                          )}
                          {!profileData.serviceRegular && !profileData.serviceUrgent && !profileData.serviceRealization && (
                            <span className="text-gray-500">Nevyplnené - kliknite pre úpravu</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Communication Style */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                      Rád komunikujem
                    </label>
                    {editingField === 'communicationStyle' ? (
                      <div className="space-y-2">
                        <select
                          value={profileData.communicationStyle}
                          onChange={(e) => handleFieldChange('communicationStyle', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                        >
                          <option value="">Vyberte štýl komunikácie</option>
                          <option value="Profesionálne a vecne">Profesionálne a vecne</option>
                          <option value="Priateľsky a uvoľnene">Priateľsky a uvoľnene</option>
                          <option value="Rýchlo a jasno">Rýchlo a jasno</option>
                          <option value="Podrobne a trpezlivo">Podrobne a trpezlivo</option>
                          <option value="Jednoducho a zrozumiteľne">Jednoducho a zrozumiteľne</option>
                        </select>
                      </div>
                    ) : (
                      <p
                        className="text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                        onClick={() => startEditing('communicationStyle')}
                      >
                        {profileData.communicationStyle || 'Nevyplnené - kliknite pre úpravu'}
                      </p>
                    )}
                  </div>

                  {/* Work Abroad */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                      Pracujete aj v zahraničí?
                    </label>
                    {editingField === 'workAbroad' ? (
                      <div className="space-y-2">
                        <select
                          value={profileData.workAbroad ? 'yes' : 'no'}
                          onChange={(e) => handleFieldChange('workAbroad', e.target.value === 'yes')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                        >
                          <option value="no">Nie, nepracujem v zahraničí</option>
                          <option value="yes">Áno, súhlasím pracovať v zahraničí</option>
                        </select>
                      </div>
                    ) : (
                      <p
                        className="text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                        onClick={() => startEditing('workAbroad')}
                      >
                        {profileData.workAbroad ? 'Áno, súhlasím pracovať v zahraničí' : 'Nie, nepracujem v zahraničí'}
                      </p>
                    )}
                  </div>

                  {/* Experience Years */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                      Skúsenosti (roky)
                    </label>
                    {editingField === 'experienceYears' ? (
                      <input
                        type="number"
                        placeholder="5"
                        min="0"
                        value={profileData.experienceYears}
                        onChange={(e) => handleFieldChange('experienceYears', parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                      />
                    ) : (
                      <p
                        className="text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                        onClick={() => startEditing('experienceYears')}
                      >
                        {profileData.experienceYears ? `${profileData.experienceYears} rokov` : 'Nevyplnené - kliknite pre úpravu'}
                      </p>
                    )}
                  </div>

                  {/* Team Type */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                      Pracujem
                    </label>
                    {editingField === 'teamType' ? (
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="teamTypeRadio"
                            value="individuálne"
                            checked={profileData.teamType === 'individuálne'}
                            onChange={(e) => handleFieldChange('teamType', e.target.value)}
                            className="w-4 h-4 text-[#4169e1] focus:ring-[#4169e1]"
                          />
                          <span className="text-sm">Individuálne</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="teamTypeRadio"
                            value="skupina"
                            checked={profileData.teamType === 'skupina'}
                            onChange={(e) => handleFieldChange('teamType', e.target.value)}
                            className="w-4 h-4 text-[#4169e1] focus:ring-[#4169e1]"
                          />
                          <span className="text-sm">Skupina</span>
                        </label>
                      </div>
                    ) : (
                      <p
                        className="text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                        onClick={() => startEditing('teamType')}
                      >
                        {profileData.teamType || 'Nevyplnené - kliknite pre úpravu'}
                      </p>
                    )}
                  </div>

                  {/* Service Area */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                      Oblasť pôsobenia
                    </label>
                    {editingField === 'serviceArea' ? (
                      <select
                        value={profileData.serviceArea}
                        onChange={(e) => handleFieldChange('serviceArea', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                      >
                        <option value="lokálne">Lokálne</option>
                        <option value="lokálne + 50km">Lokálne + 50km</option>
                        <option value="celé slovensko">Celé Slovensko</option>
                      </select>
                    ) : (
                      <p
                        className="text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                        onClick={() => startEditing('serviceArea')}
                      >
                        {profileData.serviceArea || 'Nevyplnené - kliknite pre úpravu'}
                      </p>
                    )}
                  </div>

                  {/* Hourly Rate Range */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                      Cenové rozpätie (Hodinová sadzba)
                    </label>
                    {editingField === 'hourlyRateRange' ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="25"
                          value={profileData.hourlyRateMin}
                          onChange={(e) => handleFieldChange('hourlyRateMin', e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                        />
                        <span className="text-gray-600">-</span>
                        <input
                          type="number"
                          placeholder="45"
                          value={profileData.hourlyRateMax}
                          onChange={(e) => handleFieldChange('hourlyRateMax', e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                        />
                        <span className="text-gray-600">€/hod</span>
                      </div>
                    ) : (
                      <p
                        className="text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                        onClick={() => startEditing('hourlyRateRange')}
                      >
                        {profileData.hourlyRateMin && profileData.hourlyRateMax
                          ? `${profileData.hourlyRateMin} - ${profileData.hourlyRateMax} €/hod`
                          : 'Nevyplnené - kliknite pre úpravu'}
                      </p>
                    )}
                  </div>

                  {/* Certificates */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                      Certifikáty (Odborná spôsobilosť)
                    </label>
                    {editingField === 'certificatesText' ? (
                      <textarea
                        placeholder="Napíšte vaše certifikáty, napríklad:&#10;1) Certifikát XYZ&#10;2) Oprávnenie ABC&#10;3) Vzdelanie DEF"
                        value={profileData.certificatesText}
                        onChange={(e) => handleFieldChange('certificatesText', e.target.value)}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                      />
                    ) : (
                      <p
                        className="text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors whitespace-pre-wrap"
                        onClick={() => startEditing('certificatesText')}
                      >
                        {profileData.certificatesText || 'Nevyplnené - kliknite pre úpravu'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Calendar & Contact */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2 mb-6">Vyplnte váš kontakt</h3>
                
                {/* Availability Schedule */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kontaktujte ma
                  </label>
                  <button
                    onClick={() => setShowContactHoursModal(true)}
                    className="w-full flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg hover:border-[#4169e1] hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <Clock size={20} className="text-[#4169e1]" />
                      <span className="text-gray-900">
                        {contactHoursDisplay || 'Nastaviť kontaktné hodiny'}
                      </span>
                    </div>
                    <Settings size={18} className="text-gray-400" />
                  </button>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                      Telefón
                    </label>
                    {editingField === 'phone' ? (
                      <input
                        type="tel"
                        placeholder="+421 9xx xxx xxx"
                        value={profileData.contact.phone}
                        onChange={(e) => handleNestedFieldChange('contact', 'phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                      />
                    ) : (
                      <div 
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                        onClick={() => startEditing('phone')}
                      >
                        <Phone size={16} className="text-gray-500" />
                        <span>{profileData.contact.phone || 'Nevyplnené - kliknite pre úpravu'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                      Email
                    </label>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Mail size={16} className="text-gray-500" />
                        <span className="text-gray-900">{user?.email || profileData.contact.email || 'Не указан'}</span>
                      </div>
                      {activeSubscription && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                          {activeSubscription.plan_name?.toLowerCase() === 'mini' ? 'Mini' :
                           activeSubscription.plan_name?.toLowerCase() === 'odbornik' ? 'Odborník' :
                           activeSubscription.plan_name?.toLowerCase() === 'expert' ? 'Expert' :
                           activeSubscription.plan_name?.toLowerCase() === 'profik' ? 'Profik' :
                           activeSubscription.plan_name?.toLowerCase() === 'premier' ? 'Premier' : activeSubscription.plan_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">
                      Webstránka (voliteľné)
                    </label>
                    {editingField === 'website' ? (
                      <input
                        type="url"
                        placeholder="www.vasa-stranka.sk"
                        value={profileData.contact.website}
                        onChange={(e) => handleNestedFieldChange('contact', 'website', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                      />
                    ) : (
                      <div 
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                        onClick={() => startEditing('website')}
                      >
                        <Globe size={16} className="text-gray-500" />
                        <span>{profileData.contact.website || 'Nevyplnené - kliknite pre úpravu'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Calendar Preview */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-sm font-medium">Kalendár dostupnosti</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Detailný kalendár nájdete v záložke "Kalendár dostupnosti"
                  </p>
                </div>

                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#4169e1] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#3558d4] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Ukladám...</span>
                      </>
                    ) : (
                      <span>Uložiť rozvrh</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                <h4 className="font-semibold text-blue-900 mb-3">💡 Tipy pre úspech</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Kompletne vyplnený profil má 3x vyššiu šancu na zákazku</li>
                  <li>• Kvalitné fotky zvyšujú dôveryhodnosť o 85%</li>
                  <li>• Rýchla odpoveď (do 1h) zvyšuje úspešnosť o 60%</li>
                  <li>• Pozitivné hodnotenia sú kľúčom k úspechu</li>
                </ul>
              </div>

              {/* Delete Profile Section */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
                  <AlertTriangle className="mr-2" size={24} />
                  Nebezpečná zóna
                </h3>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-red-800 mb-2">Zmazanie profilu</h4>
                  <p className="text-red-700 text-sm mb-3">
                    Táto akcia je <strong>nevratná</strong>. Budú zmazané:
                  </p>
                  <ul className="text-red-700 text-sm space-y-1 mb-4">
                    <li>• Všetky údaje profilu</li>
                    <li>• Nahrané fotografie a videá</li>
                    <li>• História hodnotení</li>
                    <li>• Váš používateľský účet</li>
                  </ul>
                  
                  {!showDeleteConfirmation ? (
                    <button
                      onClick={() => setShowDeleteConfirmation(true)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Zmazať profil
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-red-800 font-medium">
                        Pre potvrdenie napíšte: <code className="bg-red-200 px-2 py-1 rounded">ZMAZAŤ</code>
                      </p>
                      <input
                        type="text"
                        value={deleteConfirmationText}
                        onChange={(e) => setDeleteConfirmationText(e.target.value)}
                        className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Napíšte ZMAZAŤ"
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={handleDeleteProfile}
                          disabled={deleteConfirmationText !== 'ZMAZAŤ' || isDeleting}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {isDeleting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Mazanie...
                            </>
                          ) : (
                            'Definitívne zmazať'
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirmation(false);
                            setDeleteConfirmationText('');
                          }}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                          Zrušiť
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
            )}
          </>
        )}

        {activeTab === 'calendar' && masterId && (
          <div className="max-w-4xl mx-auto">
            <AvailabilityCalendar masterId={masterId} isEditable={true} />
          </div>
        )}

        {activeTab === 'portfolio' && (
          <MasterPortfolio isEditable={true} />
        )}

        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Projects List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2">Moje projekty</h3>
                  <button 
                    onClick={() => setShowNewProjectModal(true)}
                    disabled={Object.keys(projects).length >= 20}
                    className="bg-[#4169e1] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#3558d4] transition-colors flex items-center space-x-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                    <span>Nový projekt</span>
                  </button>
                </div>
                
                {/* Project count indicator */}
                <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                  Projekty: {Object.keys(projects).length}/20
                </div>

                {isLoadingProjects ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169e1] mx-auto"></div>
                    <p className="mt-2">Načítavam projekty...</p>
                  </div>
                ) : Object.keys(projects).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl mb-4 block">📋</span>
                    <p className="mb-2">Zatiaľ nemáte žiadne projekty</p>
                    <p className="text-sm">Vytvorte si prvý projekt pomocou tlačidla vyššie</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(projects).map(([projectId, project]) => {
                    const progress = calculateProjectProgress(projectId);
                    const isSelected = selectedProject === projectId;
                    
                    return (
                      <div
                        key={projectId}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-[#4169e1] bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4
                            onClick={() => setSelectedProject(projectId)}
                            className="font-medium cursor-pointer flex-1"
                          >
                            {project.name}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProject(projectId);
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors p-1 ml-2"
                            title="Odstrániť projekt"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Hotovosť:</span>
                          <span className={`font-semibold ${
                            progress === 100 ? 'text-green-600' : 
                            progress >= 70 ? 'text-blue-600' : 
                            progress >= 30 ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              progress === 100 ? 'bg-green-500' : 
                              progress >= 70 ? 'bg-blue-500' : 
                              progress >= 30 ? 'bg-yellow-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}
              </div>
            </div>

            {/* Right Column - Project Details */}
            <div className="lg:col-span-2">
              {selectedProject ? (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">{projects[selectedProject].name}</h3>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => deleteProject(selectedProject)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg flex items-center space-x-2"
                        title="Odstrániť projekt"
                      >
                        <Trash2 size={18} />
                        <span className="text-sm">Odstrániť</span>
                      </button>
                      <span className="text-lg font-semibold text-[#4169e1]">
                        {calculateProjectProgress(selectedProject)}% hotové
                      </span>
                    </div>
                  </div>

                  {/* Phase Navigation */}
                  <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                    {(['priprava', 'realizacia', 'ukoncenie'] as const).map((phase) => (
                      <button
                        key={phase}
                        onClick={() => setActivePhase(phase)}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          activePhase === phase
                            ? 'bg-[#4169e1] text-white'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        {phase === 'priprava' ? 'Príprava' :
                         phase === 'realizacia' ? 'Realizácia' : 'Ukončenie'}
                      </button>
                    ))}
                  </div>

                  {/* Phase Content */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium">
                        {activePhase === 'priprava' ? 'Príprava' :
                         activePhase === 'realizacia' ? 'Realizácia' : 'Ukončenie'}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {projects[selectedProject].phases[activePhase].notes.length}/10 úloh
                      </span>
                    </div>

                    {/* Add New Note */}
                    {projects[selectedProject].phases[activePhase].notes.length < 10 && (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addNote(selectedProject, activePhase, newNoteText);
                            }
                          }}
                          placeholder="Pridať novú úlohu..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                        />
                        <button
                          onClick={() => addNote(selectedProject, activePhase, newNoteText)}
                          className="bg-[#4169e1] text-white px-4 py-2 rounded-lg hover:bg-[#3558d4] transition-colors flex items-center"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    )}

                    {/* Notes List */}
                    <div className="space-y-3">
                      {projects[selectedProject].phases[activePhase].notes.map((note) => (
                        <div
                          key={note.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                            note.completed 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={note.completed}
                            onChange={() => toggleNoteCompletion(selectedProject, activePhase, note.id)}
                            className="w-5 h-5 text-[#4169e1] rounded focus:ring-[#4169e1]"
                          />
                          <span className={`flex-1 ${
                            note.completed 
                              ? 'text-green-800 line-through' 
                              : 'text-gray-800'
                          }`}>
                            {note.text}
                          </span>
                          <button
                            onClick={() => deleteNote(selectedProject, activePhase, note.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      
                      {projects[selectedProject].phases[activePhase].notes.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <span className="text-4xl mb-4 block">📝</span>
                          <p>Žiadne úlohy v tejto fáze</p>
                          <p className="text-sm">Pridajte novú úlohu pomocou formulára vyššie</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Summary */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h5 className="font-medium text-blue-900 mb-3">Súhrn projektu</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {(['priprava', 'realizacia', 'ukoncenie'] as const).map((phase) => {
                        const phaseNotes = projects[selectedProject].phases[phase].notes;
                        const completed = phaseNotes.filter(note => note.completed).length;
                        const total = phaseNotes.length;
                        
                        return (
                          <div key={phase} className="text-center">
                            <div className="font-medium text-blue-900">
                              {phase === 'priprava' ? 'Príprava' :
                               phase === 'realizacia' ? 'Realizácia' : 'Ukončenie'}
                            </div>
                            <div className="text-blue-700">
                              {completed}/{total} úloh
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="text-center py-12 text-gray-500">
                    <span className="text-6xl mb-4 block">🏗️</span>
                    <h3 className="text-xl font-medium mb-2">Začnite svoj prvý projekt</h3>
                    <p>Kliknite na "Nový projekt" pre vytvorenie plánu práce s fázami a úlohami</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'offers' && masterId && (
          <OffersList masterId={masterId} />
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Platby a predplatné</h2>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>POZOR:</strong> Po zaplatení už od 9,9€ mesačne môžete získať zákazky za tisíce €, správny majster získa certifikáciu odborníka / experta / profika, už od teraz a zvýši tak svoju dôveru v očiach nových prichádzajúcich klientov.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Denne na Slovensku hľadajú 10tky až 100vky ľudí niekoho, presne ako vás alebo niekoho z vášho oboru,</strong> hlavne sa nezabudnite nechať kvalitne finančne ohodnotiť ako správny Majster.
              </p>
            </div>

            {/* Current Active Plan */}
            {activeSubscription && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 text-white rounded-full p-2">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Váš aktívny plán: {
                          activeSubscription.plan_name.toLowerCase() === 'mini' ? 'Mini' :
                          activeSubscription.plan_name.toLowerCase() === 'odbornik' || activeSubscription.plan_name === 'Odborník' ? 'Odborník' :
                          activeSubscription.plan_name.toLowerCase() === 'expert' ? 'Expert' :
                          activeSubscription.plan_name.toLowerCase() === 'profik' ? 'Profik' :
                          activeSubscription.plan_name.toLowerCase() === 'premier' ? 'Premier' : activeSubscription.plan_name
                        }
                      </h3>
                      <p className="text-sm text-gray-600">
                        {activeSubscription.billing_period === 'lifetime' ? 'Doživotný prístup' :
                         activeSubscription.billing_period === 'yearly' ? 'Ročné predplatné' : 'Mesačné predplatné'}
                        {activeSubscription.current_period_end &&
                          ` • Platné do ${new Date(activeSubscription.current_period_end).toLocaleDateString('sk-SK')}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{activeSubscription.amount_paid}€</p>
                    <p className="text-xs text-gray-500">Zaplatené</p>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Period Toggle */}
            <div className="flex items-center justify-center gap-4 bg-gray-100 p-3 rounded-xl">
              <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Mesačne
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  billingPeriod === 'yearly' ? 'bg-blue-600' : 'bg-gray-400'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    billingPeriod === 'yearly' ? 'translate-x-7' : ''
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Ročne
              </span>
              <span className="ml-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Ušetríte až 17%
              </span>
            </div>

            {/* Subscription Plans Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 text-center">
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-3">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">Využite teraz garantovanú dotovanú cenu</span>
                </div>
                <p className="text-lg opacity-90">Nestratíte pozornosť a zákaziek bude viac.</p>
                {activeSubscription && (
                  <div className="mt-4 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Váš aktuálny plán:</p>
                    <p className="text-2xl font-bold">
                      {activeSubscription.plan_name?.toLowerCase() === 'mini' ? 'Mini' :
                       activeSubscription.plan_name?.toLowerCase() === 'odbornik' ? 'Odborník' :
                       activeSubscription.plan_name?.toLowerCase() === 'expert' ? 'Expert' :
                       activeSubscription.plan_name?.toLowerCase() === 'profik' ? 'Profik' :
                       activeSubscription.plan_name?.toLowerCase() === 'premier' ? 'Premier' : activeSubscription.plan_name}
                    </p>
                    <p className="text-xs opacity-80 mt-1">
                      {activeSubscription.status === 'active' ? 'Aktívny' : activeSubscription.status}
                    </p>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left px-3 py-2 font-semibold text-gray-900 bg-gray-50 text-xs" rowSpan={2}>
                        Názov predajného profilu
                      </th>
                      <th className="text-center px-2 py-1.5 bg-gray-50 border-l border-gray-300">
                        <div className="text-xs font-semibold text-gray-700">Mini</div>
                      </th>
                      <th className="text-center px-2 py-1.5 bg-gray-50 border-l border-gray-300">
                        <div className="text-xs font-semibold text-gray-700">Odborník</div>
                      </th>
                      <th className="text-center px-2 py-1.5 bg-gray-50 border-l border-gray-300">
                        <div className="text-xs font-semibold text-gray-700">Expert</div>
                      </th>
                      <th className="text-center px-2 py-1.5 bg-gray-50 border-l border-gray-300">
                        <div className="text-xs font-semibold text-gray-700">Profik</div>
                      </th>
                      <th className="text-center px-2 py-1.5 bg-gray-50 border-l border-gray-300">
                        <div className="text-xs font-semibold text-gray-700">Premier</div>
                      </th>
                    </tr>
                    <tr className="border-b-2 border-gray-300 bg-red-50">
                      <th className="text-center px-2 py-1.5 border-l border-gray-300">
                        <div className="text-[10px] font-bold text-red-600 mb-0.5">Doživotný profil</div>
                        <div className="text-xs font-bold text-red-600">Zadarma</div>
                      </th>
                      <th className="text-center px-2 py-1.5 border-l border-gray-300">
                        <div className="text-[10px] font-bold text-red-600 mb-0.5">Doživotný profil</div>
                        <div className="text-xs font-bold text-red-600 line-through">19,99€</div>
                      </th>
                      <th className="text-center px-2 py-1.5 border-l border-gray-300">
                        <div className="text-[10px] font-bold text-red-600 mb-0.5">Doživotný profil</div>
                        <div className="text-xs font-bold text-red-600 line-through">41,99€</div>
                      </th>
                      <th className="text-center px-2 py-1.5 border-l border-gray-300">
                        <div className="text-[10px] font-bold text-red-600 mb-0.5">Doživotný profil</div>
                        <div className="text-xs font-bold text-red-600 line-through">65,99€</div>
                      </th>
                      <th className="text-center px-2 py-1.5 border-l border-gray-300">
                        <div className="text-[10px] font-bold text-red-600 mb-0.5">Doživotný profil</div>
                        <div className="text-xs font-bold text-red-600 line-through">9 999€</div>
                      </th>
                    </tr>
                    <tr className="border-b-2 border-gray-300 bg-gray-100">
                      <th className="text-left px-3 py-2 font-bold text-gray-900 text-xs">
                        Cena hodnota
                      </th>
                      <th className="text-center px-2 py-1.5 border-l border-gray-300">
                        <div className="text-base font-bold text-blue-600">Zdarma</div>
                      </th>
                      <th className="text-center px-2 py-1.5 border-l border-gray-300">
                        <div className="text-base font-bold text-blue-600">9,90€</div>
                      </th>
                      <th className="text-center px-2 py-1.5 border-l border-gray-300">
                        <div className="text-base font-bold text-blue-600">19,90€</div>
                      </th>
                      <th className="text-center px-2 py-1.5 border-l border-gray-300 bg-orange-50">
                        <div className="text-base font-bold text-orange-600">25,50€</div>
                      </th>
                      <th className="text-center px-2 py-1.5 border-l border-gray-300">
                        <div className="text-base font-bold text-blue-600">4 979€</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 1, name: 'Predajný doživotný profil Zdarma', zdarma: true, odbornik: true, expert: true, profik: true, premier: true },
                      { id: 2, name: 'Osobný AI predajca ktorý šetrí váš čas a aktívne predá vaše služby alebo produkty', zdarma: false, odbornik: false, expert: false, profik: true, premier: true },
                      { id: 3, name: 'Rozvoj podnikania profesionálne on-line kurzy a certifikácie (v príprave)', zdarma: true, odbornik: true, expert: true, profik: true, premier: true },
                      { id: 4, name: 'Benefit webu najdiMajstra.sk: Zvýšenie zisku', zdarma: true, odbornik: true, expert: true, profik: true, premier: true },
                      { id: 5, name: '(moje stavby ) Osobný plánovač práce', zdarma: false, odbornik: true, expert: true, profik: true, premier: true },
                      { id: 6, name: 'Vlastný plánovací kalendár (môj kalendár)', zdarma: true, odbornik: true, expert: true, profik: true, premier: true },
                      { id: 7, name: 'On-line moje zmluvy (v príprave)', zdarma: true, odbornik: true, expert: true, profik: true, premier: true },
                      { id: 8, name: '(moja recenzia) Možnosť pridania svojích prác, ktoré vás predajú', zdarma: false, odbornik: false, expert: true, profik: true, premier: true },
                      { id: 9, name: 'Hodnotenie od klientov', zdarma: true, odbornik: true, expert: true, profik: true, premier: true },
                      { id: 10, name: 'Zvýšenie vašej propagácie', zdarma: true, odbornik: true, expert: true, profik: true, premier: true },
                      { id: 11, name: 'Propagácia seba a zvýšenie zaujmu o vaše služby a výsledné produkty', zdarma: true, odbornik: true, expert: true, profik: true, premier: true },
                      { id: 12, name: 'Predaj vlastných služieb', zdarma: true, odbornik: true, expert: true, profik: true, premier: true },
                      { id: 13, name: 'Vaš zisková aplikácia nM (najdiMajstra.sk) v mobile v príprave 2026', zdarma: true, odbornik: true, expert: true, profik: true, premier: true },
                      { id: 14, name: 'Podpora podnikania: Kurzy a certifikáty', zdarma: true, odbornik: true, expert: true, profik: true, premier: true },
                      { id: 15, name: 'Vzdelávanie, Rozvoj, Mentoring, Osobnostný rozvoj, Psychológia predaja, Líderstvo', zdarma: false, odbornik: false, expert: false, profik: false, premier: true }
                    ].map((feature, index) => (
                      <tr
                        key={feature.id}
                        className={`border-b border-gray-200 transition-colors hover:bg-blue-50 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-3 py-2 text-xs text-gray-800">
                          <div className="flex items-start gap-2">
                            <span className="flex-1">{feature.name}</span>
                            <button
                              onClick={() => setSelectedPlanForDetails(`Feature-${feature.id}`)}
                              className="text-blue-500 hover:text-blue-700 flex-shrink-0 mt-0.5"
                              title="Čítať viac"
                            >
                              <Info className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="text-center px-2 py-2 border-l border-gray-200">
                          {feature.zdarma ? (
                            <div className="flex justify-center">
                              <div className="bg-green-500 rounded-full p-0.5">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[10px]">nie</span>
                          )}
                        </td>
                        <td className="text-center px-2 py-2 border-l border-gray-200">
                          {feature.odbornik ? (
                            <div className="flex justify-center">
                              <div className="bg-green-500 rounded-full p-0.5">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[10px]">nie</span>
                          )}
                        </td>
                        <td className="text-center px-2 py-2 border-l border-gray-200">
                          {feature.expert ? (
                            <div className="flex justify-center">
                              <div className="bg-green-500 rounded-full p-0.5">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[10px]">nie</span>
                          )}
                        </td>
                        <td className="text-center px-2 py-2 border-l border-gray-200 bg-orange-50/30">
                          {feature.profik ? (
                            <div className="flex justify-center">
                              <div className="bg-green-500 rounded-full p-0.5">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[10px]">nie</span>
                          )}
                        </td>
                        <td className="text-center px-2 py-2 border-l border-gray-200">
                          {feature.premier ? (
                            <div className="flex justify-center">
                              <div className="bg-green-500 rounded-full p-0.5">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[10px]">nie</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 border-t-2 border-gray-300">
                      <td className="px-3 py-2 text-xs font-semibold text-gray-800">
                        Namiesto ročného predplatného 12xhodnota
                      </td>
                      <td className="text-center px-2 py-2 border-l border-gray-200 text-xs font-semibold text-gray-700">
                        zdarma
                      </td>
                      <td className="text-center px-2 py-2 border-l border-gray-200 text-xs font-bold text-red-600 line-through">
                        118,80€
                      </td>
                      <td className="text-center px-2 py-2 border-l border-gray-200 text-xs font-bold text-red-600 line-through">
                        238,80€
                      </td>
                      <td className="text-center px-2 py-2 border-l border-gray-200 bg-orange-50/30 text-xs font-bold text-red-600 line-through">
                        306,00€
                      </td>
                      <td className="text-center px-2 py-2 border-l border-gray-200 text-xs font-semibold text-gray-700">
                        -
                      </td>
                    </tr>
                    <tr className="bg-white border-b-2 border-gray-300">
                      <td className="px-3 py-2 text-xs font-bold text-gray-900">
                        Máte teraz výhodné ročné predplatné v aktuálnej akcii za
                      </td>
                      <td className="text-center px-2 py-2 border-l border-gray-200 text-sm font-bold text-green-600">
                        0,00 €
                      </td>
                      <td className="text-center px-2 py-2 border-l border-gray-200 text-sm font-bold text-green-600">
                        99,00 €
                      </td>
                      <td className="text-center px-2 py-2 border-l border-gray-200 text-sm font-bold text-green-600">
                        195,00 €
                      </td>
                      <td className="text-center px-2 py-2 border-l border-gray-200 bg-orange-50/30 text-sm font-bold text-orange-600">
                        225,00 €
                      </td>
                      <td className="text-center px-2 py-2 border-l border-gray-200 text-sm font-bold text-green-600">
                        -
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100">
                      <td className="px-3 py-2 font-semibold text-gray-900 text-xs">
                        Vyberte váš plán
                      </td>
                      <td className="px-2 py-2 border-l border-gray-300">
                        <button disabled className="w-full bg-green-600 text-white font-semibold py-1.5 px-3 rounded-lg text-xs cursor-not-allowed opacity-90">
                          Aktivný
                        </button>
                      </td>
                      <td className="px-2 py-2 border-l border-gray-300">
                        {activeSubscription?.plan_name?.toLowerCase() === 'odbornik' ? (
                          <button disabled className="w-full bg-green-600 text-white font-semibold py-1.5 px-3 rounded-lg text-xs cursor-not-allowed opacity-90">
                            Aktivný
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSelectPlan('odbornik')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded-lg transition-all transform hover:scale-105 text-xs"
                          >
                            Vybrať
                          </button>
                        )}
                      </td>
                      <td className="px-2 py-2 border-l border-gray-300">
                        {activeSubscription?.plan_name?.toLowerCase() === 'expert' ? (
                          <button disabled className="w-full bg-green-600 text-white font-semibold py-1.5 px-3 rounded-lg text-xs cursor-not-allowed opacity-90">
                            Aktivný
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSelectPlan('expert')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded-lg transition-all transform hover:scale-105 text-xs"
                          >
                            Vybrať
                          </button>
                        )}
                      </td>
                      <td className="px-2 py-2 border-l border-gray-300 bg-orange-50">
                        {activeSubscription?.plan_name?.toLowerCase() === 'profik' ? (
                          <button disabled className="w-full bg-green-600 text-white font-semibold py-1.5 px-3 rounded-lg text-xs cursor-not-allowed opacity-90">
                            Aktivný
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSelectPlan('profik')}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-1.5 px-3 rounded-lg transition-all transform hover:scale-105 shadow-lg text-xs"
                          >
                            Vybrať
                          </button>
                        )}
                      </td>
                      <td className="px-2 py-2 border-l border-gray-300">
                        {activeSubscription?.plan_name?.toLowerCase() === 'premier' ? (
                          <button disabled className="w-full bg-green-600 text-white font-semibold py-1.5 px-3 rounded-lg text-xs cursor-not-allowed opacity-90">
                            Aktivný
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSelectPlan('premier')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded-lg transition-all transform hover:scale-105 text-xs"
                          >
                            Vybrať
                          </button>
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="p-4 bg-gray-50 text-center text-xs text-gray-600 border-t border-gray-200">
                Automatické {billingPeriod === 'monthly' ? 'mesačné' : 'ročné'} predplatné. Systém vám automaticky vyšle faktúru.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Result Modal */}
      {showPaymentResult.show && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] animate-fadeIn">
          <div className="bg-white rounded-2xl p-10 w-full max-w-lg mx-4 shadow-2xl transform animate-scaleIn">
            <div className="text-center">
              {showPaymentResult.success ? (
                showPaymentResult.isLoading ? (
                  <>
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">Spracovávam platbu...</h3>
                    <p className="text-lg text-gray-600 mb-6">Prosím počkajte, zatiaľ čo overujeme vašu platbu</p>
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                      <p className="text-sm text-blue-700">
                        Tento proces môže trvať niekoľko sekúnd. Neobnovujte stránku.
                      </p>
                    </div>
                  </>
                ) : showPaymentResult.planName ? (
                  <>
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce">
                      <CheckCircle className="w-14 h-14 text-white" strokeWidth={3} />
                    </div>
                    <h3 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">Blahoželáme!</h3>
                    <p className="text-xl text-gray-900 font-semibold mb-6">
                      Úspešne ste prešli na plán{' '}
                      <span className="text-green-600 font-bold">
                        {showPaymentResult.planName === 'odbornik' ? 'Odborník' :
                         showPaymentResult.planName === 'expert' ? 'Expert' :
                         showPaymentResult.planName === 'profik' ? 'Profik' :
                         showPaymentResult.planName === 'premier' ? 'Premier' : showPaymentResult.planName}
                      </span>
                    </p>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6 mb-6 shadow-inner">
                      <div className="flex items-center justify-center mb-3">
                        <Sparkles className="w-5 h-5 text-green-600 mr-2" />
                        <p className="text-lg font-bold text-green-800">
                          {showPaymentResult.billingPeriod === 'monthly' ? 'Mesačné predplatné' :
                           showPaymentResult.billingPeriod === 'yearly' ? 'Ročné predplatné' : 'Doživotný prístup'}
                        </p>
                      </div>
                      <div className="space-y-2 text-left">
                        <p className="text-sm text-green-700 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" /> Vaša podpisca je teraz aktívna
                        </p>
                        <p className="text-sm text-green-700 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" /> Môžete využívať všetky funkcie vášho plánu
                        </p>
                        <p className="text-sm text-green-700 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" /> Prístup k prémiové obsahu je odomknutý
                        </p>
                      </div>
                    </div>
                  </>
                ) : null
              ) : (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-12 h-12 text-white" strokeWidth={3} />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">Platba zrušená</h3>
                  <p className="text-lg text-gray-700 mb-8 leading-relaxed">{showPaymentResult.message}</p>
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-700">
                      Nenastala žiadna platba. Môžete sa kedykoľvek vrátiť a vybrať si plán.
                    </p>
                  </div>
                </>
              )}
              {!showPaymentResult.isLoading && (
                <button
                  onClick={() => setShowPaymentResult({show: false, success: false, message: ''})}
                  className={`w-full font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg ${
                    showPaymentResult.success
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                  }`}
                >
                  {showPaymentResult.success ? 'Skvelé, ďakujem!' : 'Zavrieť'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2">Nový projekt</h3>
              <button
                onClick={() => {
                  setShowNewProjectModal(false);
                  setNewProjectName('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'portfolio'
                    ? 'border-[#4169e1] text-[#4169e1]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Moja recenzia
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Názov projektu
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newProjectName.trim()) {
                      addNewProject();
                    }
                  }}
                  placeholder="Zadajte názov projektu..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                  autoFocus
                />
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-gray-500">
                  Limit: {Object.keys(projects).length}/20 projektov
                </span>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowNewProjectModal(false);
                      setNewProjectName('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Zrušiť
                  </button>
                  <button
                    onClick={addNewProject}
                    disabled={!newProjectName.trim() || Object.keys(projects).length >= 20}
                    className="bg-[#4169e1] text-white px-4 py-2 rounded-lg hover:bg-[#3558d4] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Vytvoriť projekt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Hours Modal */}
      {showContactHoursModal && user && masterId && (
        <ContactHoursSelector
          masterId={masterId}
          onClose={() => setShowContactHoursModal(false)}
          onSave={() => {
            const loadContactHours = async () => {
              try {
                const { data, error } = await supabase
                  .from('master_contact_hours')
                  .select('*')
                  .eq('master_id', masterId)
                  .maybeSingle();

                if (error) throw error;

                if (data) {
                  if (data.is_24_7) {
                    setContactHoursDisplay('Dostupný 24/7');
                  } else {
                    const schedule = data.schedule as any;
                    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                    const dayLabels = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];

                    const activeDays = days
                      .map((day, index) => {
                        if (schedule[day] && schedule[day].length > 0) {
                          const times = schedule[day].map((slot: any) => `${slot.start}-${slot.end}`).join(', ');
                          return `${dayLabels[index]}: ${times}`;
                        }
                        return null;
                      })
                      .filter(Boolean);

                    if (activeDays.length > 0) {
                      setContactHoursDisplay(activeDays.join(' | '));
                    }
                  }
                }
              } catch (error) {
                console.error('Error loading contact hours:', error);
              }
            };

            loadContactHours();
          }}
        />
      )}

      {/* Feature Details Modal */}
      {selectedPlanForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-6 h-6" />
                    <h2 className="text-2xl font-bold">Podrobné informácie</h2>
                  </div>
                  <p className="text-sm opacity-90">Všetko čo potrebujete vedieť o tejto funkcii</p>
                </div>
                <button
                  onClick={() => setSelectedPlanForDetails(null)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors flex-shrink-0"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-8">
              {(() => {
                const featureDetails: Record<string, { title: string; description: string; benefits: string[] }> = {
                  'Feature-1': {
                    title: 'Predajný profil',
                    description: 'Vytvorte si profesionálny predajný profil, ktorý vás predstaví potenciálnym zákazníkom. Váš profil obsahuje všetky dôležité informácie o vašich službách, skúsenostiach a certifikáciách.',
                    benefits: [
                      'Profesionálna prezentácia vašich služieb',
                      'Zvýšenie dôveryhodnosti u klientov',
                      'Možnosť pridať fotografie a certifikáty',
                      'Detailný opis vašich schopností'
                    ]
                  },
                  'Feature-2': {
                    title: 'Osobný AI predajca',
                    description: 'Inteligentný AI asistent, ktorý za vás komunikuje so zákazníkmi 24/7, odpovedá na otázky a aktívne predáva vaše služby. Šetrí váš čas a zvyšuje obrat.',
                    benefits: [
                      'Automatická komunikácia so zákazníkmi',
                      'Dostupnosť 24 hodín denne, 7 dní v týždni',
                      'Inteligentné odpovede na otázky',
                      'Zvýšenie konverzie zákazníkov'
                    ]
                  },
                  'Feature-3': {
                    title: 'Rozvoj podnikania - Kurzy a certifikácie',
                    description: 'Prístup k profesionálnym online kurzom a certifikáciám, ktoré vám pomôžu rozvíjať vaše podnikanie a získať nové zručnosti.',
                    benefits: [
                      'Široká ponuka odborných kurzov',
                      'Certifikáty pre zvýšenie dôveryhodnosti',
                      'Učte sa vlastným tempom',
                      'Prístup k expertom v odbore'
                    ]
                  },
                  'Feature-4': {
                    title: 'Benefit webu najdiMajstra.sk: Zvýšenie zisku',
                    description: 'Využite silu najväčšej platformy pre majstrov na Slovensku. Získajte prístup k tisíckam potenciálnych zákazníkov, ktorí aktívne hľadajú vaše služby.',
                    benefits: [
                      'Prístup k veľkej databáze klientov',
                      'Vyššia viditeľnosť vašich služieb',
                      'Viac objednávok a zákazníkov',
                      'Profesionálny marketing vašej firmy'
                    ]
                  },
                  'Feature-5': {
                    title: 'Osobný plánovač času',
                    description: 'Inteligentný systém plánovania, ktorý vám pomôže efektívne organizovať pracovný čas, objednávky a stretnutia so zákazníkmi.',
                    benefits: [
                      'Automatické plánovanie objednávok',
                      'Pripomienky a notifikácie',
                      'Optimalizácia pracovného času',
                      'Prehľad všetkých stretnutí na jednom mieste'
                    ]
                  },
                  'Feature-6': {
                    title: 'Vlastný plánovací kalendár',
                    description: 'Profesionálny kalendár pre správu vašej dostupnosti. Zákazníci môžu vidieť voľné termíny a objednať si vašu službu priamo cez váš profil.',
                    benefits: [
                      'Prehľadné zobrazenie voľných termínov',
                      'Online objednávanie pre zákazníkov',
                      'Automatická synchronizácia',
                      'Zníženie administratívnej práce'
                    ]
                  },
                  'Feature-7': {
                    title: 'On-line zmluvy',
                    description: 'Elektronické podpisovanie zmlúv priamo v systéme. Rýchle, bezpečné a právne platné uzatváranie dohôd so zákazníkmi.',
                    benefits: [
                      'Rýchle uzatváranie dohôd',
                      'Právna platnosť dokumentov',
                      'Bezpečné úložisko zmlúv',
                      'Úspora papiera a času'
                    ]
                  },
                  'Feature-8': {
                    title: 'Možnosť pridania svojích prác',
                    description: 'Vytvorte si portfólio svojich najlepších projektov. Ukážte potenciálnym klientom kvalitu vašej práce prostredníctvom fotografií a popisov realizovaných projektov.',
                    benefits: [
                      'Vizuálna prezentácia vašej práce',
                      'Zvýšenie dôvery u nových klientov',
                      'Neomedzené množstvo projektov',
                      'Profesionálna galéria prác'
                    ]
                  },
                  'Feature-9': {
                    title: 'Hodnotenie od klientov',
                    description: 'Získavajte recenzie a hodnotenia od spokojných zákazníkov. Pozitívne recenzie zvyšujú vašu dôveryhodnosť a prilákajú nových klientov.',
                    benefits: [
                      'Budovanie pozitívnej reputácie',
                      'Autentické recenzie od skutočných zákazníkov',
                      'Zvýšenie dôvery nových klientov',
                      'Lepšie umiestnenie vo vyhľadávaní'
                    ]
                  },
                  'Feature-10': {
                    title: 'Zvýšenie vašej propagácie',
                    description: 'Využite naše marketingové nástroje na propagáciu vašich služieb. Dosiahnite väčšiu viditeľnosť a prilákajte viac zákazníkov.',
                    benefits: [
                      'Profesionálny marketing',
                      'Cielená reklama na potenciálnych klientov',
                      'Vyššie umiestnenie vo výsledkoch',
                      'Väčšia viditeľnosť vášho profilu'
                    ]
                  },
                  'Feature-11': {
                    title: 'Propagácia seba a zvýšenie zaujmu',
                    description: 'Komplexné nástroje pre propagáciu vašich služieb a produktov. Zvýšte záujem o vaše služby pomocou našich pokročilých marketingových funkcií.',
                    benefits: [
                      'Široká škála propagačných nástrojov',
                      'Analytika výkonnosti',
                      'Cielený marketing',
                      'Zvýšenie počtu objednávok'
                    ]
                  },
                  'Feature-12': {
                    title: 'Predaj vlastných služieb',
                    description: 'Vytvorte si vlastný online obchod so službami. Zákazníci môžu priamo nakupovať vaše služby a produkty cez váš profil.',
                    benefits: [
                      'Online predaj služieb',
                      'Bezpečné platobné metódy',
                      'Automatizované vystavovanie faktúr',
                      'Prehľad všetkých transakcií'
                    ]
                  },
                  'Feature-13': {
                    title: 'Mobilná aplikácia najdiMajstra.sk',
                    description: 'V roku 2026 získate prístup k našej mobilnej aplikácii, kde budete môcť spravovať svoj profil a komunikovať so zákazníkmi priamo z vášho mobilu.',
                    benefits: [
                      'Správa profilu odkiaľkoľvek',
                      'Push notifikácie o nových objednávkach',
                      'Rýchla komunikácia so zákazníkmi',
                      'Prístup ku všetkým funkciám na mobile'
                    ]
                  },
                  'Feature-14': {
                    title: 'Vaša odbornosť: Kurzy a certifikáty',
                    description: 'Prezentujte svoju odbornosť prostredníctvom získaných kurzov a certifikátov. Zvýšte dôveryhodnosť a ukážte svoju kvalifikáciu.',
                    benefits: [
                      'Prezentácia certifikátov',
                      'Overenie odbornej kvalifikácie',
                      'Zvýšenie dôveryhodnosti',
                      'Lepšie hodnotenie v systéme'
                    ]
                  },
                  'Feature-15': {
                    title: 'Vzdelávanie a osobnostný rozvoj',
                    description: 'Komplexný program vzdelávania zahŕňajúci mentoring, osobnostný rozvoj, psychológiu predaja a líderstvo. Staňte sa lepším podnikateľom.',
                    benefits: [
                      'Osobný mentoring od expertov',
                      'Kurzy psychológie predaja',
                      'Rozvoj líderských schopností',
                      'Komplexný osobnostný rozvoj'
                    ]
                  }
                };

                const feature = featureDetails[selectedPlanForDetails];

                if (!feature) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Informácie o tejto funkcii nie sú k dispozícii.</p>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        Výhody tejto funkcie:
                      </h4>
                      <div className="space-y-3">
                        {feature.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            <span className="text-gray-800">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPlanForDetails(null)}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Zavrieť
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};