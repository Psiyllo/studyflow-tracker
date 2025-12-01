import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TopicDistributionProps {
  data: any[];
  formatDuration: (s: number) => string;
}

export const TopicDistribution = ({ data, formatDuration }: TopicDistributionProps) => {
  const COLORS = { video: '#a855f7', reading: '#3b82f6', coding: '#10b981', review: '#f97316', other: '#6b7280' };
  const LABELS: any = { video: 'Vídeo', reading: 'Leitura', coding: 'Código', review: 'Revisão', other: 'Outro' };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-white">Distribuição</h3>
        <p className="text-xs text-zinc-400">Tempo por categoria</p>
      </div>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={(COLORS as any)[entry.name]} />
              ))}
            </Pie>
            <Tooltip 
               contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
               itemStyle={{ color: '#fff', fontSize: '12px' }}
               formatter={(value: number) => formatDuration(value)}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-zinc-400 text-xs ml-1">{LABELS[value] || value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
