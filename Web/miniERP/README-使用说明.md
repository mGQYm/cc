# Mini ERP 系统使用说明

## 🚀 快速启动

### 一键启动
```bash
# 赋予执行权限
chmod +x start-mini-erp.sh

# 一键启动
./start-mini-erp.sh start
```

## 📡 端口配置说明

### 端口分配
- **前端端口**: `3003`
- **后端端口**: `3003`
- **架构说明**: 本系统采用单一端口架构，前端页面和后端API共用端口3003

### 端口架构详解
```
┌─────────────────────────────────────┐
│         端口 3003                    │
├─────────────────────────────────────┤
│  Express.js 服务器                   │
├─────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────┐ │
│  │  静态文件   │  │   API路由       │ │
│  │  前端页面   │  │   /api/*        │ │
│  │  /index.html│  │   /products     │ │
│  │  /css/*     │  │   /customers    │ │
│  │  /js/*      │  │   /orders       │ │
│  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────┘
```

## 🌐 访问地址

### 启动后访问地址
启动成功后会显示以下信息：

- **本地访问**: http://localhost:3003
- **局域网访问**: http://[你的局域网IP]:3003
- **公网访问**: http://[你的公网IP]:3003

### 功能页面
- **主页**: http://localhost:3003
- **产品管理**: 主页 → 产品标签页
- **客户管理**: 主页 → 客户标签页
- **订单管理**: 主页 → 订单标签页
- **库存管理**: 主页 → 库存标签页

### API接口测试
- **产品列表**: http://localhost:3003/api/products
- **客户列表**: http://localhost:3003/api/customers
- **订单列表**: http://localhost:3003/api/orders
- **库存列表**: http://localhost:3003/api/inventory

## 🔧 管理命令

### 系统管理
```bash
# 启动系统
./start-mini-erp.sh start

# 停止系统
./start-mini-erp.sh stop

# 重启系统
./start-mini-erp.sh restart

# 查看状态
./start-mini-erp.sh status
```

### 日志查看
```bash
# 实时查看日志
tail -f backend.log

# 查看最后100行日志
tail -n 100 backend.log
```

## 📊 系统架构

### 技术栈
- **后端**: Node.js + Express.js
- **前端**: HTML5 + CSS3 + JavaScript
- **数据库**: JSON文件存储
- **通信**: RESTful API

### 目录结构
```
miniERP/
├── backend/
│   ├── server.js          # 主服务器文件
│   ├── routes/            # API路由
│   │   ├── products.js    # 产品管理
│   │   ├── customers.js   # 客户管理
│   │   ├── orders.js      # 订单管理
│   │   └── inventory.js   # 库存管理
│   ├── database/          # 数据库连接
│   └── data/             # JSON数据文件
├── frontend/
│   ├── html/
│   │   └── index.html     # 主页面
│   ├── css/
│   │   └── styles.css     # 样式文件
│   └── js/
│       ├── app.js         # 主应用逻辑
│       └── i18n.js        # 国际化
├── start-mini-erp.sh      # 一键启动脚本
└── README-使用说明.md     # 本说明文档
```

## 🔍 故障排查

### 常见问题

#### 1. 端口被占用
```bash
# 检查端口占用
lsof -i :3003

# 解决方法：停止占用程序或修改端口
# 修改端口：编辑 backend/server.js 中的 PORT 值
```

#### 2. 无法远程访问
```bash
# 检查防火墙
sudo ufw allow 3003
# 或
iptables -I INPUT -p tcp --dport 3003 -j ACCEPT
```

#### 3. 服务启动失败
```bash
# 检查日志
tail -f backend.log

# 检查依赖
npm install
```

#### 4. 网络连接问题
```bash
# 测试本地访问
curl http://localhost:3003

# 测试公网IP
curl http://ifconfig.me
```

### 状态检查
```bash
# 一键状态检查
./start-mini-erp.sh status

# 手动检查
ps aux | grep node
netstat -tuln | grep 3003
curl http://localhost:3003
```

## 🛠️ 高级配置

### 修改端口
编辑 `backend/server.js`：
```javascript
const PORT = process.env.PORT || 3003;  // 修改这里
```

### 环境变量
```bash
# 使用环境变量设置端口
export PORT=8080
./start-mini-erp.sh start
```

### 自定义域名
如需使用域名访问，配置Nginx反向代理：
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📞 技术支持

### 系统要求
- Node.js 14.0 或更高版本
- npm 包管理器
- 端口3003可用

### 启动前检查
```bash
# 检查Node.js版本
node --version

# 检查npm版本
npm --version

# 检查端口
netstat -tuln | grep 3003
```

### 联系支持
如遇到问题，请提供以下信息：
1. 错误日志内容
2. 系统环境信息
3. 复现步骤

---

**启动系统**: `./start-mini-erp.sh start`