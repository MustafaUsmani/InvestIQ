
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, TrendingUp, HelpCircle, Info, ShieldAlert, Zap, Filter, ArrowDownNarrowWide, Target } from 'lucide-react';
import { MarketData, Asset } from '../types';

const Ranking: React.FC<{ marketData: MarketData }> = ({ marketData }) => {
  const navigate = useNavigate();
  const [isWarCrisis, setIsWarCrisis] = useState(false);
  const [sortBy, setSortBy] = useState<'composite' | 'return' | 'momentum'>('composite');

  const allAssets = [...marketData.stocks, ...marketData.indices, ...marketData.commodities];
  
  const ranked = useMemo(() => {
    return allAssets.map(a => {
      // Logic: Use real data for ranking instead of Math.random()
      // Expected return based on the forecastPrice vs current price
      const forecastPrice = a.forecastPrice || (a.price * 1.05);
      const expectedReturn = ((forecastPrice / a.price) - 1) * 100;
      
      // Momentum proxy using the session's change percent
      const momentum = a.changePercent;
      
      // Volatility proxy based on asset type
      const vol = a.type === 'index' ? 12 : a.type === 'commodity' ? 25 : 18;
      
      // Sharpe Ratio: Return / Volatility (simplified)
      let sharpe = expectedReturn / (vol / 10);
      
      // War Crisis Effect: Adjust metrics based on scenario
      let scenarioAdjustedReturn = expectedReturn;
      let scenarioAdjustedMomentum = momentum;

      if (isWarCrisis) {
        if (a.type === 'commodity') {
          scenarioAdjustedReturn += 15;
          scenarioAdjustedMomentum += 10;
        } else if (a.type === 'stock') {
          scenarioAdjustedReturn -= 10;
          scenarioAdjustedMomentum -= 5;
        }
      }

      // Composite IQ Score (0-100 range normalization)
      const composite = Math.min(100, Math.max(0, (sharpe * 15) + (scenarioAdjustedMomentum * 5) + 40));
      
      return { 
        ...a, 
        sharpe, 
        momentum: scenarioAdjustedMomentum, 
        expectedReturn: scenarioAdjustedReturn, 
        composite,
        targetPrice: forecastPrice
      };
    }).sort((a, b) => {
      if (sortBy === 'return') return b.expectedReturn - a.expectedReturn;
      if (sortBy === 'momentum') return b.momentum - a.momentum;
      return b.composite - a.composite;
    });
  }, [allAssets, isWarCrisis, sortBy]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter italic">Alpha Rankings</h1>
          <p className="text-slate-400 font-medium">Quantitative scoring powered by Gemini Quantum Forecast targets and real-time momentum curves.</p>
        </div>
        
        <div className="flex items-center space-x-4">
           <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-6 shadow-xl">
              <div className="flex items-center space-x-3">
                 <ShieldAlert className={isWarCrisis ? 'text-rose-500 animate-pulse' : 'text-slate-600'} size={20} />
                 <span className={`text-[10px] font-black uppercase tracking-widest ${isWarCrisis ? 'text-rose-400' : 'text-slate-500'}`}>War Crisis Scenario</span>
                 <button 
                   onClick={() => setIsWarCrisis(!isWarCrisis)}
                   className={`w-12 h-6 rounded-full transition-all relative ${isWarCrisis ? 'bg-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.4)]' : 'bg-slate-800'}`}
                 >
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isWarCrisis ? 'left-7' : 'left-1'}`} />
                 </button>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div className="flex items-center space-x-3">
                 <Filter size={16} className="text-slate-500" />
                 <select 
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value as any)}
                   className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-300 outline-none cursor-pointer"
                 >
                    <option value="composite" className="bg-slate-900">Sort: Composite IQ</option>
                    <option value="return" className="bg-slate-900">Sort: Target Return</option>
                    <option value="momentum" className="bg-slate-900">Sort: Momentum</option>
                 </select>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ranked.slice(0, 3).map((item, idx) => (
          <div key={item.symbol} className="relative overflow-hidden bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] group hover:border-blue-500/50 transition-all duration-500 shadow-2xl">
             <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px]" />
             <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl font-black text-slate-400 shadow-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                   #{idx + 1}
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Composite Score</div>
                   <div className="text-5xl font-black text-blue-400 tracking-tighter group-hover:scale-110 transition-transform origin-right">{item.composite.toFixed(1)}</div>
                </div>
             </div>
             <h3 className="text-3xl font-black text-white italic">{item.symbol}</h3>
             <span className="text-slate-500 font-bold block mt-1">{item.name}</span>
             
             <div className="mt-12 space-y-5">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Quantum Target</span>
                   <span className="font-mono font-black text-blue-400">${item.targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Expected Return</span>
                   <span className={`font-mono font-black ${item.expectedReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.expectedReturn >= 0 ? '+' : ''}{item.expectedReturn.toFixed(2)}%
                   </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Momentum Factor</span>
                   <span className={`font-mono font-black ${item.momentum >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                    {item.momentum >= 0 ? '+' : ''}{item.momentum.toFixed(2)}%
                   </span>
                </div>
             </div>
             
             <button 
               onClick={() => navigate(`/asset/${item.symbol}`)}
               className="w-full mt-10 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] rounded-2xl transition-all border border-slate-700 uppercase tracking-widest flex items-center justify-center gap-2 group/btn"
             >
               <span>Intelligence Synthesis</span>
               <TrendingUp size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
             </button>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-slate-800/40 border-b border-slate-800">
             <tr>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rank</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Component</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Composite IQ Score</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantum Upside</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
             {ranked.slice(3).map((item, idx) => (
                <tr key={item.symbol} className="hover:bg-slate-800/20 transition-colors group">
                   <td className="px-10 py-6 font-black text-slate-600">#{idx + 4}</td>
                   <td className="px-10 py-6">
                      <div className="font-black text-white text-lg group-hover:text-blue-400 transition-colors">{item.symbol}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.name}</div>
                   </td>
                   <td className="px-10 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${item.composite}%` }} />
                        </div>
                        <span className="text-sm font-mono font-black text-slate-300">{item.composite.toFixed(1)}</span>
                      </div>
                   </td>
                   <td className="px-10 py-6">
                      <span className={`font-mono font-black ${item.expectedReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.expectedReturn >= 0 ? '+' : ''}{item.expectedReturn.toFixed(2)}%
                      </span>
                   </td>
                   <td className="px-10 py-6 text-right">
                      <button 
                        onClick={() => navigate(`/asset/${item.symbol}`)}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-black text-slate-300 rounded-xl border border-slate-700 uppercase tracking-widest transition-all"
                      >
                        Deep Dive
                      </button>
                   </td>
                </tr>
             ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2rem] text-center border-dashed">
         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
           <Zap size={14} className="text-blue-500" />
           Calculation Logic: (Expected Return / Sector Volatility) × Momentum Weighting
         </p>
      </div>
    </div>
  );
};

export default Ranking;
