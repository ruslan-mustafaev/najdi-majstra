import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface WorkPlanningCalendarProps {
  masterId?: string;
}

interface WorkDay {
  date: number;
  status: 'available' | 'busy' | 'partially-busy' | 'unavailable';
  workHours?: string;
  project?: string;
}

export const WorkPlanningCalendar: React.FC<WorkPlanningCalendarProps> = ({ masterId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  
  const months = [
    'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
    'Júl', 'August', 'September', 'Október', 'November', 'December'
  ];

  const weekDays = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];

  // Load availability from database
  useEffect(() => {
    const loadAvailability = async () => {
      if (!masterId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Get last day of the month
        const lastDay = new Date(year, month + 1, 0).getDate();

        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const { data, error } = await supabase
          .from('master_availability')
          .select('*')
          .eq('master_id', masterId)
          .gte('date', startDate)
          .lte('date', endDate);

        if (error) throw error;

        const availabilityMap: Record<string, any> = {};
        data?.forEach((item) => {
          // Extract day from date string (YYYY-MM-DD)
          const day = parseInt(item.date.split('-')[2], 10);
          availabilityMap[day] = {
            status: item.status,
            work_hours_start: item.work_hours_start,
            work_hours_end: item.work_hours_end,
            notes: item.notes
          };
        });

        console.log('✅ Loaded availability for', startDate, 'to', endDate);
        console.log('📅 Days with status:', Object.keys(availabilityMap).length);
        console.log('📊 Data:', availabilityMap);
        setAvailability(availabilityMap);
      } catch (error) {
        console.error('❌ Error loading availability:', error);
        // Set empty availability on error
        setAvailability({});
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [masterId, currentDate]);

  // Get schedule based on database data
  const getMockSchedule = (month: number, year: number): WorkDay[] => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const schedule: WorkDay[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = availability[day];

      // If no data in DB, status is undefined (will show as gray/empty)
      let status: WorkDay['status'] = 'unavailable';
      let workHours = '';
      let project = '';

      if (dayData) {
        status = dayData.status;
        if (dayData.work_hours_start && dayData.work_hours_end) {
          workHours = `${dayData.work_hours_start.slice(0,5)} - ${dayData.work_hours_end.slice(0,5)}`;
        }
        project = dayData.notes || '';
      }

      schedule.push({
        date: day,
        status,
        workHours,
        project
      });
    }

    return schedule;
  };

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const schedule = getMockSchedule(currentMonth, currentYear);

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday start

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    // Only allow navigation to end of current year
    if (currentMonth < 11) {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    }
  };

  const getStatusColor = (status: WorkDay['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'busy':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'partially-busy':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unavailable':
        return 'bg-gray-100 text-gray-500 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusText = (status: WorkDay['status']) => {
    switch (status) {
      case 'available':
        return 'Dostupný';
      case 'busy':
        return 'Obsadený';
      case 'partially-busy':
        return 'Čiastočne';
      case 'unavailable':
        return 'Nedostupný';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: WorkDay['status']) => {
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Calendar size={20} className="text-[#4169e1]" />
          <span>Plánovanie práce</span>
        </h3>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          disabled={currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </button>
        
        <h4 className="text-xl font-bold text-gray-900">
          {months[currentMonth]} {currentYear}
        </h4>
        
        <button
          onClick={goToNextMonth}
          disabled={currentMonth === 11}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}

        {/* Empty cells for days before month start */}
        {Array.from({ length: adjustedFirstDay }).map((_, index) => (
          <div key={`empty-${index}`} className="h-16"></div>
        ))}

        {/* Calendar days */}
        {schedule.map((day) => (
          <div
            key={day.date}
            className={`h-16 border-2 rounded-lg p-2 transition-all flex flex-col items-center justify-center ${getStatusColor(day.status)}`}
            title={`${day.date}. ${months[currentMonth]} - ${getStatusText(day.status)}${day.project ? ` (${day.project})` : ''}${day.workHours ? ` - ${day.workHours}` : ''}`}
          >
            <div className="text-base font-bold">{day.date}</div>
            {day.status && day.status !== 'unavailable' && (
              <div className="text-lg mt-1">
                {getStatusIcon(day.status)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="border-t pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Legenda:</h5>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded flex items-center justify-center text-xs">✓</div>
            <span className="font-medium">Dostupný</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded flex items-center justify-center text-xs">✕</div>
            <span className="font-medium">Obsadený</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded flex items-center justify-center text-xs">◐</div>
            <span className="font-medium">Čiastočne</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center text-xs">—</div>
            <span className="font-medium">Nedostupný</span>
          </div>
        </div>
      </div>

      {/* Current month summary */}
      <div className="border-t pt-4 mt-4">
        {Object.keys(availability).length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              Majster zatiaľ nenastavil kalendár dostupnosti pre tento mesiac.
            </p>
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Dostupné dni:</span>
              <span className="font-medium text-green-600">
                {schedule.filter(d => d.status === 'available').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Obsadené dni:</span>
              <span className="font-medium text-red-600">
                {schedule.filter(d => d.status === 'busy').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Čiastočne obsadené:</span>
              <span className="font-medium text-yellow-600">
                {schedule.filter(d => d.status === 'partially-busy').length}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};