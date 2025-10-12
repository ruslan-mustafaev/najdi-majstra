import React, { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ContactHoursSelectorProps {
  masterId: string;
  onClose: () => void;
  onSave: () => void;
}

interface WeeklySchedule {
  monday: { start: string; end: string }[];
  tuesday: { start: string; end: string }[];
  wednesday: { start: string; end: string }[];
  thursday: { start: string; end: string }[];
  friday: { start: string; end: string }[];
  saturday: { start: string; end: string }[];
  sunday: { start: string; end: string }[];
}

const DAYS = [
  { key: 'monday', label: 'Pondelok' },
  { key: 'tuesday', label: 'Utorok' },
  { key: 'wednesday', label: 'Streda' },
  { key: 'thursday', label: 'Štvrtok' },
  { key: 'friday', label: 'Piatok' },
  { key: 'saturday', label: 'Sobota' },
  { key: 'sunday', label: 'Nedeľa' },
] as const;

export const ContactHoursSelector: React.FC<ContactHoursSelectorProps> = ({ masterId, onClose, onSave }) => {
  const [is247, setIs247] = useState(false);
  const [schedule, setSchedule] = useState<WeeklySchedule>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContactHours();
  }, [masterId]);

  const loadContactHours = async () => {
    try {
      const { data, error } = await supabase
        .from('master_contact_hours')
        .select('*')
        .eq('master_id', masterId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIs247(data.is_24_7);
        setSchedule(data.schedule as WeeklySchedule);
      }
    } catch (error) {
      console.error('Error loading contact hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = (day: keyof WeeklySchedule) => {
    setSchedule(prev => ({
      ...prev,
      [day]: [...prev[day], { start: '09:00', end: '17:00' }]
    }));
  };

  const removeTimeSlot = (day: keyof WeeklySchedule, index: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (day: keyof WeeklySchedule, index: number, field: 'start' | 'end', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('master_contact_hours')
        .upsert({
          master_id: masterId,
          is_24_7: is247,
          schedule: schedule,
        }, {
          onConflict: 'master_id'
        });

      if (error) throw error;

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving contact hours:', error);
      alert('Chyba pri ukladaní kontaktných hodín');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6">
          <p>Načítavam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="text-[#4169e1]" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Kontaktné hodiny</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 24/7 Option */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={is247}
                onChange={(e) => setIs247(e.target.checked)}
                className="w-5 h-5 text-[#4169e1] rounded focus:ring-[#4169e1]"
              />
              <div>
                <span className="font-semibold text-gray-900">Dostupný 24/7</span>
                <p className="text-sm text-gray-600">Som dostupný kedykoľvek</p>
              </div>
            </label>
          </div>

          {/* Weekly Schedule */}
          {!is247 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Týždenný rozvrh</h3>
              {DAYS.map(({ key, label }) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{label}</h4>
                    <button
                      onClick={() => addTimeSlot(key as keyof WeeklySchedule)}
                      className="text-sm text-[#4169e1] hover:text-[#3155c7] font-medium"
                    >
                      + Pridať čas
                    </button>
                  </div>

                  {schedule[key as keyof WeeklySchedule].length === 0 ? (
                    <p className="text-sm text-gray-500">Nie som dostupný</p>
                  ) : (
                    <div className="space-y-2">
                      {schedule[key as keyof WeeklySchedule].map((slot, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => updateTimeSlot(key as keyof WeeklySchedule, index, 'start', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                          />
                          <span className="text-gray-500">-</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => updateTimeSlot(key as keyof WeeklySchedule, index, 'end', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                          />
                          <button
                            onClick={() => removeTimeSlot(key as keyof WeeklySchedule, index)}
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t p-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={saving}
          >
            Zrušiť
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#4169e1] text-white rounded-lg hover:bg-[#3155c7] transition-colors disabled:opacity-50"
          >
            {saving ? 'Ukladám...' : 'Uložiť'}
          </button>
        </div>
      </div>
    </div>
  );
};
