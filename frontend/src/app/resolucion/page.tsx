'use client';
import { useEffect, useState } from 'react';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface ResolucionData {
  mttr_global_horas: number;
  total_resueltos: number;
  mttr_por_prioridad: { prioridad: string; mttr_horas: number; count: number }[];
  mttr_por_categoria: { categoria: string; mttr_horas: number; count: number }[];
  tickets_resueltos: {
    id: string; title: string; priority: string; category: string;
    resolution_time_minutes: number; resolution_time_horas: number; resolved_at: string;
  }[];
}

export default function ResolucionPage() {
  const [data, setData] = useState<ResolucionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/resolucion')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Cargando...</div>;
  if (!data) return <div className="text-gray-400">Sin datos</div>;

  const prioridadColor: Record<string, string> = {
    critico: 'text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/30',
    alto: 'text-orange-600 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/30',
    medio: 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30',
    bajo: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <div className="flex items-center gap-3">
            <Clock size={24} className="text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">MTTR Global</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{data.mttr_global_horas}h</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Incidentes Resueltos</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{data.total_resueltos}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">MTTR Críticos</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {data.mttr_por_prioridad.find((p) => p.prioridad === 'critico')?.mttr_horas.toFixed(1) || 'N/A'}h
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">MTTR por Prioridad</h3>
          <div className="space-y-3">
            {data.mttr_por_prioridad.filter((p) => p.count > 0).map((p) => (
              <div key={p.prioridad}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${prioridadColor[p.prioridad] || ''}`}>
                    {p.prioridad}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">{p.mttr_horas}h ({p.count} tickets)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((p.mttr_horas / (data.mttr_global_horas || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">MTTR por Categoría</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data.mttr_por_categoria.filter((c) => c.count > 0).map((c) => (
              <div key={c.categoria} className="flex justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-gray-700 dark:text-gray-300">{c.categoria.replace(/_/g, ' ')}</span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">{c.mttr_horas}h ({c.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Detalle de Tickets Resueltos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="p-3 font-medium">ID</th>
                <th className="p-3 font-medium">Título</th>
                <th className="p-3 font-medium">Prioridad</th>
                <th className="p-3 font-medium">Tiempo (horas)</th>
                <th className="p-3 font-medium">Resuelto</th>
              </tr>
            </thead>
            <tbody>
              {data.tickets_resueltos.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-3 font-mono text-xs text-gray-400 dark:text-gray-500">{t.id.slice(0, 8)}...</td>
                  <td className="p-3 font-medium text-gray-700 dark:text-gray-200">{t.title}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${prioridadColor[t.priority] || ''}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">{t.resolution_time_horas}h</td>
                  <td className="p-3 text-xs text-gray-400 dark:text-gray-500">
                    {t.resolved_at ? new Date(t.resolved_at).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
