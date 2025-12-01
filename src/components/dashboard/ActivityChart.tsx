import {
  ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface ActivityChartProps {
  data: any[];
  formatDuration: (s: number) => string;
}

export const ActivityChart = ({ data, formatDuration }: ActivityChartProps) => {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">Fluxo de Atividade</h3>
        <p className="text-xs text-zinc-400">Tendência diária e volume de estudo</p>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#71717a" 
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#71717a"
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}m`}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ fontSize: '12px' }}
              labelStyle={{ color: '#a1a1aa', marginBottom: '8px' }}
              formatter={(value: any, name: any, props: any) => {
                const rawSeconds = props.payload[`${name === 'Total' ? 'total' : name}Seconds`]; 
                const seconds = rawSeconds !== undefined ? rawSeconds : Math.round(value * 60);
                
                const nameMap: any = { video: 'Vídeo', reading: 'Leitura', coding: 'Código', review: 'Revisão', other: 'Outro', total: 'Total' };
                return [formatDuration(seconds), nameMap[name] || name];
              }}
            />
            <Area type="monotone" dataKey="total" stroke="none" fill="url(#colorTotal)" />
            <Bar dataKey="video" stackId="a" fill="#a855f7" radius={[0, 0, 0, 0]} barSize={20} />
            <Bar dataKey="reading" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} barSize={20} />
            <Bar dataKey="coding" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={20} />
            <Bar dataKey="review" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} barSize={20} />
            <Bar dataKey="other" stackId="a" fill="#6b7280" radius={[4, 4, 0, 0]} barSize={20} />
            <Line type="monotone" dataKey="total" stroke="#fff" strokeWidth={2} dot={false} activeDot={{ r: 4 }} opacity={0.5} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
