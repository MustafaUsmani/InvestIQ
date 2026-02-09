
import { TrendingUp, TrendingDown, ArrowUpRight, Zap, Globe, Cpu, ChevronRight, Compass, Newspaper, BarChart2, Clock, ExternalLink } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MarketData, Asset, GroundingSource } from '../types';
import PriceChart from '../components/PriceChart';
import { marketService } from '../services/marketService';

const MarketCard: React.FC<{ asset: Asset; chartData: any[] }> = ({ asset, chartData }) => {
  const isUp = asset.change >= 0;
  return (
    <Link to={`/asset/${asset.symbol}`} className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl hover:border-slate-600 hover:bg-slate-800/60 transition-all duration-300 group flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{asset.symbol}</span>
            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {isUp ? 'BULL' : 'BEAR'}
            </div>
          </div>
          <h3 className="text-lg font-bold mt-1 truncate max-w-[150px]">{asset.name}</h3>
        </div>
        <ArrowUpRight size={18} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
      </div>
      
      <div className="flex items-end justify-between mt-auto">
        <div>
          <div className="text-xl font-mono font-black tracking-tighter">${asset.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
          <div className="flex items-center gap-2 mt-1">
            <div className={`text-xs font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isUp ? '+' : ''}{asset.changePercent.toFixed(2)}%
            </div>
            {asset.lastSync && (
              <div className="text-[8px] text-slate-600 flex items-center gap-1 font-bold uppercase tracking-tighter">
                <Clock size={8}/> {asset.lastSync}
              </div>
            )}
          </div>
        </div>
        <div className="w-24 h-12 relative overflow-hidden">
          <PriceChart data={chartData} color={isUp ? '#10b981' : '#f43f5e'} />
        </div>
      </div>
    </Link>
  );
};

const NewsSection = ({ news }: { news: any[] }) => (
  <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center space-x-2">
      < Newspaper size={14} className="text-blue-400" />
      <span>Top Market Headlines</span>
    </h3>
    <div className="space-y-4">
      {news.map(item => (
        <a 
          key={item.id} 
          href={`https://www.google.com/search?q=${encodeURIComponent(item.headline)}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block group cursor-pointer border-b border-slate-800 last:border-0 pb-4"
        >
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors leading-tight">{item.headline}</h4>
            <span className={`text-[10px] font-bold shrink-0 ml-4 ${item.sentiment === 'Positive' ? 'text-emerald-400' : item.sentiment === 'Negative' ? 'text-rose-400' : 'text-slate-400'}`}>
              {item.sentiment}
            </span>
          </div>
          <div className="flex items-center space-x-3 mt-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase">{item.source}</span>
            <span className="text-[10px] font-bold text-slate-700">•</span>
            <span className="text-[10px] font-bold text-slate-600">{item.time}</span>
          </div>
        </a>
      ))}
    </div>
  </div>
);

// Requirement: Display grounding sources from Google Search
const SourcesSection = ({ sources }: { sources: GroundingSource[] }) => (
  <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 mt-6">
    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center space-x-2">
      <Globe size={14} className="text-emerald-400" />
      <span>Grounding Sources</span>
    </h3>
    <div className="space-y-3">
      {sources.map((s, i) => (
        <a 
          key={i} 
          href={s.uri} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ExternalLink size={12} />
          <span className="text-[10px] font-bold truncate">{s.title}</span>
        </a>
      ))}
    </div>
  </div>
);

const Home: React.FC<{ marketData: MarketData }> = ({ marketData }) => {
  const [activeSector, setActiveSector] = useState<string>('All');

  const charts = useMemo(() => {
    const map: Record<string, any[]> = {};
    [...marketData.indices, ...marketData.stocks, ...marketData.commodities].forEach(a => {
      map[a.symbol] = marketService.getHistoricalData(a.symbol, 15);
    });
    return map;
  }, [marketData]);

  const sectors = ['All', 'Technology', 'Energy', 'Financials', 'Consumer Cyclical'];
  const filteredStocks = activeSector === 'All' ? marketData.stocks : marketData.stocks.filter(s => s.sector === activeSector);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-12">
          {/* Main Hero View */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-gradient-to-br from-blue-900/40 via-indigo-950 to-slate-950 border border-blue-500/20 rounded-[2.5rem] p-10 flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 group-hover:rotate-6 transition-transform">
                <Globe size={300} />
              </div>
              <div className="relative z-10">
                <div className="px-3 py-1 bg-blue-500 text-white text-[10px] font-black rounded-full w-fit uppercase tracking-widest mb-6">AI Strategy Pulse</div>
                <h1 className="text-5xl font-black leading-[1.1] text-white">Unlock Precision <br/><span className="text-blue-500">Alpha.</span></h1>
                <p className="text-slate-400 mt-6 max-w-sm text-lg font-medium leading-relaxed">
                  Enterprise-grade analytics powered by Gemini 3 logic. Synthesizing real-time feeds into actionable strategy.
                </p>
              </div>
              <div className="relative z-10 mt-12 flex space-x-4">
                <Link to="/strategy" className="bg-white text-slate-950 px-8 py-3 rounded-2xl font-black text-sm flex items-center space-x-2 hover:bg-slate-200 transition-all">
                  <Zap size={18} />
                  <span>Build Portfolio</span>
                </Link>
                <Link to="/ranking" className="bg-slate-900 text-white border border-slate-700 px-8 py-3 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all">
                  Alpha List
                </Link>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Global Index</h3>
                <BarChart2 size={20} className="text-emerald-400" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-300">S&P 500 Index</span>
                <div className="text-4xl font-mono font-black mt-2 tracking-tighter">${marketData.indices[0].price.toLocaleString()}</div>
                <div className="flex items-center space-x-2 mt-1">
                   <span className="text-emerald-400 font-bold text-sm">+{marketData.indices[0].changePercent.toFixed(2)}%</span>
                   <span className="text-slate-600 text-xs font-bold uppercase tracking-widest">Forecast: $5,450</span>
                </div>
              </div>
              <div className="h-24 w-full mt-6">
                <PriceChart data={charts[marketData.indices[0].symbol]} color="#10b981" />
              </div>
            </div>
          </section>

          {/* Asset Universe Grid */}
          <section className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Asset Universe</h2>
                <div className="flex space-x-4">
                  {sectors.map(s => (
                    <button
                      key={s}
                      onClick={() => setActiveSector(s)}
                      className={`text-sm font-bold transition-colors ${activeSector === s ? 'text-blue-500 underline underline-offset-8 decoration-2' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <Link to="/ranking" className="text-xs font-black text-blue-500 uppercase hover:text-blue-400 transition-colors flex items-center">
                Full Rankings <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredStocks.map(stock => (
                <MarketCard key={stock.symbol} asset={stock} chartData={charts[stock.symbol]} />
              ))}
              {activeSector === 'All' && marketData.commodities.map(comm => (
                <MarketCard key={comm.symbol} asset={comm} chartData={charts[comm.symbol]} />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar News & Sentiment */}
        <div className="space-y-8">
          <NewsSection news={marketData.news} />
          {marketData.sources && marketData.sources.length > 0 && (
            <SourcesSection sources={marketData.sources} />
          )}
          
          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 space-y-6">
             <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
                < Zap size={14} />
                <span>AI Market Pulse</span>
             </div>
             <p className="text-slate-400 text-sm leading-relaxed">
               Current market regime shows high tech concentration. AI stocks are pricing in aggressive growth for Q3. Gold remains the optimal hedge against currency devaluation risks.
             </p>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/50">
                   <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Sentiment</div>
                   <div className="text-xl font-black text-emerald-400">74%</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/50">
                   <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Risk Appetite</div>
                   <div className="text-xl font-black text-blue-400">Medium</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
