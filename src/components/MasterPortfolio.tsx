import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, MapPin, Calendar, Clock, Star, Camera, Save, X, Upload, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { uploadMultipleFiles } from '../lib/fileUpload';

interface PortfolioProject {
  id: string;
  project_title: string;
  location: string;
  completion_date: string;
  duration_months: number;
  difficulty_rating: number;
  description: string;
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
          .single();
        
        if (master) {
          query = query.eq('master_id', master.id);
        }
      } else if (user && isEditable) {
        // Для редактирования своих проектов
        const { data: master } = await supabase
          .from('masters')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
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
        .single();

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
        // Pridáme nové URL k existujúcim
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

  // Открытие галереи фотографий
  const openGallery = (project: PortfolioProject, imageIndex: number = 0) => {
    setSelectedProject(project);
    setCurrentImageIndex(imageIndex);
  };

  // Закрытие галереи
  const closeGallery = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  // Навигация по фотографиям
  const nextImage = () => {
    if (selectedProject && selectedProject.project_images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === selectedProject.project_images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProject && selectedProject.project_images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProject.project_images.length - 1 : prev - 1
      );
    }
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Project Images */}
              <div className="relative h-48 bg-gray-200">
                {project.project_images.length > 0 ? (
                  <img
                    src={project.project_images[0]}
                    alt={project.project_title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera size={48} className="text-gray-400" />
                  </div>
                )}
                
                {/* Image count indicator */}
                {project.project_images.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                    +{project.project_images.length - 1}
                  </div>
                )}

                {/* Edit/Delete buttons for editable mode */}
                {isEditable && (
                  <div className="absolute top-3 left-3 flex space-x-2">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Project Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {project.project_title}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin size={14} />
                    <span>{project.location}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar size={14} />
                    <span>{new Date(project.completion_date).toLocaleDateString('sk-SK', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock size={14} />
                    <span>
                      {project.duration_months === 1 
                        ? '1 mesiac' 
                        : `${project.duration_months} mesiacov`
                      }
                    </span>
                  </div>
                </div>

                {/* Difficulty Rating */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-sm text-gray-600">Náročnosť:</span>
                  <div className="flex">
                    {renderStars(project.difficulty_rating)}
                  </div>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
          ))}
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
                            Fotografie projektu ({formData.project_images.length}/5)
                          </h3>
                          <p className="text-gray-600 mb-2">
                            Nahrajte fotografie konkrétne z tohto projektu
                          </p>
                          <p className="text-sm text-gray-500">
                            Kliknite alebo pretiahnite súbory sem • Max 5 fotiek, 10MB každá
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
                    disabled={!formData.project_title || !formData.location || !formData.completion_date}
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
    </div>
  );
};