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
import { Master } from './data/mockData';
import { getTopRatedMasters } from './lib/mastersApi';

// Главная страница
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [selectedUserType, setSelectedUserType] = useState<'client' | 'master'>('client');
  const [realMasters, setRealMasters] = useState<Master[]>([]);
  const [isLoadingMasters, setIsLoadingMasters] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState<Master[]>([]);
  const [filteredMasters, setFilteredMasters] = useState<Master[]>([]);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowWelcomePopup(true);
    }

    // Load recently viewed
    const saved = localStorage.getItem('recently-viewed');
    if (saved) {
      try {
        setRecentlyViewed(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing recently viewed:', error);
      }
    }
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

  // ИСПРАВЛЕННЫЙ обработчик выбора типа пользователя
  const handleUserTypeSelect = (type: 'client' | 'master') => {
    console.log('Selected user type in Welcome Popup:', type);
    
    setSelectedUserType(type);
    setAuthMode('register');
    setShowWelcomePopup(false);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (userType: 'client' | 'master') => {
    setShowAuthModal(false);
    if (userType === 'master') {
      navigate('/dashboard');
    }
  };

  const handleRegistrationSuccess = (email: string) => {
    setShowAuthModal(false);
  };

  const handleMasterClick = (master: Master) => {
    console.log('Navigating to master profile:', master.id, master.name);
    
    // Add to recently viewed
    setRecentlyViewed(prev => {
      const filtered = prev.filter(m => m.id !== master.id);
      const updated = [master, ...filtered].slice(0, 10);
      localStorage.setItem('recently-viewed', JSON.stringify(updated));
      return updated;
    });
    
    // Navigate to profile
    navigate(`/profile/${master.id}`);
  };

  const handleSearch = (filters: any) => {
    // Check if any filters are active
    const hasFilters = filters.city || filters.profession || filters.availability || filters.priceRange;
    setHasActiveFilters(hasFilters);
    
    if (hasFilters) {
      // Filter masters based on criteria
      const filtered = realMasters.filter(master => {
        if (filters.city && filters.city !== 'Celé Slovensko' && !master.location.toLowerCase().includes(filters.city.toLowerCase())) {
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
      setFilteredMasters(filtered);
    } else {
      // Если все фильтры пустые - очищаем результаты фильтрации
      setFilteredMasters([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WelcomePopup 
        isOpen={showWelcomePopup} 
        onClose={() => setShowWelcomePopup(false)}
        onUserTypeSelect={handleUserTypeSelect}
      />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setSelectedUserType('client');
        }}
        initialMode={authMode}
        userType={selectedUserType}
        onAuthSuccess={handleAuthSuccess}
        onRegistrationSuccess={handleRegistrationSuccess}
      />

      <Header />
      
      <main>
        <MainSearchSection 
          onSearch={handleSearch} 
          onMasterClick={(masterId) => navigate(`/profile/${masterId}`)} 
        />
        
        {hasActiveFilters ? (
          // Show filtered results
          filteredMasters.length > 0 ? (
            <MastersCarousel 
              masters={filteredMasters} 
              title={`Výsledky vyhľadávania (${filteredMasters.length})`}
              onMasterClick={handleMasterClick}
            />
          ) : (
            <div className="container mx-auto px-4 py-8">
              <div className="text-center bg-white rounded-lg p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Žiadni majstri nenájdení</h3>
                <p className="text-gray-600">Skúste zmeniť kritériá vyhľadávania</p>
              </div>
            </div>
          )
        ) : isLoadingMasters ? (
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
  const [master, setMaster] = useState<Master | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMaster = async () => {
      setLoading(true);
      try {
        console.log('Loading master with ID:', id);
        // Загружаем всех мастеров и находим нужного
        const masters = await getTopRatedMasters();
        console.log('Available masters:', masters.map(m => ({ id: m.id, name: m.name })));
        
        // Ищем мастера по ID (может быть UUID из базы или строковый ID из mockData)
        let foundMaster = masters.find(m => m.id === id);
        
        // Если не найден по точному совпадению, попробуем найти по началу UUID
        if (!foundMaster && id) {
          foundMaster = masters.find(m => m.id.startsWith(id.substring(0, 8)));
        }
        
        // Если все еще не найден, возьмем первого доступного мастера для демонстрации
        if (!foundMaster && masters.length > 0) {
          console.warn('Master not found by ID, using first available master');
          foundMaster = masters[0];
        }
        
        console.log('Found master:', foundMaster);
        
        if (foundMaster) {
          setMaster(foundMaster);
        } else {
          console.error('Master not found with ID:', id);
        }
      } catch (error) {
        console.error('Error loading master:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMaster();
  }, [id]);

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
        onBack={() => navigate('/')}
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

  // Проверяем, является ли пользователь мастером
  useEffect(() => {
    if (!user || user.user_metadata?.user_type !== 'master') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleProfileUpdate = async (profileData: any) => {
    // Сохраняем профиль и перезагружаем данные
    console.log('Profile updated:', profileData);
    // После успешного сохранения можно перенаправить на страницу профиля
    // navigate(`/profile/${user?.id}`);
  };

  if (!user || user.user_metadata?.user_type !== 'master') {
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
        onBack={() => navigate('/')}
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