export default function PageHeader({ overline, title, subtitle, children }) {
  return (
    <div
      className="pt-28 sm:pt-32 pb-14 sm:pb-20 relative overflow-hidden text-white"
      style={{
        background:
          'radial-gradient(1000px 400px at 80% -20%, rgba(201,162,39,0.18), transparent 60%), radial-gradient(800px 300px at 10% 120%, rgba(12,20,42,0.7), transparent 60%), linear-gradient(160deg, #03060f 0%, #060b18 45%, #091021 100%)',
      }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 80%)',
        }}
      />

      <div className="max-w-[1240px] mx-auto px-5 sm:px-7 text-center relative z-10">
        {overline && (
          <p className="overline center mb-3 text-[#c9a227] no-underline">
            {overline}
          </p>
        )}
        <h1 className="font-['Cormorant_Garamond',Georgia,serif] font-semibold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-white mb-4 tracking-[-0.015em] leading-tight break-words">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[#a7b0c4] text-sm sm:text-base lg:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
