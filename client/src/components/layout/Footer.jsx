import { Link } from 'react-router-dom';

const footerLinks = {
  Foundation: [
    { label: 'About ASGARD-IRI', href: '/about' },
    { label: 'Leadership',       href: '/about#leadership' },
    { label: 'Governance',       href: '/about#governance' },
    { label: 'Contact Us',       href: '/contact' },
  ],
  Research: [
    { label: 'Research Areas',   href: '/research' },
    { label: 'Journals',         href: '/journals' },
    { label: 'Publications',     href: '/publications' },
    { label: 'Repository',       href: '/research/repository' },
  ],
  Programmes: [
    { label: 'Conferences',      href: '/conferences' },
    { label: 'Academy',          href: '/academy' },
    { label: 'Innovation Hub',   href: '/innovation-hub' },
    { label: 'AI & Tech Lab',    href: '/ai-tech-lab' },
  ],
  Opportunities: [
    { label: 'Careers',          href: '/opportunities?category=career' },
    { label: 'Internships',      href: '/opportunities?category=internship' },
    { label: 'Fellowships',      href: '/opportunities?category=fellowship' },
    { label: 'Verify Certificate', href: '/verify' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#03060f] text-[#a7b0c4] pt-20 border-t border-[rgba(201,162,39,0.15)]">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-10 pb-16">
          {/* Brand Column */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3.5 sm:gap-4 text-white mb-5 group">
              <img
                src="/logo.png"
                alt="ASGARD-IRI"
                className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain shrink-0 rounded-full transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_2px_12px_rgba(201,162,39,0.3)]"
              />
              <span className="flex flex-col leading-none">
                <span className="font-['Cormorant_Garamond',Georgia,serif] font-semibold text-2xl sm:text-3xl lg:text-[2rem] tracking-[0.04em] text-white">
                  ASGARD
                </span>
                <span className="text-[0.62rem] sm:text-[0.68rem] lg:text-[0.74rem] tracking-[0.34em] text-[#c9a227] uppercase mt-1 font-semibold">
                  IRI
                </span>
              </span>
            </Link>
            <p className="text-[#6b7591] text-xs sm:text-[0.92rem] leading-relaxed max-w-sm">
              ASGARD International Foundation for Research and Innovation. Building institutional credibility through research, publication, education and collaboration.
            </p>
            {/* Socials */}
            <div className="flex gap-2.5 mt-5">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-lg grid place-items-center border border-white/10 text-[#a7b0c4] hover:text-[#e3bd4a] hover:border-[rgba(201,162,39,0.42)] hover:bg-[rgba(201,162,39,0.06)] transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.3 0-2.95-1.8-2.95s-2.07 1.4-2.07 2.85V21h-4z"/>
                </svg>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
                className="w-9 h-9 rounded-lg grid place-items-center border border-white/10 text-[#a7b0c4] hover:text-[#e3bd4a] hover:border-[rgba(201,162,39,0.42)] hover:bg-[rgba(201,162,39,0.06)] transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h3l-7 8 8 12h-6l-5-7-5 7H3l8-9L3 2h6l4 6z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-lg grid place-items-center border border-white/10 text-[#a7b0c4] hover:text-[#e3bd4a] hover:border-[rgba(201,162,39,0.42)] hover:bg-[rgba(201,162,39,0.06)] transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 7.5a3 3 0 0 0-2.1-2.1C19 5 12 5 12 5s-7 0-8.9.4A3 3 0 0 0 1 7.5C.6 9.4.6 12 .6 12s0 2.6.4 4.5a3 3 0 0 0 2.1 2.1C5 19 12 19 12 19s7 0 8.9-.4a3 3 0 0 0 2.1-2.1c.4-1.9.4-4.5.4-4.5s0-2.6-.4-4.5zM9.8 15.5v-7l6 3.5z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading} className="col-span-1">
              <h4 className="text-[#c9a227] font-semibold text-[0.72rem] tracking-[0.22em] uppercase mb-4 sm:mb-5">
                {heading}
              </h4>
              <ul className="space-y-2.5 sm:space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-[#a7b0c4] text-xs sm:text-[0.9rem] hover:text-[#e3bd4a] hover:pl-1 transition-all duration-200 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.08] py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-[0.8rem] text-[#6b7591] text-center sm:text-left">
          <span>© {new Date().getFullYear()} ASGARD-IRI. All rights reserved.</span>
          <div className="flex gap-4 sm:gap-5 flex-wrap justify-center sm:justify-end">
            <Link to="/policies/privacy" className="hover:text-[#e3bd4a] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/policies/terms" className="hover:text-[#e3bd4a] transition-colors">
              Terms of Use
            </Link>
            <Link to="/policies/ethics" className="hover:text-[#e3bd4a] transition-colors">
              Ethics Policy
            </Link>
            <a href="/sitemap.xml" className="hover:text-[#e3bd4a] transition-colors">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

