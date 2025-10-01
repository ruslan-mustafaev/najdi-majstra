import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { supabase } from './lib/supabase';
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
import { checkConnection } from './lib/supabase';

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
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // ИСПРАВЛЕНО: Мемоизируем функцию фильтрации
  const handleFiltersChange = useCallback((newFilters: any) => {
    console.log('Filters changed:', newFilters);
    
    // Проверяем есть ли активные фильтры
    const hasFilters = newFilters.city || newFilters.profession || newFilters.availability || newFilters.experience;
    
    if (hasFilters) {
      // Фильтруем мастеров
      const filtered = realMasters.filter(master => {
        // Фильтр по городу
        if (newFilters.city && newFilters.city !== 'Celé Slovensko' && 
            !master.location.toLowerCase().includes(newFilters.city.toLowerCase())) {
          return false;
        }
        
        // Фильтр по профессии
        if (newFilters.profession && 
            !master.profession.toLowerCase().includes(newFilters.profession.toLowerCase())) {
          return false;
        }
        
        // Фильтр по доступности
        if (newFilters.availability === 'Dostupný teraz' && !master.available) {
          return false;
        }
        
        // Фильтр по опыту
        if (newFilters.experience) {
          if (newFilters.experience === 'viac ako 10 rokov' && 
              !master.experience.includes('viac ako 10')) {
            return false;
          }
          if (newFilters.experience === '5 rokov a viac' && 
              !master.experience.includes('viac ako') && 
              !master.experience.includes('5')) {
            return false;
          }
        }
        
        return true;
      });
      
      setFilteredMasters(filtered);
      setHasActiveFilters(true);
    } else {
      // Если фильтров нет - очищаем результаты
      setFilteredMasters([]);
      setHasActiveFilters(false);
    }
  }, [realMasters]); // Зависит только от realMasters

  // ИСПРАВЛЕНО: Мемоизируем функцию клика по мастеру
  const handleMasterClick = useCallback((master: Master) => {
    console.log('Master clicked:', master.id, master.name);
    
    // Add to recently viewed
    setRecentlyViewed(prev => {
      const filtered = prev.filter(m => m.id !== master.id);
      const updated = [master, ...filtered].slice(0, 10);
      localStorage.setItem('recently-viewed', JSON.stringify(updated));
      return updated;
    });
    
    // Navigate to profile
    console.log('Navigating to profile:', `/profile/${master.id}`);
    navigate(`/profile/${master.id}`);
  }, [navigate]);

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
      console.log('🚀 App: Starting to load masters...');
      setIsLoadingMasters(true);
      setConnectionError(null);
      try {
        // Проверяем состояние аутентификации перед загрузкой
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('❌ App: Session error before loading masters:', sessionError);
          // Очищаем поврежденную сессию
          await supabase.auth.signOut();
          // Очищаем весь кеш
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') || key.includes('cache')) {
              localStorage.removeItem(key);
            }
          });
        }
        
        const masters = await getTopRatedMasters();
        console.log('✅ App: Masters loaded successfully:', masters.length);
        setRealMasters(masters);
        setRetryCount(0); // Сбрасываем счетчик попыток при успехе
      } catch (error) {
        console.error('❌ App: Error loading masters:', error);
        
        // Проверяем тип ошибки
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes('JWT') || errorMessage.includes('auth') || errorMessage.includes('Session')) {
          setConnectionError('Problém s autentifikáciou. Obnovujem pripojenie...');
          // Очищаем все данные аутентификации
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase') || key.includes('cache')) {
              localStorage.removeItem(key);
            }
          });
        } else {
          setConnectionError('Problém s pripojením k databáze. Skúšam znovu...');
        }
        
        // Автоматическая повторная попытка с экспоненциальной задержкой
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          console.log(`🔄 App: Retrying in ${delay}ms... (attempt ${retryCount + 1}/3)`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
        } else {
          setConnectionError('Nepodarilo sa pripojiť k databáze. Skúste obnoviť stránku.');
          // Очищаем кеш только после всех неудачных попыток
          console.log('🧹 App: Clearing all cache after failed retries...');
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') || key.includes('cache') || key.includes('supabase')) {
              localStorage.removeItem(key);
            }
          });
        }
      } finally {
        setIsLoadingMasters(false);
        console.log('🏁 App: Loading masters finished');
      }
    };
    
    loadMasters();
  }, [retryCount]); // Добавляем retryCount в зависимости
  
  // Дополнительный эффект для отслеживания изменений пользователя
  useEffect(() => {
    if (user) {
      console.log('👤 User changed, clearing masters cache...');
      // Очищаем кеш мастеров при смене пользователя
      Object.keys(localStorage).forEach(key => {
        if (key.includes('masters') || key.includes('cache')) {
          localStorage.removeItem(key);
        }
      });
      // Перезагружаем мастеров
      setRetryCount(0);
    }
  }, [user?.id]); // Зависимость от ID пользователя

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
          onFiltersChange={handleFiltersChange} 
          onMasterClick={(masterId: string) => navigate(`/profile/${masterId}`)} 
        />
        
        {/* Результаты фильтрации или обычный список */}
        {hasActiveFilters ? (
          // Показываем отфильтрованные результаты
          filteredMasters.length > 0 ? (
            <MastersCarousel 
              masters={filteredMasters} 
              title={`Výsledky vyhľadávania (${filteredMasters.length})`}
              onMasterClick={handleMasterClick}
            />
          ) : (
            <div className="container mx-auto px-4 py-8">
              <div className="text-center bg-yellow-50 border border-yellow-200 rounded-xl p-8 max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                  Žiadni majstri nenájdení
                </h3>
                <p className="text-yellow-700">
                  Skúste zmeniť kritériá vyhľadávania alebo vybrať širšiu oblasť.
                </p>
              </div>
            </div>
          )
        ) : connectionError ? (
          // Показываем ошибку подключения
          <div className="container mx-auto px-4 py-8">
            <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-red-800 mb-2">
                Problém s pripojením
              </h3>
              <p className="text-red-700 mb-4">{connectionError}</p>
              <button 
                onClick={() => {
                  setRetryCount(0);
                  window.location.reload();
                }}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Obnoviť stránku
              </button>
            </div>
          </div>
        ) : isLoadingMasters ? (
          // Показываем загрузку
          <div className="container mx-auto px-4 py-8">
            <div className="text-center bg-white rounded-lg p-8 shadow-sm">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4169e1] mx-auto"></div>
              <p className="text-gray-600 mt-4">
                Načítavam majstrov...
                {retryCount > 0 && ` (pokus ${retryCount + 1}/4)`}
              </p>
            </div>
          </div>
        ) : realMasters.length > 0 ? (
          // Показываем обычный список всех мастеров
          <MastersCarousel 
            masters={realMasters} 
            title="Najlepšie hodnotení majstri" 
            onMasterClick={handleMasterClick}
          />
        ) : (
          // Нет мастеров вообще
          <div className="container mx-auto px-4 py-8">
            <div className="text-center bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Zatiaľ žiadni majstri</h3>
              <p className="text-gray-600">Buďte prvý majster na platforme!</p>
            </div>
          </div>
        )
        }
        
        {/* Недавно просмотренные - показываем только если нет активных фильтров */}
        {!hasActiveFilters && recentlyViewed.length > 0 && (
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

  console.log('ProfilePage rendered with ID:', id); // Debug log

  useEffect(() => {
    const loadMaster = async () => {
      console.log('Loading master with ID:', id); // Debug log
      setLoading(true);
      try {
        // Сначала ищем в mockMasters
        const { mockMasters } = await import('./data/mockData');
        let foundMaster = mockMasters.find(m => m.id === id);
        
        // Если не найден в mock, пробуем загрузить из Supabase
        if (!foundMaster) {
          const masters = await getTopRatedMasters();
          foundMaster = masters.find(m => m.id === id);
        }
        
        console.log('Found master:', foundMaster); // Debug log
        
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
    
    if (id) {
      loadMaster();
    }
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