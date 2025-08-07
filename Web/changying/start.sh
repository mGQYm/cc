#!/bin/bash

echo "🚀 启动ETF长盈计划远程访问服务"
echo "================================"

# 安装依赖
echo "📦 正在安装依赖..."
npm install --silent

# 获取本机IP地址
IP=$(hostname -I | awk '{print $1}')
if [ -z "$IP" ]; then
    IP="$(ip addr show | grep -E 'inet.*eth0|inet.*enp' | awk '{print $2}' | cut -d'/' -f1 | head -n1)"
fi
if [ -z "$IP" ]; then
    IP="$(curl -s ifconfig.me 2>/dev/null || echo 'localhost')"
fi

# 设置环境变量
export NODE_ENV=production
export PORT=3000
export HOST=0.0.0.0

echo "🔧 配置信息:"
echo "   IP地址: $IP"
echo "   端口: 3000"
echo "   访问地址: http://$IP:3000"
echo ""
echo "📱 手机访问: 扫描下方二维码或直接输入地址"
echo "   http://$IP:3000"
echo ""

# 生成二维码（如果系统支持）
if command -v qrencode &> /dev/null; then
    echo "生成的二维码:"
    qrencode -t ANSI "http://$IP:3000"
else
    echo "提示: 安装qrencode可以生成二维码: sudo apt install qrencode"
fi

echo ""
echo "🎯 正在启动服务器..."
echo "按 Ctrl+C 停止服务"

# 启动服务器
node server.js