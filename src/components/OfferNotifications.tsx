import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Calendar, MapPin, User, Mail, Phone, CheckCircle, XCircle, Download, Printer } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const CircleEuroIcon = ({ size = 28, className = '' }: { size?: number; className?: string }) => (
  <img
    src="/icon_notification_master/money.svg"
    alt="Money"
    width={size}
    height={size}
    className={className}
    style={{ filter: 'brightness(0) invert(1)' }}
  />
);

interface Notification {
  id: string;
  offer_id: string;
  type: 'new_offer' | 'offer_accepted' | 'offer_rejected';
  is_read: boolean;
  created_at: string;
  master_name?: string;
  master_id?: string;
  offer: {
    id: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    description: string;
    location: string;
    preferred_date: string | null;
    status: string;
    created_at: string;
  };
}

interface OfferNotificationsProps {
  isMaster: boolean;
}

export const OfferNotifications: React.FC<OfferNotificationsProps> = ({ isMaster }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Notification['offer'] | null>(null);

  useEffect(() => {
    if (!user) return;

    loadNotifications();

    const channel = supabase
      .channel('offer_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'offer_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('offer_notifications')
        .select(`
          *,
          offer:client_offers (
            id,
            client_name,
            client_email,
            client_phone,
            description,
            location,
            preferred_date,
            status,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data) {
        setNotifications(data as any);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('offer_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('offer_notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;

      loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleUpdateStatus = async (offerId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('client_offers')
        .update({ status })
        .eq('id', offerId);

      if (error) throw error;

      alert(status === 'accepted' ? 'Ponuka bola prijatá!' : 'Ponuka bola zamietnutá');
      setSelectedOffer(null);
      loadNotifications();
    } catch (error) {
      console.error('Error updating offer status:', error);
      alert('Chyba pri aktualizácii stavu ponuky');
    }
  };

  const handlePrint = () => {
    if (!selectedOffer) return;
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!selectedOffer) return;
    alert('Funkcia sťahovania PDF bude dostupná v nasledujúcej verzii');
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    if (isMaster && notification.type === 'new_offer' && notification.offer) {
      setSelectedOffer(notification.offer);
      setIsOpen(false);
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'new_offer':
        return `Nová ponuka od ${notification.offer.client_name}`;
      case 'offer_accepted':
        return 'prijal vašu ponuku!';
      case 'offer_rejected':
        return 'zamietol vašu ponuku';
      default:
        return 'Nové upozornenie';
    }
  };

  const handleMasterNameClick = (masterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${masterId}`);
    setIsOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">Čaká na odpoveď</span>;
      case 'accepted':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">Prijatá</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">Zamietnutá</span>;
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-white hover:text-white/80 transition-colors"
        >
          {isMaster ? <CircleEuroIcon size={32} /> : <Bell size={28} />}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications Panel - Using Portal to render outside of Header */}
      {isOpen && createPortal(
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 flex items-start justify-center md:pt-20 max-md:pt-0"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="fixed left-1/2 -translate-x-1/2 top-20 w-[600px] max-md:inset-0 max-md:w-full max-md:top-0 max-md:left-0 max-md:translate-x-0 bg-white rounded-xl max-md:rounded-none shadow-2xl border border-gray-200 z-50 max-h-[80vh] max-md:max-h-full overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="px-6 py-4 max-md:px-4 max-md:py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#4169e1] to-[#5a7bff]">
                <h3 className="font-bold text-white text-xl max-md:text-lg">
                  {isMaster ? 'Ponuky od klientov' : 'Upozornenia'}
                </h3>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm max-md:text-sm text-white/90 hover:text-white hover:underline font-medium"
                    >
                      Označiť všetko
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/90 hover:text-white transition-colors"
                  >
                    <X size={22} className="max-md:w-6 max-md:h-6" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 bg-gray-50">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <div className="mb-4">
                      {isMaster ? <CircleEuroIcon size={80} className="mx-auto text-gray-300" /> : <Bell size={72} className="mx-auto text-gray-300" />}
                    </div>
                    <p className="text-lg font-medium">Žiadne upozornenia</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 rounded-lg cursor-pointer hover:shadow-md transition-all bg-white border ${
                          !notification.is_read ? 'border-[#4169e1] shadow-sm' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            notification.type === 'new_offer' ? 'bg-blue-100 text-blue-600' :
                            notification.type === 'offer_accepted' ? 'bg-green-100 text-green-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {isMaster ? <CircleEuroIcon size={24} /> : <Bell size={20} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notification.is_read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                              {!isMaster && notification.master_name && notification.master_id ? (
                                <>
                                  Majster{' '}
                                  <button
                                    onClick={(e) => handleMasterNameClick(notification.master_id!, e)}
                                    className="text-[#4169e1] hover:text-[#3557c5] hover:underline font-semibold"
                                  >
                                    {notification.master_name}
                                  </button>
                                  {' '}{getNotificationText(notification)}
                                </>
                              ) : (
                                getNotificationText(notification)
                              )}
                            </p>
                            {notification.offer && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {notification.offer.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.created_at).toLocaleString('sk-SK')}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-[#4169e1] rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isMaster && notifications.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-white">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/dashboard?tab=ponuky');
                    }}
                    className="block w-full text-center px-6 py-3 bg-[#4169e1] hover:bg-[#3557c5] text-white rounded-lg font-medium transition-colors"
                  >
                    Zobraziť všetky ponuky
                  </button>
                </div>
              )}
            </div>
        </>,
        document.body
      )}

      {/* Offer Detail Modal - Using Portal to render outside of Header */}
      {selectedOffer && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 max-md:p-0 overflow-y-auto">
          <div className="bg-white rounded-lg max-md:rounded-none max-w-3xl w-full my-8 max-md:my-0 max-md:min-h-screen shadow-2xl relative">
            <div className="bg-white border-b px-6 py-4 max-md:px-4 max-md:py-5 flex items-center justify-between print:hidden rounded-t-lg max-md:rounded-none">
              <h2 className="text-2xl max-md:text-xl font-bold text-gray-900">Detail ponuky</h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 max-md:p-1.5 text-gray-600 hover:text-[#4169e1] transition-colors"
                  title="Vytlačiť"
                >
                  <Printer size={20} className="max-md:w-5 max-md:h-5" />
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="p-2 max-md:p-1.5 text-gray-600 hover:text-[#4169e1] transition-colors"
                  title="Stiahnuť PDF"
                >
                  <Download size={20} className="max-md:w-5 max-md:h-5" />
                </button>
                <button
                  onClick={() => setSelectedOffer(null)}
                  className="p-2 max-md:p-1.5 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X size={20} className="max-md:w-5 max-md:h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-md:p-4 print:p-8 max-h-[calc(90vh-8rem)] max-md:max-h-none overflow-y-auto">
              <div className="mb-6">
                <div className="flex flex-col max-md:gap-2 md:flex-row md:items-center md:justify-between mb-4">
                  <h3 className="text-xl max-md:text-lg font-bold text-gray-900">Informácie o klientovi</h3>
                  {getStatusBadge(selectedOffer.status)}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User size={20} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 break-words">{selectedOffer.client_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-gray-400 flex-shrink-0" />
                    <a href={`mailto:${selectedOffer.client_email}`} className="text-[#4169e1] hover:underline break-all">
                      {selectedOffer.client_email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={20} className="text-gray-400 flex-shrink-0" />
                    <a href={`tel:${selectedOffer.client_phone}`} className="text-[#4169e1] hover:underline">
                      {selectedOffer.client_phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 break-words">{selectedOffer.location}</span>
                  </div>
                  {selectedOffer.preferred_date && (
                    <div className="flex items-center gap-3">
                      <Calendar size={20} className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-900 break-words">
                        {new Date(selectedOffer.preferred_date).toLocaleDateString('sk-SK', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl max-md:text-lg font-bold text-gray-900 mb-3">Popis práce</h3>
                <p className="text-gray-700 whitespace-pre-wrap break-words">{selectedOffer.description}</p>
              </div>

              <div className="pt-4 border-t text-sm text-gray-500">
                <p>Ponuka odoslaná: {new Date(selectedOffer.created_at).toLocaleString('sk-SK')}</p>
              </div>

              {selectedOffer.status === 'pending' && (
                <div className="flex flex-col max-md:gap-3 md:flex-row md:gap-4 mt-6 print:hidden">
                  <button
                    onClick={() => handleUpdateStatus(selectedOffer.id, 'rejected')}
                    className="flex-1 px-6 py-3 max-md:py-4 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle size={20} />
                    Odmietnuť
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedOffer.id, 'accepted')}
                    className="flex-1 px-6 py-3 max-md:py-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Prijať ponuku
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
