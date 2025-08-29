import React, { useState, useEffect } from 'react';
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
import { mockMasters, Master } from './data/mockData';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [pendingUserType, setPendingUserType] = useState<'client' | 'master' | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [recentlyViewed, setRecentlyViewed] = useState<Master[]>([]);
  const [selectedMaster, setSelectedMaster] = useState<Master | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    profession: '',
    availability: '',
    experience: ''
  });
  const [masterProfileData, setMasterProfileData] = useState<Master | null>(null);

  useEffect(() => {
    // Show welcome popup only if user is not authenticated and not loading
    if (!loading) {
      if (!user) {
        setShowWelcomePopup(true);
      }
    }

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
  }, [user, loading]);

  // Handle user type selection from welcome popup
  const handleUserTypeSelect = (type: 'client' | 'master') => {
    // This is called when user is already authenticated
    // Direct them to appropriate dashboard
    if (type === 'master') {
      // User is authenticated and wants master dashboard
      // This will be handled by the render logic below
    }
    setShowWelcomePopup(false);
  };

  // Handle authentication requirement from welcome popup
  const handleAuthRequired = (type: 'client' | 'master') => {
    setPendingUserType(type);
    setAuthMode('register'); // Default to register for new users
    setShowWelcomePopup(false);
    setShowAuthModal(true);
  };

  // Handle successful authentication
  const handleAuthSuccess = (userType: 'client' | 'master') => {
    // Don't close modal immediately, let the AuthModal handle the flow
    // setShowAuthModal(false);
    // setPendingUserType(null);
  };

  // Handle registration success (email confirmation needed)
  const handleRegistrationSuccess = (email: string) => {
    setRegistrationEmail(email);
    setShowAuthModal(false);
    setShowEmailConfirmation(true);
  };

  // Handle email confirmation completion
  const handleEmailConfirmed = () => {
    setShowEmailConfirmation(false);
    setAuthMode('login');
    setShowAuthModal(true);
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

  // Create master profile from user data
  const createMasterProfileFromUser = (user: any): Master => {
    const userData = user.user_metadata || {};
    
    return {
      id: user.id,
      name: userData.full_name || userData.first_name + ' ' + userData.last_name || 'Nový majster',
      profession: userData.profession || 'Majster',
      location: userData.location || 'Slovensko',
      rating: 0.0,
      reviewCount: 0,
      available: true,
      profileImage: userData.profile_image || 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
      workImages: userData.work_images || [
        'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/159358/multimeter-digital-hand-tool-159358.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      workVideo: userData.work_video,
      description: userData.description || 'Profesionálny majster s dlhoročnými skúsenosťami.',
      services: userData.services ? userData.services.split(',') : ['Opravy', 'Inštalácie', 'Servis'],
      experience: userData.experience || '5 rokov',
      certifications: userData.certifications || ['Odborná spôsobilosť'],
      expertise: userData.expertise ? userData.expertise.split(',') : ['Všeobecné práce'],
      teamSize: userData.team_size || 'individual',
      serviceTypes: userData.service_types || ['individuals'],
      languages: userData.languages ? userData.languages.split(',') : ['Slovenčina'],
      priceRange: userData.hourly_rate ? `${userData.hourly_rate} €/hod` : '25-45 €/hod',
      age: userData.age,
      subscriptionPlan: userData.subscription_plan || 'standard',
      communicationStyle: userData.communication_style || 'Profesionálne a vecne',
      workingHours: userData.working_hours || {
        monday: '8:00 - 18:00',
        tuesday: '8:00 - 18:00',
        wednesday: '8:00 - 18:00',
        thursday: '8:00 - 18:00',
        friday: '8:00 - 18:00',
        saturday: '9:00 - 16:00',
        sunday: 'Zatvorené'
      },
      contact: {
        phone: userData.phone || user.phone || '+421 9xx xxx xxx',
        email: user.email,
        website: userData.website,
        socialMedia: userData.social_media || {}
      },
      availability: {
        schedule: userData.schedule || '8:00 - 18:00',
        workRadius: userData.work_radius || 'Lokálne + 50km'
      }
    };
  };

  // Update master profile data when user changes
  useEffect(() => {
    if (user && user.user_metadata?.user_type === 'master') {
      const masterProfile = createMasterProfileFromUser(user);
      setMasterProfileData(masterProfile);
    } else {
      setMasterProfileData(null);
    }
  }, [user]);

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

  // Add master's own profile to the list if they are a master
  const allMasters = masterProfileData 
    ? [masterProfileData, ...mockMasters]
    : mockMasters;

  const allTopRatedMasters = masterProfileData 
    ? [masterProfileData, ...topRatedMasters]
    : topRatedMasters;

  // Show master dashboard if user is authenticated and is a master
  if (user && (user.user_metadata?.user_type === 'master' || pendingUserType === 'master')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <MasterDashboard 
          onBack={() => {
            setPendingUserType(null);
          }}
          onProfileUpdate={(updatedData) => {
            // Update the master profile when dashboard data changes
            if (masterProfileData) {
              setMasterProfileData({
                ...masterProfileData,
                ...updatedData
              });
            }
          }}
        />
        <Footer />
      </div>
    );
  }

  // Show master's own profile if they want to see how it looks on the site
  if (selectedMaster && masterProfileData && selectedMaster.id === masterProfileData.id) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <MasterProfile 
          master={masterProfileData} 
          onBack={handleBackToList} 
          isOwnProfile={true}
        />
        <Footer />
      </div>
    );
  }

  // Show regular master profile
  if (selectedMaster) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <MasterProfile master={selectedMaster} onBack={handleBackToList} />
        <Footer />
      </div>
    );
  }

  // Show search results page
  if (showSearchResults) {
    const filteredMasters = filterMasters(allMasters, searchFilters);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <WelcomePopup 
        isOpen={showWelcomePopup} 
        onClose={handleClosePopup}
        onUserTypeSelect={handleUserTypeSelect}
        onAuthRequired={handleAuthRequired}
      />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingUserType(null);
          // Optionally redirect to home or handle differently
        }}
        initialMode={authMode}
        userType={pendingUserType || 'client'}
        onAuthSuccess={handleAuthSuccess}
        onRegistrationSuccess={handleRegistrationSuccess}
      />
      
      <EmailConfirmation
        isOpen={showEmailConfirmation}
        onClose={() => setShowEmailConfirmation(false)}
        onLoginRequired={handleEmailConfirmed}
        email={registrationEmail}
      />
      
      <Header />
      
      <main>
        <MainSearchSection onSearch={handleSearch} onMasterClick={handleMasterClickFromSearch} />
        
        {/* Top Masters Carousel - includes master's own profile if they are a master */}
        <MastersCarousel 
          masters={allTopRatedMasters} 
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