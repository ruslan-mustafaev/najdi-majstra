import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../data/translations';

export const Footer: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const footerLinks = [
    { label: t.footer.terms, href: '#' },
    { label: t.footer.ethics, href: '#' },
    { label: t.footer.recommendations, href: '#' },
    { label: t.footer.legal, href: '#' },
    { label: t.footer.contact, href: '#' },
    { label: t.footer.contracts, href: '#' },
    { label: t.footer.courses, href: '#' }
  ];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-[#4169e1]">
              {t.brand}
            </h3>
            <p className="text-gray-400 mb-4">
              {language === 'sk' 
                ? 'Najlepšia platforma pre hľadanie kvalifikovaných majstrov a expertov na Slovensku.'
                : 'The best platform for finding qualified masters and experts in Slovakia.'
              }
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Instagram
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                LinkedIn
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-lg font-semibold mb-4">
              {language === 'sk' ? 'Odkazy' : 'Links'}
            </h4>
            <ul className="space-y-2">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="max-w-4xl mx-auto mb-6 p-4">
            <p className="text-sm text-gray-400 leading-relaxed text-center">
              {language === 'sk'
                ? 'www.najdimajstra.sk je priestor kde sa stretavajú kvalitný majstri s ponukami na pracovné príležitosti. internetový priestor najdimajstra.sk nezodpovedá za žiadnu komunikáciu klienta s majstrom. Taktiež najdimajstra.sk nijako nezasahuje do dohodnutej odmeny medzi majstrom a klientom vaša dohoda je výlučne medzi vami. Neberieme si žiadne poplatky ani odmenu za vykonaná prácu. Dohoda je vaša 100% čistá odmena. Registrujte sa zdarma a pomôžte vyriešiť zákazníkom ich vzniknuté problémy za vopred dohodnutú odmenu.'
                : 'www.najdimajstra.sk is a space where quality masters meet offers for work opportunities. The online space najdimajstra.sk is not responsible for any communication between client and master. Likewise, najdimajstra.sk does not interfere with the agreed payment between master and client - your agreement is exclusively between you. We do not take any fees or commission for work performed. The agreement is your 100% net payment. Register for free and help solve customers\' problems for a pre-agreed fee.'
              }
            </p>
          </div>
          <p className="text-center text-gray-400">
            &copy; 2025 {t.brand}. {language === 'sk' ? 'Všetky práva vyhradené.' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
};