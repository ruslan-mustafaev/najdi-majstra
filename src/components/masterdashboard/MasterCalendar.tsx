// components/masterdashboard/MasterCalendar.tsx

import React from 'react';
import { CalendarProps, MONTH_NAMES, WEEK_DAYS } from './types';

export const MasterCalendar: React.FC<CalendarProps> = ({
  currentDate,
  availability,
  onDateChange,
  onToggleAvailability,
  onNavigateMonth,
  onSetTodayStatus
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
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold">Kalendár dostupnosti</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigateMonth('prev')}
                className="p-3 hover:bg-blue-100 rounded-lg transition-colors border border-gray-300 hover:border-blue-400"
              >
                <span className="text-lg font-bold">←</span>
              </button>
              <span className="text-xl font-bold min-w-[220px] text-center bg-blue-50 px-4 py-2 rounded-lg border">
                {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button
                onClick={() => onNavigateMonth('next')}
                className="p-3 hover:bg-blue-100 rounded-lg transition-colors border border-gray-300 hover:border-blue-400"
              >
                <span className="text-lg font-bold">→</span>
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-6 bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-700">Legenda:</h3>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500 rounded-lg shadow-sm border-2 border-green-600"></div>
              <span className="text-sm font-medium">Dostupný</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-500 rounded-lg shadow-sm border-2 border-red-600"></div>
              <span className="text-sm font-medium">Obsadený</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-400 rounded-lg shadow-sm border-2 border-gray-500"></div>
              <span className="text-sm font-medium">Nedostupný</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-3 mb-6">
          {/* Days of week header */}
          {['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'].map(day => (
            <div key={day} className="text-center font-bold text-gray-700 py-3 bg-blue-100 rounded-lg border">
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
              <button
                key={i}
                onClick={() => {
                  if (!isPast) {
                    onToggleAvailability(date);
                  }
                }}
                disabled={isPast}
                title={
                  isPast 
                    ? 'Minulý dátum - nedá sa meniť'
                    : isToday 
                      ? `Dnes - ${status === 'available' ? 'Dostupný' : status === 'booked' ? 'Obsadený' : 'Nedostupný'}`
                      : `${date.getDate()}. ${MONTH_NAMES[date.getMonth()]} - Kliknite pre zmenu statusu`
                }
                className={`
                  aspect-square p-3 text-base font-semibold rounded-xl transition-all duration-200 relative border-2 shadow-sm
                  ${!isCurrentMonth ? 'text-gray-300 bg-gray-50' : ''}
                  ${isPast ? 'text-gray-400 cursor-not-allowed opacity-40 bg-gray-200' : ''}
                  ${isToday ? 'ring-4 ring-blue-400 ring-opacity-50 font-bold text-lg' : ''}
                  ${status === 'available' && !isPast ? 'bg-green-500 text-white hover:bg-green-600 border-green-600 hover:scale-105 hover:shadow-lg' : ''}
                  ${status === 'booked' && !isPast ? 'bg-red-500 text-white border-red-600 hover:scale-105' : ''}
                  ${status === 'unavailable' && !isPast ? 'bg-gray-400 text-white hover:bg-gray-500 border-gray-500 hover:scale-105' : ''}
                  ${!isPast && isCurrentMonth ? 'cursor-pointer hover:shadow-md' : ''}
                `}
              >
                {date.getDate()}
                {isToday && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                )}
                {status === 'available' && !isPast && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs bg-green-600 text-white px-1 rounded">✓</div>
                )}
                {status === 'booked' && !isPast && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs bg-red-600 text-white px-1 rounded">✗</div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Status Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            Ako používať kalendár:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
            <div>• <strong>Kliknite na dátum</strong> pre zmenu statusu</div>
            <div>• <strong>Zelená</strong> = Dostupný pre zákazníkov</div>
            <div>• <strong>Červená</strong> = Obsadený/rezervovaný</div>
            <div>• <strong>Šedá</strong> = Nedostupný/voľno</div>
            <div>• <strong>Modrý krúžok</strong> = Dnešný deň</div>
            <div>• <strong>Svetlé dátumy</strong> = Iný mesiac</div>
          </div>
        </div>
      </div>

      {/* Time Slots */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Časové sloty pre dnes</h3>
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
            {new Date().toLocaleDateString('sk-SK', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {Array.from({ length: 16 }, (_, i) => {
            const hour = 6 + i;
            const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
            const isAvailable = Math.random() > 0.4;
            const isBooked = Math.random() > 0.8;
            
            return (
              <button
                key={i}
                onClick={() => {
                  if (isAvailable && !isBooked) {
                    console.log('Selected time:', timeSlot);
                  }
                }}
                disabled={!isAvailable || isBooked}
                title={
                  isBooked 
                    ? `${timeSlot} - Obsadené` 
                    : isAvailable 
                      ? `${timeSlot} - Dostupné, kliknite pre výber`
                      : `${timeSlot} - Nedostupné`
                }
                className={`
                  py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200 border-2 shadow-sm
                  ${isBooked ? 'bg-red-500 text-white cursor-not-allowed border-red-600' : ''}
                  ${isAvailable && !isBooked ? 'bg-green-100 text-green-800 hover:bg-green-200 hover:scale-110 border-green-300 hover:border-green-400 hover:shadow-md cursor-pointer' : ''}
                  ${!isAvailable && !isBooked ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300' : ''}
                `}
              >
                {timeSlot}
                {isBooked && <div className="text-xs mt-1">Obsadené</div>}
                {isAvailable && !isBooked && <div className="text-xs mt-1 text-green-600">Voľné</div>}
              </button>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">💡 Tip:</span> Zelené sloty sú dostupné pre rezerváciu. Červené sú už obsadené.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-6">Rýchle akcie</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => onSetTodayStatus('available')}
            className="bg-green-500 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 border-green-600"
          >
            <div className="text-lg mb-1">✅</div>
            Označiť ako dostupný dnes
          </button>
          <button className="bg-blue-500 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 border-blue-600">
            <div className="text-lg mb-1">⚙️</div>
            Nastaviť pravidelný rozvrh
          </button>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Týždenný rozvrh</h3>
        <div className="space-y-4">
          {WEEK_DAYS.map((day, index) => (
            <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  id={`day-${index}`}
                  defaultChecked={index < 5}
                  className="w-5 h-5 text-[#4169e1] rounded focus:ring-[#4169e1]"
                />
                <label htmlFor={`day-${index}`} className="font-medium">
                  {day}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  defaultValue="08:00"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="time"
                  defaultValue="18:00"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button className="bg-[#4169e1] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#3558d4] transition-colors">
            Uložiť rozvrh
          </button>
        </div>
      </div>
    </div>
  );
};