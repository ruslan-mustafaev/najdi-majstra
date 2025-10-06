import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, FileText, Camera, Video, Settings, Save, Eye, EyeOff, Clock, Euro, Users, Award, Globe, Facebook, Instagram, Linkedin, Youtube, Twitter, MessageCircle, CheckCircle, AlertCircle, Upload, X, Image, Play, AlertTriangle, Plus, Copy, Check, Calendar, Star, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { saveMasterProfile, type MasterProfile } from '../lib/masterProfileApi';
import { MasterPortfolio } from './MasterPortfolio';
import { FileUploadManager } from './FileUpload/FileUploadManager';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { supabase } from '../lib/supabase';
import * as ProjectsAPI from '../lib/projectsApi';

interface MasterDashboardProps {
  onBack: () => void;
  onProfileUpdate?: (profileData: any) => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({ onBack, onProfileUpdate }) => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'calendar' | 'portfolio' | 'projects' | 'payments'>('profile');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
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
  
  const [profileData, setProfileData] = useState<{
    name: string;
    profession: string;
    age?: number;
    location: string;
    workRadius: string;
    description: string;
    experience: string;
    services: string;
    expertise: string;
    teamSize: 'individual' | 'small-team';
    serviceTypes: string[];
    languages: string;
    hourlyRate: string;
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
      };
    };
    certifications: string[];
    serviceRegular: boolean;
    serviceUrgent: boolean;
    serviceRealization: boolean;
    profileImageUrl?: string;
  }>({
    name: user?.user_metadata?.full_name || user?.user_metadata?.first_name + ' ' + user?.user_metadata?.last_name || '',
    profession: user?.user_metadata?.profession || '',
    location: user?.user_metadata?.location || '',
    workRadius: '',
    description: user?.user_metadata?.description || '',
    experience: user?.user_metadata?.experience || '',
    services: '',
    expertise: '',
    teamSize: 'individual',
    serviceTypes: [],
    languages: '',
    hourlyRate: '',
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
        tiktok: ''
      }
    },
    certifications: [],
    serviceRegular: false,
    serviceUrgent: false,
    serviceRealization: false,
    profileImageUrl: undefined
  });

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };
  
  const handleSave = async () => {
  setIsSaving(true);

  try {
    // Подготавливаем данные только с полями из таблицы masters
    const profileForDB: MasterProfile = {
      name: profileData.name,
      profession: profileData.profession,
      email: profileData.contact.email,
      phone: profileData.contact.phone,
      location: profileData.location,
      description: profileData.description,
      is_active: profileData.availability.available,
      is_available: profileData.availability.available,
      profile_completed: true,
      service_regular: profileData.serviceRegular,
      service_urgent: profileData.serviceUrgent,
      service_realization: profileData.serviceRealization
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

  // Load master ID and profile data on mount
  useEffect(() => {
    const loadMasterData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('masters')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setMasterId(data.id);

          // Update profile data with loaded values
          setProfileData(prev => ({
            ...prev,
            name: data.name || prev.name,
            profession: data.profession || prev.profession,
            location: data.location || prev.location,
            description: data.description || prev.description,
            profileImageUrl: data.profile_image_url || undefined,
            contact: {
              ...prev.contact,
              phone: data.phone || prev.contact.phone,
              email: data.email || prev.contact.email,
            },
            availability: {
              ...prev.availability,
              available: data.is_available ?? prev.availability.available,
            },
            serviceRegular: data.service_regular || false,
            serviceUrgent: data.service_urgent || false,
            serviceRealization: data.service_realization || false,
          }));
        }
      } catch (error) {
        console.error('Error loading master data:', error);
      }
    };

    loadMasterData();
  }, [user]);

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

  const professions = [
    'Elektrikár', 'Vodoinštalatér', 'Maliar', 'Stolár', 'Murár', 'Plynár',
    'Interiérový dizajnér', 'Bezpečnostné systémy', 'Podlahár', 
    'Čistenie a upratovanie', 'Automechanik', 'Kaderníčka', 'Záhradník'
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
            <span className="font-medium">Späť na zoznam</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto md:overflow-x-visible gap-2 md:space-x-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-3 md:px-2 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                activeTab === 'profile'
                  ? 'border-[#4169e1] text-[#4169e1]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Môj profil
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-4 px-3 md:px-2 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                activeTab === 'calendar'
                  ? 'border-[#4169e1] text-[#4169e1]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Kalendár dostupnosti
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`py-4 px-3 md:px-2 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                activeTab === 'portfolio'
                  ? 'border-[#4169e1] text-[#4169e1]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Moja recenzia
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-3 md:px-2 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                activeTab === 'projects'
                  ? 'border-[#4169e1] text-[#4169e1]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Navigácia Stavby
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-3 md:px-2 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                activeTab === 'payments'
                  ? 'border-[#4169e1] text-[#4169e1]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Platby a predplatné
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Photos */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Fotky</h3>
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
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} size={16} className="text-gray-300" />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">0.0 (0 hodnotení)</span>
                  </div>
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
                  <h3 className="text-lg font-semibold">Identita a detaily</h3>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                        >
                          <option value="">Vyberte profesiu</option>
                          {professions.map(prof => (
                            <option key={prof} value={prof}>{prof}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <p 
                        className="text-gray-900 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                        onClick={() => startEditing('name-profession')}
                      >
                        {profileData.profession && profileData.name 
                          ? `${profileData.profession} - ${profileData.name}`
                          : 'Nevyplnené - kliknite pre úpravu'
                        }
                      </p>
                    )}
                  </div>

                  {/* Location & Availability */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lokalita a dostupnosť
                    </label>
                    {editingField === 'location' ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Mesto/región"
                          value={profileData.location}
                          onChange={(e) => handleFieldChange('location', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Pracovný rádius (napr. +50km)"
                          value={profileData.workRadius}
                          onChange={(e) => handleFieldChange('workRadius', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                        />
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="available"
                            checked={profileData.availability.available}
                            onChange={(e) => handleNestedFieldChange('availability', 'available', e.target.checked)}
                            className="w-4 h-4 text-[#4169e1] rounded focus:ring-[#4169e1]"
                          />
                          <label htmlFor="available" className="text-sm">Som momentálne dostupný</label>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                        onClick={() => startEditing('location')}
                      >
                        <MapPin size={16} className="text-gray-500" />
                        <span>{profileData.location || 'Nevyplnené - kliknite pre úpravu'}</span>
                        <div className={`w-3 h-3 rounded-full ${
                          profileData.availability.available ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      </div>
                    )}
                  </div>

                  {/* Social Media */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sociálne siete (voliteľné)
                    </label>
                    {editingField === 'social' ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Facebook používateľ"
                            value={profileData.contact.socialMedia?.facebook || ''}
                            onChange={(e) => handleNestedFieldChange('contact', 'socialMedia', {
                              ...profileData.contact.socialMedia,
                              facebook: e.target.value
                            })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent text-sm"
                          />
                          <input
                            type="text"
                            placeholder="YouTube kanál"
                            value={profileData.contact.socialMedia?.youtube || ''}
                            onChange={(e) => handleNestedFieldChange('contact', 'socialMedia', {
                              ...profileData.contact.socialMedia,
                              youtube: e.target.value
                            })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent text-sm"
                          />
                          <input
                            type="text"
                            placeholder="TikTok používateľ"
                            value={profileData.contact.socialMedia?.tiktok || ''}
                            onChange={(e) => handleNestedFieldChange('contact', 'socialMedia', {
                              ...profileData.contact.socialMedia,
                              tiktok: e.target.value
                            })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                        onClick={() => startEditing('social')}
                      >
                        {profileData.contact.socialMedia && Object.values(profileData.contact.socialMedia).some(v => v) ? (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(profileData.contact.socialMedia).map(([platform, handle]) => (
                              handle && (
                                <span key={platform} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                  {platform}: @{handle}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Čo robíte a ponúkate (max 1000 znakov)
                    </label>
                    <p className="text-sm text-gray-600 mb-2">
                      1. Opíšte konkrétne to s čím viete pomôcť vašemu zákazníkovy.<br/>
                      2. Vypíšte všetko čo robíte, všetky slová podľa ktorých<br/>
                      by vás vedel váš zákazník vyhľadať
                    </p>
                    {editingField === 'description' ? (
                      <textarea
                        placeholder="Opíšte svoju prácu a služby..."
                        value={profileData.description}
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                        maxLength={1000}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                      />
                    ) : (
                      <p 
                        className="text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors min-h-[2.5rem]"
                        onClick={() => startEditing('description')}
                      >
                        {profileData.description || 'Nevyplnené - kliknite pre úpravu'}
                      </p>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Čo riešim
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Tieto indikátory sa zobrazia na vašej avatarke ako farebné polоsky
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

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ako dlho to robím
                    </label>
                    {editingField === 'experience' ? (
                      <select
                        value={profileData.experience}
                        onChange={(e) => handleFieldChange('experience', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                      >
                        <option value="">Vyberte skúsenosti</option>
                        {experienceLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    ) : (
                      <p 
                        className="text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                        onClick={() => startEditing('experience')}
                      >
                        {profileData.experience || 'Nevyplnené - kliknite pre úpravu'}
                      </p>
                    )}
                  </div>

                  {/* Team Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tím
                    </label>
                    {editingField === 'team' ? (
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="teamSize"
                            value="individual"
                            checked={profileData.teamSize === 'individual'}
                            onChange={(e) => handleFieldChange('teamSize', e.target.value as 'individual' | 'small-team')}
                            className="w-4 h-4 text-[#4169e1] focus:ring-[#4169e1]"
                          />
                          <span className="text-sm">Som sám jednotlivec</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="teamSize"
                            value="small-team"
                            checked={profileData.teamSize === 'small-team'}
                            onChange={(e) => handleFieldChange('teamSize', e.target.value as 'individual' | 'small-team')}
                            className="w-4 h-4 text-[#4169e1] focus:ring-[#4169e1]"
                          />
                          <span className="text-sm">Som jednotlivec s partiou (2-3 členov)</span>
                        </label>
                      </div>
                    ) : (
                      <p 
                        className="text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                        onClick={() => startEditing('team')}
                      >
                        {profileData.teamSize === 'individual' ? 'Jednotlivec' : 'Malý tím'}
                      </p>
                    )}
                  </div>

                  {/* Hourly Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hodinová sadzba
                    </label>
                    {editingField === 'hourlyRate' ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="25"
                          value={profileData.hourlyRate}
                          onChange={(e) => handleFieldChange('hourlyRate', e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                        />
                        <span className="text-gray-600">€/hod</span>
                      </div>
                    ) : (
                      <p 
                        className="text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                        onClick={() => startEditing('hourlyRate')}
                      >
                        {profileData.hourlyRate ? `${profileData.hourlyRate} €/hod` : 'Nevyplnené - kliknite pre úpravu'}
                      </p>
                    )}
                    <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        💡 <strong>AI Tip:</strong> Odporúčaná cena pre vašu oblasť: 25-45 €/hod
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Calendar & Contact */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Kalendár a kontakt</h3>
                
                {/* Availability Schedule */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pracovný čas
                  </label>
                  {editingField === 'schedule' ? (
                    <input
                      type="text"
                      placeholder="napr. 7:00 - 19:00 alebo Nonstop 24/7"
                      value={profileData.availability.schedule}
                      onChange={(e) => handleNestedFieldChange('availability', 'schedule', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                    />
                  ) : (
                    <div 
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                      onClick={() => startEditing('schedule')}
                    >
                      <Clock size={16} className="text-gray-500" />
                      <span>{profileData.availability.schedule || 'Nevyplnené - kliknite pre úpravu'}</span>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    {editingField === 'email' ? (
                      <input
                        type="email"
                        placeholder="vas@email.sk"
                        value={profileData.contact.email}
                        onChange={(e) => handleNestedFieldChange('contact', 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                      />
                    ) : (
                      <div 
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                        onClick={() => startEditing('email')}
                      >
                        <Mail size={16} className="text-gray-500" />
                        <span>{profileData.contact.email || 'Nevyplnené - kliknite pre úpravu'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <h3 className="text-lg font-semibold">Moje projekty</h3>
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

        {activeTab === 'payments' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Platby a predplatné</h2>
            
            {/* Subscription Plans */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Využite teraz garantovanú dotovanú cenu</h3>
                <p className="text-gray-600">Nestratíte pozornosť a zákaziek bude viac.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Standard Plan */}
                <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 transition-colors">
                  <div className="text-center">
                    <h4 className="font-semibold text-lg mb-2">Štandard</h4>
                    <div className="mb-3">
                      <span className="text-gray-500 line-through text-sm">z 19,9€</span>
                      <div className="text-2xl font-bold text-green-600">9,9€</div>
                      <span className="text-sm text-gray-600">mesačne</span>
                    </div>
                    <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      Vybrať plán
                    </button>
                  </div>
                </div>

                {/* Professional Plan */}
                <div className="border-2 border-blue-500 rounded-xl p-4 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">Populárne</span>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-lg mb-2">Professional</h4>
                    <div className="mb-3">
                      <span className="text-gray-500 line-through text-sm">z 39,9€</span>
                      <div className="text-2xl font-bold text-green-600">19,9€</div>
                      <span className="text-sm text-gray-600">mesačne</span>
                    </div>
                    <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      Vybrať plán
                    </button>
                  </div>
                </div>

                {/* Professional + Expert Plan */}
                <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 transition-colors">
                  <div className="text-center">
                    <h4 className="font-semibold text-lg mb-2">Professional + Expert</h4>
                    <p className="text-xs text-gray-600 mb-2">na zvyšovanie zisku</p>
                    <div className="mb-3">
                      <span className="text-gray-500 line-through text-sm">z 59€</span>
                      <div className="text-2xl font-bold text-green-600">25,5€</div>
                      <span className="text-sm text-gray-600">mesačne</span>
                    </div>
                    <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      Vybrať plán
                    </button>
                  </div>
                </div>

                {/* Premier Top Profi Plan */}
                <div className="border-2 border-yellow-400 rounded-xl p-4 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">VIP</span>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-lg mb-1">Premier Top Profi</h4>
                    <p className="text-xs text-gray-600 mb-2">+osobný konzultant, budovanie firmy, automatizácia, koučing</p>
                    <div className="mb-3">
                      <span className="text-gray-500 line-through text-sm">z 9999€</span>
                      <div className="text-2xl font-bold text-green-600">4979€</div>
                      <span className="text-sm text-gray-600">mesačne</span>
                    </div>
                    <button className="w-full bg-yellow-400 text-black py-2 rounded-lg hover:bg-yellow-500 transition-colors font-semibold">
                      Vybrať VIP plán
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Discount Coupons */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Zľavové kupóny</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-green-600">25%</span>
                      <p className="text-sm text-gray-600">zľava</p>
                    </div>
                    <button 
                      onClick={() => handleCopyCoupon('SAVE25')}
                      className="flex items-center space-x-2 bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      {copiedCoupon === 'SAVE25' ? <Check size={16} /> : <Copy size={16} />}
                      <span className="text-sm">SAVE25</span>
                    </button>
                  </div>
                </div>
                
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">50%</span>
                      <p className="text-sm text-gray-600">zľava</p>
                    </div>
                    <button 
                      onClick={() => handleCopyCoupon('HALF50')}
                      className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      {copiedCoupon === 'HALF50' ? <Check size={16} /> : <Copy size={16} />}
                      <span className="text-sm">HALF50</span>
                    </button>
                  </div>
                </div>
                
                <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-purple-600">100%</span>
                      <p className="text-sm text-gray-600">zdarma</p>
                    </div>
                    <button 
                      onClick={() => handleCopyCoupon('FREE100')}
                      className="flex items-center space-x-2 bg-purple-500 text-white px-3 py-1 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      {copiedCoupon === 'FREE100' ? <Check size={16} /> : <Copy size={16} />}
                      <span className="text-sm">FREE100</span>
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Automatické mesačné predplatné. Systém vám automaticky vyšle faktúru.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nový projekt</h3>
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
    </div>
  );
};