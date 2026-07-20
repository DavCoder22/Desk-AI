'use client';
import { useEffect, useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { TicketDrawer } from '@/components/TicketDrawer';
import { NewTicketModal } from '@/components/NewTicketModal';

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategoria?: string;
  tipo_solicitud?: string;
  priority: string;
  urgency: string;
  impact: string;
  status: string;
  tipo_usuario: string;
  facultad_o_area?: string;
  carrera?: string;
  requester: string;
  assigned_to?: string;
  ai_suggestion?: string;
  user_recommendation?: string;
  supervisor_suggestion?: string;
  itil_category?: string;
  cobit_control?: string;
  created_at: string;
  resolved_at?: string;
  resolution_time_minutes?: number;
  cost_human?: number;
  cost_ia?: number;
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

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTickets = () => {
    setLoading(true);
    fetch('/api/tickets')
      .then((r) => r.json())
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Error al cargar tickets'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, []);

  const sorted = useMemo(() => {
    const filtered = tickets.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase()),
    );
    return filtered.sort((a, b) => {
      const aVal = a[sortField as keyof Ticket] || '';
      const bVal = b[sortField as keyof Ticket] || '';
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });
  }, [tickets, search, sortField, sortDir]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleFeedback = async (ticketId: string, correcta: boolean, util: boolean) => {
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, clasificacion_correcta: correcta, sugerencia_util: util }),
      });
      if (!res.ok) throw new Error('Error al enviar feedback');
      toast.success('Feedback enviado');
    } catch {
      toast.error('Error al enviar feedback');
    }
  };

  const SortArrow = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-auto">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text" placeholder="Buscar por título..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm w-full sm:w-80 focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors w-full sm:w-auto justify-center"
        >
          <Plus size={18} />
          Nuevo Ticket
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="p-3 font-medium cursor-pointer hover:text-primary dark:hover:text-primary-light whitespace-nowrap" onClick={() => handleSort('id')}>
                  ID <SortArrow field="id" />
                </th>
                <th className="p-3 font-medium cursor-pointer hover:text-primary dark:hover:text-primary-light whitespace-nowrap" onClick={() => handleSort('title')}>
                  Resumen <SortArrow field="title" />
                </th>
                <th className="p-3 font-medium cursor-pointer hover:text-primary dark:hover:text-primary-light whitespace-nowrap" onClick={() => handleSort('requester')}>
                  Solicitante <SortArrow field="requester" />
                </th>
                <th className="p-3 font-medium whitespace-nowrap">Asignado</th>
                <th className="p-3 font-medium cursor-pointer hover:text-primary dark:hover:text-primary-light whitespace-nowrap" onClick={() => handleSort('priority')}>
                  Prioridad <SortArrow field="priority" />
                </th>
                <th className="p-3 font-medium cursor-pointer hover:text-primary dark:hover:text-primary-light whitespace-nowrap" onClick={() => handleSort('status')}>
                  Estado <SortArrow field="status" />
                </th>
                <th className="p-3 font-medium whitespace-nowrap">Categoría</th>
                <th className="p-3 font-medium whitespace-nowrap hidden md:table-cell">ITIL</th>
                <th className="p-3 font-medium whitespace-nowrap hidden md:table-cell">COBIT</th>
                <th className="p-3 font-medium cursor-pointer hover:text-primary dark:hover:text-primary-light whitespace-nowrap" onClick={() => handleSort('created_at')}>
                  Fecha <SortArrow field="created_at" />
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="p-6 text-center text-gray-400 dark:text-gray-500">Cargando tickets...</td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={10} className="p-6 text-center text-gray-400 dark:text-gray-500">No se encontraron tickets</td></tr>
              ) : (
                sorted.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedTicket(t)}
                  >
                    <td className="p-3 font-mono text-xs text-gray-400 dark:text-gray-500">{t.id.slice(0, 8)}...</td>
                    <td className="p-3 font-medium text-gray-700 dark:text-gray-200">{t.title}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">{t.requester}</td>
                    <td className="p-3 text-gray-400 dark:text-gray-500">{t.assigned_to || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor[t.priority] || ''}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[t.status] || ''}`}>
                        {t.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">{t.category}</td>
                    <td className="p-3 hidden md:table-cell">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{t.itil_category ? (t.itil_category.includes('Solicitudes') ? 'Solicitud' : t.tipo_solicitud === 'INCIDENTE' ? 'Incidente' : 'Solicitud') : '-'}</span>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      {t.cobit_control ? (
                        <span className="font-mono text-xs font-medium text-gray-600 dark:text-gray-300">{t.cobit_control}</span>
                      ) : '-'}
                    </td>
                    <td className="p-3 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TicketDrawer ticket={selectedTicket} onClose={() => { setSelectedTicket(null); fetchTickets(); }} onFeedback={handleFeedback} onStatusChange={async () => { fetchTickets(); }} />
      <NewTicketModal open={showNewModal} onClose={() => setShowNewModal(false)} onCreated={fetchTickets} />
    </div>
  );
}
