# TripCraft 简化版部署指南

## 零配置快速开始

### 1. 一键创建项目
```bash
# 使用官方模板
npx create-next-app@latest tripcraft --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 进入项目目录
cd tripcraft
```

### 2. 安装核心依赖
```bash
npm install @supabase/supabase-js next-auth @next-auth/prisma-adapter prisma @prisma/client
npm install -D prisma
npm install @types/node
```

### 3. 配置环境变量
创建 `.env.local` 文件：
```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# NextAuth配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key

# 高德地图API
NEXT_PUBLIC_GAODE_KEY=your_gaode_api_key
```

### 4. 数据库初始化
```bash
# 初始化Prisma
npx prisma init

# 创建数据库表结构（复制下方schema到prisma/schema.prisma）
npx prisma db push

# 生成客户端
npx prisma generate
```

### 5. 启动开发环境
```bash
npm run dev
# 访问 http://localhost:3000
```

## 一键部署到生产

### Vercel部署
```bash
# 安装Vercel CLI
npm i -g vercel

# 一键部署
vercel --prod
```

### 自动部署（GitHub Actions）
创建 `.github/workflows/deploy.yml`：
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 数据库表结构

### Prisma Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  routes    Route[]
}

model Route {
  id        String   @id @default(cuid())
  title     String
  location  String
  days      Int
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  spots     Spot[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Spot {
  id       String @id @default(cuid())
  name     String
  address  String
  lat      Float
  lng      Float
  duration Int
  day      Int
  routeId  String
  route    Route  @relation(fields: [routeId], references: [id])
}
```

## 核心API接口

### 路线生成API
```typescript
// app/api/routes/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  const { location, days, interests } = await request.json()
  
  // 简化版：从数据库查询热门景点
  const { data: spots } = await supabase
    .from('spots')
    .select('*')
    .eq('location', location)
    .limit(days * 3)
  
  // 简单分组算法
  const routes = generateSimpleRoute(spots || [], days)
  
  return NextResponse.json({ routes })
}

function generateSimpleRoute(spots: any[], days: number) {
  const spotsPerDay = Math.ceil(spots.length / days)
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    spots: spots.slice(i * spotsPerDay, (i + 1) * spotsPerDay)
  }))
}
```

## 成本优化配置

### 免费额度最大化
- **Vercel**: 100GB流量/月免费
- **Supabase**: 500MB数据库 + 每日200MB数据库带宽免费
- **高德API**: 5000次/日免费调用
- **Cloudflare**: 免费CDN + SSL

### 使用限制
- **用户量**: 支持1000-3000日活用户
- **路线数**: 支持10000条路线存储
- **图片**: 使用免费图床或CDN缓存

## 故障排查指南

### 常见问题
1. **部署失败**: 检查环境变量配置
2. **数据库连接**: 确认Supabase URL和密钥
3. **API超限**: 监控高德API调用次数
4. **性能问题**: 检查Vercel函数执行时间

### 监控命令
```bash
# 查看Vercel日志
vercel logs

# 检查数据库连接
npx prisma db ping

# 测试API
curl -X POST http://localhost:3000/api/routes/generate \
  -H "Content-Type: application/json" \
  -d '{"location":"北京","days":3}'
```