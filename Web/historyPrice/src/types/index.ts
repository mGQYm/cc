export interface Platform {
  name: string
  domain: string
  color: string
  id: 'taobao' | 'jd' | 'pdd'
}

export interface PricePoint {
  date: string
  price: number
  timestamp: number
}

export interface ProductInfo {
  id: string
  title: string
  imageUrl: string
  currentPrice: number
  platform: Platform
  url: string
}

export interface PriceHistory {
  product: ProductInfo
  prices: PricePoint[]
  statistics: {
    lowest: number
    highest: number
    average: number
    change: number
  }
}