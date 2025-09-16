import React from 'react';
import { ChevronDown } from 'lucide-react';
import { FilterOption } from '../data/filterOptions';

interface CustomSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder: string;
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder, 
  isOpen, 
  onToggle 
}) => {
  const handleSelect = (optionValue: string) => {
    // Don't select regions, only cities
    const option = options.find(opt => opt.value === optionValue);
    if (!option?.isRegion) {
      onChange(optionValue);
      onToggle(false);
    }
  };

  return (
    <div className="relative">
      <label className="block text-gray-700 text-sm font-medium mb-2">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:ring-2 focus:ring-[#4169e1] focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400 hover:shadow-md text-left flex justify-between items-center"
          onClick={() => onToggle(!isOpen)}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value || placeholder}
          </span>
          <ChevronDown 
            size={16} 
            className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={index}
                type="button"
                className={`w-full px-4 py-2 text-left transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg ${
                  option.isRegion 
                    ? 'font-bold text-gray-900 bg-gray-100 cursor-default' 
                    : 'hover:bg-blue-50 hover:text-[#4169e1] pl-8'
                }`}
                onClick={() => handleSelect(option.value)}
                disabled={option.isRegion}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};