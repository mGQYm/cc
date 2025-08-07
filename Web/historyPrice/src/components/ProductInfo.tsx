import React from 'react'
import { Package, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { PriceHistory } from '../types'

interface ProductInfoProps {
  data: PriceHistory
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ data }) => {
  const { product, statistics } = data
  
  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />
    if (change < 0) return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return '#dc3545'
    if (change < 0) return '#28a745'
    return '#6c757d'
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <img 
          src={product.imageUrl} 
          alt={product.title}
          style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }}
        />
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package className="w-5 h-5" />
            {product.title}
          </h3>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <span className={`platform-badge platform-${product.platform.id}`}>
              {product.platform.name}
            </span>
            <span style={{ color: '#666', fontSize: '14px' }}>
              ID: {product.id}
            </span>
          </div>
        </div>
      </div>

      <div className="price-info">
        <div className="price-card">
          <div className="price-value" style={{ color: product.platform.color }}>
            ¥{product.currentPrice}
          </div>
          <div className="price-label">当前价格</div>
        </div>

        <div className="price-card">
          <div className="price-value" style={{ color: '#28a745' }}>
            ¥{statistics.lowest}
          </div>
          <div className="price-label">历史最低</div>
        </div>

        <div className="price-card">
          <div className="price-value" style={{ color: '#dc3545' }}>
            ¥{statistics.highest}
          </div>
          <div className="price-label">历史最高</div>
        </div>

        <div className="price-card">
          <div className="price-value" style={{ color: getTrendColor(statistics.change) }}>
            {getTrendIcon(statistics.change)}
            {Math.abs(statistics.change)}%
          </div>
          <div className="price-label">30天变化</div>
        </div>

        <div className="price-card">
          <div className="price-value">
            ¥{statistics.average}
          </div>
          <div className="price-label">平均价格</div>
        </div>
      </div>
    </div>
  )
}