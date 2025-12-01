import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface FocusRadarProps {
  data: any[];
}

export const FocusRadar = ({ data }: FocusRadarProps) => {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-white">Radar de Foco</h3>
        <p className="text-xs text-zinc-400">Equilíbrio entre áreas</p>
      </div>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#3f3f46" strokeOpacity={0.5} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
            <Radar
              name="Minutos"
              dataKey="A"
              stroke="#10b981"
              strokeWidth={2}
              fill="#10b981"
              fillOpacity={0.2}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#10b981' }}
              formatter={(value: number) => [`${value} min`, 'Média']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
