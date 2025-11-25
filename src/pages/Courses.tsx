import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, BookOpen, ExternalLink, Edit, Trash } from 'lucide-react';
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

export default function Courses() {
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
      toast({
        title: "Erro",
        description: "O título é obrigatório!",
        variant: "destructive",
      });
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

  const statusLabels = {
    active: 'Ativo',
    paused: 'Pausado',
    completed: 'Completo',
  };

  const statusColors = {
    active: 'bg-success/10 text-success border-success/20',
    paused: 'bg-muted text-muted-foreground border-border',
    completed: 'bg-primary/10 text-primary border-primary/20',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Meus Cursos</h1>
            <p className="text-muted-foreground">
              Gerencie os cursos que você está estudando
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Curso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCourse ? 'Editar Curso' : 'Novo Curso'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Spring Boot Masterclass"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform">Plataforma</Label>
                  <Input
                    id="platform"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    placeholder="Ex: Udemy, YouTube"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="paused">Pausado</SelectItem>
                      <SelectItem value="completed">Completo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full">
                  {editingCourse ? 'Atualizar' : 'Criar'} Curso
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {courses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum curso ainda</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando seu primeiro curso!
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Curso
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="p-6 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
                    {course.platform && (
                      <p className="text-sm text-muted-foreground">{course.platform}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[course.status]}`}>
                    {statusLabels[course.status]}
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  {course.url && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(course.url!, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(course)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(course.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
