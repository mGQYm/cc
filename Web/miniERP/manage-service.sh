#!/bin/bash

# =============================================================================
# Mini ERP 服务综合管理脚本
# =============================================================================
# 功能：提供完整的后台服务管理功能
# 特点：支持后台永久运行、一键启停、状态监控
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/mini-erp.pid"
LOG_FILE="$SCRIPT_DIR/mini-erp.log"

# 函数：打印带颜色的信息
print_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    Mini ERP 服务管理器                      ║"
    echo "║           后台永久运行 · 一键启停 · 状态监控               ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_tip() {
    echo -e "${BLUE}[TIP]${NC} $1"
}

# 显示帮助信息
show_help() {
    print_banner
    echo ""
    echo "使用方法: $0 {start|stop|restart|status|logs|help}"
    echo ""
    echo "命令说明："
    echo "  ${GREEN}start${NC}     - 启动后台服务（永久运行）"
    echo "  ${GREEN}stop${NC}      - 停止所有相关服务"
    echo "  ${GREEN}restart${NC}   - 重启服务"
    echo "  ${GREEN}status${NC}    - 查看详细状态"
    echo "  ${GREEN}logs${NC}      - 查看实时日志"
    echo "  ${GREEN}help${NC}      - 显示此帮助信息"
    echo ""
    echo "后台运行特性："
    echo "  ✓ 关闭终端后服务继续运行"
    echo "  ✓ 自动记录PID到文件"
    echo "  ✓ 支持远程访问"
    echo "  ✓ 一键停止所有相关进程"
    echo ""
}

# 检查服务状态
check_service() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        fi
    fi
    return 1
}

# 启动服务
start_service() {
    print_banner
    print_info "启动 Mini ERP 后台服务..."
    
    if check_service; then
        local pid=$(cat "$PID_FILE")
        print_warning "服务已在运行，PID: $pid"
        $0 status
        return 0
    fi
    
    print_info "使用后台启动脚本启动服务..."
    "$SCRIPT_DIR/start-background.sh" start
}

# 停止服务
stop_service() {
    print_banner
    print_info "正在停止 Mini ERP 服务..."
    
    if ! check_service; then
        print_warning "服务未运行"
        return 0
    fi
    
    print_info "使用停止脚本关闭服务..."
    "$SCRIPT_DIR/stop-service.sh"
}

# 重启服务
restart_service() {
    print_banner
    print_info "正在重启 Mini ERP 服务..."
    
    if check_service; then
        print_info "停止当前服务..."
        "$SCRIPT_DIR/stop-service.sh"
        sleep 2
    fi
    
    print_info "启动新服务..."
    "$SCRIPT_DIR/start-background.sh" start
}

# 查看状态
show_status() {
    print_banner
    
    if check_service; then
        local pid=$(cat "$PID_FILE")
        print_success "服务正在运行"
        echo "PID: $pid"
        
        # 获取进程信息
        local process_info=$(ps -p "$pid" -o pid,ppid,cmd,etime --no-headers 2>/dev/null || echo "无法获取进程信息")
        echo "进程信息: $process_info"
        
        # 获取端口信息
        local port_info=$(ss -tuln | grep :3003 || netstat -tuln | grep :3003 || echo "端口信息不可用")
        echo "端口状态: $port_info"
        
        # 获取访问地址
        local public_ip=$(curl -s --connect-timeout 3 ifconfig.me || echo "无法获取")
        local local_ip=$(hostname -I | awk '{print $1}')
        
        echo ""
        echo "访问地址："
        echo "  🏠 本地: http://localhost:3003"
        echo "  🌐 局域网: http://$local_ip:3003"
        [ "$public_ip" != "无法获取" ] && echo "  🌍 公网: http://$public_ip:3003"
        
        # 显示日志大小
        if [ -f "$LOG_FILE" ]; then
            local log_size=$(du -h "$LOG_FILE" 2>/dev/null | cut -f1 || echo "未知")
            echo "  📊 日志大小: $log_size"
        fi
        
    else
        print_error "服务未运行"
        print_tip "使用: $0 start 启动服务"
    fi
}

# 查看日志
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        print_banner
        print_info "查看实时日志 (按 Ctrl+C 退出)..."
        echo ""
        tail -f "$LOG_FILE"
    else
        print_error "日志文件不存在"
        print_tip "先启动服务: $0 start"
    fi
}

# 快捷命令别名
quick_start() {
    echo -e "${GREEN}快速启动命令：${NC}"
    echo ""
    echo "启动后台服务: $0 start"
    echo "停止服务:     $0 stop"
    echo "查看状态:     $0 status"
    echo "查看日志:     $0 logs"
    echo ""
    echo "或直接运行："
    echo "启动: ./start-background.sh start"
    echo "停止: ./stop-service.sh"
    echo ""
}

# 主程序
main() {
    case "${1:-help}" in
        start)
            start_service
            ;;
        stop)
            stop_service
            ;;
        restart)
            restart_service
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_banner
            print_error "未知命令: $1"
            echo ""
            show_help
            ;;
    esac
}

# 处理信号
trap 'print_error "脚本被中断"; exit 1' INT TERM

# 运行主程序
main "$@" && quick_start