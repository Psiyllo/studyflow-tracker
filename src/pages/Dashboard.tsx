import { useEffect, useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { Clock, Target, Flame, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  ComposedChart, Bar, Line, Area, AreaChart, PieChart, Pie, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, addWeeks, subWeeks, isSameDay, parseISO, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns'; 
import { ptBR } from 'date-fns/locale';

const ActivityChart = ({ data, formatDuration }: { data: any[], formatDuration: (s: number) => string }) => {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">Fluxo de Atividade</h3>
        <p className="text-xs text-zinc-400">Tendência diária e volume de estudo</p>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
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
            <Bar dataKey="video" stackId="a" fill="#a855f7" radius={[0, 0, 0, 0]} barSize={20} />
            <Bar dataKey="reading" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} barSize={20} />
            <Bar dataKey="coding" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={20} />
            <Bar dataKey="review" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} barSize={20} />
            <Bar dataKey="other" stackId="a" fill="#6b7280" radius={[4, 4, 0, 0]} barSize={20} />
            <Line type="monotone" dataKey="total" stroke="#fff" strokeWidth={2} dot={false} activeDot={{ r: 4 }} opacity={0.5} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const TopicDistribution = ({ data, formatDuration }: { data: any[], formatDuration: (s: number) => string }) => {
  const COLORS = { video: '#a855f7', reading: '#3b82f6', coding: '#10b981', review: '#f97316', other: '#6b7280' };
  const LABELS: any = { video: 'Vídeo', reading: 'Leitura', coding: 'Código', review: 'Revisão', other: 'Outro' };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-white">Distribuição</h3>
        <p className="text-xs text-zinc-400">Tempo por categoria</p>
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
                <Cell key={`cell-${index}`} fill={(COLORS as any)[entry.name]} />
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
              formatter={(value) => <span className="text-zinc-400 text-xs ml-1">{LABELS[value] || value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const FocusRadar = ({ data }: { data: any[] }) => {
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

const SkeletonCard = () => (
    <div className="h-[140px] bg-zinc-800/50 rounded-2xl animate-pulse border border-white/5" />
);

export default function Dashboard() {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    todaySeconds: 0,
    dailyGoal: 120,
    weekSeconds: 0,
    streak: 0,
    activeCourses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() });
  
  const [chartData, setChartData] = useState<any[]>([]); 
  const [distributionData, setDistributionData] = useState<any[]>([]); 
  const [radarData, setRadarData] = useState<any[]>([]); 

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) return `${hrs}h ${mins}m`; 
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchChartData();
    }
  }, [user, viewMode, currentDate]);

  const fetchStats = async () => {
    if (!user) return;
    try {
      const { data: profile } = await supabase.from('profiles').select('daily_goal_minutes').eq('id', user.id).single();
      const today = new Date(); today.setHours(0, 0, 0, 0);
      
      const { data: todaySessions } = await supabase.from('study_sessions').select('duration_minutes').eq('user_id', user.id).gte('start_time', today.toISOString());
      const todaySeconds = todaySessions?.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) || 0;

      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7); weekAgo.setHours(0, 0, 0, 0);
      const { data: weekSessions } = await supabase.from('study_sessions').select('duration_minutes').eq('user_id', user.id).gte('start_time', weekAgo.toISOString());
      const weekSeconds = weekSessions?.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) || 0;

      const { data: dailyStats } = await supabase.from('daily_stats').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(30);
      
      let streak = 0;
      const goalMinutes = profile?.daily_goal_minutes || 120;
      if (dailyStats) {
        for (let i = 0; i < dailyStats.length; i++) {
          if (dailyStats[i].total_minutes >= goalMinutes) streak++;
          else break;
        }
      }

      const { count: coursesCount } = await supabase.from('courses').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active');

      setStats({ todaySeconds, dailyGoal: goalMinutes, weekSeconds, streak, activeCourses: coursesCount || 0 });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchChartData = async () => {
    if (!user) return;
    setLoading(true);

    try {
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

      setDateRange({ start: startDate, end: endDate });

      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('start_time, duration_minutes, study_type')
        .eq('user_id', user.id)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());

      const globalTotals: any = { video: 0, reading: 0, coding: 0, review: 0, other: 0 };

      const processInterval = (dates: Date[], formatStr: string, isMonthly: boolean) => {
        const dataMap: any = {};
        dates.forEach(d => {
            const key = format(d, isMonthly ? 'MMM' : 'yyyy-MM-dd');
            dataMap[key] = { video: 0, reading: 0, coding: 0, review: 0, other: 0 };
        });

        sessions?.forEach(session => {
            const d = parseISO(session.start_time);
            const key = format(d, isMonthly ? 'MMM' : 'yyyy-MM-dd');
            if (dataMap[key]) {
                const duration = session.duration_minutes || 0;
                dataMap[key][session.study_type] += duration;
                globalTotals[session.study_type] += duration; 
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
        timeline = processInterval(months, 'MMM', true);
      } else {
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        timeline = processInterval(days, 'yyyy-MM-dd', false);
      }
      setChartData(timeline);

      const distData = Object.keys(globalTotals).map(key => ({
        name: key,
        value: globalTotals[key]
      })).filter(d => d.value > 0);
      setDistributionData(distData);

      const radar = [
        { subject: 'Vídeo', A: Math.round(globalTotals.video / 60), fullMark: 150 },
        { subject: 'Leitura', A: Math.round(globalTotals.reading / 60), fullMark: 150 },
        { subject: 'Prática', A: Math.round(globalTotals.coding / 60), fullMark: 150 },
        { subject: 'Revisão', A: Math.round(globalTotals.review / 60), fullMark: 150 },
        { subject: 'Outro', A: Math.round(globalTotals.other / 60), fullMark: 150 },
      ];
      setRadarData(radar);

    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate()));
  };

  const handleNext = () => {
    if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()));
  };

  const progressPercentage = Math.min(((stats.todaySeconds || 0) / 60 / (stats.dailyGoal || 1)) * 100, 100);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-violet-500/30 relative overflow-x-hidden">
      
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="relative z-10">
        <Navbar />
        
        <div className="container mx-auto px-4 py-10 max-w-7xl animate-fade-in">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent tracking-tight">
              Dashboard
            </h1>
            <p className="text-zinc-400 text-lg">
              Acompanhe seu progresso e estatísticas de estudo
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {loading ? (
                <>
                    <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
                </>
            ) : (
                <>
                    <div className="group bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-zinc-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/20 hover:shadow-lg hover:shadow-violet-900/10 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-zinc-800/50 rounded-xl text-zinc-400 group-hover:text-violet-400 group-hover:bg-violet-500/10 transition-colors">
                                <Clock className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">Hoje</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-white tracking-tight">{formatDuration(stats.todaySeconds || 0)}</h3>
                            <p className="text-sm text-zinc-400">{progressPercentage.toFixed(0)}% da meta diária</p>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all"></div>
                    </div>

                    <div className="group bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-zinc-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-900/10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-zinc-800/50 rounded-xl text-zinc-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                                <Target className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-white tracking-tight">{stats.dailyGoal} <span className="text-sm font-normal text-zinc-500">min</span></h3>
                            <p className="text-sm text-zinc-400">Objetivo diário</p>
                        </div>
                    </div>

                    <div className="group bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-zinc-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/20 hover:shadow-lg hover:shadow-orange-900/10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-zinc-800/50 rounded-xl text-zinc-400 group-hover:text-orange-400 group-hover:bg-orange-500/10 transition-colors">
                                <Flame className="w-6 h-6" />
                            </div>
                            {stats.streak > 0 && (
                                <span className="text-xs font-medium text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full border border-orange-500/20 flex items-center gap-1">On Fire</span>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-white tracking-tight">{stats.streak} <span className="text-sm font-normal text-zinc-500">dias</span></h3>
                            <p className="text-sm text-zinc-400">Sequência atual</p>
                        </div>
                    </div>

                    <div className="group bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-zinc-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/20 hover:shadow-lg hover:shadow-pink-900/10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-zinc-800/50 rounded-xl text-zinc-400 group-hover:text-pink-400 group-hover:bg-pink-500/10 transition-colors">
                                <BookOpen className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-white tracking-tight">{stats.activeCourses}</h3>
                            <p className="text-sm text-zinc-400">Cursos em andamento</p>
                        </div>
                    </div>
                </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8">
            {loading ? (
                <div className="h-[200px] bg-zinc-800/50 rounded-2xl animate-pulse border border-white/5" />
            ) : (
                <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Progresso de Hoje</h3>
                                <p className="text-sm text-zinc-400">Você completou {progressPercentage.toFixed(0)}% da sua meta.</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-mono font-bold text-white tracking-tighter">
                                    {formatDuration(stats.todaySeconds || 0)}<span className="text-zinc-500 text-lg">/{formatDuration(stats.dailyGoal * 60)}</span>
                                </span>
                            </div>
                        </div>
                        <div className="relative h-4 w-full bg-zinc-800 rounded-full overflow-hidden shadow-inner border border-white/5">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-600 to-blue-500 transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                                style={{ width: `${progressPercentage}%` }}
                            >
                                <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-between text-xs font-medium text-zinc-500 uppercase tracking-widest">
                            <span>Início</span>
                            <span>Meta</span>
                        </div>
                    </div>
                </div>
            )}
          </div>

          <div className="space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-white">Análise Detalhada</h3>
                    <p className="text-sm text-zinc-400">
                        {format(dateRange.start, "d 'de' MMM", { locale: ptBR })} - {format(dateRange.end, "d 'de' MMM, yyyy", { locale: ptBR })}
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-lg border border-white/5">
                        <Button onClick={handlePrevious} variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5"><ChevronLeft className="h-4 w-4" /></Button>
                        <Button onClick={handleNext} variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5"><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                    
                    <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-lg border border-white/5">
                        {['week', 'month', 'year'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode as any)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${
                            viewMode === mode 
                                ? 'bg-zinc-700 text-white shadow-sm' 
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {mode === 'week' ? 'Semana' : mode === 'month' ? 'Mês' : 'Ano'}
                        </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
                    <div className="lg:col-span-2 bg-zinc-800/20 rounded-2xl animate-pulse" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-3 h-[400px]">
                        <ActivityChart data={chartData} formatDuration={formatDuration} />
                    </div>

                    <div className="lg:col-span-1 h-[350px]">
                        <FocusRadar data={radarData} />
                    </div>

                    <div className="lg:col-span-1 h-[350px]">
                        <TopicDistribution data={distributionData} formatDuration={formatDuration} />
                    </div>

                    <div className="lg:col-span-1 h-[350px] bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col justify-center gap-4">
                        <div className="bg-zinc-800/30 border border-white/5 rounded-xl p-4">
                            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total do Período</p>
                            <p className="text-2xl font-bold text-violet-400">
                                {(() => {
                                    const totalSeconds = chartData.reduce((acc, day) => acc + (day.totalSeconds || 0), 0);
                                    return formatDuration(totalSeconds);
                                })()}
                            </p>
                        </div>
                        <div className="bg-zinc-800/30 border border-white/5 rounded-xl p-4">
                            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Média Diária</p>
                            <p className="text-2xl font-bold text-blue-400">
                                {(() => {
                                    const totalSeconds = chartData.reduce((acc, day) => acc + (day.totalSeconds || 0), 0);
                                    const avgSeconds = chartData.length ? Math.round(totalSeconds / chartData.length) : 0;
                                    return formatDuration(avgSeconds);
                                })()}
                            </p>
                        </div>
                        <div className="bg-zinc-800/30 border border-white/5 rounded-xl p-4">
                            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Dias Produtivos</p>
                            <p className="text-2xl font-bold text-emerald-400">
                                {chartData.filter(day => day.totalSeconds > 0).length} <span className="text-sm font-normal text-zinc-500">dias</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}