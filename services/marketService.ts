
import { Asset, MarketData, NewsItem } from '../types';

const INITIAL_DATA: MarketData = {
  indices: [
    { symbol: '^GSPC', name: 'S&P 500 Index', price: 5123.45, change: 12.30, changePercent: 0.24, type: 'index', category: 'S&P 500', forecastPrice: 5250.00 },
  ],
  stocks: [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 189.45, change: 1.25, changePercent: 0.67, type: 'stock', category: 'S&P 500', sector: 'Technology', marketCap: '3.2T', peRatio: 28.4, dividendYield: '1.2%', forecastPrice: 195.50 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.20, change: -2.30, changePercent: -0.55, type: 'stock', category: 'S&P 500', sector: 'Technology', marketCap: '3.0T', peRatio: 35.1, dividendYield: '0.8%', forecastPrice: 430.00 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.30, change: 15.40, changePercent: 1.79, type: 'stock', category: 'S&P 500', sector: 'Technology', marketCap: '2.1T', peRatio: 74.2, dividendYield: '0.02%', forecastPrice: 920.00 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 152.30, change: 0.85, changePercent: 0.56, type: 'stock', category: 'S&P 500', sector: 'Technology', marketCap: '1.9T', peRatio: 24.5, dividendYield: 'N/A', forecastPrice: 165.00 },
    { symbol: 'META', name: 'Meta Platforms', price: 485.10, change: 5.20, changePercent: 1.08, type: 'stock', category: 'S&P 500', sector: 'Technology', marketCap: '1.2T', peRatio: 32.1, dividendYield: 'N/A', forecastPrice: 510.00 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.20, change: 0.45, changePercent: 0.25, type: 'stock', category: 'S&P 500', sector: 'Technology', marketCap: '1.8T', peRatio: 58.3, dividendYield: 'N/A', forecastPrice: 195.00 },
    { symbol: 'TSLA', name: 'Tesla, Inc.', price: 175.40, change: -3.20, changePercent: -1.79, type: 'stock', category: 'S&P 500', sector: 'Consumer Cyclical', marketCap: '550B', peRatio: 45.1, dividendYield: 'N/A', forecastPrice: 160.00 },
    { symbol: 'JPM', name: 'JPMorgan Chase', price: 188.45, change: 1.15, changePercent: 0.61, type: 'stock', category: 'S&P 500', sector: 'Financials', marketCap: '540B', peRatio: 11.2, dividendYield: '2.4%', forecastPrice: 195.00 },
    { symbol: 'LLY', name: 'Eli Lilly', price: 755.30, change: 12.40, changePercent: 1.67, type: 'stock', category: 'S&P 500', sector: 'Healthcare', marketCap: '710B', peRatio: 124.5, dividendYield: '0.6%', forecastPrice: 800.00 },
    { symbol: 'UNH', name: 'UnitedHealth Group', price: 485.20, change: -4.10, changePercent: -0.84, type: 'stock', category: 'S&P 500', sector: 'Healthcare', marketCap: '450B', peRatio: 19.4, dividendYield: '1.5%', forecastPrice: 505.00 },
    { symbol: 'V', name: 'Visa Inc.', price: 278.30, change: -0.45, changePercent: -0.16, type: 'stock', category: 'S&P 500', sector: 'Financials', marketCap: '570B', peRatio: 31.5, dividendYield: '0.7%', forecastPrice: 290.00 },
    { symbol: 'XOM', name: 'Exxon Mobil', price: 115.40, change: 1.25, changePercent: 1.09, type: 'stock', category: 'S&P 500', sector: 'Energy', marketCap: '460B', peRatio: 12.8, dividendYield: '3.2%', forecastPrice: 125.00 },
  ],
  commodities: [
    { symbol: 'GC=F', name: 'Gold Continuous', price: 2165.40, change: 15.20, changePercent: 0.71, type: 'commodity', category: 'Gold', forecastPrice: 2250.00 },
    { symbol: 'SI=F', name: 'Silver Continuous', price: 24.85, change: 0.12, changePercent: 0.48, type: 'commodity', category: 'Silver', forecastPrice: 28.50 },
  ],
  news: [],
  sources: []
};

class MarketService {
  private data: MarketData = INITIAL_DATA;

  getMarketOverview(): MarketData {
    return this.data;
  }

  async fetchYahooPrice(symbol: string): Promise<number | null> {
    try {
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`);
      const json = await response.json();
      return Number(json.chart.result[0].meta.regularMarketPrice.toFixed(2));
    } catch (e) {
      return null;
    }
  }

  async fetchRealHistory(symbol: string, range: string = '1mo'): Promise<any[]> {
    try {
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${range}`);
      const json = await response.json();
      const result = json.chart.result[0];
      const timestamps = result.timestamp || [];
      const quotes = result.indicators.quote[0];
      
      if (!timestamps.length) throw new Error("No historical data");

      return timestamps.map((t: number, i: number) => ({
        date: new Date(t * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        price: quotes.close[i] || quotes.open[i] || 0,
        open: quotes.open[i] || 0,
        high: quotes.high[i] || 0,
        low: quotes.low[i] || 0,
        close: quotes.close[i] || 0,
        volume: quotes.volume ? quotes.volume[i] : 0
      })).filter((d: any) => d.price > 0);
    } catch (e) {
      console.warn(`Historical fetch for ${symbol} failed. Using simulated fallback.`);
      return this.getHistoricalData(symbol, 30);
    }
  }

  bulkUpdatePrices(newPrices: Record<string, number>) {
    const now = new Date().toLocaleTimeString();
    const update = (a: Asset) => {
      const sym = a.symbol.replace('^', '').replace('=F', '').replace('-', '');
      const price = newPrices[sym] || newPrices[a.symbol];
      if (price) {
        a.price = Number(price.toFixed(2));
        a.lastSync = now;
      }
      return a;
    };
    this.data.indices = this.data.indices.map(update);
    this.data.stocks = this.data.stocks.map(update);
    this.data.commodities = this.data.commodities.map(update);
  }

  setNews(news: NewsItem[]) {
    this.data.news = news;
  }

  getAsset(symbol: string): Asset | undefined {
    const s = symbol.toUpperCase().replace('^', '').replace('=F', '');
    return [...this.data.indices, ...this.data.stocks, ...this.data.commodities].find(
      a => a.symbol.toUpperCase().replace('^', '').replace('=F', '') === s || a.symbol === symbol
    );
  }

  searchAssets(query: string): Asset[] {
    const q = query.toLowerCase();
    return [...this.data.indices, ...this.data.stocks, ...this.data.commodities].filter(
      a => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
    );
  }

  updatePrices() {
    const update = (a: Asset) => {
      const volatility = a.type === 'index' ? 0.0001 : 0.0003;
      const change = a.price * (Math.random() - 0.5) * volatility;
      a.price = Number((a.price + change).toFixed(2));
      a.change = Number((a.change + change).toFixed(2));
      a.changePercent = Number(((a.change / (a.price - a.change)) * 100).toFixed(2));
      return { ...a };
    };

    this.data.indices = this.data.indices.map(update);
    this.data.stocks = this.data.stocks.map(update);
    this.data.commodities = this.data.commodities.map(update);
    
    return this.data;
  }

  getHistoricalData(symbol: string, days: number = 30) {
    const asset = this.getAsset(symbol);
    if (!asset) return [];
    
    const data = [];
    let currentPrice = asset.price;
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const volatility = 0.012; 
      currentPrice = currentPrice * (1 + (Math.random() - 0.5) * volatility);
      data.push({
        date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        price: Number(currentPrice.toFixed(2)),
        open: Number((currentPrice * (1 + (Math.random()-0.5)*0.01)).toFixed(2)),
        high: Number((currentPrice * 1.01).toFixed(2)),
        low: Number((currentPrice * 0.99).toFixed(2)),
        close: Number(currentPrice.toFixed(2)),
        volume: Math.floor(Math.random() * 5000000 + 1000000)
      });
    }
    return data;
  }
}

export const marketService = new MarketService();
