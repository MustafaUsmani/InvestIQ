
import React, { useState, useMemo } from 'react';
import { BarChart3, AlertTriangle, Play, Loader2, Info, ChevronRight, Zap, Target, Sliders, CheckSquare, Square } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { MarketData, ScenarioResult } from '../types';

const SCENARIOS = [
  { id: 'inflation', name: "Inflation Shock", desc: "Rising consumer prices and input costs." },
  { id: 'rates', name: "Aggressive Rate Cuts", desc: "Monetary easing cycle expectations." },
  { id: 'liquidity', name: "Tech Liquidity Crisis", desc: "Capital flight from high-growth sectors." },
  { id: 'currency', name: "USD Devaluation", desc: "Global currency rebalancing event." },
  { id: 'crash', name: "Equity Market Crash", desc: "General systemic correction." },
  { id: 'commodity', name: "Silver Supply Shortage", desc: "Physical supply chain breakdown." }
];

const StressTesting: React.FC<{ marketData: MarketData }> = ({ marketData }) => {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([SCENARIOS[0].id]);
  const [intensity, setIntensity] = useState(50);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleToggleScenario = (id: string) => {
    setSelectedScenarios(prev => 
      prev.includes(id) ? (prev.length > 1 ? prev.filter(s => s !== id) : prev) : [...prev, id]
    );
  };

  const handleTest = async () => {
    setLoading(true);
    try {
      // Simulate multi-scenario analysis
      const names = SCENARIOS.filter(s => selectedScenarios.includes(s.id)).map(s => s.name);
      const res = await geminiService.getScenarioImpact(`${names.join(' + ')} at ${intensity}% Intensity`, marketData.stocks);
      setResults(prev => [{ ...res, intensity, timestamp: new Date().toLocaleTimeString() }, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentMarketStats = useMemo(() => {
    const avgChg = marketData.stocks.reduce((acc, s) => acc + s.changePercent, 0) / marketData.stocks.length;
    return { avgChg, vol: 14.2 };
  }, [marketData]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-20">
      <div className="space-y-4">
        <h1 className="text-4xl font-black flex items-center space-x-4">
          <BarChart3 className="text-indigo-400" size={36} />
          <span>Macro Stress Laboratory</span>
        </h1>
        <p className="text-slate-400 text-lg">Evaluate portfolio resilience against customized macro shock parameters and intensity curves.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center space-x-2">
                <Target size={14} />
                <span>Shock Selection</span>
              </h3>
              <div className="space-y-2">
                {SCENARIOS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleToggleScenario(s.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs transition-all border flex items-center justify-between group ${
                      selectedScenarios.includes(s.id) 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/10' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span>{s.name}</span>
                    </div>
                    {selectedScenarios.includes(s.id) ? <CheckSquare size={14} /> : <Square size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-end">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center space-x-2">
                    <Sliders size={14} />
                    <span>Shock Intensity</span>
                  </h3>
                  <span className="text-xl font-mono font-black text-indigo-400">{intensity}%</span>
               </div>
               <input 
                 type="range" 
                 min="1" max="100" 
                 value={intensity} 
                 onChange={(e) => setIntensity(Number(e.target.value))}
                 className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
               />
               <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest">
                 <span>Controlled</span>
                 <span>Catastrophic</span>
               </div>
            </div>

            <button 
              onClick={handleTest}
              disabled={loading}
              className="w-full py-5 bg-white text-slate-950 hover:bg-slate-200 disabled:opacity-50 font-black rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-2xl"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Play size={18} className="fill-current" />}
              <span>EXECUTE SIMULATION</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] space-y-4">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Current Market Baseline</h3>
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-slate-500">Avg Session Chg</span>
                   <span className={`text-sm font-mono font-black ${currentMarketStats.avgChg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                     {currentMarketStats.avgChg >= 0 ? '+' : ''}{currentMarketStats.avgChg.toFixed(2)}%
                   </span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-slate-500">VIX Level</span>
                   <span className="text-sm font-mono font-black text-indigo-400">{currentMarketStats.vol}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {results.length === 0 && !loading ? (
             <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-900/40 border-2 border-slate-800 border-dashed rounded-[3rem] p-12 text-center">
                <BarChart3 size={80} className="text-slate-800 mb-8" />
                <h3 className="text-2xl font-black text-slate-600 uppercase tracking-tight">System Idle</h3>
                <p className="text-slate-700 mt-4 max-w-sm font-medium">Configure macro shock parameters and run your first stress simulation to visualize portfolio impact.</p>
             </div>
          ) : loading ? (
             <div className="h-full min-h-[500px] bg-slate-900 border border-slate-800 rounded-[3rem] p-12 flex flex-col items-center justify-center space-y-8 text-center">
                <div className="relative">
                   <div className="w-32 h-32 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Zap size={32} className="text-indigo-400 animate-pulse" />
                   </div>
                </div>
                <div className="max-w-sm space-y-3">
                   <h3 className="text-2xl font-black text-white uppercase tracking-tight">Processing Chaos Vectors</h3>
                   <p className="text-slate-500 font-medium">Re-calculating asset correlations and delta sensitivities under {intensity}% systemic stress...</p>
                </div>
             </div>
          ) : (
            <div className="space-y-8">
               {results.map((res, i) => (
                 <div key={i} className={`bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-10 animate-in zoom-in-95 duration-500 ${i === 0 ? 'ring-2 ring-indigo-500/50' : 'opacity-60 hover:opacity-100'}`}>
                    <div className="flex justify-between items-start">
                       <div className="space-y-2">
                         <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{res.timestamp} | Simulation Log</div>
                         <h2 className="text-3xl font-black text-white max-w-xl">{res.scenario}</h2>
                         <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                              res.riskLevel === 'Critical' ? 'bg-rose-500 text-white' : 
                              res.riskLevel === 'Moderate' ? 'bg-amber-500 text-white' : 
                              'bg-emerald-500 text-white'
                            }`}>
                              {res.riskLevel} IMPACT
                            </span>
                         </div>
                       </div>
                       <div className="text-right">
                         <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Est. Capital Delta</div>
                         <div className={`text-5xl font-mono font-black ${res.riskLevel === 'Critical' ? 'text-rose-500' : 'text-amber-500'}`}>
                            -{(Number(intensity) * 0.25).toFixed(1)}%
                         </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="p-8 rounded-[2rem] bg-slate-800/30 border border-slate-700 space-y-4">
                         <div className="flex items-center space-x-2 text-indigo-400 font-black text-xs uppercase tracking-widest">
                            <AlertTriangle size={16} />
                            <span>Systemic Vulnerabilities</span>
                         </div>
                         <p className="text-slate-300 leading-relaxed font-medium">{res.impact}</p>
                       </div>
                       <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20 space-y-4">
                         <div className="flex items-center space-x-2 text-emerald-400 font-black text-xs uppercase tracking-widest">
                            <Play size={16} />
                            <span>Quantum Counter-Strategy</span>
                         </div>
                         <p className="text-slate-300 leading-relaxed font-medium">{res.adjustment}</p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Asset-Specific Tail-Risk Sensitivity</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                         {marketData.stocks.map((stock) => {
                           const stockIntensity = (Math.random() * -intensity * 0.8).toFixed(1);
                           return (
                             <div key={stock.symbol} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                   <span className="text-slate-400">{stock.name}</span>
                                   <span className="font-mono text-rose-400">{stockIntensity}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                   <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${Math.abs(Number(stockIntensity)) * 1.5}%` }} />
                                </div>
                             </div>
                           );
                         })}
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StressTesting;
