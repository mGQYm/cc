// Map service integration for 高德地图 (Amap)
import type { Spot, Route, MapBounds } from '@/types';

interface MapService {
  searchPlaces(query: string, location?: string): Promise<Spot[]>;
  calculateRoute(points: Spot[]): Promise<{ distance: number; duration: number }>;
  geocodeAddress(address: string): Promise<{ lat: number; lng: number }>;
}

// 高德地图配置
const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_KEY || 'placeholder_key';
const AMAP_API_URL = 'https://restapi.amap.com/v3';

export class AmapService implements MapService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || AMAP_KEY;
  }

  async searchPlaces(query: string, location?: string): Promise<Spot[]> {
    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        keywords: query,
        city: location || '',
        citylimit: 'true',
        offset: '20',
        page: '1',
        extensions: 'all',
      });

      const response = await fetch(`${AMAP_API_URL}/place/text?${params}`);
      const data = await response.json();

      if (data.status === '1' && data.pois) {
        return data.pois.map((poi: any) => ({
          id: poi.id || `poi_${Date.now()}_${Math.random()}`,
          name: poi.name,
          lat: parseFloat(poi.location.split(',')[1]),
          lng: parseFloat(poi.location.split(',')[0]),
          address: poi.address,
          description: poi.type || poi.business_area || '',
          duration: this.estimateDuration(poi.type),
          category: this.categorizePOI(poi.type),
          rating: this.parseRating(poi.biz_ext?.rating),
        }));
      }
      
      return [];
    } catch (error) {
      console.error('搜索地点失败:', error);
      return [];
    }
  }

  async calculateRoute(points: Spot[]): Promise<{ distance: number; duration: number }> {
    if (points.length < 2) {
      return { distance: 0, duration: 0 };
    }

    try {
      const waypoints = points.map(spot => `${spot.lng},${spot.lat}`).join(';');
      const params = new URLSearchParams({
        key: this.apiKey,
        origin: waypoints.split(';')[0],
        destination: waypoints.split(';')[waypoints.split(';').length - 1],
        waypoints: waypoints.split(';').slice(1, -1).join(';'),
        strategy: '10', // 最短距离
      });

      const response = await fetch(`${AMAP_API_URL}/direction/driving?${params}`);
      const data = await response.json();

      if (data.status === '1' && data.route?.paths?.[0]) {
        const path = data.route.paths[0];
        return {
          distance: parseInt(path.distance) || 0,
          duration: parseInt(path.duration) || 0,
        };
      }

      return { distance: 0, duration: 0 };
    } catch (error) {
      console.error('计算路线失败:', error);
      return { distance: 0, duration: 0 };
    }
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        address,
      });

      const response = await fetch(`${AMAP_API_URL}/geocode/geo?${params}`);
      const data = await response.json();

      if (data.status === '1' && data.geocodes?.[0]) {
        const [lng, lat] = data.geocodes[0].location.split(',').map(Number);
        return { lat, lng };
      }

      throw new Error('地址解析失败');
    } catch (error) {
      console.error('地址解析失败:', error);
      throw error;
    }
  }

  private estimateDuration(type: string): number {
    const durationMap: Record<string, number> = {
      '景点': 120,
      '美食': 60,
      '购物': 90,
      '娱乐': 180,
      '公园': 90,
      '博物馆': 150,
      '寺庙': 60,
      '大学': 60,
    };

    for (const [key, duration] of Object.entries(durationMap)) {
      if (type?.includes(key)) return duration;
    }
    return 90; // 默认90分钟
  }

  private categorizePOI(type: string): string {
    const categoryMap: Record<string, string> = {
      '景点|风景名胜|旅游景点': '景点',
      '餐厅|美食|小吃': '美食',
      '商场|购物中心|超市': '购物',
      '娱乐|酒吧|KTV': '娱乐',
      '公园|植物园|动物园': '公园',
      '博物馆|纪念馆|美术馆': '博物馆',
      '寺庙|教堂|清真寺': '寺庙',
      '大学|学院': '大学',
    };

    for (const [patterns, category] of Object.entries(categoryMap)) {
      for (const pattern of patterns.split('|')) {
        if (type?.includes(pattern)) return category;
      }
    }
    return '其他';
  }

  private parseRating(rating: string): number {
    const parsed = parseFloat(rating);
    return isNaN(parsed) ? 4.0 : Math.min(Math.max(parsed, 0), 5);
  }
}

// 高德地图组件集成
export const loadAmapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.PlaceSearch,AMap.Driving`;
    script.async = true;
    script.onerror = reject;
    script.onload = () => {
      if (window.AMap) {
        resolve();
      } else {
        reject(new Error('Failed to load AMap'));
      }
    };
    document.head.appendChild(script);
  });
};

// 声明全局变量
declare global {
  interface Window {
    AMap: any;
  }
}

// 使用示例
export const createAmapInstance = (container: HTMLElement, options: any) => {
  if (!window.AMap) {
    throw new Error('AMap SDK not loaded');
  }
  
  return new window.AMap.Map(container, {
    zoom: 13,
    center: [116.397428, 39.90923], // 默认北京
    ...options,
  });
};

// 创建标记
export const createMarker = (map: any, spot: Spot, index?: number) => {
  if (!window.AMap) return null;
  
  const marker = new window.AMap.Marker({
    position: [spot.lng, spot.lat],
    title: spot.name,
    content: index ? 
      `<div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">${index}</div>` :
      `<div class="w-6 h-6 bg-blue-600 rounded-full"></div>`,
  });
  
  marker.setMap(map);
  return marker;
};

// 创建路线
export const createRoute = (map: any, spots: Spot[]) => {
  if (!window.AMap || spots.length < 2) return null;
  
  const path = spots.map(spot => [spot.lng, spot.lat]);
  const polyline = new window.AMap.Polyline({
    path,
    strokeColor: '#3B82F6',
    strokeWeight: 4,
    strokeOpacity: 0.8,
  });
  
  polyline.setMap(map);
  return polyline;
};

// 创建信息窗体
export const createInfoWindow = (spot: Spot) => {
  if (!window.AMap) return null;
  
  return new window.AMap.InfoWindow({
    content: `
      <div class="p-3 min-w-48">
        <h3 class="font-semibold text-lg mb-1">${spot.name}</h3>
        <p class="text-sm text-gray-600 mb-1">${spot.category}</p>
        <p class="text-sm text-gray-500 mb-2">${spot.address || ''}</p>
        <p class="text-sm">${spot.description || ''}</p>
        <div class="flex items-center space-x-4 mt-2">
          <span class="text-sm text-gray-600">停留时间: ${spot.duration}分钟</span>
          ${spot.rating ? `<span class="text-sm text-yellow-600">★ ${spot.rating}</span>` : ''}
        </div>
      </div>
    `,
    offset: new window.AMap.Pixel(0, -30),
  });
};

// 默认导出实例
export const mapService = new AmapService();