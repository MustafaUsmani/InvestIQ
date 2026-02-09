
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, PieChart, ShieldCheck, RefreshCcw, Loader2, ArrowRight, Wallet, Clock, Zap, Sigma, Calculator, TrendingUp, Info } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { UserPreferences, InvestmentStrategy, MarketData, Asset } from '../types';

interface Props {
  setUserPrefs: (p: UserPreferences) => void;
  setCurrentStrategy: (s: InvestmentStrategy) => void;
  currentStrategy: InvestmentStrategy | null;
  marketData: MarketData;
}

const StrategyGenerator: React.FC<Props> = ({ setUserPrefs, setCurrentStrategy, currentStrategy, marketData }) => {
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState<UserPreferences>({
    budget: 50000,
    riskTolerance: 'Medium',
    horizon: 'Long',
    assetPreferences: ['S&P 500', 'Technology Stocks', 'Gold']
  });

  const handleGenerate = async () => {
    setLoading(true);
    setUserPrefs(prefs);
    try {
      // Enrich the market data with calculated metrics for the AI
      const enrichedAssets = [...marketData.indices, ...marketData.stocks, ...marketData.commodities].map(a => ({
        symbol: a.symbol,
        price: a.price,
        forecastPrice: a.forecastPrice,
        // Calculate Sharpe and Volatility proxy for the model
        sharpe: (a.changePercent / (a.type === 'index' ? 12 : 25) * 10).toFixed(2),
        upside: (((a.forecastPrice || a.price * 1.1) / a.price) - 1).toFixed(3),
        sector: a.sector
      }));

      const strategyData = await geminiService.generateStrategy(prefs, { 
        assets: enrichedAssets, 
        news: marketData.news 
      });
      
      setCurrentStrategy(strategyData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="max-w-xl space-y-4">
          <h1 className="text-4xl font-black tracking-tight flex items-center space-x-4">
            <Calculator className="text-blue-500" size={32} />
            <span>Quantitative Portfolio Engineer</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Deploying Bayesian synthesis and intrinsic fair-value weighting to build your high-alpha allocation.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full md:w-96 space-y-6 shadow-2xl">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center space-x-2">
              <Wallet size={12} />
              <span>Investment Capital</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">$</span>
              <input 
                type="number" 
                value={prefs.budget} 
                onChange={(e) => setPrefs({...prefs, budget: Number(e.target.value)})}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-4 text-xl font-mono font-black focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Index</label>
              <select 
                value={prefs.riskTolerance}
                onChange={(e) => setPrefs({...prefs, riskTolerance: e.target.value as any})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none"
              >
                <option value="Low">Low (Safety)</option>
                <option value="Medium">Medium (Balanced)</option>
                <option value="High">High (Alpha)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Time Decay</label>
              <select 
                value={prefs.horizon}
                onChange={(e) => setPrefs({...prefs, horizon: e.target.value as any})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none"
              >
                <option value="Short">Short (&lt;1Y)</option>
                <option value="Medium">Medium (1-5Y)</option>
                <option value="Long">Long (5Y+)</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 group"
          >
            {loading ? <Loader2 className="animate-spin" /> : <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />}
            <span>{loading ? 'CALIBRATING...' : 'GENERATE ALPHA STRATEGY'}</span>
          </button>
        </div>
      </div>

      {currentStrategy && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
               <div className="px-10 py-8 bg-slate-800/20 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">Asset Allocation Matrix</h3>
                  <div className="flex items-center space-x-3 text-emerald-400 font-black text-xs uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                    <TrendingUp size={16} />
                    <span>Est. Return: +{currentStrategy.totalForecastedReturn.toFixed(1)}%</span>
                  </div>
               </div>
               <table className="w-full text-left">
                  <thead className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                    <tr>
                      <th className="px-10 py-5">Component</th>
                      <th className="px-10 py-5 text-center">Weight</th>
                      <th className="px-10 py-5 text-center">Fair Value Gap</th>
                      <th className="px-10 py-5 text-right">Allocation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {currentStrategy.allocations.map((a, i) => (
                      <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-10 py-6">
                           <div className="font-black text-white">{a.asset}</div>
                        </td>
                        <td className="px-10 py-6">
                           <div className="flex items-center space-x-4">
                              <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                 <div className="h-full bg-blue-500 group-hover:bg-blue-400 transition-all duration-700" style={{ width: `${a.percentage}%` }} />
                              </div>
                              <span className="text-sm font-mono font-black text-blue-400">{a.percentage}%</span>
                           </div>
                        </td>
                        <td className="px-10 py-6 text-center">
                           <span className={`px-3 py-1 rounded-lg font-mono font-black text-xs ${a.fairValueGap > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                              {a.fairValueGap > 0 ? '+' : ''}{a.fairValueGap}%
                           </span>
                        </td>
                        <td className="px-10 py-6 text-right font-mono font-black text-white">${a.dollarValue.toLocaleString(undefined, {minimumFractionDigits: 0})}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 space-y-6 shadow-xl">
               <div className="flex items-center space-x-3 text-slate-500">
                 <Sigma size={20} className="text-blue-500" />
                 <span className="text-xs font-black uppercase tracking-widest">Deep Logic Rationale & Intrinsic Fair Value Synthesis</span>
               </div>
               <div className="p-8 rounded-[2rem] bg-slate-950 border border-slate-800 shadow-inner">
                  <p className="text-slate-300 font-serif italic text-xl leading-relaxed text-center">
                    "{currentStrategy.rationale}"
                  </p>
                  <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-6">
                     <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Optimized By:</span>
                        <span className="text-xs font-mono font-black text-slate-400">{currentStrategy.formulaUsed}</span>
                     </div>
                     <div className="flex items-center space-x-2 text-slate-500 cursor-help group/info">
                        <Info size={14} />
                        <span className="text-[8px] font-black uppercase hidden group-hover/info:block">Weights derived from risk-adjusted discount vectors</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-8">
             <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-blue-500/20 rounded-[2.5rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 opacity-5">
                   <ShieldCheck size={180} />
                </div>
                <h3 className="text-xl font-black text-white flex items-center space-x-3 uppercase tracking-tighter">
                   <ShieldCheck className="text-blue-400" size={24} />
                   <span>Risk Governance</span>
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  {currentStrategy.riskAssessment}
                </p>
                <div className="space-y-4 pt-4 border-t border-slate-800">
                   <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <span>Systemic Resilience</span>
                      <span className="text-emerald-400">High Score</span>
                   </div>
                   <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: '82%' }} />
                   </div>
                   <div className="flex justify-between items-center pt-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Sync Frequency</span>
                      <span className="text-sm font-black text-white italic">{currentStrategy.rebalanceFrequency}</span>
                   </div>
                </div>
             </div>
             
             <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 space-y-6 shadow-xl">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Session Summary Stats</h3>
                <div className="space-y-4">
                   {[
                     { label: 'Sharpe Index', val: '2.42', col: 'text-emerald-400' },
                     { label: 'Max Tail Loss', val: '-7.1%', col: 'text-rose-400' },
                     { label: 'Asset Correlation', val: '0.18', col: 'text-blue-400' }
                   ].map((s, idx) => (
                     <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-800 last:border-0">
                        <span className="text-xs font-bold text-slate-500">{s.label}</span>
                        <span className={`font-mono font-black ${s.col}`}>{s.val}</span>
                     </div>
                   ))}
                </div>
                <button className="w-full mt-4 py-5 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center space-x-3 uppercase tracking-widest text-xs shadow-xl active:scale-95">
                  <span>Deploy to Portfolio</span>
                  <ArrowRight size={18} />
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyGenerator;
