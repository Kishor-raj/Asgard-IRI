import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import { forgotPassword as forgotPasswordApi } from '../../services/auth.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email is required.');
      return;
    }

    try {
      setLoading(true);
      await forgotPasswordApi(email);
      setSubmitted(true);
      toast.success('Password reset email dispatched.');
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Recover access to your institutional account"
      brandEyebrow="Account Recovery"
      brandHeadline={
        <>
          Restore your access to <em className="italic text-[#d8b878] font-semibold">ASGARD-IRI</em>.
        </>
      }
      brandDescription="Enter your registered institutional email address. We will verify your credentials and dispatch secure instructions to reset your password."
      cardMaxWidth="max-w-[420px]"
    >
      <Helmet>
        <title>Forgot Password – ASGARD-IRI</title>
        <meta name="description" content="Recover your ASGARD-IRI institutional account password." />
      </Helmet>

      {submitted ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#c9a35d]/15 border border-[#c9a35d]/30 flex items-center justify-center mx-auto text-[#d8b878]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-serif text-xl font-semibold text-[#f5efe1]">
            Instructions Dispatched
          </h3>
          <p className="text-sm text-[#f5efe1]/70 leading-relaxed">
            If an account exists for <strong className="text-[#f5efe1]">{email}</strong>, a secure password reset link has been dispatched to your inbox.
          </p>
          <div className="pt-4">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-7 py-3 rounded-lg bg-gradient-to-r from-[#c9a35d] to-[#d8b878] text-[#060d22] font-semibold text-xs tracking-[0.16em] uppercase hover:shadow-[0_10px_25px_-8px_rgba(201,163,93,0.6)] transition-all hover:-translate-y-0.5"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
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

          <button
            type="submit"
            disabled={loading}
            className="relative w-full h-[54px] rounded-[10px] bg-gradient-to-r from-[#c9a35d] to-[#d8b878] text-[#060d22] font-semibold text-sm tracking-[0.16em] uppercase overflow-hidden cursor-pointer shadow-[0_10px_30px_-10px_rgba(201,163,93,0.5)] transition-all duration-300 hover:shadow-[0_18px_40px_-12px_rgba(201,163,93,0.65)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading && (
                <span className="inline-block w-4 h-4 border-2 border-[#060d22] border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? 'Dispatching…' : 'Send Reset Link'}
            </span>
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          </button>

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs text-[#d8b878] hover:underline font-medium">
              Return to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
