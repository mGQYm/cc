class ETFAnalyzer {
    constructor() {
        this.settings = {
            riskTolerance: 'moderate',
            investmentHorizon: 'medium',
            monthlyInvestment: 5000
        };
        this.marketData = {};
        this.init();
    }

    init() {
        this.loadSettings();
        this.bindEvents();
        this.generateMockData();
        this.updateDisplay();
    }

    loadSettings() {
        const saved = localStorage.getItem('etf-settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            this.updateSettingsUI();
        }
    }

    saveSettings() {
        localStorage.setItem('etf-settings', JSON.stringify(this.settings));
    }

    bindEvents() {
        // 移动端触摸优化
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        const handleSwipe = () => {
            const swipeDistance = touchEndX - touchStartX;
            if (Math.abs(swipeDistance) > 50) {
                if (swipeDistance > 0) {
                    // 向右滑动 - 刷新数据
                    this.updateDisplay();
                }
            }
        };
        
        // 设置事件
        document.getElementById('risk-tolerance').addEventListener('change', (e) => {
            this.settings.riskTolerance = e.target.value;
            this.saveSettings();
        });
        
        document.getElementById('investment-horizon').addEventListener('change', (e) => {
            this.settings.investmentHorizon = e.target.value;
            this.saveSettings();
        });
        
        document.getElementById('monthly-investment').addEventListener('input', (e) => {
            this.settings.monthlyInvestment = parseInt(e.target.value) || 5000;
        });
        
        // 防止输入框被键盘遮挡
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                setTimeout(() => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
        });
    }

    updateSettingsUI() {
        document.getElementById('risk-tolerance').value = this.settings.riskTolerance;
        document.getElementById('investment-horizon').value = this.settings.investmentHorizon;
        document.getElementById('monthly-investment').value = this.settings.monthlyInvestment;
    }

    async fetchRealTimeData() {
        try {
            const response = await fetch('/api/market-data');
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            }
        } catch (error) {
            console.warn('无法获取实时数据，使用模拟数据:', error);
        }
        
        return this.generateMockData();
    }

    generateMockData() {
        const now = new Date();
        return {
            csi300: {
                price: this.generatePrice(3950, 4050),
                history: this.generateHistory(4000, 365),
                pe: this.generatePE(12, 16),
                volatility: this.generateVolatility(15, 25)
            },
            csi500: {
                price: this.generatePrice(6200, 6400),
                history: this.generateHistory(6000, 365),
                pe: this.generatePE(20, 30),
                volatility: this.generateVolatility(20, 35)
            },
            chinext: {
                price: this.generatePrice(2050, 2150),
                history: this.generateHistory(2000, 365),
                pe: this.generatePE(35, 55),
                volatility: this.generateVolatility(25, 45)
            }
        };
    }

    generatePrice(min, max) {
        return min + Math.random() * (max - min);
    }

    generateHistory(basePrice, days) {
        const history = [];
        let currentPrice = basePrice;
        const now = new Date();
        
        for (let i = days; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const change = (Math.random() - 0.5) * 0.04;
            currentPrice *= (1 + change);
            history.push({
                date: date.toISOString().split('T')[0],
                price: currentPrice
            });
        }
        return history;
    }

    generatePE(min, max) {
        return min + Math.random() * (max - min);
    }

    generateVolatility(min, max) {
        return min + Math.random() * (max - min);
    }

    calculateTechnicalIndicators() {
        const indicators = {};
        
        Object.keys(this.marketData).forEach(key => {
            const data = this.marketData[key];
            const prices = data.history.map(h => h.price);
            const currentPrice = prices[prices.length - 1];
            
            // 计算移动平均线
            const ma20 = this.calculateMA(prices, 20);
            const ma50 = this.calculateMA(prices, 50);
            
            // 计算趋势强度
            const trendStrength = (currentPrice - ma20) / ma20 * 100;
            
            // 计算估值分位数（简化版）
            const pePercentile = this.calculatePercentile(data.pe, 10, 60);
            
            indicators[key] = {
                currentPrice,
                ma20,
                ma50,
                trendStrength,
                pePercentile,
                volatility: data.volatility
            };
        });
        
        return indicators;
    }

    calculateMA(prices, period) {
        if (prices.length < period) return prices[prices.length - 1];
        const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
        return sum / period;
    }

    calculatePercentile(value, min, max) {
        return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    }

    generateInvestmentAdvice() {
        const indicators = this.calculateTechnicalIndicators();
        const riskFactor = this.getRiskFactor();
        
        let totalScore = 0;
        let maxScore = 0;
        
        Object.keys(indicators).forEach(key => {
            const item = indicators[key];
            
            // 估值得分（越低越好）
            const valuationScore = 100 - item.pePercentile;
            
            // 趋势得分
            let trendScore = 0;
            if (item.trendStrength > 2) trendScore = 80;
            else if (item.trendStrength > -2) trendScore = 50;
            else trendScore = 20;
            
            // 波动率得分
            const volatilityScore = Math.max(0, 100 - item.volatility);
            
            totalScore += (valuationScore * 0.4 + trendScore * 0.4 + volatilityScore * 0.2);
            maxScore += 100;
        });
        
        const finalScore = (totalScore / maxScore) * 100;
        
        return this.determineAdvice(finalScore, riskFactor);
    }

    getRiskFactor() {
        const riskMap = {
            conservative: 0.7,
            moderate: 1.0,
            aggressive: 1.3
        };
        return riskMap[this.settings.riskTolerance] || 1.0;
    }

    determineAdvice(score, riskFactor) {
        const adjustedScore = score * riskFactor;
        
        let level, detail, allocations;
        
        if (adjustedScore >= 75) {
            level = 'buy';
            detail = '当前市场整体估值较低，技术指标显示积极信号，建议加大投资力度。';
            allocations = {
                csi300: 50,
                csi500: 30,
                chinext: 15,
                money: 5
            };
        } else if (adjustedScore >= 50) {
            level = 'hold';
            detail = '市场处于相对平衡状态，建议维持现有仓位，继续定投策略。';
            allocations = {
                csi300: 35,
                csi500: 25,
                chinext: 15,
                money: 25
            };
        } else {
            level = 'sell';
            detail = '市场风险较高，建议降低仓位，增加现金储备，等待更好时机。';
            allocations = {
                csi300: 20,
                csi500: 15,
                chinext: 10,
                money: 55
            };
        }
        
        return { level, detail, allocations, score: adjustedScore };
    }

    calculateBacktesting() {
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 3);
        
        let portfolioValue = 100000;
        let monthlyInvestment = this.settings.monthlyInvestment;
        const monthlyReturns = [];
        
        for (let i = 0; i < 36; i++) {
            const randomReturn = (Math.random() - 0.45) * 0.08;
            portfolioValue = (portfolioValue + monthlyInvestment) * (1 + randomReturn);
            monthlyReturns.push(randomReturn);
        }
        
        const totalReturn = (portfolioValue - 100000 - monthlyInvestment * 36) / (100000 + monthlyInvestment * 36);
        const annualReturn = Math.pow(1 + totalReturn, 1/3) - 1;
        
        let maxDrawdown = 0;
        let peak = portfolioValue;
        
        monthlyReturns.forEach((ret, index) => {
            if (index > 0) {
                const currentValue = 100000 + monthlyInvestment * (index + 1);
                if (currentValue > peak) peak = currentValue;
                const drawdown = (peak - currentValue) / peak;
                maxDrawdown = Math.max(maxDrawdown, drawdown);
            }
        });
        
        const volatility = this.calculateVolatility(monthlyReturns) * Math.sqrt(12);
        const sharpeRatio = annualReturn / volatility;
        
        return {
            annualReturn: (annualReturn * 100).toFixed(1),
            maxDrawdown: (-maxDrawdown * 100).toFixed(1),
            sharpeRatio: sharpeRatio.toFixed(2)
        };
    }

    calculateVolatility(returns) {
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        return Math.sqrt(variance);
    }

    updateDisplay() {
        this.updateMarketData();
        this.updateStrategyAnalysis();
        this.updateInvestmentAdvice();
        this.updateBacktesting();
        this.updateChart();
    }

    updateMarketData() {
        const indicators = this.calculateTechnicalIndicators();
        
        Object.keys(indicators).forEach((key, index) => {
            const item = indicators[key];
            const names = ['csi300', 'csi500', 'chi-next'];
            const labels = ['沪深300', '中证500', '创业板指'];
            
            if (index < 3) {
                const priceElement = document.getElementById(names[index]);
                const changeElement = document.getElementById(`${names[index]}-change`);
                
                if (priceElement) {
                    priceElement.textContent = item.currentPrice.toFixed(2);
                }
                
                if (changeElement) {
                    const change = item.trendStrength;
                    changeElement.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
                    changeElement.className = 'change ' + (change >= 0 ? 'positive' : 'negative');
                }
            }
        });
    }

    updateStrategyAnalysis() {
        const indicators = this.calculateTechnicalIndicators();
        
        // 计算平均估值
        const avgPE = Object.values(indicators).reduce((sum, item) => sum + item.pePercentile, 0) / Object.keys(indicators).length;
        
        // 计算平均趋势强度
        const avgTrend = Object.values(indicators).reduce((sum, item) => sum + item.trendStrength, 0) / Object.keys(indicators).length;
        
        // 计算平均波动率
        const avgVolatility = Object.values(indicators).reduce((sum, item) => sum + item.volatility, 0) / Object.keys(indicators).length;
        
        document.getElementById('pe-ratio').textContent = avgPE.toFixed(1) + '%';
        document.getElementById('trend-strength').textContent = (avgTrend >= 0 ? '+' : '') + avgTrend.toFixed(1) + '%';
        document.getElementById('volatility').textContent = avgVolatility.toFixed(1) + '%';
    }

    updateInvestmentAdvice() {
        const advice = this.generateInvestmentAdvice();
        
        const levelElement = document.getElementById('advice-level');
        const detailElement = document.getElementById('advice-detail');
        
        levelElement.className = 'advice-level ' + advice.level;
        
        switch (advice.level) {
            case 'buy':
                levelElement.innerHTML = '<i class="fas fa-arrow-up"></i><span>积极买入</span>';
                break;
            case 'hold':
                levelElement.innerHTML = '<i class="fas fa-minus"></i><span>持有观望</span>';
                break;
            case 'sell':
                levelElement.innerHTML = '<i class="fas fa-arrow-down"></i><span>谨慎减仓</span>';
                break;
        }
        
        detailElement.textContent = advice.detail;
        
        // 更新配置建议
        document.getElementById('csi300-allocation').textContent = advice.allocations.csi300 + '%';
        document.getElementById('csi500-allocation').textContent = advice.allocations.csi500 + '%';
        document.getElementById('chinext-allocation').textContent = advice.allocations.chinext + '%';
        document.getElementById('money-allocation').textContent = advice.allocations.money + '%';
    }

    updateBacktesting() {
        const stats = this.calculateBacktesting();
        
        document.getElementById('annual-return').textContent = '+' + stats.annualReturn + '%';
        document.getElementById('max-drawdown').textContent = stats.maxDrawdown + '%';
        document.getElementById('sharpe-ratio').textContent = stats.sharpeRatio;
    }

    updateChart() {
        const canvas = document.getElementById('performance-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        // 绘制简化的业绩曲线
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const points = 50;
        let x = 0;
        let y = height * 0.8;
        
        ctx.moveTo(x, y);
        
        for (let i = 1; i <= points; i++) {
            x = (i / points) * width;
            const change = (Math.random() - 0.3) * 0.02;
            y = Math.max(20, Math.min(height - 20, y - change * height * 2));
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
        
        // 添加网格线
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        for (let i = 1; i < 5; i++) {
            const yPos = (i / 5) * height;
            ctx.beginPath();
            ctx.moveTo(0, yPos);
            ctx.lineTo(width, yPos);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
    }
}

// 全局函数
function updateAnalysis() {
    analyzer.generateMockData();
    analyzer.updateDisplay();
    
    // 添加动画效果
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = 'scale(1)';
        }, 150);
    });
}

function showSettings() {
    document.getElementById('settings-modal').style.display = 'block';
}

function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
}

function saveSettings() {
    analyzer.saveSettings();
    closeSettings();
    analyzer.updateDisplay();
    
    // 显示保存成功提示
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '已保存！';
    btn.style.background = '#10b981';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 1500);
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('settings-modal');
    if (event.target === modal) {
        closeSettings();
    }
}

// 初始化应用
let analyzer;
document.addEventListener('DOMContentLoaded', function() {
    analyzer = new ETFAnalyzer();
    
    // 添加触摸手势支持
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            updateAnalysis();
        }
    }
    
    // 添加PWA支持
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => console.log('SW registered'))
                .catch(registrationError => console.log('SW registration failed'));
        });
    }
});

// 离线支持
const CACHE_NAME = 'etf-analyzer-v1';
const urlsToCache = [
    '/',
    '/styles.css',
    '/etf-analyzer.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});