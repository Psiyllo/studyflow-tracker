import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface FocusRadarProps {
  data: any[];
}

// Truncar nomes longos com '...'
const truncateName = (name: string, maxLength: number = 20): string => {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength) + '...';
};

// Tooltip customizado com nomes completos
const CustomRadarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg">
        <p className="text-xs font-medium text-zinc-100 mb-1">{entry.payload.subject}</p>
        <p className="text-xs text-zinc-400">{entry.value} min</p>
      </div>
    );
  }
  return null;
};

export const FocusRadar = ({ data }: FocusRadarProps) => {
  // Limitar a 8 itens para não ficar muito confuso
  const displayData = data.slice(0, 8);
  const hiddenCount = Math.max(0, data.length - 8);

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-white">Radar de Foco</h3>
        <p className="text-xs text-zinc-400">
          Equilíbrio entre áreas
          {hiddenCount > 0 && <span className="ml-2 text-zinc-500">(+{hiddenCount} não mostrados)</span>}
        </p>
      </div>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={displayData}>
            <PolarGrid stroke="#3f3f46" strokeOpacity={0.5} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#a1a1aa', fontSize: 10 }}
              tickFormatter={(value) => truncateName(value, 15)}
            />
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
              content={<CustomRadarTooltip />}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
