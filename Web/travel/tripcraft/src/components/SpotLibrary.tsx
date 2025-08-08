'use client';

import { useState, useEffect } from 'react';
import type { Spot } from '@/types';

interface SpotLibraryProps {
  location: string;
  selectedSpots: string[];
  onSpotSelect: (spot: Spot) => void;
}

export function SpotLibrary({ location, selectedSpots, onSpotSelect }: SpotLibraryProps) {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [filteredSpots, setFilteredSpots] = useState<Spot[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock spots data - in production this would come from API
  const mockSpots: Record<string, Spot[]> = {
    '厦门': [
      { id: 'xm1', name: '鼓浪屿', lat: 24.4505, lng: 118.0706, duration: 240, category: '景点', rating: 4.8, description: '世界文化遗产，钢琴之岛' },
      { id: 'xm2', name: '厦门大学', lat: 24.4356, lng: 118.0907, duration: 120, category: '景点', rating: 4.7, description: '中国最美大学之一' },
      { id: 'xm3', name: '南普陀寺', lat: 24.4390, lng: 118.0906, duration: 90, category: '景点', rating: 4.6, description: '闽南佛教圣地' },
      { id: 'xm4', name: '曾厝垵', lat: 24.4252, lng: 118.0908, duration: 180, category: '美食', rating: 4.5, description: '文艺小吃街' },
      { id: 'xm5', name: '环岛路', lat: 24.4400, lng: 118.1000, duration: 120, category: '景点', rating: 4.7, description: '最美海滨大道' },
      { id: 'xm6', name: '中山路步行街', lat: 24.4500, lng: 118.0800, duration: 150, category: '购物', rating: 4.4, description: '百年商业老街' },
      { id: 'xm7', name: '沙坡尾', lat: 24.4503, lng: 118.0837, duration: 120, category: '景点', rating: 4.5, description: '老厦门渔港' },
      { id: 'xm8', name: '八市', lat: 24.4521, lng: 118.0824, duration: 90, category: '美食', rating: 4.6, description: '厦门最古老菜市场' },
    ],
    '北京': [
      { id: 'bj1', name: '故宫博物院', lat: 39.9163, lng: 116.3972, duration: 300, category: '景点', rating: 4.9, description: '明清两代皇宫' },
      { id: 'bj2', name: '天安门广场', lat: 39.9055, lng: 116.3976, duration: 60, category: '景点', rating: 4.8, description: '世界最大城市广场' },
      { id: 'bj3', name: '颐和园', lat: 40.0000, lng: 116.2755, duration: 240, category: '景点', rating: 4.8, description: '皇家园林博物馆' },
      { id: 'bj4', name: '长城', lat: 40.4319, lng: 116.5704, duration: 300, category: '景点', rating: 4.9, description: '世界七大奇迹之一' },
      { id: 'bj5', name: '天坛', lat: 39.8822, lng: 116.4107, duration: 180, category: '景点', rating: 4.7, description: '明清皇帝祭天场所' },
      { id: 'bj6', name: '王府井', lat: 39.9169, lng: 116.4189, duration: 120, category: '购物', rating: 4.5, description: '北京著名商业街' },
    ],
    '上海': [
      { id: 'sh1', name: '外滩', lat: 31.2401, lng: 121.4909, duration: 120, category: '景点', rating: 4.8, description: '万国建筑博览群' },
      { id: 'sh2', name: '东方明珠', lat: 31.2459, lng: 121.4974, duration: 120, category: '景点', rating: 4.7, description: '上海地标建筑' },
      { id: 'sh3', name: '豫园', lat: 31.2271, lng: 121.4921, duration: 180, category: '景点', rating: 4.6, description: '明代古典园林' },
      { id: 'sh4', name: '南京路', lat: 31.2366, lng: 121.4809, duration: 150, category: '购物', rating: 4.5, description: '中华商业第一街' },
      { id: 'sh5', name: '田子坊', lat: 31.2131, lng: 121.4662, duration: 120, category: '景点', rating: 4.4, description: '创意艺术街区' },
      { id: 'sh6', name: '上海迪士尼', lat: 31.1416, lng: 121.6569, duration: 480, category: '景点', rating: 4.7, description: '亚洲最大迪士尼乐园' },
    ]
  };

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const locationSpots = mockSpots[location] || mockSpots['厦门'];
      setSpots(locationSpots);
      setFilteredSpots(locationSpots);
      setIsLoading(false);
    }, 500);
  }, [location]);

  useEffect(() => {
    let filtered = spots;

    if (searchTerm) {
      filtered = filtered.filter(spot => 
        spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(spot => spot.category === selectedCategory);
    }

    setFilteredSpots(filtered);
  }, [spots, searchTerm, selectedCategory]);

  const categories = Array.from(new Set(spots.map(spot => spot.category)));

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search and Filter */}
      <div className="p-4 border-b space-y-3">
        <input
          type="text"
          placeholder="搜索景点..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">所有类别</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Spots List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSpots.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            没有找到匹配的景点
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSpots.map((spot) => {
              const isSelected = selectedSpots.includes(spot.id);
              const isDisabled = isSelected;
              
              return (
                <div
                  key={spot.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    isDisabled 
                      ? 'bg-gray-100 opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => !isDisabled && onSpotSelect(spot)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {spot.category[0]}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {spot.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-xs text-gray-500">{spot.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        {spot.category} · {spot.duration}分钟
                      </p>
                      
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {spot.description}
                      </p>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="mt-2 text-xs text-green-600">
                      ✓ 已添加到路线
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}