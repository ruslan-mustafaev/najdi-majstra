import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './hooks/useLanguage';
import { AuthProvider } from './hooks/useAuth';
import { Header } from './components/Header';
import { WelcomePopup } from './components/WelcomePopup';
import { MainSearchSection } from './components/MainSearchSection';
import { MastersCarousel } from './components/MastersCarousel';
import { NoResults } from './components/NoResults';
import { Footer } from './components/Footer';
import { MasterProfile } from './components/MasterProfile';
import { SearchResults } from './components/SearchResults';
import { MasterDashboard } from './components/MasterDashboard';
import { mockMasters, Master } from './data/mockData';

const AppContent: React.FC = () => {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [userType, setUserType] = useState<'client' | 'master' | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<Master[]>([]);
  const [selectedMaster, setSelectedMaster] = useState<Master | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    profession: '',
    availability: '',
    experience: ''
  });

  useEffect(() => {
    // Show popup on every page reload (temporarily)
    setShowWelcomePopup(true);

    // Load recently viewed from localStorage
    const savedRecentlyViewed = localStorage.getItem('recently-viewed');
    if (savedRecentlyViewed) {
      try {
        const parsed = JSON.parse(savedRecentlyViewed);
        setRecentlyViewed(parsed);
      } catch (error) {
        console.error('Error parsing recently viewed:', error);
      }
    }
  }, []);

  const handleUserTypeSelect = (type: 'client' | 'master') => {
    setUserType(type);
    setShowWelcomePopup(false);
  };

  const handleClosePopup = () => {
    setShowWelcomePopup(false);
  };

  const handleMasterClick = (master: Master) => {
    // Add to recently viewed (avoid duplicates and limit to 10 items)
    setRecentlyViewed(prev => {
      const filtered = prev.filter(m => m.id !== master.id);
      const updated = [master, ...filtered].slice(0, 10);
      localStorage.setItem('recently-viewed', JSON.stringify(updated));
      return updated;
    });
    
    // Show master profile
    setSelectedMaster(master);
  };

  const handleBackToList = () => {
    setSelectedMaster(null);
  };

  const handleSearch = (filters: typeof searchFilters) => {
    setSearchFilters(filters);
    setShowSearchResults(true);
  };

  const handleMasterClickFromSearch = (masterId: string) => {
    const master = mockMasters.find(m => m.id === masterId);
    if (master) {
      handleMasterClick(master);
    }
  };
  const handleBackToHome = () => {
    setShowSearchResults(false);
  };

  const filterMasters = (masters: Master[], filters: typeof searchFilters) => {
    return masters.filter(master => {
      // Filter by city
      if (filters.city && !filters.city.startsWith('- ')) {
        if (!master.location.toLowerCase().includes(filters.city.toLowerCase())) {
          return false;
        }
      }

      // Filter by profession
      if (filters.profession && !filters.profession.startsWith('- ')) {
        if (!master.profession.toLowerCase().includes(filters.profession.toLowerCase())) {
          return false;
        }
      }

      // Filter by availability
      if (filters.availability && !filters.availability.startsWith('- ')) {
        if (filters.availability === 'Dostupný teraz' || filters.availability === 'Available now') {
          if (!master.available) return false;
        }
      }

      // Filter by price range
      if (filters.experience && !filters.experience.startsWith('- ')) {
        const masterExperience = master.experience.toLowerCase();
        
        if (filters.experience === '1 rok a viac') {
          if (!masterExperience.includes('rok') && !masterExperience.includes('viac')) return false;
        }
        
        if (filters.experience === '3 roky a viac') {
          if (masterExperience.includes('začiatočník') || masterExperience.includes('1 rok')) return false;
        }
        
        if (filters.experience === '5 rokov a viac') {
          if (masterExperience.includes('začiatočník') || masterExperience.includes('1 rok') || masterExperience.includes('2 rok')) return false;
        }
        
        if (filters.experience === '10 rokov a viac') {
          if (!masterExperience.includes('viac ako 10')) return false;
        }
        
        if (filters.experience === '20 rokov a viac') {
          if (!masterExperience.includes('viac ako 10')) return false; // Assuming 10+ includes 20+
        }
      }

      return true;
    });
  };

  // Sort masters by rating for featured carousel
  const topRatedMasters = [...mockMasters].sort((a, b) => b.rating - a.rating);

  // Show master dashboard if user selected master
  if (userType === 'master') {
    return (
      <div className="min-h-screen bg-gray-50">
        <MasterDashboard onBack={() => setUserType(null)} />
      </div>
    );
  }

  // Show search results page
  if (showSearchResults) {
    const filteredMasters = filterMasters(mockMasters, searchFilters);
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <SearchResults
          masters={filteredMasters}
          filters={searchFilters}
          onBack={handleBackToHome}
          onMasterClick={handleMasterClick}
        />
        <Footer />
      </div>
    );
  }

  if (selectedMaster) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <MasterProfile master={selectedMaster} onBack={handleBackToList} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WelcomePopup 
        isOpen={showWelcomePopup} 
        onClose={handleClosePopup}
        onUserTypeSelect={handleUserTypeSelect}
      />
      
      <Header />
      
      <main>
        <MainSearchSection onSearch={handleSearch} onMasterClick={handleMasterClickFromSearch} />
        
        {/* Top Masters Carousel */}
        <MastersCarousel 
          masters={topRatedMasters} 
          title="Najlepšie hodnotení majstri" 
          onMasterClick={handleMasterClick}
        />
        
        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <MastersCarousel 
            masters={recentlyViewed} 
            title="Naposledy zobrazené"
            onMasterClick={handleMasterClick}
          />
        )}
        
        {/* No Results Example */}
        <div className="container mx-auto px-4">
          <NoResults />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;