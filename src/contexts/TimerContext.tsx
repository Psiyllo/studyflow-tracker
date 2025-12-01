import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

interface SessionData {
  courseId: string;
  moduleId?: string;
  studyType: string;
  notes?: string;
  resumeFromSession?: string;
  resumeFromDuration?: number;
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
    // Se estiver retomando, carrega o tempo anterior em segundos (já está em segundos, não multiplicar)
    setElapsedSeconds(data.resumeFromDuration || 0);
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
    const totalSeconds = elapsedSeconds; // Guardar segundos totais

    try {
      // Se está retomando uma sessão existente, faz UPDATE
      if (sessionData.resumeFromSession) {
        const { error } = await supabase
          .from('study_sessions')
          .update({
            duration_minutes: totalSeconds,
            end_time: endTime.toISOString(),
          })
          .eq('id', sessionData.resumeFromSession);

        if (error) throw error;
      } else {
        // Caso contrário, cria uma nova sessão
        const { error } = await supabase.from('study_sessions').insert({
          user_id: user.id,
          course_id: sessionData.courseId,
          module_id: sessionData.moduleId || null,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration_minutes: totalSeconds,
          study_type: sessionData.studyType,
          notes: sessionData.notes || null,
        });

        if (error) throw error;
      }

      const hours = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      const timeStr = hours > 0 
        ? `${hours}h ${mins}m ${secs}s` 
        : `${mins}m ${secs}s`;

      toast({
        title: "Sessão finalizada!",
        description: `Você estudou por ${timeStr}.`,
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
