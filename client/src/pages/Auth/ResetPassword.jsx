import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import { resetPassword as resetPasswordApi } from '../../services/auth.service';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Reset token is missing from the URL.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      await resetPasswordApi(token, password);
      toast.success('Password updated successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Establish a new credential for your account"
      brandEyebrow="Credential Update"
      brandHeadline={
        <>
          Secure your institutional identity on <em className="italic text-[#d8b878] font-semibold">ASGARD-IRI</em>.
        </>
      }
      brandDescription="Ensure your new password contains at least 8 characters, combining uppercase and lowercase letters, numbers, and symbols."
      cardMaxWidth="max-w-[420px]"
    >
      <Helmet>
        <title>Reset Password – ASGARD-IRI</title>
      </Helmet>

      {!token ? (
        <div className="text-center py-6 text-sm text-[#fca5a5] bg-[#dc2626]/10 border border-[#dc2626]/30 p-4 rounded-lg">
          No valid reset token found in this link.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-[11px] font-medium tracking-[0.18em] uppercase text-[#d8b878] mb-2"
            >
              New Password <span className="text-[#c9a35d]/60">*</span>
            </label>
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#f5efe1]/40 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full h-[54px] pl-12 pr-12 bg-[#0a1733]/55 border border-[#c9a35d]/25 rounded-[10px] text-[#f5efe1] text-[15px] placeholder-[#f5efe1]/30 outline-none transition-all duration-200 focus:border-[#c9a35d] focus:bg-[#243763]/45 focus:ring-4 focus:ring-[#c9a35d]/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#f5efe1]/40 hover:text-[#d8b878] transition-colors p-1"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-[11px] font-medium tracking-[0.18em] uppercase text-[#d8b878] mb-2"
            >
              Confirm New Password <span className="text-[#c9a35d]/60">*</span>
            </label>
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#f5efe1]/40 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                <path d="M9 15l2 2 4-4" />
              </svg>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-[54px] pl-12 pr-4 bg-[#0a1733]/55 border border-[#c9a35d]/25 rounded-[10px] text-[#f5efe1] text-[15px] placeholder-[#f5efe1]/30 outline-none transition-all duration-200 focus:border-[#c9a35d] focus:bg-[#243763]/45 focus:ring-4 focus:ring-[#c9a35d]/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative w-full h-[54px] rounded-[10px] bg-gradient-to-r from-[#c9a35d] to-[#d8b878] text-[#060d22] font-semibold text-sm tracking-[0.16em] uppercase overflow-hidden cursor-pointer shadow-[0_10px_30px_-10px_rgba(201,163,93,0.5)] transition-all duration-300 hover:shadow-[0_18px_40px_-12px_rgba(201,163,93,0.65)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading && (
                <span className="inline-block w-4 h-4 border-2 border-[#060d22] border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? 'Updating…' : 'Update Password'}
            </span>
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          </button>

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs text-[#d8b878] hover:underline font-medium">
              Cancel and Return to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
