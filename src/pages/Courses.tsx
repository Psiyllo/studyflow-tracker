import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, ExternalLink, Edit, Trash, Sparkles } from 'lucide-react';
import { useCourses } from '@/hooks/useCourses';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

// NOVO COMPONENTE: Skeleton para o Card de CursoF
const CourseCardSkeleton = () => (
  <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-[180px] animate-pulse">
    <div className="flex justify-between items-start mb-4">
      {/* Placeholder para ícone */}
      <div className="p-3 rounded-xl bg-zinc-800/50 h-12 w-12" />
      {/* Placeholder para status */}
      <div className="h-6 w-20 bg-zinc-800/50 rounded-full" />
    </div>
    <div className="space-y-2">
      {/* Placeholder para título */}
      <div className="h-4 bg-zinc-800/50 rounded w-3/4" />
      {/* Placeholder para plataforma */}
      <div className="h-4 bg-zinc-800/50 rounded w-1/2" />
    </div>
    {/* Placeholder para botões */}
    <div className="pt-4 mt-4 border-t border-white/5 flex gap-2">
      <div className="h-9 w-1/2 bg-zinc-800/50 rounded-lg" />
      <div className="h-9 w-9 bg-zinc-800/50 rounded-lg" />
      <div className="h-9 w-9 bg-zinc-800/50 rounded-lg" />
    </div>
  </div>
);


export default function Courses() {
  // LÓGICA ORIGINAL MANTIDA
  const { courses, loading, createCourse, updateCourse, deleteCourse } = useCourses();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    platform: '',
    url: '',
    status: 'active' as 'active' | 'paused' | 'completed',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast({ title: "Erro", description: "O título é obrigatório!", variant: "destructive", });
      return;
    }

    if (editingCourse) {
      await updateCourse(editingCourse.id, formData);
      toast({ title: "Curso atualizado com sucesso!" });
    } else {
      await createCourse(formData);
      toast({ title: "Curso criado com sucesso!" });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (course: any) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      platform: course.platform || '',
      url: course.url || '',
      status: course.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este curso?')) {
      await deleteCourse(id);
      toast({ title: "Curso excluído!" });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      platform: '',
      url: '',
      status: 'active',
    });
    setEditingCourse(null);
  };

  // DESIGN SYSTEM CONFIGURATION (mantida)
  const statusConfig = {
    active: {
      label: 'Em Andamento',
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
    },
    paused: {
      label: 'Pausado',
      classes: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    },
    completed: {
      label: 'Concluído',
      classes: 'bg-violet-500/10 text-violet-400 border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]'
    }
  };

  // *** REMOVIDA A CONDICIONAL QUE BLOQUEAVA A TELA INTEIRA ***
  /*
  if (loading) {
     return (...) // ESTE CÓDIGO CAUSAVA O FLICKERING NA NAVBAR
  }
  */

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-violet-500/30 relative overflow-x-hidden">
      {/* BACKGROUND EFFECTS (mantidos) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="relative z-10">
        <Navbar />

        <main className="container mx-auto px-4 py-10 max-w-7xl animate-fade-in">
          {/* Header Section (mantida) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                Meus Cursos
              </h1>
              <p className="text-zinc-400 text-lg">
                Gerencie sua jornada de aprendizado.
              </p>
            </div>

            {/* Dialog Trigger (mantido) */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <button className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 font-medium text-white transition-all duration-300 bg-violet-600/20 border border-violet-500/50 rounded-xl hover:bg-violet-600/30 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:-translate-y-0.5">
                  <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Novo Curso</span>
                </button>
              </DialogTrigger>

              <DialogContent className="bg-zinc-950/95 backdrop-blur-xl border-white/10 text-zinc-100 sm:rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    {editingCourse ? 'Editar Curso' : 'Adicionar Novo Curso'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-zinc-400">Título do Curso</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Spring Boot Masterclass"
                      required
                      className="bg-zinc-900/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 placeholder:text-zinc-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform" className="text-zinc-400">Plataforma</Label>
                      <Input
                        id="platform"
                        value={formData.platform}
                        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                        placeholder="Ex: Udemy"
                        className="bg-zinc-900/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 placeholder:text-zinc-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-zinc-400">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger className="bg-zinc-900/50 border-white/10 text-zinc-200 focus:ring-violet-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-zinc-200">
                          <SelectItem value="active">Em Andamento</SelectItem>
                          <SelectItem value="paused">Pausado</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-zinc-400">Link do Curso (URL)</Label>
                    <Input
                      id="url"
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://..."
                      className="bg-zinc-900/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 placeholder:text-zinc-600"
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-6 rounded-xl shadow-lg shadow-violet-900/20">
                      {editingCourse ? 'Salvar Alterações' : 'Criar Curso'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* *** ÁREA DA LISTA DE CURSOS *** */}
          {loading ? (
            // 1. EXIBE O SKELETON ENQUANTO CARREGA
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <CourseCardSkeleton />
              <CourseCardSkeleton />
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </div>
          ) : courses.length === 0 ? (
            // 2. ESTADO VAZIO APÓS O CARREGAMENTO
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-3xl bg-zinc-900/20 backdrop-blur-sm">
              <div className="p-4 bg-zinc-800/50 rounded-full mb-4 ring-1 ring-white/10">
                <BookOpen className="h-8 w-8 text-zinc-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Sua biblioteca está vazia</h3>
              <p className="text-zinc-400 mb-6 max-w-sm">
                Adicione seu primeiro curso para começar a acompanhar seu progresso.
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                variant="outline"
                className="border-white/10 hover:bg-white/5 hover:text-white"
              >
                Começar Agora
              </Button>
            </div>
          ) : (
            // 3. CONTEÚDO REAL DA LISTA APÓS O CARREGAMENTO
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const statusInfo = statusConfig[course.status as keyof typeof statusConfig] || statusConfig.active;

                return (
                  <div
                    key={course.id}
                    className="group relative bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:border-violet-500/30 hover:bg-zinc-900/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col h-full">
                      {/* Top Row: Icon & Status */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-zinc-800/50 border border-white/5 group-hover:border-violet-500/20 group-hover:bg-violet-500/10 transition-colors">
                          <BookOpen className="h-6 w-6 text-zinc-400 group-hover:text-violet-400 transition-colors" />
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusInfo.classes}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="mb-6 flex-1">
                        <h3 className="text-xl font-bold text-zinc-100 mb-1 line-clamp-2 group-hover:text-white transition-colors">
                          {course.title}
                        </h3>
                        {course.platform && (
                          <p className="text-sm text-zinc-500 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-zinc-600" />
                            {course.platform}
                          </p>
                        )}
                      </div>

                      {/* Actions Footer */}
                      <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                        {course.url && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1 bg-white/5 hover:bg-white/10 hover:text-white text-zinc-300 border border-white/5"
                            onClick={() => window.open(course.url!, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Acessar
                          </Button>
                        )}

                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/10"
                            onClick={() => handleEdit(course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => handleDelete(course.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}