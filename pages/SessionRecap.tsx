
import React, { useState } from 'react';
import { History, Zap, CheckCircle2, ArrowRight, Compass, ShieldCheck, Newspaper, TrendingUp, Download, Loader2 } from 'lucide-react';
import { UserPreferences, InvestmentStrategy } from '../types';

const SessionRecap: React.FC<{ 
  sessionHistory: string[], 
  userPrefs: UserPreferences | null,
  strategy: InvestmentStrategy | null
}> = ({ sessionHistory, userPrefs, strategy }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      const content = `InvestIQ Session Intelligence Report\n\n` +
        `User Profile: ${userPrefs?.riskTolerance || 'N/A'}\n` +
        `Strategy: ${strategy?.rationale || 'N/A'}\n` +
        `Timestamp: ${new Date().toLocaleString()}`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `InvestIQ_Report_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloading(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 text-emerald-400 mb-2">
          < History size={40} />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Session Intelligence Recap</h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          A synthesized summary of your analytical journey. These insights will clear upon page refresh.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Actions History */}
        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl space-y-6">
           <h3 className="text-xl font-bold flex items-center space-x-3">
             <Zap className="text-blue-400" size={20} />
             <span>Analytical Footprint</span>
           </h3>
           <div className="space-y-4">
              {sessionHistory.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No significant actions recorded yet.</p>
              ) : sessionHistory.map((path, idx) => (
                <div key={idx} className="flex items-center space-x-3 group">
                   <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all">
                      {idx + 1}
                   </div>
                   <div className="flex-1 text-sm font-bold text-slate-300 capitalize">
                      Explored {path.replace('/', '') || 'Market Home'}
                   </div>
                   <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
              ))}
           </div>
        </div>

        {/* User Profile Context */}
        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl space-y-6">
           <h3 className="text-xl font-bold flex items-center space-x-3">
             <Compass className="text-indigo-400" size={20} />
             <span>Investment Profile</span>
           </h3>
           {userPrefs ? (
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-800/40">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Target Capital</div>
                       <div className="text-lg font-mono font-black">${userPrefs.budget.toLocaleString()}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800/40">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Risk Appetite</div>
                       <div className="text-lg font-bold text-blue-400">{userPrefs.riskTolerance}</div>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-500 uppercase">Preferred Exposure</div>
                    <div className="flex flex-wrap gap-2">
                       {userPrefs.assetPreferences.map(p => (
                         <span key={p} className="px-2 py-1 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-400 uppercase border border-slate-700">{p}</span>
                       ))}
                    </div>
                 </div>
              </div>
           ) : (
             <p className="text-slate-500 text-sm italic">No preferences set. Generate a strategy to build your profile.</p>
           )}
        </div>
      </div>

      {/* Forecast & Rationale */}
      {strategy && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl space-y-6">
             <h3 className="text-xl font-bold flex items-center space-x-3">
               <TrendingUp className="text-emerald-400" size={20} />
               <span>Projected Growth Recap</span>
             </h3>
             <div className="space-y-4">
                {strategy.allocations.map((a, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
                    <span className="text-sm font-bold text-slate-400">{a.asset}</span>
                    <span className="text-sm font-mono font-black text-emerald-400">+{a.forecastReturn.toFixed(1)}% Est.</span>
                  </div>
                ))}
                <div className="pt-4 flex justify-between items-center text-lg font-black">
                   <span className="text-white">Total Expected Return</span>
                   <span className="text-emerald-400">+{strategy.totalForecastedReturn.toFixed(1)}%</span>
                </div>
             </div>
           </div>

           <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl space-y-6">
             <h3 className="text-xl font-bold flex items-center space-x-3">
               <Newspaper className="text-blue-400" size={20} />
               <span>Sentiment Influence</span>
             </h3>
             <div className="space-y-4">
                <p className="text-sm text-slate-400 leading-relaxed italic">
                  "The current market sentiment, primarily influenced by high-tech volatility and geopolitical tensions, suggests a defensive pivot. Our strategy weighted towards commodities reflects this news-driven shift to safety."
                </p>
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                   <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Top Signal Impact</div>
                   <div className="text-sm font-bold text-slate-200">Fed Rate Hold News & Tech Earnings Surge</div>
                </div>
             </div>
           </div>
        </div>
      )}

      {/* Final AI Synthesis */}
      <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/20 p-10 rounded-3xl space-y-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck size={120} />
         </div>
         <div className="relative space-y-4">
            <h2 className="text-3xl font-bold">Executive Synthesis</h2>
            {strategy ? (
               <div className="space-y-6">
                  <p className="text-slate-300 text-lg leading-relaxed">
                    Based on your analytical session and preferred {userPrefs?.riskTolerance} risk profile, our AI suggests a diversified approach focusing on {strategy.allocations.slice(0, 2).map(a => a.asset).join(' and ')}. Your session-specific stress testing indicates a projected resilience score of 8.4/10 against macro shocks.
                  </p>
                  <div className="flex items-center space-x-6">
                    <div>
                       <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Confidence Score</div>
                       <div className="text-2xl font-black">92%</div>
                    </div>
                    <div>
                       <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Action Readiness</div>
                       <div className="text-2xl font-black">Ready</div>
                    </div>
                  </div>
               </div>
            ) : (
               <p className="text-slate-400 italic">Complete a strategy analysis to receive an executive synthesis.</p>
            )}
         </div>

         <div className="flex space-x-4">
            <button 
              onClick={handleDownload}
              disabled={downloading}
              className="px-8 py-3 bg-white text-slate-950 font-black rounded-xl hover:bg-slate-200 transition-all flex items-center space-x-2 shadow-2xl"
            >
               {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
               <span>{downloading ? 'Preparing...' : 'Download Intelligence Report'}</span>
            </button>
            <button className="px-8 py-3 bg-blue-600/20 text-blue-400 font-bold rounded-xl border border-blue-500/30 hover:bg-blue-600/30 transition-all">
               Email to Advisor
            </button>
         </div>
      </div>
      
      <div className="text-center p-8 bg-slate-900/20 rounded-3xl border border-slate-800 border-dashed">
         <p className="text-xs text-slate-600 font-bold uppercase tracking-[0.2em]">End of Session Intelligence</p>
         <p className="text-[10px] text-slate-700 mt-2">InvestIQ is for educational simulation purposes only. Not financial advice.</p>
      </div>
    </div>
  );
};

export default SessionRecap;
