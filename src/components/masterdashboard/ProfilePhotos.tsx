// components/masterdashboard/ProfilePhotos.tsx

import React from 'react';
import { Camera, Plus, Play, Save, X, Star } from 'lucide-react';
import { BaseProfileProps } from './types';

export const ProfilePhotos: React.FC<BaseProfileProps> = ({
  hasChanges,
  onSave,
  onCancel
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Fotky</h3>
        {hasChanges && (
          <div className="flex space-x-2">
            <button
              onClick={onSave}
              className="bg-green-500 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm"
            >
              <Save size={14} />
              <span>Uložiť</span>
            </button>
            <button
              onClick={onCancel}
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
            // setHasChanges(true); // This will be handled by parent
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
            // setHasChanges(true); // This will be handled by parent
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
              // setHasChanges(true); // This will be handled by parent
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
  );
};