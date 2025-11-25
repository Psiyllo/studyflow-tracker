import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

interface SessionData {
  courseId: string;
  moduleId?: string;
  studyType: string;
  notes?: string;
}

interface TimerContextType {
  isRunning: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  sessionData: SessionData | null;
  startTimer: (data: SessionData) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  finishSession: () => Promise<void>;
  resetTimer: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Load persisted state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('timer-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setIsRunning(parsed.isRunning);
        setIsPaused(parsed.isPaused);
        setElapsedSeconds(parsed.elapsedSeconds);
        setSessionData(parsed.sessionData);
        setStartTime(parsed.startTime ? new Date(parsed.startTime) : null);
      } catch (error) {
        console.error('Error loading timer state:', error);
      }
    }
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    if (isRunning || isPaused) {
      localStorage.setItem('timer-state', JSON.stringify({
        isRunning,
        isPaused,
        elapsedSeconds,
        sessionData,
        startTime,
      }));
    } else {
      localStorage.removeItem('timer-state');
    }
  }, [isRunning, isPaused, elapsedSeconds, sessionData, startTime]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused]);

  const startTimer = (data: SessionData) => {
    setSessionData(data);
    setIsRunning(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    setStartTime(new Date());
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const finishSession = async () => {
    if (!user || !sessionData || !startTime) return;

    const endTime = new Date();
    const durationMinutes = Math.floor(elapsedSeconds / 60);

    try {
      const { error } = await supabase.from('study_sessions').insert({
        user_id: user.id,
        course_id: sessionData.courseId,
        module_id: sessionData.moduleId || null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
        study_type: sessionData.studyType,
        notes: sessionData.notes || null,
      });

      if (error) throw error;

      toast({
        title: "Sessão finalizada!",
        description: `Você estudou por ${durationMinutes} minutos.`,
      });

      resetTimer();
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Erro ao salvar sessão",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setSessionData(null);
    setStartTime(null);
  };

  return (
    <TimerContext.Provider
      value={{
        isRunning,
        isPaused,
        elapsedSeconds,
        sessionData,
        startTimer,
        pauseTimer,
        resumeTimer,
        finishSession,
        resetTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
