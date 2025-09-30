import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Save, X, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface AvailabilityDay {
  date: string;
  status: 'available' | 'busy' | 'partially-busy' | 'unavailable';
  work_hours_start: string;
  work_hours_end: string;
  notes: string;
}

interface AvailabilityCalendarProps {
  masterId: string;
  isEditable?: boolean;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  masterId,
  isEditable = false
}) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<Record<string, AvailabilityDay>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const months = [
    'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
    'Júl', 'August', 'September', 'Október', 'November', 'December'
  ];

  const weekDays = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];

  useEffect(() => {
    loadAvailability();
  }, [currentDate, masterId]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('master_availability')
        .select('*')
        .eq('master_id', masterId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      const availabilityMap: Record<string, AvailabilityDay> = {};
      data?.forEach((item) => {
        availabilityMap[item.date] = {
          date: item.date,
          status: item.status,
          work_hours_start: item.work_hours_start || '08:00:00',
          work_hours_end: item.work_hours_end || '17:00:00',
          notes: item.notes || ''
        };
      });

      setAvailability(availabilityMap);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAvailability = async (date: string, data: Partial<AvailabilityDay>) => {
    try {
      const dateStr = date.split('T')[0];

      const availabilityData = {
        master_id: masterId,
        date: dateStr,
        status: data.status || 'available',
        work_hours_start: data.work_hours_start || '08:00:00',
        work_hours_end: data.work_hours_end || '17:00:00',
        notes: data.notes || ''
      };

      const { error } = await supabase
        .from('master_availability')
        .upsert(availabilityData, { onConflict: 'master_id,date' });

      if (error) throw error;

      await loadAvailability();
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Chyba pri ukladaní dostupnosti');
    }
  };

  const handleDayClick = (date: string) => {
    if (!isEditable) return;
    setSelectedDate(date);
    setEditMode(true);
  };

  const handleQuickStatus = async (date: string, status: AvailabilityDay['status']) => {
    await saveAvailability(date, {
      status,
      work_hours_start: '08:00:00',
      work_hours_end: '17:00:00'
    });
  };

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'busy':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'partially-busy':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'unavailable':
        return 'bg-gray-100 border-gray-300 text-gray-600';
      default:
        return 'bg-white border-gray-200 text-gray-700';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'available':
        return '✓';
      case 'busy':
        return '✕';
      case 'partially-busy':
        return '◐';
      case 'unavailable':
        return '—';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4169e1] mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold flex items-center space-x-2">
          <Calendar size={18} className="text-[#4169e1]" />
          <span>{isEditable ? 'Kalendár dostupnosti' : 'Plánovanie práce'}</span>
        </h3>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 rounded hover:bg-gray-100"
        >
          <ChevronLeft size={18} />
        </button>

        <h4 className="text-sm font-bold text-gray-900">
          {months[currentMonth]} {currentYear}
        </h4>

        <button
          onClick={goToNextMonth}
          className="p-1 rounded hover:bg-gray-100"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Quick Actions for Master */}
      {isEditable && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Kliknite na deň pre úpravu</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span>Dostupný</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
              <span>Obsadený</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span>Čiastočne</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
              <span>Nedostupný</span>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-600 py-1">
            {day}
          </div>
        ))}

        {/* Empty cells for days before month start */}
        {Array.from({ length: adjustedFirstDay }).map((_, index) => (
          <div key={`empty-${index}`} className="h-10"></div>
        ))}

        {/* Calendar days */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayData = availability[dateStr];
          const isToday = new Date().toDateString() === new Date(dateStr).toDateString();

          return (
            <div
              key={day}
              onClick={() => handleDayClick(dateStr)}
              className={`h-10 border rounded text-xs flex flex-col items-center justify-center transition-all ${
                getStatusColor(dayData?.status)
              } ${isEditable ? 'cursor-pointer hover:shadow-md' : ''} ${
                isToday ? 'ring-2 ring-blue-400' : ''
              }`}
              title={dayData ? `${dayData.status} - ${dayData.work_hours_start?.slice(0,5)} - ${dayData.work_hours_end?.slice(0,5)}` : 'Kliknite pre nastavenie'}
            >
              <div className="font-medium">{day}</div>
              {dayData && (
                <div className="text-xs">{getStatusIcon(dayData.status)}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editMode && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {new Date(selectedDate).toLocaleDateString('sk-SK', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </h3>
              <button
                onClick={() => setEditMode(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stav
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      handleQuickStatus(selectedDate, 'available');
                      setEditMode(false);
                    }}
                    className="p-3 border-2 border-green-300 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="text-2xl mb-1">✓</div>
                    <div className="text-xs font-medium">Dostupný</div>
                  </button>

                  <button
                    onClick={() => {
                      handleQuickStatus(selectedDate, 'busy');
                      setEditMode(false);
                    }}
                    className="p-3 border-2 border-red-300 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <div className="text-2xl mb-1">✕</div>
                    <div className="text-xs font-medium">Obsadený</div>
                  </button>

                  <button
                    onClick={() => {
                      handleQuickStatus(selectedDate, 'partially-busy');
                      setEditMode(false);
                    }}
                    className="p-3 border-2 border-yellow-300 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    <div className="text-2xl mb-1">◐</div>
                    <div className="text-xs font-medium">Čiastočne</div>
                  </button>

                  <button
                    onClick={() => {
                      handleQuickStatus(selectedDate, 'unavailable');
                      setEditMode(false);
                    }}
                    className="p-3 border-2 border-gray-300 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-2xl mb-1">—</div>
                    <div className="text-xs font-medium">Nedostupný</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {!isEditable && (
        <div className="border-t pt-3 mt-3">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Dostupné dni:</span>
              <span className="font-medium text-green-600">
                {Object.values(availability).filter(d => d.status === 'available').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Obsadené:</span>
              <span className="font-medium text-red-600">
                {Object.values(availability).filter(d => d.status === 'busy').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
