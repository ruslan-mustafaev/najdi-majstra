import React, { useState, useEffect } from 'react';
import { Coins, Bell, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface Notification {
  id: string;
  offer_id: string;
  type: 'new_offer' | 'offer_accepted' | 'offer_rejected';
  is_read: boolean;
  created_at: string;
  offer: {
    client_name: string;
    description: string;
    location: string;
    status: string;
  };
}

interface OfferNotificationsProps {
  isMaster: boolean;
}

export const OfferNotifications: React.FC<OfferNotificationsProps> = ({ isMaster }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

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
            client_name,
            description,
            location,
            status
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

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'new_offer':
        return `Nová ponuka od ${notification.offer.client_name}`;
      case 'offer_accepted':
        return 'Vaša ponuka bola prijatá!';
      case 'offer_rejected':
        return 'Vaša ponuka bola zamietnutá';
      default:
        return 'Nové upozornenie';
    }
  };

  const getNotificationColor = (notification: Notification) => {
    switch (notification.type) {
      case 'new_offer':
        return 'bg-blue-50 border-blue-200';
      case 'offer_accepted':
        return 'bg-green-50 border-green-200';
      case 'offer_rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-[#4169e1] transition-colors"
      >
        {isMaster ? <Coins size={24} /> : <Bell size={24} />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                {isMaster ? 'Ponuky od klientov' : 'Upozornenia'}
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#4169e1] hover:underline"
                  >
                    Označiť všetko
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="mb-2">
                    {isMaster ? <Coins size={48} className="mx-auto text-gray-300" /> : <Bell size={48} className="mx-auto text-gray-300" />}
                  </div>
                  <p>Žiadne upozornenia</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id);
                        }
                      }}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'new_offer' ? 'bg-blue-100 text-blue-600' :
                          notification.type === 'offer_accepted' ? 'bg-green-100 text-green-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {isMaster ? <Coins size={16} /> : <Bell size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notification.is_read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                            {getNotificationText(notification)}
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
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <a
                  href="/dashboard?tab=offers"
                  className="text-sm text-[#4169e1] hover:underline font-medium block text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Zobraziť všetky ponuky
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
