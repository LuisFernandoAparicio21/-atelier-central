import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flower2, Mail, Lock, ArrowRight, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../3_infrastructure/supabaseClient';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess(true);
      }
    } catch (err: any) {
      // Translation map for common Supabase errors
      const errorMap: Record<string, string> = {
        'Invalid login credentials': 'Correo o contraseña incorrectos',
        'User already registered': 'Este correo ya está registrado',
        'Email not confirmed': 'Por favor, confirma tu correo electrónico',
        'Signup is disabled': 'El registro está temporalmente deshabilitado',
      };
      setError(errorMap[err.message] || 'Ocurrió un error. Revisa tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a0f12] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl shadow-black/60">
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-pink-700 shadow-lg shadow-primary/30 mb-6 transform -rotate-6">
              <Flower2 className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-headline font-black text-white tracking-tight mb-2">
              Atelier Central
            </h1>
            <p className="text-white/50 text-sm font-medium">
              {isLogin ? 'Bienvenida de nuevo al taller' : 'Comienza a profesionalizar tu atelier'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-6"
              >
                <div className="w-20 h-20 bg-secondary/20 rounded-3xl flex items-center justify-center mx-auto text-secondary shadow-inner">
                  <Sparkles size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">¡Registro casi listo!</h3>
                  <p className="text-white/60 text-sm leading-relaxed px-4">Hemos enviado un correo de confirmación. Por favor, verifica tu bandeja de entrada.</p>
                </div>
                <button 
                  onClick={() => setSuccess(false)}
                  className="w-full bg-white/5 border border-white/10 py-3 rounded-xl text-white font-bold text-sm hover:bg-white/10 transition-colors"
                >
                  Volver al login
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="text-primary shrink-0" size={18} />
                    <p className="text-primary text-xs font-bold leading-tight">{error}</p>
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="email" 
                      required
                      placeholder="Correo electrónico"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-white/20 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all font-medium"
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="password" 
                      required
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-white/20 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all font-medium"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-headline font-bold py-4 rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <span>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-center text-white/40 text-xs font-medium">
                  {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                  <button 
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-2 text-white font-bold hover:text-primary transition-colors cursor-pointer"
                  >
                    {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
        
        <p className="text-center mt-8 text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">
          Powered by Botanical Intelligence
        </p>
      </motion.div>
    </div>
  );
}
