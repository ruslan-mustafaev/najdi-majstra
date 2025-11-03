import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface OfferFormProps {
  masterId: string;
  masterName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const OfferForm: React.FC<OfferFormProps> = ({ masterId, masterName, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: user?.email || '',
    clientPhone: '',
    location: '',
    preferredDate: '',
    description: '',
  });

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Meno je povinné';
    } else if (formData.clientName.trim().length < 2) {
      newErrors.clientName = 'Meno musí mať aspoň 2 znaky';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'Email je povinný';
    } else if (!emailRegex.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Neplatný formát emailu';
    }

    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = 'Telefón je povinný';
    } else if (!phoneRegex.test(formData.clientPhone.replace(/\s/g, ''))) {
      newErrors.clientPhone = 'Neplatný formát telefónu (napr. +421 XXX XXX XXX)';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Lokalita je povinná';
    } else if (formData.location.trim().length < 3) {
      newErrors.location = 'Lokalita musí mať aspoň 3 znaky';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Popis práce je povinný';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Popis práce musí mať aspoň 10 znakov';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('client_offers')
        .insert({
          master_id: masterId,
          client_user_id: user?.id || null,
          client_name: formData.clientName,
          client_email: formData.clientEmail,
          client_phone: formData.clientPhone,
          location: formData.location,
          preferred_date: formData.preferredDate || null,
          description: formData.description,
          status: 'pending',
        });

      if (error) throw error;

      alert('Ponuka bola úspešne odoslaná!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error sending offer:', error);
      alert('Chyba pri odosielaní ponuky. Skúste to prosím znova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Poslať ponuku pre {masterName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meno a priezvisko *
            </label>
            <input
              type="text"
              required
              value={formData.clientName}
              onChange={(e) => {
                setFormData({ ...formData, clientName: e.target.value });
                if (errors.clientName) setErrors({ ...errors, clientName: '' });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent ${
                errors.clientName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Vaše meno a priezvisko"
            />
            {errors.clientName && (
              <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.clientEmail}
                onChange={(e) => {
                  setFormData({ ...formData, clientEmail: e.target.value });
                  if (errors.clientEmail) setErrors({ ...errors, clientEmail: '' });
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent ${
                  errors.clientEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="vas@email.com"
              />
              {errors.clientEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.clientEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefón *
              </label>
              <input
                type="tel"
                required
                value={formData.clientPhone}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^[+]?[0-9\s-()]*$/.test(value)) {
                    setFormData({ ...formData, clientPhone: value });
                    if (errors.clientPhone) setErrors({ ...errors, clientPhone: '' });
                  }
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent ${
                  errors.clientPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+421 XXX XXX XXX"
              />
              {errors.clientPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.clientPhone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lokalita práce *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => {
                  setFormData({ ...formData, location: e.target.value });
                  if (errors.location) setErrors({ ...errors, location: '' });
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Mesto, adresa"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferovaný dátum
              </label>
              <input
                type="date"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Popis práce *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              rows={6}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Popíšte čo potrebujete, detaily projektu, požiadavky atď."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-[#4169e1] text-white rounded-lg font-medium hover:bg-[#3557c5] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
              {isSubmitting ? 'Odosielam...' : 'Odoslať ponuku'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
