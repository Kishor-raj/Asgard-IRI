import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import useFetch from '../../hooks/useFetch';
import { getHomeSummary } from '../../services/content.service';
import SkeletonCard from '../../components/common/SkeletonCard';

// ── Animated Counter Hook ────────────────────────────────────────────────────
function useCounter(target, duration = 1600, start = false) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    let frameId;

    const step = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(eased * target));
      if (p < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [start, target, duration]);

  return value;
}

// ── Animated Stat Component ──────────────────────────────────────────────────
function StatItem({ count, suffix = '+', label, isLast = false }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const val = useCounter(count, 1600, visible);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center relative px-3">
      {!isLast && (
        <span
          className="hidden lg:block absolute right-[-12px] top-[15%] bottom-[15%] w-[1px] pointer-events-none"
          style={{
            background: 'linear-gradient(transparent, rgba(201,162,39,0.3), transparent)',
          }}
        />
      )}
      <div
        className="font-['Cormorant_Garamond',Georgia,serif] font-semibold text-3xl sm:text-4xl lg:text-[3.4rem] leading-none tracking-[-0.02em]"
        style={{
          background: 'linear-gradient(120deg, #ffffff, #e3bd4a)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {val.toLocaleString()}
        {suffix}
      </div>
      <div className="mt-3 text-[0.76rem] tracking-[0.2em] uppercase text-[#a7b0c4] font-medium">
        {label}
      </div>
    </div>
  );
}

// ── Scroll Reveal Component ──────────────────────────────────────────────────
function RevealDiv({ children, className = '', style = {}, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(28px)',
        transition: `opacity 0.9s cubic-bezier(.16,.84,.44,1) ${delay}ms, transform 0.9s cubic-bezier(.16,.84,.44,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── SVG Pillar Icons ─────────────────────────────────────────────────────────
const pillarIcons = {
  flask: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6M10 3v6.5L4.5 18a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 9.5V3" />
      <path d="M7.5 14h9" />
    </svg>
  ),
  book: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  doc: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h6" />
    </svg>
  ),
  users: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  grad: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  cpu: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </svg>
  ),
  bulb: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" />
    </svg>
  ),
  briefcase: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  arrowRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
};

const pillars = [
  {
    icon: pillarIcons.flask,
    title: 'Frontier Research Labs',
    desc: 'Specialised institutes in Quantum Computing, Artificial Intelligence, Renewable Energy, and Biotechnology.',
    link: '/research',
  },
  {
    icon: pillarIcons.book,
    title: 'Open Access Journals',
    desc: 'Rigorous double-blind peer review, high editorial ethics, and global indexing in academic repositories.',
    link: '/journals',
  },
  {
    icon: pillarIcons.doc,
    title: 'Monographs & Books',
    desc: 'Academic treatises, edited volumes, conference proceedings, and technical reports.',
    link: '/publications',
  },
  {
    icon: pillarIcons.users,
    title: 'Global Academic Summits',
    desc: 'International assemblies convening distinguished keynote speakers, emerging doctoral researchers, and industry pioneers.',
    link: '/conferences',
  },
  {
    icon: pillarIcons.grad,
    title: 'ASGARD Academy',
    desc: 'High-impact Faculty Development Programmes (FDP), AI bootcamps, and research methodology masterclasses.',
    link: '/academy',
  },
  {
    icon: pillarIcons.cpu,
    title: 'AI & Emerging Tech Lab',
    desc: 'Applied laboratory advancing generative models, edge machine learning, and AI ethics.',
    link: '/ai-tech-lab',
  },
  {
    icon: pillarIcons.bulb,
    title: 'Innovation Hub',
    desc: 'Incubating high-impact deep-tech ventures, student prototypes, and patent pipelines.',
    link: '/innovation-hub',
  },
  {
    icon: pillarIcons.briefcase,
    title: 'Consultancy & Advisory',
    desc: 'Expert research consulting, institutional accreditation support, and technology audits.',
    link: '/consultancy',
  },
];

const subnavItems = [
  { label: 'Research', href: '/research' },
  { label: 'Journals', href: '/journals' },
  { label: 'Conferences', href: '/conferences' },
  { label: 'Academy', href: '/academy' },
  { label: 'AI & Technology', href: '/ai-tech-lab' },
  { label: 'Innovation', href: '/innovation-hub' },
  { label: 'Consultancy', href: '/consultancy' },
];

const defaultResearchCards = [
  {
    tag: 'Quantum',
    glyph: 'Ψ',
    title: 'Quantum Information Systems',
    meta: ['Phase II', '14 Researchers'],
    desc: 'Investigating fault-tolerant qubit architectures and photonic interconnects for next-generation quantum computation.',
    bg: 'linear-gradient(135deg, #0c142a, #03060f)',
  },
  {
    tag: 'AI / ML',
    glyph: '∇',
    title: 'Generative & Edge Intelligence',
    meta: ['Phase III', '22 Researchers'],
    desc: 'Developing efficient foundation models for edge deployment with rigorous alignment and interpretability frameworks.',
    bg: 'linear-gradient(135deg, #150a22, #03060f)',
  },
  {
    tag: 'Energy',
    glyph: '⚡',
    title: 'Renewable Energy Materials',
    meta: ['Phase II', '11 Researchers'],
    desc: 'Designing perovskite tandems and catalytic systems for scalable, sustainable energy harvesting and storage.',
    bg: 'linear-gradient(135deg, #0a1c18, #03060f)',
  },
];

const defaultPublications = [
  {
    date: '12',
    month: 'Oct',
    title: 'Coherence-Preserving Qubit Routing in Noisy Intermediate-Scale Devices',
    source: 'Journal of Quantum Information · Vol. 14',
    href: '/publications',
  },
  {
    date: '28',
    month: 'Sep',
    title: 'On the Ethics of Generative Models in Academic Authorship',
    source: 'ASGARD Review of Computing · Vol. 9',
    href: '/publications',
  },
  {
    date: '14',
    month: 'Sep',
    title: 'Perovskite Tandem Cells: A Pathway to 35% Efficiency',
    source: 'Journal of Sustainable Materials · Vol. 6',
    href: '/publications',
  },
];

const defaultNews = [
  {
    date: '20',
    month: 'Oct',
    title: 'Call for Papers: ASGARD International Summit 2026 now open',
    source: 'Submissions accepted through 15 January 2026',
    href: '/news',
  },
  {
    date: '05',
    month: 'Oct',
    title: 'ASGARD Academy launches Faculty Development Programme in AI Research Methods',
    source: 'Registration open · 60 seats across 12 institutions',
    href: '/news',
  },
  {
    date: '22',
    month: 'Sep',
    title: 'New partnership signed with the Nordic Institute of Computational Science',
    source: 'Joint fellowships and shared computing cluster announced',
    href: '/news',
  },
];

export default function HomePage() {
  const { t } = useTranslation();
  const { data: summaryData, loading } = useFetch(getHomeSummary);
  const summary = summaryData?.data || {};
  const featuredProjects = summary.featuredProjects || [];
  const featuredPublications = summary.featuredPublications || [];
  const latestNews = summary.latestNews || [];

  return (
    <div className="bg-[#fbf9f3] text-[#1a2138] overflow-x-hidden selection:bg-[#c9a227] selection:text-[#03060f]">
      <Helmet>
        <title>ASGARD International Foundation — Advancing Frontier Science</title>
        <meta
          name="description"
          content="ASGARD Institute of Research & Innovation convenes premier researchers, pioneers transformative technology prototypes, and publishes high-impact open-access journals."
        />
      </Helmet>

      {/* ===================== HERO ===================== */}
      <section
        className="relative min-h-screen flex items-center pt-28 sm:pt-36 pb-20 sm:pb-24 text-white overflow-hidden"
        style={{
          background:
            'radial-gradient(1200px 600px at 80% -10%, rgba(201,162,39,0.18), transparent 60%), radial-gradient(900px 500px at 10% 110%, rgba(21,30,40,0.7), transparent 60%), linear-gradient(160deg, #05080C 0%, #0c131d 50%, #151E28 100%)',
        }}
      >
        {/* Fine grid background pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
          }}
        />

        <div className="max-w-[1240px] mx-auto px-5 sm:px-7 relative z-10 w-full">
          <div className="max-w-[980px]">
            <RevealDiv delay={0}>
              <span className="overline mb-6 no-underline">
                Autonomous International Research Institution
              </span>
            </RevealDiv>

            <RevealDiv delay={80}>
              <h1 className="font-['Cormorant_Garamond',Georgia,serif] font-semibold text-[2rem] sm:text-4xl md:text-5xl lg:text-[3.2rem] xl:text-[3.75rem] 2xl:text-[4.5rem] leading-[1.08] sm:leading-[1.04] tracking-[-0.015em] text-white mb-6 break-words">
                ASGARD International Foundation
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                <span
                  style={{
                    background: 'linear-gradient(120deg, #e3bd4a, #d8b85a 60%, #c9a227)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontStyle: 'italic',
                  }}
                >
                  Advancing Frontier Science,
                </span>
                <br />
                Interdisciplinary Innovation &amp; Global Scholar Fellowship
              </h1>
            </RevealDiv>

            <RevealDiv delay={160}>
              <p className="text-[#a7b0c4] text-base sm:text-lg lg:text-[1.12rem] leading-relaxed max-w-2xl mb-10 font-light">
                ASGARD Institute of Research &amp; Innovation convenes premier researchers,
                pioneers transformative technology prototypes, and publishes high-impact
                open-access journals.
              </p>
            </RevealDiv>

            <RevealDiv delay={240}>
              <div className="flex flex-col xs:flex-row sm:flex-row gap-3.5 sm:gap-4 items-stretch sm:items-center flex-wrap">
                <Link to="/research" className="btn-gold group justify-center text-center">
                  <span>Explore Research</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    {pillarIcons.arrowRight}
                  </span>
                </Link>
                <Link to="/opportunities" className="btn-ghost justify-center text-center">
                  Opportunities
                </Link>
              </div>
            </RevealDiv>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 text-[#6b7591] text-[0.68rem] tracking-[0.22em] uppercase z-10 pointer-events-none">
          <span>Scroll</span>
          <div className="w-[22px] h-[36px] rounded-[14px] border border-white/30 relative">
            <span
              className="absolute top-[7px] left-1/2 -translate-x-1/2 w-[3px] h-[7px] rounded-full bg-[#e3bd4a]"
              style={{
                animation: 'scrollDot 1.8s ease-in-out infinite',
              }}
            />
          </div>
          <style>{`
            @keyframes scrollDot {
              0% { opacity: 0; transform: translate(-50%, 0); }
              40% { opacity: 1; }
              80% { opacity: 0; transform: translate(-50%, 12px); }
              100% { opacity: 0; transform: translate(-50%, 12px); }
            }
          `}</style>
        </div>
      </section>

      {/* ===================== SECONDARY NAV ===================== */}
      <nav
        aria-label="Section navigation"
        className="bg-[#060b18] border-y border-[rgba(201,162,39,0.18)] relative z-20"
      >
        <div className="max-w-[1240px] mx-auto px-5 sm:px-7 py-3 flex gap-2 overflow-x-auto scrollbar-none">
          {subnavItems.map((item, idx) => (
            <Link
              key={item.label}
              to={item.href}
              className={`text-[0.78rem] font-semibold tracking-[0.16em] uppercase px-4 py-2 rounded-lg whitespace-nowrap shrink-0 transition-all ${
                idx === 0
                  ? 'text-[#03060f] bg-gradient-to-br from-[#e3bd4a] to-[#c9a227]'
                  : 'text-[#a7b0c4] hover:text-[#03060f] hover:bg-gradient-to-br hover:from-[#e3bd4a] hover:to-[#c9a227]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* ===================== PILLARS ===================== */}
      <section className="py-20 sm:py-28 bg-[#fbf9f3]" id="pillars">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-7">
          <RevealDiv className="max-w-[720px] mb-12 sm:mb-14">
            <span className="overline mb-4 no-underline">Integrated Structure</span>
            <h2 className="font-['Cormorant_Garamond',Georgia,serif] font-semibold text-2xl sm:text-4xl lg:text-5xl text-[#03060f] leading-tight tracking-[-0.015em] mb-4">
              Core Institutional Pillars
            </h2>
            <p className="text-[#4a5375] text-sm sm:text-base lg:text-[1.06rem] leading-relaxed">
              Discover our integrated ecosystem supporting researchers across every stage of the discovery cycle.
            </p>
          </RevealDiv>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {pillars.map((pillar, i) => (
              <RevealDiv key={pillar.title} delay={(i % 4) * 80}>
                <Link
                  to={pillar.link}
                  className="group block bg-white rounded-2xl p-6 sm:p-7 border border-[#16223f]/[0.08] hover:border-[rgba(201,162,39,0.42)] relative overflow-hidden transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(8,11,22,0.6)] h-full flex flex-col justify-between"
                >
                  {/* Left accent bar */}
                  <span
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#e3bd4a] to-[#9c7a1c] scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-450 ease-out"
                  />

                  <div>
                    {/* Icon */}
                    <div className="w-[52px] h-[52px] rounded-xl grid place-items-center bg-gradient-to-br from-[rgba(201,162,39,0.12)] to-[rgba(201,162,39,0.04)] border border-[rgba(201,162,39,0.22)] text-[#9c7a1c] group-hover:bg-gradient-to-br group-hover:from-[#e3bd4a] group-hover:to-[#c9a227] group-hover:text-[#03060f] group-hover:border-transparent group-hover:-rotate-3 transition-all duration-400 mb-5">
                      {pillar.icon}
                    </div>

                    {/* Title & Desc */}
                    <h3 className="font-['Cormorant_Garamond',Georgia,serif] font-semibold text-lg sm:text-xl text-[#03060f] mb-2 leading-snug tracking-[-0.005em]">
                      {pillar.title}
                    </h3>
                    <p className="text-[#525c7d] text-xs sm:text-[0.92rem] leading-relaxed mb-5">
                      {pillar.desc}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-[#c9a227] font-semibold text-[0.82rem] tracking-wide group-hover:gap-2.5 transition-all">
                    View Details <span>→</span>
                  </span>
                </Link>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== STATS ===================== */}
      <section
        className="text-white border-y border-[rgba(201,162,39,0.15)]"
        style={{
          background:
            'radial-gradient(800px 400px at 20% 0%, rgba(201,162,39,0.12), transparent 60%), linear-gradient(160deg, #060b18, #03060f)',
        }}
      >
        <div className="max-w-[1240px] mx-auto px-5 sm:px-7 py-14 sm:py-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <StatItem count={500} suffix="+" label="Scholars & Fellows" />
            <StatItem count={1200} suffix="+" label="Peer-Reviewed Papers" />
            <StatItem count={24} suffix="+" label="Conferences Hosted" />
            <StatItem count={45} suffix="+" label="Countries Reached" isLast />
          </div>
        </div>
      </section>

      {/* ===================== FEATURED RESEARCH ===================== */}
      <section
        className="py-20 sm:py-28"
        id="research"
        style={{
          background: 'linear-gradient(180deg, #fbf9f3, #f7f3ea)',
        }}
      >
        <div className="max-w-[1240px] mx-auto px-5 sm:px-7">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6 mb-10 sm:mb-12">
            <RevealDiv>
              <span className="overline mb-3 no-underline">Active Inquiry</span>
              <h2 className="font-['Cormorant_Garamond',Georgia,serif] font-semibold text-2xl sm:text-4xl lg:text-5xl text-[#03060f] tracking-[-0.015em]">
                Featured Research Programmes
              </h2>
            </RevealDiv>
            <RevealDiv delay={100}>
              <Link
                to="/research"
                className="inline-flex items-center gap-1.5 text-[#c9a227] font-semibold text-[0.86rem] hover:gap-2.5 hover:text-[#e3bd4a] transition-all"
              >
                View all 6 labs <span>→</span>
              </Link>
            </RevealDiv>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featuredProjects.length > 0
                ? featuredProjects.slice(0, 3)
                : defaultResearchCards
              ).map((card, i) => {
                const isDynamic = Boolean(card.id);
                const tag = isDynamic ? card.domain || 'Lab' : card.tag;
                const glyph = isDynamic ? '◈' : card.glyph;
                const title = card.title;
                const desc = card.description || card.desc;
                const metaList = isDynamic
                  ? [card.status || 'Active', card.lead_researcher_name || 'Institutional Lab']
                  : card.meta;
                const bg = card.bg || 'linear-gradient(135deg, #0c142a, #03060f)';

                return (
                  <RevealDiv key={card.id || card.title} delay={i * 90}>
                    <div
                      className="bg-white rounded-2xl overflow-hidden border border-[#16223f]/[0.07] hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(8,11,22,0.6)] transition-all duration-400 flex flex-col h-full group"
                    >
                      {/* Cover */}
                      <div
                        className="h-44 relative overflow-hidden"
                        style={{ background: bg }}
                      >
                        <span className="absolute inset-0 grid place-items-center text-[rgba(201,162,39,0.28)] font-['Cormorant_Garamond',Georgia,serif] font-semibold text-7xl italic select-none pointer-events-none group-hover:scale-110 transition-transform duration-500">
                          {glyph}
                        </span>
                        <span className="absolute top-3.5 left-3.5 bg-[#03060f] text-[#e3bd4a] text-[0.66rem] font-semibold tracking-[0.18em] uppercase px-3 py-1 rounded-full border border-[rgba(201,162,39,0.3)]">
                          {tag}
                        </span>
                      </div>

                      {/* Body */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-['Cormorant_Garamond',Georgia,serif] font-semibold text-2xl text-[#03060f] mb-2 leading-snug">
                            {title}
                          </h3>

                          {/* Meta tags */}
                          <div className="flex gap-3 text-[0.74rem] text-[#6b7591] mb-4 flex-wrap">
                            {metaList.map((m, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1.5">
                                <span className="text-[#c9a227]">{idx === 0 ? '●' : '▣'}</span>
                                {m}
                              </span>
                            ))}
                          </div>

                          <p className="text-[#525c7d] text-[0.9rem] leading-relaxed mb-6 line-clamp-3">
                            {desc}
                          </p>
                        </div>

                        <Link
                          to={isDynamic ? `/research#lab-${card.lab_id || ''}` : '/research'}
                          className="inline-flex items-center gap-1.5 text-[#c9a227] font-semibold text-[0.84rem] hover:gap-2.5 transition-all"
                        >
                          Read dossier <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </RevealDiv>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===================== PUBLICATIONS & NEWS ===================== */}
      <section className="py-20 sm:py-28 bg-[#f7f3ea]" id="pn">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-7">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
            {/* Recent Publications */}
            <RevealDiv delay={0}>
              <div className="bg-white rounded-3xl p-5 sm:p-8 lg:p-10 border border-[#16223f]/[0.07] shadow-[0_10px_30px_-20px_rgba(8,11,22,0.2)] flex flex-col min-h-[380px] h-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-2 sm:gap-4 mb-6 pb-4 border-b border-[#16223f]/[0.06]">
                  <h3 className="font-['Cormorant_Garamond',Georgia,serif] font-semibold text-2xl sm:text-3xl text-[#03060f] tracking-[-0.005em]">
                    Recent Publications
                  </h3>
                  <Link
                    to="/publications"
                    className="inline-flex items-center gap-1 text-[#c9a227] font-semibold text-[0.84rem] hover:gap-2 transition-all whitespace-nowrap"
                  >
                    Browse Repository <span>→</span>
                  </Link>
                </div>

                <ul className="flex-1 flex flex-col divide-y divide-[#16223f]/[0.06]">
                  {(featuredPublications.length > 0
                    ? featuredPublications.slice(0, 3)
                    : defaultPublications
                  ).map((pub, i) => {
                    const isDynamic = Boolean(pub.id);
                    const dateNum = isDynamic
                      ? pub.year ? String(pub.year).slice(-2) : '26'
                      : pub.date;
                    const dateSub = isDynamic ? 'Year' : pub.month;
                    const title = pub.title;
                    const subtitle = isDynamic
                      ? `${pub.journal_title || 'ASGARD Open Access'}${pub.authors ? ` · ${pub.authors}` : ''}`
                      : pub.source;

                    return (
                      <li
                        key={pub.id || pub.title}
                        className="flex gap-3 sm:gap-5 py-4 sm:py-5 hover:translate-x-1 transition-transform"
                      >
                        <div className="font-['Cormorant_Garamond',Georgia,serif] font-semibold text-lg text-[#9c7a1c] min-w-[48px] sm:min-w-[54px] text-center border-r border-[rgba(201,162,39,0.22)] pr-3 sm:pr-4 shrink-0 leading-tight">
                          {dateNum}
                          <span className="block text-[0.64rem] tracking-[0.18em] uppercase text-[#6b7591] font-['Inter',sans-serif] font-semibold mt-1">
                            {dateSub}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to="/publications"
                            className="font-semibold text-[#03060f] text-[0.96rem] leading-snug mb-1 block hover:text-[#c9a227] transition-colors line-clamp-2"
                          >
                            {title}
                          </Link>
                          <div className="text-[0.82rem] text-[#6b7591] line-clamp-1">
                            {subtitle}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </RevealDiv>

            {/* News & Communiqués */}
            <RevealDiv delay={100}>
              <div className="bg-white rounded-3xl p-5 sm:p-8 lg:p-10 border border-[#16223f]/[0.07] shadow-[0_10px_30px_-20px_rgba(8,11,22,0.2)] flex flex-col min-h-[380px] h-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-2 sm:gap-4 mb-6 pb-4 border-b border-[#16223f]/[0.06]">
                  <h3 className="font-['Cormorant_Garamond',Georgia,serif] font-semibold text-2xl sm:text-3xl text-[#03060f] tracking-[-0.005em]">
                    News &amp; Communiqués
                  </h3>
                  <Link
                    to="/news"
                    className="inline-flex items-center gap-1 text-[#c9a227] font-semibold text-[0.84rem] hover:gap-2 transition-all whitespace-nowrap"
                  >
                    All Announcements <span>→</span>
                  </Link>
                </div>

                <ul className="flex-1 flex flex-col divide-y divide-[#16223f]/[0.06]">
                  {(latestNews.length > 0 ? latestNews.slice(0, 3) : defaultNews).map(
                    (news, i) => {
                      const isDynamic = Boolean(news.id);
                      const d = news.published_at ? new Date(news.published_at) : null;
                      const dateNum = isDynamic
                        ? d ? String(d.getDate()).padStart(2, '0') : '01'
                        : news.date;
                      const dateSub = isDynamic
                        ? d ? d.toLocaleString('en', { month: 'short' }) : 'News'
                        : news.month;
                      const title = news.title;
                      const subtitle = isDynamic ? news.summary : news.source;

                      return (
                        <li
                          key={news.id || news.title}
                          className="flex gap-3 sm:gap-5 py-4 sm:py-5 hover:translate-x-1 transition-transform"
                        >
                          <div className="font-['Cormorant_Garamond',Georgia,serif] font-semibold text-lg text-[#9c7a1c] min-w-[48px] sm:min-w-[54px] text-center border-r border-[rgba(201,162,39,0.22)] pr-3 sm:pr-4 shrink-0 leading-tight">
                            {dateNum}
                            <span className="block text-[0.64rem] tracking-[0.18em] uppercase text-[#6b7591] font-['Inter',sans-serif] font-semibold mt-1">
                              {dateSub}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              to="/news"
                              className="font-semibold text-[#03060f] text-[0.96rem] leading-snug mb-1 block hover:text-[#c9a227] transition-colors line-clamp-2"
                            >
                              {title}
                            </Link>
                            <div className="text-[0.82rem] text-[#6b7591] line-clamp-1">
                              {subtitle}
                            </div>
                          </div>
                        </li>
                      );
                    }
                  )}
                </ul>
              </div>
            </RevealDiv>
          </div>
        </div>
      </section>

      {/* ===================== PARTNER CTA ===================== */}
      <section
        className="relative py-20 sm:py-28 text-white overflow-hidden text-center"
        id="cta"
        style={{
          background:
            'radial-gradient(700px 400px at 85% 20%, rgba(201,162,39,0.2), transparent 60%), radial-gradient(600px 400px at 10% 90%, rgba(30,44,77,0.7), transparent 60%), linear-gradient(160deg, #060b18, #03060f)',
        }}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(201,162,39,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.05) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, #000 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, #000 20%, transparent 70%)',
          }}
        />

        <div className="max-w-[1240px] mx-auto px-5 sm:px-7 relative z-10">
          <div className="max-w-[720px] mx-auto">
            <RevealDiv>
              <span className="overline center mb-5 no-underline">Institutional Partnership</span>
              <h2 className="font-['Cormorant_Garamond',Georgia,serif] font-semibold text-2xl sm:text-4xl lg:text-[3.4rem] leading-tight tracking-[-0.015em] mb-5 text-white">
                Partner With{' '}
                <span
                  style={{
                    background: 'linear-gradient(120deg, #e3bd4a, #d8b85a)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontStyle: 'italic',
                  }}
                >
                  ASGARD-IRI
                </span>
              </h2>
              <p className="text-[#a7b0c4] text-sm sm:text-[1.1rem] leading-relaxed mb-9 font-light">
                Whether you are an academic researcher, industry innovator, or ambitious scholar,
                discover grant opportunities and institutional partnerships.
              </p>
              <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center items-center">
                <Link to="/opportunities" className="btn-gold group w-full sm:w-auto justify-center">
                  <span>Explore Open Calls</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    {pillarIcons.arrowRight}
                  </span>
                </Link>
                <Link to="/contact" className="btn-ghost w-full sm:w-auto justify-center">
                  Contact Secretariat
                </Link>
              </div>
            </RevealDiv>
          </div>
        </div>
      </section>
    </div>
  );
}

