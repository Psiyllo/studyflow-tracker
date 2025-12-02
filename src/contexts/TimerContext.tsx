import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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
  setOnSessionFinished?: (callback: () => void) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [startTimeMs, setStartTimeMs] = useState<number | null>(null); // timestamp em ms
  const [pausedTimeMs, setPausedTimeMs] = useState<number | null>(null); // acumula tempo quando pausa/retoma
  const [sessionStartTimeMs, setSessionStartTimeMs] = useState<number | null>(null); // start_time para BD
  const pageVisibilityRef = useRef<boolean>(true);
  const onSessionFinishedRef = useRef<(() => void) | null>(null);

  // Restaurar estado ao carregar
  useEffect(() => {
    const saved = localStorage.getItem('timer-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setIsRunning(parsed.isRunning);
        setIsPaused(parsed.isPaused);
        setElapsedSeconds(parsed.elapsedSeconds);
        setSessionData(parsed.sessionData);
        setStartTimeMs(parsed.startTimeMs ? Number(parsed.startTimeMs) : null);
        setPausedTimeMs(parsed.pausedTimeMs ? Number(parsed.pausedTimeMs) : null);
        setSessionStartTimeMs(parsed.sessionStartTimeMs ? Number(parsed.sessionStartTimeMs) : null);
      } catch (error) {
        console.error('Error loading timer state:', error);
      }
    }

    // Page Visibility API para detectar quando aba fica em background
    const handleVisibilityChange = () => {
      pageVisibilityRef.current = document.visibilityState === 'visible';
      // Não precisa fazer nada aqui, o useEffect abaixo cuida de atualizar
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Salvar estado no localStorage
  useEffect(() => {
    if (isRunning || isPaused) {
      localStorage.setItem('timer-state', JSON.stringify({
        isRunning,
        isPaused,
        elapsedSeconds,
        sessionData,
        startTimeMs,
        pausedTimeMs,
        sessionStartTimeMs,
      }));
    } else {
      localStorage.removeItem('timer-state');
    }
  }, [isRunning, isPaused, elapsedSeconds, sessionData, startTimeMs, pausedTimeMs, sessionStartTimeMs]);

  // Atualizar elapsedSeconds baseado em timestamps
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && !isPaused && startTimeMs !== null) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.round((now - startTimeMs) / 1000);
        const total = Math.round((pausedTimeMs || 0) / 1000) + elapsed;
        setElapsedSeconds(total);
      }, 100); // Update UI a cada 100ms (mais responsivo)
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused, startTimeMs, pausedTimeMs]);

  const startTimer = (data: SessionData) => {
    const now = Date.now();
    setSessionData(data);
    setIsRunning(true);
    setIsPaused(false);
    setStartTimeMs(now); // Timestamp de agora
    setPausedTimeMs((data.resumeFromDuration || 0) * 1000); // Converter segundos para ms
    
    // Se não for retomada, salva o start_time; caso contrário, usa o anterior
    if (!data.resumeFromSession) {
      setSessionStartTimeMs(now);
    }


  };

  const pauseTimer = () => {
    if (startTimeMs !== null) {
      // Acumula o tempo decorrido desde que iniciou (ou retomou)
      const elapsed = Date.now() - startTimeMs;
      setPausedTimeMs((prev) => (prev || 0) + elapsed);

    }
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setStartTimeMs(Date.now()); // Reinicia o contador
    setIsPaused(false);

  };

  const finishSession = async () => {
    if (!user || !sessionData || sessionStartTimeMs === null) return;

    // Calcular tempo final
    let totalSeconds = Math.round((pausedTimeMs || 0) / 1000);
    if (isRunning && !isPaused && startTimeMs !== null) {
      const elapsed = Math.round((Date.now() - startTimeMs) / 1000);
      totalSeconds += elapsed;
    }

    const endTimeMs = Date.now();



    try {
      // Se está retomando uma sessão existente, faz UPDATE
      if (sessionData.resumeFromSession) {
        const { error } = await supabase
          .from('study_sessions')
          .update({
            duration_seconds: totalSeconds,
            end_time: new Date(endTimeMs).toISOString(),
          })
          .eq('id', sessionData.resumeFromSession);

        if (error) throw error;
      } else {
        // Caso contrário, cria uma nova sessão
        const { error } = await supabase.from('study_sessions').insert({
          user_id: user.id,
          course_id: sessionData.courseId,
          module_id: sessionData.moduleId || null,
          start_time: new Date(sessionStartTimeMs).toISOString(),
          end_time: new Date(endTimeMs).toISOString(),
          duration_seconds: totalSeconds,
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

      // Chamar callback se registrado
      if (onSessionFinishedRef.current) {
        onSessionFinishedRef.current();
      }

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
    setStartTimeMs(null);
    setPausedTimeMs(null);
    setSessionStartTimeMs(null);
  };

  const setOnSessionFinished = (callback: () => void) => {
    onSessionFinishedRef.current = callback;
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
        setOnSessionFinished,
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
