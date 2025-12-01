import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface StudySession {
  id: string;
  user_id: string;
  course_id: string;
  module_id: string | null;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  study_type: 'video' | 'reading' | 'coding' | 'review' | 'other';
  notes: string | null;
  created_at: string;
  courses?: {
    title: string;
    platform: string | null;
  };
}

interface Filters {
  courseId?: string;
  studyType?: string;
  startDate?: string;
  endDate?: string;
}

export const useSessions = (filters?: Filters) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('study_sessions')
        .select('*, courses(title, platform)')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (filters?.courseId) {
        query = query.eq('course_id', filters.courseId);
      }

      if (filters?.studyType) {
        query = query.eq('study_type', filters.studyType);
      }

      if (filters?.startDate) {
        query = query.gte('start_time', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('start_time', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setSessions(sessions.filter(s => s.id !== sessionId));
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user?.id, filters?.courseId, filters?.studyType, filters?.startDate, filters?.endDate]);

  return {
    sessions,
    loading,
    refetch: fetchSessions,
    deleteSession,
  };
};
