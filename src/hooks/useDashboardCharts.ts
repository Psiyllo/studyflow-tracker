import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval, parseISO } from 'date-fns';

export type ViewMode = 'week' | 'month' | 'year';

export interface ChartDataPoint {
  date: string;
  fullDate: string;
  video: number;
  reading: number;
  coding: number;
  review: number;
  other: number;
  total: number;
  videoSeconds: number;
  readingSeconds: number;
  codingSeconds: number;
  reviewSeconds: number;
  otherSeconds: number;
  totalSeconds: number;
}

export interface DistributionDataPoint {
  name: string;
  value: number;
}

export interface RadarDataPoint {
  subject: string;
  A: number;
  fullMark: number;
}

interface DashboardChartsData {
  chartData: ChartDataPoint[];
  distributionData: DistributionDataPoint[];
  radarData: RadarDataPoint[];
  dateRange: { start: Date; end: Date };
}

interface GlobalTotals {
  video: number;
  reading: number;
  coding: number;
  review: number;
  other: number;
  [key: string]: number;
}

export const useDashboardCharts = (viewMode: ViewMode, currentDate: Date) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-charts', user?.id, viewMode, currentDate],
    queryFn: async (): Promise<DashboardChartsData> => {
      if (!user) throw new Error('User not authenticated');

      let startDate: Date;
      let endDate: Date;

      if (viewMode === 'week') {
        startDate = startOfWeek(currentDate);
        endDate = endOfWeek(currentDate);
      } else if (viewMode === 'month') {
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
      } else {
        startDate = startOfYear(currentDate);
        endDate = endOfYear(currentDate);
      }

      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('start_time, duration_seconds, study_type')
        .eq('user_id', user.id)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());

      const globalTotals: GlobalTotals = { video: 0, reading: 0, coding: 0, review: 0, other: 0 };

      const processInterval = (dates: Date[], isMonthly: boolean) => {
        const dataMap: { [key: string]: GlobalTotals } = {};
        dates.forEach(d => {
            const key = format(d, isMonthly ? 'MMM' : 'yyyy-MM-dd');
            dataMap[key] = { video: 0, reading: 0, coding: 0, review: 0, other: 0 };
        });

        sessions?.forEach(session => {
            const d = parseISO(session.start_time);
            const key = format(d, isMonthly ? 'MMM' : 'yyyy-MM-dd');
            if (dataMap[key]) {
                const duration = session.duration_seconds || 0;
                const type = session.study_type || 'other';
                
                if (type in dataMap[key]) {
                    dataMap[key][type] += duration;
                    globalTotals[type] += duration; 
                } else {
                     dataMap[key]['other'] += duration;
                     globalTotals['other'] += duration;
                }
            }
        });

        return dates.map(d => {
            const key = format(d, isMonthly ? 'MMM' : 'yyyy-MM-dd');
            const data = dataMap[key];
            const totalSec = data.video + data.reading + data.coding + data.review + data.other;

            return {
                date: format(d, isMonthly ? 'MMM' : 'dd/MM'),
                fullDate: key,
                video: Number((data.video / 60).toFixed(2)),
                reading: Number((data.reading / 60).toFixed(2)),
                coding: Number((data.coding / 60).toFixed(2)),
                review: Number((data.review / 60).toFixed(2)),
                other: Number((data.other / 60).toFixed(2)),
                total: Number((totalSec / 60).toFixed(2)),
                
                videoSeconds: data.video,
                readingSeconds: data.reading,
                codingSeconds: data.coding,
                reviewSeconds: data.review,
                otherSeconds: data.other,
                totalSeconds: totalSec,
            };
        });
      };

      let timeline;
      if (viewMode === 'year') {
        const months = eachMonthOfInterval({ start: startDate, end: endDate });
        timeline = processInterval(months, true);
      } else {
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        timeline = processInterval(days, false);
      }

      const distData = Object.keys(globalTotals).map(key => ({
        name: key,
        value: globalTotals[key]
      })).filter(d => d.value > 0);

      const radar = [
        { subject: 'Vídeo', A: Math.round(globalTotals.video / 60), fullMark: 150 },
        { subject: 'Leitura', A: Math.round(globalTotals.reading / 60), fullMark: 150 },
        { subject: 'Prática', A: Math.round(globalTotals.coding / 60), fullMark: 150 },
        { subject: 'Revisão', A: Math.round(globalTotals.review / 60), fullMark: 150 },
        { subject: 'Outro', A: Math.round(globalTotals.other / 60), fullMark: 150 },
      ];

      return {
        chartData: timeline,
        distributionData: distData,
        radarData: radar,
        dateRange: { start: startDate, end: endDate }
      };
    },
    enabled: !!user,
  });
};
