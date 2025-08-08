#!/bin/bash

# Mini ERP Server启动脚本
# 使用方法: ./run-server.sh [start|stop|restart|status]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/server.pid"
LOG_FILE="$SCRIPT_DIR/server.log"

start_server() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo "服务器已经在运行，PID: $PID"
            return 1
        fi
    fi
    
    echo "启动Mini ERP服务器..."
    cd "$SCRIPT_DIR"
    nohup npm start > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    
    sleep 2
    
    if ps -p $(cat "$PID_FILE") > /dev/null 2>&1; then
        echo "✅ 服务器启动成功！"
        echo "本地访问: http://localhost:3003"
        
        # 获取公网IP
        PUBLIC_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip)
        if [ -n "$PUBLIC_IP" ]; then
            echo "远程访问: http://$PUBLIC_IP:3003"
        else
            echo "无法获取公网IP，请检查网络连接"
        fi
        
        echo "日志文件: $LOG_FILE"
    else
        echo "❌ 服务器启动失败，请查看日志: $LOG_FILE"
        rm -f "$PID_FILE"
        return 1
    fi
}

stop_server() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo "停止服务器，PID: $PID"
            kill "$PID"
            sleep 2
            
            # 确保进程已停止
            if ps -p "$PID" > /dev/null 2>&1; then
                echo "强制停止服务器..."
                kill -9 "$PID"
            fi
            
            rm -f "$PID_FILE"
            echo "✅ 服务器已停止"
        else
            echo "进程不存在，清理PID文件"
            rm -f "$PID_FILE"
        fi
    else
        echo "没有找到运行中的服务器"
    fi
}

restart_server() {
    stop_server
    sleep 1
    start_server
}

status_server() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo "✅ 服务器正在运行，PID: $PID"
            
            # 获取公网IP
            PUBLIC_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip)
            if [ -n "$PUBLIC_IP" ]; then
                echo "远程访问: http://$PUBLIC_IP:3003"
            fi
            echo "本地访问: http://localhost:3003"
        else
            echo "❌ 服务器未运行，但PID文件存在"
        fi
    else
        echo "❌ 服务器未运行"
    fi
}

case "${1:-start}" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        status_server
        ;;
    *)
        echo "使用方法: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac