import React from 'react';
import { Clock } from 'lucide-react';

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
  onWorkingHoursChange: (day: string, value: string) => void;
}

export const WorkingHoursForm: React.FC<WorkingHoursFormProps> = ({ workingHours, onWorkingHoursChange }) => {
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
    '8:00 - 17:00',
    '8:00 - 18:00',
    '9:00 - 17:00',
    '9:00 - 18:00',
    '10:00 - 18:00',
    '24/7 - Nonstop'
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-6">
        <Clock size={20} className="inline mr-2" />
        Pracovné hodiny
      </h3>
      
      <div className="space-y-4">
        {days.map((day) => (
          <div key={day.key} className="flex items-center space-x-4">
            <div className="w-24 text-sm font-medium text-gray-700">
              {day.label}
            </div>
            <select
              value={workingHours[day.key]}
              onChange={(e) => onWorkingHoursChange(day.key, e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
            >
              {timeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Tip pre lepšiu viditeľnosť</h4>
        <p className="text-blue-700 text-sm">
          Majstri s flexibilnými pracovnými hodinami dostávajú viac objednávok. 
          Zvážte ponúknutie večerných hodín alebo víkendových služieb.
        </p>
      </div>
    </div>
  );
};