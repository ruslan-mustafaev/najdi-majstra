import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, User, Mail, Phone, CheckCircle, XCircle, Download, Printer, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Offer {
  id: string;
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

interface OffersListProps {
  masterId: string;
}

export const OffersList: React.FC<OffersListProps> = ({ masterId }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('pending');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOffers();

    const channel = supabase
      .channel('client_offers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_offers',
          filter: `master_id=eq.${masterId}`,
        },
        () => {
          loadOffers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [masterId]);

  const loadOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('client_offers')
        .select('*')
        .eq('master_id', masterId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setOffers(data);
      }
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setIsLoading(false);
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
      loadOffers();
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

  const filteredOffers = offers.filter((offer) => {
    if (filter === 'all') return true;
    return offer.status === filter;
  });

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

  const pendingCount = offers.filter((o) => o.status === 'pending').length;
  const acceptedCount = offers.filter((o) => o.status === 'accepted').length;
  const rejectedCount = offers.filter((o) => o.status === 'rejected').length;

  if (isLoading) {
    return <div className="text-center py-12">Načítavam ponuky...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col max-md:gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl max-md:text-xl font-bold text-gray-900">Ponuky od klientov</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 max-md:px-3 max-md:py-1.5 max-md:text-sm rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#4169e1] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Všetky ({offers.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 max-md:px-3 max-md:py-1.5 max-md:text-sm rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-[#4169e1] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Čakajúce ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-4 py-2 max-md:px-3 max-md:py-1.5 max-md:text-sm rounded-lg font-medium transition-colors ${
              filter === 'accepted'
                ? 'bg-[#4169e1] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Prijaté ({acceptedCount})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 max-md:px-3 max-md:py-1.5 max-md:text-sm rounded-lg font-medium transition-colors ${
              filter === 'rejected'
                ? 'bg-[#4169e1] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Zamietnuté ({rejectedCount})
          </button>
        </div>
      </div>

      {filteredOffers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Clock size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            {filter === 'all' ? 'Zatiaľ nemáte žiadne ponuky' : `Žiadne ${filter === 'pending' ? 'čakajúce' : filter === 'accepted' ? 'prijaté' : 'zamietnuté'} ponuky`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-md:gap-3">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              onClick={() => setSelectedOffer(offer)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#4169e1] rounded-full flex items-center justify-center text-white font-semibold">
                    {offer.client_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{offer.client_name}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(offer.created_at).toLocaleDateString('sk-SK')}
                    </p>
                  </div>
                </div>
                {getStatusBadge(offer.status)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="flex-shrink-0" />
                  <span className="truncate">{offer.location}</span>
                </div>
                {offer.preferred_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="flex-shrink-0" />
                    <span>{new Date(offer.preferred_date).toLocaleDateString('sk-SK')}</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                {offer.description}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOffer(offer);
                }}
                className="w-full px-4 py-2 bg-[#4169e1] text-white rounded-lg font-medium hover:bg-[#3557c5] transition-colors"
              >
                Zobraziť detail
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 max-md:p-0 overflow-y-auto">
          <div className="bg-white rounded-lg max-md:rounded-none max-w-3xl w-full my-8 max-md:my-0 max-md:min-h-screen shadow-2xl">
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
                  <XCircle size={20} className="max-md:w-5 max-md:h-5" />
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
                {selectedOffer.master_response_at && (
                  <p>Odpoveď odoslaná: {new Date(selectedOffer.master_response_at).toLocaleString('sk-SK')}</p>
                )}
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
        </div>
      )}
    </div>
  );
};
