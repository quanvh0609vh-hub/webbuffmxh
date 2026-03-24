export default function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  );
}

Table.Head = function TableHead({ children }) {
  return (
    <thead className="border-b border-border">
      <tr className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
        {children}
      </tr>
    </thead>
  );
};

Table.Body = function TableBody({ children }) {
  return <tbody className="divide-y divide-border/50">{children}</tbody>;
};

Table.Row = function TableRow({ children, className = '', onClick }) {
  return (
    <tr
      className={`
        hover:bg-white/[0.02] transition-colors
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

Table.Cell = function TableCell({ children, className = '', ...props }) {
  return (
    <td className={`px-4 py-3 text-text-secondary ${className}`} {...props}>
      {children}
    </td>
  );
};

Table.Th = function TableTh({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 font-semibold ${className}`} {...props}>
      {children}
    </th>
  );
};
