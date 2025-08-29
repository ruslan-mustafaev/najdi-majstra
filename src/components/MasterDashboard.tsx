import React from 'react';
import { ArrowLeft, User, Settings, BarChart3, Calendar, MessageSquare, Star, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

interface MasterDashboardProps {
  onBack: () => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({ onBack }) => {
  const { user, signOut } = useAuth();
  const { language } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    onBack();
  };

  const masterName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Majster';

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white shadow-sm border-b fixed top-16 left-0 right-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'sk' ? 'Dashboard Majstra' : 'Master Dashboard'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#4169e1] to-[#5a7bff] text-white rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {language === 'sk' ? `Vitajte, ${masterName}!` : `Welcome, ${masterName}!`}
              </h2>
              <p className="text-white/80">
                {language === 'sk' 
                  ? 'Spravujte svoj profil a objednávky' 
                  : 'Manage your profile and orders'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">
                  {language === 'sk' ? 'Aktívne objednávky' : 'Active Orders'}
                </p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">
                  {language === 'sk' ? 'Dokončené práce' : 'Completed Jobs'}
                </p>
                <p className="text-2xl font-bold text-gray-900">47</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">
                  {language === 'sk' ? 'Hodnotenie' : 'Rating'}
                </p>
                <p className="text-2xl font-bold text-gray-900">4.8</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">
                  {language === 'sk' ? 'Mesačný príjem' : 'Monthly Income'}
                </p>
                <p className="text-2xl font-bold text-gray-900">€2,450</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6">
              {language === 'sk' ? 'Posledné objednávky' : 'Recent Orders'}
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map((order) => (
                <div key={order} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">
                        {language === 'sk' ? 'Oprava elektroinštalácie' : 'Electrical repair'}
                      </h4>
                      <p className="text-gray-600 text-sm">Bratislava • 2 dni</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">€150</p>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                        {language === 'sk' ? 'V procese' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6">
              {language === 'sk' ? 'Rýchle akcie' : 'Quick Actions'}
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-[#4169e1] text-white py-3 rounded-lg font-medium hover:bg-[#3558d4] transition-colors flex items-center justify-center space-x-2">
                <User size={20} />
                <span>{language === 'sk' ? 'Upraviť profil' : 'Edit Profile'}</span>
              </button>
              
              <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                <Calendar size={20} />
                <span>{language === 'sk' ? 'Kalendár' : 'Calendar'}</span>
              </button>
              
              <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                <MessageSquare size={20} />
                <span>{language === 'sk' ? 'Správy' : 'Messages'}</span>
              </button>
              
              <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                <BarChart3 size={20} />
                <span>{language === 'sk' ? 'Štatistiky' : 'Statistics'}</span>
              </button>
              
              <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                <Settings size={20} />
                <span>{language === 'sk' ? 'Nastavenia' : 'Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};