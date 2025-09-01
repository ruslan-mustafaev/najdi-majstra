import React, { useState } from 'react';
import { ArrowLeft, User, Star, MapPin, Phone, Mail, Camera, Plus, Edit, Settings, BarChart3, Calendar, Clock, Euro, Award, Users, Play, Globe, Save, X, Upload, Copy, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { saveMasterProfile, type MasterProfile } from '../lib/masterProfileApi';

interface MasterDashboardProps {
  onBack: () => void;
  onProfileUpdate?: (profileData: any) => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({ onBack, onProfileUpdate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'calendar' | 'projects' | 'payments'>('profile');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
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
  }>>({
    'project1': {
      name: 'Rekonštrukcia kúpeľne',
      phases: {
        priprava: { notes: [
          { id: '1', text: 'Nakúpiť obkladačky', completed: true },
          { id: '2', text: 'Zmerať priestor', completed: true },
          { id: '3', text: 'Objednať vanu', completed: false }
        ]},
        realizacia: { notes: [
          { id: '4', text: 'Zdemontovať staré obklady', completed: true },
          { id: '5', text: 'Inštalovať nové potrubie', completed: false }
        ]},
        ukoncenie: { notes: [
          { id: '6', text: 'Finálne čistenie', completed: false }
        ]}
      }
    },
    'project2': {
      name: 'Elektroinštalácia v byte',
      phases: {
        priprava: { notes: [
          { id: '7', text: 'Nakresliť schému', completed: true }
        ]},
        realizacia: { notes: [
          { id: '8', text: 'Vyfrézovať drážky', completed: false }
        ]},
        ukoncenie: { notes: [] }
      }
    }
  });
  const [newNoteText, setNewNoteText] = useState('');
  const [activePhase, setActivePhase] = useState<'priprava' | 'realizacia' | 'ukoncenie'>('priprava');
  
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
    certifications: []
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
      profile_completed: true
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

  // Project functions
  const addNewProject = () => {
    if (!newProjectName.trim() || Object.keys(projects).length >= 20) return;
    
    const projectId = `project${Date.now()}`;
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
    setSelectedProject(projectId); // Automatically select the new project
  };

  const addNote = (projectId: string, phase: 'priprava' | 'realizacia' | 'ukoncenie', text: string) => {
    if (!text.trim()) return;
    
    const currentPhaseNotes = projects[projectId]?.phases[phase]?.notes || [];
    if (currentPhaseNotes.length >= 10) return;
    
    const newNote = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false
    };
    
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

  const toggleNoteCompletion = (projectId: string, phase: 'priprava' | 'realizacia' | 'ukoncenie', noteId: string) => {
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

  const deleteNote = (projectId: string, phase: 'priprava' | 'realizacia' | 'ukoncenie', noteId: string) => {
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
      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-[#4169e1] text-[#4169e1]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Môj profil
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'calendar'
                  ? 'border-[#4169e1] text-[#4169e1]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Kalendár dostupnosti
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-[#4169e1] text-[#4169e1]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Navigácia Stavby
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
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
                  <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <Camera size={32} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Profilová fotka</p>
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} size={16} className="text-gray-300" />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">0.0 (0 hodnotení)</span>
                  </div>
                  <button 
                    onClick={() => {
                      setHasChanges(true);
                    }}
                    className="bg-[#4169e1] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#3558d4] transition-colors"
                  >
                    Nahrať fotku
                  </button>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800">
                      💡 <strong>Tip:</strong> Majstri s profilovou fotkou majú o 70% vyššiu šancu získať zákazku! 
                      Ukážte svoju tvár - vzbudzuje to dôveru u klientov.
                    </p>
                  </div>
                </div>

                {/* Work Photos */}
                <div>
                  <h4 className="font-medium mb-3">Fotky práce (max 20MB)</h4>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <Camera size={24} className="text-gray-400" />
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => {
                      setHasChanges(true);
                    }}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-500 hover:border-[#4169e1] hover:text-[#4169e1] transition-colors"
                  >
                    <Plus size={20} className="mx-auto mb-2" />
                    Pridať fotky práce
                  </button>
                  
                  {/* Work Video */}
                  <div className="mt-4">
                    <h4 className="font-medium mb-3">Video práce (max 1, 50MB)</h4>
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                      <div className="text-center">
                        <Play size={32} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Žiadne video</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setHasChanges(true);
                      }}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-500 hover:border-[#4169e1] hover:text-[#4169e1] transition-colors"
                    >
                      <Plus size={16} className="inline mr-2" />
                      Pridať video práce
                    </button>
                  </div>
                  
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
                              instagram: e.target.value
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
                      1. Opíš konkrétne to s čím viete pomôcť vašemu zákazníkovy.<br/>
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
                    {editingField === 'services' ? (
                      <div className="space-y-2">
                        {['Realizácia', 'Servis', 'Poruchy'].map(service => (
                          <label key={service} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={profileData.serviceTypes.includes(service)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleFieldChange('serviceTypes', [...profileData.serviceTypes, service]);
                                } else {
                                  handleFieldChange('serviceTypes', profileData.serviceTypes.filter(s => s !== service));
                                }
                              }}
                              className="w-4 h-4 text-[#4169e1] rounded focus:ring-[#4169e1]"
                            />
                            <span className="text-sm">{service}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p 
                        className="text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-colors"
                        onClick={() => startEditing('services')}
                      >
                        {profileData.serviceTypes.length > 0 
                          ? profileData.serviceTypes.join(', ')
                          : 'Nevyplnené - kliknite pre úpravu'
                        }
                      </p>
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
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-6">
            {/* Calendar Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold">Kalendár dostupnosti</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-3 hover:bg-blue-100 rounded-lg transition-colors border border-gray-300 hover:border-blue-400"
                    >
                      <span className="text-lg font-bold">←</span>
                    </button>
                    <span className="text-xl font-bold min-w-[220px] text-center bg-blue-50 px-4 py-2 rounded-lg border">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-3 hover:bg-blue-100 rounded-lg transition-colors border border-gray-300 hover:border-blue-400"
                    >
                      <span className="text-lg font-bold">→</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-6 bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-700">Legenda:</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-500 rounded-lg shadow-sm border-2 border-green-600"></div>
                    <span className="text-sm font-medium">Dostupný</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-red-500 rounded-lg shadow-sm border-2 border-red-600"></div>
                    <span className="text-sm font-medium">Obsadený</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-400 rounded-lg shadow-sm border-2 border-gray-500"></div>
                    <span className="text-sm font-medium">Nedostupný</span>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-3 mb-6">
                {/* Days of week header */}
                {['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'].map(day => (
                  <div key={day} className="text-center font-bold text-gray-700 py-3 bg-blue-100 rounded-lg border">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {getCalendarDays().map((date, i) => {
                  const dateKey = formatDateKey(date);
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const isToday = date.toDateString() === today.toDateString();
                  const isPast = date < today;
                  
                  const status = availability[dateKey] || 'unavailable';
                  
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (!isPast) {
                          toggleDateAvailability(date);
                          console.log('Toggled date:', dateKey, 'New status:', availability[dateKey]);
                        }
                      }}
                      disabled={isPast}
                      title={
                        isPast 
                          ? 'Minulý dátum - nedá sa meniť'
                          : isToday 
                            ? `Dnes - ${status === 'available' ? 'Dostupný' : status === 'booked' ? 'Obsadený' : 'Nedostupný'}`
                            : `${date.getDate()}. ${monthNames[date.getMonth()]} - Kliknite pre zmenu statusu`
                      }
                      className={`
                        aspect-square p-3 text-base font-semibold rounded-xl transition-all duration-200 relative border-2 shadow-sm
                        ${!isCurrentMonth ? 'text-gray-300 bg-gray-50' : ''}
                        ${isPast ? 'text-gray-400 cursor-not-allowed opacity-40 bg-gray-200' : ''}
                        ${isToday ? 'ring-4 ring-blue-400 ring-opacity-50 font-bold text-lg' : ''}
                        ${status === 'available' && !isPast ? 'bg-green-500 text-white hover:bg-green-600 border-green-600 hover:scale-105 hover:shadow-lg' : ''}
                        ${status === 'booked' && !isPast ? 'bg-red-500 text-white border-red-600 hover:scale-105' : ''}
                        ${status === 'unavailable' && !isPast ? 'bg-gray-400 text-white hover:bg-gray-500 border-gray-500 hover:scale-105' : ''}
                        ${!isPast && isCurrentMonth ? 'cursor-pointer hover:shadow-md' : ''}
                      `}
                    >
                      {date.getDate()}
                      {isToday && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                      )}
                      {status === 'available' && !isPast && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs bg-green-600 text-white px-1 rounded">✓</div>
                      )}
                      {status === 'booked' && !isPast && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs bg-red-600 text-white px-1 rounded">✗</div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Status Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  Ako používať kalendár:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
                  <div>• <strong>Kliknite na dátum</strong> pre zmenu statusu</div>
                  <div>• <strong>Zelená</strong> = Dostupný pre zákazníkov</div>
                  <div>• <strong>Červená</strong> = Obsadený/rezervovaný</div>
                  <div>• <strong>Šedá</strong> = Nedostupný/voľno</div>
                  <div>• <strong>Modrý krúžok</strong> = Dnešný deň</div>
                  <div>• <strong>Svetlé dátumy</strong> = Iný mesiac</div>
                </div>
              </div>
            </div>

            {/* Time Slots */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Časové sloty pre dnes</h3>
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                  {new Date().toLocaleDateString('sk-SK', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {Array.from({ length: 16 }, (_, i) => {
                  const hour = 6 + i;
                  const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                  const isAvailable = Math.random() > 0.4;
                  const isBooked = Math.random() > 0.8;
                  
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (isAvailable && !isBooked) {
                          console.log('Selected time:', timeSlot);
                        }
                      }}
                      disabled={!isAvailable || isBooked}
                      title={
                        isBooked 
                          ? `${timeSlot} - Obsadené` 
                          : isAvailable 
                            ? `${timeSlot} - Dostupné, kliknite pre výber`
                            : `${timeSlot} - Nedostupné`
                      }
                      className={`
                        py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200 border-2 shadow-sm
                        ${isBooked ? 'bg-red-500 text-white cursor-not-allowed border-red-600' : ''}
                        ${isAvailable && !isBooked ? 'bg-green-100 text-green-800 hover:bg-green-200 hover:scale-110 border-green-300 hover:border-green-400 hover:shadow-md cursor-pointer' : ''}
                        ${!isAvailable && !isBooked ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300' : ''}
                      `}
                    >
                      {timeSlot}
                      {isBooked && <div className="text-xs mt-1">Obsadené</div>}
                      {isAvailable && !isBooked && <div className="text-xs mt-1 text-green-600">Voľné</div>}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">💡 Tip:</span> Zelené sloty sú dostupné pre rezerváciu. Červené sú už obsadené.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6">Rýchle akcie</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button 
                  onClick={() => setTodayStatus('available')}
                  className="bg-green-500 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 border-green-600"
                >
                  <div className="text-lg mb-1">✅</div>
                  Označiť ako dostupný dnes
                </button>
                <button className="bg-blue-500 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 border-blue-600">
                  <div className="text-lg mb-1">⚙️</div>
                  Nastaviť pravidelný rozvrh
                </button>
              </div>
            </div>

            {/* Weekly Schedule */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Týždenný rozvrh</h3>
              <div className="space-y-4">
                {['Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok', 'Sobota', 'Nedeľa'].map((day, index) => (
                  <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        id={`day-${index}`}
                        defaultChecked={index < 5}
                        className="w-5 h-5 text-[#4169e1] rounded focus:ring-[#4169e1]"
                      />
                      <label htmlFor={`day-${index}`} className="font-medium">
                        {day}
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        defaultValue="08:00"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="time"
                        defaultValue="18:00"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button className="bg-[#4169e1] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#3558d4] transition-colors">
                  Uložiť rozvrh
                </button>
              </div>
            </div>
          </div>
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
                
                <div className="space-y-3">
                  {Object.entries(projects).map(([projectId, project]) => {
                    const progress = calculateProjectProgress(projectId);
                    const isSelected = selectedProject === projectId;
                    
                    return (
                      <div
                        key={projectId}
                        onClick={() => setSelectedProject(projectId)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'border-[#4169e1] bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <h4 className="font-medium mb-2">{project.name}</h4>
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
              </div>
            </div>

            {/* Right Column - Project Details */}
            <div className="lg:col-span-2">
              {selectedProject ? (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">{projects[selectedProject].name}</h3>
                    <div className="flex items-center space-x-4">
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
                    <h3 className="text-xl font-medium mb-2">Vyberte projekt</h3>
                    <p>Kliknite na projekt v ľavom paneli pre zobrazenie detailov</p>
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