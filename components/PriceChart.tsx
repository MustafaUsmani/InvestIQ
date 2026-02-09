
import React from 'react';
import { 
  ComposedChart, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Line, 
  Scatter,
  Cell
} from 'recharts';

interface PriceChartProps {
  data: any[];
  color?: string;
  type?: 'area' | 'candle' | 'lab';
  showIndicators?: boolean;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, color = "#3b82f6", type = 'area', showIndicators = false }) => {
  const chartData = data.map((d, i) => {
    const ma7 = i >= 6 ? data.slice(i - 6, i + 1).reduce((acc, curr) => acc + curr.price, 0) / 7 : null;
    const buyPoint = i === Math.floor(data.length * 0.2) ? d.low * 0.98 : null;
    const sellPoint = i === Math.floor(data.length * 0.8) ? d.high * 1.02 : null;
    
    return {
      ...d,
      ma7,
      buyPoint,
      sellPoint,
      candleBottom: Math.min(d.open || d.price * 0.99, d.close || d.price),
      candleTop: Math.max(d.open || d.price * 0.99, d.close || d.price),
      isUp: (d.close || d.price) >= (d.open || d.price * 0.99)
    };
  });

  const axisStyle = { fontSize: 11, fill: '#94a3b8', fontWeight: 700 };
  const tooltipStyle = { 
    backgroundColor: '#0f172a', 
    border: '1px solid #334155', 
    borderRadius: '12px', 
    color: '#ffffff',
    fontSize: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  };

  if (type === 'area') {
    return (
      <div className="w-full h-full overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.3} />
            <XAxis dataKey="date" hide={true} />
            <YAxis domain={['auto', 'auto']} hide={true} />
            <Tooltip 
              contentStyle={tooltipStyle}
              itemStyle={{ color: color, fontWeight: 'bold' }}
              labelStyle={{ display: 'none' }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={color} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
          <XAxis dataKey="date" tick={axisStyle} stroke="#334155" minTickGap={30} tickLine={false} axisLine={false} />
          <YAxis domain={['auto', 'auto']} tick={axisStyle} stroke="#334155" orientation="right" tickFormatter={(val) => `$${val.toLocaleString()}`} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={tooltipStyle}
            itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
            cursor={{ stroke: '#334155', strokeWidth: 1 }}
          />
          
          <Bar dataKey="candleTop" barSize={10} radius={[2, 2, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.isUp ? '#10b981' : '#f43f5e'} />
            ))}
          </Bar>

          {showIndicators && (
            <>
              <Line type="monotone" dataKey="ma7" stroke="#f59e0b" dot={false} strokeWidth={3} name="7D Moving Avg" isAnimationActive={false} />
              <Scatter dataKey="buyPoint" fill="#10b981" shape="circle" name="AI Buy Trigger" isAnimationActive={false} stroke="#0f172a" strokeWidth={2} r={5} />
              <Scatter dataKey="sellPoint" fill="#f43f5e" shape="circle" name="AI Profit Target" isAnimationActive={false} stroke="#0f172a" strokeWidth={2} r={5} />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
