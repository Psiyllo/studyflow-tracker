import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface FocusRadarProps {
  data: any[];
}

export function FocusRadar({ data }: FocusRadarProps) {
  return (
    <div className="w-full h-[350px] bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white">Equilíbrio</h3>
        <p className="text-sm text-zinc-400">Balanceamento de habilidades</p>
      </div>

      <ResponsiveContainer width="100%" height="240px">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#3f3f46" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
          <Radar
            name="Minutos"
            dataKey="A"
            stroke="#10b981"
            strokeWidth={2}
            fill="#10b981"
            fillOpacity={0.3}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
            itemStyle={{ color: '#10b981' }}
            formatter={(value: number) => [`${Math.round(value)} min`, 'Tempo Total']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}