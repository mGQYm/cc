'use client';

import { useState } from 'react';

interface PreferencesSelectorProps {
  onPreferencesChange: (preferences: {
    days: number;
    interests: string[];
    budgetLevel: 1 | 2 | 3;
  }) => void;
  values: {
    days: number;
    interests: string[];
    budgetLevel: 1 | 2 | 3;
  };
}

const INTERESTS = [
  { id: '景点', label: '景点', icon: '🏛️' },
  { id: '美食', label: '美食', icon: '🍜' },
  { id: '购物', label: '购物', icon: '🛍️' },
  { id: '摄影', label: '摄影', icon: '📸' },
  { id: '文化', label: '文化', icon: '🎭' },
  { id: '自然', label: '自然', icon: '🌳' },
];

const BUDGET_LEVELS = [
  { level: 1, label: '经济', description: '人均¥200-500/天' },
  { level: 2, label: '标准', description: '人均¥500-1000/天' },
  { level: 3, label: '豪华', description: '人均¥1000+/天' },
];

export default function PreferencesSelector({ onPreferencesChange, values }: PreferencesSelectorProps) {
  const [localValues, setLocalValues] = useState(values);

  const handleDaysChange = (days: number) => {
    const newValues = { ...localValues, days };
    setLocalValues(newValues);
    onPreferencesChange(newValues);
  };

  const handleInterestToggle = (interest: string) => {
    const newInterests = localValues.interests.includes(interest)
      ? localValues.interests.filter(i => i !== interest)
      : [...localValues.interests, interest];
    
    const newValues = { ...localValues, interests: newInterests };
    setLocalValues(newValues);
    onPreferencesChange(newValues);
  };

  const handleBudgetChange = (budgetLevel: 1 | 2 | 3) => {
    const newValues = { ...localValues, budgetLevel };
    setLocalValues(newValues);
    onPreferencesChange(newValues);
  };

  return (
    <div className="space-y-6">
      {/* Days Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          旅行天数
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min="1"
            max="15"
            value={localValues.days}
            onChange={(e) => handleDaysChange(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-lg font-semibold text-blue-600 w-12 text-center">
            {localValues.days}天
          </span>
        </div>
      </div>

      {/* Interests Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          兴趣标签
        </label>
        <div className="grid grid-cols-3 gap-2">
          {INTERESTS.map((interest) => (
            <button
              key={interest.id}
              type="button"
              onClick={() => handleInterestToggle(interest.id)}
              className={`p-3 rounded-lg border transition-all ${
                localValues.interests.includes(interest.id)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-lg mb-1">{interest.icon}</div>
              <div className="text-sm">{interest.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Budget Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          预算等级
        </label>
        <div className="grid grid-cols-3 gap-3">
          {BUDGET_LEVELS.map((budget) => (
            <button
              key={budget.level}
              type="button"
              onClick={() => handleBudgetChange(budget.level as 1 | 2 | 3)}
              className={`p-4 rounded-lg border-2 transition-all ${
                localValues.budgetLevel === budget.level
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-semibold text-lg">{budget.label}</div>
              <div className="text-sm text-gray-600">{budget.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}