import React from 'react';
import { TrendingUp, Eye, Phone, Star, Calendar, Users } from 'lucide-react';

export const AnalyticsTab: React.FC = () => {
  const stats = [
    { label: 'Zobrazenia profilu', value: '127', change: '+12%', icon: Eye, color: 'text-blue-600' },
    { label: 'Kontakty tento mesiac', value: '23', change: '+8%', icon: Phone, color: 'text-green-600' },
    { label: 'Priemerné hodnotenie', value: '4.8', change: '+0.2', icon: Star, color: 'text-yellow-600' },
    { label: 'Dokončené projekty', value: '15', change: '+3', icon: Calendar, color: 'text-purple-600' }
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
                <Icon size={24} className={stat.color} />
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          <TrendingUp size={20} className="mr-2 text-[#4169e1]" />
          Štatistiky za posledných 30 dní
        </h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
            <p>Graf štatistík bude dostupný čoskoro</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          <Users size={20} className="mr-2 text-[#4169e1]" />
          Posledná aktivita
        </h3>
        <div className="space-y-4">
          {[
            { action: 'Nový kontakt od klienta', time: 'pred 2 hodinami', type: 'contact' },
            { action: 'Profil zobrazený 5x', time: 'dnes', type: 'view' },
            { action: 'Nové hodnotenie (5★)', time: 'včera', type: 'review' },
            { action: 'Dokončený projekt', time: 'pred 3 dňami', type: 'project' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'contact' ? 'bg-green-500' :
                activity.type === 'view' ? 'bg-blue-500' :
                activity.type === 'review' ? 'bg-yellow-500' :
                'bg-purple-500'
              }`} />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};