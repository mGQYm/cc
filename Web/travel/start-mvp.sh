#!/bin/bash

# TripCraft MVP一键启动脚本
# 启动MVP并允许通过3000端口远程访问

echo "🚀 正在启动 TripCraft MVP..."
echo "📍 即将在 http://0.0.0.0:3000 启动服务"
echo "🔗 远程访问地址: http://$(hostname -I | awk '{print $1}'):3000"
echo ""

# 检查是否在正确的目录
if [ ! -d "tripcraft" ]; then
    echo "❌ 错误: 未找到 tripcraft 目录"
    echo "请确保在包含 tripcraft 目录的路径下运行此脚本"
    exit 1
fi

cd tripcraft

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 检测到首次运行，正在安装依赖..."
    npm install
fi

echo "🎯 正在启动开发服务器..."
echo "🌐 访问地址:"
echo "   - 本地: http://localhost:3000"
echo "   - 远程: http://$(hostname -I | awk '{print $1}'):3000"
echo "   - 网络: http://0.0.0.0:3000"
echo ""
echo "⏹️  按 Ctrl+C 停止服务器"
echo ""

npm run dev -- --hostname 0.0.0.0 --port 3000