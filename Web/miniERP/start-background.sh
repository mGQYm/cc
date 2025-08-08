#!/bin/bash

# =============================================================================
# Mini ERP 后台永久运行启动脚本
# =============================================================================
# 功能：确保服务在后台永久运行，即使关闭终端也不会停止
# 特点：使用nohup和disown确保进程与终端分离
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/mini-erp.pid"
LOG_FILE="$SCRIPT_DIR/mini-erp.log"
BACKUP_LOG="$SCRIPT_DIR/mini-erp-backup.log"

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# 检查服务是否运行
check_service() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        fi
    fi
    return 1
}

# 启动后台服务
start_background() {
    print_info "启动 Mini ERP 后台服务..."
    
    if check_service; then
        local pid=$(cat "$PID_FILE")
        print_info "服务已在运行，PID: $pid"
        return 0
    fi
    
    # 清理旧日志
    if [ -f "$LOG_FILE" ]; then
        cp "$LOG_FILE" "$BACKUP_LOG" 2>/dev/null || true
        > "$LOG_FILE"
    fi
    
    # 切换到脚本目录
    cd "$SCRIPT_DIR"
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        print_info "安装依赖..."
        npm install
    fi
    
    # 配置防火墙
    if command -v iptables > /dev/null 2>&1; then
        iptables -I INPUT -p tcp --dport 3003 -j ACCEPT 2>/dev/null || true
        print_info "防火墙规则已添加"
    fi
    
    # 使用nohup启动服务，确保与终端分离
    nohup node backend/server.js > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
    
    # 确保进程与终端分离
    disown $(cat "$PID_FILE") 2>/dev/null || true
    
    sleep 3
    
    if check_service; then
        print_success "后台服务启动成功！"
        
        # 获取访问信息
        local public_ip=$(curl -s --connect-timeout 3 ifconfig.me || echo "无法获取")
        local local_ip=$(hostname -I | awk '{print $1}')
        
        echo ""
        echo "=========================================="
        echo "🎉 服务已在后台永久运行！"
        echo "=========================================="
        echo "📡 端口: 3003"
        echo "🔗 访问地址:"
        echo "   本地: http://localhost:3003"
        echo "   局域网: http://$local_ip:3003"
        [ "$public_ip" != "无法获取" ] && echo "   公网: http://$public_ip:3003"
        echo ""
        echo "📊 管理命令:"
        echo "   查看状态: ./start-background.sh status"
        echo "   停止服务: ./stop-service.sh"
        echo "   查看日志: tail -f mini-erp.log"
        echo "=========================================="
        
        return 0
    else
        print_error "服务启动失败，请查看日志: $LOG_FILE"
        rm -f "$PID_FILE"
        return 1
    fi
}

# 显示状态
show_status() {
    if check_service; then
        local pid=$(cat "$PID_FILE")
        print_success "服务正在运行，PID: $pid"
        
        local public_ip=$(curl -s --connect-timeout 3 ifconfig.me || echo "无法获取")
        local local_ip=$(hostname -I | awk '{print $1}')
        
        echo "访问地址:"
        echo "  本地: http://localhost:3003"
        echo "  局域网: http://$local_ip:3003"
        [ "$public_ip" != "无法获取" ] && echo "  公网: http://$public_ip:3003"
        
        if [ -f "$LOG_FILE" ]; then
            echo "日志大小: $(du -h "$LOG_FILE" | cut -f1)"
        fi
    else
        print_info "服务未运行"
    fi
}

# 主程序
case "${1:-start}" in
    start)
        start_background
        ;;
    status)
        show_status
        ;;
    *)
        echo "使用方法: $0 {start|status}"
        echo ""
        echo "命令说明："
        echo "  start  - 启动后台服务"
        echo "  status - 查看服务状态"
        echo ""
        echo "后台运行特性："
        echo "  ✓ 关闭终端后服务继续运行"
        echo "  ✓ 自动记录PID到文件"
        echo "  ✓ 支持远程访问"
        echo "  ✓ 提供一键关闭功能"
        ;;
esac