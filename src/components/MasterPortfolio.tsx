import React, { useState, useEffect } from 'react';
import { Plus, Pencil as Edit, Trash2, MapPin, Calendar, Clock, Star, Camera, Save, X, Upload, AlertCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { uploadMultipleFiles } from '../lib/fileUpload';
import { ProjectStorageManager } from '../lib/projectStorage';

interface PortfolioProject {
  id: string;
  project_title: string;
  location: string;
  completion_date: string;
  duration_months: number;
  difficulty_rating: number;
  description: string;
  photos_count: number;
  main_photo_path: string | null;
  project_folder_path: string | null;
  project_images: string[];
}

interface MasterPortfolioProps {
  masterId?: string;
  isEditable?: boolean;
}

export const MasterPortfolio: React.FC<MasterPortfolioProps> = ({ 
  masterId, 
  isEditable = false 
}) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryProject, setGalleryProject] = useState<PortfolioProject | null>(null);
  const [galleryImageIndex, setGalleryImageIndex] = useState(0);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    project_title: '',
    location: '',
    completion_date: '',
    duration_months: 1,
    difficulty_rating: 3,
    description: '',
    project_images: [] as string[]
  });

  // Загрузка проектов
  useEffect(() => {
    loadProjects();
  }, [masterId]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('master_portfolio')
        .select('*')
        .order('completion_date', { ascending: false });

      if (masterId) {
        // Для просмотра конкретного мастера
        const { data: master } = await supabase
          .from('masters')
          .select('id')
          .eq('id', masterId)
          .maybeSingle();
        
        if (master) {
          query = query.eq('master_id', master.id);
        }
      } else if (user && isEditable) {
        // Для редактирования своих проектов
        const { data: master } = await supabase
          .from('masters')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (master) {
          query = query.eq('master_id', master.id);
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!user || !formData.project_title || !formData.location) return;

    try {
      // Получаем ID мастера
      const { data: master } = await supabase
        .from('masters')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!master) throw new Error('Master profile not found');

      // Преобразуем формат даты из "2025-09" в "2025-09-01"
      const completionDate = formData.completion_date ? `${formData.completion_date}-01` : null;

      const projectData = {
        master_id: master.id,
        project_title: formData.project_title,
        location: formData.location,
        completion_date: completionDate,
        duration_months: formData.duration_months,
        difficulty_rating: formData.difficulty_rating,
        description: formData.description,
        project_images: formData.project_images
      };

      if (editingProject) {
        // Обновление существующего проекта
        const { error } = await supabase
          .from('master_portfolio')
          .update(projectData)
          .eq('id', editingProject.id);
        
        if (error) throw error;
      } else {
        // Создание нового проекта
        const { error } = await supabase
          .from('master_portfolio')
          .insert(projectData);
        
        if (error) throw error;
      }

      // Перезагружаем проекты
      await loadProjects();
      
      // Закрываем модал и очищаем форму
      setShowAddModal(false);
      setEditingProject(null);
      setFormData({
        project_title: '',
        location: '',
        completion_date: '',
        duration_months: 1,
        difficulty_rating: 3,
        description: '',
        project_images: []
      });
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Chyba pri ukladaní projektu');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Naozaj chcete zmazať tento projekt?')) return;

    try {
      const { error } = await supabase
        .from('master_portfolio')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      
      await loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Chyba pri mazaní projektu');
    }
  };

  const handleEditProject = (project: PortfolioProject) => {
    setEditingProject(project);
    // Преобразуем дату обратно в формат YYYY-MM для input type="month"
    const dateForInput = project.completion_date ? project.completion_date.substring(0, 7) : '';
    setFormData({
      project_title: project.project_title,
      location: project.location,
      completion_date: dateForInput,
      duration_months: project.duration_months,
      difficulty_rating: project.difficulty_rating,
      description: project.description,
      project_images: project.project_images
    });
    setShowAddModal(true);
  };

  // Обработчик выбора фотографий проекта
  const handleProjectImagesSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user?.id) return;

    // Проверяем лимит фотографий
    const currentCount = formData.project_images.length;
    const newCount = files.length;
    const totalCount = currentCount + newCount;

    if (totalCount > 5) {
      setUploadError(`Môžete nahrať maximálne 5 fotiek na projekt. Aktuálne máte ${currentCount}, pokúšate sa pridať ${newCount}.`);
      return;
    }

    setUploadingImages(true);
    setUploadError(null);

    try {
      const result = await uploadMultipleFiles(files, 'work-images', user.id);

      if (result.success && result.urls) {
        // Придáme nové URL k existujúcim
        setFormData(prev => ({
          ...prev,
          project_images: [...prev.project_images, ...result.urls]
        }));
      } else {
        setUploadError(result.errors?.join(', ') || 'Chyba pri nahrávaní fotiek');
      }
    } catch (error) {
      console.error('Project images upload error:', error);
      setUploadError('Nastala neočakávaná chyba pri nahrávaní');
    } finally {
      setUploadingImages(false);
      // Vyčistíme input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Obработчик удаления фотографии проекта
  const handleRemoveProjectImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      project_images: prev.project_images.filter((_, i) => i !== index)
    }));
  };

  // Функции для галереи фотографий
  const openGallery = (project: PortfolioProject, imageIndex: number = 0) => {
    setGalleryProject(project);
    setGalleryImageIndex(imageIndex);
    setShowGallery(true);
  };

  const closeGallery = () => {
    setShowGallery(false);
    setGalleryProject(null);
    setGalleryImageIndex(0);
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  const nextGalleryImage = () => {
    if (galleryProject && galleryProject.project_images) {
      setGalleryImageIndex(prev => 
        prev >= galleryProject.project_images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevGalleryImage = () => {
    if (galleryProject && galleryProject.project_images) {
      setGalleryImageIndex(prev => 
        prev <= 0 ? galleryProject.project_images.length - 1 : prev - 1
      );
    }
  };

  const nextImage = () => {
    if (selectedProject && selectedProject.project_images) {
      setCurrentImageIndex(prev => 
        prev >= selectedProject.project_images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProject && selectedProject.project_images) {
      setCurrentImageIndex(prev => 
        prev <= 0 ? selectedProject.project_images.length - 1 : prev - 1
      );
    }
  };

  // Функции для карусели проектов
  const nextProject = () => {
    setCurrentProjectIndex(prev => 
      prev >= projects.length - 1 ? 0 : prev + 1
    );
  };

  const prevProject = () => {
    setCurrentProjectIndex(prev => 
      prev <= 0 ? projects.length - 1 : prev - 1
    );
  };

  // Обработка клавиш для галереи
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showGallery) {
        if (e.key === 'ArrowLeft') {
          prevGalleryImage();
        } else if (e.key === 'ArrowRight') {
          nextGalleryImage();
        } else if (e.key === 'Escape') {
          closeGallery();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showGallery, galleryProject]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169e1] mx-auto"></div>
          <p className="text-gray-600 mt-4">Načítavam portfólio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      {isEditable && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong>Ako vám pomôžu Moje recenzie?</strong> Vaši klieti si vybrú práve vás ak budú mať možnosť nahliadnuť do kvality vašich prác a realizácií.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditable ? 'Moja recenzia' : 'Vyplnené projekty'}
            </h2>
            <p className="text-gray-600 mt-1">
              {isEditable ? 'Ukážte svoje najlepšie projekty' : 'Portfólio dokončených prác'}
            </p>
          </div>
          {isEditable && projects.length < 5 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#4169e1] text-white px-4 py-2 rounded-lg hover:bg-[#3558d4] transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Pridať projekt</span>
            </button>
          )}
        </div>
        
        {isEditable && (
          <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p>💡 <strong>Tip:</strong> Kvalitné portfólio zvyšuje dôveru klientov o 85%! Pridajte až 5 svojich najlepších projektov.</p>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Project Navigation Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <button
                onClick={prevProject}
                disabled={projects.length <= 1}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Projekt {currentProjectIndex + 1} z {projects.length}
                </span>
              </div>
              
              <button
                onClick={nextProject}
                disabled={projects.length <= 1}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            
            {/* Edit/Delete buttons for current project */}
            {isEditable && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditProject(projects[currentProjectIndex])}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
                >
                  <Edit size={16} />
                  <span className="hidden sm:inline">Upraviť</span>
                </button>
                <button
                  onClick={() => handleDeleteProject(projects[currentProjectIndex].id)}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1"
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">Zmazať</span>
                </button>
              </div>
            )}
          </div>

          {/* Current Project Display */}
          {projects[currentProjectIndex] && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Images */}
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative h-64 bg-gray-200 rounded-xl overflow-hidden group">
                    {projects[currentProjectIndex].project_images && projects[currentProjectIndex].project_images.length > 0 ? (
                      <>
                        <img
                          src={projects[currentProjectIndex].project_images[0]}
                          alt={projects[currentProjectIndex].project_title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        
                        {/* Photo count indicator */}
                        <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                          📷 {projects[currentProjectIndex].project_images.length}/5
                        </div>
                        
                        {/* View all photos overlay */}
                        <div 
                          className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openGallery(projects[currentProjectIndex], 0);
                          }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 px-4 py-2 rounded-lg flex items-center space-x-2 pointer-events-none">
                            <Eye size={16} />
                            <span className="font-medium">Zobraziť všetky fotky</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera size={48} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Thumbnail strip */}
                  {projects[currentProjectIndex].project_images && projects[currentProjectIndex].project_images.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {projects[currentProjectIndex].project_images.slice(1, 5).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${projects[currentProjectIndex].project_title} - foto ${index + 2}`}
                          className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 hover:scale-105 transition-all flex-shrink-0 border-2 border-transparent hover:border-blue-400"
                          onClick={() => openGallery(projects[currentProjectIndex], index + 1)}
                        />
                      ))}
                      
                      {/* Show more button if there are more than 4 images */}
                      {projects[currentProjectIndex].project_images.length > 4 && (
                        <button
                          onClick={() => openGallery(projects[currentProjectIndex], 4)}
                          className="w-16 h-16 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors flex-shrink-0 flex items-center justify-center text-gray-600 hover:text-gray-800 border-2 border-transparent hover:border-blue-400"
                        >
                          <span className="text-xs font-medium">+{projects[currentProjectIndex].project_images.length - 4}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Project Info */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {projects[currentProjectIndex].project_title}
                  </h3>
                  
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin size={18} />
                      <span className="font-medium">{projects[currentProjectIndex].location}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar size={18} />
                      <span>{new Date(projects[currentProjectIndex].completion_date).toLocaleDateString('sk-SK', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock size={18} />
                      <span>
                        {projects[currentProjectIndex].duration_months === 1 
                          ? '1 mesiac' 
                          : `${projects[currentProjectIndex].duration_months} mesiacov`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Difficulty Rating */}
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-700 font-medium">Náročnosť:</span>
                    <div className="flex">
                      {renderStars(projects[currentProjectIndex].difficulty_rating)}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({projects[currentProjectIndex].difficulty_rating}/5)
                    </span>
                  </div>

                  {/* Description */}
                  {projects[currentProjectIndex].description && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Popis projektu:</h4>
                      <p className="text-gray-700 leading-relaxed">
                        {projects[currentProjectIndex].description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Project indicators */}
          {projects.length > 1 && (
            <div className="flex justify-center space-x-2 p-4 border-t border-gray-200">
              {projects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentProjectIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentProjectIndex 
                      ? 'bg-[#4169e1] scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-medium mb-2">
              {isEditable ? 'Zatiaľ žiadne projekty' : 'Majster ešte nepridál žiadne projekty'}
            </h3>
            <p className="text-gray-400">
              {isEditable 
                ? 'Pridajte svoj prvý projekt a ukážte klientom svoju prácu'
                : 'Portfólio projektov zatiaľ nie je k dispozícii'
              }
            </p>
          </div>
        </div>
      )}

      {/* Photo Gallery Modal */}
      {showGallery && galleryProject && galleryProject.project_images && galleryProject.project_images.length > 0 && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4" onClick={closeGallery}>
          <div className="relative w-full max-w-6xl h-full flex items-center">
            {/* Close Button */}
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 z-50 bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              <X size={24} />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-50 bg-white/20 text-white px-4 py-2 rounded-full text-lg font-medium backdrop-blur-sm">
              {galleryImageIndex + 1} / {galleryProject.project_images.length}
            </div>

            {/* Main Image */}
            <div className="relative w-full" onClick={(e) => e.stopPropagation()}>
              <img
                src={galleryProject.project_images[galleryImageIndex]}
                alt={`Foto ${galleryImageIndex + 1}`}
                className="w-full max-h-[90vh] object-contain"
              />

              {/* Navigation Arrows */}
              {galleryProject.project_images.length > 1 && (
                <>
                  <button
                    onClick={prevGalleryImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white p-4 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    onClick={nextGalleryImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white p-4 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  {editingProject ? 'Upraviť projekt' : 'Pridať nový projekt'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProject(null);
                    setFormData({
                      project_title: '',
                      location: '',
                      completion_date: '',
                      duration_months: 1,
                      difficulty_rating: 3,
                      description: '',
                      project_images: []
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Project Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zákazka - Čo som robil *
                  </label>
                  <input
                    type="text"
                    value={formData.project_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, project_title: e.target.value }))}
                    placeholder="napr. Kompletná rekonštrukcia kúpeľne"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokalita - Kde som to robil *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="napr. Bratislava, Petržalka"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                  />
                </div>

                {/* Completion Date and Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kedy - Rok a mesiac *
                    </label>
                    <input
                      type="month"
                      value={formData.completion_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, completion_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Čas trvania (mesiace) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={formData.duration_months}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_months: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Difficulty Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vlastné hodnotenie náročnosti (1-5 hviezdičiek) *
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, difficulty_rating: rating }))}
                        className="p-1"
                      >
                        <Star
                          size={24}
                          className={rating <= formData.difficulty_rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                          }
                        />
                      </button>
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                      ({formData.difficulty_rating}/5)
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voľný opis zákazky
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Opíšte detaily projektu, použité materiály, výzvy ktoré ste riešili..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                  />
                </div>

                {/* Project Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fotografie z projektu (max 5)
                  </label>
                  {/* Custom project image upload */}
                  <div className="space-y-4">
                    <div
                      className="relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      onClick={() => document.getElementById('project-images-input')?.click()}
                    >
                      <input
                        id="project-images-input"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleProjectImagesSelect}
                        className="hidden"
                        disabled={uploadingImages}
                      />
                      <div className="flex flex-col items-center space-y-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          uploadingImages ? 'bg-gray-200' : 'bg-blue-100'
                        }`}>
                          {uploadingImages ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          ) : (
                            <Upload size={32} className="text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Fotografie projektu
                          </h3>
                          <p className="text-gray-600 mb-2">
                            Nahrajte fotografie konkrétne z tohto projektu (max 5)
                          </p>
                          <p className="text-sm text-gray-500">
                            Kliknite alebo pretiahnite súbory sem • Max veľkosť: 10MB každá
                          </p>
                        </div>
                        {!uploadingImages && (
                          <div className="flex items-center space-x-2 text-blue-600">
                            <Upload size={20} />
                            <span className="font-medium">Vybrať fotografie</span>
                          </div>
                        )}
                        {uploadingImages && (
                          <p className="text-blue-600 font-medium">Nahrávam fotografie...</p>
                        )}
                      </div>
                    </div>

                    {/* Upload Error */}
                    {uploadError && (
                      <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                        <AlertCircle size={20} />
                        <span>{uploadError}</span>
                      </div>
                    )}
                    {/* Current Project Images */}
                    {formData.project_images.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Vybrané fotografie ({formData.project_images.length}/5):</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {formData.project_images.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`Projekt foto ${index + 1}`}
                                className="w-full aspect-square object-cover rounded-lg shadow-md"
                              />
                              <button
                                onClick={() => handleRemoveProjectImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingProject(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Zrušiť
                  </button>
                  <button
                    onClick={handleSaveProject}
                    disabled={uploadingImages || !formData.project_title || !formData.location || !formData.completion_date}
                    className="bg-[#4169e1] text-white px-6 py-2 rounded-lg hover:bg-[#3558d4] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save size={16} />
                    <span>{editingProject ? 'Uložiť zmeny' : 'Pridať projekt'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Gallery Modal */}
      {selectedProject && selectedProject.project_images.length > 0 && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={closeGallery}>
          <div className="relative w-full max-w-4xl">
            {/* Close Button */}
            <button
              onClick={closeGallery}
              className="absolute -top-12 right-0 z-50 bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              <X size={24} />
            </button>

            {/* Image Counter */}
            <div className="absolute -top-12 left-0 z-50 bg-white/20 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {currentImageIndex + 1} / {selectedProject.project_images.length}
            </div>

            {/* Main Image */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <img
                src={selectedProject.project_images[currentImageIndex]}
                alt={`${selectedProject.project_title} - fotka ${currentImageIndex + 1}`}
                className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />

              {/* Navigation Arrows */}
              {selectedProject.project_images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Project Info */}
            <div className="mt-4 text-center text-white" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-semibold mb-2">{selectedProject.project_title}</h3>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-300">
                <div className="flex items-center space-x-1">
                  <MapPin size={14} />
                  <span>{selectedProject.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{new Date(selectedProject.completion_date).toLocaleDateString('sk-SK', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Náročnosť:</span>
                  <div className="flex">
                    {renderStars(selectedProject.difficulty_rating)}
                  </div>
                </div>
              </div>
              {selectedProject.description && (
                <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
                  {selectedProject.description}
                </p>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {selectedProject.project_images.length > 1 && (
              <div className="mt-6 flex justify-center space-x-2 overflow-x-auto pb-2" onClick={(e) => e.stopPropagation()}>
                {selectedProject.project_images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-white shadow-lg' 
                        : 'border-transparent opacity-60 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Náhľad ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};