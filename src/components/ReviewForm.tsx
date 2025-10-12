import React, { useState, useEffect } from 'react';
import { Star, X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface ReviewFormProps {
  masterId: string;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ masterId, onClose, onReviewSubmitted }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [canReview, setCanReview] = useState(true);
  const [existingReview, setExistingReview] = useState<any>(null);

  useEffect(() => {
    checkReviewEligibility();
  }, [masterId, user]);

  const checkReviewEligibility = async () => {
    if (!user) {
      setCanReview(false);
      setError('Musíte byť prihlásený ako klient, aby ste mohli zanechať recenziu');
      return;
    }

    try {
      const { data: reviews, error: reviewError } = await supabase
        .from('master_reviews')
        .select('*')
        .eq('master_id', masterId)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (reviewError) throw reviewError;

      if (reviews) {
        const reviewDate = new Date(reviews.created_at);
        const now = new Date();
        const daysSinceReview = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceReview < 30) {
          setCanReview(false);
          setError(`Môžete zanechať ďalšiu recenziu za ${30 - daysSinceReview} dní`);
          setExistingReview(reviews);
        } else {
          setExistingReview(reviews);
        }
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Musíte byť prihlásený');
      return;
    }

    if (rating === 0) {
      setError('Prosím, vyberte hodnotenie');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Komentár musí mať aspoň 10 znakov');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Получаем имя и фамилию клиента из метаданных
      const clientName = user.user_metadata?.full_name ||
                        user.user_metadata?.name ||
                        user.email?.split('@')[0] ||
                        'Клиент';

      const { error: insertError } = await supabase
        .from('master_reviews')
        .insert({
          master_id: masterId,
          client_id: user.id,
          rating,
          comment: comment.trim(),
          client_name: clientName,
        });

      if (insertError) {
        if (insertError.message.includes('already exists') || insertError.message.includes('30 days')) {
          throw new Error('Už ste zanechali recenziu v posledných 30 dňoch');
        }
        throw insertError;
      }

      onReviewSubmitted();
      onClose();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      setError(error.message || 'Chyba pri odosielaní recenzie');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Zanechať recenziu</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-4 rounded-lg">
            <AlertCircle size={20} />
            <p>Musíte byť prihlásený ako klient, aby ste mohli zanechať recenziu</p>
          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Zatvoriť
          </button>
        </div>
      </div>
    );
  }

  if (!canReview && !existingReview) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Zanechať recenziu</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-4 rounded-lg">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Zatvoriť
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-md w-full my-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Zanechať recenziu</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          {existingReview && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <p>Už ste zanechali recenziu. {canReview ? 'Môžete zanechať novú recenziu.' : error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hodnotenie
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={`transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Váš komentár
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                placeholder="Popíšte svoju skúsenosť s týmto majstrom..."
                required
                minLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimálne 10 znakov ({comment.length}/10)
              </p>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle size={20} />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Zrušiť
              </button>
              <button
                type="submit"
                disabled={submitting || rating === 0 || comment.trim().length < 10}
                className="flex-1 bg-[#4169e1] text-white px-4 py-2 rounded-lg hover:bg-[#3155c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Odosielam...' : 'Odoslať recenziu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
