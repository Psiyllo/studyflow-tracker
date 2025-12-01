import {
  ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { GroupBy } from '@/hooks/useDashboardCharts';

interface ActivityChartProps {
  data: any[];
  formatDuration: (s: number) => string;
  groupBy?: GroupBy;
  courseInfoMap?: { [key: string]: string };
}

const COLORS = {
  video: '#a855f7',
  reading: '#3b82f6',
  coding: '#10b981',
  review: '#f97316',
  other: '#6b7280',
};

const COURSE_COLORS = [
  '#a855f7', '#3b82f6', '#10b981', '#f97316', '#ec4899',
  '#f59e0b', '#8b5cf6', '#06b6d4', '#14b8a6', '#d946ef'
];

export const ActivityChart = ({ data, formatDuration, groupBy = 'studyType', courseInfoMap = {} }: ActivityChartProps) => {
  const isStudyTypeMode = groupBy === 'studyType';
  
  const getCourseName = (courseId: string) => {
    return courseInfoMap[courseId] || `Curso ${courseId.slice(0, 8)}`;
  };

  const getCourseColors = () => {
    const courseIds = Object.keys(courseInfoMap || {});
    const colorMap: { [key: string]: string } = {};
    courseIds.forEach((id, idx) => {
      colorMap[id] = COURSE_COLORS[idx % COURSE_COLORS.length];
    });
    return colorMap;
  };

  const courseColors = getCourseColors();

  const renderStudyTypeChart = () => (
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
      <Bar dataKey="video" stackId="a" fill={COLORS.video} radius={[0, 0, 0, 0]} barSize={20} />
      <Bar dataKey="reading" stackId="a" fill={COLORS.reading} radius={[0, 0, 0, 0]} barSize={20} />
      <Bar dataKey="coding" stackId="a" fill={COLORS.coding} radius={[0, 0, 0, 0]} barSize={20} />
      <Bar dataKey="review" stackId="a" fill={COLORS.review} radius={[0, 0, 0, 0]} barSize={20} />
      <Bar dataKey="other" stackId="a" fill={COLORS.other} radius={[4, 4, 0, 0]} barSize={20} />
      <Line type="monotone" dataKey="total" stroke="#fff" strokeWidth={2} dot={false} activeDot={{ r: 4 }} opacity={0.5} />
    </ComposedChart>
  );

  const renderCourseChart = () => {
    const courseIds = Object.keys(courseInfoMap || {});
    
    return (
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorTotalCourse" x1="0" y1="0" x2="0" y2="1">
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
            const rawSeconds = props.payload[`${name}_seconds`] ?? props.payload[`${name === 'Total' ? 'total' : name}Seconds`];
            const seconds = rawSeconds !== undefined ? rawSeconds : Math.round(value * 60);
            const displayName = name === 'total' ? 'Total' : getCourseName(name);
            return [formatDuration(seconds), displayName];
          }}
        />
        <Area type="monotone" dataKey="total" stroke="none" fill="url(#colorTotalCourse)" />
        {courseIds.map((courseId, idx) => (
          <Bar 
            key={courseId}
            dataKey={courseId} 
            stackId="a" 
            fill={courseColors[courseId]} 
            radius={idx === courseIds.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            barSize={20}
          />
        ))}
        <Line type="monotone" dataKey="total" stroke="#fff" strokeWidth={2} dot={false} activeDot={{ r: 4 }} opacity={0.5} />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => value === 'total' ? 'Total' : getCourseName(value)}
        />
      </ComposedChart>
    );
  };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">Fluxo de Atividade</h3>
        <p className="text-xs text-zinc-400">
          {isStudyTypeMode ? 'Tendência diária por tipo de estudo' : 'Tendência diária por curso/aula'}
        </p>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {isStudyTypeMode ? renderStudyTypeChart() : renderCourseChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
