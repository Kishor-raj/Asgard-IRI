import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Squares2X2Icon,
  UsersIcon,
  BriefcaseIcon,
  NewspaperIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const adminNav = [
  { label: 'Dashboard',     href: '/admin',              icon: <Squares2X2Icon className="w-5 h-5" /> },
  { label: 'Users',         href: '/admin/users',         icon: <UsersIcon className="w-5 h-5" /> },
  { label: 'Research',      href: '/admin/research',      icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
  { label: 'Journals',      href: '/admin/journals',      icon: <NewspaperIcon className="w-5 h-5" /> },
  { label: 'Publications',  href: '/admin/publications',  icon: <NewspaperIcon className="w-5 h-5" /> },
  { label: 'Conferences',   href: '/admin/conferences',   icon: <AcademicCapIcon className="w-5 h-5" /> },
  { label: 'Academy',       href: '/admin/academy',       icon: <AcademicCapIcon className="w-5 h-5" /> },
  { label: 'Opportunities', href: '/admin/opportunities', icon: <BriefcaseIcon className="w-5 h-5" /> },
  { label: 'Applications',  href: '/admin/applications',  icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
  { label: 'Certificates',  href: '/admin/certificates',  icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
  { label: 'News & Events', href: '/admin/news',          icon: <NewspaperIcon className="w-5 h-5" /> },
  { label: 'Innovation Hub', href: '/admin/innovation',   icon: <BriefcaseIcon className="w-5 h-5" /> },
  { label: 'Consultancy',    href: '/admin/consultancy',  icon: <BriefcaseIcon className="w-5 h-5" /> },
  { label: 'Analytics',      href: '/admin/analytics',    icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
  { label: 'Payments',       href: '/admin/payments',     icon: <BriefcaseIcon className="w-5 h-5" /> },
  { label: 'Partners',       href: '/admin/partners',     icon: <UsersIcon className="w-5 h-5" /> },
  { label: 'Settings',      href: '/admin/settings',      icon: <Cog6ToothIcon className="w-5 h-5" /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully.');
      navigate('/login');
    } catch (err) {
      toast.error('Failed to logout.');
    }
  };

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-white/10">
        <Link to="/admin" className="flex items-center gap-3 group" title="ASGARD Admin Console">
          <img src="/logo.png" alt="ASGARD Admin" className="h-10 w-10 object-contain rounded-full opacity-95 group-hover:opacity-100 transition-opacity" />
          <span className="font-['Cormorant_Garamond',Georgia,serif] font-bold text-xl tracking-wider text-white">ASGARD</span>
        </Link>
        <p className="text-white/40 text-xs mt-2">Admin Console</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {adminNav.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/admin'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
              transition-colors ${
                isActive
                  ? 'bg-gold text-navy font-semibold'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Card at Sidebar Bottom */}
      <div className="p-4 border-t border-white/10 bg-navy-dark/40">
        <div className="text-xs text-white/90 font-medium truncate mb-0.5">
          {user?.fullName || user?.email}
        </div>
        <div className="text-[10px] text-gold uppercase tracking-wider mb-3">
          {user?.role?.replace('_', ' ')}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold text-red-200 bg-red-950/40 hover:bg-red-900/60 hover:text-white border border-red-800/40 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-grey-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile, slides in on demand */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy flex flex-col shrink-0 transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white"
          aria-label="Close sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="bg-white border-b border-grey-200 px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center text-grey-600 hover:text-navy border border-grey-200 rounded-lg"
              aria-label="Open sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <h1 className="font-display font-semibold text-navy text-base sm:text-lg">Admin Panel</h1>
          </div>

          {/* Right side of Admin Panel Text/Topbar */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="text-grey-400">User:</span>
              <span className="font-semibold text-navy truncate max-w-[120px]">{user?.fullName || user?.email}</span>
              <span className="bg-gold/20 text-navy font-semibold text-[10px] px-2 py-0.5 rounded-full uppercase">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
              title="Sign out of Admin Panel"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span className="hidden xs:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
