import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
// Componente Timer não foi fornecido, mas será estilizado com base no novo tema.
import { Timer } from '@/components/Timer'; 
import { Button } from '@/components/ui/button';
import { Play, Filter, Clock, BookOpen, ChevronRight } from 'lucide-react';
import { useTimer } from '@/contexts/TimerContext';
import { useSessions } from '@/hooks/useSessions';
import { useCourses } from '@/hooks/useCourses';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Mapeamento de Tipos de Estudo para ícones e cores para o tema escuro
const studyTypesConfig: { [key: string]: { label: string, icon: JSX.Element, color: string } } = {
  video: { label: 'Vídeo Aula', icon: <Play className="h-4 w-4" />, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  reading: { label: 'Leitura', icon: <BookOpen className="h-4 w-4" />, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  coding: { label: 'Prática/Código', icon: <Play className="h-4 w-4" />, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  review: { label: 'Revisão', icon: <Clock className="h-4 w-4" />, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  other: { label: 'Outro', icon: <ChevronRight className="h-4 w-4" />, color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' },
};
const studyTypes = Object.keys(studyTypesConfig).map(key => ({
    value: key,
    label: studyTypesConfig[key].label
}));

export default function Sessions() {
  // --- LÓGICA ORIGINAL (MANTIDA 100%) ---
  const { startTimer, isRunning } = useTimer();
  const [filters, setFilters] = useState({});
  const { sessions, loading } = useSessions(filters);
  const { courses } = useCourses();
  
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [startForm, setStartForm] = useState({
    courseId: '',
    studyType: 'video',
    notes: '',
  });

  const handleStartSession = () => {
    if (!startForm.courseId) {
      alert('Selecione um curso!'); // Mantendo o alert original
      return;
    }

    startTimer({
      courseId: startForm.courseId,
      studyType: startForm.studyType,
      notes: startForm.notes,
    });

    setIsStartDialogOpen(false);
    setStartForm({ courseId: '', studyType: 'video', notes: '' });
  };

  const activeCourses = courses.filter(c => c.status === 'active');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  // --- FIM DA LÓGICA ORIGINAL ---


  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-violet-500/30 relative overflow-x-hidden">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="relative z-10">
        <Navbar />
        
        <div className="container mx-auto px-4 py-10 max-w-7xl animate-fade-in">
          {/* Header Section */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent tracking-tight">
              Sessões de Estudo
            </h1>
            <p className="text-zinc-400 text-lg">
              Inicie uma nova sessão ou visualize seu histórico de foco.
            </p>
          </div>

          {/* Timer - Assumindo que o componente Timer será estilizado para combinar */}
          <div className="mb-10">
            <Timer />
          </div>

          {/* Start button */}
          {!isRunning && (
            <div className="mb-10">
              <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
                <DialogTrigger asChild>
                  <button className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 font-semibold text-white transition-all duration-300 bg-emerald-600/20 border border-emerald-500/50 rounded-xl w-full md:w-auto hover:bg-emerald-600/30 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5">
                    <Play className="h-5 w-5 fill-emerald-400 group-hover:fill-white" />
                    <span>Iniciar Nova Sessão</span>
                  </button>
                </DialogTrigger>
                
                {/* Modal de Início de Sessão (Estilo Dark UI) */}
                <DialogContent className="bg-zinc-950/95 backdrop-blur-xl border-white/10 text-zinc-100 sm:rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">
                        Iniciar Estudo Focado
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-5 mt-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-400">Curso *</Label>
                      <Select
                        value={startForm.courseId}
                        onValueChange={(value) => setStartForm({ ...startForm, courseId: value })}
                      >
                        <SelectTrigger className="bg-zinc-900/50 border-white/10 text-zinc-200 focus:ring-violet-500/20">
                          <SelectValue placeholder="Selecione um curso ativo" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-zinc-200">
                          {activeCourses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-400">Tipo de Estudo</Label>
                      <Select
                        value={startForm.studyType}
                        onValueChange={(value) => setStartForm({ ...startForm, studyType: value })}
                      >
                        <SelectTrigger className="bg-zinc-900/50 border-white/10 text-zinc-200 focus:ring-violet-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-zinc-200">
                          {studyTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-400">Notas/Objetivo (opcional)</Label>
                      <Textarea
                        placeholder="O que você espera aprender nesta sessão..."
                        value={startForm.notes}
                        onChange={(e) => setStartForm({ ...startForm, notes: e.target.value })}
                        className="bg-zinc-900/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 placeholder:text-zinc-600 min-h-[100px]"
                      />
                    </div>

                    <Button onClick={handleStartSession} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-6 rounded-xl shadow-lg shadow-emerald-900/20">
                      <Play className="h-5 w-5 mr-2 fill-white" />
                      Começar o Foco
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* History */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <h2 className="text-2xl font-bold text-white">Histórico de Sessões</h2>
              <Button variant="ghost" size="sm" className="gap-2 text-zinc-400 border border-white/5 hover:bg-white/10 hover:text-white">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>

            {loading ? (
              <p className="text-zinc-500 p-8 text-center">Carregando histórico...</p>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-900/20 backdrop-blur-sm">
                 <Clock className="h-8 w-8 mb-4 text-zinc-400" />
                 <p className="text-zinc-400">Nenhuma sessão registrada. Comece a estudar agora!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session: any) => {
                  const type = studyTypesConfig[session.study_type] || studyTypesConfig.other;
                  
                  return (
                    <div 
                      key={session.id} 
                      className="group bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-xl p-5 transition-all duration-300 hover:border-violet-500/20 hover:bg-zinc-900/60 hover:shadow-lg hover:shadow-black/20"
                    >
                      <div className="flex items-start justify-between">
                        {/* Course & Type Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${type.color}`}>
                               {type.label}
                            </span>
                            <h3 className="text-lg font-semibold text-white truncate">
                              {session.courses?.title || 'Curso Não Identificado'}
                            </h3>
                          </div>
                          
                          <div className="flex gap-4 text-xs text-zinc-500 mt-1">
                            <span>{formatDate(session.start_time)}</span>
                          </div>

                          {session.notes && (
                            <p className="text-sm text-zinc-400 mt-3 border-l-2 border-violet-500/50 pl-3 italic line-clamp-2">
                               {session.notes}
                            </p>
                          )}
                        </div>
                        
                        {/* Duration */}
                        <div className="text-right pl-4 flex-shrink-0">
                          <div className="text-4xl font-mono font-bold text-violet-400 tracking-tighter">
                            {session.duration_minutes}
                          </div>
                          <div className="text-xs text-zinc-500 uppercase font-medium">minutos</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}