Page({
  data: {
    todaySales: 0,
    totalProducts: 0,
    totalCustomers: 0,
    todayOrders: 0,
    monthlySales: 0,
    monthlyOrders: 0,
    newCustomers: 0,
    selectedMonth: '',
    chartData: []
  },

  onLoad: function () {
    this.setCurrentMonth();
    this.loadReportData();
  },

  onShow: function () {
    this.loadReportData();
  },

  setCurrentMonth: function() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    this.setData({
      selectedMonth: `${year}-${month}`
    });
  },

  loadReportData: function() {
    // 模拟加载报表数据
    const mockData = {
      todaySales: 1250.50,
      totalProducts: 42,
      totalCustomers: 28,
      todayOrders: 8,
      monthlySales: 15680.75,
      monthlyOrders: 125,
      newCustomers: 12,
      chartData: [
        { day: '1', sales: 450 },
        { day: '5', sales: 620 },
        { day: '10', sales: 380 },
        { day: '15', sales: 890 },
        { day: '20', sales: 1200 },
        { day: '25', sales: 750 },
        { day: '30', sales: 980 }
      ]
    };

    this.setData(mockData);
    this.drawChart();
  },

  onDateChange: function(e) {
    this.setData({
      selectedMonth: e.detail.value
    });
    this.loadReportData();
  },

  drawChart: function() {
    const ctx = wx.createCanvasContext('salesChart');
    const data = this.data.chartData;
    
    if (!data || data.length === 0) return;

    // 图表配置
    const canvasWidth = 350;
    const canvasHeight = 200;
    const padding = 40;
    const chartWidth = canvasWidth - 2 * padding;
    const chartHeight = canvasHeight - 2 * padding;

    // 清空画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 绘制背景
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 计算最大值
    const maxValue = Math.max(...data.map(item => item.sales));
    const minValue = Math.min(...data.map(item => item.sales));

    // 绘制坐标轴
    ctx.setStrokeStyle('#e0e0e0');
    ctx.setLineWidth(1);
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvasHeight - padding);
    ctx.lineTo(canvasWidth - padding, canvasHeight - padding);
    ctx.stroke();

    // 绘制数据线
    ctx.setStrokeStyle('#1976D2');
    ctx.setLineWidth(2);
    ctx.beginPath();

    data.forEach((item, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = canvasHeight - padding - ((item.sales - minValue) / (maxValue - minValue)) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // 绘制数据点
    data.forEach((item, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = canvasHeight - padding - ((item.sales - minValue) / (maxValue - minValue)) * chartHeight;
      
      ctx.setFillStyle('#1976D2');
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();

      // 显示数值
      ctx.setFillStyle('#333');
      ctx.setFontSize(10);
      ctx.setTextAlign('center');
      ctx.fillText(`¥${item.sales}`, x, y - 10);
    });

    // 绘制X轴标签
    ctx.setFillStyle('#666');
    ctx.setFontSize(12);
    ctx.setTextAlign('center');
    data.forEach((item, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      ctx.fillText(item.day, x, canvasHeight - padding + 20);
    });

    ctx.draw();
  },

  viewSalesReport: function() {
    wx.showToast({
      title: '查看销售报表',
      icon: 'none'
    });
  },

  viewInventoryReport: function() {
    wx.showToast({
      title: '查看库存报表',
      icon: 'none'
    });
  },

  viewCustomerReport: function() {
    wx.showToast({
      title: '查看客户报表',
      icon: 'none'
    });
  },

  viewOrderReport: function() {
    wx.showToast({
      title: '查看订单报表',
      icon: 'none'
    });
  }
});