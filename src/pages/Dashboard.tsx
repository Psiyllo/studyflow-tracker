import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Clock, Target, Flame, BookOpen, BarChart3, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
// Note: StatsCard não está sendo usado na versão Interstellar, 
// o estilo é aplicado diretamente, mas mantemos o import para tipagem.
import { StatsCard } from '@/components/StatsCard'; 

// Componente simples para o Skeleton Loader
const SkeletonCard = () => (
    <div className="h-[140px] bg-zinc-800/50 rounded-2xl animate-pulse border border-white/5" />
);

// Componente principal
export default function Dashboard() {
  // --- LÓGICA ORIGINAL (MANTIDA) ---
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayMinutes: 0,
    dailyGoal: 120, // O VALOR INICIAL É VISÍVEL APENAS AQUI
    weekMinutes: 0,
    streak: 0,
    activeCourses: 0,
  });
  const [loading, setLoading] = useState(true); // INICIALIZA TRUE PARA MOSTRAR O LOADER

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Get profile (daily goal)
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_goal_minutes')
        .eq('id', user.id)
        .single();

      // Get today's sessions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todaySessions } = await supabase
        .from('study_sessions')
        .select('duration_minutes')
        .eq('user_id', user.id)
        .gte('start_time', today.toISOString());

      const todayMinutes = todaySessions?.reduce((acc, s) => acc + s.duration_minutes, 0) || 0;

      // Get week's sessions
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const { data: weekSessions } = await supabase
        .from('study_sessions')
        .select('duration_minutes')
        .eq('user_id', user.id)
        .gte('start_time', weekAgo.toISOString());

      const weekMinutes = weekSessions?.reduce((acc, s) => acc + s.duration_minutes, 0) || 0;

      // Calculate streak
      const { data: dailyStats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      let streak = 0;
      // USANDO O VALOR CORRETO DO BANCO OU O DEFAULT
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

      // Get active courses count
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      setStats({
        todayMinutes,
        dailyGoal: goalMinutes, // VALOR CORRETO SETADO AQUI
        weekMinutes,
        streak,
        activeCourses: coursesCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false); // SETADO PARA FALSE APÓS O FETCH
    }
  };

  const progressPercentage = Math.min((stats.todayMinutes / stats.dailyGoal) * 100, 100);
  // --- FIM DA LÓGICA ORIGINAL ---

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-violet-500/30 relative overflow-x-hidden">
      
      {/* BACKGROUND EFFECTS (Interstellar) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="relative z-10">
        <Navbar />
        
        <div className="container mx-auto px-4 py-10 max-w-7xl animate-fade-in">
          {/* Header Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent tracking-tight">
              Dashboard
            </h1>
            <p className="text-zinc-400 text-lg">
              Acompanhe seu progresso e estatísticas de estudo
            </p>
          </div>

          {/* Grid de Cards de Estatísticas */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {loading ? (
                // EXIBE SKELETONS ENQUANTO CARREGA
                <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </>
            ) : (
                // EXIBE O CONTEÚDO REAL QUANDO loading é FALSE
                <>
                    {/* CARD: HOJE */}
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

                    {/* CARD: META DIÁRIA */}
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

                    {/* CARD: STREAK */}
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

                    {/* CARD: CURSOS ATIVOS */}
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

          {/* SEÇÃO PRINCIPAL: PROGRESSO E GRÁFICO */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {loading ? (
                <>
                    <div className="lg:col-span-2 h-[200px] bg-zinc-800/50 rounded-2xl animate-pulse border border-white/5" />
                    <div className="h-[200px] bg-zinc-800/50 rounded-2xl animate-pulse border border-white/5" />
                </>
            ) : (
                <>
                    {/* Progress Section */}
                    <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 relative overflow-hidden">
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

                            {/* Custom Modern Progress Bar */}
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

                    {/* Recent Activity Placeholder (Estilizado) */}
                    <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900/80 z-0"></div>
                        
                        {/* Background visual element */}
                        <div className="absolute inset-0 opacity-10 flex items-end justify-center gap-1 pointer-events-none">
                                <div className="w-4 h-12 bg-zinc-500 rounded-t-sm"></div>
                                <div className="w-4 h-20 bg-zinc-500 rounded-t-sm"></div>
                                <div className="w-4 h-16 bg-zinc-500 rounded-t-sm"></div>
                                <div className="w-4 h-24 bg-zinc-500 rounded-t-sm"></div>
                                <div className="w-4 h-10 bg-zinc-500 rounded-t-sm"></div>
                        </div>

                        <div className="relative z-10 flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                                    <BarChart3 className="w-6 h-6 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">Análise Semanal</h3>
                                <p className="text-sm text-zinc-400 mb-4 max-w-[200px]">
                                    Seus dados detalhados estarão disponíveis em breve.
                                </p>
                                <button className="text-xs font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                                    Ver histórico completo <ArrowUpRight className="w-3 h-3" />
                                </button>
                        </div>
                    </div>
                </>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}