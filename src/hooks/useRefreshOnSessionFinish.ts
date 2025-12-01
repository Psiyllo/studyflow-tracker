import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTimer } from '@/contexts/TimerContext';

/**
 * Hook que invalida queries relevantes quando uma sessão termina
 * Isso força um refetch automático dos dados nos componentes
 */
export const useRefreshOnSessionFinish = () => {
  const queryClient = useQueryClient();
  const { setOnSessionFinished } = useTimer();

  useEffect(() => {
    setOnSessionFinished?.(() => {
      // Invalidar todas as queries que dependem de sessões
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-charts'] });
      // Também pode ser usado em outras páginas que dependem de sessões
    });
  }, [setOnSessionFinished, queryClient]);
};
