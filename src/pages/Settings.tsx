import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { LogOut, Save, User, Target, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    display_name: '',
    daily_goal_minutes: 120,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile({
          display_name: data.display_name || '',
          daily_goal_minutes: data.daily_goal_minutes || 120,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Configurações salvas!",
        description: "Suas alterações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-violet-500/30 relative overflow-x-hidden">
      
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[5%] right-[5%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="relative z-10">
        <Navbar />
        
        <div className="container mx-auto px-4 py-10 max-w-3xl animate-fade-in">
          
          <div className="mb-10 flex items-center gap-4 border-b border-white/5 pb-4">
            <SettingsIcon className="h-8 w-8 text-violet-400" />
            <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent tracking-tight">
                Configurações
                </h1>
                <p className="text-zinc-400">
                Personalize suas preferências de conta e estudo.
                </p>
            </div>
          </div>

          <div className="mb-8 p-6 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20">
             <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2 border-b border-white/5 pb-3">
                 <User className="h-5 w-5 text-violet-400" /> Detalhes do Perfil
             </h2>
             
             <form onSubmit={handleSave} className="space-y-6">
                
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-400">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-zinc-800/50 border-white/10 text-zinc-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-zinc-600">
                        O email é o seu identificador e não pode ser alterado.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="display_name" className="text-zinc-400">Nome de Exibição</Label>
                    <Input
                        id="display_name"
                        value={profile.display_name}
                        onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                        placeholder="Seu nome no sistema"
                        className="bg-zinc-900/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 placeholder:text-zinc-600"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="daily_goal" className="text-zinc-400 flex items-center gap-1">
                        <Target className="h-4 w-4 text-blue-400" /> Meta Diária (minutos)
                    </Label>
                    <Input
                        id="daily_goal"
                        type="number"
                        min="1"
                        value={profile.daily_goal_minutes}
                        onChange={(e) => setProfile({ ...profile, daily_goal_minutes: parseInt(e.target.value) || 0 })}
                        className="bg-zinc-900/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 placeholder:text-zinc-600"
                    />
                    <p className="text-xs text-zinc-600">
                        Defina o seu objetivo de estudo diário.
                    </p>
                </div>
                
                <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium py-6 rounded-xl shadow-lg shadow-violet-900/20"
                >
                    {loading ? (
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
             </form>
          </div>

          <div className="p-6 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20">
            <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <LogOut className="h-5 w-5 text-red-400" /> Gerenciamento
            </h3>
            
            <Button 
              variant="destructive" 
              onClick={signOut}
              className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-6 rounded-xl"
            >
              <LogOut className="h-4 w-4" />
              Sair da Conta
            </Button>
            
            <p className="text-xs text-zinc-600 mt-3 text-center">
                Você precisará fazer login novamente após esta ação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}