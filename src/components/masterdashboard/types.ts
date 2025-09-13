// components/masterdashboard/types.ts

export interface MasterDashboardProps {
  onBack: () => void;
  onProfileUpdate?: (profileData: any) => void;
}

export type TabType = 'profile' | 'calendar' | 'projects' | 'payments';

export interface ProfileData {
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
}

export interface MasterProfile {
  name: string;
  profession: string;
  email: string;
  phone: string;
  location: string;
  description: string;
  is_active: boolean;
  profile_completed: boolean;
}

// Calendar types
export type DateStatus = 'available' | 'unavailable' | 'booked';

export interface CalendarAvailability {
  [dateKey: string]: DateStatus;
}

// Project types
export interface ProjectNote {
  id: string;
  text: string;
  completed: boolean;
}

export interface ProjectPhase {
  notes: ProjectNote[];
}

export interface ProjectPhases {
  priprava: ProjectPhase;
  realizacia: ProjectPhase;
  ukoncenie: ProjectPhase;
}

export interface Project {
  name: string;
  phases: ProjectPhases;
}

export interface Projects {
  [projectId: string]: Project;
}

export type ProjectPhaseType = 'priprava' | 'realizacia' | 'ukoncenie';

// Component props interfaces
export interface BaseProfileProps {
  profileData: ProfileData;
  editingField: string | null;
  hasChanges: boolean;
  onFieldChange: (field: string, value: any) => void;
  onNestedFieldChange: (parentField: string, childField: string, value: any) => void;
  onStartEditing: (field: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export interface CalendarProps {
  currentDate: Date;
  availability: CalendarAvailability;
  onDateChange: (date: Date) => void;
  onToggleAvailability: (date: Date) => void;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onSetTodayStatus: (status: 'available' | 'unavailable') => void;
}

export interface ProjectsProps {
  projects: Projects;
  selectedProject: string | null;
  activePhase: ProjectPhaseType;
  newNoteText: string;
  showNewProjectModal: boolean;
  newProjectName: string;
  onSelectProject: (projectId: string) => void;
  onSetActivePhase: (phase: ProjectPhaseType) => void;
  onAddNote: (projectId: string, phase: ProjectPhaseType, text: string) => void;
  onToggleNote: (projectId: string, phase: ProjectPhaseType, noteId: string) => void;
  onDeleteNote: (projectId: string, phase: ProjectPhaseType, noteId: string) => void;
  onAddProject: () => void;
  onSetNewNoteText: (text: string) => void;
  onShowNewProjectModal: (show: boolean) => void;
  onSetNewProjectName: (name: string) => void;
  calculateProgress: (projectId: string) => number;
}

// Constants
export const PROFESSIONS = [
  'Elektrikár', 'Vodoinštalatér', 'Maliar', 'Stolár', 'Murár', 'Plynár',
  'Interiérový dizajnér', 'Bezpečnostné systémy', 'Podlahár', 
  'Čistenie a upratovanie', 'Automechanik', 'Kaderníčka', 'Záhradník'
] as const;

export const EXPERIENCE_LEVELS = [
  'Začiatočník', '1 rok', '2 roky', '5 rokov', 'viac ako 10 rokov'
] as const;

export const MONTH_NAMES = [
  'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
  'Júl', 'August', 'September', 'Október', 'November', 'December'
] as const;

export const SERVICE_TYPES = ['Realizácia', 'Servis', 'Poruchy'] as const;

export const WEEK_DAYS = ['Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok', 'Sobota', 'Nedeľa'] as const;