import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { StatsCard } from '@/components/StatsCard';
import { Clock, Target, Flame, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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
        dailyGoal: profile?.daily_goal_minutes || 120,
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

  const progressPercentage = Math.min((stats.todayMinutes / stats.dailyGoal) * 100, 100);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso e estatísticas de estudo
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Hoje"
            value={`${stats.todayMinutes} min`}
            subtitle={`${progressPercentage.toFixed(0)}% da meta`}
            icon={Clock}
            variant="primary"
          />
          
          <StatsCard
            title="Meta Diária"
            value={`${stats.dailyGoal} min`}
            icon={Target}
          />
          
          <StatsCard
            title="Streak"
            value={`${stats.streak} dias`}
            subtitle="Consecutivos com meta batida"
            icon={Flame}
            variant="success"
          />
          
          <StatsCard
            title="Cursos Ativos"
            value={stats.activeCourses}
            icon={BookOpen}
          />
        </div>

        {/* Progress bar */}
        <div className="bg-card rounded-lg p-6 border border-border mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Progresso Diário</h3>
            <span className="text-sm text-muted-foreground">
              {stats.todayMinutes} / {stats.dailyGoal} min
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Recent activity placeholder */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Últimos 7 dias</h3>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            <p>Gráfico de atividades (em breve)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
