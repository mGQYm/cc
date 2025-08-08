# Mini ERP 后台永久运行指南

## 🎯 功能特点

✅ **后台永久运行** - 关闭终端窗口后服务继续运行  
✅ **一键管理** - 简单命令控制整个服务  
✅ **自动PID管理** - 自动记录和清理进程PID  
✅ **端口监控** - 智能检测端口占用  
✅ **日志追踪** - 实时查看运行日志  

## 🚀 快速开始

### 1. 一键启动后台服务
```bash
# 使用综合管理脚本
./manage-service.sh start

# 或使用专用后台启动脚本
./start-background.sh start
```

### 2. 一键关闭服务
```bash
# 使用综合管理脚本
./manage-service.sh stop

# 或使用专用停止脚本
./stop-service.sh
```

## 📋 管理命令

### 综合管理脚本（推荐）
```bash
./manage-service.sh start   # 启动后台服务
./manage-service.sh stop    # 停止服务
./manage-service.sh restart # 重启服务
./manage-service.sh status  # 查看详细状态
./manage-service.sh logs    # 查看实时日志
./manage-service.sh help    # 显示帮助
```

### 专用脚本
```bash
# 后台启动
./start-background.sh start

# 强制停止
./stop-service.sh
```

## 🌐 访问地址

### 启动成功后
- **公网访问**: http://47.98.48.252:3003
- **局域网访问**: http://172.26.14.29:3003
- **本地访问**: http://localhost:3003

### 功能测试
- **主页**: http://localhost:3003
- **产品API**: http://localhost:3003/api/products
- **客户API**: http://localhost:3003/api/customers
- **订单API**: http://localhost:3003/api/orders

## 🔧 后台运行原理

### 技术实现
```
终端关闭前:
┌─────────────────┐    ┌─────────────────┐
│   终端会话      │    │   Mini ERP      │
│   ./manage.sh   │───▶│   服务进程      │
│   start         │    │   PID: 12304    │
└─────────────────┘    └─────────────────┘

终端关闭后:
┌─────────────────┐    ┌─────────────────┐
│   终端会话      │    │   Mini ERP      │
│   已关闭        │    │   服务进程      │
│                 │    │   PID: 12304    │
│                 │    │   继续运行      │
└─────────────────┘    └─────────────────┘
```

### 进程管理
- **PID文件**: `mini-erp.pid` - 记录进程PID
- **日志文件**: `mini-erp.log` - 记录运行日志
- **进程分离**: 使用nohup和disown确保与终端分离

## 📊 状态监控

### 查看实时状态
```bash
./manage-service.sh status
```

### 查看实时日志
```bash
./manage-service.sh logs
```

### 手动检查
```bash
# 检查进程
ps aux | grep "node.*server.js"

# 检查端口
netstat -tuln | grep :3003

# 检查PID
cat mini-erp.pid
```

## 🛠️ 故障排查

### 常见问题

#### 1. 端口被占用
```bash
# 查看占用进程
lsof -i :3003

# 强制停止占用进程
./stop-service.sh
```

#### 2. 服务启动失败
```bash
# 查看详细日志
tail -n 50 mini-erp.log

# 重启服务
./manage-service.sh restart
```

#### 3. 无法远程访问
```bash
# 检查防火墙
sudo ufw allow 3003
# 或
iptables -I INPUT -p tcp --dport 3003 -j ACCEPT
```

### 进程管理命令
```bash
# 查看所有相关进程
ps aux | grep -E "(node|mini-erp|server\.js)"

# 强制停止所有相关进程
./stop-service.sh

# 清理所有PID文件
rm -f *.pid
```

## 📁 文件说明

| 文件 | 功能 |
|------|------|
| `manage-service.sh` | 综合管理脚本（推荐） |
| `start-background.sh` | 后台启动专用脚本 |
| `stop-service.sh` | 一键停止专用脚本 |
| `mini-erp.pid` | 进程PID记录文件 |
| `mini-erp.log` | 系统运行日志 |

## 🎯 使用流程

### 日常使用
1. **启动**: `./manage-service.sh start`
2. **查看状态**: `./manage-service.sh status`
3. **查看日志**: `./manage-service.sh logs`
4. **停止**: `./manage-service.sh stop`

### 系统维护
1. 启动后关闭终端窗口
2. 服务将在后台永久运行
3. 随时通过管理命令查看状态
4. 重启后服务自动继续运行

## 🔍 验证测试

### 测试后台运行
1. 启动服务: `./manage-service.sh start`
2. 关闭当前终端窗口
3. 重新打开新终端
4. 检查状态: `./manage-service.sh status`
5. 测试访问: `curl http://localhost:3003`

### 测试一键关闭
1. 启动服务: `./manage-service.sh start`
2. 运行: `./manage-service.sh stop`
3. 确认服务已停止

---

## ✅ 开始使用

**最简单的使用方法：**

```bash
# 启动并后台运行
./manage-service.sh start

# 随时查看状态
./manage-service.sh status

# 一键停止
./manage-service.sh stop
```

**现在你可以关闭这个终端窗口，后台服务将继续运行！**