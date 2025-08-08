#!/bin/bash

# =============================================================================
# Mini ERP 一键启动脚本
# =============================================================================
# 功能：一键启动前后端服务，确保远程可访问
# 端口说明：
#   - 前端端口：3003 (与后端共用，通过Express静态文件服务)
#   - 后端端口：3003 (API接口，RESTful服务)
#   - 注意：本系统使用单一端口3003，前端页面和API接口都通过此端口访问
# =============================================================================

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=3003
BACKEND_PID_FILE="$SCRIPT_DIR/backend.pid"
BACKEND_LOG="$SCRIPT_DIR/backend.log"

# 函数：打印带颜色的信息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# 函数：检查端口占用
check_port() {
    local port=$1
    if ss -tuln | grep -q ":$port "; then
        print_warning "端口 $port 已被占用"
        return 1
    fi
    return 0
}

# 函数：获取公网IP
get_public_ip() {
    local ip=$(curl -s --connect-timeout 5 ifconfig.me || curl -s --connect-timeout 5 ipinfo.io/ip)
    if [ -n "$ip" ]; then
        echo "$ip"
    else
        echo "无法获取公网IP"
    fi
}

# 函数：获取本地IP
get_local_ip() {
    local ip=$(hostname -I | awk '{print $1}')
    echo "$ip"
}

# 函数：配置防火墙
setup_firewall() {
    print_info "配置防火墙..."
    
    # 检查是否有iptables
    if command -v iptables > /dev/null 2>&1; then
        # 允许端口访问
        iptables -I INPUT -p tcp --dport $BACKEND_PORT -j ACCEPT 2>/dev/null || true
        print_success "防火墙规则已添加"
    else
        print_warning "未检测到iptables，请手动配置防火墙"
    fi
}

# 函数：启动后端服务
start_backend() {
    print_info "启动后端服务..."
    
    # 检查目录
    if [ ! -d "$SCRIPT_DIR/backend" ]; then
        print_error "找不到backend目录，请确保在正确的目录下运行"
        exit 1
    fi
    
    # 检查依赖
    if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
        print_info "检测到缺少依赖，正在安装..."
        npm install
    fi
    
    # 检查端口
    if ! check_port $BACKEND_PORT; then
        print_error "端口 $BACKEND_PORT 被占用，请检查是否有其他服务运行"
        exit 1
    fi
    
    # 启动后端
    cd "$SCRIPT_DIR"
    nohup node backend/server.js > "$BACKEND_LOG" 2>&1 &
echo $! > "$BACKEND_PID_FILE"
    
    sleep 3
    
    # 验证后端是否启动成功
    if ps -p $(cat "$BACKEND_PID_FILE") > /dev/null 2>&1; then
        print_success "后端服务启动成功 (PID: $(cat $BACKEND_PID_FILE))"
    else
        print_error "后端服务启动失败"
        exit 1
    fi
}

# 函数：检查服务状态
check_services() {
    print_info "检查服务状态..."
    
    sleep 2
    
    # 检查后端
    if curl -s http://localhost:$BACKEND_PORT > /dev/null 2>&1; then
        print_success "后端服务运行正常"
    else
        print_error "后端服务检查失败"
        return 1
    fi
    
    # 检查API
    if curl -s http://localhost:$BACKEND_PORT/api/products > /dev/null 2>&1; then
        print_success "API接口运行正常"
    else
        print_warning "API接口检查失败"
    fi
}

# 函数：显示访问信息
show_access_info() {
    echo ""
    echo "=========================================="
    echo "🎉 Mini ERP 系统启动成功！"
    echo "=========================================="
    echo ""
    
    local public_ip=$(get_public_ip)
    local local_ip=$(get_local_ip)
    
    echo "📡 端口配置："
    echo "   前端服务端口: $BACKEND_PORT"
    echo "   后端API端口: $BACKEND_PORT"
    echo "   说明: 本系统使用单一端口，前端页面和API接口共用"
    echo ""
    
    echo "🌐 访问地址："
    echo "   本地访问: http://localhost:$BACKEND_PORT"
    echo "   局域网访问: http://$local_ip:$BACKEND_PORT"
    
    if [[ "$public_ip" != "无法获取公网IP" ]]; then
        echo "   公网访问: http://$public_ip:$BACKEND_PORT"
    else
        echo "   公网IP: 无法获取（请检查网络连接）"
    fi
    echo ""
    
    echo "🔗 功能测试链接："
    echo "   主页: http://localhost:$BACKEND_PORT"
    echo "   产品API: http://localhost:$BACKEND_PORT/api/products"
    echo "   客户API: http://localhost:$BACKEND_PORT/api/customers"
    echo "   订单API: http://localhost:$BACKEND_PORT/api/orders"
    echo "   库存API: http://localhost:$BACKEND_PORT/api/inventory"
    echo ""
    
    echo "📊 管理命令："
    echo "   查看日志: tail -f $BACKEND_LOG"
    echo "   停止服务: ./start-mini-erp.sh stop"
    echo "   重启服务: ./start-mini-erp.sh restart"
    echo ""
}

# 函数：停止服务
stop_services() {
    print_info "停止所有服务..."
    
    # 停止后端
    if [ -f "$BACKEND_PID_FILE" ]; then
        local pid=$(cat "$BACKEND_PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            kill "$pid"
            print_success "后端服务已停止"
        fi
        rm -f "$BACKEND_PID_FILE"
    fi
}

# 函数：重启服务
restart_services() {
    print_info "重启所有服务..."
    stop_services
    sleep 2
    start_backend
    check_services
    show_access_info
}

# 主程序
main() {
    case "${1:-start}" in
        start)
            print_info "开始启动 Mini ERP 系统..."
            echo "=========================================="
            
            setup_firewall
            start_backend
            check_services
            show_access_info
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        status)
            print_info "系统状态检查..."
            check_services
            ;;
        *)
            echo "使用方法: $0 {start|stop|restart|status}"
            echo ""
            echo "命令说明："
            echo "  start   - 一键启动前后端服务"
            echo "  stop    - 停止所有服务"
            echo "  restart - 重启所有服务"
            echo "  status  - 检查服务状态"
            exit 1
            ;;
    esac
}

# 运行主程序
main "$@"