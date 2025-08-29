import React, { useState, useEffect } from 'react';
import { Heart, Plus, Menu } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { AuthModal } from './AuthModal';
import { UserMenu } from './UserMenu';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../data/translations';

export const Header: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language];
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authUserType, setAuthUserType] = useState<'client' | 'master'>('client');

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlHeader);
    return () => window.removeEventListener('scroll', controlHeader);
  }, [lastScrollY]);

  const handleLoginClick = () => {
    setAuthMode('login');
    setAuthUserType('client');
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (userType: 'client' | 'master') => {
    // This will be handled by the main App component through user state changes
    // No additional action needed here
  };
  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-[#4169e1]/90 to-[#5a7bff]/90 backdrop-blur-md shadow-lg transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">
                {t.brand}
              </h1>
            </div>

            {/* Navigation */}

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              
              <button className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors">
                <Heart size={20} />
                <span className="hidden sm:inline">{t.navigation.favorites}</span>
              </button>

              {/* Auth Section */}
              {user ? (
                <UserMenu />
              ) : (
                <button 
                  onClick={handleLoginClick}
                  className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors"
                >
                  <span className="hidden sm:inline">{t.navigation.login}</span>
                </button>
              )}

              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                <Plus size={20} />
                <span className="hidden sm:inline">{t.navigation.addAd}</span>
              </button>

              <button className="md:hidden text-white">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        userType={authUserType}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};