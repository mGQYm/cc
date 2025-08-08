#!/bin/bash

echo "🔍 Mini ERP 系统状态检查"
echo "=========================="

# 检查服务器进程
echo "1. 服务器进程状态:"
if pgrep -f "node.*server.js" > /dev/null; then
    echo "✅ 服务器进程正在运行"
    
    # 获取进程信息
    PID=$(pgrep -f "node.*server.js")
    echo "   PID: $PID"
else
    echo "❌ 服务器进程未运行"
fi

# 检查端口监听
echo "2. 端口监听状态:"
if ss -tuln | grep -q ":3003"; then
    echo "✅ 端口3003正在监听"
    ss -tuln | grep ":3003"
else
    echo "❌ 端口3003未监听"
fi

# 检查本地访问
echo "3. 本地访问测试:"
if curl -s http://localhost:3003 > /dev/null; then
    echo "✅ 本地访问正常 (http://localhost:3003)"
else
    echo "❌ 本地访问失败"
fi

# 检查API访问
echo "4. API接口测试:"
if curl -s http://localhost:3003/api/products > /dev/null; then
    echo "✅ API接口正常 (http://localhost:3003/api/products)"
else
    echo "❌ API接口访问失败"
fi

# 检查公网IP
echo "5. 公网访问地址:"
PUBLIC_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip)
if [ -n "$PUBLIC_IP" ]; then
    echo "🌐 公网IP: $PUBLIC_IP"
    echo "🌐 公网访问: http://$PUBLIC_IP:3003"
else
    echo "⚠️  无法获取公网IP"
fi

echo ""
echo "📋 快速访问链接:"
echo "本地: http://localhost:3003"
[ -n "$PUBLIC_IP" ] && echo "远程: http://$PUBLIC_IP:3003"
echo "API测试: http://$PUBLIC_IP:3003/api/products"
echo ""
echo "🔧 管理命令:"
echo "停止服务器: ./run-server.sh stop"
echo "重启服务器: ./run-server.sh restart"
echo "查看状态: ./run-server.sh status"
echo "查看日志: tail -f server.log"