'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Moon, Sun, Menu, X, ShieldCheck, Eye } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useRole } from './RoleProvider';
import { useState } from 'react';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard — ITIL / BSC',
  '/tickets': 'Gestión de Incidentes — ITIL',
  '/resolucion': 'Resolución — BSC (MTTR)',
  '/costos': 'Costos — TCO',
  '/cobit': 'COBIT DSS02 — Gestión de Servicios',
  '/metrica-ia': 'Métrica de IA — Precisión',
  '/portal': 'Portal de Usuario',
};

const adminPaths = ['/dashboard', '/tickets', '/resolucion', '/costos', '/cobit', '/metrica-ia'];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle: toggleTheme } = useTheme();
  const { role, toggle: toggleRole } = useRole();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = titles[pathname] || 'DeskAI';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    document.documentElement.classList.toggle('sidebar-open', !sidebarOpen);
  };

  const handleToggleRole = () => {
    const nextRole = role === 'admin' ? 'user' : 'admin';
    toggleRole();
    if (nextRole === 'user' && adminPaths.some(p => pathname.startsWith(p))) {
      router.push('/portal');
    } else if (nextRole === 'admin' && pathname.startsWith('/portal')) {
      router.push('/dashboard');
    }
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed bottom-4 left-4 z-50 md:hidden bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary-dark transition-colors"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6 shrink-0 transition-colors">
        <h1 className="text-base md:text-xl font-semibold text-gray-800 dark:text-gray-100 truncate">{title}</h1>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
          </button>

          <button
            onClick={handleToggleRole}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              role === 'admin'
                ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 dark:bg-primary/20 dark:text-blue-300 dark:border-primary/40'
                : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
            }`}
            title={`Click para cambiar a ${role === 'admin' ? 'Usuario' : 'Admin'}`}
          >
            {role === 'admin' ? <ShieldCheck size={16} /> : <Eye size={16} />}
            <span className="hidden sm:inline">{role === 'admin' ? 'Admin' : 'Usuario'}</span>
          </button>
        </div>
      </header>
    </>
  );
}
