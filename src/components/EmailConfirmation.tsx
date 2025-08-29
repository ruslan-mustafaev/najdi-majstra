import React, { useEffect, useState } from 'react';
import { CheckCircle, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { supabase } from '../lib/supabase';

interface EmailConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginRequired: () => void;
  email: string;
}

export const EmailConfirmation: React.FC<EmailConfirmationProps> = ({
  isOpen,
  onClose,
  onLoginRequired,
  email
}) => {
  const { language } = useLanguage();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Listen for auth state changes to detect email confirmation
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          setIsConfirmed(true);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [isOpen]);

  const handleCheckConfirmation = async () => {
    setIsChecking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        setIsConfirmed(true);
      } else {
        // Show message that email is not confirmed yet
        alert(language === 'sk' ? 'Email ešte nebol potvrdený. Skontrolujte svoju emailovú schránku.' : 'Email not confirmed yet. Please check your email inbox.');
      }
    } catch (error) {
      console.error('Error checking confirmation:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleProceedToLogin = () => {
    onClose();
    onLoginRequired();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-8 text-center">
          {!isConfirmed ? (
            <>
              {/* Email Sent Icon */}
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="text-blue-600" size={40} />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {language === 'sk' ? 'Potvrďte svoj email' : 'Confirm your email'}
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                {language === 'sk' 
                  ? `Poslali sme potvrdzovaciu správu na adresu ${email}. Kliknite na odkaz v emaili pre potvrdenie vášho účtu.`
                  : `We sent a confirmation message to ${email}. Click the link in the email to confirm your account.`
                }
              </p>

              {/* Instructions */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {language === 'sk' ? 'Čo robiť ďalej:' : 'What to do next:'}
                </h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. {language === 'sk' ? 'Otvorte svoju emailovú schránku' : 'Open your email inbox'}</li>
                  <li>2. {language === 'sk' ? 'Nájdite email od najdiMajstra.sk' : 'Find email from najdiMajstra.sk'}</li>
                  <li>3. {language === 'sk' ? 'Kliknite na potvrdzovaciu linku' : 'Click the confirmation link'}</li>
                  <li>4. {language === 'sk' ? 'Vráťte sa sem a prihláste sa' : 'Come back here and sign in'}</li>
                </ol>
              </div>

              {/* Check Confirmation Button */}
              <button
                onClick={handleCheckConfirmation}
                disabled={isChecking}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center space-x-2"
              >
                {isChecking ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>{language === 'sk' ? 'Kontrolujem...' : 'Checking...'}</span>
                  </>
                ) : (
                  <span>{language === 'sk' ? 'Skontrolovať potvrdenie' : 'Check confirmation'}</span>
                )}
              </button>

              {/* Resend Email */}
              <button
                onClick={() => {
                  // Resend confirmation email logic could be added here
                  alert(language === 'sk' ? 'Funkcia bude dostupná čoskoro' : 'Feature coming soon');
                }}
                className="text-blue-600 hover:underline text-sm"
              >
                {language === 'sk' ? 'Poslať email znovu' : 'Resend email'}
              </button>
            </>
          ) : (
            <>
              {/* Success Icon */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-600" size={40} />
              </div>

              {/* Success Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {language === 'sk' ? 'Email potvrdený!' : 'Email confirmed!'}
              </h2>

              {/* Success Description */}
              <p className="text-gray-600 mb-6">
                {language === 'sk' 
                  ? 'Váš email bol úspešne potvrdený. Teraz sa môžete prihlásiť do svojho účtu.'
                  : 'Your email has been successfully confirmed. You can now sign in to your account.'
                }
              </p>

              {/* Proceed to Login Button */}
              <button
                onClick={handleProceedToLogin}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
              >
                <span>{language === 'sk' ? 'Prihlásiť sa' : 'Sign In'}</span>
                <ArrowRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};