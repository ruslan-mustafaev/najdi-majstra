// components/masterdashboard/ProjectManagement.tsx

import React from 'react';
import { Plus, X } from 'lucide-react';
import { ProjectsProps, ProjectPhaseType } from './types';

export const ProjectManagement: React.FC<ProjectsProps> = ({
  projects,
  selectedProject,
  activePhase,
  newNoteText,
  showNewProjectModal,
  newProjectName,
  onSelectProject,
  onSetActivePhase,
  onAddNote,
  onToggleNote,
  onDeleteNote,
  onAddProject,
  onSetNewNoteText,
  onShowNewProjectModal,
  onSetNewProjectName,
  calculateProgress
}) => {
  const addNewProject = () => {
    if (!newProjectName.trim() || Object.keys(projects).length >= 20) return;
    onAddProject();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Projects List */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Moje projekty</h3>
            <button 
              onClick={() => onShowNewProjectModal(true)}
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
              const progress = calculateProgress(projectId);
              const isSelected = selectedProject === projectId;
              
              return (
                <div
                  key={projectId}
                  onClick={() => onSelectProject(projectId)}
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
                  {calculateProgress(selectedProject)}% hotové
                </span>
              </div>
            </div>

            {/* Phase Navigation */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
              {(['priprava', 'realizacia', 'ukoncenie'] as const).map((phase) => (
                <button
                  key={phase}
                  onClick={() => onSetActivePhase(phase)}
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
                    onChange={(e) => onSetNewNoteText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        onAddNote(selectedProject, activePhase, newNoteText);
                      }
                    }}
                    placeholder="Pridať novú úlohu..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                  />
                  <button
                    onClick={() => onAddNote(selectedProject, activePhase, newNoteText)}
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
                      onChange={() => onToggleNote(selectedProject, activePhase, note.id)}
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
                      onClick={() => onDeleteNote(selectedProject, activePhase, note.id)}
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

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nový projekt</h3>
              <button
                onClick={() => {
                  onShowNewProjectModal(false);
                  onSetNewProjectName('');
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
                  onChange={(e) => onSetNewProjectName(e.target.value)}
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
                      onShowNewProjectModal(false);
                      onSetNewProjectName('');
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