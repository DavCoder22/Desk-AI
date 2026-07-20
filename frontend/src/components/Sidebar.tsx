'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, TicketCheck, Clock, DollarSign, Shield, BrainCircuit, UserCircle } from 'lucide-react';
import { useRole } from './RoleProvider';

const adminNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tickets', label: 'Incidentes', icon: TicketCheck },
  { href: '/resolucion', label: 'Resolución (MTTR)', icon: Clock },
  { href: '/costos', label: 'Costos (TCO)', icon: DollarSign },
  { href: '/cobit', label: 'COBIT DSS02', icon: Shield },
  { href: '/metrica-ia', label: 'Métrica IA', icon: BrainCircuit },
];

const userNav = [
  { href: '/portal', label: 'Mis Solicitudes', icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useRole();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      const shouldOpen = document.documentElement.classList.contains('sidebar-open');
      setOpen(shouldOpen);
    };
    const observer = new MutationObserver(handler);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const close = () => {
    setOpen(false);
    document.documentElement.classList.remove('sidebar-open');
  };

  const items = role === 'admin' ? adminNav : userNav;
  const subtitle = role === 'admin' ? 'Admin Panel' : 'Portal de Usuario';
  const logoHref = role === 'admin' ? '/dashboard' : '/portal';

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={close}
        />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-primary text-white flex flex-col shrink-0 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-primary-light">
          <Link href={logoHref} onClick={close} className="text-2xl font-bold tracking-tight">
            Desk<span className="text-blue-200">AI</span>
          </Link>
          <p className="text-xs text-blue-200 mt-1">{subtitle}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? 'bg-primary-light text-white font-medium' : 'text-blue-200 hover:bg-primary-dark hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-primary-light text-xs text-blue-200">
          {role === 'admin' ? (
            <>
              <p className="font-semibold text-white mb-1">Marcos de Referencia:</p>
              <ul className="space-y-1">
                <li>ITIL — Gestión de Incidentes</li>
                <li>COBIT DSS02 — Gestión de Servicios</li>
                <li>TCO — Costo Total</li>
                <li>BSC — MTTR como KPI</li>
              </ul>
            </>
          ) : (
            <>
              <p className="font-semibold text-white mb-1">Soporte:</p>
              <ul className="space-y-1">
                <li>soporte.tecnico@uce.edu.ec</li>
                <li>Departamento de TI</li>
                <li>Horario: 08:00 - 16:00</li>
              </ul>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
