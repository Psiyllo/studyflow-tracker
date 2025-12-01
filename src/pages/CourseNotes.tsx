import { useParams, useNavigate } from "react-router-dom"; 
import { useCourseNotes } from "@/hooks/useCoursesNotes";
import { useCourses } from "@/hooks/useCourses";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; 
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Navbar } from '@/components/Navbar'; 
import { ArrowLeft, NotebookText, Trash, Edit, Plus, ExternalLink } from 'lucide-react';
import { toast } from "@/hooks/use-toast"; 

export default function CourseNotes() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { notes, addNote, updateNote, deleteNote } = useCourseNotes(id!);
    const { courses, lessons } = useCourses();
    const course = courses.find(c => c.id === id) || lessons.find(l => l.id === id);
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null); 

    const resetForm = () => {
        setTitle("");
        setDesc("");
        setEditingNoteId(null);
    };

    const handleSave = async () => {
        if (title.trim() === "") {
            toast({ title: "Erro", description: "O título da anotação não pode ser vazio.", variant: "destructive" });
            return;
        }

        try {
            if (editingNoteId) {
                await updateNote(editingNoteId, title, desc);
                toast({ title: "Anotação atualizada!", description: title });
            } else {
                await addNote(title, desc);
                toast({ title: "Anotação criada!", description: title });
            }
        } catch (error) {
            toast({ title: "Erro ao salvar", description: "Não foi possível salvar a anotação.", variant: "destructive" });
        }


        setOpen(false);
        resetForm();
    };

    const handleEdit = (note: { id: string, title: string, description: string }) => {
        setTitle(note.title);
        setDesc(note.description);
        setEditingNoteId(note.id);
        setOpen(true);
    };

    useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open]);


    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 relative overflow-x-hidden">
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            </div>

            <div className="relative z-10">
                <Navbar />
                <main className="container mx-auto px-4 py-10 max-w-7xl animate-fade-in">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-white/5 pb-6">
                        <div className="flex items-center gap-4">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => navigate(-1)} 
                                className="h-10 w-10 text-zinc-400 hover:text-white hover:bg-white/10"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-300 via-white to-zinc-500 bg-clip-text text-transparent">
                                    Anotações: {course ? course.title : id}
                                </h1>
                                <p className="text-zinc-500 text-sm mt-1">
                                    <span className="inline-block mr-3 px-2 py-1 rounded-full bg-zinc-800/50 border border-white/10 text-xs font-medium">
                                        {course?.type === 'lesson' ? 'Aula' : 'Curso'}
                                    </span>
                                    {course?.platform && <span className="mr-3">{course.platform}</span>}
                                    {course?.url && (
                                        <a 
                                            href={course.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 text-sm"
                                        >
                                            Acessar Curso <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </p>
                            </div>
                        </div>

                        <Button 
                            onClick={() => { setOpen(true); resetForm(); }} 
                            className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 font-medium text-white transition-all duration-300 bg-violet-600/20 border border-violet-500/50 rounded-xl hover:bg-violet-600/30 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                        >
                            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                            <span>Nova Anotação</span>
                        </Button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {notes.length === 0 ? (
                            <div className="md:col-span-3 flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-3xl bg-zinc-900/20 backdrop-blur-sm">
                                <div className="p-4 bg-zinc-800/50 rounded-full mb-4 ring-1 ring-white/10">
                                    <NotebookText className="h-8 w-8 text-violet-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-white">Nenhuma anotação por enquanto</h3>
                                <p className="text-zinc-400 mb-6 max-w-sm">
                                    Use o botão "Nova Anotação" para começar a registrar seus aprendizados.
                                </p>
                                <Button
                                    onClick={() => setOpen(true)}
                                    variant="outline"
                                    className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10 hover:text-white"
                                >
                                    Adicionar
                                </Button>
                            </div>
                        ) : (
                            notes.map(note => (
                                <Card 
                                    key={note.id} 
                                    className="bg-zinc-900/40 border-white/5 transition-all duration-300 hover:border-violet-500/30 hover:bg-zinc-900/60 hover:-translate-y-0.5"
                                >
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <h2 className="text-lg font-bold text-zinc-100 line-clamp-2">
                                                {note.title}
                                            </h2>
                                            <NotebookText className="h-5 w-5 text-violet-500 flex-shrink-0 ml-4" />
                                        </div>

                                        <p className="text-sm text-zinc-400 mb-4 line-clamp-3 min-h-[4rem]">
                                            {note.description || "Nenhuma descrição detalhada."}
                                        </p>

                                        <div className="flex gap-2 mt-4 border-t border-white/5 pt-4">
                                            <Button 
                                                size="sm"
                                                variant="ghost" 
                                                onClick={() => handleEdit(note)}
                                                className="flex-1 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-violet-400"
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Editar
                                            </Button>
                                            <Button 
                                                size="sm"
                                                variant="destructive" 
                                                onClick={() => deleteNote(note.id)}
                                                className="w-10 bg-red-600/20 border border-red-500/30 hover:bg-red-500/30 text-red-400"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent className="bg-zinc-950/95 backdrop-blur-xl border-white/10 text-zinc-100 sm:rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-white">
                                    {editingNoteId ? "Editar Anotação" : "Adicionar Nova Anotação"}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 pt-4">
                                <Input
                                    placeholder="Título da aula ou tópico (Ex: Introdução ao React Hooks)"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="bg-zinc-900/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 placeholder:text-zinc-600"
                                />

                                <Textarea
                                    placeholder="Observações, dúvidas, pontos importantes..."
                                    value={desc}
                                    onChange={e => setDesc(e.target.value)}
                                    rows={8}
                                    className="bg-zinc-900/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 placeholder:text-zinc-600 resize-none"
                                />
                            </div>

                            <Button 
                                onClick={handleSave}
                                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-6 rounded-xl shadow-lg shadow-violet-900/20"
                            >
                                {editingNoteId ? "Salvar Alterações" : "Criar Anotação"}
                            </Button>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}