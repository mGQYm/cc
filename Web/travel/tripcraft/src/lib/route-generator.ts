import type { Route, RouteDay, Spot, RouteGenerationRequest } from '@/types';

// Mock spots database - in production this would come from Supabase
const MOCK_SPOTS: Record<string, Spot[]> = {
  '厦门': [
    { id: '1', name: '鼓浪屿', lat: 24.4505, lng: 118.0706, duration: 240, category: '景点', rating: 4.8, description: '世界文化遗产，钢琴之岛' },
    { id: '2', name: '厦门大学', lat: 24.4356, lng: 118.0907, duration: 120, category: '景点', rating: 4.7, description: '中国最美大学之一' },
    { id: '3', name: '南普陀寺', lat: 24.4390, lng: 118.0906, duration: 90, category: '景点', rating: 4.6, description: '闽南佛教圣地' },
    { id: '4', name: '曾厝垵', lat: 24.4252, lng: 118.0908, duration: 180, category: '美食', rating: 4.5, description: '文艺小吃街' },
    { id: '5', name: '环岛路', lat: 24.4400, lng: 118.1000, duration: 120, category: '景点', rating: 4.7, description: '最美海滨大道' },
    { id: '6', name: '中山路步行街', lat: 24.4500, lng: 118.0800, duration: 150, category: '购物', rating: 4.4, description: '百年商业老街' },
  ],
  '北京': [
    { id: '7', name: '故宫博物院', lat: 39.9163, lng: 116.3972, duration: 300, category: '景点', rating: 4.9, description: '明清两代皇宫' },
    { id: '8', name: '天安门广场', lat: 39.9055, lng: 116.3976, duration: 60, category: '景点', rating: 4.8, description: '世界最大城市广场' },
    { id: '9', name: '颐和园', lat: 40.0000, lng: 116.2755, duration: 240, category: '景点', rating: 4.8, description: '皇家园林博物馆' },
    { id: '10', name: '长城', lat: 40.4319, lng: 116.5704, duration: 300, category: '景点', rating: 4.9, description: '世界七大奇迹之一' },
    { id: '11', name: '天坛', lat: 39.8822, lng: 116.4107, duration: 180, category: '景点', rating: 4.7, description: '明清皇帝祭天场所' },
    { id: '12', name: '王府井', lat: 39.9169, lng: 116.4189, duration: 120, category: '购物', rating: 4.5, description: '北京著名商业街' },
  ],
  '上海': [
    { id: '13', name: '外滩', lat: 31.2401, lng: 121.4909, duration: 120, category: '景点', rating: 4.8, description: '万国建筑博览群' },
    { id: '14', name: '东方明珠', lat: 31.2459, lng: 121.4974, duration: 120, category: '景点', rating: 4.7, description: '上海地标建筑' },
    { id: '15', name: '豫园', lat: 31.2271, lng: 121.4921, duration: 180, category: '景点', rating: 4.6, description: '明代古典园林' },
    { id: '16', name: '南京路', lat: 31.2366, lng: 121.4809, duration: 150, category: '购物', rating: 4.5, description: '中华商业第一街' },
    { id: '17', name: '田子坊', lat: 31.2131, lng: 121.4662, duration: 120, category: '景点', rating: 4.4, description: '创意艺术街区' },
    { id: '18', name: '上海迪士尼', lat: 31.1416, lng: 121.6569, duration: 480, category: '景点', rating: 4.7, description: '亚洲最大迪士尼乐园' },
  ]
};

// Budget factors
const BUDGET_FACTORS = {
  1: { // Budget
    maxSpotsPerDay: 3,
    maxDurationPerSpot: 120,
    preferredCategories: ['景点', '美食']
  },
  2: { // Standard
    maxSpotsPerDay: 4,
    maxDurationPerSpot: 180,
    preferredCategories: ['景点', '美食', '购物']
  },
  3: { // Luxury
    maxSpotsPerDay: 5,
    maxDurationPerSpot: 240,
    preferredCategories: ['景点', '美食', '购物', '娱乐']
  }
};

export class RouteGenerator {
  static generateRoutes(request: RouteGenerationRequest): Route[] {
    const { location, days, interests, budgetLevel } = request;
    const spots = MOCK_SPOTS[location] || [];
    
    if (spots.length === 0) {
      return [this.createEmptyRoute(location, days)];
    }

    const budgetConfig = BUDGET_FACTORS[budgetLevel];
    
    // Filter spots by interests
    const filteredSpots = spots.filter(spot => 
      interests.length === 0 || interests.some(interest => 
        spot.category?.toLowerCase().includes(interest.toLowerCase()) ||
        spot.description?.toLowerCase().includes(interest.toLowerCase())
      )
    );

    if (filteredSpots.length === 0) {
      return [this.createBasicRoute(location, days, spots.slice(0, days * 2))];
    }

    // Generate 3 different route options
    const routes: Route[] = [];
    
    // Route 1: Classic tourist route
    routes.push(this.createClassicRoute(location, days, filteredSpots, budgetConfig));
    
    // Route 2: Food-focused route
    routes.push(this.createFoodRoute(location, days, filteredSpots, budgetConfig));
    
    // Route 3: Balanced route
    routes.push(this.createBalancedRoute(location, days, filteredSpots, budgetConfig));

    return routes.slice(0, 3);
  }

  private static createClassicRoute(
    location: string, 
    days: number, 
    spots: Spot[], 
    budgetConfig: any
  ): Route {
    const routeDays: RouteDay[] = [];
    const sortedSpots = [...spots].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    for (let day = 0; day < days; day++) {
      const daySpots = sortedSpots.slice(
        day * budgetConfig.maxSpotsPerDay,
        (day + 1) * budgetConfig.maxSpotsPerDay
      );
      
      routeDays.push({
        date: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        spots: daySpots,
        total_duration: daySpots.reduce((sum, spot) => sum + spot.duration, 0)
      });
    }

    return {
      id: `route_${Date.now()}_classic`,
      user_id: 'system',
      title: `${location}经典${days}日游`,
      description: `精选${location}必游景点，合理安排时间，深度体验当地文化`,
      location,
      days: routeDays,
      total_days: days,
      interests: ['景点', '文化'],
      budget_level: 2,
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  private static createFoodRoute(
    location: string, 
    days: number, 
    spots: Spot[], 
    budgetConfig: any
  ): Route {
    const routeDays: RouteDay[] = [];
    const foodSpots = spots.filter(spot => spot.category === '美食' || spot.description?.includes('美食'));
    const otherSpots = spots.filter(spot => spot.category !== '美食');
    
    for (let day = 0; day < days; day++) {
      const daySpots = [
        ...foodSpots.slice(day * 2, (day + 1) * 2),
        ...otherSpots.slice(day, day + 1)
      ].slice(0, budgetConfig.maxSpotsPerDay);
      
      routeDays.push({
        date: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        spots: daySpots,
        total_duration: daySpots.reduce((sum, spot) => sum + spot.duration, 0)
      });
    }

    return {
      id: `route_${Date.now()}_food`,
      user_id: 'system',
      title: `${location}美食${days}日游`,
      description: `品尝${location}地道美食，体验舌尖上的旅行`,
      location,
      days: routeDays,
      total_days: days,
      interests: ['美食', '文化'],
      budget_level: 2,
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  private static createBalancedRoute(
    location: string, 
    days: number, 
    spots: Spot[], 
    budgetConfig: any
  ): Route {
    const routeDays: RouteDay[] = [];
    const shuffled = [...spots].sort(() => Math.random() - 0.5);
    
    for (let day = 0; day < days; day++) {
      const daySpots = shuffled.slice(
        day * budgetConfig.maxSpotsPerDay,
        (day + 1) * budgetConfig.maxSpotsPerDay
      );
      
      routeDays.push({
        date: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        spots: daySpots,
        total_duration: daySpots.reduce((sum, spot) => sum + spot.duration, 0)
      });
    }

    return {
      id: `route_${Date.now()}_balanced`,
      user_id: 'system',
      title: `${location}精选${days}日游`,
      description: `平衡安排景点、美食、购物，轻松享受${location}之旅`,
      location,
      days: routeDays,
      total_days: days,
      interests: ['景点', '美食', '购物'],
      budget_level: 2,
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  private static createEmptyRoute(location: string, days: number): Route {
    const routeDays: RouteDay[] = [];
    
    for (let day = 0; day < days; day++) {
      routeDays.push({
        date: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        spots: [],
        total_duration: 0
      });
    }

    return {
      id: `route_${Date.now()}_empty`,
      user_id: 'system',
      title: `${location}${days}日游`,
      description: `请添加您想去的景点`,
      location,
      days: routeDays,
      total_days: days,
      interests: [],
      budget_level: 2,
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  private static createBasicRoute(location: string, days: number, spots: Spot[]): Route {
    const routeDays: RouteDay[] = [];
    
    for (let day = 0; day < days; day++) {
      const daySpots = spots.slice(day * 2, (day + 1) * 2);
      routeDays.push({
        date: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        spots: daySpots,
        total_duration: daySpots.reduce((sum, spot) => sum + spot.duration, 0)
      });
    }

    return {
      id: `route_${Date.now()}_basic`,
      user_id: 'system',
      title: `${location}基础${days}日游`,
      description: `基础${location}旅游路线`,
      location,
      days: routeDays,
      total_days: days,
      interests: ['景点'],
      budget_level: 2,
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}