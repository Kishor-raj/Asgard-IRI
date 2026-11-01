export default function Card({ children, featured = false, className = '', onClick }) {
  const hasBg = /(?:^|\s)bg-/.test(className);
  const hasBorder = /(?:^|\s)border(?:-|\s|$)/.test(className);
  const base = `${hasBg ? '' : 'bg-white'} rounded-xl ${hasBorder ? '' : 'border border-grey-200'} transition-shadow duration-200 ${
    onClick ? 'cursor-pointer hover:shadow-card-md' : 'shadow-card'
  }`;
  const accent = featured ? 'border-gold/50 shadow-card-md' : '';

  return (
    <div className={`${base} ${accent} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
