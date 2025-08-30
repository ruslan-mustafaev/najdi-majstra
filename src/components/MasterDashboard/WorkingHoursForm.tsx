import React from 'react';
import { Edit2, Check, X, Clock } from 'lucide-react';

interface WorkingHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

interface WorkingHoursFormProps {
  workingHours: WorkingHours;
  editingField: string | null;
  onEdit: (field: string) => void;
  onSave: (field: string, value: any) => void;
  onCancel: () => void;
  onChange: (field: string, value: any) => void;
}

export const WorkingHoursForm: React.FC<WorkingHoursFormProps> = ({
  workingHours,
  editingField,
  onEdit,
  onSave,
  onCancel,
  onChange
}) => {
  const days = [
    { key: 'monday', label: 'Pondelok' },
    { key: 'tuesday', label: 'Utorok' },
    { key: 'wednesday', label: 'Streda' },
    { key: 'thursday', label: 'Štvrtok' },
    { key: 'friday', label: 'Piatok' },
    { key: 'saturday', label: 'Sobota' },
    { key: 'sunday', label: 'Nedeľa' }
  ];

  const timeOptions = [
    'Zatvorené',
    '6:00 - 14:00',
    '7:00 - 15:00',
    '8:00 - 16:00',
    '9:00 - 17:00',
    '10:00 - 18:00',
    '8:00 - 20:00',
    '9:00 - 21:00',
    '24/7 - Nonstop'
  ];

  const renderDayField = (day: typeof days[0]) => {
    const fieldKey = `workingHours.${day.key}`;
    const value = workingHours[day.key] || '';

    return (
      <div key={day.key} className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <Clock size={16} />
            <span>{day.label}</span>
          </label>
          {editingField === fieldKey ? (
            <div className="flex space-x-2">
              <button
                onClick={() => onSave(fieldKey, value)}
                className="text-green-600 hover:text-green-700"
              >
                <Check size={16} />
              </button>
              <button
                onClick={onCancel}
                className="text-red-600 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onEdit(fieldKey)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>
        
        {editingField === fieldKey ? (
          <select
            value={value}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
            autoFocus
          >
            {timeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-gray-900">
            {value || 'Nie je zadané'}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pracovné hodiny</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {days.map(renderDayField)}
      </div>
    </div>
  );
};