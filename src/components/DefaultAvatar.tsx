import React from 'react';
import { Camera, User } from 'lucide-react';

interface DefaultAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showCamera?: boolean;
}

export const DefaultAvatar: React.FC<DefaultAvatarProps> = ({ 
  size = 'md', 
  className = '',
  showCamera = true 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40
  };

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center border-2 border-gray-300 ${className}`}>
      {showCamera ? (
        <Camera size={iconSizes[size]} className="text-gray-500" />
      ) : (
        <User size={iconSizes[size]} className="text-gray-500" />
      )}
    </div>
  );
};