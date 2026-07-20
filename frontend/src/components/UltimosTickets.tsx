interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  requester: string;
  created_at: string;
  cost_human?: number;
  cost_ia?: number;
}

interface Props {
  tickets: Ticket[];
}

const statusColor: Record<string, string> = {
  PENDIENTE_CLASIFICACION: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  ABIERTO: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  EN_PROGRESO: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  RESUELTO: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  CERRADO: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const priorityColor: Record<string, string> = {
  critico: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  alto: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  medio: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  bajo: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export function UltimosTickets({ tickets }: Props) {
  if (!tickets || tickets.length === 0) {
    return <p className="text-gray-400 dark:text-gray-500 text-sm py-4">No hay tickets recientes</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
            <th className="pb-2 font-medium">ID</th>
            <th className="pb-2 font-medium">Resumen</th>
            <th className="pb-2 font-medium">Estado</th>
            <th className="pb-2 font-medium">Prioridad</th>
            <th className="pb-2 font-medium">Costo</th>
          </tr>
        </thead>
        <tbody>
          {tickets.slice(0, 5).map((t) => (
            <tr key={t.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="py-2 font-mono text-xs text-gray-400 dark:text-gray-500">{t.id.slice(0, 8)}...</td>
              <td className="py-2 font-medium text-gray-700 dark:text-gray-200">{t.title}</td>
              <td className="py-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[t.status] || ''}`}>
                  {t.status.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="py-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor[t.priority] || ''}`}>
                  {t.priority}
                </span>
              </td>
              <td className="py-2 text-gray-600 dark:text-gray-300">
                {t.cost_human != null ? `$${(t.cost_human + (t.cost_ia || 0)).toFixed(2)}` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
