import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Clock, CheckCircle, XCircle, FileText, MapPin, Calendar, User } from 'lucide-react';

interface Offer {
  id: string;
  master_id: string;
  master_name?: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  location: string;
  preferred_date: string | null;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  master_response_at: string | null;
}

export const ClientOffers: React.FC = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    if (user) {
      loadOffers();
    }
  }, [user]);

  const loadOffers = async () => {
    try {
      setIsLoading(true);

      // Сначала загружаем предложения
      const { data: offersData, error: offersError } = await supabase
        .from('client_offers')
        .select('*')
        .eq('client_user_id', user?.id)
        .order('created_at', { ascending: false });

      if (offersError) {
        console.error('Error loading offers:', offersError);
        return;
      }

      // Загружаем информацию о мастерах
      const masterIds = [...new Set((offersData || []).map(offer => offer.master_id))];

      const { data: mastersData } = await supabase
        .from('masters')
        .select('id, name')
        .in('id', masterIds);

      const mastersMap = new Map((mastersData || []).map(m => [m.id, m.name]));

      const offersWithMasterNames = (offersData || []).map(offer => ({
        ...offer,
        master_name: mastersMap.get(offer.master_id) || 'Neznámy majster'
      }));

      setOffers(offersWithMasterNames);
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock size={14} className="mr-1" />
            V čakaní
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle size={14} className="mr-1" />
            Prijaté
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle size={14} className="mr-1" />
            Zamietnuté
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const filteredOffers = filter === 'all'
    ? offers
    : offers.filter(offer => offer.status === filter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4169e1]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Moje ponuky</h1>
        <p className="text-gray-600">Prehľad vašich odoslaných ponúk majstrom</p>
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-2 mb-6 border-b">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'all'
              ? 'text-[#4169e1] border-b-2 border-[#4169e1]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Všetky ({offers.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'pending'
              ? 'text-[#4169e1] border-b-2 border-[#4169e1]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          V čakaní ({offers.filter(o => o.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('accepted')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'accepted'
              ? 'text-[#4169e1] border-b-2 border-[#4169e1]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Prijaté ({offers.filter(o => o.status === 'accepted').length})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'rejected'
              ? 'text-[#4169e1] border-b-2 border-[#4169e1]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Zamietnuté ({offers.filter(o => o.status === 'rejected').length})
        </button>
      </div>

      {/* Offers list */}
      {filteredOffers.length === 0 ? (
        <div className="text-center py-12">
          <FileText size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-500 mb-2">
            {filter === 'all'
              ? 'Zatiaľ nemáte žiadne ponuky'
              : `Žiadne ${filter === 'pending' ? 'čakajúce' : filter === 'accepted' ? 'prijaté' : 'zamietnuté'} ponuky`
            }
          </p>
          <p className="text-gray-400">
            Ponuky odoslané majstrom sa zobrazia tu
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <User size={20} className="text-[#4169e1]" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      {offer.master_name}
                    </h3>
                  </div>
                  {getStatusBadge(offer.status)}
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>Odoslané: {formatDate(offer.created_at)}</div>
                  {offer.master_response_at && (
                    <div className="mt-1">
                      Odpoveď: {formatDate(offer.master_response_at)}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Lokalita</div>
                    <div className="text-gray-900">{offer.location}</div>
                  </div>
                </div>

                {offer.preferred_date && (
                  <div className="flex items-start space-x-3">
                    <Calendar size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">Preferovaný termín</div>
                      <div className="text-gray-900">{formatDate(offer.preferred_date)}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <FileText size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 mb-1">Popis práce</div>
                    <div className="text-gray-900 whitespace-pre-wrap">{offer.description}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
