'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  data: { priority: string; count: number }[];
}

const colors: Record<string, string> = {
  critico: '#DC2626',
  alto: '#F59E0B',
  medio: '#3B82F6',
  bajo: '#9CA3AF',
};

export function BarChartPrioridad({ data }: Props) {
  if (!data || data.length === 0) {
    return <p className="text-gray-400 text-sm">Sin datos de distribución</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[entry.priority] || '#3B82F6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
