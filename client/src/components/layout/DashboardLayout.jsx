import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully.');
      navigate('/login');
    } catch {
      toast.error('Failed to logout.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-grey-50">
      {/* Clean User Portal Header (Replaces cluttered public navbar) */}
      <header className="bg-navy text-white shadow-nav sticky top-0 z-40">
        <div className="max-w-content mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo & Portal Title */}
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2.5" title="ASGARD Portal Home">
              <img src="/logo.png" alt="ASGARD-IRI" className="h-10 w-10 object-contain rounded-full" />
              <span className="font-['Cormorant_Garamond',Georgia,serif] font-bold text-lg tracking-wider text-white hidden sm:inline">ASGARD</span>
            </Link>
            <div className="h-5 w-px bg-white/20 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-gold uppercase">
                {user?.role === 'participant_applicant' ? 'Applicant Portal' : 'Member Portal'}
              </span>
            </div>
          </div>

          {/* Quick Actions & User Navigation */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* User Info Badge */}
            <div className="hidden lg:flex items-center gap-2 border-l border-white/10 pl-4 text-xs">
              <UserCircleIcon className="w-5 h-5 text-gold" />
              <div>
                <p className="font-semibold text-white leading-none truncate max-w-[150px]">
                  {user?.fullName || user?.email}
                </p>
                <p className="text-[10px] text-white/50 capitalize mt-0.5">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-xs"
              title="Sign out of your account"
            >
              <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main portal content */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-grey-200 py-6 text-center text-xs text-grey-500">
        <div className="max-w-content mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} ASGARD-IRI International Foundation. All rights reserved.</p>
          <div className="flex gap-4 text-xs">
            <Link to="/policies/privacy" className="hover:text-navy hover:underline">Privacy Policy</Link>
            <Link to="/policies/terms" className="hover:text-navy hover:underline">Terms of Service</Link>
            <Link to="/contact" className="hover:text-navy hover:underline">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
