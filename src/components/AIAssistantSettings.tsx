import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Sparkles, MessageSquare, AlertCircle, CheckCircle, Home } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AIAssistantSettingsProps {
  onBack: () => void;
}

export const AIAssistantSettings: React.FC<AIAssistantSettingsProps> = ({ onBack }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [urgentPrompt, setUrgentPrompt] = useState('');
  const [regularPrompt, setRegularPrompt] = useState('');
  const [realizationPrompt, setRealizationPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('masters')
        .select('ai_urgent_prompt, ai_regular_prompt, ai_realization_prompt')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setUrgentPrompt(data.ai_urgent_prompt || '');
        setRegularPrompt(data.ai_regular_prompt || '');
        setRealizationPrompt(data.ai_realization_prompt || '');
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const { error } = await supabase
        .from('masters')
        .update({
          ai_urgent_prompt: urgentPrompt,
          ai_regular_prompt: regularPrompt,
          ai_realization_prompt: realizationPrompt,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving AI settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back to Home Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 hover:text-white hover:bg-[#4169e1] rounded-lg transition-all duration-200 group border border-gray-300 hover:border-[#4169e1] shadow-md hover:shadow-lg"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <Home size={18} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Späť na úvod</span>
          </button>
        </div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4169e1] to-[#5a7bff] rounded-xl flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Môj AI predajca</h1>
              <p className="text-gray-600">Nastavte si vlastného AI asistenta pre predaj vašich služieb</p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start space-x-3">
          <MessageSquare className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Ako to funguje?</h3>
            <p className="text-sm text-blue-800">
              AI asistent bude komunikovať s klientami vo vašom mene. Napíšte pre každý typ služby,
              ako chcete, aby vás AI predstavilo, aké máte skúsenosti, špecializáciu a čo ponúkate.
            </p>
          </div>
        </div>

        {/* Settings Form */}
        <div className="space-y-6">
          {/* Urgent Service */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Akútna porucha</h2>
                <p className="text-sm text-gray-600">Prompt pre naliehavé situácie a pohotovosti</p>
              </div>
            </div>

            <textarea
              value={urgentPrompt}
              onChange={(e) => setUrgentPrompt(e.target.value)}
              placeholder="Napríklad: Som odborník na pohotovostné zásahy s 10-ročnou praxou. Špecializujem sa na riešenie akútnych porúch plynových zariadení. Som dostupný 24/7 a zvyčajne prichádzam do 30 minút. Mojou prioritou je rýchle a bezpečné riešenie problému..."
              className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {urgentPrompt.length} / 1000 znakov
            </p>
          </div>

          {/* Regular Service */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-blue-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Pravidelný servis</h2>
                <p className="text-sm text-gray-600">Prompt pre bežnú údržbu a pravidelné služby</p>
              </div>
            </div>

            <textarea
              value={regularPrompt}
              onChange={(e) => setRegularPrompt(e.target.value)}
              placeholder="Napríklad: Ponúkam pravidelný servis plynových kotlov a zariadení. Mám certifikáty na prácu s plynovými zariadeniami a pravidelne absolvujem školenia. Vykonávam komplexné revízie, čistenie a údržbu. Poskytnem vám harmonogram údržby a poradím, ako predĺžiť životnosť vašich zariadení..."
              className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {regularPrompt.length} / 1000 znakov
            </p>
          </div>

          {/* Realization Service */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Sparkles className="text-green-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Plánovaná realizácia</h2>
                <p className="text-sm text-gray-600">Prompt pre veľké projekty a inštalácie</p>
              </div>
            </div>

            <textarea
              value={realizationPrompt}
              onChange={(e) => setRealizationPrompt(e.target.value)}
              placeholder="Napríklad: Špecializujem sa na komplexné projekty plynových inštalácií. Mám skúsenosti s realizáciou od rodinných domov po komerčné objekty. Poskytujem kompletnú dokumentáciu, cenové kalkulácie a garantujem dodržanie termínov. Spolupracujem s overenými dodávateľmi a ponúkam záručný aj pozáručný servis..."
              className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4169e1] focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {realizationPrompt.length} / 1000 znakov
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div>
            {saveStatus === 'success' && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle size={20} />
                <span className="font-medium">Nastavenia boli úspešne uložené!</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle size={20} />
                <span className="font-medium">Chyba pri ukladaní nastavení</span>
              </div>
            )}
            {saveStatus === 'idle' && (
              <p className="text-gray-600">
                Nezabudnite uložiť zmeny pred odchodom
              </p>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 bg-[#4169e1] text-white px-6 py-3 rounded-lg hover:bg-[#3155c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Save size={20} />
            <span>{isSaving ? 'Ukladám...' : 'Uložiť nastavenia'}</span>
          </button>
        </div>

        {/* Tips Section */}
        <div className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
            <Sparkles className="text-purple-600" size={20} />
            <span>Tipy pre efektívny AI prompt</span>
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start space-x-2">
              <span className="text-purple-600 font-bold mt-0.5">•</span>
              <span>Uveďte svoje skúsenosti a špecializáciu konkrétne</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-600 font-bold mt-0.5">•</span>
              <span>Zdôraznite, čo vás odlišuje od konkurencie</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-600 font-bold mt-0.5">•</span>
              <span>Uveďte dostupnosť, geografickú oblasť a čas reakcie</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-600 font-bold mt-0.5">•</span>
              <span>Popíšte, aký typ klientov preferujete</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-purple-600 font-bold mt-0.5">•</span>
              <span>Buďte konkrétni, ale priateľskí v tóne komunikácie</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};