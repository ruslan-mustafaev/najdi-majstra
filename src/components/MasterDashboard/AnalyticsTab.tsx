import React from 'react';
import { TrendingUp, Eye, Phone, Star, Calendar, Users } from 'lucide-react';

export const AnalyticsTab: React.FC = () => {
  const stats = [
    { label: 'Zobrazenia profilu', value: '127', icon: Eye, change: '+12%', trend: 'up' },
    { label: 'Kontakty tento mesiac', value: '23', icon: Phone, change: '+8%', trend: 'up' },
    { label: 'Priemerné hodnotenie', value: '4.8', icon: Star, change: '+0.2', trend: 'up' },
    { label: 'Dokončené projekty', value: '15', icon: Calendar, change: '+3', trend: 'up' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#4169e1] rounded-lg flex items-center justify-center">
                  <Icon className="text-white" size={24} />
                </div>
                <div className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <TrendingUp size={20} />
          <span>Posledná aktivita</span>
        </h3>
        <div className="space-y-4">
          {[
            { action: 'Nové zobrazenie profilu', time: 'pred 2 hodinami', user: 'Mária K.' },
            { action: 'Kontakt cez telefón', time: 'pred 5 hodinami', user: 'Peter N.' },
            { action: 'Zobrazenie profilu', time: 'pred 1 dňom', user: 'Jana S.' },
            { action: 'Nové hodnotenie (5★)', time: 'pred 2 dňami', user: 'Tomáš H.' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div>
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.user}</p>
              </div>
              <p className="text-sm text-gray-500">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};