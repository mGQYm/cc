'use client';

import { useEffect, useRef, useState } from 'react';
import { loadAmapScript, createAmapInstance, createMarker, createRoute, createInfoWindow } from '@/lib/map-service';
import type { Route, Spot } from '@/types';

interface MapPreviewProps {
  route: Route;
  activeDay: number;
}

export function MapPreview({ route, activeDay }: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        await loadAmapScript();
        
        const activeDaySpots = route.days[activeDay]?.spots || [];
        
        if (activeDaySpots.length === 0) {
          setIsLoading(false);
          return;
        }

        // Calculate center
        const centerLat = activeDaySpots.reduce((sum, spot) => sum + spot.lat, 0) / activeDaySpots.length;
        const centerLng = activeDaySpots.reduce((sum, spot) => sum + spot.lng, 0) / activeDaySpots.length;

        const map = createAmapInstance(mapRef.current, {
          center: [centerLng, centerLat],
          zoom: 13,
        });

        // Add markers for each spot
        const markers = activeDaySpots.map((spot, index) => {
          const marker = createMarker(map, spot, index + 1);
          
          // Add click listener for info window
          const infoWindow = createInfoWindow(spot);
          marker.on('click', () => {
            infoWindow.open(map, marker);
          });
          
          return marker;
        });

        // Add route line
        if (activeDaySpots.length > 1) {
          createRoute(map, activeDaySpots);
        }

        // Fit map to show all markers
        map.setFitView(markers);

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [route, activeDay]);

  const activeDaySpots = route.days[activeDay]?.spots || [];
  const allSpots = route.days.flatMap(day => day.spots);

  const createMapPlaceholder = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center text-gray-500">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-gray-400 text-2xl">🗺️</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {activeDaySpots.length === 0 ? '添加景点查看地图' : '地图预览'}
        </h3>
        <p className="text-sm text-gray-500">
          {activeDaySpots.length === 0 
            ? '从左侧景点库添加景点到当前日程' 
            : '显示第' + (activeDay + 1) + '天的景点分布'}
        </p>
      </div>
    </div>
  );

  const getSpotColor = (category: string) => {
    const colors: Record<string, string> = {
      '景点': 'bg-blue-500',
      '美食': 'bg-orange-500',
      '购物': 'bg-purple-500',
      '娱乐': 'bg-green-500',
      '文化': 'bg-red-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            第{activeDay + 1}天地图
          </h3>
          <span className="text-sm text-gray-500">
            {activeDaySpots.length}个景点
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="flex-1 relative">
        {isLoading && activeDaySpots.length > 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                <span className="text-blue-600 text-xl">🗺️</span>
              </div>
              <p className="text-gray-500">加载地图中...</p>
            </div>
          </div>
        ) : (
          activeDaySpots.length === 0 && createMapPlaceholder()
        )}
      </div>
    </div>
  );
}