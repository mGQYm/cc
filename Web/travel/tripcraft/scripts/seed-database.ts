import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import type { Database } from '@/types';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

const seedData = {
  spots: [
    // 厦门景点
    { name: '鼓浪屿', lat: 24.4505, lng: 118.0706, address: '厦门市思明区鼓浪屿', description: '世界文化遗产，钢琴之岛', duration: 240, category: '景点', rating: 4.8, location: '厦门' },
    { name: '厦门大学', lat: 24.4356, lng: 118.0907, address: '厦门市思明区思明南路422号', description: '中国最美大学之一', duration: 120, category: '景点', rating: 4.7, location: '厦门' },
    { name: '南普陀寺', lat: 24.4390, lng: 118.0906, address: '厦门市思明区思明南路515号', description: '闽南佛教圣地', duration: 90, category: '景点', rating: 4.6, location: '厦门' },
    { name: '曾厝垵', lat: 24.4252, lng: 118.0908, address: '厦门市思明区曾厝垵', description: '文艺小吃街', duration: 180, category: '美食', rating: 4.5, location: '厦门' },
    { name: '环岛路', lat: 24.4400, lng: 118.1000, address: '厦门市思明区环岛路', description: '最美海滨大道', duration: 120, category: '景点', rating: 4.7, location: '厦门' },
    { name: '中山路步行街', lat: 24.4500, lng: 118.0800, address: '厦门市思明区中山路', description: '百年商业老街', duration: 150, category: '购物', rating: 4.4, location: '厦门' },
    { name: '沙坡尾', lat: 24.4503, lng: 118.0837, address: '厦门市思明区沙坡尾', description: '老厦门渔港', duration: 120, category: '景点', rating: 4.5, location: '厦门' },
    { name: '八市', lat: 24.4521, lng: 118.0824, address: '厦门市思明区开禾路', description: '厦门最古老菜市场', duration: 90, category: '美食', rating: 4.6, location: '厦门' },

    // 北京景点
    { name: '故宫博物院', lat: 39.9163, lng: 116.3972, address: '北京市东城区景山前街4号', description: '明清两代皇宫', duration: 300, category: '景点', rating: 4.9, location: '北京' },
    { name: '天安门广场', lat: 39.9055, lng: 116.3976, address: '北京市东城区天安门广场', description: '世界最大城市广场', duration: 60, category: '景点', rating: 4.8, location: '北京' },
    { name: '颐和园', lat: 40.0000, lng: 116.2755, address: '北京市海淀区新建宫门路19号', description: '皇家园林博物馆', duration: 240, category: '景点', rating: 4.8, location: '北京' },
    { name: '长城', lat: 40.4319, lng: 116.5704, address: '北京市怀柔区慕田峪长城', description: '世界七大奇迹之一', duration: 300, category: '景点', rating: 4.9, location: '北京' },
    { name: '天坛', lat: 39.8822, lng: 116.4107, address: '北京市东城区天坛路甲1号', description: '明清皇帝祭天场所', duration: 180, category: '景点', rating: 4.7, location: '北京' },
    { name: '王府井', lat: 39.9169, lng: 116.4189, address: '北京市东城区王府井大街', description: '北京著名商业街', duration: 120, category: '购物', rating: 4.5, location: '北京' },

    // 上海景点
    { name: '外滩', lat: 31.2401, lng: 121.4909, address: '上海市黄浦区中山东一路', description: '万国建筑博览群', duration: 120, category: '景点', rating: 4.8, location: '上海' },
    { name: '东方明珠', lat: 31.2459, lng: 121.4974, address: '上海市浦东新区世纪大道1号', description: '上海地标建筑', duration: 120, category: '景点', rating: 4.7, location: '上海' },
    { name: '豫园', lat: 31.2271, lng: 121.4921, address: '上海市黄浦区安仁街137号', description: '明代古典园林', duration: 180, category: '景点', rating: 4.6, location: '上海' },
    { name: '南京路', lat: 31.2366, lng: 121.4809, address: '上海市黄浦区南京东路', description: '中华商业第一街', duration: 150, category: '购物', rating: 4.5, location: '上海' },
    { name: '田子坊', lat: 31.2131, lng: 121.4662, address: '上海市黄浦区泰康路210弄', description: '创意艺术街区', duration: 120, category: '景点', rating: 4.4, location: '上海' },
    { name: '上海迪士尼', lat: 31.1416, lng: 121.6569, address: '上海市浦东新区申迪西路753号', description: '亚洲最大迪士尼乐园', duration: 480, category: '景点', rating: 4.7, location: '上海' },

    // 杭州景点
    { name: '西湖', lat: 30.2400, lng: 120.1500, address: '杭州市西湖区西湖', description: '人间天堂，西湖十景', duration: 240, category: '景点', rating: 4.9, location: '杭州' },
    { name: '灵隐寺', lat: 30.2450, lng: 120.1200, address: '杭州市西湖区灵隐路法云弄1号', description: '江南禅宗五山之一', duration: 120, category: '景点', rating: 4.7, location: '杭州' },
    { name: '西溪湿地', lat: 30.2700, lng: 120.0600, address: '杭州市西湖区天目山路518号', description: '城市中的天然湿地', duration: 180, category: '景点', rating: 4.6, location: '杭州' },
    { name: '河坊街', lat: 30.2400, lng: 120.1700, address: '杭州市上城区河坊街', description: '杭州历史文化街区', duration: 120, category: '购物', rating: 4.5, location: '杭州' },

    // 广州景点
    { name: '广州塔', lat: 23.1080, lng: 113.3220, address: '广州市海珠区阅江西路222号', description: '广州地标建筑小蛮腰', duration: 120, category: '景点', rating: 4.7, location: '广州' },
    { name: '陈家祠', lat: 23.1290, lng: 113.2540, address: '广州市荔湾区中山七路恩龙里34号', description: '岭南建筑艺术明珠', duration: 90, category: '景点', rating: 4.6, location: '广州' },
    { name: '沙面岛', lat: 23.1070, lng: 113.2430, address: '广州市荔湾区沙面岛', description: '欧陆风情建筑群', duration: 120, category: '景点', rating: 4.5, location: '广州' },
    { name: '上下九步行街', lat: 23.1200, lng: 113.2500, address: '广州市荔湾区上下九路', description: '广州传统商业街', duration: 150, category: '购物', rating: 4.4, location: '广州' },

    // 深圳景点
    { name: '世界之窗', lat: 22.5400, lng: 113.9700, address: '深圳市南山区深南大道9037号', description: '世界著名景观微缩模型', duration: 240, category: '景点', rating: 4.6, location: '深圳' },
    { name: '东部华侨城', lat: 22.6300, lng: 114.2900, address: '深圳市盐田区大梅沙东部华侨城', description: '生态旅游度假区', duration: 300, category: '景点', rating: 4.7, location: '深圳' },
    { name: '深圳湾公园', lat: 22.4900, lng: 114.0000, address: '深圳市南山区滨海大道', description: '海滨生态公园', duration: 120, category: '景点', rating: 4.5, location: '深圳' },
    { name: '东门老街', lat: 22.5500, lng: 114.1200, address: '深圳市罗湖区东门中路', description: '深圳传统商业街区', duration: 120, category: '购物', rating: 4.3, location: '深圳' }
  ]
};

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await supabaseAdmin.from('user_favorites').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('route_spots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('routes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('spots').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert spots
    console.log('📍 Inserting spots...');
    const { data: spotsData, error: spotsError } = await supabaseAdmin
      .from('spots')
      .insert(seedData.spots)
      .select();

    if (spotsError) {
      console.error('❌ Error inserting spots:', spotsError);
      return;
    }

    console.log(`✅ Successfully inserted ${spotsData?.length || 0} spots`);

    // Create a sample public route
    console.log('🗺️ Creating sample route...');
    const sampleRoute = {
      user_id: '00000000-0000-0000-0000-000000000000', // System user
      title: '厦门经典3日游',
      description: '精选厦门必游景点，包含鼓浪屿、厦门大学、南普陀寺等经典景点',
      location: '厦门',
      days: [
        {
          date: new Date().toISOString().split('T')[0],
          spots: spotsData?.slice(0, 3) || [],
          total_duration: 450
        },
        {
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          spots: spotsData?.slice(3, 6) || [],
          total_duration: 450
        },
        {
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          spots: spotsData?.slice(6, 8) || [],
          total_duration: 210
        }
      ],
      total_days: 3,
      interests: ['景点', '文化', '美食'],
      budget_level: 2,
      is_public: true
    };

    const { data: routeData, error: routeError } = await supabaseAdmin
      .from('routes')
      .insert(sampleRoute)
      .select();

    if (routeError) {
      console.error('❌ Error creating sample route:', routeError);
      return;
    }

    console.log('✅ Successfully created sample route');
    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
}

seedDatabase();