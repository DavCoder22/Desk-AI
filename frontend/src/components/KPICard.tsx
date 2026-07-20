interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'blue' | 'red' | 'green' | 'yellow';
  alert?: boolean;
}

const colorMap = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', icon: 'text-blue-500' },
  red: { bg: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-300', icon: 'text-red-500' },
  green: { bg: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-300', icon: 'text-green-500' },
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-300', icon: 'text-yellow-500' },
};

export function KPICard({ title, value, subtitle, color = 'blue', alert }: KPICardProps) {
  const style = colorMap[color];

  return (
    <div className={`rounded-xl border p-5 ${style.bg} ${alert ? 'ring-2 ring-red-400' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        {alert && <span className="text-xs font-semibold text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded-full">Alerta</span>}
      </div>
      <p className={`text-3xl font-bold mt-2 ${style.text}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
