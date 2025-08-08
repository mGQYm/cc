'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPreview } from '@/components/MapPreview';
import { TimelineEditor } from '@/components/TimelineEditor';
import type { Route } from '@/types';

export default function SharedRoutePage() {
  const params = useParams();
  const token = params.token as string;
  
  const [route, setRoute] = useState<Route | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadSharedRoute();
    }
  }, [token]);

  const loadSharedRoute = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/share/${token}`);
      if (!response.ok) {
        throw new Error('Failed to load shared route');
      }
      
      const { route: routeData } = await response.json();
      setRoute(routeData);
    } catch (err) {
      setError('无法加载分享的路线，可能已被删除或未公开');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-blue-600 text-2xl">🗺️</span>
          </div>
          <p className="text-gray-600">加载分享的路线...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">路线加载失败</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  if (!route) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{route.title}</h1>
              <p className="text-gray-600 mt-1">{route.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                创建我的路线
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Route Details */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">目的地:</span>
              <span className="ml-2 font-semibold">{route.location}</span>
            </div>
            <div>
              <span className="text-gray-600">天数:</span>
              <span className="ml-2 font-semibold">{route.total_days}天</span>
            </div>
            <div>
              <span className="text-gray-600">预算:</span>
              <span className="ml-2 font-semibold">
                {route.budget_level === 1 ? '经济' : route.budget_level === 2 ? '标准' : '豪华'}
              </span>
            </div>
          </div>
          
          {route.interests && route.interests.length > 0 && (
            <div className="mt-4">
              <span className="text-gray-600">标签:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {route.interests.map((interest, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Route Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">每日行程</h2>
            </div>
            <TimelineEditor
              route={route}
              activeDay={activeDay}
              onDayChange={setActiveDay}
              onRouteUpdate={() => {}} // Read-only
              readOnly={true}
            />
          </div>

          {/* Map */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">地图预览</h2>
            </div>
            <div className="h-96">
              <MapPreview
                route={route}
                activeDay={activeDay}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            想创建自己的旅行路线？
            <a href="/" className="text-blue-600 hover:underline ml-1">
              立即开始规划
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}