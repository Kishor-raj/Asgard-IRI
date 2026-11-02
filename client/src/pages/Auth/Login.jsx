import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../services/auth.service';
import { getErrorMessage, API_BASE_URL } from '../../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const oauthError = searchParams.get('error');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginApi({ email, password });
      toast.success('Signed in successfully!');
      login(res.data.user, res.data.token);
      if (['super_admin', 'foundation_admin'].includes(res.data.user.role)) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Invalid credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Access your ASGARD-IRI institutional account"
      brandEyebrow="Institutional Access"
      brandHeadline={
        <>
          Where frontier science meets <em className="italic text-[#d8b878] font-semibold">global scholarship</em>.
        </>
      }
      brandDescription="Sign in to your ASGARD-IRI account to access peer-reviewed journals, research labs, academic summits, and the AI laboratory — uniting 500+ scholars across 45+ countries."
      cardMaxWidth="max-w-[420px]"
    >
      <Helmet>
        <title>Sign In – ASGARD-IRI</title>
        <meta name="description" content="Sign in to your ASGARD-IRI institutional account." />
      </Helmet>

      {oauthError && (
        <div className="bg-[#dc2626]/10 border border-[#dc2626]/30 text-[#fca5a5] text-xs p-3.5 rounded-lg mb-5 text-center leading-relaxed">
          {oauthError === 'oauth_not_configured'
            ? 'Google OAuth is not configured in this environment.'
            : 'Authentication through social provider failed. Please try again or use your password.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Address */}
        <div>
          <label
            htmlFor="email"
            className="block text-[11px] font-medium tracking-[0.18em] uppercase text-[#d8b878] mb-2"
          >
            Email Address <span className="text-[#c9a35d]/60">*</span>
          </label>
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#f5efe1]/40 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              required
              className="w-full h-[54px] pl-12 pr-4 bg-[#0a1733]/55 border border-[#c9a35d]/25 rounded-[10px] text-[#f5efe1] text-[15px] placeholder-[#f5efe1]/30 outline-none transition-all duration-200 focus:border-[#c9a35d] focus:bg-[#243763]/45 focus:ring-4 focus:ring-[#c9a35d]/10"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-[11px] font-medium tracking-[0.18em] uppercase text-[#d8b878] mb-2"
          >
            Password <span className="text-[#c9a35d]/60">*</span>
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
              autoComplete="current-password"
              required
              className="w-full h-[54px] pl-12 pr-12 bg-[#0a1733]/55 border border-[#c9a35d]/25 rounded-[10px] text-[#f5efe1] text-[15px] placeholder-[#f5efe1]/30 outline-none transition-all duration-200 focus:border-[#c9a35d] focus:bg-[#243763]/45 focus:ring-4 focus:ring-[#c9a35d]/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
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

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between text-[13px] pt-1">
          <label className="flex items-center gap-2 text-[#f5efe1]/60 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="sr-only peer"
            />
            <span className="w-4 h-4 rounded border border-[#c9a35d]/30 flex items-center justify-center transition-colors peer-checked:bg-[#c9a35d] peer-checked:border-[#c9a35d]">
              {rememberMe && (
                <span className="w-1.5 h-2.5 border-r-2 border-b-2 border-[#060d22] rotate-45 -translate-y-0.5" />
              )}
            </span>
            Keep me signed in
          </label>
          <Link
            to="/forgot-password"
            className="text-[#d8b878] hover:text-[#e7cf99] font-medium transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="relative w-full h-[54px] rounded-[10px] bg-gradient-to-r from-[#c9a35d] to-[#d8b878] text-[#060d22] font-semibold text-sm tracking-[0.16em] uppercase overflow-hidden cursor-pointer shadow-[0_10px_30px_-10px_rgba(201,163,93,0.5)] transition-all duration-300 hover:shadow-[0_18px_40px_-12px_rgba(201,163,93,0.65)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading && (
              <span className="inline-block w-4 h-4 border-2 border-[#060d22] border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? 'Signing In…' : 'Sign In'}
          </span>
          {/* Subtle sheen reflection on hover */}
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3.5 my-7 text-xs uppercase tracking-[0.12em] text-[#f5efe1]/40">
        <span className="flex-1 h-[1px] bg-[#c9a35d]/25" />
        <span>or continue with</span>
        <span className="flex-1 h-[1px] bg-[#c9a35d]/25" />
      </div>

      {/* Google OAuth Button */}
      <a
        href={`${API_BASE_URL}/auth/google`}
        className="w-full h-[54px] rounded-[10px] border border-[#c9a35d]/25 bg-[#f5efe1]/[0.04] hover:bg-[#f5efe1]/[0.08] hover:border-[#c9a35d] text-[#f5efe1] text-sm font-medium flex items-center justify-center gap-3 transition-all duration-200"
      >
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14-5.5l-6.5-5.5C29.5 34.6 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-7.9l-6.6 5.1C9.6 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.5l6.5 5.5c-.5.4 7-5 7-15 0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        <span>Continue with Google</span>
      </a>

      {/* Switch to Register */}
      <p className="text-center text-sm text-[#f5efe1]/60 mt-7">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-[#d8b878] font-medium hover:underline ml-1">
          Register now
        </Link>
      </p>
    </AuthLayout>
  );
}
