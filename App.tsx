
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, TrendingUp, BarChart3, ShieldAlert, Award, Compass, MessageSquare, History, Zap, Search, ChevronDown, Bell, Globe, RefreshCw, ExternalLink, Activity } from 'lucide-react';

import Home from './pages/Home';
import StrategyGenerator from './pages/StrategyGenerator';
import AssetDetail from './pages/AssetDetail';
import SentimentForum from './pages/SentimentForum';
import RiskAnalysis from './pages/RiskAnalysis';
import Ranking from './pages/Ranking';
import StressTesting from './pages/StressTesting';
import SessionRecap from './pages/SessionRecap';
import FormulasScreen from './pages/FormulasScreen';

import { marketService } from './services/marketService';
import { geminiService } from './services/geminiService';
import { MarketData, UserPreferences, InvestmentStrategy, Asset } from './types';

const NavLink = ({ to, label, active }: { to: string, label: string, active: boolean }) => (
  <Link
    to={to}
    className={`px-4 py-2 text-sm font-semibold transition-all rounded-lg ${
      active 
        ? 'text-blue-400 bg-blue-500/10' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}
  >
    {label}
  </Link>
);

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Asset[]>([]);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 1) {
      setResults(marketService.searchAssets(query));
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 w-72 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
        <Search size={16} className="text-slate-500 mr-2" />
        <input
          type="text"
          placeholder="Search Assets (e.g. NVDA, Gold)"
          className="bg-transparent border-none outline-none text-sm text-white w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto">
          {results.map(asset => (
            <button
              key={asset.symbol}
              className="w-full px-4 py-3 text-left hover:bg-slate-800 flex justify-between items-center group transition-colors"
              onClick={() => {
                navigate(`/asset/${asset.symbol}`);
                setQuery('');
              }}
            >
              <div>
                <div className="text-sm font-bold text-white group-hover:text-blue-400">{asset.symbol}</div>
                <div className="text-xs text-slate-500">{asset.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono text-slate-300">${asset.price.toFixed(2)}</div>
                <div className={`text-[10px] font-bold ${asset.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {asset.change >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Ticker = ({ data }: { data: MarketData }) => {
  const all = [...data.indices, ...data.stocks, ...data.commodities];
  return (
    <div className="bg-slate-900/80 backdrop-blur border-b border-slate-800 h-10 flex items-center overflow-hidden whitespace-nowrap px-4">
      <div className="flex animate-ticker items-center space-x-8">
        {all.map(a => (
          <div key={a.symbol} className="flex items-center space-x-2 shrink-0">
            <span className="text-[10px] font-black text-slate-500 uppercase">{a.symbol}</span>
            <span className="text-xs font-mono font-bold">${a.price.toFixed(2)}</span>
            <span className={`text-[10px] font-bold ${a.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {a.change >= 0 ? '▲' : '▼'} {Math.abs(a.changePercent).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

const AppContent = () => {
  const location = useLocation();
  const [marketData, setMarketData] = useState<MarketData>(marketService.getMarketOverview());
  const [userPrefs, setUserPrefs] = useState<UserPreferences | null>(null);
  const [currentStrategy, setCurrentStrategy] = useState<InvestmentStrategy | null>(null);
  const [sessionHistory, setSessionHistory] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Never');

  const handleMarketSync = async () => {
    setSyncing(true);
    try {
      // Step 1: Attempt Yahoo Finance for Index and Key Commodities
      const indices = ['^GSPC', 'GC=F', 'SI=F'];
      const yahooPrices: Record<string, number> = {};
      
      for (const sym of indices) {
        const p = await marketService.fetchYahooPrice(sym);
        if (p) yahooPrices[sym.replace('^', '').replace('=F', '')] = p;
      }

      // Step 2: Gemini Search Bridge for fallback and headlines
      const liveData = await geminiService.fetchRealTimeMarketData();
      
      // Merge results
      const finalPrices = { ...liveData.prices, ...yahooPrices };
      marketService.bulkUpdatePrices(finalPrices);
      marketService.setNews(liveData.news);
      
      setMarketData({ 
        ...marketService.getMarketOverview(), 
        sources: liveData.sources 
      });
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.error("Sync failed", e);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    handleMarketSync();
    const interval = setInterval(() => {
      setMarketData(prev => ({ ...marketService.updatePrices(), news: prev.news, sources: prev.sources }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="sticky top-0 z-50 bg-slate-950 border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-10">
            <Link to="/" className="flex items-center space-x-2">
              <Zap className="text-blue-500" size={24} />
              <span className="text-xl font-black tracking-tighter uppercase italic">InvestIQ</span>
            </Link>
            <nav className="hidden lg:flex items-center space-x-1">
              <NavLink to="/" label="Dashboard" active={location.pathname === '/'} />
              <NavLink to="/strategy" label="Strategies" active={location.pathname === '/strategy'} />
              <NavLink to="/ranking" label="Alpha Rankings" active={location.pathname === '/ranking'} />
              <NavLink to="/risk" label="Risk Radar" active={location.pathname === '/risk'} />
              <NavLink to="/stress-test" label="Stress Test" active={location.pathname === '/stress-test'} />
              <NavLink to="/formulas" label="Insights Lab" active={location.pathname === '/formulas'} />
              <NavLink to="/sentiment" label="Forum" active={location.pathname === '/sentiment'} />
            </nav>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-end mr-4">
               <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${syncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Feed Live</span>
               </div>
               <span className="text-[8px] text-slate-600 font-bold">LAST SYNC: {lastSyncTime}</span>
            </div>
            <GlobalSearch />
            <button onClick={handleMarketSync} disabled={syncing} className="p-2 text-slate-400 hover:text-white transition-all">
              <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
        <Ticker data={marketData} />
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-8">
          <Routes>
            <Route path="/" element={<Home marketData={marketData} />} />
            <Route path="/strategy" element={<StrategyGenerator setUserPrefs={setUserPrefs} setCurrentStrategy={setCurrentStrategy} currentStrategy={currentStrategy} marketData={marketData} />} />
            <Route path="/asset/:symbol" element={<AssetDetail />} />
            <Route path="/sentiment" element={<SentimentForum />} />
            <Route path="/risk" element={<RiskAnalysis marketData={marketData} />} />
            <Route path="/ranking" element={<Ranking marketData={marketData} />} />
            <Route path="/stress-test" element={<StressTesting marketData={marketData} />} />
            <Route path="/formulas" element={<FormulasScreen marketData={marketData} />} />
            <Route path="/recap" element={<SessionRecap sessionHistory={sessionHistory} userPrefs={userPrefs} strategy={currentStrategy} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
