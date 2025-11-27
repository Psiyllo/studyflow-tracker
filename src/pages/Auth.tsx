import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Loader2, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Verifique seu email para confirmar o cadastro!");
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro na autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b] relative overflow-hidden selection:bg-violet-500/30">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none"></div>

      <div className="w-full max-w-md mx-4 relative z-10">

        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-20 transition duration-1000 group-hover:opacity-100"></div>

        <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20 mb-4">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
            </h1>
            <p className="text-zinc-400 text-sm">
              {isLogin
                ? "Gerencie suas horas de estudo com eficiência."
                : "Comece a trackear sua jornada de aprendizado."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-950/50 rounded-lg mb-6 border border-white/5">
            <button
              onClick={() => setIsLogin(true)}
              className={`text-sm font-medium py-2 rounded-md transition-all duration-200 ${isLogin
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`text-sm font-medium py-2 rounded-md transition-all duration-200 ${!isLogin
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
                }`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500 group-focus-within:text-violet-400 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="exemplo@email.com"
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all placeholder:text-zinc-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-medium text-zinc-300">Senha</label>
                {isLogin && (
                  <a href="#" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                    Esqueceu a senha?
                  </a>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500 group-focus-within:text-violet-400 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all placeholder:text-zinc-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 p-[1px] focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-zinc-900 mt-6"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] group-hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]">
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Entrar na Plataforma" : "Cadastrar Gratuitamente"}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          </form>

          {!isLogin && (
            <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Dashboard grátis</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Sem cartão de crédito</span>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-zinc-500 text-xs mt-8">
          &copy; 2024 StudyTrack. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}