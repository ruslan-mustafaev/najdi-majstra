import React, { useState } from 'react';
import { X, Users, Search, Cookie, Handshake } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../data/translations';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUserTypeSelect: (type: 'client' | 'master') => void;
}

export const WelcomePopup: React.FC<WelcomePopupProps> = ({ isOpen, onClose, onUserTypeSelect }) => {
  const { language } = useLanguage();
  const t = translations[language];
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [showCookiePolicy, setShowCookiePolicy] = useState(false);

  if (!isOpen) return null;

  const handleOptionSelect = (option: 'master' | 'client') => {
    if (cookiesAccepted) {
      localStorage.setItem('welcomePopupShown', 'true');
      if (option === 'master') {
        onUserTypeSelect(option);
      } else {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center sm:items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: linear-gradient(45deg, #e3f2fd, #ffffff, #bbdefb);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #4169e1, #6495ed, #87ceeb, #4169e1);
          background-size: 400% 400%;
          border-radius: 10px;
          border: 2px solid #ffffff;
          animation: gradient-shift 3s ease infinite;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #3357d4, #5a7fe8, #76c7e9, #3357d4);
          background-size: 400% 400%;
          animation: gradient-shift 1.5s ease infinite;
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: linear-gradient(45deg, #e3f2fd, #ffffff);
        }
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
      <div className="bg-white rounded-l-xl rounded-r-3xl sm:rounded-2xl w-full max-w-sm sm:max-w-2xl mx-auto relative animate-in zoom-in-95 duration-300 shadow-2xl my-12 sm:my-8 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <div className="p-4 sm:p-8">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-8">
            <h2 className="text-lg sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
              {t.popup.title}
            </h2>
            <p className="text-gray-600 text-xs sm:text-base leading-relaxed flex items-center justify-center gap-2">
              Pre tých ktorý sa chcú dohodnúť
              <Handshake className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </p>
          </div>

          {/* Mobile Layout */}
          <div className="sm:hidden space-y-3 mb-4">
            {/* Client Option - Mobile */}
            <div className="border-2 border-gray-200 rounded-l-lg rounded-r-2xl sm:rounded-lg p-4 hover:border-[#4169e1] transition-all duration-200 cursor-pointer group bg-gradient-to-br from-white to-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#4169e1] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Search className="text-white" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold mb-1 text-gray-900">
                    {t.popup.clientOption.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-snug">
                    {t.popup.clientOption.description || 'Hľadáte odborníka pre vašu prácu'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleOptionSelect('client')}
                disabled={!cookiesAccepted}
                className="w-full mt-4 bg-green-500 text-white py-3.5 px-4 rounded-l-lg rounded-r-2xl font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm shadow-lg hover:shadow-xl min-h-[56px] flex items-center justify-center"
              >
                {t.popup.clientOption.button}
              </button>
            </div>

            {/* Master Option - Mobile */}
            <div className="border-2 border-gray-200 rounded-l-lg rounded-r-2xl sm:rounded-lg p-4 hover:border-[#4169e1] transition-all duration-200 cursor-pointer group bg-gradient-to-br from-white to-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#4169e1] rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Users className="text-white" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold mb-1 text-gray-900">
                    {t.popup.masterOption.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-snug">
                    {t.popup.masterOption.description || 'Ponúkate svoje služby klientom'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleOptionSelect('master')}
                disabled={!cookiesAccepted}
                className="w-full mt-4 bg-green-500 text-white py-3.5 px-4 rounded-l-lg rounded-r-2xl font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm shadow-lg hover:shadow-xl min-h-[56px] flex items-center justify-center"
              >
                {t.popup.masterOption.button}
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:grid grid-cols-2 gap-6 mb-8">
            {/* Client Option - Desktop */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#4169e1] transition-all duration-200 cursor-pointer group bg-gradient-to-br from-white to-gray-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#4169e1] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Search className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {t.popup.clientOption.title}
                </h3>
                <p className="text-gray-600 mb-4 text-base">
                  {t.popup.clientOption.description || 'Hľadáte odborníka pre vašu prácu'}
                </p>
                <button
                  onClick={() => handleOptionSelect('client')}
                  disabled={!cookiesAccepted}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-base shadow-md hover:shadow-lg min-h-[56px] flex items-center justify-center"
                >
                  {t.popup.clientOption.button}
                </button>
              </div>
            </div>

            {/* Master Option - Desktop */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-[#4169e1] transition-all duration-200 cursor-pointer group bg-gradient-to-br from-white to-gray-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#4169e1] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {t.popup.masterOption.title}
                </h3>
                <p className="text-gray-600 mb-4 text-base">
                  {t.popup.masterOption.description || 'Ponúkate svoje služby klientom'}
                </p>
                <button
                  onClick={() => handleOptionSelect('master')}
                  disabled={!cookiesAccepted}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-base shadow-md hover:shadow-lg min-h-[56px] flex items-center justify-center"
                >
                  {t.popup.masterOption.button}
                </button>
              </div>
            </div>
          </div>

          {/* Promotional Banner */}
          <div className="text-center mb-4 sm:mb-6">
            <p className="text-gray-600 text-xs sm:text-base leading-relaxed">
              <strong className="text-blue-600">Nikde</strong> lepšieho majstra nenájdete, registrácia zdarma pre majstrov.
            </p>
          </div>

          {/* Cookies Consent */}
          <div className="border-t pt-3 sm:pt-6 bg-white">
            <div className="flex items-start space-x-3 sm:space-x-3">
              <input
                type="checkbox"
                id="cookies"
                checked={cookiesAccepted}
                onChange={(e) => setCookiesAccepted(e.target.checked)}
                className="mt-0.5 w-5 h-5 sm:w-5 sm:h-5 text-[#4169e1] rounded focus:ring-[#4169e1] flex-shrink-0"
              />
              <label htmlFor="cookies" className="flex-1 text-sm sm:text-sm text-gray-600 cursor-pointer">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                  <Cookie size={14} className="sm:w-4 sm:h-4" />
                  <span className="font-medium">{t.popup.cookies}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowCookiePolicy(true);
                  }}
                  className="text-[#4169e1] hover:underline text-left"
                >
                  Zásady používania súborov cookies a ochrana osobných údajov
                </button>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Policy Modal */}
      {showCookiePolicy && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                Zásady používania súborov cookies a ochrana osobných údajov
              </h3>
              <button
                onClick={() => setShowCookiePolicy(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6 text-gray-700 leading-relaxed">
              {/* Introduction */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">1. Úvod</h4>
                <p className="mb-2">
                  Platforma najdimajstra.sk (ďalej len „Platforma") rešpektuje vaše súkromie a zaväzuje sa chrániť
                  vaše osobné údaje v súlade s nariadením GDPR (General Data Protection Regulation - Všeobecné
                  nariadenie o ochrane údajov) a príslušnými zákonmi Slovenskej republiky.
                </p>
              </div>

              {/* What are cookies */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">2. Čo jsou súbory cookies?</h4>
                <p className="mb-2">
                  Cookies sú malé textové súbory, ktoré sa ukladajú do vášho zariadenia (počítač, tablet,
                  smartfón) pri návšteve našej Platformy. Umožňujú nám rozpoznať vaše zariadenie a zapamätať
                  si informácie o vašej návšteve, čo zlepšuje váš používateľský zážitok.
                </p>
              </div>

              {/* Types of cookies we use */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">3. Aké cookies používame?</h4>
                <div className="space-y-3">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <h5 className="font-semibold text-gray-900 mb-1">Nevyhnutné cookies</h5>
                    <p className="text-sm">
                      Tieto cookies sú potrebné pre správne fungovanie Platformy. Umožňujú základné funkcie
                      ako prihlásenie, navigáciu a prístup k zabezpečeným častiam webu.
                    </p>
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <h5 className="font-semibold text-gray-900 mb-1">Funkčné cookies</h5>
                    <p className="text-sm">
                      Umožňujú nám zapamätať si vaše preferencie (napr. jazyk, región) a poskytovať vám
                      personalizované funkcie.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <h5 className="font-semibold text-gray-900 mb-1">Analytické cookies</h5>
                    <p className="text-sm">
                      Pomáhajú nám pochopiť, ako návštevníci používajú našu Platformu, aby sme mohli zlepšiť
                      jej funkčnosť a výkon. Zhromažďujeme anonymné štatistické údaje.
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal data we collect */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">4. Aké osobné údaje zhromažďujeme?</h4>
                <p className="mb-2">Pri registrácii a používaní Platformy môžeme zhromažďovať:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Meno a priezvisko</li>
                  <li>E-mailovú adresu</li>
                  <li>Telefónne číslo</li>
                  <li>Informácie o vašej profesii (pre majstrov)</li>
                  <li>Lokalitu pôsobenia</li>
                  <li>Fotografiu profilu a fotografie prác (pre majstrov)</li>
                  <li>Informácie o komunikácii prostredníctvom Platformy</li>
                </ul>
              </div>

              {/* Why we collect data */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">5. Prečo zhromažďujeme údaje?</h4>
                <p className="mb-2">Vaše osobné údaje používame na:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Vytvorenie a správu vášho účtu</li>
                  <li>Poskytovanie služieb Platformy (spojenie majstrov a klientov)</li>
                  <li>Spracovanie požiadaviek a ponúk</li>
                  <li>Komunikáciu s vami (notifikácie, aktualizácie)</li>
                  <li>Zlepšenie našich služieb a používateľského zážitku</li>
                  <li>Splnenie zákonných povinností</li>
                  <li>Spracovanie platieb za prémiové služby</li>
                </ul>
              </div>

              {/* Your rights */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">6. Vaše práva podľa GDPR</h4>
                <p className="mb-2">Máte právo:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Právo na prístup</strong> - získať informácie o spracovaní vašich údajov</li>
                  <li><strong>Právo na opravu</strong> - opraviť nesprávne alebo neúplné údaje</li>
                  <li><strong>Právo na vymazanie</strong> - požiadať o vymazanie vašich údajov</li>
                  <li><strong>Právo na obmedzenie</strong> - obmedziť spracovanie vašich údajov</li>
                  <li><strong>Právo na prenosnosť</strong> - získať vaše údaje v štruktúrovanom formáte</li>
                  <li><strong>Právo namietať</strong> - namietať proti spracovaniu vašich údajov</li>
                  <li><strong>Právo odvolať súhlas</strong> - kedykoľvek odvolať váš súhlas so spracovaním</li>
                </ul>
              </div>

              {/* Data security */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">7. Bezpečnosť údajov</h4>
                <p className="mb-2">
                  Implementovali sme primerané technické a organizačné opatrenia na ochranu vašich osobných
                  údajov pred neoprávneným prístupom, zmenou, zverejnením alebo zničením. Vaše údaje sú
                  uložené na zabezpečených serveroch a prístup k nim majú len oprávnené osoby.
                </p>
              </div>

              {/* Data retention */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">8. Ako dlho uchovávame údaje?</h4>
                <p className="mb-2">
                  Vaše osobné údaje uchovávame len tak dlho, ako je to potrebné na účely, na ktoré boli
                  zhromaždené, alebo tak dlho, ako to vyžadujú právne predpisy. Po ukončení účtu môžete
                  požiadať o vymazanie vašich údajov.
                </p>
              </div>

              {/* Third parties */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">9. Zdieľanie údajov s tretími stranami</h4>
                <p className="mb-2">
                  Vaše osobné údaje nezdieľame s tretími stranami na marketingové účely. Údaje môžu byť
                  zdieľané len s poskytovateľmi služieb, ktorí nám pomáhajú prevádzkovať Platformu
                  (napr. hosting, platobné brány), a to výhradne v rozsahu potrebnom pre poskytovanie služieb.
                </p>
              </div>

              {/* Cookie management */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">10. Správa cookies</h4>
                <p className="mb-2">
                  Môžete nastaviť svoj prehliadač tak, aby blokoval alebo upozorňoval na cookies. Majte však
                  na pamäti, že niektoré funkcie Platformy nemusia fungovať správne bez cookies.
                </p>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">11. Kontakt</h4>
                <p className="mb-2">
                  Ak máte akékoľvek otázky týkajúce sa ochrany osobných údajov alebo chcete uplatniť svoje
                  práva, kontaktujte nás na:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">Najdi-majstra.sk</p>
                  <p>Email: podpora@najdimajstra.sk</p>
                </div>
              </div>

              {/* Updates */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">12. Aktualizácie</h4>
                <p className="mb-2">
                  Tieto zásady môžeme príležitostne aktualizovať. O významných zmenách vás budeme informovať
                  prostredníctvom Platformy alebo e-mailom.
                </p>
                <p className="text-sm text-gray-600 mt-3">
                  Posledná aktualizácia: November 2025
                </p>
              </div>

              {/* Accept button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowCookiePolicy(false)}
                  className="w-full bg-[#4169e1] text-white py-3 rounded-lg font-semibold hover:bg-[#3558d4] transition-colors"
                >
                  Rozumiem a súhlasím
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
