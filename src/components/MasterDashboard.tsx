import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Camera, Briefcase, Calendar, Settings, Save, Upload, AlertCircle, CheckCircle, Star, MapPin, Phone, Mail, Globe, Award, Users, Euro, Clock, X, Plus, CreditCard as Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { supabase } from '../lib/supabase';
import { FileUploadManager } from './FileUpload/FileUploadManager';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { MasterPortfolio } from './MasterPortfolio';
import { saveMasterProfile, MasterProfile } from '../lib/masterProfileApi';
import { loadProjects, createProject, deleteProject, renameProject, addTask, toggleTaskCompletion, deleteTask, Project } from '../lib/projectsApi';

interface MasterDashboardProps {
  onBack: () => void;
  onProfileUpdate?: (profileData: any) => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({ onBack, onProfileUpdate }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'portfolio' | 'calendar' | 'projects'>('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  const [masterId, setMasterId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Record<string, Project>>({});
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [profileData, setProfileData] = useState<MasterProfile>({
    name: '',
    profession: '',
    email: '',
    phone: '',
    location: '',
    description: '',
    is_active: true,
    is_available: false,
    profile_completed: false,
    service_regular: false,
    service_urgent: false,
    service_realization: false
  });

  // Load master profile data
  useEffect(() => {
    if (user) {
      loadMasterProfile();
    }
  }, [user]);

  // Load projects when projects tab is active
  useEffect(() => {
    if (activeTab === 'projects' && masterId) {
      loadMasterProjects();
    }
  }, [activeTab, masterId]);

  const loadMasterProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('masters')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setMasterId(data.id);
        setProfileData({
          name: data.name || '',
          profession: data.profession || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          location: data.location || '',
          description: data.description || '',
          is_active: data.is_active ?? true,
          is_available: data.is_available ?? false,
          profile_completed: data.profile_completed ?? false,
          service_regular: data.service_regular ?? false,
          service_urgent: data.service_urgent ?? false,
          service_realization: data.service_realization ?? false
        });
      } else {
        // Если профиль не найден, используем данные из user metadata
        setProfileData(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          location: user.user_metadata?.location || ''
        }));
      }
    } catch (error) {
      console.error('Error loading master profile:', error);
      setMessage({ type: 'error', text: 'Chyba pri načítavaní profilu' });
    } finally {
      setLoading(false);
    }
  };

  const loadMasterProjects = async () => {
    if (!masterId) return;

    try {
      setLoadingProjects(true);
      const projectsData = await loadProjects(masterId);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
      setMessage({ type: 'error', text: 'Chyba pri načítavaní projektov' });
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData.name || !profileData.profession || !profileData.email) {
      setMessage({ type: 'error', text: 'Vyplňte všetky povinné polia' });
      return;
    }

    try {
      setSaving(true);
      const savedProfile = await saveMasterProfile(profileData);
      
      setMessage({ type: 'success', text: 'Profil bol úspešne uložený!' });
      
      if (onProfileUpdate) {
        onProfileUpdate(savedProfile);
      }

      // Reload profile to get the master ID if it was just created
      if (!masterId) {
        await loadMasterProfile();
      }
    } catch (error) {
      console.error('Save profile error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Chyba pri ukladaní profilu' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof MasterProfile, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateProject = async (name: string) => {
    if (!masterId) return;

    const projectId = await createProject(masterId, name);
    if (projectId) {
      await loadMasterProjects();
      setMessage({ type: 'success', text: 'Projekt bol vytvorený' });
    } else {
      setMessage({ type: 'error', text: 'Chyba pri vytváraní projektu' });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Naozaj chcete zmazať tento projekt?')) return;

    const success = await deleteProject(projectId);
    if (success) {
      await loadMasterProjects();
      setMessage({ type: 'success', text: 'Projekt bol zmazaný' });
    } else {
      setMessage({ type: 'error', text: 'Chyba pri mazaní projektu' });
    }
  };

  const handleRenameProject = async (projectId: string, newName: string) => {
    const success = await renameProject(projectId, newName);
    if (success) {
      await loadMasterProjects();
      setMessage({ type: 'success', text: 'Projekt bol premenovaný' });
    } else {
      setMessage({ type: 'error', text: 'Chyba pri premenovávaní projektu' });
    }
  };

  const handleAddTask = async (projectId: string, phase: 'priprava' | 'realizacia' | 'ukoncenie', text: string) => {
    const project = projects[projectId];
    if (!project) return;

    const orderIndex = project.phases[phase].notes.length;
    const task = await addTask(projectId, phase, text, orderIndex);
    
    if (task) {
      await loadMasterProjects();
      setMessage({ type: 'success', text: 'Úloha bola pridaná' });
    } else {
      setMessage({ type: 'error', text: 'Chyba pri pridávaní úlohy' });
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    const success = await toggleTaskCompletion(taskId, completed);
    if (success) {
      await loadMasterProjects();
    } else {
      setMessage({ type: 'error', text: 'Chyba pri aktualizácii úlohy' });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const success = await deleteTask(taskId);
    if (success) {
      await loadMasterProjects();
      setMessage({ type: 'success', text: 'Úloha bola zmazaná' });
    } else {
      setMessage({ type: 'error', text: 'Chyba pri mazaní úlohy' });
    }
  };

  // Auto-hide messages
  useEffect(() => {
    if (message.type) {
      const timer = setTimeout(() => {
        setMessage({ type: null, text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const tabs = [
    { id: 'profile', label: 'Môj profil', icon: User },
    { id: 'portfolio', label: 'Portfólio', icon: Camera },
    { id: 'calendar', label: 'Kalendár', icon: Calendar },
    { id: 'projects', label: 'Projekty', icon: Briefcase }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4169e1] mx-auto"></div>
            <p className="text-gray-600 mt-4">Načítavam dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header with Back Button */}
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
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard majstra
          </h1>
          <p className="text-gray-600">
            Spravujte svoj profil, portfólio a kalendár dostupnosti
          </p>
        </div>

        {/* Status Message */}
        {message.type && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#4169e1] text-[#4169e1]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Profil majstra</h2>
                  
                  {/* Profile Image Upload */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Profilová fotka</h3>
                    <FileUploadManager
                      fileType="avatar"
                      onUploadComplete={(urls) => {
                        console.log('Avatar uploaded:', urls);
                      }}
                    />
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meno a priezvisko *
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                        placeholder="Vaše meno a priezvisko"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profesia *
                      </label>
                      <input
                        type="text"
                        value={profileData.profession}
                        onChange={(e) => handleInputChange('profession', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                        placeholder="napr. Elektrikár, Vodoinštalatér"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                        placeholder="vas@email.sk"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefón
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                        placeholder="+421 9xx xxx xxx"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lokalita
                      </label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                        placeholder="napr. Bratislava, Košice"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Popis služieb
                    </label>
                    <textarea
                      value={profileData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                      placeholder="Opíšte svoje služby, skúsenosti a špecializáciu..."
                    />
                  </div>

                  {/* Service Types */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Typy služieb</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={profileData.service_urgent}
                          onChange={(e) => handleInputChange('service_urgent', e.target.checked)}
                          className="w-4 h-4 text-[#4169e1] rounded focus:ring-[#4169e1]"
                        />
                        <div>
                          <span className="font-medium text-gray-900">Akútne poruchy</span>
                          <p className="text-sm text-gray-600">Pohotovostné služby, naliehavé opravy</p>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={profileData.service_regular}
                          onChange={(e) => handleInputChange('service_regular', e.target.checked)}
                          className="w-4 h-4 text-[#4169e1] rounded focus:ring-[#4169e1]"
                        />
                        <div>
                          <span className="font-medium text-gray-900">Pravidelný servis</span>
                          <p className="text-sm text-gray-600">Údržba, kontroly, preventívne práce</p>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={profileData.service_realization}
                          onChange={(e) => handleInputChange('service_realization', e.target.checked)}
                          className="w-4 h-4 text-[#4169e1] rounded focus:ring-[#4169e1]"
                        />
                        <div>
                          <span className="font-medium text-gray-900">Plánovaná realizácia</span>
                          <p className="text-sm text-gray-600">Projekty, rekonštrukcie, nové inštalácie</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Status Settings */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Nastavenia profilu</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={profileData.is_active}
                          onChange={(e) => handleInputChange('is_active', e.target.checked)}
                          className="w-4 h-4 text-[#4169e1] rounded focus:ring-[#4169e1]"
                        />
                        <div>
                          <span className="font-medium text-gray-900">Aktívny profil</span>
                          <p className="text-sm text-gray-600">Profil je viditeľný pre klientov</p>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={profileData.is_available}
                          onChange={(e) => handleInputChange('is_available', e.target.checked)}
                          className="w-4 h-4 text-[#4169e1] rounded focus:ring-[#4169e1]"
                        />
                        <div>
                          <span className="font-medium text-gray-900">Momentálne dostupný</span>
                          <p className="text-sm text-gray-600">Môžem prijať nové objednávky</p>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={profileData.profile_completed}
                          onChange={(e) => handleInputChange('profile_completed', e.target.checked)}
                          className="w-4 h-4 text-[#4169e1] rounded focus:ring-[#4169e1]"
                        />
                        <div>
                          <span className="font-medium text-gray-900">Profil je kompletný</span>
                          <p className="text-sm text-gray-600">Všetky informácie sú vyplnené</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Work Images Upload */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ukážky práce (fotografie)</h3>
                    <FileUploadManager
                      fileType="work-images"
                      onUploadComplete={(urls) => {
                        console.log('Work images uploaded:', urls);
                      }}
                    />
                  </div>

                  {/* Work Videos Upload */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Video ukážky práce</h3>
                    <FileUploadManager
                      fileType="work-videos"
                      onUploadComplete={(urls) => {
                        console.log('Work videos uploaded:', urls);
                      }}
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-[#4169e1] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#3558d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Ukladám...</span>
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          <span>Uložiť profil</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <div>
                <MasterPortfolio masterId={masterId} isEditable={true} />
              </div>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && masterId && (
              <div>
                <AvailabilityCalendar masterId={masterId} isEditable={true} />
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div>
                <ProjectManagement
                  projects={projects}
                  loading={loadingProjects}
                  onCreateProject={handleCreateProject}
                  onDeleteProject={handleDeleteProject}
                  onRenameProject={handleRenameProject}
                  onAddTask={handleAddTask}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Project Management Component
interface ProjectManagementProps {
  projects: Record<string, Project>;
  loading: boolean;
  onCreateProject: (name: string) => void;
  onDeleteProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
  onAddTask: (projectId: string, phase: 'priprava' | 'realizacia' | 'ukoncenie', text: string) => void;
  onToggleTask: (taskId: string, completed: boolean) => void;
  onDeleteTask: (taskId: string) => void;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({
  projects,
  loading,
  onCreateProject,
  onDeleteProject,
  onRenameProject,
  onAddTask,
  onToggleTask,
  onDeleteTask
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [addingTaskTo, setAddingTaskTo] = useState<{ projectId: string; phase: 'priprava' | 'realizacia' | 'ukoncenie' } | null>(null);
  const [newTaskText, setNewTaskText] = useState('');

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName('');
      setShowCreateModal(false);
    }
  };

  const handleRenameProject = (projectId: string) => {
    if (editingName.trim()) {
      onRenameProject(projectId, editingName.trim());
      setEditingProject(null);
      setEditingName('');
    }
  };

  const handleAddTask = () => {
    if (addingTaskTo && newTaskText.trim()) {
      onAddTask(addingTaskTo.projectId, addingTaskTo.phase, newTaskText.trim());
      setAddingTaskTo(null);
      setNewTaskText('');
    }
  };

  const phaseLabels = {
    priprava: 'Príprava',
    realizacia: 'Realizácia',
    ukoncenie: 'Ukončenie'
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169e1] mx-auto"></div>
        <p className="text-gray-600 mt-4">Načítavam projekty...</p>
      </div>
    );
  }

  const projectList = Object.values(projects);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Správa projektov</h2>
          <p className="text-gray-600 mt-1">Organizujte svoje projekty a úlohy</p>
        </div>
        {projectList.length < 20 && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#4169e1] text-white px-4 py-2 rounded-lg hover:bg-[#3558d4] transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Nový projekt</span>
          </button>
        )}
      </div>

      {projectList.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Briefcase size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Žiadne projekty</h3>
          <p className="text-gray-600 mb-4">Vytvorte svoj prvý projekt pre organizáciu práce</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#4169e1] text-white px-6 py-3 rounded-lg hover:bg-[#3558d4] transition-colors"
          >
            Vytvoriť projekt
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projectList.map((project) => (
            <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                {editingProject === project.id ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleRenameProject(project.id)}
                    />
                    <button
                      onClick={() => handleRenameProject(project.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingProject(null);
                        setEditingName('');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingProject(project.id);
                          setEditingName(project.name);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteProject(project.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                {Object.entries(project.phases).map(([phase, phaseData]) => (
                  <div key={phase} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        {phaseLabels[phase as keyof typeof phaseLabels]}
                      </h4>
                      <button
                        onClick={() => setAddingTaskTo({ projectId: project.id, phase: phase as any })}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        + Pridať úlohu
                      </button>
                    </div>

                    <div className="space-y-2">
                      {phaseData.notes.map((task) => (
                        <div key={task.id} className="flex items-center space-x-3 group">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={(e) => onToggleTask(task.id, e.target.checked)}
                            className="w-4 h-4 text-[#4169e1] rounded focus:ring-[#4169e1]"
                          />
                          <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.text}
                          </span>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}

                      {addingTaskTo?.projectId === project.id && addingTaskTo?.phase === phase && (
                        <div className="flex items-center space-x-2 mt-2">
                          <input
                            type="text"
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            placeholder="Nová úloha..."
                            className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                            autoFocus
                          />
                          <button
                            onClick={handleAddTask}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setAddingTaskTo(null);
                              setNewTaskText('');
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}

                      {phaseData.notes.length === 0 && addingTaskTo?.projectId !== project.id && (
                        <p className="text-sm text-gray-500 italic">Žiadne úlohy</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nový projekt</h3>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Názov projektu..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewProjectName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Zrušiť
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="bg-[#4169e1] text-white px-4 py-2 rounded-lg hover:bg-[#3558d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Vytvoriť
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};