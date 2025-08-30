import React from 'react';
import { CheckCircle, AlertCircle, Clock, Eye } from 'lucide-react';

interface ProfileStatusProps {
  isProfileSaved: boolean;
  isLoading: boolean;
  completionPercentage: number;
}

export const ProfileStatus: React.FC<ProfileStatusProps> = ({ 
  isProfileSaved, 
  isLoading, 
  completionPercentage 
}) => {
  const getStatusInfo = () => {
    if (isLoading) {
      return {
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        title: 'Ukladá sa...',
        description: 'Váš profil sa práve ukladá do systému.'
      };
    }

    if (isProfileSaved) {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        title: 'Profil je aktívny!',
        description: 'Váš profil je teraz viditeľný pre klientov na najdiMajstra.sk'
      };
    }

    return {
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      title: 'Profil nie je aktívny',
      description: 'Dokončite profil a uložte ho pre zviditeľnenie klientom.'
    };
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  return (
    <div className={`${status.bgColor} ${status.borderColor} border-2 rounded-xl p-6 mb-8`}>
      <div className="flex items-start space-x-4">
        <Icon size={32} className={status.color} />
        <div className="flex-1">
          <h2 className={`text-xl font-bold ${status.color} mb-2`}>
            {status.title}
          </h2>
          <p className="text-gray-700 mb-4">
            {status.description}
          </p>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Dokončenosť profilu</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#4169e1] h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {isProfileSaved && (
            <div className="flex items-center space-x-2 text-green-700">
              <Eye size={16} />
              <span className="text-sm font-medium">
                Klienti môžu vidieť váš profil v zoznamoch majstrov
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};