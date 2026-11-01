const variants = {
  open:      'bg-green-100 text-success',
  closed:    'bg-red-100 text-error',
  pending:   'bg-yellow-100 text-warning',
  active:    'bg-blue-100 text-info',
  completed: 'bg-grey-100 text-grey-600',
  draft:     'bg-grey-100 text-grey-400',
  featured:  'bg-navy/10 text-navy',
  category:  'bg-gold/10 text-gold-dark',
};

export default function Badge({ label, variant = 'active', className = '' }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${
        variants[variant] || variants.active
      } ${className}`}
    >
      {label}
    </span>
  );
}
