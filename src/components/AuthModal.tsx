import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  userType?: 'client' | 'master';
  onAuthSuccess?: (userType: 'client' | 'master') => void;
  onRegistrationSuccess?: (email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  userType,
  onAuthSuccess,
  onRegistrationSuccess
}) => {
  const { signIn, signUp } = useAuth();
  const { language } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    userType: userType || 'client' as 'client' | 'master'
  });

  // Update userType when prop changes
  useEffect(() => {
    if (userType) {
      setFormData(prev => ({ ...prev, userType }));
    }
  }, [userType]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccess(null);
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        location: '',
        userType: userType || 'client'
      });
    }
  }, [isOpen, initialMode, userType]);
  
  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError(language === 'sk' ? 'Email a heslo sú povinné' : 'Email and password are required');
      return false;
    }

    if (mode === 'register') {
      if (!formData.firstName || !formData.lastName) {
        setError(language === 'sk' ? 'Meno a priezvisko sú povinné' : 'First name and last name are required');
        return false;
      }
      if (!formData.userType || (formData.userType !== 'client' && formData.userType !== 'master')) {
        setError(language === 'sk' ? 'Vyberte typ účtu' : 'Please select account type');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError(language === 'sk' ? 'Heslá sa nezhodujú' : 'Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError(language === 'sk' ? 'Heslo musí mať aspoň 6 znakov' : 'Password must be at least 6 characters');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(language === 'sk' ? 'Nesprávny email alebo heslo' : 'Invalid email or password');
        } else {
          setSuccess(language === 'sk' ? 'Úspešne prihlásený!' : 'Successfully logged in!');
          setTimeout(() => {
            onClose();
            if (onAuthSuccess) {
              onAuthSuccess(formData.userType);
            }
          }, 1500);
        }
      } else {
        const userData = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          full_name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          location: formData.location,
          user_type: formData.userType
        };

        const { error } = await signUp(formData.email, formData.password, userData);
        if (error) {
          if (error.message.includes('already registered')) {
            setError(language === 'sk' ? 'Tento email je už registrovaný' : 'This email is already registered');
          } else {
            setError(error.message);
          }
        } else {
          setSuccess(language === 'sk' ? 'Registrácia úspešná! Skontrolujte email pre potvrdenie.' : 'Registration successful! Check your email for confirmation.');
          setTimeout(() => {
            if (onRegistrationSuccess) {
              onRegistrationSuccess(formData.email);
            } else {
              onClose();
            }
          }, 2000);
        }
      }
    } catch (err) {
      setError(language === 'sk' ? 'Nastala chyba. Skúste znovu.' : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
    setSuccess(null);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      location: '',
      userType: userType || 'client'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'login' 
              ? (language === 'sk' ? 'Prihlásenie' : 'Sign In')
              : (language === 'sk' ? 'Registrácia' : 'Sign Up')
            }
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Success Message */}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* User Type Selection (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                {language === 'sk' ? 'Typ účtu *' : 'Account Type *'}
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleInputChange}
                disabled={!!userType} // Disable if userType is provided from props
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none ${
                  !formData.userType && !userType ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
              >
                <option value="client">
                  {language === 'sk' ? 'Klient (hľadám majstra)' : 'Client (looking for master)'}
                </option>
                <option value="master">
                  {language === 'sk' ? 'Majster (ponúkam služby)' : 'Master (offering services)'}
                </option>
              </select>
              {userType && (
                <p className="text-sm text-blue-600 mt-1">
                  {language === 'sk' ? 'Typ účtu bol automaticky nastavený na základe vášho výberu' : 'Account type was automatically set based on your selection'}
                </p>
              )}
              {!userType && (
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'sk' ? 'Vyberte, či hľadáte služby alebo ich ponúkate' : 'Choose whether you are looking for services or offering them'}
                </p>
              )}
            </div>
          )}

          {/* First Name (Register only) */}
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  {language === 'sk' ? 'Meno *' : 'First Name *'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                    placeholder={language === 'sk' ? 'Vaše meno' : 'Your first name'}
                    required={mode === 'register'}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  {language === 'sk' ? 'Priezvisko *' : 'Last Name *'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                    placeholder={language === 'sk' ? 'Vaše priezvisko' : 'Your last name'}
                    required={mode === 'register'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                placeholder="vas@email.sk"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              {language === 'sk' ? 'Heslo *' : 'Password *'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                placeholder={language === 'sk' ? 'Vaše heslo' : 'Your password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {mode === 'register' && (
              <p className="text-xs text-gray-500 mt-1">
                {language === 'sk' ? 'Minimálne 6 znakov' : 'Minimum 6 characters'}
              </p>
            )}
          </div>

          {/* Confirm Password (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                {language === 'sk' ? 'Potvrdiť heslo *' : 'Confirm Password *'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                  placeholder={language === 'sk' ? 'Zopakujte heslo' : 'Repeat password'}
                  required={mode === 'register'}
                />
              </div>
            </div>
          )}

          {/* Phone (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                {language === 'sk' ? 'Telefón' : 'Phone'}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                  placeholder="+421 9xx xxx xxx"
                />
              </div>
            </div>
          )}

          {/* Location (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                {language === 'sk' ? 'Mesto' : 'City'}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none"
                  placeholder={language === 'sk' ? 'Vaše mesto' : 'Your city'}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4169e1] text-white py-3 rounded-lg font-medium hover:bg-[#3558d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading 
              ? (language === 'sk' ? 'Spracováva sa...' : 'Processing...')
              : mode === 'login' 
                ? (language === 'sk' ? 'Prihlásiť sa' : 'Sign In')
                : (language === 'sk' ? 'Registrovať sa' : 'Sign Up')
            }
          </button>

          {/* Switch Mode */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              {mode === 'login' 
                ? (language === 'sk' ? 'Nemáte účet?' : "Don't have an account?")
                : (language === 'sk' ? 'Už máte účet?' : 'Already have an account?')
              }
              <button
                type="button"
                onClick={switchMode}
                className="ml-2 text-[#4169e1] hover:underline font-medium"
              >
                {mode === 'login' 
                  ? (language === 'sk' ? 'Registrovať sa' : 'Sign Up')
                  : (language === 'sk' ? 'Prihlásiť sa' : 'Sign In')
                }
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};