// components/masterdashboard/CalendarPreview.tsx

import React from 'react';
import { Calendar } from 'lucide-react';
import { CalendarAvailability, MONTH_NAMES } from './types';

interface CalendarPreviewProps {
  availability: CalendarAvailability;
  currentDate?: Date;
  masterId?: string;
  readonly?: boolean;
}

export const CalendarPreview: React.FC<CalendarPreviewProps> = ({
  availability,
  currentDate = new Date(),
  masterId,
  readonly = true
}) => {
  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - mondayOffset);
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 35; i++) { // 5 weeks instead of 6 for compact view
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getAvailableDaysCount = () => {
    const days = getCalendarDays();
    const currentMonth = currentDate.getMonth();
    
    return days.filter(date => {
      if (date.getMonth() !== currentMonth) return false;
      const dateKey = formatDateKey(date);
      return availability[dateKey] === 'available';
    }).length;
  };

  const getBusyDaysCount = () => {
    const days = getCalendarDays();
    const currentMonth = currentDate.getMonth();
    
    return days.filter(date => {
      if (date.getMonth() !== currentMonth) return false;
      const dateKey = formatDateKey(date);
      return availability[dateKey] === 'booked';
    }).length;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar size={18} className="text-[#4169e1]" />
        <h4 className="font-medium text-gray-900">
          Dostupnosť v {MONTH_NAMES[currentDate.getMonth()].toLowerCase()}
        </h4>
      </div>

      {/* Compact Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Week day headers */}
        {['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-600 py-1">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {getCalendarDays().map((date, i) => {
          const dateKey = formatDateKey(date);
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isToday = date.toDateString() === today.toDateString();
          const isPast = date < today;
          
          const status = availability[dateKey] || 'unavailable';
          
          return (
            <div
              key={i}
              className={`
                aspect-square flex items-center justify-center text-xs rounded transition-colors
                ${!isCurrentMonth ? 'text-gray-300' : ''}
                ${isPast ? 'text-gray-400 opacity-50' : ''}
                ${isToday ? 'ring-2 ring-blue-400 font-bold' : ''}
                ${status === 'available' && !isPast && isCurrentMonth ? 'bg-green-100 text-green-800' : ''}
                ${status === 'booked' && !isPast && isCurrentMonth ? 'bg-red-100 text-red-800' : ''}
                ${status === 'unavailable' && !isPast && isCurrentMonth ? 'bg-gray-100 text-gray-500' : ''}
                ${!isPast && isCurrentMonth && status === 'available' ? 'cursor-pointer hover:bg-green-200' : ''}
              `}
              title={
                !isCurrentMonth ? '' :
                isPast ? 'Minulý dátum' :
                status === 'available' ? `${date.getDate()}. ${MONTH_NAMES[date.getMonth()]} - Dostupný` :
                status === 'booked' ? `${date.getDate()}. ${MONTH_NAMES[date.getMonth()]} - Obsadený` :
                `${date.getDate()}. ${MONTH_NAMES[date.getMonth()]} - Nedostupný`
              }
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="border-t pt-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Dostupné dni:</span>
            <span className="font-medium text-green-600">{getAvailableDaysCount()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Obsadené dni:</span>
            <span className="font-medium text-red-600">{getBusyDaysCount()}</span>
          </div>
        </div>
        
        {readonly && (
          <div className="mt-3 text-xs text-gray-500 text-center">
            Pre rezerváciu kontaktujte majstra priamo
          </div>
        )}
      </div>
    </div>
  );
};