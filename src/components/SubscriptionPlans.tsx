import React, { useState } from 'react';
import { Check, Info, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '../hooks/useAuth';
import { getPlanPriceId } from '../lib/stripeConfig';
import { supabase } from '../lib/supabase';

interface PlanFeature {
  id: number;
  name: string;
  infoText?: string;
  zdarma: 'áno' | 'nie';
  odbornik: 'áno' | 'nie';
  expert: 'áno' | 'nie';
  profik: 'áno' | 'nie';
  premier: 'áno' | 'nie';
}

export const SubscriptionPlans: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSelectPlan = async (planKey: 'odbornik' | 'expert' | 'profik' | 'premier') => {
    if (!user) {
      alert('Musíte sa prihlásiť pre výber plánu');
      return;
    }

    const priceId = getPlanPriceId(planKey, billingPeriod);
    console.log('Selected plan:', planKey, 'Period:', billingPeriod, 'Price ID:', priceId);

    if (!priceId) {
      alert('Chyba: Price ID nie je nakonfigurovaný pre tento plán. Skontaktujte podporu.');
      return;
    }

    const currentUrl = window.location.origin;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert('Musíte sa prihlásiť pre výber plánu');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${currentUrl}/subscription?success=true`,
          cancel_url: `${currentUrl}/subscription?canceled=true`,
          mode: planKey === 'premier' ? 'payment' : 'subscription',
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data);
        alert('Chyba pri vytváraní platby: ' + (data.error || 'Neznáma chyba'));
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Chyba pri vytváraní platby');
    }
  };

  const features: PlanFeature[] = [
    {
      id: 1,
      name: 'Predajný dožívtný profil Zdarma',
      infoText: 'Vytvorte si profesionálny profil s vašimi službami',
      zdarma: 'áno',
      odbornik: 'áno',
      expert: 'áno',
      profik: 'áno',
      premier: 'áno'
    },
    {
      id: 2,
      name: 'Osobný AI predajca ktorý šetrí váš čas a aktívne predá vaše služby alebo produkty',
      infoText: 'AI asistent automaticky komunikuje s klientmi a uzatvára obchody',
      zdarma: 'nie',
      odbornik: 'nie',
      expert: 'nie',
      profik: 'áno',
      premier: 'áno'
    },
    {
      id: 3,
      name: 'Rozvoj podnikania profesionálne on-line kurzy a certifikácie (v príprave)',
      infoText: 'Prístup k vzdelávacím kurzom pre rozvoj vášho biznisu',
      zdarma: 'áno',
      odbornik: 'áno',
      expert: 'áno',
      profik: 'áno',
      premier: 'áno'
    },
    {
      id: 4,
      name: 'Benefit webu najdiMajstra.sk: Zvýšenie zisku',
      infoText: 'Špeciálne benefity pre zvýšenie vášho zisku',
      zdarma: 'áno',
      odbornik: 'áno',
      expert: 'áno',
      profik: 'áno',
      premier: 'áno'
    },
    {
      id: 5,
      name: '(moje stavby ) Osobný plánovač práce',
      infoText: 'Pokročilý nástroj na plánovanie vašich zákaziek',
      zdarma: 'nie',
      odbornik: 'áno',
      expert: 'áno',
      profik: 'áno',
      premier: 'áno'
    },
    {
      id: 6,
      name: 'Vlastný plánovací kalendár (môj kalendár)',
      infoText: 'Váš osobný kalendár pre správu termínov',
      zdarma: 'áno',
      odbornik: 'áno',
      expert: 'áno',
      profik: 'áno',
      premier: 'áno'
    },
    {
      id: 7,
      name: 'On-line moje zmluvy (v príprave)',
      infoText: 'Digitálne zmluvy s elektronickým podpisom',
      zdarma: 'áno',
      odbornik: 'áno',
      expert: 'áno',
      profik: 'áno',
      premier: 'áno'
    },
    {
      id: 8,
      name: '(moja recenzia) Možnosť pridania svojích prác, ktoré vás predajú',
      infoText: 'Pridávajte hotové práce do svojho portfólia',
      zdarma: 'nie',
      odbornik: 'nie',
      expert: 'áno',
      profik: 'áno',
      premier: 'áno'
    },
    {
      id: 9,
      name: 'Hodnotenie od klientov',
      infoText: 'Zbierajte recenzie a hodnotenia od zákazníkov',
      zdarma: 'áno',
      odbornik: 'áno',
      expert: 'áno',
      profik: 'áno',
      premier: 'áno'
    },
    {
      id: 10,
      name: 'Zvýšenie vašej propagácie',
      infoText: 'Vyššia viditeľnosť vo vyhľadávaní',
      zdarma: 'áno',
      odbornik: 'áno',
      expert: 'áno',
      profik: 'áno',
      premier: 'áno'
    },
    {
      id: 11,
      name: 'Propagácia seba a zvýšenie zaujmu o vaše služby a výsledné produkty',
      infoText: 'Aktívna propagácia vášho profilu na platforme',
      zdarma: 'áno',
      odbornik: 'áno',
      expert: 'áno',
      profik: 'áno',
      premier: 'áno'
    },
    {
      id: 12,
      name: 'Predaj vlastných služieb',
      infoText: 'Predávajte svoje služby priamo cez platformu',
      zdarma: 'áno',
      odbornik: 'áno',
      expert: 'áno',
      profik: 'áno',
      premier: 'áno'
    },
    {
      id: 13,
      name: 'Vaš zisková aplikácia nM (najdiMajstra.sk) v mobile v príprave 2026',
      infoText: 'Mobilná aplikácia pre správu vášho podnikania',
      zdarma: 'áno',
      odbornik: 'áno',
      expert: 'áno',
      profik: 'áno',
      premier: 'áno'
    },
    {
      id: 14,
      name: 'Podpora podnikania: Kurzy a certifikáty',
      infoText: 'Zobrazujte svoje kurzy a certifikáty',
      zdarma: 'áno',
      odbornik: 'áno',
      expert: 'áno',
      profik: 'áno',
      premier: 'áno'
    },
    {
      id: 15,
      name: 'Vzdelávanie, Rozvoj, Mentoring, Osobnostný rozvoj, Psychológia predaja, Líderstvo',
      infoText: 'Prémové vzdelávacie programy a mentoring',
      zdarma: 'nie',
      odbornik: 'nie',
      expert: 'nie',
      profik: 'nie',
      premier: 'áno'
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl p-8 text-white text-center">
            <div className="space-y-3 max-w-4xl mx-auto mb-6">
              <p className="text-base leading-relaxed">
                <strong>POZOR:</strong> Po zaplatení už od 9,9€ mesačne môžete získať zákazky za tisíce €, správny majster získa certifikáciu odborníka / experta / profika, už od teraz a zvýši tak svoju dôveru v očiach nových prichádzajúcich klientov.
              </p>
              <p className="text-base leading-relaxed">
                <strong>Denne na Slovensku hľadajú 10tky až 100vky ľudí niekoho, presne ako vás alebo niekoho z vášho oboru,</strong> hlavne sa nezabudnite nechať kvalitne finančne ohodnotiť ako správny Majster.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4">
              <span className="text-sm font-medium">Fakturácia:</span>
              <div className="bg-white/20 rounded-lg p-1 flex gap-1">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-6 py-2 rounded-md font-semibold transition-all ${
                    billingPeriod === 'monthly'
                      ? 'bg-white text-blue-600'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Mesačne
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px-6 py-2 rounded-md font-semibold transition-all ${
                    billingPeriod === 'yearly'
                      ? 'bg-white text-blue-600'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Ročne
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left p-4 font-semibold text-gray-900 bg-gray-50" rowSpan={2}>
                      Názov predajného profilu
                    </th>
                    <th className="text-center p-3 bg-gray-50 border-l border-gray-300">
                      <div className="text-sm font-semibold text-gray-700">Mini</div>
                    </th>
                    <th className="text-center p-3 bg-gray-50 border-l border-gray-300">
                      <div className="text-sm font-semibold text-gray-700">Odborník</div>
                    </th>
                    <th className="text-center p-3 bg-gray-50 border-l border-gray-300">
                      <div className="text-sm font-semibold text-gray-700">Expert</div>
                    </th>
                    <th className="text-center p-3 bg-gray-50 border-l border-gray-300">
                      <div className="text-sm font-semibold text-gray-700">Profik</div>
                    </th>
                    <th className="text-center p-3 bg-gray-50 border-l border-gray-300">
                      <div className="text-sm font-semibold text-gray-700">Premier</div>
                    </th>
                  </tr>
                  <tr className="border-b-2 border-gray-300 bg-red-50">
                    <th className="text-center p-3 border-l border-gray-300">
                      <div className="text-xs font-bold text-red-600 mb-1">Moje predplatné</div>
                      <div className="text-sm font-bold text-red-600 line-through">9,90€</div>
                    </th>
                    <th className="text-center p-3 border-l border-gray-300">
                      <div className="text-xs font-bold text-red-600 mb-1">Moje predplatné</div>
                      <div className="text-sm font-bold text-red-600 line-through">19.90€</div>
                    </th>
                    <th className="text-center p-3 border-l border-gray-300">
                      <div className="text-xs font-bold text-red-600 mb-1">Moje predplatné</div>
                      <div className="text-sm font-bold text-red-600 line-through">41.99€</div>
                    </th>
                    <th className="text-center p-3 border-l border-gray-300">
                      <div className="text-xs font-bold text-red-600 mb-1">Moje predplatné</div>
                      <div className="text-sm font-bold text-red-600 line-through">9 999€</div>
                    </th>
                    <th className="text-center p-3 border-l border-gray-300">
                      <div className="text-xs font-bold text-red-600 mb-1">Moje predplatné</div>
                      <div className="text-sm font-bold text-red-600 line-through">9 999€</div>
                    </th>
                  </tr>
                  <tr className="border-b-2 border-gray-300 bg-gray-100">
                    <th className="text-left p-4 font-bold text-gray-900">
                      Cena hodnota
                    </th>
                    <th className="text-center p-3 border-l border-gray-300">
                      <div className="text-xl font-bold text-blue-600">Zdarma</div>
                    </th>
                    <th className="text-center p-3 border-l border-gray-300">
                      <div className="text-xl font-bold text-blue-600">9,90€</div>
                    </th>
                    <th className="text-center p-3 border-l border-gray-300">
                      <div className="text-xl font-bold text-blue-600">19,90€</div>
                    </th>
                    <th className="text-center p-3 border-l border-gray-300 bg-orange-50">
                      <div className="text-xl font-bold text-orange-600">25,50€</div>
                    </th>
                    <th className="text-center p-3 border-l border-gray-300">
                      <div className="text-xl font-bold text-blue-600">4 979€</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr
                      key={feature.id}
                      className={`border-b border-gray-200 transition-colors hover:bg-blue-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="p-3 text-sm text-gray-800">
                        <div className="flex items-start gap-2">
                          <span className="flex-1">{feature.name}</span>
                          {feature.infoText && (
                            <button
                              className="text-blue-500 hover:text-blue-700 flex-shrink-0 mt-0.5 group relative"
                              title={feature.infoText}
                            >
                              <Info className="w-3.5 h-3.5" />
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl z-10">
                                {feature.infoText}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="text-center p-3 border-l border-gray-200">
                        {feature.zdarma === 'áno' ? (
                          <div className="flex justify-center">
                            <div className="bg-green-500 rounded-full p-1">
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">nie</span>
                        )}
                      </td>
                      <td className="text-center p-3 border-l border-gray-200">
                        {feature.odbornik === 'áno' ? (
                          <div className="flex justify-center">
                            <div className="bg-green-500 rounded-full p-1">
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">nie</span>
                        )}
                      </td>
                      <td className="text-center p-3 border-l border-gray-200">
                        {feature.expert === 'áno' ? (
                          <div className="flex justify-center">
                            <div className="bg-green-500 rounded-full p-1">
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">nie</span>
                        )}
                      </td>
                      <td className="text-center p-3 border-l border-gray-200 bg-orange-50/30">
                        {feature.profik === 'áno' ? (
                          <div className="flex justify-center">
                            <div className="bg-green-500 rounded-full p-1">
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">nie</span>
                        )}
                      </td>
                      <td className="text-center p-3 border-l border-gray-200">
                        {feature.premier === 'áno' ? (
                          <div className="flex justify-center">
                            <div className="bg-green-500 rounded-full p-1">
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">nie</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 border-t-2 border-gray-300">
                    <td className="p-3 text-sm font-semibold text-gray-800">
                      Namiesto ročného predplatného 12xhodnota
                    </td>
                    <td className="text-center p-3 border-l border-gray-200 text-sm font-semibold text-gray-700">
                      zdarma
                    </td>
                    <td className="text-center p-3 border-l border-gray-200 text-sm font-bold text-red-600 line-through">
                      118,80€
                    </td>
                    <td className="text-center p-3 border-l border-gray-200 text-sm font-bold text-red-600 line-through">
                      238,80€
                    </td>
                    <td className="text-center p-3 border-l border-gray-200 bg-orange-50/30 text-sm font-bold text-red-600 line-through">
                      306,00€
                    </td>
                    <td className="text-center p-3 border-l border-gray-200 text-sm font-semibold text-gray-700">
                      -
                    </td>
                  </tr>
                  <tr className="bg-white border-b-2 border-gray-300">
                    <td className="p-3 text-sm font-bold text-gray-900">
                      Máte teraz výhodné ročné predplatné v aktuálnej akcii za
                    </td>
                    <td className="text-center p-3 border-l border-gray-200 text-lg font-bold text-green-600">
                      0,00 €
                    </td>
                    <td className="text-center p-3 border-l border-gray-200 text-lg font-bold text-green-600">
                      99,00 €
                    </td>
                    <td className="text-center p-3 border-l border-gray-200 text-lg font-bold text-green-600">
                      195,00 €
                    </td>
                    <td className="text-center p-3 border-l border-gray-200 bg-orange-50/30 text-lg font-bold text-orange-600">
                      225,00 €
                    </td>
                    <td className="text-center p-3 border-l border-gray-200 text-lg font-bold text-green-600">
                      -
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100">
                    <td className="p-4 font-semibold text-gray-900">
                      Vyberte váš plán
                    </td>
                    <td className="p-3 border-l border-gray-300">
                      <button disabled className="w-full bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg text-sm cursor-not-allowed opacity-90">
                        Aktivný
                      </button>
                    </td>
                    <td className="p-3 border-l border-gray-300">
                      <button
                        onClick={() => handleSelectPlan('odbornik')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all transform hover:scale-105 text-sm"
                      >
                        Vybrať
                      </button>
                    </td>
                    <td className="p-3 border-l border-gray-300">
                      <button
                        onClick={() => handleSelectPlan('expert')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all transform hover:scale-105 text-sm"
                      >
                        Vybrať
                      </button>
                    </td>
                    <td className="p-3 border-l border-gray-300 bg-orange-50">
                      <button
                        onClick={() => handleSelectPlan('profik')}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg text-sm"
                      >
                        Vybrať
                      </button>
                    </td>
                    <td className="p-3 border-l border-gray-300">
                      <button
                        onClick={() => handleSelectPlan('premier')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all transform hover:scale-105 text-sm"
                      >
                        Vybrať
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-6 bg-gray-50 text-center text-sm text-gray-600 border-t border-gray-200">
              Automatické {billingPeriod === 'monthly' ? 'mesačné' : 'ročné'} predplatné. Systém vám automaticky vyšle faktúru.
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
