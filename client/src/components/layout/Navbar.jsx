import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPublicSchoolActive } from '../../services/content.service';
import { useTranslation } from 'react-i18next';

const primaryNavLinks = [
  { key: 'about',         label: 'About',         href: '/about' },
  { key: 'research',      label: 'Research Labs', href: '/research' },
  { key: 'journals',      label: 'Journals',      href: '/journals' },
  { key: 'publications',  label: 'Publications',  href: '/publications' },
  { key: 'conferences',   label: 'Conferences',   href: '/conferences' },
  { key: 'academy',       label: 'Academy',       href: '/academy' },
];

const secondaryNavLinks = [
  { key: 'consultancy',   label: 'Consultancy',   href: '/consultancy' },
  { key: 'opportunities', label: 'Opportunities', href: '/opportunities' },
  { key: 'partners',      label: 'Partners',      href: '/partners' },
  { key: 'contact',       label: 'Contact',       href: '/contact' },
];

const ADMIN_ROLES = ['super_admin', 'foundation_admin', 'content_editor', 'research_admin'];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [publicSchoolActive, setPublicSchoolActive] = useState(false);
  const moreDropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    getPublicSchoolActive()
      .then((res) => {
        if (res && res.active) setPublicSchoolActive(true);
      })
      .catch(() => {});
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close menus on route change
  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  // Close menus on Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setMoreOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const onMouseDown = (e) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const currentSecondaryNavLinks = publicSchoolActive
    ? [...secondaryNavLinks, { key: 'public_school', label: 'Public School', href: '/public-school' }]
    : secondaryNavLinks;

  const allNavLinks = [...primaryNavLinks, ...currentSecondaryNavLinks];

  const isAdmin = user && ADMIN_ROLES.includes(user.role);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 bg-[#15202E] border-b border-[rgba(212,168,67,0.25)] shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${
          scrolled
            ? 'py-2.5'
            : 'py-3 sm:py-3.5'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3.5 text-white shrink-0 group min-w-0">
            <img
              src="/logo.png"
              alt="ASGARD-IRI"
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain shrink-0 rounded-full transition-transform duration-300 group-hover:scale-105"
            />
            <span className="flex flex-col leading-none min-w-0">
              <span className="font-['Cormorant_Garamond',Georgia,serif] font-semibold text-xl sm:text-2xl tracking-[0.04em] text-white">
                ASGARD
              </span>
              <span className="text-[0.58rem] sm:text-[0.62rem] tracking-[0.28em] sm:tracking-[0.34em] text-[#c9a227] uppercase mt-0.5 sm:mt-1 font-semibold">
                IRI
              </span>
            </span>
          </Link>

          {/* Desktop Primary Nav Links */}
          <nav className="hidden xl:flex items-center gap-1 shrink-0" aria-label="Primary">
            {primaryNavLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `text-[0.82rem] 2xl:text-[0.84rem] font-medium px-2.5 2xl:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-white bg-[#0e1722]'
                      : 'text-[#a7b0c4] hover:text-white hover:bg-[#1e2d40]'
                  }`
                }
              >
                {t(`nav.${link.key}`, link.label)}
              </NavLink>
            ))}

            {/* "More" Dropdown Menu for xl screens (1280px - 1535px) */}
            <div
              ref={moreDropdownRef}
              className="relative xl:block 2xl:hidden"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button
                type="button"
                onClick={() => setMoreOpen((prev) => !prev)}
                className={`text-[0.82rem] font-medium px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 ${
                  moreOpen || currentSecondaryNavLinks.some((l) => location.pathname.startsWith(l.href))
                    ? 'text-[#e3bd4a] bg-[#0e1722]'
                    : 'text-[#a7b0c4] hover:text-white hover:bg-[#1e2d40]'
                }`}
                aria-expanded={moreOpen}
                aria-haspopup="true"
              >
                <span>{t('nav.more', 'More')}</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180 text-[#e3bd4a]' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu Box */}
              {moreOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 py-2 bg-[#15202E] border border-[rgba(212,168,67,0.25)] rounded-xl shadow-[0_16px_40px_-10px_rgba(0,0,0,0.85)] z-50 backdrop-blur-md">
                  {currentSecondaryNavLinks.map((link) => (
                    <NavLink
                      key={link.href}
                      to={link.href}
                      onClick={() => setMoreOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2 text-[0.82rem] font-medium transition-colors ${
                          isActive
                            ? 'text-[#e3bd4a] bg-[#0e1722]'
                            : 'text-[#a7b0c4] hover:text-white hover:bg-[#1e2d40]'
                        }`
                      }
                    >
                      <span>{t(`nav.${link.key}`, link.label)}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Inline secondary links on very large screens (2xl+ >= 1536px) */}
            <div className="hidden 2xl:flex items-center gap-1">
              {currentSecondaryNavLinks.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    `text-[0.84rem] font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-white bg-[#0e1722]'
                        : 'text-[#a7b0c4] hover:text-white hover:bg-[#1e2d40]'
                    }`
                  }
                >
                  {t(`nav.${link.key}`, link.label)}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Search Icon (Hidden on Home page) */}
            {!isHome && (
              <Link
                to="/search"
                aria-label="Search"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl grid place-items-center text-[#a7b0c4] border border-white/10 hover:text-[#e3bd4a] hover:border-[rgba(201,162,39,0.42)] hover:bg-[#091021] transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </Link>
            )}

            {/* Auth Buttons */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-xs font-semibold text-[#e3bd4a] px-3 py-1.5 rounded-lg border border-[rgba(201,162,39,0.3)] hover:bg-[#0c142a] transition-colors whitespace-nowrap"
                  >
                    {t('nav.admin', 'Admin')}
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="text-white text-[0.84rem] font-medium px-3 py-1.5 rounded-lg hover:text-[#e3bd4a] transition-colors whitespace-nowrap"
                >
                  {t('nav.dashboard', 'Dashboard')}
                </Link>
                <button
                  onClick={logout}
                  className="text-[#a7b0c4] text-[0.84rem] font-medium px-3 py-1.5 rounded-lg hover:text-white transition-colors whitespace-nowrap"
                >
                  {t('nav.logout', 'Sign Out')}
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <Link
                  to="/login"
                  className="text-white text-[0.84rem] font-medium px-3 py-1.5 rounded-lg hover:text-[#e3bd4a] transition-colors whitespace-nowrap"
                >
                  {t('nav.login', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-1.5 rounded-full font-semibold text-[0.84rem] text-[#03060f] bg-gradient-to-br from-[#e3bd4a] to-[#c9a227] shadow-[0_12px_28px_-10px_rgba(201,162,39,0.6)] hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-10px_rgba(227,189,74,0.7)] transition-all whitespace-nowrap"
                >
                  {t('nav.register', 'Register')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="xl:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-xl grid place-items-center text-[#a7b0c4] border border-white/10 hover:text-[#e3bd4a] hover:border-[rgba(201,162,39,0.42)] hover:bg-[#091021] transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-in Menu */}
      <div
        className={`fixed inset-0 z-[200] bg-[#03060f] flex flex-col px-7 pt-20 pb-10 transition-transform duration-450 ease-[cubic-bezier(.16,.84,.44,1)] overflow-y-auto ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="absolute top-6 right-6 w-11 h-11 rounded-xl grid place-items-center text-white border border-white/15 hover:border-[#c9a227] hover:text-[#e3bd4a] transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col mt-4 divide-y divide-white/10">
          {allNavLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setOpen(false)}
              className="text-[#e9ecf5] font-['Cormorant_Garamond',Georgia,serif] font-semibold text-[1.8rem] py-3.5 hover:text-[#e3bd4a] transition-colors"
            >
              {t(`nav.${link.key}`, link.label)}
            </Link>
          ))}
        </div>

        {/* Mobile menu auth links */}
        <div className="mt-8 pt-6 border-t border-white/15 flex flex-col gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="text-[#e3bd4a] font-['Cormorant_Garamond',Georgia,serif] text-2xl font-semibold py-2"
                >
                  Admin Console
                </Link>
              )}
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="text-white font-['Cormorant_Garamond',Georgia,serif] text-2xl font-semibold py-2"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="text-left text-[#a7b0c4] font-['Cormorant_Garamond',Georgia,serif] text-2xl font-semibold py-2 hover:text-white"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-3 rounded-lg border border-white/20 text-white font-semibold text-base hover:border-[#c9a227] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-3 rounded-lg bg-gradient-to-br from-[#e3bd4a] to-[#c9a227] text-[#03060f] font-semibold text-base shadow-md"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

