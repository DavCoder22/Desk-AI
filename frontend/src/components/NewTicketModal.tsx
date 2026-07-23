'use client';
import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function NewTicketModal({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [facultad, setFacultad] = useState('');
  const [carrera, setCarrera] = useState('');
  const [requester, setRequester] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('ESTUDIANTE');
  const [loading, setLoading] = useState(false);

  const [facultades, setFacultades] = useState<string[]>([]);
  const [carreras, setCarreras] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/facultades')
      .then((r) => r.json())
      .then(setFacultades)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!facultad) { setCarreras([]); setCarrera(''); return; }
    fetch(`/api/facultades/${encodeURIComponent(facultad)}/carreras`)
      .then((r) => r.json())
      .then((list) => { setCarreras(list); setCarrera(''); })
      .catch(() => {});
  }, [facultad]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title,
        description,
        tipo_usuario: tipoUsuario,
        facultad_o_area: facultad ? facultad : undefined,
        carrera: carrera ? carrera : undefined,
        requester,
      };
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error ${res.status} al crear ticket`);
      }
      toast.success('Ticket creado y clasificado con IA');
      setTitle(''); setDescription(''); setRequester(''); setFacultad(''); setCarrera(''); setTipoUsuario('ESTUDIANTE');
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 transition-colors" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Nuevo Incidente</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"><X size={20} /></button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-12">
              <Loader2 size={40} className="animate-spin text-primary mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Clasificando con IA...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                <input
                  type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Ej: No puedo acceder al SIIU"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                <textarea
                  required value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Describe el problema o solicitud en detalle..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de usuario</label>
                <select
                  value={tipoUsuario} onChange={(e) => setTipoUsuario(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="ESTUDIANTE">Estudiante</option>
                  <option value="DOCENTE">Docente</option>
                  <option value="ADMINISTRATIVO">Administrativo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facultad / Área</label>
                <select
                  value={facultad} onChange={(e) => setFacultad(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Seleccione una facultad...</option>
                  {facultades.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              {facultad && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Carrera / Dependencia</label>
                  <select
                    value={carrera} onChange={(e) => setCarrera(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Seleccione una carrera...</option>
                    {carreras.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Solicitante</label>
                <input
                  type="text" required value={requester} onChange={(e) => setRequester(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Nombre completo"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                Crear Incidente
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
