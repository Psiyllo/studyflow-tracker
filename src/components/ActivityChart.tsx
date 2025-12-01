import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface ActivityChartProps {
  data: any[];
  formatDuration: (s: number) => string;
}

export function ActivityChart({ data, formatDuration }: ActivityChartProps) {
  return (
    <div className="w-full h-[350px] bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">Atividade Diária</h3>
        <p className="text-sm text-zinc-400">Evolução do tempo de estudo ao longo do período</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#52525b" 
            tick={{ fill: '#71717a', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#52525b"
            tick={{ fill: '#71717a', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val}m`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
            itemStyle={{ color: '#fff' }}
            cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }}
            formatter={(value: number) => [formatDuration(Math.round(value * 60)), 'Tempo Total']}
            labelStyle={{ color: '#a1a1aa', marginBottom: '0.5rem' }}
          />
          <Area 
            type="monotone" 
            dataKey="total" 
            stroke="#8b5cf6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorTotal)" 
            activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}