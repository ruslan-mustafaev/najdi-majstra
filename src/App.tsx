// Главная страница - ИСПРАВЛЕННАЯ ВЕРСИЯ
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
    console.log('Selected user type in Welcome Popup:', type); // Для отладки
    
    setSelectedUserType(type); // Устанавливаем выбранный тип
    setAuthMode('register'); // Режим регистрации
    setShowWelcomePopup(false); // Закрываем welcome popup
    setShowAuthModal(true); // Открываем модальное окно регистрации
  };

  const handleAuthSuccess = (userType: 'client' | 'master') => {
    setShowAuthModal(false);
    if (userType === 'master') {
      navigate('/dashboard');
    }
  };

  const handleRegistrationSuccess = (email: string) => {
    setShowAuthModal(false);
    // Можно добавить уведомление о подтверждении email
  };

  const handleMasterClick = (master: Master) => {
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
    // Navigate to search with query params
    const params = new URLSearchParams(filters);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WelcomePopup 
        isOpen={showWelcomePopup} 
        onClose={() => setShowWelcomePopup(false)}
        onUserTypeSelect={handleUserTypeSelect} // Используем ИСПРАВЛЕННЫЙ обработчик
      />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setSelectedUserType('client'); // Сбрасываем на client по умолчанию
        }}
        initialMode={authMode}
        userType={selectedUserType} // Передаем ПРАВИЛЬНО выбранный тип
        onAuthSuccess={handleAuthSuccess}
        onRegistrationSuccess={handleRegistrationSuccess}
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