'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, CheckCircle, AlertCircle, Clock, HelpCircle } from 'lucide-react';
import { NewTicketModal } from '@/components/NewTicketModal';
import { AiAssistant } from '@/components/AiAssistant';

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategoria?: string;
  status: string;
  priority: string;
  tipo_solicitud?: string;
  user_recommendation?: string;
  requester: string;
  created_at: string;
  resolved_at?: string;
}

const statusCfg: Record<string, { label: string; color: string; ring: string; icon: any }> = {
  PENDIENTE_CLASIFICACION: { label: 'Pendiente', color: 'text-yellow-600 dark:text-yellow-400', ring: 'ring-yellow-300 dark:ring-yellow-700', icon: Clock },
  ABIERTO: { label: 'Abierto', color: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-300 dark:ring-blue-700', icon: AlertCircle },
  EN_PROGRESO: { label: 'En Progreso', color: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-300 dark:ring-indigo-700', icon: Loader2 },
  RESUELTO: { label: 'Resuelto', color: 'text-green-600 dark:text-green-400', ring: 'ring-green-300 dark:ring-green-700', icon: CheckCircle },
  CERRADO: { label: 'Cerrado', color: 'text-gray-500 dark:text-gray-400', ring: 'ring-gray-300 dark:ring-gray-600', icon: CheckCircle },
};

const typeCls: Record<string, string> = {
  INCIDENTE: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  SOLICITUD_SERVICIO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

export default function PortalPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [miNombre, setMiNombre] = useState('');

  const fetchTickets = () => {
    setLoading(true);
    fetch('/api/tickets')
      .then((r) => r.json())
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, []);

  const misTickets = tickets.filter((t) =>
    miNombre ? t.requester.toLowerCase().includes(miNombre.toLowerCase()) : true
  );

  const pendientes = misTickets.filter((t) => !['RESUELTO', 'CERRADO'].includes(t.status)).length;
  const resueltos = misTickets.filter((t) => ['RESUELTO', 'CERRADO'].includes(t.status)).length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Portal de Usuario</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Mesa de Ayuda — Universidad Central del Ecuador</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shrink-0"
        >
          <Plus size={18} />
          Nueva Solicitud
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Ingresa tu nombre para ver tus solicitudes..."
            value={miNombre}
            onChange={(e) => setMiNombre(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        {miNombre && (
          <div className="flex gap-3 text-sm">
            <span className="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium">
              {misTickets.length} solicitudes
            </span>
            <span className="px-3 py-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg font-medium">
              {pendientes} pendientes
            </span>
            <span className="px-3 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-medium">
              {resueltos} resueltos
            </span>
          </div>
        )}
      </div>

      {!miNombre ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-16 text-center transition-colors">
          <HelpCircle size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-400 dark:text-gray-500 text-sm">Ingresa tu nombre para ver el estado de tus solicitudes</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-primary" />
          <span className="ml-3 text-gray-400 dark:text-gray-500 text-sm">Cargando tus solicitudes...</span>
        </div>
      ) : misTickets.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-16 text-center transition-colors">
          <p className="text-gray-400 dark:text-gray-500 text-sm">No se encontraron solicitudes para &quot;{miNombre}&quot;</p>
          <button onClick={() => setShowNewModal(true)} className="mt-4 text-primary text-sm font-medium hover:underline">
            Crear primera solicitud
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {misTickets.map((t) => {
            const cfg = statusCfg[t.status] || statusCfg.PENDIENTE_CLASIFICACION;
            const Icon = cfg.icon;

            return (
              <div
                key={t.id}
                onClick={() => router.push(`/portal/${t.id}`)}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/30 dark:hover:border-primary/40 transition-all cursor-pointer group"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon size={16} className={`shrink-0 ${t.status === 'EN_PROGRESO' ? 'text-indigo-500 animate-spin' : t.status === 'RESUELTO' ? 'text-green-500' : t.status === 'CERRADO' ? 'text-gray-400' : 'text-gray-400 dark:text-gray-500'}`} />
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${cfg.ring} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    {t.tipo_solicitud && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${typeCls[t.tipo_solicitud] || ''}`}>
                        {t.tipo_solicitud === 'INCIDENTE' ? 'Incidente' : 'Solicitud'}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-primary transition-colors">{t.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(t.created_at).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}
                      {' — '}{t.category}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 dark:text-gray-500">#{t.id.slice(-6)}</span>
                    <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      Ver detalle →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-600 text-center mt-8">
        ¿Dudas? Usa el botón de ayuda flotante o contacta a soporte.tecnico@uce.edu.ec
      </p>

      <NewTicketModal open={showNewModal} onClose={() => setShowNewModal(false)} onCreated={fetchTickets} />
      <AiAssistant />
    </div>
  );
}
