import { Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '../4_store/authStore';

export default function Topbar() {
  const { signOut } = useAuthStore();

  return (
    <nav className="bg-surface/70 backdrop-blur-3xl sticky top-0 z-50 shadow-[0_20px_48px_rgba(43,21,26,0.06)] border-b border-on-surface/5">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-[1440px] mx-auto">
        <div className="text-2xl font-black tracking-tighter text-primary font-headline uppercase">
          Atelier Central
        </div>

        <div className="flex items-center space-x-4">
          
          <button className="p-2 hover:bg-surface-container-high rounded-full transition-all duration-300 relative cursor-pointer">
            <Bell size={20} className="text-primary" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-surface"></span>
          </button>

          <button 
            onClick={() => signOut()}
            className="p-2 hover:bg-primary/10 rounded-full transition-all duration-300 text-on-surface/40 hover:text-primary cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
          
          <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border-2 border-primary/20 cursor-pointer hover:scale-110 transition-transform">
            <img 
              alt="Perfil Florista" 
              className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" 
              src="https://picsum.photos/seed/florist/100/100"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
