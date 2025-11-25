import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { LogOut, Save } from 'lucide-react';

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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Configurações</h1>
          <p className="text-muted-foreground">
            Personalize suas preferências
          </p>
        </div>

        <Card className="p-6 mb-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                O email não pode ser alterado
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Nome de Exibição</Label>
              <Input
                id="display_name"
                value={profile.display_name}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                placeholder="Como você quer ser chamado"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily_goal">Meta Diária (minutos)</Label>
              <Input
                id="daily_goal"
                type="number"
                min="1"
                value={profile.daily_goal_minutes}
                onChange={(e) => setProfile({ ...profile, daily_goal_minutes: parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                Quantos minutos você pretende estudar por dia?
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full gap-2">
              <Save className="h-4 w-4" />
              Salvar Alterações
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Conta</h3>
          <Button 
            variant="destructive" 
            onClick={signOut}
            className="w-full gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair da Conta
          </Button>
        </Card>
      </div>
    </div>
  );
}
