import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/25',
  secondary: 'bg-transparent border border-border text-text-secondary hover:text-white hover:border-accent/50 hover:bg-accent/5',
  danger: 'bg-danger hover:bg-danger-hover text-white shadow-lg shadow-danger/25',
  ghost: 'bg-transparent text-text-secondary hover:text-white hover:bg-white/5',
  teal: 'bg-teal hover:bg-teal-hover text-white shadow-lg shadow-teal/25',
  outline: 'bg-transparent border border-accent/30 text-accent hover:bg-accent/10',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'p-2',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-200 btn-transition
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
});

export default Button;
