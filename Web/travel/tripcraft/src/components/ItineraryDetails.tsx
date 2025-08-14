'use client';

import { useState } from 'react';
import type { Route, Spot, RouteDay } from '@/types';

interface ItineraryDetailsProps {
  route: Route;
  onRouteUpdate: (route: Route) => void;
}

export function ItineraryDetails({ route, onRouteUpdate }: ItineraryDetailsProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [notes, setNotes] = useState('');

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
  };

  const getDistance = (spot1: Spot, spot2: Spot) => {
    // 简化的距离计算，实际应用中应使用Google Maps API
    const R = 6371; // 地球半径km
    const dLat = (spot2.lat - spot1.lat) * Math.PI / 180;
    const dLon = (spot2.lng - spot1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(spot1.lat * Math.PI / 180) * Math.cos(spot2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 100) / 100; // 四舍五入到小数点后两位
  };

  const getTravelTime = (distance: number) => {
    // 假设平均速度50km/h
    const time = (distance / 50) * 60;
    return Math.round(time);
  };

  const generateGoogleMapsLink = (from: Spot, to: Spot) => {
    return `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&travelmode=driving`;
  };

  const handleAddNote = (dayIndex: number, note: string) => {
    const updatedRoute = { ...route };
    if (!updatedRoute.days[dayIndex].notes) {
      updatedRoute.days[dayIndex].notes = '';
    }
    updatedRoute.days[dayIndex].notes = note;
    onRouteUpdate(updatedRoute);
  };

  const DailyItinerary = ({ day, dayIndex }: { day: RouteDay, dayIndex: number }) => {
    const totalDuration = day.spots.reduce((sum, spot) => sum + spot.duration, 0);
    const totalDistance = day.spots.reduce((sum, spot, index) => {
      if (index === 0) return sum;
      return sum + getDistance(day.spots[index - 1], spot);
    }, 0);

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">第{dayIndex + 1}天</h3>
          <div className="text-sm text-gray-500">
            总计: {formatDuration(totalDuration)} • {totalDistance.toFixed(1)}km
          </div>
        </div>

        {day.notes && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">{day.notes}</p>
          </div>
        )}

        {day.spots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            这一天还没有安排景点
          </div>
        ) : (
          <div className="space-y-4">
            {day.spots.map((spot, index) => {
              const prevSpot = index > 0 ? day.spots[index - 1] : null;
              const distance = prevSpot ? getDistance(prevSpot, spot) : 0;
              const travelTime = prevSpot ? getTravelTime(distance) : 0;

              return (
                <div key={`${dayIndex}-${index}`}>
                  {index > 0 && (
                    <div className="flex items-center my-3 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <span>{distance.toFixed(1)}km • {formatDuration(travelTime)}车程</span>
                        <a
                          href={generateGoogleMapsLink(prevSpot!, spot)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 ml-2"
                        >
                          导航
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
                      >
                        <span className="text-blue-600 font-semibold">{index + 1}</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{spot.name}</h4>
                          {spot.address && (
                            <p className="text-sm text-gray-600">{spot.address}</p>
                          )}
                          {spot.description && (
                            <p className="text-sm text-gray-700 mt-1">{spot.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{formatDuration(spot.duration)}</div>
                          {spot.price && (
                            <div className="text-sm text-gray-600">${spot.price}</div>
                          )}
                        </div>
                      </div>

                      {spot.rating && (
                        <div className="flex items-center mt-2">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(spot.rating || 0) ? 'fill-current' : 'fill-gray-300'
                                }`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-1 text-sm text-gray-600">{spot.rating}</span>
                        </div>
                      )}

                      {spot.images && spot.images.length > 0 && (
                        <div className="flex space-x-2 mt-2">
                          {spot.images.slice(0, 3).map((img, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={img}
                              alt={`${spot.name} ${imgIndex + 1}`}
                              className="w-20 h-20 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Notes */}
        <div className="mt-4">
          <textarea
            placeholder="添加这一天的备注、提示或特殊说明..."
            value={day.notes || ''}
            onChange={(e) => handleAddNote(dayIndex, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={3}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Day Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {route.days.map((_, index) => (
          <button
            key={index}
            onClick={() => setSelectedDay(index)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedDay === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            第{index + 1}天
          </button>
        ))}
      </div>

      {/* Selected Day Details */}
      {route.days[selectedDay] && (
        <DailyItinerary day={route.days[selectedDay]} dayIndex={selectedDay} />
      )}

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">行程总结</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{route.days.length}</p>
            <p className="text-sm text-gray-600">总天数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{route.days.reduce((sum, day) => sum + day.spots.length, 0)}</p>
            <p className="text-sm text-gray-600">总景点</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {formatDuration(route.days.reduce((sum, day) => sum + day.total_duration, 0))}
            </p>
            <p className="text-sm text-gray-600">总游览时间</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {route.days.reduce((sum, day) => 
                sum + day.spots.reduce((spotSum, spot) => spotSum + (spot.price || 0), 0), 0
              )}km
            </p>
            <p className="text-sm text-gray-600">总距离</p>
          </div>
        </div>
      </div>
    </div>
  );
}