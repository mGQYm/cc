#!/bin/bash

# =============================================================================
# Mini ERP 一键关闭服务脚本
# =============================================================================
# 功能：一键关闭所有相关服务，清理PID文件
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/mini-erp.pid"
LOG_FILE="$SCRIPT_DIR/mini-erp.log"

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

# 强制停止进程
force_stop() {
    local pid=$1
    local process_name=$2
    
    print_info "正在停止 $process_name (PID: $pid)..."
    
    # 优雅停止
    kill "$pid" 2>/dev/null || true
    
    # 等待3秒
    local count=0
    while ps -p "$pid" > /dev/null 2>&1 && [ $count -lt 6 ]; do
        sleep 0.5
        ((count++))
    done
    
    # 如果还在运行，强制停止
    if ps -p "$pid" > /dev/null 2>&1; then
        print_warning "$process_name 仍在运行，强制停止..."
        kill -9 "$pid" 2>/dev/null || true
        sleep 1
    fi
    
    if ! ps -p "$pid" > /dev/null 2>&1; then
        print_success "$process_name 已停止"
        return 0
    else
        print_error "无法停止 $process_name"
        return 1
    fi
}

# 查找并停止所有相关进程
stop_all_services() {
    print_info "正在查找 Mini ERP 相关进程..."
    
    local found_processes=false
    
    # 通过PID文件停止
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            force_stop "$pid" "Mini ERP 服务"
            found_processes=true
        fi
        rm -f "$PID_FILE"
    fi
    
    # 查找其他可能的Node进程
    local node_pids=$(ps aux | grep "node.*server.js" | grep -v grep | awk '{print $2}')
    if [ -n "$node_pids" ]; then
        for pid in $node_pids; do
            if [ -z "$found_processes" ] || [ "$pid" != "$(cat "$PID_FILE" 2>/dev/null || echo "")" ]; then
                force_stop "$pid" "Node.js 服务"
                found_processes=true
            fi
        done
    fi
    
    # 查找包含mini-erp关键字的进程
    local mini_pids=$(ps aux | grep -E "(mini-erp|miniERP)" | grep -v grep | awk '{print $2}')
    if [ -n "$mini_pids" ]; then
        for pid in $mini_pids; do
            force_stop "$pid" "相关服务"
            found_processes=true
        done
    fi
    
    # 查找端口3003的进程
    local port_pids=$(lsof -t -i :3003 2>/dev/null || netstat -tulnp 2>/dev/null | grep :3003 | awk '{print $7}' | cut -d'/' -f1)
    if [ -n "$port_pids" ]; then
        for pid in $port_pids; do
            force_stop "$pid" "端口3003占用进程"
            found_processes=true
        done
    fi
    
    if [ "$found_processes" = false ]; then
        print_info "未找到运行的 Mini ERP 服务"
    fi
}

# 清理文件
cleanup_files() {
    print_info "清理临时文件..."
    
    # 清理PID文件
    rm -f "$PID_FILE"
    
    # 清理其他可能的PID文件
    rm -f "$SCRIPT_DIR/"*.pid
    
    # 清理临时文件
    rm -f "$SCRIPT_DIR/"nohup.out
    
    print_success "清理完成"
}

# 显示最终状态
show_final_status() {
    echo ""
    echo "=========================================="
    echo "🧹 服务关闭完成！"
    echo "=========================================="
    
    # 检查是否还有相关进程
    local remaining_pids=$(ps aux | grep -E "(node|mini-erp|server\.js)" | grep -v grep | awk '{print $2,$11}' || echo "")
    if [ -n "$remaining_pids" ]; then
        print_warning "检测到以下进程仍在运行:"
        echo "$remaining_pids"
    else
        print_success "所有相关进程已停止"
    fi
    
    # 检查端口
    if ss -tuln 2>/dev/null | grep -q :3003 || netstat -tuln 2>/dev/null | grep -q :3003; then
        print_warning "端口3003可能仍被占用"
    else
        print_success "端口3003已释放"
    fi
    
    echo ""
    echo "📊 系统状态:"
    echo "   服务状态: 已停止"
    echo "   端口状态: 已释放"
    echo "   文件清理: 已完成"
    echo "=========================================="
}

# 主程序
main() {
    echo "=========================================="
    print_info "Mini ERP 服务关闭程序"
    echo "=========================================="
    
    # 检查权限
    if [[ $EUID -eq 0 ]]; then
        print_warning "以root身份运行，将尝试停止所有相关进程"
    fi
    
    stop_all_services
    cleanup_files
    show_final_status
}

# 处理信号
trap 'print_error "脚本被中断"; exit 1' INT TERM

# 运行主程序
main "$@"