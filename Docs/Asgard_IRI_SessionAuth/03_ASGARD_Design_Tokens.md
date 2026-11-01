# ASGARD-IRI — Design Tokens & UI System
> Version 2.0 | October 2026  
> Stack: React.js + Tailwind CSS v3  
> This file defines HOW IT LOOKS. Apply all tokens globally before building any component.

---

## COLOR PALETTE (All Phases)

### Primary Brand Colors

| Token Name | Hex | Tailwind Key | Usage |
|---|---|---|---|
| Navy (Primary) | `#0B1F4B` | `navy` | Navbar, headers, primary buttons, footer bg |
| Navy Dark | `#071540` | `navy-dark` | Hover on navy elements, footer deep bg |
| Navy Light | `#1A3570` | `navy-light` | Trust strip, secondary nav, sidebar active |
| Gold (Accent) | `#C9A84C` | `gold` | CTAs, highlights, active nav, decorative borders |
| Gold Light | `#E2C97E` | `gold-light` | Hover on gold elements, icon fills |
| Gold Dark | `#A6873A` | `gold-dark` | Active / pressed state on gold buttons |

### Neutral Scale

| Token | Hex | Tailwind Key | Usage |
|---|---|---|---|
| White | `#FFFFFF` | `white` | Page bg, card bg, text on dark |
| Grey 50 | `#F8F9FB` | `grey-50` | Alternating section bg, input bg |
| Grey 100 | `#F1F3F7` | `grey-100` | Card hover bg, table alternate rows |
| Grey 200 | `#E2E6EE` | `grey-200` | Dividers, input borders, outlines |
| Grey 400 | `#9CA3AF` | `grey-400` | Placeholder text, disabled, captions |
| Grey 600 | `#4B5563` | `grey-600` | Secondary text, meta info |
| Grey 900 | `#111827` | `grey-900` | Primary body text |

### Semantic Colors

| Token | Hex | Tailwind Key | Usage |
|---|---|---|---|
| Success | `#16A34A` | `success` | Approved, active, open status |
| Warning | `#D97706` | `warning` | Pending, dummy payment banner |
| Error | `#DC2626` | `error` | Rejected, form errors, closed status |
| Info | `#2563EB` | `info` | Info banners, hyperlinks |

---

## TAILWIND CONFIG (`client/tailwind.config.js`)

Copy this file exactly. Do not modify without updating this doc.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1F4B',
          dark:    '#071540',
          light:   '#1A3570',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light:   '#E2C97E',
          dark:    '#A6873A',
        },
        grey: {
          50:  '#F8F9FB',
          100: '#F1F3F7',
          200: '#E2E6EE',
          400: '#9CA3AF',
          600: '#4B5563',
          900: '#111827',
        },
        success: '#16A34A',
        warning: '#D97706',
        error:   '#DC2626',
        info:    '#2563EB',
      },
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs':   ['0.75rem',  { lineHeight: '1rem' }],
        'sm':   ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem',     { lineHeight: '1.75rem' }],
        'lg':   ['1.125rem', { lineHeight: '1.875rem' }],
        'xl':   ['1.25rem',  { lineHeight: '1.875rem' }],
        '2xl':  ['1.5rem',   { lineHeight: '2rem' }],
        '3xl':  ['1.875rem', { lineHeight: '2.375rem' }],
        '4xl':  ['2.25rem',  { lineHeight: '2.75rem' }],
        '5xl':  ['3rem',     { lineHeight: '3.5rem' }],
      },
      borderRadius: {
        'sm':  '0.25rem',
        'md':  '0.5rem',
        'lg':  '0.75rem',
        'xl':  '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'card':    '0 2px 8px rgba(0,0,0,0.08)',
        'card-md': '0 4px 16px rgba(0,0,0,0.12)',
        'card-lg': '0 8px 32px rgba(0,0,0,0.16)',
        'nav':     '0 2px 12px rgba(11,31,75,0.15)',
      },
      maxWidth: {
        'content': '1200px',
        'narrow':  '800px',
        'wide':    '1440px',
      },
    },
  },
  plugins: [],
};
```

---

## GLOBAL CSS (`client/src/styles/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* CSS custom properties for non-Tailwind contexts */
:root {
  --color-navy:        #0B1F4B;
  --color-navy-dark:   #071540;
  --color-navy-light:  #1A3570;
  --color-gold:        #C9A84C;
  --color-gold-light:  #E2C97E;
  --color-gold-dark:   #A6873A;
  --color-white:       #FFFFFF;
  --color-grey-50:     #F8F9FB;
  --color-grey-200:    #E2E6EE;
  --color-grey-900:    #111827;

  --font-sans:    'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-display: 'Poppins', 'Inter', sans-serif;

  --shadow-card: 0 2px 8px rgba(0,0,0,0.08);
}

/* Base resets */
*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--font-sans);
  color: #111827;
  background-color: #FFFFFF;
  -webkit-font-smoothing: antialiased;
}

/* Accessibility focus ring */
:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #F1F3F7; }
::-webkit-scrollbar-thumb { background: #9CA3AF; border-radius: 3px; }
```

---

## GOOGLE FONTS SETUP (`client/index.html`)

Add inside `<head>` before any other styles:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
```

### Typography Usage Rules

| Element | Font | Size Token | Weight | Color Token |
|---|---|---|---|---|
| Hero title H1 | Poppins (display) | `5xl` | 700 | `white` (on navy bg) |
| Section heading H2 | Poppins (display) | `3xl` | 700 | `navy` |
| Card / sub-heading H3 | Poppins (display) | `xl` | 600 | `navy` |
| Body text | Inter (sans) | `base` | 400 | `grey-900` |
| Secondary / meta | Inter (sans) | `sm` | 400 | `grey-600` |
| Caption / label | Inter (sans) | `xs` | 500 | `grey-400` |
| Button text | Inter (sans) | `sm` | 600 | varies by variant |
| Navbar links | Inter (sans) | `sm` | 500 | `white` / `grey-900` |
| Form labels | Inter (sans) | `sm` | 500 | `grey-900` |

---

## PHASE 0 — LAYOUT COMPONENTS

### Navbar (`client/src/components/layout/Navbar.jsx`)

```jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const navLinks = [
  { label: 'About',           href: '/about' },
  { label: 'Research',        href: '/research' },
  { label: 'Journals',        href: '/journals' },
  { label: 'Publications',    href: '/publications' },
  { label: 'Conferences',     href: '/conferences' },
  { label: 'Academy',         href: '/academy' },
  { label: 'AI & Tech Lab',   href: '/ai-tech-lab' },
  { label: 'Innovation Hub',  href: '/innovation-hub' },
  { label: 'Consultancy',     href: '/consultancy' },
  { label: 'Opportunities',   href: '/opportunities' },
  { label: 'News & Events',   href: '/news' },
  { label: 'Contact',         href: '/contact' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-navy shadow-nav sticky top-0 z-50">
      <div className="max-w-content mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3 shrink-0">
          <img src="/logo.svg" alt="ASGARD-IRI" className="h-10 w-auto" />
        </NavLink>

        {/* Desktop links */}
        <div className="hidden xl:flex items-center gap-5">
          {navLinks.map(link => (
            <NavLink key={link.href} to={link.href}
              className={({ isActive }) =>
                `text-xs font-medium transition-colors duration-200 whitespace-nowrap ${
                  isActive ? 'text-gold' : 'text-white/80 hover:text-gold'
                }`
              }>
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden xl:flex items-center gap-3 shrink-0">
          {user ? (
            <>
              <NavLink to="/dashboard"
                className="text-xs font-medium text-white/80 hover:text-gold transition-colors">
                Dashboard
              </NavLink>
              <button onClick={logout}
                className="text-xs font-medium text-white/80 hover:text-gold transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login"
                className="text-xs font-medium text-white/80 hover:text-gold transition-colors">
                Login
              </NavLink>
              <NavLink to="/register"
                className="bg-gold text-navy text-xs font-semibold px-4 py-2 rounded-lg
                hover:bg-gold-dark transition-colors">
                Register
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(o => !o)}
          className="xl:hidden text-white p-2">
          {open
            ? <XMarkIcon className="w-6 h-6" />
            : <Bars3Icon className="w-6 h-6" />
          }
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="xl:hidden bg-navy-dark border-t border-white/10 px-6 py-4 space-y-3">
          {navLinks.map(link => (
            <NavLink key={link.href} to={link.href}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block text-sm font-medium py-1 transition-colors ${
                  isActive ? 'text-gold' : 'text-white/80 hover:text-gold'
                }`
              }>
              {link.label}
            </NavLink>
          ))}
          <div className="pt-3 border-t border-white/10 flex gap-4">
            {user ? (
              <>
                <NavLink to="/dashboard" onClick={() => setOpen(false)}
                  className="text-sm text-white/80 hover:text-gold">Dashboard</NavLink>
                <button onClick={() => { logout(); setOpen(false); }}
                  className="text-sm text-white/80 hover:text-gold">Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setOpen(false)}
                  className="text-sm text-white/80 hover:text-gold">Login</NavLink>
                <NavLink to="/register" onClick={() => setOpen(false)}
                  className="bg-gold text-navy text-sm font-semibold px-4 py-1.5 rounded-lg">
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
```

---

### Footer (`client/src/components/layout/Footer.jsx`)

```jsx
const footerLinks = {
  'Foundation': [
    { label: 'About ASGARD-IRI', href: '/about' },
    { label: 'Leadership',       href: '/about#leadership' },
    { label: 'Governance',       href: '/about#governance' },
    { label: 'Contact Us',       href: '/contact' },
  ],
  'Research': [
    { label: 'Research Areas',   href: '/research' },
    { label: 'Journals',         href: '/journals' },
    { label: 'Publications',     href: '/publications' },
    { label: 'Repository',       href: '/research/repository' },
  ],
  'Programmes': [
    { label: 'Conferences',      href: '/conferences' },
    { label: 'Academy',          href: '/academy' },
    { label: 'Innovation Hub',   href: '/innovation-hub' },
    { label: 'AI & Tech Lab',    href: '/ai-tech-lab' },
  ],
  'Opportunities': [
    { label: 'Careers',          href: '/opportunities?category=career' },
    { label: 'Internships',      href: '/opportunities?category=internship' },
    { label: 'Fellowships',      href: '/opportunities?category=fellowship' },
    { label: 'Verify Certificate', href: '/verify' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-white/70 text-sm">
      <div className="max-w-content mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

        {/* Brand column */}
        <div className="lg:col-span-1">
          <img src="/logo.svg" alt="ASGARD-IRI" className="h-10 w-auto mb-4 opacity-90" />
          <p className="text-white/50 text-xs leading-relaxed">
            ASGARD International Foundation for Research and Innovation.
            Building institutional credibility through research, publication,
            education and collaboration.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h4 className="text-white font-semibold text-xs tracking-widest uppercase mb-4">
              {heading}
            </h4>
            <ul className="space-y-2">
              {links.map(link => (
                <li key={link.href}>
                  <a href={link.href}
                    className="hover:text-gold transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-5">
        <div className="max-w-content mx-auto px-6 flex flex-col sm:flex-row justify-between
          items-center gap-3 text-xs text-white/40">
          <span>© {new Date().getFullYear()} ASGARD-IRI. All rights reserved.</span>
          <div className="flex gap-5">
            <a href="/policies/privacy"  className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="/policies/terms"    className="hover:text-gold transition-colors">Terms of Use</a>
            <a href="/policies/ethics"   className="hover:text-gold transition-colors">Ethics Policy</a>
            <a href="/sitemap.xml"       className="hover:text-gold transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

### PageLayout (`client/src/components/layout/PageLayout.jsx`)
```jsx
import Navbar from './Navbar';
import Footer from './Footer';

export default function PageLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

### AdminLayout (`client/src/components/layout/AdminLayout.jsx`)
```jsx
import { NavLink, Outlet } from 'react-router-dom';
import {
  HomeIcon, UsersIcon, BriefcaseIcon, NewspaperIcon,
  AcademicCapIcon, Cog6ToothIcon, ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const adminNav = [
  { label: 'Dashboard',      href: '/admin',               icon: <HomeIcon className="w-5 h-5" /> },
  { label: 'Users',          href: '/admin/users',          icon: <UsersIcon className="w-5 h-5" /> },
  { label: 'Research',       href: '/admin/research',       icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
  { label: 'Journals',       href: '/admin/journals',       icon: <NewspaperIcon className="w-5 h-5" /> },
  { label: 'Publications',   href: '/admin/publications',   icon: <NewspaperIcon className="w-5 h-5" /> },
  { label: 'Conferences',    href: '/admin/conferences',    icon: <AcademicCapIcon className="w-5 h-5" /> },
  { label: 'Academy',        href: '/admin/academy',        icon: <AcademicCapIcon className="w-5 h-5" /> },
  { label: 'Opportunities',  href: '/admin/opportunities',  icon: <BriefcaseIcon className="w-5 h-5" /> },
  { label: 'Applications',   href: '/admin/applications',   icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
  { label: 'Certificates',   href: '/admin/certificates',   icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
  { label: 'News & Events',  href: '/admin/news',           icon: <NewspaperIcon className="w-5 h-5" /> },
  { label: 'Settings',       href: '/admin/settings',       icon: <Cog6ToothIcon className="w-5 h-5" /> },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-grey-50">
      {/* Sidebar */}
      <aside className="w-64 bg-navy min-h-screen flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <img src="/logo.svg" alt="ASGARD Admin" className="h-8 w-auto opacity-90" />
          <p className="text-white/40 text-xs mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {adminNav.map(item => (
            <NavLink key={item.href} to={item.href} end={item.href === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                transition-colors ${isActive
                  ? 'bg-gold text-navy'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-grey-200 px-8 py-4 flex justify-between items-center">
          <h1 className="font-display font-semibold text-navy text-lg">Admin Panel</h1>
        </header>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

### AuthLayout (`client/src/components/layout/AuthLayout.jsx`)
```jsx
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-grey-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="ASGARD-IRI" className="h-12 w-auto mx-auto mb-4" />
          {title && (
            <h1 className="font-display text-2xl font-bold text-navy">{title}</h1>
          )}
          {subtitle && (
            <p className="text-grey-600 text-sm mt-2">{subtitle}</p>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card-md border border-grey-200 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

## PHASE 0 — REUSABLE COMPONENTS

### Button (`client/src/components/common/Button.jsx`)
```jsx
const variants = {
  primary:  'bg-navy text-white hover:bg-navy-dark focus-visible:ring-gold',
  secondary:'bg-gold text-navy hover:bg-gold-dark focus-visible:ring-navy',
  outline:  'border-2 border-navy text-navy hover:bg-navy hover:text-white focus-visible:ring-gold',
  ghost:    'text-navy hover:bg-grey-100 focus-visible:ring-gold',
  danger:   'bg-error text-white hover:bg-red-700 focus-visible:ring-red-400',
};
const sizes = {
  sm: 'text-xs px-4 py-2',
  md: 'text-sm px-6 py-2.5',
  lg: 'text-base px-8 py-3',
};

export default function Button({
  children, variant = 'primary', size = 'md',
  className = '', loading = false, disabled = false, ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-lg
        transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent
          rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
```

### Card (`client/src/components/common/Card.jsx`)
```jsx
export default function Card({ children, featured = false, className = '', onClick }) {
  const base = `bg-white rounded-xl border border-grey-200 transition-shadow duration-200
    ${onClick ? 'cursor-pointer hover:shadow-card-md' : 'shadow-card'}`;
  const accent = featured ? 'border-t-4 border-t-gold' : '';

  return (
    <div className={`${base} ${accent} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
```

### Badge (`client/src/components/common/Badge.jsx`)
```jsx
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
    <span className={`inline-flex items-center text-xs font-semibold
      px-2.5 py-0.5 rounded-full ${variants[variant]} ${className}`}>
      {label}
    </span>
  );
}
```

### Loader (`client/src/components/common/Loader.jsx`)
```jsx
export default function Loader({ fullPage = false }) {
  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grey-50">
        <div className="w-10 h-10 border-4 border-grey-200 border-t-navy
          rounded-full animate-spin" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-grey-200 border-t-navy
        rounded-full animate-spin" />
    </div>
  );
}
```

### Skeleton Card (`client/src/components/common/SkeletonCard.jsx`)
```jsx
export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-grey-200 p-6 animate-pulse">
      <div className="h-4 bg-grey-200 rounded mb-3 w-3/4" />
      <div className="h-3 bg-grey-100 rounded mb-2 w-full" />
      <div className="h-3 bg-grey-100 rounded mb-4 w-5/6" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-16 bg-grey-100 rounded-full" />
        <div className="h-5 w-20 bg-grey-100 rounded-full" />
      </div>
      <div className="h-9 bg-grey-200 rounded-lg w-1/3" />
    </div>
  );
}
```

### EmptyState (`client/src/components/common/EmptyState.jsx`)
```jsx
import { InboxIcon } from '@heroicons/react/24/outline';

export default function EmptyState({ title = 'No results found', description, action }) {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-grey-100 rounded-full flex items-center
        justify-center mx-auto mb-4">
        <InboxIcon className="w-8 h-8 text-grey-400" />
      </div>
      <h3 className="font-display text-lg font-semibold text-grey-900 mb-2">{title}</h3>
      {description && (
        <p className="text-grey-600 text-sm max-w-xs mx-auto mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
```

### Pagination (`client/src/components/common/Pagination.jsx`)
```jsx
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="p-2 rounded-lg border border-grey-200 hover:bg-grey-50
        disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronLeftIcon className="w-4 h-4 text-grey-600" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .reduce((acc, p, idx, arr) => {
          if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
          acc.push(p);
          return acc;
        }, [])
        .map((item, i) =>
          item === '...'
            ? <span key={`ellipsis-${i}`} className="px-2 text-grey-400">…</span>
            : (
              <button key={item} onClick={() => onChange(item)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  item === page
                    ? 'bg-navy text-white'
                    : 'border border-grey-200 text-grey-600 hover:bg-grey-50'
                }`}>
                {item}
              </button>
            )
        )
      }

      <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
        className="p-2 rounded-lg border border-grey-200 hover:bg-grey-50
        disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronRightIcon className="w-4 h-4 text-grey-600" />
      </button>
    </div>
  );
}
```

---

## PHASE 0 — FORM PRIMITIVES

### Input (`client/src/components/ui/Input.jsx`)
```jsx
export default function Input({ label, error, required, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-grey-900 mb-1">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <input
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
```

### Select (`client/src/components/ui/Select.jsx`)
```jsx
export default function Select({ label, error, required, children, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-grey-900 mb-1">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <select
        className={`w-full border rounded-lg px-4 py-2.5 text-sm text-grey-900
          bg-grey-50 focus:outline-none focus:ring-1
          ${error
            ? 'border-error focus:border-error focus:ring-error'
            : 'border-grey-200 focus:border-navy focus:ring-navy'
          } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}
```

### Textarea (`client/src/components/ui/Textarea.jsx`)
```jsx
export default function Textarea({ label, error, required, rows = 4, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-grey-900 mb-1">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full border rounded-lg px-4 py-2.5 text-sm text-grey-900
          bg-grey-50 placeholder-grey-400 resize-none focus:outline-none focus:ring-1
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
```

---

## PHASE 1 — PAGE-LEVEL COMPONENTS

### Hero Section
```jsx
<section className="bg-navy py-28 relative overflow-hidden">
  {/* Gold accent top line */}
  <div className="absolute inset-x-0 top-0 h-1 bg-gold" />

  <div className="max-w-content mx-auto px-6 text-center text-white relative z-10">
    <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-4">
      Research · Innovation · Publication · Education
    </p>
    <h1 className="font-display text-5xl font-bold leading-tight mb-6">
      ASGARD International Foundation<br />
      <span className="text-gold">for Research and Innovation</span>
    </h1>
    <p className="text-white/70 text-lg max-w-narrow mx-auto mb-10">
      Building institutional credibility through research, knowledge publication,
      education and global collaboration.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/research"
        className="bg-gold text-navy font-semibold px-8 py-3 rounded-lg
        hover:bg-gold-dark transition-colors">
        Explore Research
      </a>
      <a href="/opportunities"
        className="border-2 border-white/40 text-white font-semibold px-8 py-3
        rounded-lg hover:border-gold hover:text-gold transition-colors">
        View Opportunities
      </a>
    </div>
  </div>
</section>
```

### Trust Strip
```jsx
<div className="bg-navy-light py-3 border-y border-white/10">
  <div className="max-w-content mx-auto px-6 flex flex-wrap justify-center gap-8">
    {['Research', 'Journals', 'Conferences', 'Academy', 'AI & Technology', 'Innovation'].map(item => (
      <span key={item} className="text-white/70 text-xs font-medium tracking-widest uppercase">
        {item}
      </span>
    ))}
  </div>
</div>
```

### Section Wrapper
```jsx
{/* White background */}
<section className="py-20 bg-white">
  <div className="max-w-content mx-auto px-6">
    <div className="text-center mb-12">
      <h2 className="font-display text-3xl font-bold text-navy">Section Title</h2>
      <p className="text-grey-600 mt-3 max-w-narrow mx-auto text-base">
        Supporting description text.
      </p>
    </div>
    {/* grid / content here */}
  </div>
</section>

{/* Grey background — use on alternating sections */}
<section className="py-20 bg-grey-50">
  <div className="max-w-content mx-auto px-6">
    {/* content */}
  </div>
</section>
```

### Inner Page Header
```jsx
<div className="bg-navy py-14 relative overflow-hidden">
  <div className="absolute inset-x-0 top-0 h-1 bg-gold" />
  <div className="max-w-content mx-auto px-6">
    <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-2">
      {breadcrumb}  {/* e.g. "Opportunities / Internships" */}
    </p>
    <h1 className="font-display text-4xl font-bold text-white">{title}</h1>
    {description && (
      <p className="text-white/60 mt-3 text-lg max-w-narrow">{description}</p>
    )}
  </div>
</div>
```

### Admin Data Table
```jsx
<div className="bg-white rounded-xl border border-grey-200 overflow-hidden">
  <div className="px-6 py-4 border-b border-grey-200 flex items-center justify-between">
    <h2 className="font-display font-semibold text-navy text-lg">{title}</h2>
    {/* action button if needed */}
  </div>
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-grey-50 border-b border-grey-200">
          {columns.map(col => (
            <th key={col} className="px-6 py-3 text-left font-semibold text-grey-900 whitespace-nowrap">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-grey-200">
        {rows.map(row => (
          <tr key={row.id} className="hover:bg-grey-50 transition-colors">
            {/* cells */}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

---

## PHASE 1 — PLACEHOLDER COMPONENTS

### Dummy Payment (`client/src/components/common/DummyPayment.jsx`)
```jsx
import { CreditCardIcon } from '@heroicons/react/24/outline';
import Button from './Button';

export default function DummyPayment({ onConfirm, loading }) {
  return (
    <div className="bg-yellow-50 border border-warning rounded-xl p-8 text-center max-w-md mx-auto">
      <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CreditCardIcon className="w-7 h-7 text-warning" />
      </div>
      <h3 className="font-display font-semibold text-grey-900 text-lg mb-2">
        Payment Integration Coming Soon
      </h3>
      <p className="text-grey-600 text-sm mb-6">
        Online payment processing will be enabled in an upcoming update.
        Your registration has been recorded and our team will contact you
        with payment instructions.
      </p>
      <Button onClick={onConfirm} loading={loading}>
        Confirm Registration
      </Button>
    </div>
  );
}
```

### Dummy Certificate Verification (`client/src/pages/Verify/index.jsx`)
```jsx
import { DocumentCheckIcon } from '@heroicons/react/24/outline';

export default function VerifyPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-grey-50 px-4">
      <div className="bg-white rounded-2xl border border-grey-200 shadow-card p-10
        text-center max-w-md w-full">
        <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center
          justify-center mx-auto mb-5">
          <DocumentCheckIcon className="w-8 h-8 text-navy" />
        </div>
        <h1 className="font-display text-2xl font-bold text-navy mb-3">
          Certificate Verification
        </h1>
        <p className="text-grey-600 text-sm mb-6">
          Automated certificate verification is not yet active.
          This feature will be enabled in a future update.
          To verify manually, contact{' '}
          <a href="mailto:certificates@asgard-iri.org"
            className="text-info hover:underline">
            certificates@asgard-iri.org
          </a>.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter Certificate ID"
            className="flex-1 border border-grey-200 rounded-lg px-4 py-2.5
            text-sm bg-grey-50 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
          />
          <button disabled
            className="bg-navy text-white text-sm font-semibold px-5 py-2.5
            rounded-lg opacity-50 cursor-not-allowed">
            Verify
          </button>
        </div>
        <p className="text-grey-400 text-xs mt-3">
          Verification will be available in a future release.
        </p>
      </div>
    </div>
  );
}
```

---

## PHASE 2 — DASHBOARD COMPONENT

### Dashboard Tab Layout (`client/src/pages/Dashboard/index.jsx`)
```jsx
const tabs = [
  { id: 'profile',      label: 'Profile' },
  { id: 'applications', label: 'Applications' },
  { id: 'conferences',  label: 'Conferences' },  // Phase 2
  { id: 'academy',      label: 'Academy' },       // Phase 2
  { id: 'certificates', label: 'Certificates' },  // Phase 2
  { id: 'researcher',   label: 'Researcher Profile', roleOnly: 'researcher' },
];

// In JSX:
<div className="border-b border-grey-200 mb-8">
  <div className="flex gap-1 overflow-x-auto">
    {tabs
      .filter(t => !t.roleOnly || user?.role === t.roleOnly)
      .map(tab => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
          className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === tab.id
              ? 'border-gold text-navy font-semibold'
              : 'border-transparent text-grey-600 hover:text-navy hover:border-grey-200'
          }`}>
          {tab.label}
        </button>
      ))}
  </div>
</div>
```

---

## PHASE 4 — PUBLIC SCHOOL PLACEHOLDER

```jsx
// client/src/pages/PublicSchool/index.jsx
export default function PublicSchoolPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-grey-50 px-4">
      <div className="bg-white rounded-2xl border border-grey-200 shadow-card
        p-10 text-center max-w-lg w-full">
        <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center
          justify-center mx-auto mb-5">
          <AcademicCapIcon className="w-8 h-8 text-navy" />
        </div>
        <h1 className="font-display text-2xl font-bold text-navy mb-3">
          ASGARD Public School
        </h1>
        <p className="text-grey-600 text-sm leading-relaxed">
          ASGARD Public School is a planned initiative. Details including admissions,
          curriculum, faculty and facilities will be published once officially confirmed.
          Please check back for updates.
        </p>
        <a href="/contact" className="mt-6 inline-block text-info text-sm hover:underline">
          Contact us for more information →
        </a>
      </div>
    </div>
  );
}
```

---

## PHASE 5 — i18n SETUP

### Installation & Config
```bash
npm install i18next react-i18next
```

### `client/src/i18n.js`
```js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import ta from './locales/ta/translation.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ta: { translation: ta },
  },
  lng: localStorage.getItem('lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
```

### Language Switcher (add to Navbar)
```jsx
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();
const toggle = () => {
  const next = i18n.language === 'en' ? 'ta' : 'en';
  i18n.changeLanguage(next);
  localStorage.setItem('lang', next);
};

// In navbar JSX:
<button onClick={toggle}
  className="text-xs font-medium text-white/70 hover:text-gold transition-colors border
  border-white/20 rounded px-2 py-1">
  {i18n.language === 'en' ? 'தமிழ்' : 'EN'}
</button>
```

---

## RESPONSIVE GRID PATTERNS

Apply these grid classes consistently across all listing pages:

```jsx
// Opportunity / Publication / Conference cards (standard 3-col)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

// Journal cards (wider, 4-col on xl)
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

// Team / researcher profiles (4-col)
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">

// Two-column text + image layout
<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

// Admin stats row (4 metric cards)
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

// Academy programme cards (2-col)
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
```

---

## ICON SYSTEM

```bash
npm install @heroicons/react
```

Import from the outline set for UI icons:
```jsx
import { MagnifyingGlassIcon, BriefcaseIcon, AcademicCapIcon,
  DocumentCheckIcon, CreditCardIcon, UserCircleIcon,
  NewspaperIcon, LightBulbIcon, BeakerIcon } from '@heroicons/react/24/outline';
```

Icon size conventions:

| Context | Class |
|---|---|
| Inline with text | `w-4 h-4` |
| Button / input icon | `w-5 h-5` |
| Card icon | `w-6 h-6` |
| Section feature icon | `w-8 h-8` or `w-10 h-10` |
| Hero / large decorative | `w-12 h-12` or `w-16 h-16` |

---

## TOAST NOTIFICATIONS

```bash
npm install react-hot-toast
```

Setup in `client/src/App.jsx`:
```jsx
import { Toaster } from 'react-hot-toast';

// Inside App return, outside router:
<Toaster position="top-right" toastOptions={{
  duration: 4000,
  style: { fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', borderRadius: '0.5rem' },
  success: { iconTheme: { primary: '#16A34A', secondary: '#fff' } },
  error:   { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
}} />
```

Usage in any component:
```js
import toast from 'react-hot-toast';

toast.success('Application submitted successfully!');
toast.error('Something went wrong. Please try again.');
toast.loading('Submitting...');
```

---

## ACCESSIBILITY CHECKLIST (Apply All Phases)

- [ ] Colour contrast: navy `#0B1F4B` on white `#FFFFFF` — ratio 14.5:1 ✅ (exceeds AA 4.5:1)
- [ ] Gold `#C9A84C` on navy `#0B1F4B` — ratio 4.6:1 ✅ (passes AA)
- [ ] All interactive elements keyboard-navigable; focus ring visible (gold outline)
- [ ] Every `<input>`, `<select>`, `<textarea>` has an associated `<label>`
- [ ] Error messages announced to screen readers via `aria-live="polite"`
- [ ] Skip-to-content link at top of every page: `<a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>`
- [ ] `<html lang="en">` set in `index.html`
- [ ] All images have meaningful `alt` attributes; decorative images use `alt=""`
- [ ] `aria-label` on icon-only buttons (hamburger, close, search)
- [ ] Modal closes on Escape key; focus trapped while open
