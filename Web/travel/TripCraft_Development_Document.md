# TripCraft 旅游线路规划平台开发文档

## 目录
- [项目概述](#项目概述)
- [用户流程图](#用户流程图)
- [界面设计规范](#界面设计规范)
- [功能模块详解](#功能模块详解)
- [技术架构方案](#技术架构方案)
- [数据模型设计](#数据模型设计)
- [核心算法说明](#核心算法说明)
- [开发里程碑](#开发里程碑)
- [部门任务清单](#部门任务清单)
- [常见问题说明](#常见问题说明)
- [文档维护](#文档维护)

---

## 项目概述
**产品名称**：TripCraft  
**核心目标**：为用户提供个性化旅游线路规划服务，支持线路编辑和社交分享功能  
**目标用户**：自由行游客、旅行规划爱好者、小团体游客  

### 核心功能矩阵
| 功能模块 | 子功能 | 说明 |
|---------|-------|------|
| 线路生成 | 需求输入 | 收集地点/天数/兴趣标签 |
|          | AI推荐 | 生成3-5条差异化线路方案 |
|          | 备选库 | 提供替换景点推荐 |
| 线路编辑 | 可视化编辑 | 拖拽式时间轴调整 |
|          | 冲突检测 | 自动校验时间/距离冲突 |
|          | 实时预览 | 地图+时间轴同步更新 |
| 分享协作 | 链接分享 | 生成可访问的静态页面 |
|          | 协作模式 | 多用户实时协作编辑 |
|          | 克隆副本 | 创建可独立编辑的副本 |

---

## 用户流程图
**用户使用旅程**：
1. 输入阶段：
   - 首页 → 输入目的地（自动补全）
   - 输入目的地 → 选择偏好（天数/兴趣标签）

2. 线路阶段：
   - 选择偏好 → 查看推荐（3张路线卡片）
   - 查看推荐 → 选择最接近需求的路线

3. 编辑阶段：
   - 选择路线 → 进入三栏式编辑器
   - 添加景点（从资源库拖拽）
   - 调整顺序（拖拽时间轴节点）
   - 删除节点（右键菜单操作）

4. 输出阶段：
   - 完成编辑 → 打开分享菜单
   - 分享选项：
     - 生成可复制链接
     - 协作邀请（输入好友邮箱）
     - 社交媒体分享（微信/微博）

---

## 界面设计规范

### 全局设计规则
- **配色方案**：
  - 主色：`#4A90E2`（科技蓝）
  - 辅色：`#50E3C2`（清新绿）
  - 警告色：`#FF6B6B`
- **字体系统**：
  - 标题：Noto Sans SC Bold 18-24px
  - 正文：Noto Sans SC Regular 14px
  - 数据：Roboto Mono 13px
- **响应式断点**：
  - 移动端：≤768px（单列布局）
  - 平板端：769-1024px（双列布局）
  - 桌面端：≥1025px（三列布局）

### 核心界面蓝图

#### 首页（需求输入页）
```
[导航区] Logo+帮助入口
[主标题] "规划你的完美旅程"
[搜索区] 智能搜索框（地点自动补全）
[偏好区]
  • 天数滑块（1-15天）
  • 兴趣标签（多选）
  • 预算选择器（经济/标准/豪华）
[推荐区] 3张路线卡片（标题+景点预览）
[页脚区] 版权声明+API证书编号
```

#### 路线编辑器
```
[操作栏] 保存/撤销/分享按钮
[三栏布局]
左栏（30%）：景点资源库
  - 分类筛选器
  - 搜索框
  - 景点预览卡片
中栏（40%）：时间轴编辑器
  - 垂直时间轴
  - 可拖拽节点
  - 节点时长调整
右栏（30%）：地图预览区
  - 交互式地图
  - 路线绘制
  - 时间标记
[状态栏] 总时长/预估花费/冲突提示
```

#### 分享面板
```
[链接分享区]
  • 短链接显示
  • 复制按钮
  • 二维码生成
[协作邀请区]
  • 邮箱输入框
  • 权限选择器（查看/编辑）
[社交媒体区]
  • 微信/微博分享按钮
  • 分享缩略图预览
```

---

## 功能模块详解

### 智能推荐系统
**工作流程**：
```python
1. 用户输入 → NLP分词 → 提取关键实体
2. 查询知识图谱 → 关联景点/POI
3. 生成路线方案：
   for theme in match_themes(query.interests):
       base_route = get_template_route(theme)
       optimized = optimize_route(base_route, query.days)
       routes.append(optimized)
   return routes[:3]  # 返回最佳3条
```

### 实时冲突检测
**检测规则**：

| 冲突类型 | 检测条件 | UI反馈 |
|----------|----------|--------|
| 时间冲突 | 计划时间 > 景点关闭时间 | 警告提示+节点抖动动画 |
| 距离冲突 | 交通时间 > 可用时间 | 路线标红+时间提示 |
| 容量冲突 | 每日景点 > 用户上限 | 状态栏警告+数量提示 |

### 协作编辑引擎
**工作流程**：
```
1. 用户A发送编辑操作(op1)
2. 服务器应用OT转换
3. 广播转换后的操作(op1')
4. 用户B更新本地状态
5. 用户B发送新操作(op2)
```

---

## 技术架构方案

### 系统架构说明（成本优化版）
```
CDN → 负载均衡器 → 应用集群
├─ Web应用（SSR） → 主数据库（读写分离）
├─ API服务 → 缓存层（Redis集群）
├─ 文件存储 → OSS对象存储
└─ 地图服务 → 混合策略（免费+付费）
```

### 优化技术栈选型

| 模块 | 技术方案 | 成本/月 | 选择理由 |
|------|----------|---------|----------|
| **前端** | Next.js 14 + TypeScript | $0 | SSR优化SEO，服务端组件减少JS包大小 |
| **地图** | Mapbox + OpenStreetMap混合 | $50-200 | 国内用高德免费额度，国外用Mapbox按需付费 |
| **后端** | Node.js + Express | $20-50 | 单实例可支撑1万DAU，避免过度微服务化 |
| **数据库** | PostgreSQL + 读写分离 | $30-80 | Supabase免费额度起步，按需升级 |
| **缓存** | Redis + CDN缓存策略 | $10-20 | Upstash Redis按请求付费，Cloudflare CDN免费层 |
| **部署** | Vercel + 阿里云函数计算 | $0-100 | 前端Vercel免费，后端按量付费 |
| **监控** | Vercel Analytics + UptimeRobot | $0-10 | 免费监控足够初期使用 |

### 安全架构方案

#### 多层安全防护
1. **CDN层防护**（Cloudflare免费版）
   - DDoS攻击防护
   - SSL/TLS加密
   - 地理位置访问控制

2. **API安全**
   - JWT Token认证（短期有效）
   - 请求频率限制（每IP每分钟100次）
   - 输入验证（Zod schema验证）

3. **数据安全**
   - 敏感数据加密存储（AES-256）
   - 用户隐私数据匿名化处理
   - 定期安全审计（每周自动化扫描）

4. **支付安全**
   - 集成第三方支付（Stripe/支付宝）
   - PCI DSS合规性检查
   - 交易日志完整记录

### API接口规范
**请求示例**：
```http
POST /api/v1/routes/generate
{
  "location": "厦门",
  "days": 3,
  "interests": ["美食", "摄影"],
  "budgetLevel": 2
}
```

**响应结构**：
```json
{
  "status": "success",
  "routes": [{
    "id": "rt_01HK",
    "title": "鼓浪屿美食探秘",
    "days": [{
      "date": "2023-10-01",
      "spots": [
        {"id": "poi_123", "name": "张三疯奶茶", "duration": 30}
      ]
    }]
  }]
}
```

---

## 数据模型设计

### 实体关系
```
用户 → 创建 → 旅游路线 (1:N)
景点 → 包含于 → 路线节点 (1:N)
```

### 数据结构表

| 表名 | 字段 | 类型 | 说明 |
|------|------|------|------|
| users | user_id | string | 主键 |
|       | email | string | 登录邮箱 |
| routes | route_id | string | 主键 |
|        | user_id | string | 外键 |
|        | title | string | 路线标题 |
| spots | spot_id | string | 主键 |
|       | name | string | 景点名称 |
|       | lat/lng | float | 地理坐标 |
| route_spots | route_id | string | 联合主键 |
|             | spot_id | string | 联合主键 |
|             | day_number | int | 所属天数 |
|             | duration | int | 停留时长(分钟) |

---

## 核心算法说明

### 路线优化算法
```python
def optimize_route(route, days):
    # 步骤1: 按地理位置聚类景点
    grouped = cluster_by_location(route.spots)
    
    # 步骤2: 构建旅行时间图
    graph = build_time_graph(grouped)
    
    # 步骤3: A*路径搜索
    path = a_star_search(graph, max_cost=days*480)
    
    # 步骤4: 按天数分割路线
    return split_by_days(path, days)
```

### 协作冲突解决算法
```javascript
function resolve_edit(op1, op2) {
  if (op1.position < op2.position) return op1;
  if (op1.type == 'insert' && op2.type == 'insert') {
    return { ...op1, position: op1.position + 1 };
  }
  if (op1.type == 'delete' && op2.type == 'insert') {
    return { 
      ...op1, 
      position: op1.position > op2.position 
               ? op1.position - 1 
               : op1.position
    };
  }
}
```

---

## 开发里程碑（优化版）

| 阶段 | 时间 | 核心目标 | 技术验证点 | 成本控制 |
|------|------|----------|------------|----------|
| **原型验证** | 第1-2周 | 单城市路线生成 | Next.js SSR性能验证 | $0（Vercel免费层） |
| **MVP开发** | 第3-4周 | 3城市+基础编辑 | 并发用户100+验证 | $20-50/月 |
| **性能优化** | 第5周 | CDN+缓存策略 | 响应时间<500ms | $30-80/月 |
| **安全加固** | 第6周 | 渗透测试+修复 | OWASP Top10检查 | 一次性成本$500 |
| **灰度上线** | 第7-8周 | 1000用户内测 | 监控告警体系 | $50-100/月 |

### 流量成本控制策略

#### 分层成本控制
1. **免费层最大化利用**
   - Cloudflare CDN：100GB/月免费
   - Vercel：100GB带宽免费
   - Supabase：500MB数据库免费
   - 高德API：每日5000次免费调用

2. **按需付费优化**
   - 图片压缩：WebP格式减少70%流量
   - 数据缓存：Redis缓存热点数据减少DB查询
   - API聚合：批量请求减少网络往返

3. **成本预警机制**
   - 每日成本监控：设置$50/日预算上限
   - 流量异常告警：异常增长时自动降级
   - 资源使用报告：每周自动生成成本分析

---

## 部门任务清单

### 美术部门
1. **设计资产清单**

| 资源类型 | 规格 | 数量 | 截止周 |
|----------|------|------|--------|
| 界面图标 | SVG | 48个 | W2 |
| 景点插图 | PNG | 50+ | W3 |
| 动效文件 | Lottie | 5套 | W4 |

2. **营销素材交付**
- 应用商店截图（6尺寸）
- 社交分享模板（3套）
- 宣传视频脚本（30s）

### 技术部门（精简版）
**全栈开发组**：
1. **第1-2周**：Next.js基础框架搭建
   - 项目初始化（create-next-app）
   - Tailwind CSS样式系统
   - TypeScript类型定义

2. **第3-4周**：核心功能开发
   - 地图组件集成（Mapbox + 高德混合）
   - 路线算法实现（贪心算法优化版）
   - 数据库设计（Supabase Schema）

3. **第5-6周**：性能与安全
   - Cloudflare CDN配置
   - Redis缓存策略
   - 安全扫描与修复

**数据运维组**：
1. **POI数据获取**（免费策略）
   - 高德API免费数据（每日5000次）
   - 大众点评爬虫（合法爬取）
   - 用户贡献数据收集

2. **数据质量控制**
   - 数据去重与清洗脚本
   - 地理位置验证（GeoJSON格式）
   - 每日增量更新机制

3. **成本控制**
   - 本地开发环境（Docker）
   - 免费云资源最大化利用
   - 按需付费资源监控

---

## 常见问题说明

### 常见问题说明（优化版）

### Q1：技术成本过高问题解决
**成本优化策略**：
- **免费资源最大化**：充分利用Vercel、Supabase、Cloudflare的免费层
- **按需付费**：使用Serverless架构，按请求付费而非固定成本
- **开源方案**：使用OpenStreetMap替代部分付费地图API
- **缓存优化**：CDN缓存减少API调用次数90%

### Q2：性能与流畅度保障
**性能优化措施**：
- **前端优化**：Next.js SSR + 图片懒加载，首屏加载<2秒
- **API优化**：接口聚合 + 缓存策略，响应时间<200ms
- **地图优化**：瓦片预加载 + 按需加载，减少50%流量
- **移动端**：PWA + 离线缓存，弱网环境仍可正常使用

### Q3：安全防护体系
**多层安全防护**：
1. **Web应用防火墙**（Cloudflare免费版）
   - SQL注入防护、XSS攻击防护
   - 自动SSL证书、HTTPS强制跳转
   - 恶意IP自动封禁

2. **API安全**
   - 限流：每用户每分钟50次请求
   - 认证：JWT + Refresh Token双令牌机制
   - 数据：敏感信息AES-256加密存储

3. **监控告警**
   - 实时错误监控（Sentry免费版）
   - 性能监控（Vercel Analytics）
   - 异常访问自动告警（邮件+短信）

### Q4：数据质量保证
**低成本数据策略**：
- **多源数据整合**：高德API + 用户贡献 + 公开数据集
- **数据清洗**：自动化脚本每日清洗重复数据
- **质量评分**：基于用户反馈的数据质量评分系统
- **增量更新**：仅更新变更数据，减少API调用

### Q5：灾难恢复方案
**低成本备份策略**：
- **数据库**：每日自动备份到阿里云OSS（成本$1/月）
- **静态资源**：CDN自动备份，无需额外成本
- **快速恢复**：10分钟内完成服务迁移
- **数据一致性**：主从数据库实时同步

---

## 技术架构扩展需求

### 高复用低耦合架构设计

#### 1. 组件化设计规范

**原子组件体系**
- **基础组件**：Button、Input、Card、Modal（零依赖，可独立使用）
- **业务组件**：RouteCard、SpotSelector、TimelineEditor（依赖基础组件）
- **页面模板**：HomeTemplate、EditorTemplate、ShareTemplate（可插拔式组合）

**组件复用标准**
```typescript
// 组件设计模式示例
interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

// 高复用组件示例
const RouteCard: FC<RouteCardProps> = ({ route, onEdit, onShare }) => {
  // 100%可复用，无业务耦合
  return (
    <Card className="route-card">
      <MapPreview coordinates={route.coordinates} />
      <RouteInfo route={route} />
      <ActionBar onEdit={onEdit} onShare={onShare} />
    </Card>
  );
};
```

#### 2. 模块解耦架构

**分层架构模式**
```
展示层（Next.js Pages）
├── 页面路由（/pages）
├── 布局组件（/layouts）
└── 页面模板（/templates）

业务层（Hooks & Services）
├── 自定义Hooks（/hooks）
├── API服务（/services）
├── 状态管理（/store）
└── 工具函数（/utils）

数据层（Supabase）
├── 数据库Schema（/db/schema）
├── 类型定义（/types）
└── 数据验证（/validators）
```

**依赖注入模式**
```typescript
// 服务抽象接口
interface MapService {
  searchPlaces(query: string): Promise<Place[]>;
  calculateRoute(points: Point[]): Promise<Route>;
}

// 高德地图实现
class AMapService implements MapService {
  // 具体实现
}

// Mapbox实现
class MapboxService implements MapService {
  // 具体实现
}

// 使用处通过配置注入
const mapService = process.env.MAP_PROVIDER === 'gaode' 
  ? new AMapService() 
  : new MapboxService();
```

#### 3. 快速迭代框架

**功能模块插件化**
```typescript
// 插件接口定义
interface PluginConfig {
  name: string;
  version: string;
  dependencies?: string[];
  activate: () => void;
  deactivate: () => void;
}

// 新功能开发模板
export const weatherPlugin: PluginConfig = {
  name: 'weather-integration',
  version: '1.0.0',
  dependencies: ['map-service'],
  activate: () => {
    // 注册天气组件
    registerComponent('WeatherWidget', WeatherWidget);
    // 添加到路由卡片
    enhanceRouteCard('weather-info', WeatherInfo);
  },
  deactivate: () => {
    // 清理资源
    unregisterComponent('WeatherWidget');
  }
};
```

**零配置页面生成器**
```typescript
// 页面配置驱动开发
interface PageConfig {
  path: string;
  title: string;
  layout: string;
  components: ComponentConfig[];
  dataSources: DataSourceConfig[];
}

// 快速创建新页面
const newPage: PageConfig = {
  path: '/hotels',
  title: '酒店预订',
  layout: 'search-layout',
  components: [
    { type: 'search-bar', props: { placeholder: '搜索酒店' } },
    { type: 'filter-panel', props: { filters: ['price', 'rating', 'distance'] } },
    { type: 'result-list', props: { itemType: 'hotel-card' } }
  ],
  dataSources: [
    { type: 'hotel-search', endpoint: '/api/hotels/search' }
  ]
};
```

### 4. 代码生成器规范

**CLI工具链**
```bash
# 生成新页面
npm run generate:page --name=hotels --template=search

# 生成新组件
npm run generate:component --name=HotelCard --type=business

# 生成新服务
npm run generate:service --name=hotel --methods=search,book

# 生成功能模块
npm run generate:feature --name=weather-plugin
```

**模板系统**
```
src/templates/
├── page-templates/
│   ├── search-template.ts      # 搜索类页面模板
│   ├── detail-template.ts      # 详情类页面模板
│   └── form-template.ts        # 表单类页面模板
├── component-templates/
│   ├── card-template.tsx       # 卡片组件模板
│   ├── list-template.tsx       # 列表组件模板
│   └── form-template.tsx       # 表单组件模板
└── service-templates/
    ├── crud-service.ts         # CRUD服务模板
    ├── search-service.ts       # 搜索服务模板
    └── cache-service.ts        # 缓存服务模板
```

### 5. 设计系统复用

**原子化设计token**
```css
:root {
  /* 颜色系统 */
  --color-primary: #4A90E2;
  --color-secondary: #50E3C2;
  --color-danger: #FF6B6B;
  
  /* 间距系统 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  
  /* 圆角系统 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* 阴影系统 */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
}
```

**可组合样式系统**
```typescript
// 样式工具函数
export const composeStyles = (...styles: CSSProperties[]): CSSProperties => 
  styles.reduce((acc, style) => ({ ...acc, ...style }), {});

// 预设样式组合
export const cardStyles = composeStyles(
  { borderRadius: 'var(--radius-md)' },
  { boxShadow: 'var(--shadow-sm)' },
  { padding: 'var(--space-md)' }
);
```

### 6. 测试策略

**分层测试金字塔**
```
单元测试（80%）
├── 组件测试：@testing-library/react
├── Hooks测试：@testing-library/react-hooks
├── 工具函数：Jest
└── API服务：MSW(Mock Service Worker)

集成测试（15%）
├── 页面流测试：Playwright
├── 用户交互测试：Cypress
└── 跨浏览器测试：BrowserStack

端到端测试（5%）
├── 关键用户路径：Playwright
├── 性能测试：Lighthouse CI
└── 可访问性测试：axe-core
```

**测试模板生成**
```typescript
// 自动生成测试文件
// 组件测试模板
import { render } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('should render correctly', () => {
    const { container } = render(<${componentName} {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });
});
```

### 7. 部署与扩展

**环境一致性**
```dockerfile
# 开发环境
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# 生产环境
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/.next /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**CI/CD流水线**
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 流量压力应对方案

### 用户量分级架构设计

#### 1. 四级用户量架构演进

| 用户量级 | 日活(DAU) | 月成本 | 技术方案 | 响应时间 | 可用性 |
|----------|-----------|---------|----------|----------|---------|
| **种子期** | 0-100 | $0-20 | Vercel免费层 | <2s | 99.9% |
| **启动期** | 100-1K | $20-100 | Vercel Pro + Supabase | <1s | 99.9% |
| **成长期** | 1K-10K | $100-500 | 多CDN + 读写分离 | <500ms | 99.95% |
| **爆发期** | 10K-100K | $500-2000 | 微服务 + 分布式 | <200ms | 99.99% |

#### 2. 自动扩缩容策略

**Serverless自动扩缩容**
```typescript
// Vercel函数配置
export const config = {
  runtime: 'edge',
  regions: ['hkg1', 'sin1', 'nrt1'], // 亚太区域
  maxDuration: 30, // 最长执行时间
  memory: 1024, // 内存配置
};

// 自适应缓存策略
const cacheStrategy = {
  static: {
    '/*': { swr: 86400, ttl: 31536000 }, // 静态资源缓存1年
    '/api/*': { swr: 300, ttl: 3600 }, // API缓存1小时
  },
  dynamic: {
    '/routes/*': { swr: 60, ttl: 300 }, // 动态路由缓存5分钟
  }
};
```

**数据库扩容方案**
```sql
-- 读写分离配置（Supabase）
-- 主库：写操作 + 实时查询
-- 从库：读操作 + 报表查询

-- 分区表设计
CREATE TABLE routes_2024_01 PARTITION OF routes 
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- 索引优化
CREATE INDEX idx_routes_user_location ON routes(user_id, location);
CREATE INDEX idx_routes_created_at ON routes(created_at DESC);
```

#### 3. 缓存层级策略

**多级缓存架构**
```
用户请求 → CDN缓存 → 边缘计算 → 应用缓存 → 数据库
    ↓        ↓         ↓         ↓         ↓
  95%命中   3%处理   1.5%计算   0.4%查询   0.1%写入
```

**Redis缓存策略**
```typescript
// 缓存键设计
const CACHE_KEYS = {
  // 热点数据缓存5分钟
  HOT_ROUTES: 'hot:routes',
  // 用户数据缓存30分钟
  USER_ROUTES: (userId: string) => `user:${userId}:routes`,
  // 地点数据缓存1小时
  LOCATION_DATA: (location: string) => `loc:${location}:data`,
  // 搜索结果缓存10分钟
  SEARCH_RESULTS: (query: string) => `search:${md5(query)}`,
};

// 缓存预热机制
export const warmCache = async () => {
  const popularLocations = ['北京', '上海', '广州', '深圳', '杭州'];
  const promises = popularLocations.map(location => 
    prefetchLocationData(location)
  );
  await Promise.all(promises);
};
```

#### 4. 流量削峰方案

**消息队列缓冲**
```typescript
// 使用Redis Stream作为消息队列
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// 路线计算请求队列
export const routeCalculationQueue = {
  async add(data: RouteCalculationRequest) {
    return redis.xadd('route:calculation', '*', 
      'userId', data.userId,
      'locations', JSON.stringify(data.locations),
      'preferences', JSON.stringify(data.preferences)
    );
  },
  
  async process(batchSize: number = 10) {
    const results = await redis.xread('COUNT', batchSize, 'STREAMS', 'route:calculation', '0');
    return results?.[0]?.[1] || [];
  }
};
```

**限流与降级**
```typescript
// 基于用户等级的限流策略
const rateLimits = {
  free: { requests: 10, window: 60000 }, // 免费用户：每分钟10次
  premium: { requests: 100, window: 60000 }, // 付费用户：每分钟100次
  admin: { requests: 1000, window: 60000 }, // 管理员：每分钟1000次
};

// 服务降级策略
const degradationStrategy = {
  // CPU使用率>80%时
  highCpu: {
    disable: ['realTimeCollaboration', 'aiRecommendations'],
    cacheOnly: ['mapTiles', 'staticAssets'],
    simplified: ['routeCalculation'],
  },
  
  // 内存使用率>90%时
  highMemory: {
    disable: ['imageProcessing', 'fileUploads'],
    compress: ['apiResponses', 'staticAssets'],
  },
};
```

#### 5. 监控与告警体系

**实时监控指标**
```typescript
// 关键指标监控
const metrics = {
  // 系统指标
  responseTime: new Histogram('http_request_duration_seconds'),
  requestRate: new Counter('http_requests_total'),
  errorRate: new Counter('http_errors_total'),
  
  // 业务指标
  activeUsers: new Gauge('active_users'),
  routeCalculations: new Counter('route_calculations_total'),
  cacheHitRate: new Gauge('cache_hit_rate'),
  
  // 成本指标
  apiCalls: new Counter('api_calls_total'),
  bandwidthUsage: new Counter('bandwidth_bytes_total'),
};
```

**智能告警规则**
```yaml
# 告警规则配置
groups:
  - name: system_alerts
    rules:
      - alert: HighResponseTime
        expr: http_request_duration_seconds{quantile="0.95"} > 2
        for: 2m
        annotations:
          summary: "95%响应时间超过2秒"
          
      - alert: HighErrorRate
        expr: rate(http_errors_total[5m]) > 0.1
        for: 1m
        annotations:
          summary: "错误率超过10%"
          
      - alert: CacheHitRateLow
        expr: cache_hit_rate < 0.8
        for: 5m
        annotations:
          summary: "缓存命中率低于80%"
```

#### 6. 应急扩容预案

**一键扩容脚本**
```bash
#!/bin/bash
# 应急扩容脚本
# 使用场景：流量突然增长>300%

# 1. 升级Vercel配置
vercel scale tripcraft.app auto --min 2 --max 20

# 2. 启用备用CDN
cloudflare load-balancer enable backup-cdn

# 3. 数据库读写分离
supabase enable-read-replicas --regions hkg1,sin1,nrt1

# 4. 缓存预热
npm run cache:warm --regions=all

echo "扩容完成，预计2分钟内生效"
```

**流量分流策略**
```typescript
// 基于地理位置的流量分流
const trafficDistribution = {
  china: {
    primary: 'aliyun-cdn',
    backup: 'tencent-cdn',
    fallback: 'cloudflare',
  },
  apac: {
    primary: 'cloudflare',
    backup: 'aws-cloudfront',
  },
  global: {
    primary: 'cloudflare',
    backup: 'aws-cloudfront',
  },
};

// 动态流量切换
export const switchTraffic = async (region: string, load: number) => {
  if (load > 0.8) {
    await enableBackupCDN(region);
    await scaleUp(region);
  }
};
```

#### 7. 成本优化策略

**按需付费优化**
```typescript
// 智能成本控制
const costOptimization = {
  // 非工作时间降级
  offHours: {
    schedule: '0 22 * * *', // 每晚10点
    actions: [
      'scaleDownCompute()',
      'reduceCacheTTL()',
      'disableNonCriticalFeatures()',
    ],
  },
  
  // 流量预测与预扩容
  predictiveScaling: {
    enabled: true,
    model: 'linear_regression',
    forecastDays: 7,
    confidence: 0.85,
  },
  
  // 成本预警
  budgetAlerts: {
    daily: 50,
    weekly: 300,
    monthly: 1000,
  },
};
```

#### 8. 性能测试基准

**压力测试场景**
```typescript
// 测试配置
const loadTestScenarios = {
  // 日常负载
  normal: {
    users: 1000,
    duration: '10m',
    rampUp: '2m',
  },
  
  // 峰值负载
  peak: {
    users: 10000,
    duration: '1h',
    rampUp: '5m',
  },
  
  // 极限测试
  stress: {
    users: 50000,
    duration: '30m',
    rampUp: '10m',
  },
};

// 基准测试指标
const performanceBenchmarks = {
  responseTime: {
    p95: '<500ms',
    p99: '<2s',
    max: '<5s',
  },
  throughput: {
    rps: 1000,
    concurrent: 10000,
  },
  errorRate: '<0.1%',
};
```

---

## 文档维护
- **版本控制**：v2.0.0-optimized（2024-01-15）
- **更新规则**：
  - 架构变更：24小时内更新
  - 组件新增：12小时内更新文档
  - 安全更新：即时更新
- **文档类型**：
  - 开发文档（本文件）
  - 组件文档：/docs/components
  - API文档：/docs/api
  - 部署文档：/docs/deployment
- **自动化维护**：
  - 代码变更自动触发文档更新
  - API变更自动生成OpenAPI文档
  - 组件变更自动更新Storybook