import { forwardRef } from 'react';

const Textarea = forwardRef(function Textarea(
  { label, error, className = '', containerClassName = '', ...props },
  ref
) {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`
          w-full px-4 py-2.5 rounded-lg resize-none
          bg-[#1a1a2e] border text-white text-sm
          placeholder:text-text-muted
          focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
          transition-all duration-200
          ${error ? 'border-danger focus:ring-danger/50 focus:border-danger' : 'border-border'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});

export default Textarea;
