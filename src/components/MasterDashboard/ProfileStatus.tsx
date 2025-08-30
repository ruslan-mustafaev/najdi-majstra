import React from 'react';
import { CheckCircle, AlertCircle, Clock, Save } from 'lucide-react';

interface ProfileStatusProps {
  isProfileSaved: boolean;
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export const ProfileStatus: React.FC<ProfileStatusProps> = ({
  isProfileSaved,
  hasChanges,
  isSaving,
  onSave
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isProfileSaved ? (
            <>
              <CheckCircle className="text-green-500" size={24} />
              <div>
                <h3 className="font-semibold text-green-700">Profil je aktívny</h3>
                <p className="text-sm text-green-600">Váš profil je viditeľný pre klientov</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="text-orange-500" size={24} />
              <div>
                <h3 className="font-semibold text-orange-700">Profil nie je dokončený</h3>
                <p className="text-sm text-orange-600">Dokončite profil pre zobrazenie klientom</p>
              </div>
            </>
          )}
        </div>
        
        {hasChanges && (
          <button
            onClick={onSave}
            disabled={isSaving}
            className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <Clock size={16} className="animate-spin" />
                <span>Ukladá sa...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Uložiť rozvrh</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};