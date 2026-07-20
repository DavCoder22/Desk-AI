'use client';
import { useEffect, useState } from 'react';
import { DollarSign, Cpu, Users } from 'lucide-react';

interface CostosData {
  total_tickets_resueltos: number;
  costo_total_humano: number;
  costo_total_ia: number;
  costo_total_tco: number;
  costo_promedio_humano: number;
  costo_promedio_ia: number;
  costo_promedio_tco: number;
  tickets: {
    id: string; title: string; priority: string;
    cost_human: number | null; cost_ia: number | null;
    costo_total: number; resolution_time_minutes: number | null;
    resolved_at: string | null;
  }[];
}

export default function CostosPage() {
  const [data, setData] = useState<CostosData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/costos')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Cargando...</div>;
  if (!data) return <div className="text-gray-400">Sin datos</div>;

  const tcoPorTicket = data.total_tickets_resueltos > 0
    ? (data.costo_total_tco / data.total_tickets_resueltos).toFixed(2)
    : '0.00';

  const prioCls = (p: string) => {
    const map: Record<string, string> = {
      critico: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
      alto: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
      medio: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      bajo: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return map[p] || map.bajo;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <div className="flex items-center gap-3">
            <DollarSign size={24} className="text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">TCO Total</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">${data.costo_total_tco}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <div className="flex items-center gap-3">
            <Users size={24} className="text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Costo Humano Total</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">${data.costo_total_humano}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <div className="flex items-center gap-3">
            <Cpu size={24} className="text-purple-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Costo IA Total</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">${data.costo_total_ia}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <div className="flex items-center gap-3">
            <DollarSign size={24} className="text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">TCO por Ticket</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">${tcoPorTicket}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Composición del TCO</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Costo Humano</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">${data.costo_total_humano} ({data.costo_total_tco > 0 ? ((data.costo_total_humano / data.costo_total_tco) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${data.costo_total_tco > 0 ? (data.costo_total_humano / data.costo_total_tco) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">Costo IA</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">${data.costo_total_ia} ({data.costo_total_tco > 0 ? ((data.costo_total_ia / data.costo_total_tco) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div className="bg-purple-600 h-4 rounded-full" style={{ width: `${data.costo_total_tco > 0 ? (data.costo_total_ia / data.costo_total_tco) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-gray-800 dark:text-gray-200">TCO Total ({data.total_tickets_resueltos} tickets)</span>
                <span className="text-gray-800 dark:text-gray-100">${data.costo_total_tco}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Costos Promedio por Ticket</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Humano</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">${data.costo_promedio_humano}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">IA</p>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-300">${data.costo_promedio_ia}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">TCO Promedio</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">${data.costo_promedio_tco}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Detalle de Costos por Ticket</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="p-3 font-medium">ID</th>
                <th className="p-3 font-medium">Título</th>
                <th className="p-3 font-medium">Prioridad</th>
                <th className="p-3 font-medium">Costo Humano</th>
                <th className="p-3 font-medium">Costo IA</th>
                <th className="p-3 font-medium">TCO</th>
              </tr>
            </thead>
            <tbody>
              {data.tickets.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-3 font-mono text-xs text-gray-400 dark:text-gray-500">{t.id.slice(0, 8)}...</td>
                  <td className="p-3 font-medium text-gray-700 dark:text-gray-200">{t.title}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${prioCls(t.priority)}`}>{t.priority}</span>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">${(t.cost_human || 0).toFixed(2)}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">${(t.cost_ia || 0).toFixed(2)}</td>
                  <td className="p-3 font-medium text-gray-800 dark:text-gray-100">${t.costo_total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
