-- TripCraft Database Schema
-- Supabase SQL schema for travel route planning platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Routes table
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(100) NOT NULL,
  days JSONB NOT NULL DEFAULT '[]',
  total_days INTEGER NOT NULL DEFAULT 1,
  interests JSONB DEFAULT '[]',
  budget_level INTEGER CHECK (budget_level BETWEEN 1 AND 3) DEFAULT 2,
  is_public BOOLEAN DEFAULT FALSE,
  share_token VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spots table (for persistent storage)
CREATE TABLE spots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  address TEXT,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 60,
  category VARCHAR(50),
  rating DECIMAL(2, 1) CHECK (rating BETWEEN 0 AND 5),
  price DECIMAL(10, 2),
  images JSONB DEFAULT '[]',
  location VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Route spots junction table (for many-to-many relationship)
CREATE TABLE route_spots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  spot_id UUID REFERENCES spots(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(route_id, spot_id, day_number, order_index)
);

-- User favorites
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, route_id)
);

-- Indexes for performance
CREATE INDEX idx_routes_user_id ON routes(user_id);
CREATE INDEX idx_routes_location ON routes(location);
CREATE INDEX idx_routes_share_token ON routes(share_token);
CREATE INDEX idx_routes_is_public ON routes(is_public) WHERE is_public = true;
CREATE INDEX idx_routes_created_at ON routes(created_at DESC);

CREATE INDEX idx_spots_location ON spots(location);
CREATE INDEX idx_spots_category ON spots(category);
CREATE INDEX idx_spots_lat_lng ON spots(lat, lng);

CREATE INDEX idx_route_spots_route_id ON route_spots(route_id);
CREATE INDEX idx_route_spots_spot_id ON route_spots(spot_id);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_route_id ON user_favorites(route_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for routes
CREATE POLICY "Users can view public routes" ON routes
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own routes" ON routes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routes" ON routes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routes" ON routes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routes" ON routes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for spots (read-only for now)
CREATE POLICY "Anyone can view spots" ON spots
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert spots" ON spots
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for route_spots
CREATE POLICY "Users can view route spots" ON route_spots
  FOR SELECT USING (
    route_id IN (
      SELECT id FROM routes WHERE is_public = true OR user_id = auth.uid()
    )
  );

-- RLS Policies for user_favorites
CREATE POLICY "Users can view own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spots_updated_at BEFORE UPDATE ON spots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO spots (name, lat, lng, address, description, duration, category, rating, location) VALUES
  -- 厦门景点
  ('鼓浪屿', 24.4505, 118.0706, '厦门市思明区鼓浪屿', '世界文化遗产，钢琴之岛', 240, '景点', 4.8, '厦门'),
  ('厦门大学', 24.4356, 118.0907, '厦门市思明区思明南路422号', '中国最美大学之一', 120, '景点', 4.7, '厦门'),
  ('南普陀寺', 24.4390, 118.0906, '厦门市思明区思明南路515号', '闽南佛教圣地', 90, '景点', 4.6, '厦门'),
  ('曾厝垵', 24.4252, 118.0908, '厦门市思明区曾厝垵', '文艺小吃街', 180, '美食', 4.5, '厦门'),
  ('环岛路', 24.4400, 118.1000, '厦门市思明区环岛路', '最美海滨大道', 120, '景点', 4.7, '厦门'),
  ('中山路步行街', 24.4500, 118.0800, '厦门市思明区中山路', '百年商业老街', 150, '购物', 4.4, '厦门'),
  ('沙坡尾', 24.4503, 118.0837, '厦门市思明区沙坡尾', '老厦门渔港', 120, '景点', 4.5, '厦门'),
  ('八市', 24.4521, 118.0824, '厦门市思明区开禾路', '厦门最古老菜市场', 90, '美食', 4.6, '厦门'),

  -- 北京景点
  ('故宫博物院', 39.9163, 116.3972, '北京市东城区景山前街4号', '明清两代皇宫', 300, '景点', 4.9, '北京'),
  ('天安门广场', 39.9055, 116.3976, '北京市东城区天安门广场', '世界最大城市广场', 60, '景点', 4.8, '北京'),
  ('颐和园', 40.0000, 116.2755, '北京市海淀区新建宫门路19号', '皇家园林博物馆', 240, '景点', 4.8, '北京'),
  ('长城', 40.4319, 116.5704, '北京市怀柔区慕田峪长城', '世界七大奇迹之一', 300, '景点', 4.9, '北京'),
  ('天坛', 39.8822, 116.4107, '北京市东城区天坛路甲1号', '明清皇帝祭天场所', 180, '景点', 4.7, '北京'),
  ('王府井', 39.9169, 116.4189, '北京市东城区王府井大街', '北京著名商业街', 120, '购物', 4.5, '北京'),

  -- 上海景点
  ('外滩', 31.2401, 121.4909, '上海市黄浦区中山东一路', '万国建筑博览群', 120, '景点', 4.8, '上海'),
  ('东方明珠', 31.2459, 121.4974, '上海市浦东新区世纪大道1号', '上海地标建筑', 120, '景点', 4.7, '上海'),
  ('豫园', 31.2271, 121.4921, '上海市黄浦区安仁街137号', '明代古典园林', 180, '景点', 4.6, '上海'),
  ('南京路', 31.2366, 121.4809, '上海市黄浦区南京东路', '中华商业第一街', 150, '购物', 4.5, '上海'),
  ('田子坊', 31.2131, 121.4662, '上海市黄浦区泰康路210弄', '创意艺术街区', 120, '景点', 4.4, '上海'),
  ('上海迪士尼', 31.1416, 121.6569, '上海市浦东新区申迪西路753号', '亚洲最大迪士尼乐园', 480, '景点', 4.7, '上海');

-- Create function to generate share tokens
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN substring(md5(random()::text || clock_timestamp()::text) for 8);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate share tokens
CREATE OR REPLACE FUNCTION set_share_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_public = true AND NEW.share_token IS NULL THEN
    NEW.share_token := generate_share_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_share_token
  BEFORE INSERT OR UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION set_share_token();