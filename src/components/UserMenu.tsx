import React, { useState } from 'react';
import { User, LogOut, ChevronDown, Wrench, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigate } from 'react-router-dom';

export const UserMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
    setIsOpen(false);
  };

  const handleAISettingsClick = () => {
    navigate('/ai-settings');
    setIsOpen(false);
  };

  const userDisplayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const isMaster = user?.user_metadata?.user_type === 'master';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2"
      >
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <User size={16} />
        </div>
        <span className="hidden sm:inline font-medium">{userDisplayName}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#4169e1] rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{userDisplayName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400 capitalize">
                    {user.user_metadata?.user_type || 'client'}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {isMaster && (
                <>
                  <button
                    onClick={handleDashboardClick}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                  >
                    <Wrench size={16} />
                    <span>{language === 'sk' ? 'Môj profil' : 'Master Dashboard'}</span>
                  </button>

                  <button
                    onClick={handleAISettingsClick}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                  >
                    <Sparkles size={16} />
                    <span>{language === 'sk' ? 'Môj AI predajca' : 'My AI Seller'}</span>
                  </button>
                </>
              )}
            </div>

            {/* Sign Out */}
            <div className="border-t border-gray-100 pt-2">
              <button 
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700 transition-colors"
              >
                <LogOut size={16} />
                <span>{language === 'sk' ? 'Odhlásiť sa' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};