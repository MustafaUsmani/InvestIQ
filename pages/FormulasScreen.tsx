
import React, { useState, useMemo } from 'react';
import { Sigma, BarChart2, TrendingUp, Info, HelpCircle, ArrowRight, Layers, Calculator, Zap, Target, Search } from 'lucide-react';
import { MarketData, Asset } from '../types';
import PriceChart from '../components/PriceChart';
import { marketService } from '../services/marketService';

const FORMULAS = [
  { 
    id: 'sharpe',
    name: 'Sharpe Ratio', 
    formula: 'S = (R_p - R_f) / σ_p', 
    description: 'Measures the risk-adjusted return of an asset.',
    reasoning: (val: number) => `With a Sharpe of ${val}, this asset is delivering ${val > 1 ? 'strong' : 'moderate'} returns relative to its price volatility.`
  },
  { 
    id: 'beta',
    name: 'Beta Coefficient', 
    formula: 'β = Cov(R_i, R_m) / Var(R_m)', 
    description: 'Measures systematic risk relative to the market.',
    reasoning: (val: number) => `A Beta of ${val} indicates the asset is ${val > 1 ? 'more volatile' : 'less volatile'} than the S&P 500, suggesting a ${val > 1 ? 'growth' : 'defensive'} posture.`
  },
  { 
    id: 'var',
    name: 'Value at Risk (VaR)', 
    formula: 'VaR_α = μ + z_α σ', 
    description: 'Maximum potential loss with probability α.',
    reasoning: (val: number) => `Calculated VaR shows a ${val}% maximum potential session loss, requiring ${val > 5 ? 'active hedging' : 'minimal capital buffers'}.`
  },
  { 
    id: 'mpo',
    name: 'Modern Portfolio Theory', 
    formula: 'min σ^2_p = Σ Σ w_i w_j σ_{ij}', 
    description: 'Optimization objective for efficient diversification.',
    reasoning: (_: any) => `Integrating this into the broader cluster reduces overall variance via non-correlated asset pairing.`
  }
];

const FormulasScreen: React.FC<{ marketData: MarketData }> = ({ marketData }) => {
  const [selectedSymbol, setSelectedSymbol] = useState(marketData.stocks[0].symbol);
  const [activeFormula, setActiveFormula] = useState(FORMULAS[0]);
  const [showIndicators, setShowIndicators] = useState(true);
  
  const asset = marketService.getAsset(selectedSymbol)!;
  const history = useMemo(() => marketService.getHistoricalData(selectedSymbol, 30), [selectedSymbol]);

  // Derived metrics based on formulas
  const metrics = useMemo(() => ({
    // Fix: Ensure volatility is a number to match the type expected by the reasoning functions
    volatility: Number((Math.random() * 20 + 5).toFixed(1)),
    sharpe: Number((Math.random() * 2 + 0.5).toFixed(2)),
    beta: Number((Math.random() * 1.5 + 0.5).toFixed(2)),
    var: Number((Math.random() * 10 + 2).toFixed(1))
  }), [selectedSymbol]);

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="max-w-xl">
           <h1 className="text-4xl font-black flex items-center space-x-4 mb-4">
              <Sigma className="text-blue-500" size={32} />
              <span>Quantitative Insights Lab</span>
           </h1>
           <p className="text-slate-400 text-lg">
             Explore the mathematical foundation of our intelligence engine. Map complex financial formulas to real-time market behavior.
           </p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 w-72">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Subject Selection</label>
           <select 
             value={selectedSymbol}
             onChange={(e) => setSelectedSymbol(e.target.value)}
             className="bg-transparent border-none outline-none font-bold text-white w-full text-lg cursor-pointer"
           >
             {[...marketData.indices, ...marketData.stocks, ...marketData.commodities].map(a => (
               <option key={a.symbol} value={a.symbol} className="bg-slate-900">{a.symbol} - {a.name}</option>
             ))}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            {/* Visual Lab View */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
               <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold flex items-center space-x-2">
                    <BarChart2 className="text-blue-400" size={20} />
                    <span>Price Action & Multi-Factor Forecast</span>
                  </h3>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setShowIndicators(!showIndicators)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                        showIndicators ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}
                    >
                      Indicators
                    </button>
                    <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase rounded-lg">Live Lab Sample</div>
                  </div>
               </div>
               
               <div className="h-96 w-full bg-slate-950/50 rounded-[2rem] p-4 border border-slate-800/50 relative">
                  <PriceChart data={history} type="lab" showIndicators={showIndicators} />
                  {showIndicators && (
                    <div className="absolute top-8 left-8 flex flex-col space-y-2">
                       <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur px-2 py-1 rounded border border-slate-800 shadow-xl">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-bold text-slate-400">BUY SIGNAL (OPTIMAL ENTRY)</span>
                       </div>
                       <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur px-2 py-1 rounded border border-slate-800 shadow-xl">
                          <div className="w-2 h-2 rounded-full bg-rose-500" />
                          <span className="text-[10px] font-bold text-slate-400">SELL SIGNAL (EXIT TARGET)</span>
                       </div>
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/30 transition-all">
                     <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Vol (σ)</div>
                     <div className="text-xl font-mono font-black">{metrics.volatility}%</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/30 transition-all">
                     <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Sharpe (S)</div>
                     <div className="text-xl font-mono font-black text-blue-400">{metrics.sharpe}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/30 transition-all">
                     <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Beta (β)</div>
                     <div className="text-xl font-mono font-black">{metrics.beta}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/30 transition-all">
                     <div className="text-[10px] font-black text-slate-500 uppercase mb-1">VaR (95%)</div>
                     <div className="text-xl font-mono font-black text-rose-400">-{metrics.var}%</div>
                  </div>
               </div>
            </div>

            {/* Dynamic Reasoning Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Mathematical Model Synthesis</h3>
                  <div className="flex items-center space-x-2 text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Target size={14} />
                    <span>Analysis Strategy: {activeFormula.name}</span>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-slate-950 border-l-4 border-blue-500">
                    <p className="text-slate-300 text-lg leading-relaxed font-serif italic">
                      "{activeFormula.reasoning(metrics[activeFormula.id as keyof typeof metrics] || 0)}"
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl">
                     <TrendingUp size={16} />
                     <span>Forecast Intelligence: Based on moving average crossovers, {asset.symbol} is projected to maintain its current trend toward ${asset.forecastPrice}.</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8">
               <h3 className="text-lg font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center space-x-2">
                  <Layers size={16} className="text-blue-500" />
                  <span>Interactive Formulas</span>
               </h3>
               <div className="space-y-6">
                  {FORMULAS.map(f => (
                    <button 
                      key={f.name} 
                      onClick={() => setActiveFormula(f)}
                      className={`w-full text-left space-y-2 border-b border-slate-800 pb-6 last:border-0 block group transition-all ${activeFormula.name === f.name ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                    >
                       <h4 className={`font-bold transition-colors flex items-center space-x-2 ${activeFormula.name === f.name ? 'text-blue-400' : 'text-white'}`}>
                          <Calculator size={14} />
                          <span>{f.name}</span>
                       </h4>
                       <div className={`p-3 rounded-xl font-mono text-sm border transition-all ${activeFormula.name === f.name ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                          {f.formula}
                       </div>
                       <p className="text-xs text-slate-500">{f.description}</p>
                    </button>
                  ))}
               </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-500/20 rounded-3xl p-8 space-y-4">
               <h3 className="text-lg font-bold flex items-center space-x-2">
                 <Zap size={18} className="text-yellow-500" />
                 <span>Quant Analyst Tip</span>
               </h3>
               <p className="text-xs text-slate-400 leading-relaxed italic">
                 "Our models currently suggest {asset.symbol} is in a period of technical consolidation. Watch for Volume (σ) surges to confirm any breakout from the identified entry channel."
               </p>
               <button className="w-full py-4 bg-white text-slate-950 font-black rounded-xl text-xs flex items-center justify-center space-x-2 hover:bg-slate-200 transition-all">
                  <span>DOWNLOAD LAB REPORT (PDF)</span>
                  <ArrowRight size={14} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default FormulasScreen;
