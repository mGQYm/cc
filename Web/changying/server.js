const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// 安全中间件
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", "https://api.polygon.io", "https://query1.finance.yahoo.com"]
        }
    }
}));

app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname), {
    maxAge: '1d',
    etag: true
}));

// 缓存实时数据
let marketDataCache = {
    lastUpdate: null,
    data: null
};

// 模拟实时市场数据API
function generateRealTimeData() {
    const now = new Date();
    
    return {
        csi300: {
            price: 3950 + Math.random() * 100,
            change: (Math.random() - 0.5) * 4,
            volume: Math.floor(Math.random() * 1000000),
            pe: 12.5 + Math.random() * 2,
            pb: 1.2 + Math.random() * 0.3
        },
        csi500: {
            price: 6250 + Math.random() * 150,
            change: (Math.random() - 0.5) * 5,
            volume: Math.floor(Math.random() * 800000),
            pe: 22 + Math.random() * 4,
            pb: 1.8 + Math.random() * 0.4
        },
        chinext: {
            price: 2100 + Math.random() * 80,
            change: (Math.random() - 0.5) * 6,
            volume: Math.floor(Math.random() * 600000),
            pe: 42 + Math.random() * 8,
            pb: 3.5 + Math.random() * 0.8
        },
        timestamp: now.toISOString()
    };
}

// 获取实时市场数据
async function fetchRealTimeData() {
    try {
        // 这里可以接入真实的API，如新浪财经、腾讯财经等
        // 目前使用模拟数据
        const data = generateRealTimeData();
        
        marketDataCache = {
            lastUpdate: new Date(),
            data: data
        };
        
        return data;
    } catch (error) {
        console.error('获取市场数据失败:', error);
        return generateRealTimeData(); // 降级到模拟数据
    }
}

// API路由
app.get('/api/market-data', async (req, res) => {
    try {
        let data;
        
        // 检查缓存是否有效（5分钟）
        if (marketDataCache.lastUpdate && 
            (new Date() - marketDataCache.lastUpdate) < 300000) {
            data = marketDataCache.data;
        } else {
            data = await fetchRealTimeData();
        }
        
        res.json({
            success: true,
            data: data,
            cached: marketDataCache.data === data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '获取数据失败',
            message: error.message
        });
    }
});

// 量化分析API
app.post('/api/analyze', async (req, res) => {
    try {
        const { riskTolerance, investmentHorizon, monthlyInvestment } = req.body;
        
        // 获取最新市场数据
        const marketData = await fetchRealTimeData();
        
        // 执行量化分析
        const analysis = performQuantitativeAnalysis(marketData, {
            riskTolerance: riskTolerance || 'moderate',
            investmentHorizon: investmentHorizon || 'medium',
            monthlyInvestment: monthlyInvestment || 5000
        });
        
        res.json({
            success: true,
            analysis: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '分析失败',
            message: error.message
        });
    }
});

// 量化分析逻辑
function performQuantitativeAnalysis(marketData, settings) {
    const riskFactors = {
        conservative: 0.7,
        moderate: 1.0,
        aggressive: 1.3
    };
    
    const riskFactor = riskFactors[settings.riskTolerance] || 1.0;
    
    let totalScore = 0;
    let allocations = {};
    
    // 计算各指数评分
    Object.keys(marketData).forEach(key => {
        if (key !== 'timestamp') {
            const item = marketData[key];
            
            // 估值评分（PE越低分数越高）
            let peScore = 0;
            if (key === 'csi300') peScore = Math.max(0, 100 - (item.pe - 10) * 10);
            else if (key === 'csi500') peScore = Math.max(0, 100 - (item.pe - 18) * 5);
            else peScore = Math.max(0, 100 - (item.pe - 35) * 2);
            
            // 趋势评分
            const trendScore = Math.max(0, Math.min(100, 50 + item.change * 10));
            
            // 波动率评分
            const volatilityScore = Math.max(0, 100 - Math.abs(item.change) * 5);
            
            totalScore += (peScore * 0.4 + trendScore * 0.4 + volatilityScore * 0.2);
        }
    });
    
    const finalScore = (totalScore / 3) * riskFactor;
    
    let adviceLevel, adviceDetail;
    if (finalScore >= 75) {
        adviceLevel = 'buy';
        adviceDetail = '当前市场整体估值较低，建议积极配置';
        allocations = {
            csi300: 50 * riskFactor,
            csi500: 30 * riskFactor,
            chinext: 15 * riskFactor,
            cash: Math.max(5, 100 - (50 + 30 + 15) * riskFactor)
        };
    } else if (finalScore >= 50) {
        adviceLevel = 'hold';
        adviceDetail = '市场处于平衡状态，建议稳健配置';
        allocations = {
            csi300: 35 * riskFactor,
            csi500: 25 * riskFactor,
            chinext: 15 * riskFactor,
            cash: Math.max(25, 100 - (35 + 25 + 15) * riskFactor)
        };
    } else {
        adviceLevel = 'caution';
        adviceDetail = '市场风险较高，建议谨慎配置';
        allocations = {
            csi300: 20 * riskFactor,
            csi500: 15 * riskFactor,
            chinext: 10 * riskFactor,
            cash: Math.max(55, 100 - (20 + 15 + 10) * riskFactor)
        };
    }
    
    // 确保分配比例总和为100%
    const totalAllocation = Object.values(allocations).reduce((a, b) => a + b, 0);
    Object.keys(allocations).forEach(key => {
        allocations[key] = Math.round((allocations[key] / totalAllocation) * 100);
    });
    
    return {
        score: Math.round(finalScore),
        level: adviceLevel,
        detail: adviceDetail,
        allocations: allocations,
        marketData: marketData,
        timestamp: new Date().toISOString()
    };
}

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: require('./package.json').version
    });
});

// 捕获所有路由，用于SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 错误处理
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).json({
        success: false,
        error: '服务器内部错误',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong!'
    });
});

// 定时更新数据（每分钟）
setInterval(() => {
    fetchRealTimeData().catch(console.error);
}, 60000);

// 启动服务器
app.listen(PORT, HOST, () => {
    console.log(`🚀 ETF长盈计划服务器启动成功！`);
    console.log(`📱 本地访问: http://localhost:${PORT}`);
    console.log(`🌐 网络访问: http://${require('os').networkInterfaces().eth0?.[0]?.address || '本机IP'}:${PORT}`);
    console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
    
    // 初始化数据
    fetchRealTimeData();
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到关闭信号，正在优雅关闭...');
    process.exit(0);
});

module.exports = app;