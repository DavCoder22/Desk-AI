'use client';
import { useEffect, useState } from 'react';
import { BrainCircuit, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface CategoriaPrecision {
  categoria: string;
  precision: number;
  total: number;
  alerta: boolean;
}

interface PrecisionData {
  precision_global: number;
  categorias: CategoriaPrecision[];
}

export default function MetricaIAPage() {
  const [data, setData] = useState<PrecisionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/precision')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Cargando...</div>;
  if (!data) return <div className="text-gray-400">Sin datos</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <div className="flex items-center gap-3">
            <BrainCircuit size={24} className="text-indigo-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Precisión Global IA</p>
              <p className={`text-3xl font-bold ${data.precision_global >= 0.7 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {(data.precision_global * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-3">
            <div className={`h-3 rounded-full transition-all ${data.precision_global >= 0.7 ? 'bg-green-600' : 'bg-red-600'}`}
              style={{ width: `${data.precision_global * 100}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <div className="flex items-center gap-3">
            {data.precision_global >= 0.7 ? (
              <TrendingUp size={24} className="text-green-500" />
            ) : (
              <TrendingDown size={24} className="text-red-500" />
            )}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Estado del Clasificador</p>
              <p className={`text-xl font-semibold ${data.precision_global >= 0.7 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {data.precision_global >= 0.7 ? 'Rendimiento Aceptable' : 'Requiere Mejora'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Precisión por Categoría</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.categorias.map((cat) => (
            <div key={cat.categoria} className={`p-4 rounded-lg border ${
              cat.alerta ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30' : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{cat.categoria.replace(/_/g, ' ')}</p>
                {cat.alerta && <AlertTriangle size={14} className="text-red-500" />}
              </div>
              <p className={`text-2xl font-bold ${cat.alerta ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
                {(cat.precision * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{cat.total} clasificaciones</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div className={`h-2 rounded-full ${cat.alerta ? 'bg-red-600' : 'bg-green-600'}`}
                  style={{ width: `${cat.precision * 100}%` }} />
              </div>
              {cat.alerta && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-semibold">Precisión baja — Revisar clasificador</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
