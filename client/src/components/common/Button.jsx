const variants = {
  primary:   'bg-navy text-white hover:bg-navy-dark focus-visible:ring-gold',
  secondary: 'bg-gold text-navy hover:bg-gold-dark focus-visible:ring-navy',
  outline:   'border-2 border-navy text-navy hover:bg-navy hover:text-white focus-visible:ring-gold',
  ghost:     'text-navy hover:bg-grey-100 focus-visible:ring-gold',
  danger:    'bg-error text-white hover:bg-red-700 focus-visible:ring-red-400',
};

const sizes = {
  sm: 'text-xs px-4 py-2',
  md: 'text-sm px-6 py-2.5',
  lg: 'text-base px-8 py-3',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-lg
        transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}
      `}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
