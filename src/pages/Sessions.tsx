import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Timer } from '@/components/Timer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Filter } from 'lucide-react';
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

const studyTypes = [
  { value: 'video', label: 'Vídeo' },
  { value: 'reading', label: 'Leitura' },
  { value: 'coding', label: 'Prática/Código' },
  { value: 'review', label: 'Revisão' },
  { value: 'other', label: 'Outro' },
];

export default function Sessions() {
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
      alert('Selecione um curso!');
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Sessões de Estudo</h1>
          <p className="text-muted-foreground">
            Inicie uma nova sessão ou visualize seu histórico
          </p>
        </div>

        {/* Timer */}
        <div className="mb-8">
          <Timer />
        </div>

        {/* Start button */}
        {!isRunning && (
          <div className="mb-8">
            <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full md:w-auto gap-2">
                  <Play className="h-5 w-5" />
                  Iniciar Sessão de Estudo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Sessão de Estudo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Curso *</Label>
                    <Select
                      value={startForm.courseId}
                      onValueChange={(value) => setStartForm({ ...startForm, courseId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Estudo</Label>
                    <Select
                      value={startForm.studyType}
                      onValueChange={(value) => setStartForm({ ...startForm, studyType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {studyTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Notas (opcional)</Label>
                    <Textarea
                      placeholder="O que você vai estudar..."
                      value={startForm.notes}
                      onChange={(e) => setStartForm({ ...startForm, notes: e.target.value })}
                    />
                  </div>

                  <Button onClick={handleStartSession} className="w-full">
                    Começar Agora
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Histórico</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          {loading ? (
            <p>Carregando...</p>
          ) : sessions.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Nenhuma sessão ainda</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card key={session.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {session.courses?.title || 'Curso não encontrado'}
                      </h3>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span>{formatDate(session.start_time)}</span>
                        <span className="capitalize">
                          {studyTypes.find(t => t.value === session.study_type)?.label}
                        </span>
                      </div>
                      {session.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{session.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{session.duration_minutes}</div>
                      <div className="text-xs text-muted-foreground">minutos</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
