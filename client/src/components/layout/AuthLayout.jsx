import { Link } from 'react-router-dom';

export default function AuthLayout({
  children,
  title,
  subtitle,
  brandEyebrow = 'Institutional Access',
  brandHeadline = (
    <>
      Where frontier science meets <em className="italic text-[#d8b878] font-semibold">global scholarship</em>.
    </>
  ),
  brandDescription = 'Sign in to your ASGARD-IRI account to access peer-reviewed journals, research labs, academic summits, and the AI laboratory — uniting 500+ scholars across 45+ countries.',
  brandPills = null,
  cardMaxWidth = 'max-w-[440px]',
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] min-h-screen font-sans bg-[#060d22] text-[#f5efe1]">
      {/* ============== LEFT: BRAND PANEL ============== */}
      <aside className="relative overflow-hidden p-8 sm:p-12 lg:p-14 bg-gradient-to-br from-[#060d22] via-[#0a1733] to-[#11214a] border-b lg:border-b-0 lg:border-r border-[#c9a35d]/25 flex flex-col justify-between">
        {/* Faint topographic line pattern */}
        <div className="absolute inset-0 asgard-topo-pattern pointer-events-none opacity-90" />

        {/* Radial ambient glow */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#243763]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-[#c9a35d]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Gold corner ornament */}
        <svg
          className="absolute top-8 right-8 w-20 h-20 opacity-40 z-10 hidden sm:block pointer-events-none"
          viewBox="0 0 80 80"
          fill="none"
        >
          <path d="M0 0 L80 0 L80 80" stroke="#c9a35d" strokeWidth="1" />
          <path d="M0 20 L60 20 M20 0 L20 60" stroke="#c9a35d" strokeWidth="0.5" opacity="0.6" />
          <circle cx="60" cy="20" r="3" fill="#c9a35d" />
        </svg>

        {/* Brand Top: Logo + Name */}
        <div className="relative z-10 flex items-center gap-3.5 mb-10 animate-asgard-rise">
          <Link to="/" className="flex items-center gap-3.5 group">
            <img
              src="/logo.png"
              alt="ASGARD-IRI"
              width={52}
              height={52}
              className="w-12 h-12 sm:w-[52px] sm:h-[52px] max-w-[52px] max-h-[52px] object-contain shrink-0 rounded-full transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_16px_rgba(201,163,93,0.45)]"
            />
            <div>
              <div className="font-serif font-semibold text-[22px] tracking-[0.22em] text-[#e7cf99] leading-tight">
                ASGARD
              </div>
              <div className="text-[10px] tracking-[0.32em] text-[#f5efe1]/60 font-sans mt-0.5">
                INTERNATIONAL FOUNDATION
              </div>
            </div>
          </Link>
        </div>

        {/* Brand Mid: Eyebrow, Headline, Description, Optional Pills */}
        <div className="relative z-10 max-w-lg my-auto py-6 sm:py-8 animate-asgard-rise" style={{ animationDelay: '0.15s' }}>
          <div className="inline-flex items-center gap-2.5 text-[11px] tracking-[0.35em] uppercase text-[#d8b878] mb-6 font-medium">
            <span className="w-8 h-[1px] bg-[#c9a35d]" />
            {brandEyebrow}
          </div>
          <h1 className="font-serif font-medium text-3xl sm:text-4xl lg:text-[46px] text-[#f5efe1] leading-[1.14] mb-5 tracking-[0.01em]">
            {brandHeadline}
          </h1>
          <p className="text-[15px] leading-relaxed text-[#f5efe1]/70 max-w-md">
            {brandDescription}
          </p>

          {/* Optional Role Pills (for Register) */}
          {brandPills && brandPills.length > 0 && (
            <div className="mt-7">
              <div className="text-[11px] tracking-[0.22em] uppercase text-[#f5efe1]/50 mb-3.5">
                Member Roles
              </div>
              <div className="flex flex-wrap gap-2">
                {brandPills.map((pill, idx) => (
                  <span
                    key={idx}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      pill.accent
                        ? 'border-[#c9a35d] text-[#e7cf99] bg-[#c9a35d]/10'
                        : 'border-[#c9a35d]/25 text-[#f5efe1]/75 bg-[#243763]/35'
                    }`}
                  >
                    {pill.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Brand Bottom: Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#c9a35d]/25 mt-8 animate-asgard-rise" style={{ animationDelay: '0.3s' }}>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#d8b878] leading-none">500+</div>
            <div className="text-[11px] tracking-[0.12em] uppercase text-[#f5efe1]/55 mt-2">Scholars</div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#d8b878] leading-none">1,200+</div>
            <div className="text-[11px] tracking-[0.12em] uppercase text-[#f5efe1]/55 mt-2">Peer-Reviewed</div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#d8b878] leading-none">24+</div>
            <div className="text-[11px] tracking-[0.12em] uppercase text-[#f5efe1]/55 mt-2">Conferences</div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#d8b878] leading-none">45+</div>
            <div className="text-[11px] tracking-[0.12em] uppercase text-[#f5efe1]/55 mt-2">Countries</div>
          </div>
        </div>
      </aside>

      {/* ============== RIGHT: FORM PANEL ============== */}
      <section className="relative bg-gradient-to-b from-[#0c1a38] to-[#0a1330] flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className={`w-full ${cardMaxWidth} relative z-10 py-6`}>
          {/* Mobile Logo on small screens */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="ASGARD-IRI"
                width={40}
                height={40}
                className="w-10 h-10 max-w-[40px] max-h-[40px] object-contain shrink-0 rounded-full transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_10px_rgba(201,163,93,0.4)]"
              />
              <span className="font-serif text-xl tracking-[0.22em] text-[#e7cf99]">ASGARD</span>
            </Link>
          </div>

          {title && (
            <h2 className="font-serif font-semibold text-3xl sm:text-4xl text-[#f5efe1] tracking-[0.01em]">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-[#f5efe1]/60 mt-2 mb-8 leading-relaxed">
              {subtitle}
            </p>
          )}

          {children}

          <div className="mt-8 text-center text-[11px] tracking-[0.15em] uppercase text-[#f5efe1]/35">
            © ASGARD International Foundation
          </div>
        </div>
      </section>
    </div>
  );
}
