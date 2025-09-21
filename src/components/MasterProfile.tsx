import React from 'react';
import { useEffect } from 'react';
import { ArrowLeft, Star, MapPin, Clock, Phone, Mail, Globe, Award, Users, Calendar, Euro, Play, Facebook, Instagram, Linkedin, Youtube, Twitter, BookText as TikTok } from 'lucide-react';
import { Master } from '../types';
import { WorkPlanningCalendar } from './WorkPlanningCalendar';

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
}

interface MasterProfileProps {
  master: Master;
  onBack: () => void;
  isOwnProfile?: boolean;
}

const mockReviews: Review[] = [
  {
    id: '1',
    clientName: 'Mária Novotná',
    rating: 5,
    comment: 'Výborná práca, veľmi profesionálny prístup. Všetko bolo dokončené včas a kvalitne. Určite odporúčam!',
    date: '15.12.2024',
    service: 'Inštalácia kotla'
  },
  {
    id: '2',
    clientName: 'Peter Kováč',
    rating: 5,
    comment: 'Rýchla reakcia na pohotovostnú výzvu. Problém vyriešil do hodiny. Ceny primerané, komunikácia na vysokej úrovni.',
    date: '08.12.2024',
    service: 'Pohotovostný servis'
  },
  {
    id: '3',
    clientName: 'Jana Svobodová',
    rating: 4,
    comment: 'Solídna práca, len trochu dlhšie trvalo ako sme sa dohodli. Inak spokojnosť, kvalita v poriadku.',
    date: '02.12.2024',
    service: 'Revízia plynu'
  },
  {
    id: '4',
    clientName: 'Tomáš Horváth',
    rating: 5,
    comment: 'Už druhýkrát využívam služby tohto majstra. Vždy spoľahlivý, presný a ceny férové. Môžem len odporučiť.',
    date: '28.11.2024',
    service: 'Servis kotla'
  },
  {
    id: '5',
    clientName: 'Eva Kratochvílová',
    rating: 5,
    comment: 'Perfektná komunikácia už od prvého kontaktu. Práca vykonaná na jednotku, všetko vysvetlil a poradil.',
    date: '20.11.2024',
    service: 'Inštalácia plynového rozvodu'
  }
];

const getSocialIcon = (platform: string) => {
  switch (platform) {
    case 'facebook':
      return <Facebook size={20} className="text-blue-600" />;
    case 'instagram':
      return <Instagram size={20} className="text-pink-600" />;
    case 'linkedin':
      return <Linkedin size={20} className="text-blue-700" />;
    case 'youtube':
      return <Youtube size={20} className="text-red-600" />;
    case 'twitter':
      return <Twitter size={20} className="text-blue-400" />;
    case 'tiktok':
      return <TikTok size={20} className="text-black" />;
    case 'telegram':
      return <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">T</div>;
    default:
      return <Globe size={20} className="text-gray-600" />;
  }
};

export const MasterProfile: React.FC<MasterProfileProps> = ({ master, onBack, isOwnProfile = false }) => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Function to check if master is currently available based on current time and day
  const getCurrentAvailability = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Convert to our day mapping (Monday = 1, Sunday = 7)
    const dayMapping = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayKey = dayMapping[currentDay];
    
    // Different availability patterns for different masters
    let todayHours = master.workingHours?.[currentDayKey] || '8:00 - 17:00';
    let isWorkingDay = true;
    
    // Master-specific schedules for variety
    if (master.id === '1' && currentDayKey === 'sunday') {
      isWorkingDay = false;
    } else if (master.id === '2' && currentDayKey === 'monday') {
      isWorkingDay = false;
    } else if (master.id === '3' && (currentDayKey === 'saturday' || currentDayKey === 'sunday')) {
      isWorkingDay = false;
    }
    
    // Create variety in current availability based on master ID and current time
    const masterIdNum = parseInt(master.id);
    const timeVariation = (masterIdNum * 2) % 24; // Different time offsets for each master
    const adjustedHour = (currentHour + timeVariation) % 24;
    
    // Parse working hours
    if (!isWorkingDay) {
      return { available: false, reason: 'Dnes zatvorené' };
    }
    
    // Some masters are available now, some are not - based on their ID
    if (masterIdNum % 3 === 0) {
      return { available: true, reason: `dostupný do ${todayHours.split(' - ')[1]}` };
    } else if (masterIdNum % 3 === 1) {
      return { available: false, reason: 'dnes už zatvorené' };
    }
    
    const [startTime, endTime] = todayHours.split(' - ');
    const [startHour] = startTime.split(':').map(Number);
    const [endHour] = endTime.split(':').map(Number);
    
    if (adjustedHour >= startHour && adjustedHour < endHour) {
      return { available: true, reason: `dostupný do ${endTime}` };
    } else if (adjustedHour < startHour) {
      return { available: false, reason: `dostupný od ${startTime}` };
    } else {
      return { available: false, reason: 'dnes už zatvorené' };
    }
  };

  const currentAvailability = getCurrentAvailability();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>{isOwnProfile ? 'Späť na hlavnú stránku' : 'Späť na zoznam'}</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Images */}
          <div className="lg:col-span-1">
            {/* Main Profile Image */}
            <div className="relative mb-6">
              <img
                src={master.profileImage}
                alt={master.name}
                className="w-full aspect-square object-cover rounded-xl shadow-lg"
              />
              <div className="absolute top-4 right-4">
                <div className={`w-4 h-4 rounded-full border-2 border-white ${
                  master.available ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </div>
            </div>

            {/* Work Images and Video Grid */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Ukážky práce</h4>
              <div className="grid grid-cols-2 gap-2">
                {master.workImages && master.workImages.length > 0 ? (
                  master.workImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Práca ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))
                ) : (
                  <div className="col-span-2 bg-gray-100 rounded-lg p-6 text-center">
                    <p className="text-gray-600 text-sm">
                      Zatiaľ majster ešte nič nenahrál
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Social Media */}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {master.name}{master.age && `, ${master.age}`}
                  </h1>
                  <p className="text-xl text-[#4169e1] font-semibold mb-2">
                    {master.profession}
                  </p>
                  {/* Communication Style */}
                  {master.communicationStyle && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 font-medium mb-1">Rád komunikujem:</p>
                      <p className="text-sm text-gray-800 bg-blue-50 px-3 py-2 rounded-lg border-l-4 border-blue-400">
                        {master.communicationStyle}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin size={18} className="mr-2" />
                    <span>{master.location}</span>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    currentAvailability.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      currentAvailability.available ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    {currentAvailability.available ? 'Dostupný teraz' : 'Momentálne nedostupný'}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {currentAvailability.reason} • aktualizácia pred 2 hodinami
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-2">
                    <Star className="text-yellow-400 fill-current" size={24} />
                    <span className="text-2xl font-bold">{master.rating}</span>
                  </div>
                  <p className="text-gray-600">({master.reviewCount} hodnotení)</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                {master.description}
              </p>

              {/* Services */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Služby</h3>
                <div className="flex flex-wrap gap-2">
                  {master.services.map((service, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Hodnotenia klientov</h2>
              <div className="space-y-6">
                {mockReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{review.clientName}</h4>
                        <p className="text-sm text-gray-600">{review.service}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-sm text-gray-500">{review.date}</p>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Contact & Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">{master.contact.phone}</div>
                  <div className="flex justify-center space-x-3 mb-3">
                    <button className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors">
                      <Phone size={20} />
                    </button>
                    <button className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors">
                      <Mail size={20} />
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                    Pri volaní uveďte, že voláte z <span className="font-medium text-blue-600">najdiMajstra.sk</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="text-blue-600" size={20} />
                  <span className="text-sm break-all">{master.contact.email}</span>
                </div>
                {master.contact.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="text-gray-600" size={20} />
                    <span className="text-sm break-all">{master.contact.website}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6 space-y-3">
                <button className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2">
                  <Phone size={20} />
                  <span>{isOwnProfile ? 'Upraviť profil' : 'Zavolať'}</span>
                </button>
                <button className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2">
                  <Mail size={20} />
                  <span>{isOwnProfile ? 'Zobraziť ako Dashboard' : 'Napísať email'}</span>
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Detaily</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Award className="text-[#4169e1] mt-1" size={20} />
                  <div>
                    <p className="font-medium">Skúsenosti</p>
                    <p className="text-gray-600 text-sm">{master.experience}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Users className="text-[#4169e1] mt-1" size={20} />
                  <div>
                    <p className="font-medium">Tím</p>
                    <p className="text-gray-600 text-sm">
                      {master.teamSize === 'individual' ? 'Individuálne' : 'Malý tím'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="text-[#4169e1] mt-1" size={20} />
                  <div>
                    <p className="font-medium">Oblasť pôsobenia</p>
                    <p className="text-gray-600 text-sm">{master.availability?.workRadius || master.location}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Euro className="text-[#4169e1] mt-1" size={20} />
                  <div>
                    <p className="font-medium">Cenové rozpätie</p>
                    <p className="text-gray-600 text-sm">{master.priceRange}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Planning Calendar */}
            <WorkPlanningCalendar masterId={master.id} />

            {/* Certifications */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Certifikáty</h3>
              <div className="space-y-2">
                {master.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Award className="text-green-600" size={16} />
                    <span className="text-sm">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};