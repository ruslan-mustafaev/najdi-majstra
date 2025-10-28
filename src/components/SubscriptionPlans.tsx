import React from 'react';
import { Check, Info, Sparkles } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';

interface PlanFeature {
  id: number;
  name: string;
  infoText?: string;
  zdarma: 'áno' | 'nie';
  basic: 'áno' | 'nie';
  standard: 'áno' | 'nie';
}

export const SubscriptionPlans: React.FC = () => {
  const features: PlanFeature[] = [
    {
      id: 1,
      name: 'Predajný profil',
      infoText: 'Vytvorte si profesionálny profil s vašimi službami',
      zdarma: 'áno',
      basic: 'áno',
      standard: 'áno'
    },
    {
      id: 2,
      name: 'Osobný AI predajca ktorý šetrí váš čas a aktívne predá vaše služby alebo produkty',
      infoText: 'AI asistent automaticky komunikuje s klientmi a uzatvára obchody',
      zdarma: 'nie',
      basic: 'nie',
      standard: 'áno'
    },
    {
      id: 3,
      name: 'Rozvoj podnikania profesionálne on-line kurzy a certifikácie (v príprave)',
      infoText: 'Prístup k vzdelávacím kurzom pre rozvoj vášho biznisu',
      zdarma: 'áno',
      basic: 'áno',
      standard: 'áno'
    },
    {
      id: 4,
      name: 'Benefit webu najdiMajstra.sk: Zvýšenie zisku',
      infoText: 'Špeciálne benefity pre zvýšenie vášho zisku',
      zdarma: 'áno',
      basic: 'áno',
      standard: 'áno'
    },
    {
      id: 5,
      name: 'Osobný plánovač času',
      infoText: 'Pokročilý nástroj na plánovanie vašich zákaziek',
      zdarma: 'nie',
      basic: 'nie',
      standard: 'áno'
    },
    {
      id: 6,
      name: 'Vlastný plánovací kalendár',
      infoText: 'Váš osobný kalendár pre správu termínov',
      zdarma: 'áno',
      basic: 'áno',
      standard: 'áno'
    },
    {
      id: 7,
      name: 'On-line zmluvy (v príprave)',
      infoText: 'Digitálne zmluvy s elektronickým podpisom',
      zdarma: 'áno',
      basic: 'áno',
      standard: 'áno'
    },
    {
      id: 8,
      name: 'Možnosť pridania svojích prác, ktoré ste predajú',
      infoText: 'Pridávajte hotové práce do svojho portfólia',
      zdarma: 'nie',
      basic: 'nie',
      standard: 'nie'
    },
    {
      id: 9,
      name: 'Hodnotenie od klientov',
      infoText: 'Zbierajte recenzie a hodnotenia od zákazníkov',
      zdarma: 'áno',
      basic: 'áno',
      standard: 'áno'
    },
    {
      id: 10,
      name: 'Zvýšenie vašej propagácie',
      infoText: 'Vyššia viditeľnosť vo vyhľadávaní',
      zdarma: 'áno',
      basic: 'áno',
      standard: 'áno'
    },
    {
      id: 11,
      name: 'Propagácia seba a zvýšenie zaujmu o vaše služby a výsledné produkty',
      infoText: 'Aktívna propagácia vášho profilu na platforme',
      zdarma: 'áno',
      basic: 'áno',
      standard: 'áno'
    },
    {
      id: 12,
      name: 'Predaj vlastných služieb',
      infoText: 'Predávajte svoje služby priamo cez platformu',
      zdarma: 'áno',
      basic: 'áno',
      standard: 'áno'
    },
    {
      id: 13,
      name: 'Vaš zisková aplikácia nM (najdiMajstra.sk) v mobile v príprave 2026',
      infoText: 'Mobilná aplikácia pre správu vášho podnikania',
      zdarma: 'áno',
      basic: 'áno',
      standard: 'áno'
    },
    {
      id: 14,
      name: 'Vaša odbornosť: Kurzy a certifikáty',
      infoText: 'Zobrazujte svoje kurzy a certifikáty',
      zdarma: 'áno',
      basic: 'áno',
      standard: 'áno'
    },
    {
      id: 15,
      name: 'Vzdelávanie, Rozvoj, Mentoring, Osobnostný rozvoj, Psychológia predaja, Líderstvo',
      infoText: 'Prémové vzdelávacie programy a mentoring',
      zdarma: 'nie',
      basic: 'nie',
      standard: 'nie'
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl p-8 text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Využite teraz garantovanú dotovanú cenu</h1>
            </div>
            <p className="text-lg opacity-90">Nestratíte pozornosť a zákaziek bude viac.</p>
          </div>

          <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-6 font-semibold text-gray-900 text-lg bg-gray-50">
                      Profil a registrácia
                    </th>
                    <th className="text-center p-6 bg-gray-50">
                      <div className="font-semibold text-gray-600 mb-2">Zdarma</div>
                      <div className="text-3xl font-bold text-blue-600">0€</div>
                    </th>
                    <th className="text-center p-6 bg-gray-50">
                      <div className="font-semibold text-gray-600 mb-2">Basic</div>
                      <div className="text-3xl font-bold text-blue-600">9.9€</div>
                    </th>
                    <th className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 relative">
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        POPULÁRNE
                      </div>
                      <div className="font-semibold text-gray-600 mb-2">Standard</div>
                      <div className="text-3xl font-bold text-red-600">19.9€</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr
                      key={feature.id}
                      className={`border-b border-gray-100 transition-colors hover:bg-blue-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="p-4 text-gray-800">
                        <div className="flex items-start gap-2">
                          <span className="flex-1">{feature.name}</span>
                          {feature.infoText && (
                            <button
                              className="text-blue-500 hover:text-blue-700 flex-shrink-0 mt-1 group relative"
                              title={feature.infoText}
                            >
                              <Info className="w-4 h-4" />
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl z-10">
                                {feature.infoText}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="text-center p-4">
                        {feature.zdarma === 'áno' ? (
                          <div className="flex justify-center">
                            <div className="bg-green-500 rounded-full p-1">
                              <Check className="w-5 h-5 text-white" strokeWidth={3} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">nie</span>
                        )}
                      </td>
                      <td className="text-center p-4">
                        {feature.basic === 'áno' ? (
                          <div className="flex justify-center">
                            <div className="bg-green-500 rounded-full p-1">
                              <Check className="w-5 h-5 text-white" strokeWidth={3} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">nie</span>
                        )}
                      </td>
                      <td className="text-center p-4 bg-gradient-to-br from-orange-50/30 to-red-50/30">
                        {feature.standard === 'áno' ? (
                          <div className="flex justify-center">
                            <div className="bg-green-500 rounded-full p-1">
                              <Check className="w-5 h-5 text-white" strokeWidth={3} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">nie</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td className="p-6 font-semibold text-gray-900">
                      Vyberte váš plán
                    </td>
                    <td className="p-6">
                      <button className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105">
                        Vybrať
                      </button>
                    </td>
                    <td className="p-6">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105">
                        Vybrať
                      </button>
                    </td>
                    <td className="p-6 bg-gradient-to-br from-orange-50 to-red-50">
                      <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                        Vybrať
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-6 bg-gray-50 text-center text-sm text-gray-600 border-t border-gray-200">
              Automatické mesačné predplatné. Systém vám automaticky vyšle faktúru.
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
