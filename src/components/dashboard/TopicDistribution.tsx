import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GroupBy } from '@/hooks/useDashboardCharts';

interface TopicDistributionProps {
  data: any[];
  formatDuration: (s: number) => string;
  groupBy?: GroupBy;
}

// Paleta de cores base
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
const truncateName = (name: string, maxLength: number = 25): string => {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength) + '...';
};

// Tooltip customizado com nomes completos
const CustomPieTooltip = ({ active, payload, formatDuration, groupBy }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg">
        <p className="text-xs font-medium text-zinc-100 mb-1">{entry.name}</p>
        <p className="text-xs text-zinc-400">{formatDuration(entry.value)}</p>
      </div>
    );
  }
  return null;
};

export const TopicDistribution = ({ data, formatDuration, groupBy = 'studyType' }: TopicDistributionProps) => {
  const STUDY_TYPE_COLORS = { video: '#a855f7', reading: '#3b82f6', coding: '#10b981', review: '#f97316', other: '#6b7280' };
  const STUDY_TYPE_LABELS: any = { video: 'Vídeo', reading: 'Leitura', coding: 'Código', review: 'Revisão', other: 'Outro' };

  const getColor = (index: number, name: string) => {
    if (groupBy === 'studyType') {
      return (STUDY_TYPE_COLORS as any)[name] || '#6b7280';
    } else {
      // Gerar cores únicas para cada curso
      const displayDataCount = Math.min(data.length, 5);
      const uniqueColors = generateUniqueColors(displayDataCount);
      return uniqueColors[index % displayDataCount];
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

  // Para modo curso, mostrar apenas top 5 na legenda
  const displayData = groupBy === 'studyType' ? data : data.slice(0, 5);
  const hiddenCount = groupBy === 'course' ? Math.max(0, data.length - 5) : 0;

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-xs text-zinc-400">
          {subtitle}
          {hiddenCount > 0 && <span className="ml-2 text-zinc-500">(+{hiddenCount} não mostrados)</span>}
        </p>
      </div>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(index, entry.name)} />
              ))}
            </Pie>
            <Tooltip 
              content={<CustomPieTooltip formatDuration={formatDuration} groupBy={groupBy} />}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value) => (
                <span className="text-zinc-400 text-xs ml-1" title={getLabel(value)}>
                  {truncateName(getLabel(value), 20)}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
