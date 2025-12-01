import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval, parseISO } from 'date-fns';

export type ViewMode = 'week' | 'month' | 'year';
export type GroupBy = 'studyType' | 'course';

export interface ChartDataPoint {
  date: string;
  fullDate: string;
  total: number;
  totalSeconds: number;
  // Por studyType
  video?: number;
  reading?: number;
  coding?: number;
  review?: number;
  other?: number;
  videoSeconds?: number;
  readingSeconds?: number;
  codingSeconds?: number;
  reviewSeconds?: number;
  otherSeconds?: number;
  // Por course
  [key: string]: string | number | undefined;
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

interface CourseInfo {
  id: string;
  title: string;
}

interface DashboardChartsData {
  chartData: ChartDataPoint[];
  distributionData: DistributionDataPoint[];
  radarData: RadarDataPoint[];
  dateRange: { start: Date; end: Date };
  courseInfoMap?: { [key: string]: string }; // courseId -> title
}

interface GlobalTotals {
  [key: string]: number;
}

export const useDashboardCharts = (viewMode: ViewMode, currentDate: Date, groupBy: GroupBy = 'studyType') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-charts', user?.id, viewMode, currentDate, groupBy],
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

      // Buscar sessões com informações de curso
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('start_time, duration_seconds, study_type, course_id, courses(title)')
        .eq('user_id', user.id)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());

      if (groupBy === 'studyType') {
        return processByStudyType(sessions || [], viewMode, startDate, endDate);
      } else {
        return processByCourse(sessions || [], viewMode, startDate, endDate);
      }
    },
    enabled: !!user,
  });
};

// Processamento por tipo de estudo (comportamento original)
const processByStudyType = (
  sessions: any[],
  viewMode: ViewMode,
  startDate: Date,
  endDate: Date
): DashboardChartsData => {
  const globalTotals: GlobalTotals = { video: 0, reading: 0, coding: 0, review: 0, other: 0 };

  const processInterval = (dates: Date[], isMonthly: boolean) => {
    const dataMap: { [key: string]: GlobalTotals } = {};
    dates.forEach(d => {
      const key = format(d, isMonthly ? 'MMM' : 'yyyy-MM-dd');
      dataMap[key] = { video: 0, reading: 0, coding: 0, review: 0, other: 0 };
    });

    sessions.forEach(session => {
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
      const totalSec = (data.video || 0) + (data.reading || 0) + (data.coding || 0) + (data.review || 0) + (data.other || 0);

      return {
        date: format(d, isMonthly ? 'MMM' : 'dd/MM'),
        fullDate: key,
        video: Number(((data.video || 0) / 60).toFixed(2)),
        reading: Number(((data.reading || 0) / 60).toFixed(2)),
        coding: Number(((data.coding || 0) / 60).toFixed(2)),
        review: Number(((data.review || 0) / 60).toFixed(2)),
        other: Number(((data.other || 0) / 60).toFixed(2)),
        total: Number((totalSec / 60).toFixed(2)),
        videoSeconds: data.video || 0,
        readingSeconds: data.reading || 0,
        codingSeconds: data.coding || 0,
        reviewSeconds: data.review || 0,
        otherSeconds: data.other || 0,
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

  const distData = Object.keys(globalTotals)
    .map(key => ({
      name: key,
      value: globalTotals[key]
    }))
    .filter(d => d.value > 0);

  const radar = [
    { subject: 'Vídeo', A: Math.round((globalTotals.video || 0) / 60), fullMark: 150 },
    { subject: 'Leitura', A: Math.round((globalTotals.reading || 0) / 60), fullMark: 150 },
    { subject: 'Prática', A: Math.round((globalTotals.coding || 0) / 60), fullMark: 150 },
    { subject: 'Revisão', A: Math.round((globalTotals.review || 0) / 60), fullMark: 150 },
    { subject: 'Outro', A: Math.round((globalTotals.other || 0) / 60), fullMark: 150 },
  ];

  return {
    chartData: timeline,
    distributionData: distData,
    radarData: radar,
    dateRange: { start: startDate, end: endDate }
  };
};

// Processamento por curso
const processByCourse = (
  sessions: any[],
  viewMode: ViewMode,
  startDate: Date,
  endDate: Date
): DashboardChartsData => {
  const courseInfoMap: { [key: string]: string } = {};
  const globalTotals: GlobalTotals = {};

  // Coletar informações dos cursos
  sessions.forEach(session => {
    const courseId = session.course_id;
    if (courseId && !courseInfoMap[courseId]) {
      courseInfoMap[courseId] = session.courses?.title || `Curso ${courseId.slice(0, 8)}`;
    }
  });

  const processInterval = (dates: Date[], isMonthly: boolean) => {
    const dataMap: { [key: string]: GlobalTotals } = {};
    dates.forEach(d => {
      const key = format(d, isMonthly ? 'MMM' : 'yyyy-MM-dd');
      dataMap[key] = {};
    });

    sessions.forEach(session => {
      const d = parseISO(session.start_time);
      const key = format(d, isMonthly ? 'MMM' : 'yyyy-MM-dd');
      if (dataMap[key]) {
        const duration = session.duration_seconds || 0;
        const courseId = session.course_id || 'unknown';

        if (!dataMap[key][courseId]) {
          dataMap[key][courseId] = 0;
        }
        dataMap[key][courseId] += duration;

        if (!globalTotals[courseId]) {
          globalTotals[courseId] = 0;
        }
        globalTotals[courseId] += duration;
      }
    });

    return dates.map(d => {
      const key = format(d, isMonthly ? 'MMM' : 'yyyy-MM-dd');
      const data = dataMap[key];
      const totalSec = Object.values(data).reduce((a, b) => a + (b as number), 0);

      const point: ChartDataPoint = {
        date: format(d, isMonthly ? 'MMM' : 'dd/MM'),
        fullDate: key,
        total: Number((totalSec / 60).toFixed(2)),
        totalSeconds: totalSec,
      };

      // Adicionar dados de cada curso
      Object.keys(data).forEach(courseId => {
        const duration = (data[courseId] as number) || 0;
        point[courseId] = Number((duration / 60).toFixed(2));
        point[`${courseId}_seconds`] = duration;
      });

      return point;
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

  const distData = Object.keys(globalTotals)
    .map(courseId => ({
      name: courseInfoMap[courseId] || courseId,
      value: globalTotals[courseId] || 0
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const radarData = Object.keys(globalTotals)
    .map(courseId => ({
      subject: courseInfoMap[courseId] || courseId,
      A: Math.round((globalTotals[courseId] || 0) / 60),
      fullMark: 150
    }))
    .sort((a, b) => b.A - a.A)
    .slice(0, 5); // Limitar a 5 cursos no radar

  return {
    chartData: timeline,
    distributionData: distData,
    radarData: radarData,
    dateRange: { start: startDate, end: endDate },
    courseInfoMap
  };
};
