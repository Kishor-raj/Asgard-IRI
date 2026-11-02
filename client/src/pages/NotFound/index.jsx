import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFoundPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const scrollToSearch = () => {
    const el = document.getElementById('searchBand');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const quickLinks = [
    {
      title: 'Research Labs',
      sub: 'Frontier labs across quantum, AI & energy.',
      to: '/research',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-8 h-8 text-[#d8b878]">
          <path d="M2 7 L12 2 L22 7 V17 L12 22 L2 17 Z" />
          <path d="M2 7 L12 12 L22 7" />
          <path d="M12 12 V22" />
        </svg>
      ),
    },
    {
      title: 'Journals',
      sub: 'Open-access peer-reviewed publications.',
      to: '/journals',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-8 h-8 text-[#d8b878]">
          <path d="M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2z" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      ),
    },
    {
      title: 'Conferences',
      sub: 'Global academic summits & events.',
      to: '/conferences',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-8 h-8 text-[#d8b878]">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 4v4M16 4v4" />
        </svg>
      ),
    },
    {
      title: 'Academy',
      sub: 'Scholarships, fellowships & programmes.',
      to: '/academy',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-8 h-8 text-[#d8b878]">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
        </svg>
      ),
    },
  ];

  const popularSearches = [
    { label: 'Quantum Information Systems', to: '/search?q=Quantum Information Systems' },
    { label: 'Generative Intelligence',     to: '/search?q=Generative Intelligence' },
    { label: 'Renewable Energy Materials',  to: '/search?q=Renewable Energy Materials' },
    { label: 'Fellowships 2026',            to: '/opportunities' },
  ];

  return (
    <div className="w-full">
      <Helmet>
        <title>404 Page Not Found – ASGARD-IRI</title>
        <meta name="description" content="The page you requested could not be found on ASGARD-IRI." />
      </Helmet>

      {/* ============ HERO 404 ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#060d22] via-[#0a1733] to-[#11214a] text-[#f5efe1] py-20 px-6 sm:px-10 lg:py-28 lg:px-12 border-b border-[#c9a35d]/25">
        {/* Topographic pattern */}
        <div className="absolute inset-0 asgard-topo-pattern pointer-events-none opacity-80" />

        {/* Ambient floating blur orbs */}
        <div
          className="absolute -top-20 -left-24 w-80 h-80 rounded-full bg-[#c9a35d]/15 blur-3xl pointer-events-none"
          style={{ animation: 'asgardFloat1 12s ease-in-out infinite' }}
        />
        <div
          className="absolute -bottom-16 right-12 w-72 h-72 rounded-full bg-[#243763]/40 blur-3xl pointer-events-none"
          style={{ animation: 'asgardFloat2 16s ease-in-out infinite' }}
        />

        {/* Corner ornament */}
        <svg
          className="absolute top-8 right-8 w-20 h-20 opacity-40 z-10 hidden sm:block pointer-events-none"
          viewBox="0 0 80 80"
          fill="none"
        >
          <path d="M0 0 L80 0 L80 80" stroke="#c9a35d" strokeWidth="1" />
          <path d="M0 20 L60 20 M20 0 L20 60" stroke="#c9a35d" strokeWidth="0.5" opacity="0.6" />
          <circle cx="60" cy="20" r="3" fill="#c9a35d" />
        </svg>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 border border-[#c9a35d]/25 rounded-full bg-[#c9a35d]/[0.06] text-[11px] tracking-[0.35em] uppercase text-[#d8b878] mb-8 font-medium animate-asgard-rise">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#c9a35d] shadow-[0_0_8px_#c9a35d]"
              style={{ animation: 'asgardPulse 2.2s ease-in-out infinite' }}
            />
            Error 404 · Page Not Found
          </div>

          {/* Giant 404 with Peak SVG */}
          <div className="relative inline-block mb-2 animate-asgard-rise" style={{ animationDelay: '0.1s' }}>
            <span
              className="font-serif font-medium text-[clamp(110px,20vw,220px)] leading-[0.9] tracking-[-0.02em] select-none"
              style={{
                background: 'linear-gradient(180deg, #e7cf99 0%, #c9a35d 60%, rgba(201, 163, 93, 0.3) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              404
            </span>
            {/* Peak lines under 404 */}
            <svg
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3/5 opacity-50 pointer-events-none"
              viewBox="0 0 240 60"
              fill="none"
              preserveAspectRatio="none"
            >
              <path d="M0 50 L60 18 L100 38 L150 8 L200 32 L240 14" stroke="#c9a35d" strokeWidth="1.2" fill="none" opacity="0.6" />
              <path d="M0 56 L80 30 L130 46 L180 22 L240 40" stroke="#c9a35d" strokeWidth="0.6" fill="none" opacity="0.4" />
            </svg>
          </div>

          {/* Headline */}
          <h1
            className="font-serif font-semibold text-3xl sm:text-4xl lg:text-[44px] text-[#f5efe1] leading-[1.18] mb-5 tracking-[0.005em] animate-asgard-rise"
            style={{ animationDelay: '0.2s' }}
          >
            The page you seek lies beyond the <em className="italic text-[#d8b878]">next summit</em>.
          </h1>

          {/* Lead Paragraph */}
          <p
            className="text-base sm:text-lg leading-relaxed text-[#f5efe1]/70 max-w-2xl mx-auto mb-9 animate-asgard-rise"
            style={{ animationDelay: '0.28s' }}
          >
            The route you followed does not yet exist on the ASGARD-IRI map. This module belongs to the ASGARD-IRI infrastructure and will be integrated during Phase 1 of the foundation&apos;s rollout.
          </p>

          {/* Phase Card */}
          <div
            className="inline-flex items-center gap-3.5 p-3.5 sm:px-5 sm:py-3.5 border border-[#c9a35d]/25 rounded-xl bg-[#0a1733]/60 backdrop-blur-md mb-9 max-w-lg text-left animate-asgard-rise"
            style={{ animationDelay: '0.35s' }}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#c9a35d] to-[#d8b878] text-[#060d22] flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M12 2 L2 7 L12 12 L22 7 Z" />
                <path d="M2 17 L12 22 L22 17" />
                <path d="M2 12 L12 17 L22 12" />
              </svg>
            </div>
            <div className="text-xs sm:text-[13px] leading-relaxed">
              <strong className="block text-[#e7cf99] font-semibold tracking-wide mb-0.5">
                Phase 1 · In Development
              </strong>
              <span className="text-[#f5efe1]/65">
                This module will be available once ASGARD-IRI infrastructure completes its first integration phase.
              </span>
            </div>
          </div>

          {/* CTA Row */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14 animate-asgard-rise" style={{ animationDelay: '0.42s' }}>
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg bg-gradient-to-r from-[#c9a35d] to-[#d8b878] text-[#060d22] font-semibold text-xs tracking-[0.12em] uppercase transition-all duration-300 shadow-[0_10px_28px_-10px_rgba(201,163,93,0.55)] hover:shadow-[0_16px_36px_-10px_rgba(201,163,93,0.7)] hover:-translate-y-0.5"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M3 12l9-9 9 9" />
                <path d="M12 3v18" />
              </svg>
              <span>Return to Home</span>
            </Link>
            <button
              type="button"
              onClick={scrollToSearch}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg border border-[#c9a35d]/30 bg-transparent text-[#f5efe1] font-medium text-xs tracking-[0.12em] uppercase transition-all duration-250 hover:border-[#c9a35d] hover:text-[#d8b878] hover:bg-[#c9a35d]/[0.06]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <span>Search ASGARD-IRI</span>
            </button>
          </div>

          {/* Quick Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 max-w-4xl mx-auto text-left animate-asgard-rise" style={{ animationDelay: '0.5s' }}>
            {quickLinks.map((item, idx) => (
              <Link
                key={idx}
                to={item.to}
                className="group p-5 rounded-xl border border-[#c9a35d]/20 bg-[#f5efe1]/[0.03] transition-all duration-300 hover:bg-[#c9a35d]/[0.08] hover:border-[#c9a35d] hover:-translate-y-1 block"
              >
                <div className="mb-3.5 transition-transform duration-300 group-hover:scale-105">
                  {item.icon}
                </div>
                <div className="text-sm font-semibold text-[#f5efe1] mb-1 group-hover:text-[#e7cf99] transition-colors">
                  {item.title}
                </div>
                <div className="text-xs text-[#f5efe1]/55 leading-relaxed">
                  {item.sub}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SEARCH BAND ============ */}
      <section id="searchBand" className="bg-[#fbf9f3] text-[#0a1733] py-16 px-6 sm:px-10 border-b border-[#0a1733]/10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 text-[11px] tracking-[0.35em] uppercase text-[#c9a35d] mb-3 font-semibold">
            <span className="w-6 h-[1px] bg-[#c9a35d]" />
            Looking for something specific?
          </div>
          <h3 className="font-serif font-semibold text-3xl sm:text-4xl text-[#0a1733] mb-2 tracking-tight">
            Search the ASGARD-IRI archive
          </h3>
          <p className="text-sm text-[#4b5563] mb-7 leading-relaxed">
            Find research outputs, publications, scholars, or programmes across the foundation&apos;s network.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-white border border-[#0a1733]/15 rounded-xl shadow-[0_8px_24px_-16px_rgba(10,23,51,0.2)] focus-within:border-[#c9a35d] focus-within:shadow-[0_8px_24px_-12px_rgba(201,163,93,0.35)] transition-all">
            <div className="flex items-center flex-1 w-full pl-3 pr-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-[#9ca3af] flex-shrink-0">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                id="searchInput"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search publications, labs, scholars…"
                className="w-full px-3 py-3 bg-transparent text-sm text-[#0a1733] placeholder-[#9ca3af] outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-[#c9a35d] to-[#d8b878] text-[#060d22] font-semibold text-xs tracking-[0.08em] uppercase transition-all duration-200 hover:shadow-[0_6px_14px_-6px_rgba(201,163,93,0.5)] hover:-translate-y-0.5 active:translate-y-0 flex-shrink-0"
            >
              Search
            </button>
          </form>

          {/* Popular searches */}
          <div className="mt-5 text-xs text-[#6b7280]">
            <span className="font-medium mr-2 text-[#4b5563]">Popular:</span>
            <div className="inline-flex flex-wrap justify-center gap-1.5 mt-1.5 sm:mt-0">
              {popularSearches.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.to}
                  className="inline-block px-3 py-1 rounded-full border border-[#0a1733]/10 text-[#11214a] text-xs hover:border-[#c9a35d] hover:text-[#c9a35d] hover:bg-[#c9a35d]/5 transition-all"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
