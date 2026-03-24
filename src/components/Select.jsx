import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select(
  { label, error, options = [], placeholder = 'Select...', className = '', containerClassName = '', ...props },
  ref
) {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-lg appearance-none
            bg-[#1a1a2e] border text-white text-sm
            focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
            transition-all duration-200 cursor-pointer
            ${error ? 'border-danger focus:ring-danger/50 focus:border-danger' : 'border-border'}
            ${className}
          `}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-[#1a1a2e]"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});

export default Select;
