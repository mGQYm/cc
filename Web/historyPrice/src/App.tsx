import React, { useState } from 'react'
import { Search, Loader2, AlertCircle } from 'lucide-react'
import { PriceChart } from './components/PriceChart'
import { ProductInfo } from './components/ProductInfo'
import { priceService } from './services/api'
import { PriceHistory } from './types'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [priceData, setPriceData] = useState<PriceHistory | null>(null)

  const handleSearch = async () => {
    if (!url.trim()) return

    setLoading(true)
    setError(null)
    setPriceData(null)

    try {
      const data = await priceService.getPriceHistory(url)
      setPriceData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取价格数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const exampleUrls = [
    'https://detail.tmall.com/item.htm?id=123456789',
    'https://item.jd.com/100012043978.html',
    'https://mobile.yangkeduo.com/goods.html?goods_id=123456789'
  ]

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        商品价格历史追踪器
      </h1>

      <div className="card">
        <div className="input-group">
          <input
            type="url"
            className="input"
            placeholder="请输入淘宝、京东、拼多多等平台的商品链接..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button
            className="button"
            onClick={handleSearch}
            disabled={loading || !url.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                查询中...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                查询历史价格
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="error">
            <AlertCircle className="w-4 h-4" style={{ display: 'inline-block', marginRight: '8px' }} />
            {error}
          </div>
        )}

        <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
          <strong>示例链接：</strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
            {exampleUrls.map((exampleUrl, index) => (
              <button
                key={index}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: '4px 0',
                  fontSize: '12px'
                }}
                onClick={() => setUrl(exampleUrl)}
              >
                {exampleUrl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#007bff' }} />
          <p>正在获取价格历史数据，请稍候...</p>
        </div>
      )}

      {priceData && (
        <>
          <ProductInfo data={priceData} />
          <PriceChart data={priceData} />
        </>
      )}
    </div>
  )
}

export default App