import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Clock, Target, Flame, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { format, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns'; 
import { ptBR } from 'date-fns/locale';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { TopicDistribution } from '@/components/dashboard/TopicDistribution';
import { FocusRadar } from '@/components/dashboard/FocusRadar';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useDashboardCharts, ViewMode, GroupBy } from '@/hooks/useDashboardCharts';

const SkeletonCard = () => (
    <div className="h-[140px] bg-zinc-800/50 rounded-2xl animate-pulse border border-white/5" />
);

export default function Dashboard() {
  const { user } = useAuth();
  
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [groupBy, setGroupBy] = useState<GroupBy>('studyType');

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: chartsData, isLoading: chartsLoading } = useDashboardCharts(viewMode, currentDate, groupBy);

  const loading = statsLoading || chartsLoading;

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) return `${hrs}h ${mins}m`; 
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
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
  const progressPercentage = Math.min(((stats?.todaySeconds || 0) / 60 / (stats?.dailyGoal || 1)) * 100, 100);

  if (!user) return null;

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
                            <h3 className="text-3xl font-bold text-white tracking-tight">{formatDuration(stats?.todaySeconds || 0)}</h3>
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
                            <h3 className="text-3xl font-bold text-white tracking-tight">{stats?.dailyGoal} <span className="text-sm font-normal text-zinc-500">min</span></h3>
                            <p className="text-sm text-zinc-400">Objetivo diário</p>
                        </div>
                    </div>

                    <div className="group bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-zinc-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/20 hover:shadow-lg hover:shadow-orange-900/10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-zinc-800/50 rounded-xl text-zinc-400 group-hover:text-orange-400 group-hover:bg-orange-500/10 transition-colors">
                                <Flame className="w-6 h-6" />
                            </div>
                            {(stats?.streak || 0) > 0 && (
                                <span className="text-xs font-medium text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full border border-orange-500/20 flex items-center gap-1">On Fire</span>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-white tracking-tight">{stats?.streak} <span className="text-sm font-normal text-zinc-500">dias</span></h3>
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
                            <h3 className="text-3xl font-bold text-white tracking-tight">{stats?.activeCourses}</h3>
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
                                    {formatDuration(stats?.todaySeconds || 0)}<span className="text-zinc-500 text-lg">/{formatDuration((stats?.dailyGoal || 0) * 60)}</span>
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
                        {chartsData?.dateRange && format(chartsData.dateRange.start, "d 'de' MMM", { locale: ptBR })} - {chartsData?.dateRange && format(chartsData.dateRange.end, "d 'de' MMM, yyyy", { locale: ptBR })}
                    </p>
                </div>
                
                <div className="flex flex-col gap-3 sm:flex-row">
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

                    <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-lg border border-white/5">
                        <button
                            onClick={() => setGroupBy('studyType')}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                            groupBy === 'studyType'
                                ? 'bg-violet-600 text-white shadow-sm'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            Por Tipo
                        </button>
                        <button
                            onClick={() => setGroupBy('course')}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                            groupBy === 'course'
                                ? 'bg-violet-600 text-white shadow-sm'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            Por Curso
                        </button>
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
                        <ActivityChart 
                          data={chartsData?.chartData || []} 
                          formatDuration={formatDuration} 
                          groupBy={groupBy}
                          courseInfoMap={chartsData?.courseInfoMap}
                        />
                    </div>

                    <div className="lg:col-span-1 h-[350px]">
                        <FocusRadar data={chartsData?.radarData || []} />
                    </div>

                    <div className="lg:col-span-1 h-[350px]">
                        <TopicDistribution 
                          data={chartsData?.distributionData || []} 
                          formatDuration={formatDuration}
                          groupBy={groupBy}
                        />
                    </div>

                    <div className="lg:col-span-1 h-[350px] bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col justify-center gap-4">
                        <div className="bg-zinc-800/30 border border-white/5 rounded-xl p-4">
                            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total do Período</p>
                            <p className="text-2xl font-bold text-violet-400">
                                {(() => {
                                    const totalSeconds = chartsData?.chartData.reduce((acc, day) => acc + (day.totalSeconds || 0), 0) || 0;
                                    return formatDuration(totalSeconds);
                                })()}
                            </p>
                        </div>
                        <div className="bg-zinc-800/30 border border-white/5 rounded-xl p-4">
                            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Média Diária</p>
                            <p className="text-2xl font-bold text-blue-400">
                                {(() => {
                                    const totalSeconds = chartsData?.chartData.reduce((acc, day) => acc + (day.totalSeconds || 0), 0) || 0;
                                    const avgSeconds = chartsData?.chartData.length ? Math.round(totalSeconds / chartsData.chartData.length) : 0;
                                    return formatDuration(avgSeconds);
                                })()}
                            </p>
                        </div>
                        <div className="bg-zinc-800/30 border border-white/5 rounded-xl p-4">
                            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Dias Produtivos</p>
                            <p className="text-2xl font-bold text-emerald-400">
                                {chartsData?.chartData.filter(day => day.totalSeconds > 0).length || 0} <span className="text-sm font-normal text-zinc-500">dias</span>
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