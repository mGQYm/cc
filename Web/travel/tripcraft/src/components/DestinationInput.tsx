'use client';

import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

interface DestinationInputProps {
  onDestinationChange: (destination: string) => void;
  value: string;
}

const POPULAR_DESTINATIONS = [
  '北京', '上海', '广州', '深圳', '杭州',
  '厦门', '成都', '重庆', '西安', '南京'
];

export default function DestinationInput({ onDestinationChange, value }: DestinationInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onDestinationChange(newValue);
    setShowSuggestions(newValue.length > 0);
  };

  const handleSuggestionClick = (destination: string) => {
    onDestinationChange(destination);
    setShowSuggestions(false);
  };

  const filteredDestinations = POPULAR_DESTINATIONS.filter(dest =>
    dest.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="输入目的地（如：厦门、北京、上海）"
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      {showSuggestions && filteredDestinations.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredDestinations.map((destination) => (
            <button
              key={destination}
              type="button"
              onClick={() => handleSuggestionClick(destination)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
            >
              {destination}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}