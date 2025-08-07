# ETF长盈计划 - 远程访问版

## 🚀 快速启动

### 方法一：直接启动
```bash
./start.sh
```

### 方法二：使用Node.js
```bash
npm start
```

### 方法三：使用Docker
```bash
docker-compose up -d
```

## 📱 访问地址

### 当前服务器地址：
- **本地访问**: http://localhost:3000
- **局域网访问**: http://172.26.14.29:3000

### 获取访问地址：
运行 `./start.sh` 会自动显示IP地址和二维码

## 🔧 功能特点

### ✅ 已实现功能
- **实时数据**: 模拟实时市场数据更新
- **量化策略**: 基于PE、趋势、波动率的综合评分
- **投资建议**: 买入/持有/减仓建议
- **资金配置**: 动态ETF权重分配
- **响应式设计**: 完美支持手机、平板、电脑
- **PWA支持**: 可安装为独立应用
- **离线缓存**: Service Worker支持

### 📊 支持指数
- 沪深300ETF
- 中证500ETF  
- 创业板ETF
- 货币基金配置

### 🎨 界面特色
- 现代卡片式设计
- 实时数据动画
- 深色/浅色自适应
- 触摸手势支持

## 📋 使用步骤

1. **启动服务**: `./start.sh`
2. **手机访问**: 扫描终端生成的二维码
3. **浏览器访问**: 直接输入显示的IP地址
4. **添加到主屏**: 手机浏览器"添加到主屏幕"

## 🔐 安全配置

### 防火墙开放端口
```bash
# Ubuntu/Debian
sudo ufw allow 3000

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### Nginx反向代理（可选）
```nginx
server {
    listen 80;
    server_name your-ip;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🛠️ 开发配置

### 环境变量
```bash
export PORT=3000          # 端口号
export HOST=0.0.0.0       # 监听地址
export NODE_ENV=production # 运行环境
```

### API端点
- `GET /api/market-data` - 获取实时市场数据
- `POST /api/analyze` - 获取量化分析结果
- `GET /health` - 健康检查

## 📱 移动端优化

- 支持PWA安装
- 响应式布局
- 触摸手势
- 离线缓存
- 快速启动

## 🚨 故障排除

### 端口被占用
```bash
lsof -i :3000
kill -9 [PID]
```

### 无法访问
1. 检查防火墙设置
2. 确认IP地址正确
3. 检查网络连接
4. 查看日志: `node server.js`

### 数据不更新
1. 刷新页面
2. 清除浏览器缓存
3. 检查网络连接

## 📞 支持

如有问题，请检查：
1. 服务器是否运行：`netstat -tlnp | grep :3000`
2. 防火墙是否开放端口
3. 网络连接是否正常