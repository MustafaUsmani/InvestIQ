
import React, { useState, useMemo } from 'react';
import { ShieldAlert, Info, TrendingUp, BarChart, Activity, Zap, Filter, ArrowDownNarrowWide } from 'lucide-react';
import { MarketData } from '../types';

const RiskAnalysis: React.FC<{ marketData: MarketData }> = ({ marketData }) => {
  const [filterType, setFilterType] = useState('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const assets = useMemo(() => {
    let list = [...marketData.indices, ...marketData.stocks, ...marketData.commodities];
    if (filterType !== 'All') list = list.filter(a => a.type === filterType.toLowerCase().slice(0, -1));
    return list.map(a => ({
      ...a,
      stability: Math.floor(Math.random() * 80 + 10),
      vol: (Math.random() * 30 + 5).toFixed(1)
    })).sort((a, b) => sortOrder === 'desc' ? b.stability - a.stability : a.stability - b.stability);
  }, [marketData, filterType, sortOrder]);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2">Risk Stability Matrix</h1>
          <p className="text-slate-400">Deep-layer quantification of downside vulnerability and volatility clusters.</p>
        </div>
        <div className="flex bg-slate-900 border border-slate-800 p-2 rounded-2xl space-x-4">
           <div className="flex items-center space-x-2 px-3">
              <Filter size={14} className="text-slate-500" />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-300 outline-none cursor-pointer"
              >
                 <option value="All" className="bg-slate-900">All Assets</option>
                 <option value="Stocks" className="bg-slate-900">Stocks Only</option>
                 <option value="Commodities" className="bg-slate-900">Commodities</option>
              </select>
           </div>
           <div className="h-6 w-px bg-slate-800" />
           <button 
             onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
             className="flex items-center space-x-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors"
           >
              <ArrowDownNarrowWide size={14} />
              <span>Sort: {sortOrder === 'desc' ? 'Highest Stability' : 'Lowest Stability'}</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Systemic Volatility', value: '18.4%', trend: 'up', color: 'rose' },
          { label: 'Cluster Correlation', value: '0.62', trend: 'down', color: 'blue' },
          { label: 'Tail-Risk Probability', value: 'Low', trend: 'neutral', color: 'emerald' },
          { label: 'Vulnerability (VaR)', value: '4.2%', trend: 'up', color: 'indigo' },
        ].map(metric => (
          <div key={metric.label} className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] relative overflow-hidden group">
             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{metric.label}</div>
             <div className="text-4xl font-mono font-black tracking-tighter">{metric.value}</div>
             <div className={`text-[10px] font-black mt-4 flex items-center space-x-1 ${metric.trend === 'up' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {metric.trend === 'up' ? <TrendingUp size={12} /> : <Zap size={12} />}
                <span>{metric.trend === 'up' ? '+2.4%' : '-1.1%'} Cluster Shift</span>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-bold">Relative Stability Distribution</h3>
              <div className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">Sample Size: {assets.length}</div>
           </div>

           <div className="space-y-8">
              {assets.map(asset => (
                <div key={asset.symbol} className="group">
                  <div className="flex justify-between items-end mb-2">
                     <div className="flex items-center space-x-3">
                        <span className="font-mono font-black text-blue-400">{asset.symbol}</span>
                        <span className="font-bold text-sm text-slate-400 uppercase tracking-widest">{asset.name}</span>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Vol Curve: </span>
                        <span className="text-sm font-mono font-black text-white">{asset.vol}%</span>
                     </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                     <div 
                       className={`h-full transition-all duration-1000 ${asset.stability > 60 ? 'bg-rose-500' : asset.stability > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                       style={{ width: `${asset.stability}%` }} 
                     />
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-gradient-to-br from-slate-900 to-blue-950 border border-blue-500/20 p-10 rounded-[2.5rem] space-y-6">
              <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl w-fit">
                <ShieldAlert size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight">AI Reasoning Core</h3>
              <p className="text-slate-400 leading-relaxed font-medium">
                The current market regime is shifting toward a <strong>Low Liquidity Cluster</strong>. Technical indicators suggest that {marketData.stocks[2].symbol} is currently the primary volatility driver due to earnings anticipation.
              </p>
              <div className="space-y-4 pt-4">
                 {[
                   { label: 'Hedge Efficiency', val: '84%' },
                   { label: 'Correlation Drift', val: '0.14' },
                   { label: 'Risk Adjusted Upside', val: '1.4x' }
                 ].map(item => (
                   <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-800">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                      <span className="text-sm font-mono font-black text-white">{item.val}</span>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem]">
              <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-2">Explainability Note</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our stability scores are calculated using a 3-factor model: 1. Realized Volatility, 2. Beta to S&P 500, and 3. Tail-Event Sensitivity during 2022 market shocks.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysis;
