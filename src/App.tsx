import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { LanguageProvider } from './hooks/useLanguage';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Header } from './components/Header';
import { WelcomePopup } from './components/WelcomePopup';
import { AuthModal } from './components/AuthModal';
import { MainSearchSection } from './components/MainSearchSection';
import { MastersCarousel } from './components/MastersCarousel';
import { NoResults } from './components/NoResults';
import { Footer } from './components/Footer';
import { MasterProfile } from './components/MasterProfile';
import { SearchResults } from './components/SearchResults';
import { MasterDashboard } from './components/MasterDashboard';
import { EmailConfirmation } from './components/EmailConfirmation';
import { Master } from './data/mockData';
import { getTopRatedMasters } from './lib/mastersApi';

// Главная страница
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [pendingUserType, setPendingUserType] = useState<'client' | 'master' | null>(null);
  const [realMasters, setRealMasters] = useState<Master[]>([]);
  const [isLoadingMasters, setIsLoadingMasters] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState<Master[]>([]);

  useEffect(() => {
    // Show welcome popup only for completely new users (not logged in and no localStorage data)
    // Show welcome popup only for completely new users (not logged in and no localStorage data)
    if (!loading && !user && !localStorage.getItem('user-visited')) {
      setShowWelcomePopup(true);
    }

    // Load recently viewed - only real profiles from database
    const loadRecentlyViewed = async () => {
      const saved = localStorage.getItem('recently-viewed');
      if (saved) {
        try {
          const savedIds = JSON.parse(saved);
          // Load masters by IDs from database
          if (Array.isArray(savedIds) && savedIds.length > 0) {
            const allMasters = await getTopRatedMasters();
            const recentMasters = savedIds
              .map(id => allMasters.find(master => master.id === id))
              .filter(Boolean) as Master[];
            setRecentlyViewed(recentMasters);
          }
        } catch (error) {
          console.error('Error parsing recently viewed:', error);
          // Clear invalid data
          localStorage.removeItem('recently-viewed');
        }
      }
    };
    
    loadRecentlyViewed();
  }, [user, loading]);

  // Load masters from Supabase
  useEffect(() => {
    const loadMasters = async () => {
      setIsLoadingMasters(true);
      try {
        const masters = await getTopRatedMasters();
        setRealMasters(masters);
      } catch (error) {
        console.error('Error loading masters:', error);
      } finally {
        setIsLoadingMasters(false);
      }
    };
    loadMasters();
  }, []);

  const handleUserTypeSelect = (type: 'client' | 'master') => {
    // Mark that user has visited the site
    localStorage.setItem('user-visited', 'true');
    
    if (type === 'master' && user) {
      navigate('/dashboard');
    }
    setShowWelcomePopup(false);
  };

  const handleAuthRequired = (type: 'client' | 'master') => {
    // Mark that user has visited the site
    localStorage.setItem('user-visited', 'true');
    
    setPendingUserType(type);
    setAuthMode('register');
    setShowWelcomePopup(false);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (userType: 'client' | 'master') => {
    // Mark that user has visited the site
    localStorage.setItem('user-visited', 'true');
    
    if (userType === 'master') {
      navigate('/dashboard');
    }
  };

  const handleMasterClick = (master: Master) => {
    // Add to recently viewed when clicking on master
    addToRecentlyViewed(master);
    
    // Navigate to profile
    navigate(`/profile/${master.id}`);
  };

  const addToRecentlyViewed = (master: Master) => {
    // Store master ID in localStorage
    const savedIds = JSON.parse(localStorage.getItem('recently-viewed') || '[]');
    const filteredIds = savedIds.filter((id: string) => id !== master.id);
    const updatedIds = [master.id, ...filteredIds].slice(0, 10);
    localStorage.setItem('recently-viewed', JSON.stringify(updatedIds));
    
    // Update state with actual master object
    setRecentlyViewed(prev => {
      const filtered = prev.filter(m => m.id !== master.id);
      return [master, ...filtered].slice(0, 10);
    });
  };

  const handleSearch = (filters: any) => {
    // Navigate to search with query params
    const params = new URLSearchParams(filters);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WelcomePopup 
        isOpen={showWelcomePopup} 
        onClose={() => setShowWelcomePopup(false)}
        onUserTypeSelect={handleUserTypeSelect}
        onAuthRequired={handleAuthRequired}
      />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingUserType(null);
        }}
        initialMode={authMode}
        userType={pendingUserType || 'client'}
        onAuthSuccess={handleAuthSuccess}
        onRegistrationSuccess={(email) => {
          // Handle email confirmation
          setShowAuthModal(false);
        }}
      />

      <Header />
      
      <main>
        <MainSearchSection 
          onSearch={handleSearch} 
          onMasterClick={(masterId) => navigate(`/profile/${masterId}`)} 
        />
        
        {isLoadingMasters ? (
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4169e1] mx-auto"></div>
              <p className="text-gray-600 mt-4">Načítavam majstrov...</p>
            </div>
          </div>
        ) : realMasters.length > 0 ? (
          <MastersCarousel 
            masters={realMasters} 
            title="Najlepšie hodnotení majstri" 
            onMasterClick={handleMasterClick}
          />
        ) : (
          <div className="container mx-auto px-4 py-8">
            <div className="text-center bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Zatiaľ žiadni majstri</h3>
              <p className="text-gray-600">Buďte prvý majster na platforme!</p>
            </div>
          </div>
        )}
        
        {recentlyViewed.length > 0 && (
          <MastersCarousel 
            masters={recentlyViewed} 
            title="Naposledy zobrazené"
            onMasterClick={handleMasterClick}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

// Страница профиля мастера
const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [master, setMaster] = useState<Master | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMaster = async () => {
      setLoading(true);
      try {
        // Если это профиль текущего пользователя-мастера, перенаправляем на dashboard
        if (user && user.user_metadata?.user_type === 'master' && user.id === id) {
          navigate('/dashboard');
          return;
        }
        
        // Load all masters and find the needed one
        const masters = await getTopRatedMasters();
        const foundMaster = masters.find(m => m.id === id);
        
        if (foundMaster) {
          setMaster(foundMaster);
          
          // Add to recently viewed when profile is loaded
          const savedIds = JSON.parse(localStorage.getItem('recently-viewed') || '[]');
          const filteredIds = savedIds.filter((masterId: string) => masterId !== id);
          const updatedIds = [id, ...filteredIds].slice(0, 10);
          localStorage.setItem('recently-viewed', JSON.stringify(updatedIds));
        }
      } catch (error) {
        console.error('Error loading master:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMaster();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4169e1] mx-auto"></div>
            <p className="text-gray-600 mt-4">Načítavam profil...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!master) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center bg-white rounded-lg p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Profil nenájdený</h3>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 bg-[#4169e1] text-white px-6 py-2 rounded-lg hover:bg-[#3558d4]"
            >
              Späť na hlavnú stránku
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <MasterProfile 
        master={master} 
        onBack={() => navigate(-1)} // Go back to previous page instead of home
        isOwnProfile={false}
      />
      <Footer />
    </div>
  );
};

// Страница дашборда мастера
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Проверяем авторизацию
  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to home');
      navigate('/');
      return;
    }
    
    console.log('User in dashboard:', user);
    console.log('User type:', user.user_metadata?.user_type);
  }, [user, navigate]);

  const handleProfileUpdate = async (profileData: any) => {
    // Сохраняем профиль и перезагружаем данные
    console.log('Profile updated:', profileData);
    // После успешного сохранения можно перенаправить на страницу профиля
    // navigate(`/profile/${user?.id}`);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <MasterDashboard 
        onBack={() => navigate('/')}
        onProfileUpdate={handleProfileUpdate}
      />
      <Footer />
    </div>
  );
};

// Страница результатов поиска
const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = {
    city: searchParams.get('city') || '',
    profession: searchParams.get('profession') || '',
    availability: searchParams.get('availability') || '',
    experience: searchParams.get('experience') || ''
  };

  useEffect(() => {
    const loadAndFilterMasters = async () => {
      setLoading(true);
      try {
        const allMasters = await getTopRatedMasters();
        
        // Фильтруем мастеров
        const filtered = allMasters.filter(master => {
          if (filters.city && !master.location.toLowerCase().includes(filters.city.toLowerCase())) {
            return false;
          }
          if (filters.profession && !master.profession.toLowerCase().includes(filters.profession.toLowerCase())) {
            return false;
          }
          if (filters.availability === 'Dostupný teraz' && !master.available) {
            return false;
          }
          return true;
        });
        
        setMasters(filtered);
      } catch (error) {
        console.error('Error loading masters:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAndFilterMasters();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4169e1] mx-auto"></div>
            <p className="text-gray-600 mt-4">Hľadám majstrov...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <SearchResults
        masters={masters}
        filters={filters}
        onBack={() => navigate(-1)} // Go back to previous page
        onMasterClick={(master) => navigate(`/profile/${master.id}`)}
      />
      <Footer />
    </div>
  );
};

// Основной компонент приложения с роутингом
const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Главная страница */}
      <Route path="/" element={<HomePage />} />
      
      {/* Профиль мастера */}
      <Route path="/profile/:id" element={<ProfilePage />} />
      
      {/* Дашборд мастера (только для авторизованных мастеров) */}
      <Route path="/dashboard" element={<DashboardPage />} />
      
      {/* Результаты поиска */}
      <Route path="/search" element={<SearchPage />} />
      
      {/* Перенаправление на главную для несуществующих путей */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;