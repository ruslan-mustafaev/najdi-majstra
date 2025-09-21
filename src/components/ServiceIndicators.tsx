import React from 'react';

export type ServiceType = 'urgent' | 'regular' | 'realization';

interface ServiceIndicatorsProps {
  services: ServiceType[];
  size?: 'small' | 'medium' | 'large';
}

export const ServiceIndicators: React.FC<ServiceIndicatorsProps> = ({ 
  services, 
  size = 'medium' 
}) => {
  if (!services || services.length === 0) {
    return null;
  }

  const getServiceConfig = (service: ServiceType) => {
    switch (service) {
      case 'urgent':
        return {
          color: 'bg-red-500',
          label: 'Akútna porucha',
          icon: '🚨'
        };
      case 'regular':
        return {
          color: 'bg-blue-500',
          label: 'Pravidelný servis',
          icon: '🔧'
        };
      case 'realization':
        return {
          color: 'bg-green-500',
          label: 'Plánovaná realizácia',
          icon: '🏗️'
        };
      default:
        return {
          color: 'bg-gray-500',
          label: 'Služba',
          icon: '⚙️'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-1.5';
      case 'large':
        return 'w-8 h-2';
      default:
        return 'w-6 h-2';
    }
  };

  return (
    <div className="flex flex-col space-y-1">
      {services.map((service, index) => {
        const config = getServiceConfig(service);
        return (
          <div
            key={index}
            className={`${config.color} ${getSizeClasses()} rounded-sm border border-white shadow-sm`}
            title={config.label}
          />
        );
      })}
    </div>
  );
};