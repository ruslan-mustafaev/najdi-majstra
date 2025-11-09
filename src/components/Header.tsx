import React, { useState, useEffect } from 'react';
import { Plus, Menu, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthModal } from './AuthModal';
import { UserMenu } from './UserMenu';
import { OfferNotifications } from './OfferNotifications';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../data/translations';
import { supabase } from '../lib/supabase';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language];
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authUserType, setAuthUserType] = useState<'client' | 'master'>('client');
  const [isMaster, setIsMaster] = useState(false);

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

  useEffect(() => {
    const checkIfUserIsMaster = async () => {
      if (!user) {
        setIsMaster(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('masters')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        setIsMaster(!!data && !error);
      } catch (error) {
        console.error('Error checking if user is master:', error);
        setIsMaster(false);
      }
    };

    checkIfUserIsMaster();
  }, [user]);

  const handleLoginClick = () => {
    setAuthMode('login');
    setAuthUserType('client');
    setAuthModalOpen(true);
  };

  const handleRegisterClick = () => {
    setAuthMode('register');
    setAuthUserType('client'); // Default to client, user can change it
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (userType: 'client' | 'master') => {
    setAuthModalOpen(false);
    if (userType === 'master') {
      navigate('/dashboard');
    }
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

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              {user && <OfferNotifications isMaster={isMaster} />}

              {/* Auth Section */}
              {user ? (
                <UserMenu />
              ) : (
                <>
                  <button
                    onClick={handleLoginClick}
                    className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors"
                  >
                    <span className="hidden sm:inline">{t.navigation.login}</span>
                  </button>

                  <button
                    onClick={handleRegisterClick}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <UserPlus size={20} />
                    <span className="hidden sm:inline">{t.navigation.register}</span>
                  </button>
                </>
              )}
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