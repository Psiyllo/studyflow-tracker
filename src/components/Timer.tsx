import { Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTimer } from '@/contexts/TimerContext';

export const Timer = () => {
  const { 
    isRunning, 
    isPaused, 
    elapsedSeconds, 
    pauseTimer, 
    resumeTimer, 
    finishSession 
  } = useTimer();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!isRunning) return null;

  return (
    <Card className="p-8 bg-gradient-to-br from-primary/10 to-success/10 border-primary/20">
      <div className="text-center space-y-6">
        <div className="text-6xl font-bold tabular-nums tracking-tight text-foreground">
          {formatTime(elapsedSeconds)}
        </div>
        
        <div className="flex gap-3 justify-center">
          {isPaused ? (
            <Button 
              onClick={resumeTimer} 
              size="lg"
              className="gap-2"
            >
              <Play className="h-5 w-5" />
              Retomar
            </Button>
          ) : (
            <Button 
              onClick={pauseTimer} 
              size="lg"
              variant="secondary"
              className="gap-2"
            >
              <Pause className="h-5 w-5" />
              Pausar
            </Button>
          )}
          
          <Button 
            onClick={finishSession} 
            size="lg"
            variant="destructive"
            className="gap-2"
          >
            <Square className="h-5 w-5" />
            Finalizar
          </Button>
        </div>
      </div>
    </Card>
  );
};
