'use client';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AiAssistant } from './AiAssistant';

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

interface Props {
  ticket: Ticket | null;
  onClose: () => void;
  onFeedback: (ticketId: string, correcta: boolean, util: boolean) => void;
  onStatusChange?: (ticketId: string, newStatus: string) => Promise<void>;
}

const statusBadge: Record<string, string> = {
  PENDIENTE_CLASIFICACION: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  ABIERTO: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  EN_PROGRESO: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  RESUELTO: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  CERRADO: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const priorityBadge: Record<string, string> = {
  critico: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  alto: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  medio: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  bajo: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const transitions: Record<string, { label: string; nextStatus: string; color: string }[]> = {
  PENDIENTE_CLASIFICACION: [{ label: 'Clasificar y Abrir', nextStatus: 'ABIERTO', color: 'bg-blue-600 hover:bg-blue-700' }],
  ABIERTO: [{ label: 'Iniciar Progreso', nextStatus: 'EN_PROGRESO', color: 'bg-indigo-600 hover:bg-indigo-700' }],
  EN_PROGRESO: [{ label: 'Resolver', nextStatus: 'RESUELTO', color: 'bg-green-600 hover:bg-green-700' }],
  RESUELTO: [{ label: 'Cerrar Ticket', nextStatus: 'CERRADO', color: 'bg-gray-600 hover:bg-gray-700' }],
};

export function TicketDrawer({ ticket, onClose, onFeedback, onStatusChange }: Props) {
  const [updating, setUpdating] = useState(false);
  const [localTicket, setLocalTicket] = useState<Ticket | null>(ticket);

  useEffect(() => {
    setLocalTicket(ticket);
  }, [ticket]);

  const current = localTicket || ticket;
  if (!current) return null;

  const handleStatusChange = async (nextStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${current.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al cambiar estado');
      }
      const updated = await res.json();
      setLocalTicket(updated);
      toast.success(`Estado cambiado a ${nextStatus.replace(/_/g, ' ')}`);
      if (onStatusChange) await onStatusChange(current.id, nextStatus);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-4 md:inset-8 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-y-auto flex flex-col transition-colors">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl transition-colors">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Volver a la lista</span>
          </button>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Detalle del Incidente</h2>
          <div className="w-24" />
        </div>

        <div className="flex-1 p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 space-y-4 transition-colors">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">ID</label>
                  <p className="font-mono text-sm mt-0.5 text-gray-900 dark:text-gray-100">{current.id}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Título</label>
                  <p className="text-lg font-semibold mt-0.5 text-gray-800 dark:text-gray-100">{current.title}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Descripción</label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 whitespace-pre-wrap">{current.description}</p>
                </div>
              </div>

              {current.ai_suggestion && (
                <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-indigo-600 dark:text-indigo-300 uppercase tracking-wide font-semibold">Procedimiento para el Agente</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-200 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-200 uppercase">ITIL</span>
                  </div>
                  <p className="text-sm text-indigo-900 dark:text-indigo-200 mt-1">{current.ai_suggestion}</p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => { onFeedback(current.id, true, true); toast.success('Feedback: Útil'); }}
                      className="px-4 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      Útil
                    </button>
                    <button
                      onClick={() => { onFeedback(current.id, false, false); toast.success('Feedback: No útil'); }}
                      className="px-4 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                      No útil
                    </button>
                  </div>
                </div>
              )}

              {current.supervisor_suggestion && (
                <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-amber-700 dark:text-amber-300 uppercase tracking-wide font-semibold">Sugerencia para Supervisor</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-700 text-amber-800 dark:text-amber-200 uppercase">COBIT</span>
                  </div>
                  <p className="text-sm text-amber-900 dark:text-amber-200 mt-1">{current.supervisor_suggestion}</p>
                </div>
              )}

              {(current.status === 'RESUELTO' || current.status === 'CERRADO') && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 space-y-3 transition-colors">
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Métricas de Resolución</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {current.resolution_time_minutes != null && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">MTTR</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{(current.resolution_time_minutes / 60).toFixed(2)} h</p>
                      </div>
                    )}
                    {current.cost_human != null && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Costo Humano</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">${current.cost_human.toFixed(2)}</p>
                      </div>
                    )}
                    {current.cost_ia != null && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Costo IA</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">${current.cost_ia.toFixed(2)}</p>
                      </div>
                    )}
                    {current.cost_human != null && current.cost_ia != null && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Costo Total</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">${(current.cost_human + current.cost_ia).toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                  {current.resolved_at && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">Resuelto: {new Date(current.resolved_at).toLocaleString()}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4 transition-colors">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Estado</label>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[current.status]}`}>
                    {current.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Categoría</label>
                    <p className="text-sm font-medium mt-0.5 text-gray-800 dark:text-gray-200">{current.category}</p>
                  </div>
                  {current.subcategoria && (
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Subcategoría</label>
                      <p className="text-sm mt-0.5 text-gray-600 dark:text-gray-300">{current.subcategoria}</p>
                    </div>
                  )}
                  {current.tipo_solicitud && (
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Tipo Solicitud</label>
                      <p className="mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${current.tipo_solicitud === 'INCIDENTE' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                          {current.tipo_solicitud}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-3 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Clasificación ITIL</label>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 uppercase">ITIL</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Proceso</span>
                    <span className="text-sm font-medium text-right text-gray-800 dark:text-gray-200">{current.itil_category || '-'}</span>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Prioridad</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityBadge[current.priority]}`}>
                        {current.priority}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Urgencia</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{current.urgency}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Impacto</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{current.impact}</span>
                    </div>
                  </div>
                </div>
              </div>

              {current.cobit_control && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-3 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">COBIT DSS02</label>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 uppercase">COBIT</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Objetivo de Control</span>
                    <span className="text-sm font-bold font-mono text-gray-800 dark:text-gray-100">{current.cobit_control}</span>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {current.cobit_control === 'DSS02.01' && 'Definir esquema de clasificación de incidentes'}
                    {current.cobit_control === 'DSS02.02' && 'Registrar y priorizar incidentes'}
                    {current.cobit_control === 'DSS02.03' && 'Diagnosticar y escalar incidentes'}
                    {current.cobit_control === 'DSS02.04' && 'Resolver y recuperar el servicio'}
                    {current.cobit_control === 'DSS02.05' && 'Cerrar incidentes y evaluar'}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-3 transition-colors">
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Solicitante</label>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{current.requester}</p>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Tipo</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{current.tipo_usuario ? current.tipo_usuario.charAt(0) + current.tipo_usuario.slice(1).toLowerCase() : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Facultad</span>
                    <span className="text-sm text-right text-gray-700 dark:text-gray-300">{current.facultad_o_area || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Carrera</span>
                    <span className="text-sm text-right text-gray-700 dark:text-gray-300">{current.carrera || '-'}</span>
                  </div>
                </div>
              </div>

              {transitions[current.status] && !updating && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-3 transition-colors">
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Acciones</label>
                  <div className="flex flex-col gap-2">
                    {transitions[current.status].map((action) => (
                      <button
                        key={action.nextStatus}
                        onClick={() => handleStatusChange(action.nextStatus)}
                        className={`w-full px-4 py-2 text-sm text-white rounded-lg font-medium ${action.color} transition-colors`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {updating && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-4">
                  <Loader2 size={16} className="animate-spin" /> Actualizando...
                </div>
              )}

              <p className="text-xs text-gray-400 dark:text-gray-600 text-center pt-2">
                Creado: {new Date(current.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      <AiAssistant ticketId={current.id} ticketContext={`Ticket #${current.id}: ${current.title} (${current.category} - ${current.status}). Requester: ${current.requester}. Prioridad: ${current.priority}.`} />
    </>
  );
}
