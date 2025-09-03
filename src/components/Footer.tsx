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

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; 2025 {t.brand}. {language === 'sk' ? 'Všetky práva vyhradené.' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
};