'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Clock, AlertCircle, CheckCircle, RotateCcw, ThumbsUp, HelpCircle } from 'lucide-react';
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
  ai_suggestion?: string;
  requester: string;
  created_at: string;
  resolved_at?: string;
  tipo_usuario?: string;
  facultad_o_area?: string;
  carrera?: string;
}

const statusCfg: Record<string, { label: string; color: string; icon: any }> = {
  PENDIENTE_CLASIFICACION: { label: 'Pendiente', color: 'text-yellow-600 dark:text-yellow-400', icon: Clock },
  ABIERTO: { label: 'Abierto', color: 'text-blue-600 dark:text-blue-400', icon: AlertCircle },
  EN_PROGRESO: { label: 'En Progreso', color: 'text-indigo-600 dark:text-indigo-400', icon: Loader2 },
  RESUELTO: { label: 'Resuelto', color: 'text-green-600 dark:text-green-400', icon: CheckCircle },
  CERRADO: { label: 'Cerrado', color: 'text-gray-500 dark:text-gray-400', icon: CheckCircle },
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [accionando, setAccionando] = useState(false);
  const [error, setError] = useState('');

  const fetchTicket = () => {
    if (!ticketId) return;
    setLoading(true);
    setError('');
    fetch(`/api/tickets/${ticketId}`)
      .then(r => { if (!r.ok) throw new Error('Ticket no encontrado'); return r.json(); })
      .then(setTicket)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTicket(); }, [ticketId]);

  const handleCerrar = async () => {
    if (!ticketId) return;
    setAccionando(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/accion-usuario`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'CERRAR' }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      fetchTicket();
    } catch (e: any) { alert(e.message || 'Error al cerrar ticket'); }
    finally { setAccionando(false); }
  };

  const handleReenviar = async () => {
    if (!ticketId) return;
    setAccionando(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/accion-usuario`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'REENVIAR' }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      fetchTicket();
    } catch (e: any) { alert(e.message || 'Error al reenviar ticket'); }
    finally { setAccionando(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <HelpCircle size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-400 dark:text-gray-500">{error || 'Ticket no encontrado'}</p>
        <button onClick={() => router.push('/portal')} className="mt-4 text-primary text-sm font-medium hover:underline">
          Volver al portal
        </button>
      </div>
    );
  }

  const cfg = statusCfg[ticket.status] || statusCfg.PENDIENTE_CLASIFICACION;
  const Icon = cfg.icon;
  const isClosed = ticket.status === 'CERRADO';
  const isResuelto = ticket.status === 'RESUELTO';
  const isEnProgreso = ticket.status === 'EN_PROGRESO';
  const canAct = !isClosed && !isEnProgreso;

  const contextForAI = `Ticket #${ticketId}: ${ticket.title} (${ticket.category} - ${ticket.status}). Solicitante: ${ticket.requester}.`;

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => router.push('/portal')}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Volver al portal
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Icon size={18} className={`${ticket.status === 'EN_PROGRESO' ? 'text-indigo-500 animate-spin' : ticket.status === 'RESUELTO' ? 'text-green-500' : ticket.status === 'CERRADO' ? 'text-gray-400' : 'text-gray-400 dark:text-gray-500'}`} />
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color} bg-opacity-10`}>
                  {cfg.label}
                </span>
                {ticket.tipo_solicitud && (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${ticket.tipo_solicitud === 'INCIDENTE' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                    {ticket.tipo_solicitud === 'INCIDENTE' ? 'Incidente' : 'Solicitud'}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{ticket.title}</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                #{ticket.id} — {new Date(ticket.created_at).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Descripción</label>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Categoría</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{ticket.category}</p>
            </div>
            {ticket.subcategoria && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Subcategoría</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{ticket.subcategoria}</p>
              </div>
            )}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Prioridad</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{ticket.priority}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Solicitante</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">{ticket.requester}</p>
            </div>
          </div>

          {(ticket.facultad_o_area || ticket.carrera || ticket.tipo_usuario) && (
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
              {ticket.tipo_usuario && <span>Tipo: {ticket.tipo_usuario}</span>}
              {ticket.facultad_o_area && <span>Facultad: {ticket.facultad_o_area}</span>}
              {ticket.carrera && <span>Carrera: {ticket.carrera}</span>}
            </div>
          )}

          {ticket.user_recommendation && (
            <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5">
              <p className="text-xs text-indigo-600 dark:text-indigo-300 font-bold uppercase mb-2">Recomendación para ti</p>
              <p className="text-sm text-indigo-900 dark:text-indigo-200 whitespace-pre-wrap">{ticket.user_recommendation}</p>
            </div>
          )}

          {ticket.resolved_at && (
            <p className="text-xs text-green-600 dark:text-green-400">
              Resuelto: {new Date(ticket.resolved_at).toLocaleString('es-EC')}
            </p>
          )}

          {canAct && (
            <div className="flex gap-3">
              <button
                onClick={handleCerrar}
                disabled={accionando}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {accionando ? <Loader2 size={16} className="animate-spin" /> : <ThumbsUp size={16} />}
                {isResuelto ? 'Cerrar ticket' : 'Resuelto — Cerrar ticket'}
              </button>
              <button
                onClick={handleReenviar}
                disabled={accionando}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {accionando ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                No solucionado — Reenviar
              </button>
            </div>
          )}

          {isClosed && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Este ticket está cerrado. Si el problema continúa, puedes reabrirlo.</p>
              <button
                onClick={handleReenviar}
                disabled={accionando}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors mx-auto"
              >
                {accionando ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                Reabrir ticket
              </button>
            </div>
          )}

          {isEnProgreso && (
            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 text-center">
              <Loader2 size={18} className="inline animate-spin text-indigo-500 mb-1" />
              <p className="text-sm text-indigo-700 dark:text-indigo-300">Tu ticket está siendo revisado por el equipo de soporte. Te notificaremos cuando haya actualizaciones.</p>
            </div>
          )}
        </div>
      </div>

      <AiAssistant ticketId={ticket.id} ticketContext={contextForAI} />
    </div>
  );
}
