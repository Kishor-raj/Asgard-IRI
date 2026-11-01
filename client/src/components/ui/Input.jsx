export default function Input({ label, error, required, className = '', id, ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-grey-900 mb-1">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full border rounded-lg px-4 py-2.5 text-sm text-grey-900
          bg-grey-50 placeholder-grey-400 transition-colors
          focus:outline-none focus:ring-1
          ${error
            ? 'border-error focus:border-error focus:ring-error'
            : 'border-grey-200 focus:border-navy focus:ring-navy'
          } ${className}`}
        {...props}
      />
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}
