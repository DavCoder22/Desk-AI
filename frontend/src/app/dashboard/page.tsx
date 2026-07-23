'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { KPICard } from '@/components/KPICard';
import { BarChartPrioridad } from '@/components/BarChartPrioridad';
import { UltimosTickets } from '@/components/UltimosTickets';
import { Clock, DollarSign, Shield, BrainCircuit, Loader2, ServerOff } from 'lucide-react';

interface KPI {
  total_tickets_hoy: number;
  mttr_promedio_horas: number;
  costo_promedio_por_ticket: number;
  precision_ia_global: number;
  distribucion_prioridad: { priority: string; count: number }[];
  precision_por_categoria?: { categoria: string; precision: number; alerta: boolean }[];
}

export default function DashboardPage() {
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      fetch('/api/dashboard/kpis').then(async (r) => {
        if (!r.ok) throw new Error('No se pudo cargar KPIs');
        return r.json();
      }),
      fetch('/api/tickets').then(async (r) => {
        if (!r.ok) throw new Error('No se pudo cargar tickets');
        return r.json();
      }),
    ])
      .then(([kpiData, ticketsData]) => {
        setKpi(kpiData);
        setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      })
      .catch((err) => setError(err.message || 'No se pudo conectar con el servidor'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
        <Loader2 size={28} className="animate-spin" />
        <span>Cargando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-start gap-4">
        <ServerOff size={28} className="shrink-0 text-red-600 dark:text-red-400" />
        <div>
          <h2 className="text-base font-semibold text-red-700 dark:text-red-300">Error de conexión con el backend</h2>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">Asegúrate de que el backend esté corriendo en http://localhost:3000</p>
          <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    );
  }
  if (!kpi) return <div className="text-gray-400">Sin datos disponibles</div>;

  const quickLinks = [
    { href: '/resolucion', label: 'Resolución (MTTR)', icon: Clock, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
    { href: '/costos', label: 'Costos (TCO)', icon: DollarSign, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/30' },
    { href: '/cobit', label: 'COBIT DSS02', icon: Shield, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { href: '/metrica-ia', label: 'Métrica IA', icon: BrainCircuit, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Incidentes Hoy" value={kpi.total_tickets_hoy} color="blue" />
        <KPICard title="MTTR Promedio" value={`${kpi.mttr_promedio_horas}h`} subtitle="Tiempo medio de resolución" color="green" />
        <KPICard title="Costo por Ticket" value={`$${kpi.costo_promedio_por_ticket}`} subtitle="Costo promedio (TCO)" color="yellow" />
        <KPICard
          title="Precisión IA"
          value={`${(kpi.precision_ia_global * 100).toFixed(0)}%`}
          color={kpi.precision_ia_global < 0.7 ? 'red' : 'green'}
          alert={kpi.precision_ia_global < 0.7}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}
              className={`${link.bg} rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md dark:hover:shadow-gray-800 transition-shadow`}>
              <div className="flex items-center gap-3">
                <Icon size={20} className={link.color} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{link.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Distribución por Prioridad</h3>
          <BarChartPrioridad data={kpi.distribucion_prioridad} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Últimos Tickets</h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">Actualizado en vivo</span>
          </div>
          <UltimosTickets tickets={tickets} />
        </div>
      </div>

      {kpi.precision_por_categoria && kpi.precision_por_categoria.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Precisión por Categoría</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpi.precision_por_categoria.map((cat) => (
              <div key={cat.categoria} className={`p-4 rounded-lg border ${cat.alerta ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30' : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30'}`}>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{cat.categoria.replace(/_/g, ' ')}</p>
                <p className={`text-2xl font-bold ${cat.alerta ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
                  {(cat.precision * 100).toFixed(0)}%
                </p>
                {cat.alerta && <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">Precisión baja - Revisar</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
