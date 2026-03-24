import { getStatusColor } from '../utils/format';

export default function Badge({ status, children, className = '' }) {
  const colors = getStatusColor(status);
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${colors.bg} ${colors.text} border ${colors.border}
        ${className}
      `}
    >
      {children || status}
    </span>
  );
}
