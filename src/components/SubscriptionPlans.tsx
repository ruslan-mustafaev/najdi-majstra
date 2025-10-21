import React, { useState } from 'react';
import { Check, Info, Sparkles } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface PlanFeature {
  id: number;
  name: string;
  free: boolean;
  basic: boolean;
  standard: boolean;
  premium: boolean;
  ultimate: boolean;
}

interface PlanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: string;
  features: PlanFeature[];
}

const PlanDetailModal: React.FC<PlanDetailModalProps> = ({ isOpen, onClose, planName, planPrice, features }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">{planName}</h2>
              <p className="text-3xl font-bold">{planPrice} €<span className="text-sm font-normal">/mesiac</span></p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Všetky funkcie tohto plánu:</h3>
          <div className="space-y-3">
            {features.map(feature => (
              <div key={feature.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature.name}</span>
              </div>
            ))}
          </div>

          <button
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all"
          >
            Vybrať tento plán
          </button>
        </div>
      </div>
    </div>
  );
};

export const SubscriptionPlans: React.FC = () => {
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      name: 'Zdarma',
      price: '0',
      color: 'from-gray-400 to-gray-500',
      highlight: false,
      icon: '🎯'
    },
    {
      name: 'Basic',
      price: '9.9',
      color: 'from-blue-400 to-blue-500',
      highlight: false,
      icon: '⭐'
    },
    {
      name: 'Standard',
      price: '19.9',
      color: 'from-purple-500 to-pink-500',
      highlight: false,
      icon: '🚀'
    },
    {
      name: 'Premium',
      price: '25.5',
      color: 'from-orange-400 to-red-500',
      highlight: true,
      icon: '👑'
    },
    {
      name: 'Ultimate',
      price: '49.79',
      color: 'from-yellow-400 to-amber-500',
      highlight: false,
      icon: '💎'
    }
  ];

  const features: PlanFeature[] = [
    { id: 1, name: 'Predajný profil', free: true, basic: true, standard: true, premium: true, ultimate: true },
    { id: 2, name: 'Osobný AI predajca ktorý šetrí váš čas a aktívne predá vaše služby alebo produkty', free: false, basic: false, standard: true, premium: true, ultimate: true },
    { id: 3, name: 'Rozvoj podnikania profesionálne on-line kurzy a certifikácie (v príprave)', free: true, basic: true, standard: true, premium: true, ultimate: true },
    { id: 4, name: 'Benefit weba najdiMajstra.sk: Zvýšenie zisku', free: true, basic: true, standard: true, premium: true, ultimate: true },
    { id: 5, name: 'Osobný plánovač času', free: false, basic: false, standard: true, premium: true, ultimate: true },
    { id: 6, name: 'Vlastný plánovací kalendár', free: true, basic: true, standard: true, premium: true, ultimate: true },
    { id: 7, name: 'On-line zmluvy (v príprave)', free: true, basic: true, standard: true, premium: true, ultimate: true },
    { id: 8, name: 'Možnosť pridania svojích prác ktoré ste predajú', free: false, basic: false, standard: false, premium: false, ultimate: true },
    { id: 9, name: 'Hodnotenie od klientov', free: true, basic: true, standard: true, premium: true, ultimate: true },
    { id: 10, name: 'Zvýšenie vašej propagácie', free: true, basic: true, standard: true, premium: true, ultimate: true },
    { id: 11, name: 'Propagácia seba a zvýšenie zaujmu o vaše služby a výsledné produkty', free: true, basic: true, standard: true, premium: true, ultimate: true },
    { id: 12, name: 'Predaj platených služieb', free: true, basic: true, standard: true, premium: true, ultimate: true },
    { id: 13, name: 'Vaš zisková aplikácia nM (najdiMajstra.sk) v mobile v príprave 2026', free: true, basic: true, standard: true, premium: true, ultimate: true },
    { id: 14, name: 'Vaša odbornosť: Kurzy a certifikáty', free: true, basic: true, standard: true, premium: true, ultimate: true },
    { id: 15, name: 'Vzdelávanie, Rozvoj, Mentoring, Osobnostný rozvoj, Psychológia predaja, Líderstvo', free: false, basic: false, standard: false, premium: false, ultimate: true }
  ];

  const getPlanFeatures = (planName: string): PlanFeature[] => {
    const planKey = planName.toLowerCase() as 'free' | 'basic' | 'standard' | 'premium' | 'ultimate';
    const keyMap = {
      'zdarma': 'free' as const,
      'basic': 'basic' as const,
      'standard': 'standard' as const,
      'premium': 'premium' as const,
      'ultimate': 'ultimate' as const
    };

    const actualKey = keyMap[planName.toLowerCase() as keyof typeof keyMap];
    return features.filter(f => f[actualKey]);
  };

  const openPlanDetails = (planName: string, planPrice: string) => {
    setSelectedPlan(planName);
  };

  const closePlanDetails = () => {
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Moje predplatné</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Vyberte si plán pre váš úspech
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Profesionálne nástroje pre rast vášho podnikania
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {plans.map((plan) => {
            const planFeatures = getPlanFeatures(plan.name);

            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  plan.highlight ? 'ring-4 ring-blue-500 ring-offset-4' : ''
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    NAJPOPULÁRNEJŠÍ
                  </div>
                )}

                <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
                  <div className="text-4xl mb-2">{plan.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-xl ml-1">€</span>
                    <span className="text-sm ml-2 opacity-90">/mesiac</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Info className="w-4 h-4" />
                      <span className="font-semibold">{planFeatures.length} funkcií</span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {planFeatures.slice(0, 5).map(feature => (
                        <div key={feature.id} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 line-clamp-2">{feature.name}</span>
                        </div>
                      ))}
                      {planFeatures.length > 5 && (
                        <p className="text-xs text-gray-500 italic">+ ďalších {planFeatures.length - 5} funkcií...</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => openPlanDetails(plan.name, plan.price)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all mb-2"
                  >
                    Čítať podrobnejšie
                  </button>

                  <button
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Vybrať plán
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Porovnanie všetkých funkcií</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="text-left p-4 rounded-tl-lg font-semibold">Profil a registrácia</th>
                  <th className="text-center p-4 font-semibold">Zdarma</th>
                  <th className="text-center p-4 font-semibold">9.9</th>
                  <th className="text-center p-4 font-semibold">19.9</th>
                  <th className="text-center p-4 font-semibold">25.5</th>
                  <th className="text-center p-4 rounded-tr-lg font-semibold">4979</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={feature.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                    <td className="p-4 text-gray-700 font-medium">{feature.name}</td>
                    <td className="text-center p-4">
                      {feature.free ? (
                        <div className="flex justify-center">
                          <Check className="w-5 h-5 text-green-500" />
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">nie</span>
                      )}
                    </td>
                    <td className="text-center p-4">
                      {feature.basic ? (
                        <div className="flex justify-center">
                          <Check className="w-5 h-5 text-green-500" />
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">nie</span>
                      )}
                    </td>
                    <td className="text-center p-4">
                      {feature.standard ? (
                        <div className="flex justify-center">
                          <Check className="w-5 h-5 text-green-500" />
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">nie</span>
                      )}
                    </td>
                    <td className="text-center p-4">
                      {feature.premium ? (
                        <div className="flex justify-center">
                          <Check className="w-5 h-5 text-green-500" />
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">nie</span>
                      )}
                    </td>
                    <td className="text-center p-4">
                      {feature.ultimate ? (
                        <div className="flex justify-center">
                          <Check className="w-5 h-5 text-green-500" />
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">nie</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            Máte otázky? <a href="#" className="text-blue-600 hover:underline font-semibold">Kontaktujte nás</a>
          </p>
        </div>
      </div>

      {selectedPlan && (
        <PlanDetailModal
          isOpen={!!selectedPlan}
          onClose={closePlanDetails}
          planName={selectedPlan}
          planPrice={plans.find(p => p.name === selectedPlan)?.price || '0'}
          features={getPlanFeatures(selectedPlan)}
        />
      )}
    </div>
  );
};
