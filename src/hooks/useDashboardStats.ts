import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface DashboardStats {
  todaySeconds: number;
  dailyGoal: number;
  weekSeconds: number;
  streak: number;
  activeCourses: number;
}

export const useDashboardStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) throw new Error('User not authenticated');

      // 1. Fetch Profile for Daily Goal
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_goal_minutes')
        .eq('id', user.id)
        .single();

      const goalMinutes = profile?.daily_goal_minutes || 120;

      // 2. Fetch Today's Sessions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: todaySessions } = await supabase
        .from('study_sessions')
        .select('duration_seconds')
        .eq('user_id', user.id)
        .gte('start_time', today.toISOString());

      const todaySeconds = todaySessions?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0;

      // 3. Fetch Week's Sessions
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      const { data: weekSessions } = await supabase
        .from('study_sessions')
        .select('duration_seconds')
        .eq('user_id', user.id)
        .gte('start_time', weekAgo.toISOString());

      const weekSeconds = weekSessions?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0;

      // 4. Calculate Streak
      const { data: dailyStats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      let streak = 0;
      if (dailyStats) {
        for (let i = 0; i < dailyStats.length; i++) {
          if ((dailyStats[i].total_minutes || 0) >= goalMinutes) streak++;
          else break;
        }
      }

      // 5. Fetch Active Courses
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      return {
        todaySeconds,
        dailyGoal: goalMinutes,
        weekSeconds,
        streak,
        activeCourses: coursesCount || 0,
      };
    },
    enabled: !!user,
  });
};
