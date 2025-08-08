'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SpotLibrary } from '@/components/SpotLibrary';
import { TimelineEditor } from '@/components/TimelineEditor';
import { MapPreview } from '@/components/MapPreview';
import { RouteToolbar } from '@/components/RouteToolbar';
import type { Route } from '@/types';

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [route, setRoute] = useState<Route | null>(null);
  const [selectedSpots, setSelectedSpots] = useState<string[]>([]);
  const [activeDay, setActiveDay] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const loadRoute = async () => {
      const routeId = searchParams.get('id');
      
      if (!routeId) {
        // Load from localStorage for new routes
        const savedRoute = localStorage.getItem('selectedRoute');
        if (savedRoute) {
          setRoute(JSON.parse(savedRoute));
        } else {
          router.push('/');
        }
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/routes/${routeId}`);
        if (!response.ok) {
          throw new Error('Failed to load route');
        }
        
        const { route: routeData } = await response.json();
        setRoute(routeData);
      } catch (error) {
        console.error('Error loading route:', error);
        alert('加载路线失败，请重试');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadRoute();
  }, [router, searchParams, session, status]);

  const handleRouteUpdate = async (updatedRoute: Route) => {
    setRoute(updatedRoute);
    
    if (updatedRoute.id) {
      try {
        await fetch(`/api/routes/${updatedRoute.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedRoute),
        });
      } catch (error) {
        console.error('Error updating route:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">未找到路线</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/my-routes')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← 我的路线
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {route.title}
              </h1>
            </div>
            <RouteToolbar route={route} onSave={handleRouteUpdate} />
          </div>
        </div>
      </header>

      {/* Responsive Three-Column Layout */}
      <div className="flex h-screen pt-16">
        {/* Left Column: Spot Library (30%) */}
        <div className="w-full md:w-1/4 lg:w-1/4 bg-white border-r overflow-y-auto hidden md:block">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">景点库</h2>
          </div>
          <SpotLibrary
            location={route.location}
            selectedSpots={selectedSpots}
            onSpotSelect={(spot) => {
              setSelectedSpots(prev => [...prev, spot.id]);
              // Add spot to current day
              const updatedRoute = { ...route };
              updatedRoute.days[activeDay].spots.push(spot);
              updatedRoute.days[activeDay].total_duration += spot.duration;
              handleRouteUpdate(updatedRoute);
            }}
          />
        </div>

        {/* Middle Column: Timeline Editor (40%) */}
        <div className="w-full md:w-3/5 lg:w-2/5 bg-gray-50 border-r overflow-y-auto">
          <div className="p-4 border-b bg-white">
            <h2 className="text-lg font-semibold">时间轴编辑器</h2>
          </div>
          <TimelineEditor
            route={route}
            activeDay={activeDay}
            onDayChange={setActiveDay}
            onRouteUpdate={handleRouteUpdate}
          />
        </div>

        {/* Right Column: Map Preview (35%) */}
        <div className="w-full md:w-2/5 lg:w-2/5 bg-white overflow-y-auto hidden lg:block">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">地图预览</h2>
          </div>
          <MapPreview
            route={route}
            activeDay={activeDay}
          />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex">
          <button 
            className="flex-1 py-3 text-sm font-medium text-blue-600 border-r"
            onClick={() => document.querySelector('.md\:w-1\/4')?.classList.toggle('hidden')}
          >
            景点库
          </button>
          <button 
            className="flex-1 py-3 text-sm font-medium text-blue-600"
            onClick={() => document.querySelector('.lg\:block')?.classList.toggle('hidden')}
          >
            地图
          </button>
        </div>
      </div>
    </div>
  );
}