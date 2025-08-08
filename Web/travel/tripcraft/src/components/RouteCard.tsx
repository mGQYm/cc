'use client';

import { MapPin, Clock, Users, Share2 } from 'lucide-react';
import type { Route } from '@/types';

interface RouteCardProps {
  route: Route;
  onSelect: (route: Route) => void;
  onShare?: (route: Route) => void;
}

export default function RouteCard({ route, onSelect, onShare }: RouteCardProps) {
  const totalSpots = route.days.reduce((sum, day) => sum + day.spots.length, 0);
  const totalDuration = route.days.reduce((sum, day) => sum + day.total_duration, 0);
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer">
      <div onClick={() => onSelect(route)} className="space-y-4">
        {/* Route Header */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{route.title}</h3>
          <p className="text-gray-600 text-sm">{route.description}</p>
        </div>

        {/* Route Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{route.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{route.total_days}天</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{totalSpots}个景点</span>
          </div>
        </div>

        {/* Route Preview */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">行程预览：</h4>
          <div className="space-y-2">
            {route.days.slice(0, 3).map((day, index) => (
              <div key={index} className="text-sm text-gray-600">
                <span className="font-medium">第{index + 1}天：</span>
                {day.spots.slice(0, 3).map((spot, spotIndex) => (
                  <span key={spot.id}>
                    {spot.name}
                    {spotIndex < day.spots.slice(0, 3).length - 1 && '、'}
                  </span>
                ))}
                {day.spots.length > 3 && `等${day.spots.length}个景点`}
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {route.interests.map((interest) => (
            <span
              key={interest}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              {interest}
            </span>
          ))}
          <span className={`px-2 py-1 text-xs rounded-full ${
            route.budget_level === 1 ? 'bg-green-100 text-green-700' :
            route.budget_level === 2 ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {route.budget_level === 1 ? '经济' :
             route.budget_level === 2 ? '标准' : '豪华'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(route);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          查看详情
        </button>
        
        {onShare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(route);
            }}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}