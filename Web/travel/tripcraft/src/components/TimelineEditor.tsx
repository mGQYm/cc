'use client';

import { useState } from 'react';
import type { Route, Spot, RouteDay } from '@/types';

interface TimelineEditorProps {
  route: Route;
  activeDay: number;
  onDayChange: (day: number) => void;
  onRouteUpdate: (route: Route) => void;
  readOnly?: boolean;
}

export function TimelineEditor({ route, activeDay, onDayChange, onRouteUpdate, readOnly = false }: TimelineEditorProps) {
  const [draggedSpot, setDraggedSpot] = useState<{ dayIndex: number; spotIndex: number } | null>(null);

  const handleDragStart = (dayIndex: number, spotIndex: number) => {
    setDraggedSpot({ dayIndex, spotIndex });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetDayIndex: number, targetSpotIndex?: number) => {
    if (!draggedSpot) return;

    const updatedRoute = { ...route };
    const { dayIndex: sourceDay, spotIndex: sourceSpot } = draggedSpot;
    
    // Remove spot from source day
    const [movedSpot] = updatedRoute.days[sourceDay].spots.splice(sourceSpot, 1);
    
    // Add spot to target day
    if (targetSpotIndex !== undefined) {
      updatedRoute.days[targetDayIndex].spots.splice(targetSpotIndex, 0, movedSpot);
    } else {
      updatedRoute.days[targetDayIndex].spots.push(movedSpot);
    }

    // Update durations
    updatedRoute.days.forEach((day, index) => {
      day.total_duration = day.spots.reduce((sum, spot) => sum + spot.duration, 0);
    });

    onRouteUpdate(updatedRoute);
    setDraggedSpot(null);
  };

  const handleRemoveSpot = (dayIndex: number, spotIndex: number) => {
    const updatedRoute = { ...route };
    updatedRoute.days[dayIndex].spots.splice(spotIndex, 1);
    updatedRoute.days[dayIndex].total_duration = updatedRoute.days[dayIndex].spots.reduce(
      (sum, spot) => sum + spot.duration, 0
    );
    onRouteUpdate(updatedRoute);
  };

  const handleUpdateSpotDuration = (dayIndex: number, spotIndex: number, newDuration: number) => {
    const updatedRoute = { ...route };
    updatedRoute.days[dayIndex].spots[spotIndex].duration = newDuration;
    updatedRoute.days[dayIndex].total_duration = updatedRoute.days[dayIndex].spots.reduce(
      (sum, spot) => sum + spot.duration, 0
    );
    onRouteUpdate(updatedRoute);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
  };

  const getTotalDuration = (day: RouteDay) => {
    return day.spots.reduce((sum, spot) => sum + spot.duration, 0);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Day Tabs */}
      <div className="flex border-b bg-white">
        {route.days.map((day, index) => (
          <button
            key={index}
            onClick={() => onDayChange(index)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeDay === index
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            第{index + 1}天
            <div className="text-xs text-gray-500 mt-1">
              {getTotalDuration(day)}分钟
            </div>
          </button>
        ))}
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {route.days[activeDay]?.spots.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">📍</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              第{activeDay + 1}天还没有景点
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              从左侧景点库拖拽添加景点到这里
            </p>
            <div className="text-sm text-gray-400">
              拖拽景点到下方区域即可添加
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {route.days[activeDay]?.spots.map((spot, spotIndex) => (
              <div
                key={`${activeDay}-${spotIndex}`}
                draggable
                onDragStart={() => handleDragStart(activeDay, spotIndex)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(activeDay, spotIndex)}
                className="bg-white rounded-lg shadow-sm border p-4 cursor-move hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {spotIndex + 1}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{spot.name}</h4>
                        <p className="text-sm text-gray-500">{spot.category}</p>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveSpot(activeDay, spotIndex)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        删除
                      </button>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">停留时间:</label>
                        <select
                          value={spot.duration}
                          onChange={(e) => handleUpdateSpotDuration(activeDay, spotIndex, parseInt(e.target.value))}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value={30}>30分钟</option>
                          <option value={60}>1小时</option>
                          <option value={90}>1.5小时</option>
                          <option value={120}>2小时</option>
                          <option value={180}>3小时</option>
                          <option value={240}>4小时</option>
                          <option value={300}>5小时</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      建议时间: {formatDuration(spot.duration)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Drop zone for adding new spots */}
            <div
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(activeDay)}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 hover:border-gray-400 transition-colors"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-gray-400 text-xl">+</span>
              </div>
              <p className="text-sm">拖拽景点到这里添加</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="border-t bg-gray-50 p-4">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <span>总计时间:</span>
            <span className="font-semibold">{formatDuration(getTotalDuration(route.days[activeDay]))}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span>景点数量:</span>
            <span className="font-semibold">{route.days[activeDay]?.spots.length || 0}个</span>
          </div>
        </div>
      </div>
    </div>
  );
}