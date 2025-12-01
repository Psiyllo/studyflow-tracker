import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface TopicDistributionProps {
  data: any[]; // Dados brutos acumulados
  formatDuration: (s: number) => string;
}

const COLORS = {
  video: '#a855f7',   // Purple
  reading: '#3b82f6', // Blue
  coding: '#10b981',  // Emerald
  review: '#f97316',  // Orange
  other: '#6b7280'    // Gray
};

const LABELS: any = {
  video: 'Vídeo Aula',
  reading: 'Leitura',
  coding: 'Prática',
  review: 'Revisão',
  other: 'Outro'
};

export function TopicDistribution({ data, formatDuration }: TopicDistributionProps) {
  return (
    <div className="w-full h-[350px] bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white">Distribuição</h3>
        <p className="text-sm text-zinc-400">Foco por categoria</p>
      </div>
      
      <ResponsiveContainer width="100%" height="240px">
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
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
             itemStyle={{ color: '#fff' }}
             formatter={(value: number) => formatDuration(value)}
          />
          <Legend 
            verticalAlign="middle" 
            align="right"
            layout="vertical"
            iconType="circle"
            formatter={(value) => <span className="text-zinc-300 text-sm ml-2">{LABELS[value] || value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}