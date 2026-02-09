
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Info, Activity, Database, AlertTriangle, BarChart3, Clock, Zap, CheckCircle, ShieldCheck, RefreshCw, Target } from 'lucide-react';
import { marketService } from '../services/marketService';
import { geminiService } from '../services/geminiService';
import PriceChart from '../components/PriceChart';
import { Asset } from '../types';

const AssetDetail: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [timeframe, setTimeframe] = useState('1M');
  const [executing, setExecuting] = useState(false);
  const [executed, setExecuted] = useState(false);

  useEffect(() => {
    const fetchAssetData = async () => {
      if (!symbol) return;
      const data = marketService.getAsset(symbol);
      if (data) {
        setAsset(data);
        setLoadingHistory(true);
        const range = timeframe === '1D' ? '1d' : timeframe === '1W' ? '5d' : timeframe === '1M' ? '1mo' : timeframe === '3M' ? '3mo' : '1y';
        const hist = await marketService.fetchRealHistory(symbol, range);
        setHistory(hist);
        setLoadingHistory(false);
      }
    };
    fetchAssetData();
  }, [symbol, timeframe]);

  useEffect(() => {
    const fetchForecast = async () => {
      if (asset && history.length > 0) {
        setLoadingForecast(true);
        try {
          const res = await geminiService.generateQuantumForecast(
            asset, 
            history, 
            marketService.getMarketOverview().news
          );
          setForecast(res);
        } catch (e) {
          console.error("Forecast failed", e);
        } finally {
          setLoadingForecast(false);
        }
      }
    };
    fetchForecast();
  }, [asset?.symbol, history]);

  const handleExecute = () => {
    setExecuting(true);
    setTimeout(() => {
      setExecuting(false);
      setExecuted(true);
      setTimeout(() => setExecuted(false), 3000);
    }, 1500);
  };

  if (!asset) return <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest">Synchronizing Market Vector...</div>;

  const isUp = asset.change >= 0;
  const fvGap = forecast ? ((forecast.fairValue / asset.price) - 1) * 100 : 0;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate(-1)} className="p-4 bg-slate-900 border border-slate-800 rounded-3xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-blue-500/10">
            <ArrowLeft size={20} className="text-slate-300" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-5xl font-black tracking-tighter text-white">{asset.symbol}</h1>
              <div className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">{asset.sector || asset.type}</div>
            </div>
            <p className="text-slate-400 font-bold text-lg mt-1">{asset.name}</p>
          </div>
        </div>
        
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-[2rem] flex items-center gap-12 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Activity size={80} />
           </div>
           <div className="text-right relative z-10">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Live Price</div>
              <div className={`text-4xl font-mono font-black ${isUp ? 'text-emerald-400' : 'text-rose-400'} tracking-tighter`}>
                ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
           </div>
           <div className="h-12 w-px bg-slate-800" />
           <div className="text-right relative z-10">
              <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Intrinsic Fair Value</div>
              <div className="text-4xl font-mono font-black text-blue-400 tracking-tighter">
                {loadingForecast ? <div className="animate-pulse">---.--</div> : `$${Number(forecast?.fairValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              </div>
              {!loadingForecast && (
                <div className={`text-[10px] font-black uppercase tracking-widest mt-1 ${fvGap >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {fvGap >= 0 ? 'Undervalued' : 'Overvalued'} {Math.abs(fvGap).toFixed(2)}%
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-10">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 space-y-8 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center space-x-3 text-slate-200">
                <BarChart3 size={24} className="text-blue-500" />
                <span className="uppercase tracking-tight font-black italic">Alpha Analytics Lab</span>
              </h3>
              <div className="flex bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-inner">
                {['1D', '1W', '1M', '3M', '1Y'].map(t => (
                  <button key={t} onClick={() => setTimeframe(t)} className={`px-5 py-2 text-[10px] font-black rounded-xl transition-all ${timeframe === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="h-[480px] w-full bg-slate-950/40 rounded-[2.5rem] p-8 border border-slate-800/50 relative">
              {loadingHistory ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="animate-spin text-blue-500" size={40} />
                </div>
              ) : (
                <PriceChart data={history} type="candle" showIndicators={true} />
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-blue-500/20 rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute -bottom-12 -right-12 opacity-5 text-blue-400 group-hover:scale-110 transition-transform">
               <ShieldCheck size={200} />
            </div>
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-5">
                <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
                  <Target size={32} />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Quantum Rationale Synthesis</h2>
              </div>
              {forecast && (
                <div className="bg-slate-950/80 border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-4">
                  <div>
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Model Confidence</div>
                    <div className="text-3xl font-mono font-black text-blue-400">{forecast.confidence}%</div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-10 rounded-[2rem] bg-slate-950/60 border border-slate-800/80 shadow-inner">
              <p className="text-2xl text-slate-300 leading-relaxed font-serif italic text-center">
                {loadingForecast ? 'Fusing intrinsic fair value with news catalysts...' : forecast?.reasoning || 'Synthesizing market signals...'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-10">
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-xl">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                <Activity size={16} className="text-indigo-500" /> Statistical Benchmarks
              </h3>
              <div className="space-y-6">
                 <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <span className="text-sm font-bold text-slate-400">Target Forecast</span>
                    <span className="font-mono font-black text-blue-400">${forecast?.price?.toFixed(2) || '---.--'}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <span className="text-sm font-bold text-slate-400">Intrinsic Upside</span>
                    <span className={`font-mono font-black ${fvGap >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {fvGap >= 0 ? '+' : ''}{fvGap.toFixed(2)}%
                    </span>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <span className="text-sm font-bold text-slate-400">Sharpe Proxy</span>
                    <span className="font-mono font-black text-slate-200">2.14</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-400">Sector Rank</span>
                    <span className="font-mono font-black text-emerald-400">Top 5%</span>
                 </div>
              </div>
           </div>

           <button onClick={handleExecute} disabled={executing || executed} className={`w-full py-6 font-black rounded-3xl shadow-2xl transition-all uppercase tracking-widest text-sm flex items-center justify-center space-x-3 group ${executed ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-500 active:scale-95'} text-white`}>
             {executing ? <RefreshCw className="animate-spin" /> : executed ? <CheckCircle /> : <Zap className="group-hover:fill-current" />}
             <span>{executing ? 'Optimizing Weights...' : executed ? 'Exposure Adjusted' : 'Update Portfolio'}</span>
           </button>
           
           <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl text-center space-y-2">
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Logic Source</div>
              <p className="text-[10px] text-slate-500 font-bold leading-tight">Quant engine using intrinsic fair value weighting. Predictive vectors synthesized from 30D history and live sentiment clusters.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
