import { Platform } from '../types'

export const PLATFORMS: Platform[] = [
  {
    name: '淘宝',
    domain: 'taobao.com',
    color: '#ff5000',
    id: 'taobao'
  },
  {
    name: '天猫',
    domain: 'tmall.com',
    color: '#ff5000',
    id: 'taobao'
  },
  {
    name: '京东',
    domain: 'jd.com',
    color: '#e1251b',
    id: 'jd'
  },
  {
    name: '拼多多',
    domain: 'pinduoduo.com',
    color: '#e02e24',
    id: 'pdd'
  }
]

export function detectPlatform(url: string): Platform | null {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    for (const platform of PLATFORMS) {
      if (hostname.includes(platform.domain)) {
        return platform
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

export function extractProductId(url: string, platform: Platform): string | null {
  try {
    const urlObj = new URL(url)
    const searchParams = urlObj.searchParams
    
    switch (platform.id) {
      case 'taobao':
        return searchParams.get('id') || 
               url.match(/\/item\/(\d+)\.htm/)?.[1] ||
               url.match(/\/i(\d+)\.htm/)?.[1] ||
               null
      case 'jd':
        return searchParams.get('skuId') ||
               url.match(/\/([^\/]+)\.html/)?.[1] ||
               null
      case 'pdd':
        return searchParams.get('goods_id') ||
               url.match(/\/goods\/([^?]+)/)?.[1] ||
               null
      default:
        return null
    }
  } catch (error) {
    return null
  }
}