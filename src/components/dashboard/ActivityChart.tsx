import {
  ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { GroupBy } from '@/hooks/useDashboardCharts';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

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

// Paleta de cores base - cores vibrantes e distintas
const BASE_COURSE_COLORS = [
  '#a855f7', '#3b82f6', '#10b981', '#f97316', '#ec4899',
  '#f59e0b', '#8b5cf6', '#06b6d4', '#14b8a6', '#d946ef',
  '#06b6d4', '#f43f5e', '#14b8a6', '#7c3aed', '#0891b2',
  '#059669', '#dc2626', '#ea580c', '#0d9488', '#5b21b6'
];

// Gerar cores variadas com tons mais claros e mais escuros
const generateUniqueColors = (count: number): string[] => {
  if (count <= BASE_COURSE_COLORS.length) {
    return BASE_COURSE_COLORS.slice(0, count);
  }

  const colors: string[] = [...BASE_COURSE_COLORS];
  
  // Adicionar tons mais claros (lighten)
  for (let i = 0; i < Math.ceil((count - BASE_COURSE_COLORS.length) / 2); i++) {
    const baseColor = BASE_COURSE_COLORS[i % BASE_COURSE_COLORS.length];
    colors.push(lightenColor(baseColor, 0.3));
  }
  
  // Adicionar tons mais escuros (darken)
  for (let i = 0; i < Math.floor((count - BASE_COURSE_COLORS.length) / 2); i++) {
    const baseColor = BASE_COURSE_COLORS[i % BASE_COURSE_COLORS.length];
    colors.push(darkenColor(baseColor, 0.3));
  }
  
  return colors.slice(0, count);
};

// Converter hex para HSL, ajustar leveza, converter de volta
const lightenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.min(100, hsl.l + percent * 100);
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
};

const darkenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.max(0, hsl.l - percent * 100);
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

const hslToRgb = (h: number, s: number, l: number) => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

// Truncar nomes longos com '...'
const truncateName = (name: string, maxLength: number = 30): string => {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength) + '...';
};

// Componente customizado para tooltip com nomes completos
const CustomTooltip = ({ active, payload, label, courseInfoMap, formatDuration, groupBy }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg">
        <p className="text-xs text-zinc-400 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          const name = entry.name === 'total' ? 'Total' : 
            groupBy === 'studyType' ? entry.name : 
            (courseInfoMap?.[entry.name] || entry.name);
          
          const rawSeconds = entry.payload[`${entry.dataKey}_seconds`] ?? 
            entry.payload[`${entry.dataKey === 'total' ? 'total' : entry.dataKey}Seconds`];
          const seconds = rawSeconds !== undefined ? rawSeconds : Math.round(entry.value * 60);
          
          const nameMap: any = { 
            video: 'Vídeo', reading: 'Leitura', coding: 'Código', 
            review: 'Revisão', other: 'Outro' 
          };
          const displayName = groupBy === 'studyType' ? (nameMap[name] || name) : name;
          
          return (
            <div key={index} className="flex justify-between gap-4 text-xs">
              <span style={{ color: entry.color }} className="font-medium">
                {displayName}:
              </span>
              <span className="text-zinc-300">{formatDuration(seconds)}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export const ActivityChart = ({ data, formatDuration, groupBy = 'studyType', courseInfoMap = {} }: ActivityChartProps) => {
  const isStudyTypeMode = groupBy === 'studyType';
  const [showAllCourses, setShowAllCourses] = useState(false);
  
  const getCourseName = (courseId: string) => {
    return courseInfoMap[courseId] || `Curso ${courseId.slice(0, 8)}`;
  };

  const getCourseColors = () => {
    const courseIds = Object.keys(courseInfoMap || {});
    const uniqueColors = generateUniqueColors(courseIds.length);
    const colorMap: { [key: string]: string } = {};
    courseIds.forEach((id, idx) => {
      colorMap[id] = uniqueColors[idx];
    });
    return colorMap;
  };

  const courseColors = getCourseColors();
  
  // Limitar a 5 cursos por padrão, mostrar todos se clicado "expandir"
  const courseIds = Object.keys(courseInfoMap || {});
  const visibleCourseIds = showAllCourses ? courseIds : courseIds.slice(0, 5);
  const hiddenCoursesCount = courseIds.length - visibleCourseIds.length;

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
        content={<CustomTooltip groupBy={groupBy} formatDuration={formatDuration} courseInfoMap={courseInfoMap} />}
        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
      />
      <Area type="monotone" dataKey="total" stroke="none" fill="url(#colorTotal)" />
      <Bar dataKey="video" stackId="a" fill={COLORS.video} radius={[0, 0, 0, 0]} barSize={20} />
      <Bar dataKey="reading" stackId="a" fill={COLORS.reading} radius={[0, 0, 0, 0]} barSize={20} />
      <Bar dataKey="coding" stackId="a" fill={COLORS.coding} radius={[0, 0, 0, 0]} barSize={20} />
      <Bar dataKey="review" stackId="a" fill={COLORS.review} radius={[0, 0, 0, 0]} barSize={20} />
      <Bar dataKey="other" stackId="a" fill={COLORS.other} radius={[4, 4, 0, 0]} barSize={20} />
      <Line type="monotone" dataKey="total" stroke="#fff" strokeWidth={2} dot={false} activeDot={{ r: 4 }} opacity={0.5} />
      <Legend 
        wrapperStyle={{ paddingTop: '20px' }}
        formatter={(value) => {
          const nameMap: any = { 
            video: 'Vídeo', reading: 'Leitura', coding: 'Código', 
            review: 'Revisão', other: 'Outro', total: 'Total' 
          };
          return nameMap[value] || value;
        }}
      />
    </ComposedChart>
  );

  const renderCourseChart = () => {
    return (
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: showAllCourses ? 80 : 40 }}>
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
          content={<CustomTooltip groupBy={groupBy} formatDuration={formatDuration} courseInfoMap={courseInfoMap} />}
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
        />
        <Area type="monotone" dataKey="total" stroke="none" fill="url(#colorTotalCourse)" />
        {visibleCourseIds.map((courseId, idx) => (
          <Bar 
            key={courseId}
            dataKey={courseId} 
            stackId="a" 
            fill={courseColors[courseId]} 
            radius={idx === visibleCourseIds.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            barSize={20}
          />
        ))}
        <Line type="monotone" dataKey="total" stroke="#fff" strokeWidth={2} dot={false} activeDot={{ r: 4 }} opacity={0.5} />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => {
            const displayName = value === 'total' ? 'Total' : getCourseName(value);
            return truncateName(displayName, 25);
          }}
          height={showAllCourses ? 60 : 36}
        />
      </ComposedChart>
    );
  };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-full flex flex-col">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Fluxo de Atividade</h3>
          <p className="text-xs text-zinc-400">
            {isStudyTypeMode ? 'Tendência diária por tipo de estudo' : 'Tendência diária por curso/aula'}
          </p>
        </div>
        {!isStudyTypeMode && hiddenCoursesCount > 0 && (
          <button
            onClick={() => setShowAllCourses(!showAllCourses)}
            className="text-xs px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors flex items-center gap-1"
            title={`${hiddenCoursesCount} cursos ocultos`}
          >
            <ChevronDown className="h-3 w-3" />
            +{hiddenCoursesCount}
          </button>
        )}
      </div>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {isStudyTypeMode ? renderStudyTypeChart() : renderCourseChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
