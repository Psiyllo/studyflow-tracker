import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Clock, Target, Flame, BookOpen, BarChart3, ArrowUpRight, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, addWeeks, subWeeks, isSameDay, parseISO, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns'; 

const SkeletonCard = () => (
    <div className="h-[140px] bg-zinc-800/50 rounded-2xl animate-pulse border border-white/5" />
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayMinutes: 0,
    dailyGoal: 120,
    weekMinutes: 0,
    streak: 0,
    activeCourses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [chartData, setChartData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() }); 

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchChartData();
    }
  }, [user, viewMode, currentDate]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_goal_minutes')
        .eq('id', user.id)
        .single();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todaySessions } = await supabase
        .from('study_sessions')
        .select('duration_minutes')
        .eq('user_id', user.id)
        .gte('start_time', today.toISOString());

      const todayMinutes = todaySessions?.reduce((acc, s) => acc + s.duration_minutes, 0) || 0;

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const { data: weekSessions } = await supabase
        .from('study_sessions')
        .select('duration_minutes')
        .eq('user_id', user.id)
        .gte('start_time', weekAgo.toISOString());

      const weekMinutes = weekSessions?.reduce((acc, s) => acc + s.duration_minutes, 0) || 0;

      const { data: dailyStats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      let streak = 0;
      const goalMinutes = profile?.daily_goal_minutes || 120;
      
      if (dailyStats) {
        for (let i = 0; i < dailyStats.length; i++) {
          if (dailyStats[i].total_minutes >= goalMinutes) {
            streak++;
          } else {
            break;
          }
        }
      }

      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      setStats({
        todayMinutes,
        dailyGoal: goalMinutes, 
        weekMinutes,
        streak,
        activeCourses: coursesCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false); 
    }
  };

  const fetchChartData = async () => {
    if (!user) return;

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

      // Cores para cada tipo de estudo
      const studyTypeColors: { [key: string]: string } = {
        video: '#a855f7',      // purple
        reading: '#3b82f6',    // blue
        coding: '#10b981',     // emerald
        review: '#f97316',     // orange
        other: '#6b7280',      // gray
      };

      if (viewMode === 'year') {
        // Dados por mês
        const monthsInYear = eachMonthOfInterval({ start: startDate, end: endDate });
        const dataByMonth: { [key: string]: { [key: string]: number } } = {};

        monthsInYear.forEach(month => {
          const monthKey = format(month, 'MMM');
          dataByMonth[monthKey] = {
            video: 0,
            reading: 0,
            coding: 0,
            review: 0,
            other: 0,
          };
        });

        sessions?.forEach(session => {
          const sessionMonth = format(parseISO(session.start_time), 'MMM');
          if (dataByMonth[sessionMonth]) {
            dataByMonth[sessionMonth][session.study_type] += session.duration_minutes;
          }
        });

        const chartDataArray = monthsInYear.map(month => ({
          date: format(month, 'MMM'),
          video: dataByMonth[format(month, 'MMM')].video,
          reading: dataByMonth[format(month, 'MMM')].reading,
          coding: dataByMonth[format(month, 'MMM')].coding,
          review: dataByMonth[format(month, 'MMM')].review,
          other: dataByMonth[format(month, 'MMM')].other,
        }));

        setChartData(chartDataArray);
      } else {
        // Dados por dia (semana ou mês)
        const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });
        const dataByDay: { [key: string]: { [key: string]: number } } = {};

        daysInRange.forEach(day => {
          const dayKey = format(day, 'yyyy-MM-dd');
          dataByDay[dayKey] = {
            video: 0,
            reading: 0,
            coding: 0,
            review: 0,
            other: 0,
          };
        });

        sessions?.forEach(session => {
          const sessionDate = format(parseISO(session.start_time), 'yyyy-MM-dd');
          if (dataByDay[sessionDate]) {
            dataByDay[sessionDate][session.study_type] += session.duration_minutes;
          }
        });

        const chartDataArray = daysInRange.map(day => ({
          date: format(day, 'dd/MM'),
          fullDate: format(day, 'yyyy-MM-dd'),
          video: dataByDay[format(day, 'yyyy-MM-dd')].video,
          reading: dataByDay[format(day, 'yyyy-MM-dd')].reading,
          coding: dataByDay[format(day, 'yyyy-MM-dd')].coding,
          review: dataByDay[format(day, 'yyyy-MM-dd')].review,
          other: dataByDay[format(day, 'yyyy-MM-dd')].other,
          isToday: isSameDay(day, new Date()),
        }));

        setChartData(chartDataArray);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const handlePrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate()));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()));
    }
  };

  const progressPercentage = Math.min((stats.todayMinutes / stats.dailyGoal) * 100, 100);

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
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </>
            ) : (
                <>
                    <div className="group bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-zinc-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/20 hover:shadow-lg hover:shadow-violet-900/10 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-zinc-800/50 rounded-xl text-zinc-400 group-hover:text-violet-400 group-hover:bg-violet-500/10 transition-colors">
                                <Clock className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                                Hoje
                            </span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-white tracking-tight">{stats.todayMinutes} <span className="text-sm font-normal text-zinc-500">min</span></h3>
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
                                <span className="text-xs font-medium text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full border border-orange-500/20 flex items-center gap-1">
                                    On Fire
                                </span>
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
                                    {stats.todayMinutes}<span className="text-zinc-500 text-lg">/{stats.dailyGoal}</span>
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
            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10">
                {/* Header com filtros */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Análise de Estudo</h3>
                    <p className="text-sm text-zinc-400">
                      {format(dateRange.start, 'dd/MM')} - {format(dateRange.end, 'dd/MM/yyyy')}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="flex gap-2">
                      <Button
                        onClick={handlePrevious}
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 border border-white/5 hover:bg-white/10 hover:text-white"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={handleNext}
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 border border-white/5 hover:bg-white/10 hover:text-white"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-2 bg-zinc-800/50 rounded-lg p-1 border border-white/5">
                      <button
                        onClick={() => setViewMode('week')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                          viewMode === 'week'
                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Semana
                      </button>
                      <button
                        onClick={() => setViewMode('month')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                          viewMode === 'month'
                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Mês
                      </button>
                      <button
                        onClick={() => setViewMode('year')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                          viewMode === 'year'
                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Ano
                      </button>
                    </div>
                  </div>
                </div>

                {/* Gráfico */}
                {loading ? (
                  <div className="h-[400px] bg-zinc-800/30 rounded-xl animate-pulse" />
                ) : (
                  <div className="w-full h-[400px] bg-zinc-800/20 rounded-xl p-4 border border-white/5">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="date" 
                          stroke="rgba(255,255,255,0.4)"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          stroke="rgba(255,255,255,0.4)"
                          style={{ fontSize: '12px' }}
                          label={{ value: 'Minutos', angle: -90, position: 'insideLeft', style: { fill: 'rgba(255,255,255,0.6)' } }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(24, 24, 27, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                          formatter={(value, name) => {
                            const labelMap: { [key: string]: string } = {
                              video: 'Vídeo Aula',
                              reading: 'Leitura',
                              coding: 'Prática/Código',
                              review: 'Revisão',
                              other: 'Outro'
                            };
                            return [`${value} min`, labelMap[name] || name];
                          }}
                          cursor={{ fill: 'rgba(124, 58, 237, 0.1)' }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="square"
                        />
                        <Bar dataKey="video" fill="#a855f7" radius={[4, 4, 0, 0]} stackId="study" name="Vídeo Aula" />
                        <Bar dataKey="reading" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="study" name="Leitura" />
                        <Bar dataKey="coding" fill="#10b981" radius={[4, 4, 0, 0]} stackId="study" name="Prática/Código" />
                        <Bar dataKey="review" fill="#f97316" radius={[4, 4, 0, 0]} stackId="study" name="Revisão" />
                        <Bar dataKey="other" fill="#6b7280" radius={[4, 4, 0, 0]} stackId="study" name="Outro" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Stats do período */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {loading ? (
                    <>
                      <div className="h-20 bg-zinc-800/30 rounded-lg animate-pulse" />
                      <div className="h-20 bg-zinc-800/30 rounded-lg animate-pulse" />
                      <div className="h-20 bg-zinc-800/30 rounded-lg animate-pulse" />
                    </>
                  ) : (
                    <>
                      <div className="bg-zinc-800/30 border border-white/5 rounded-lg p-4">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Total do Período</p>
                        <p className="text-2xl font-bold text-violet-400">
                          {chartData.reduce((acc, day) => acc + (day.video || 0) + (day.reading || 0) + (day.coding || 0) + (day.review || 0) + (day.other || 0), 0)} <span className="text-sm text-zinc-500">min</span>
                        </p>
                      </div>
                      <div className="bg-zinc-800/30 border border-white/5 rounded-lg p-4">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Média por Dia</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {Math.round(chartData.reduce((acc, day) => acc + (day.video || 0) + (day.reading || 0) + (day.coding || 0) + (day.review || 0) + (day.other || 0), 0) / chartData.length)} <span className="text-sm text-zinc-500">min</span>
                        </p>
                      </div>
                      <div className="bg-zinc-800/30 border border-white/5 rounded-lg p-4">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">Dias com Estudo</p>
                        <p className="text-2xl font-bold text-emerald-400">
                          {chartData.filter(day => ((day.video || 0) + (day.reading || 0) + (day.coding || 0) + (day.review || 0) + (day.other || 0)) > 0).length} <span className="text-sm text-zinc-500">dias</span>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

        </div>
      </div>
    </div>
  );
}