import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

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
  
  const months = [
    'Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún',
    'Júl', 'August', 'September', 'Október', 'November', 'December'
  ];

  const weekDays = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];

  // Mock data for master's schedule
  const getMockSchedule = (month: number, year: number): WorkDay[] => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const schedule: WorkDay[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = new Date(year, month, day).getDay();
      let status: WorkDay['status'] = 'available';
      let project = '';
      let workHours = '7:00 - 19:00';

      // Weekend logic
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        if (day % 3 === 0) {
          status = 'available';
          workHours = '8:00 - 16:00';
        } else {
          status = 'unavailable';
          workHours = '';
        }
      } else {
        // Weekday logic - simulate different work statuses
        if (day % 7 === 0) {
          status = 'busy';
          project = 'Rekonštrukcia bytu';
          workHours = '8:00 - 18:00';
        } else if (day % 5 === 0) {
          status = 'partially-busy';
          project = 'Servis kotla';
          workHours = '9:00 - 12:00';
        } else if (day % 11 === 0) {
          status = 'unavailable';
          workHours = '';
        }
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
            className={`h-16 border rounded-lg p-1 cursor-pointer hover:shadow-md transition-all ${getStatusColor(day.status)}`}
            title={`${day.date}. ${months[currentMonth]} - ${getStatusText(day.status)}${day.project ? ` (${day.project})` : ''}${day.workHours ? ` - ${day.workHours}` : ''}`}
          >
            <div className="text-sm font-medium">{day.date}</div>
            {day.status !== 'unavailable' && (
              <div className="text-xs truncate">
                {day.project || getStatusText(day.status)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="border-t pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Legenda:</h5>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span>Dostupný</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span>Obsadený</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
            <span>Čiastočne obsadený</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
            <span>Nedostupný</span>
          </div>
        </div>
      </div>

      {/* Current month summary */}
      <div className="border-t pt-4 mt-4">
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
      </div>
    </div>
  );
};