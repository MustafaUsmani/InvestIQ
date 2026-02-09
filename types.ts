
export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'stock' | 'commodity' | 'index';
  category: 'S&P 500' | 'Gold' | 'Silver' | 'Forex';
  sector?: string;
  sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
  sentimentScore?: number;
  description?: string;
  forecastPrice?: number;
  fairValue?: number;
  forecastConfidence?: number;
  marketCap?: string;
  peRatio?: number;
  dividendYield?: string;
  lastSync?: string;
  forecastReasoning?: string;
  riskMetrics?: {
    sharpe: number;
    beta: number;
    volatility: number;
  };
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface MarketData {
  indices: Asset[];
  stocks: Asset[];
  commodities: Asset[];
  news: NewsItem[];
  sources?: GroundingSource[];
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  time: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  impactAsset?: string;
}

export interface UserPreferences {
  budget: number;
  riskTolerance: 'Low' | 'Medium' | 'High';
  horizon: 'Short' | 'Medium' | 'Long';
  assetPreferences: string[];
}

export interface InvestmentStrategy {
  allocations: { 
    asset: string; 
    percentage: number; 
    dollarValue: number; 
    forecastReturn: number;
    fairValueGap: number; 
  }[];
  rationale: string;
  riskAssessment: string;
  rebalanceFrequency: string;
  formulaUsed: string;
  totalForecastedReturn: number;
}

export interface ScenarioResult {
  scenario: string;
  impact: string;
  adjustment: string;
  riskLevel: 'Low' | 'Moderate' | 'Critical';
  vulnerabilityScore: number;
}

export interface ForumPost {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  tags: string[];
  upvotes: number;
  isAI?: boolean;
}
