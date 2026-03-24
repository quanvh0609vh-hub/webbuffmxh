import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ icon: Icon, label, value, trend, trendValue, color = 'accent', className = '' }) {
  const colorMap = {
    accent: 'from-accent/20 to-accent/5 border-accent/20',
    teal: 'from-teal/20 to-teal/5 border-teal/20',
    warning: 'from-warning/20 to-warning/5 border-warning/20',
    danger: 'from-danger/20 to-danger/5 border-danger/20',
  };

  const iconColorMap = {
    accent: 'text-accent bg-accent/10',
    teal: 'text-teal bg-teal/10',
    warning: 'text-warning bg-warning/10',
    danger: 'text-danger bg-danger/10',
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-5 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-teal' : 'text-danger'}`}>
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <p className="text-text-secondary text-xs font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
