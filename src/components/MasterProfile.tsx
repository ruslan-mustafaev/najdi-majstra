import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, MapPin, Clock, Phone, Mail, Globe, Award, Users, Calendar, Euro, Play, Facebook, Instagram, Linkedin, Youtube, Twitter, MessageCircle } from 'lucide-react';
import { Master } from '../types';
import { WorkPlanningCalendar } from './WorkPlanningCalendar';
import { MasterPortfolio } from './MasterPortfolio';
import { ReviewForm } from './ReviewForm';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

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
      return <img src="/svg_social/tiktok-icon.svg" alt="TikTok" className="w-5 h-5" />;
    case 'telegram':
      return <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">T</div>;
    default:
      return <Globe size={20} className="text-gray-600" />;
  }
};

export const MasterProfile: React.FC<MasterProfileProps> = ({ master, onBack, isOwnProfile = false }) => {
  const { user } = useAuth();
  const [contactHours, setContactHours] = useState<string>('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isUserMaster, setIsUserMaster] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const checkIfUserIsMaster = async () => {
      if (!user) {
        setIsUserMaster(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('masters')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data) {
          setIsUserMaster(true);
        } else {
          setIsUserMaster(false);
        }
      } catch (error) {
        console.error('Error checking if user is master:', error);
        setIsUserMaster(false);
      }
    };

    checkIfUserIsMaster();
  }, [user]);

  useEffect(() => {
    const loadContactHours = async () => {
      if (!master.userId) return;

      try {
        const { data, error } = await supabase
          .from('master_contact_hours')
          .select('*')
          .eq('master_id', master.userId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          if (data.is_24_7) {
            setContactHours('Dostupný 24/7');
          } else {
            const schedule = data.schedule as any;
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const dayLabels = ['Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok', 'Sobota', 'Nedeľa'];

            const activeDays = days
              .map((day, index) => {
                if (schedule[day] && schedule[day].length > 0) {
                  const times = schedule[day].map((slot: any) => `${slot.start}-${slot.end}`).join(', ');
                  return `${dayLabels[index]}: ${times}`;
                }
                return null;
              })
              .filter(Boolean);

            if (activeDays.length > 0) {
              setContactHours(activeDays.join('\n'));
            }
          }
        }
      } catch (error) {
        console.error('Error loading contact hours:', error);
      }
    };

    loadContactHours();
  }, [master.userId]);

  const loadReviews = async () => {
    if (!master.userId) return;

    try {
      const { data, error } = await supabase
        .from('master_reviews')
        .select('*')
        .eq('master_id', master.userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Используем client_name из базы данных или показываем "Клиент" по умолчанию
        const reviewsWithClients = data.map((review) => ({
          ...review,
          client: {
            name: review.client_name || 'Клиент'
          }
        }));

        setReviews(reviewsWithClients);

        if (data.length > 0) {
          const avgRating = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
          setAverageRating(Math.round(avgRating * 10) / 10);
        }
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [master.userId]);

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
            <span>{isOwnProfile ? 'Späť na hlavnú stránku' : 'Späť na úvod'}</span>
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
              
              {/* Work Videos Section */}
              {master.workVideos && master.workVideos.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Video ukážky práce</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {master.workVideos.map((videoUrl, index) => (
                      <div key={index}>
                        <video
                          src={videoUrl}
                          controls
                          className="w-full rounded-lg shadow-md"
                          style={{ maxHeight: '300px' }}
                        >
                          Váš prehliadač nepodporuje video element.
                        </video>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
            </div>

            {/* Reviews */}
            <MasterPortfolio masterId={master.id} isEditable={false} />

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Hodnotenia klientov</h2>
                  {averageRating > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center">
                        {renderStars(Math.round(averageRating))}
                      </div>
                      <span className="text-lg font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
                      <span className="text-sm text-gray-500">({reviews.length} {reviews.length === 1 ? 'recenzia' : 'recenzií'})</span>
                    </div>
                  )}
                </div>
                {!isOwnProfile && user && !isUserMaster && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-[#4169e1] text-white px-4 py-2 rounded-lg hover:bg-[#3155c7] transition-colors text-sm font-medium"
                  >
                    Zanechať recenziu
                  </button>
                )}
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {review.client?.name || 'Клиент'}
                          </h4>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 mb-1">
                            {renderStars(review.rating)}
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('sk-SK')}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Zatiaľ žiadne recenzie</p>
                  {!isOwnProfile && user && (
                    <p className="text-sm mt-2">Buďte prvý, kto zanechá recenziu!</p>
                  )}
                </div>
              )}
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

              {/* Contact Hours */}
              {contactHours && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-start space-x-3">
                    <Clock className="text-[#4169e1] mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Kontaktné hodiny</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{contactHours}</p>
                    </div>
                  </div>
                </div>
              )}

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

              {/* Social Media */}
              {((master as any).socialFacebook || (master as any).socialInstagram || (master as any).socialYoutube ||
                (master as any).socialTiktok || (master as any).socialTelegram || (master as any).socialWhatsapp) && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Sledujte ma</h4>
                  <div className="flex flex-wrap gap-3">
                    {(master as any).socialFacebook && (
                      <a
                        href={(master as any).socialFacebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
                        title="Facebook"
                      >
                        <Facebook size={20} className="text-white" />
                      </a>
                    )}
                    {(master as any).socialInstagram && (
                      <a
                        href={(master as any).socialInstagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-600 hover:bg-pink-700 transition-colors"
                        title="Instagram"
                      >
                        <Instagram size={20} className="text-white" />
                      </a>
                    )}
                    {(master as any).socialYoutube && (
                      <a
                        href={(master as any).socialYoutube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                        title="YouTube"
                      >
                        <Youtube size={20} className="text-white" />
                      </a>
                    )}
                    {(master as any).socialTiktok && (
                      <a
                        href={(master as any).socialTiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-black hover:bg-gray-800 transition-colors"
                        title="TikTok"
                      >
                        <img src="/svg_social/tiktok-icon.svg" alt="TikTok" className="w-6 h-6" />
                      </a>
                    )}
                    {(master as any).socialTelegram && (
                      <a
                        href={(master as any).socialTelegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
                        title="Telegram"
                      >
                        <MessageCircle size={20} className="text-white" />
                      </a>
                    )}
                    {(master as any).socialWhatsapp && (
                      <a
                        href={(master as any).socialWhatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
                        title="WhatsApp"
                      >
                        <Phone size={20} className="text-white" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Detaily</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Award className="text-[#4169e1] mt-1" size={20} />
                  <div>
                    <p className="font-medium">Skúsenosti</p>
                    <p className="text-gray-600 text-sm">
                      {(master as any).experienceYears
                        ? `${(master as any).experienceYears} rokov`
                        : master.experience || 'Neuvedené'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="text-[#4169e1] mt-1" size={20} />
                  <div>
                    <p className="font-medium">Pracujem</p>
                    <p className="text-gray-600 text-sm">
                      {(master as any).teamType || (master.teamSize === 'individual' ? 'Individuálne' : 'Skupina')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="text-[#4169e1] mt-1" size={20} />
                  <div>
                    <p className="font-medium">Oblasť pôsobenia</p>
                    <p className="text-gray-600 text-sm">
                      {(master as any).serviceArea || master.availability?.workRadius || master.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Euro className="text-[#4169e1] mt-1" size={20} />
                  <div>
                    <p className="font-medium">Cenové rozpätie</p>
                    <p className="text-gray-600 text-sm">
                      {(master as any).hourlyRateMin && (master as any).hourlyRateMax
                        ? `${(master as any).hourlyRateMin} - ${(master as any).hourlyRateMax} €/hod`
                        : master.priceRange || 'Neuvedené'}
                    </p>
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
                {(master as any).certificatesText ? (
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {(master as any).certificatesText}
                  </div>
                ) : master.certifications && master.certifications.length > 0 ? (
                  master.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Award className="text-green-600" size={16} />
                      <span className="text-sm">{cert}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Zatiaľ neuvedené</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && master.userId && (
        <ReviewForm
          masterId={master.userId}
          onClose={() => setShowReviewForm(false)}
          onReviewSubmitted={() => {
            loadReviews();
            setShowReviewForm(false);
          }}
        />
      )}
    </div>
  );
};