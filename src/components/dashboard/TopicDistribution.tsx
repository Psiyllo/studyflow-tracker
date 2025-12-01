import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GroupBy } from '@/hooks/useDashboardCharts';

interface TopicDistributionProps {
  data: any[];
  formatDuration: (s: number) => string;
  groupBy?: GroupBy;
}

export const TopicDistribution = ({ data, formatDuration, groupBy = 'studyType' }: TopicDistributionProps) => {
  const STUDY_TYPE_COLORS = { video: '#a855f7', reading: '#3b82f6', coding: '#10b981', review: '#f97316', other: '#6b7280' };
  const STUDY_TYPE_LABELS: any = { video: 'Vídeo', reading: 'Leitura', coding: 'Código', review: 'Revisão', other: 'Outro' };
  
  const COURSE_COLORS = [
    '#a855f7', '#3b82f6', '#10b981', '#f97316', '#ec4899',
    '#f59e0b', '#8b5cf6', '#06b6d4', '#14b8a6', '#d946ef'
  ];

  const getColor = (index: number, name: string) => {
    if (groupBy === 'studyType') {
      return (STUDY_TYPE_COLORS as any)[name] || '#6b7280';
    } else {
      return COURSE_COLORS[index % COURSE_COLORS.length];
    }
  };

  const getLabel = (value: string) => {
    if (groupBy === 'studyType') {
      return STUDY_TYPE_LABELS[value] || value;
    } else {
      return value; // já é o nome do curso
    }
  };

  const title = groupBy === 'studyType' ? 'Distribuição por Tipo' : 'Distribuição por Curso';
  const subtitle = groupBy === 'studyType' ? 'Tempo por categoria de estudo' : 'Tempo por curso/aula';

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-xs text-zinc-400">{subtitle}</p>
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
                <Cell key={`cell-${index}`} fill={getColor(index, entry.name)} />
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
              formatter={(value) => <span className="text-zinc-400 text-xs ml-1">{getLabel(value)}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
