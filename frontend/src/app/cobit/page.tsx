'use client';
import { useEffect, useState } from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ControlObjetivo {
  codigo: string;
  nombre: string;
  estado: string;
  valor: number;
}

interface CobitData {
  total_incidentes: number;
  incidentes_resueltos: number;
  incidentes_abiertos: number;
  incidentes_sin_clasificar: number;
  tasa_resolucion: number;
  mttr_promedio_horas: number;
  costo_total_gestion: number;
  costo_anual_estimado: number;
  control_objetivos: ControlObjetivo[];
}

export default function CobitPage() {
  const [data, setData] = useState<CobitData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/cobit')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Cargando...</div>;
  if (!data) return <div className="text-gray-400">Sin datos</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-800 p-5 transition-colors">
        <div className="flex items-start gap-4">
          <Shield size={32} className="text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">COBIT DSS02 — Gestión de Incidentes de Servicio</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Proceso de TI para registrar, clasificar, diagnosticar, resolver y cerrar incidentes de servicio de manera oportuna y efectiva.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Incidentes</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{data.total_incidentes}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400">Resueltos</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{data.incidentes_resueltos}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400">Abiertos</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{data.incidentes_abiertos}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400">Sin Clasificar</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{data.incidentes_sin_clasificar}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400">Tasa de Resolución</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{(data.tasa_resolucion * 100).toFixed(0)}%</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div className={`h-2 rounded-full ${data.tasa_resolucion >= 0.8 ? 'bg-green-600' : data.tasa_resolucion >= 0.5 ? 'bg-yellow-500' : 'bg-red-600'}`}
              style={{ width: `${data.tasa_resolucion * 100}%` }} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400">MTTR Promedio</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{data.mttr_promedio_horas}h</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400">Costo Anual Estimado</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">${data.costo_anual_estimado.toLocaleString()}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Proyectado (12 meses)</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Objetivos de Control DSS02</h3>
        <div className="space-y-4">
          {data.control_objetivos.map((ctrl) => (
            <div key={ctrl.codigo} className={`p-4 rounded-lg border ${
              ctrl.estado === 'CUMPLE' ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {ctrl.estado === 'CUMPLE' ? (
                    <CheckCircle size={20} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{ctrl.codigo}</span> — {ctrl.nombre}
                    </p>
                    <p className={`text-sm mt-1 font-semibold ${
                      ctrl.estado === 'CUMPLE' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                    }`}>
                      {ctrl.estado === 'CUMPLE' ? 'Cumple' : 'No Cumple'} ({(ctrl.valor * 100).toFixed(0)}%)
                    </p>
                  </div>
                </div>
                {ctrl.estado !== 'CUMPLE' && (
                  <span className="text-xs flex items-center gap-1 text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded-full">
                    <AlertTriangle size={12} /> Requiere atención
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
