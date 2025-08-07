import axios from 'axios'
import { PriceHistory, ProductInfo, PricePoint } from '../types'
import { detectPlatform, extractProductId } from '../utils/platform'

// 模拟价格历史数据
const generateMockPriceHistory = (productId: string, platform: string): PricePoint[] => {
  const prices: PricePoint[] = []
  const basePrice = Math.floor(Math.random() * 500) + 100
  const days = 30
  
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    const variance = (Math.random() - 0.5) * 50
    const price = Math.max(basePrice + variance, basePrice * 0.8)
    
    prices.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price * 100) / 100,
      timestamp: date.getTime()
    })
  }
  
  return prices
}

const mockProductData = {
  taobao: {
    title: '淘宝商品示例',
    imageUrl: 'https://via.placeholder.com/200x200/FF5000/FFFFFF?text=淘宝商品'
  },
  jd: {
    title: '京东商品示例',
    imageUrl: 'https://via.placeholder.com/200x200/E1251B/FFFFFF?text=京东商品'
  },
  pdd: {
    title: '拼多多商品示例',
    imageUrl: 'https://via.placeholder.com/200x200/E02E24/FFFFFF?text=拼多多商品'
  }
}

export class PriceTrackingService {
  async getPriceHistory(url: string): Promise<PriceHistory> {
    const platform = detectPlatform(url)
    if (!platform) {
      throw new Error('不支持的电商平台链接')
    }

    const productId = extractProductId(url, platform)
    if (!productId) {
      throw new Error('无法提取商品ID')
    }

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    const prices = generateMockPriceHistory(productId, platform.id)
    const currentPrice = prices[prices.length - 1].price
    const lowest = Math.min(...prices.map(p => p.price))
    const highest = Math.max(...prices.map(p => p.price))
    const average = prices.reduce((sum, p) => sum + p.price, 0) / prices.length
    const change = ((currentPrice - prices[0].price) / prices[0].price) * 100

    const product: ProductInfo = {
      id: productId,
      title: mockProductData[platform.id].title,
      imageUrl: mockProductData[platform.id].imageUrl,
      currentPrice,
      platform,
      url
    }

    return {
      product,
      prices,
      statistics: {
        lowest: Math.round(lowest * 100) / 100,
        highest: Math.round(highest * 100) / 100,
        average: Math.round(average * 100) / 100,
        change: Math.round(change * 100) / 100
      }
    }
  }
}

export const priceService = new PriceTrackingService()