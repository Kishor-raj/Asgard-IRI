import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import { register as registerApi } from '../../services/auth.service';
import { getErrorMessage, API_BASE_URL } from '../../services/api';

const publicRoles = [
  { value: 'participant_applicant', label: 'Participant / Opportunity Applicant' },
  { value: 'researcher',            label: 'Researcher (Faculty / Independent)' },
  { value: 'author',                label: 'Author / Contributor' },
  { value: 'reviewer',              label: 'Peer Reviewer' },
  { value: 'trainer_mentor',        label: 'Trainer / Mentor' },
  { value: 'content_editor',        label: 'Content Editor' },
  { value: 'journal_editor',        label: 'Journal Editor' },
  { value: 'conference_admin',      label: 'Conference Admin' },
  { value: 'academy_admin',         label: 'Academy Admin' },
  { value: 'publication_editor',    label: 'Publication Editor' },
  { value: 'technology_lab_admin',  label: 'Technology Lab Admin' },
  { value: 'innovation_admin',      label: 'Innovation Admin' },
  { value: 'careers_hr_admin',      label: 'Careers / HR Admin' },
];

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('participant_applicant');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Compute password strength (0-4)
  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const strengthColor = useMemo(() => {
    switch (passwordStrength) {
      case 1: return 'bg-[#ef4444]'; // Weak
      case 2: return 'bg-[#f59e0b]'; // Fair
      case 3: return 'bg-[#c9a35d]'; // Good
      case 4: return 'bg-[#10b981]'; // Strong
      default: return 'bg-transparent';
    }
  }, [passwordStrength]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await registerApi({ fullName, email, password, role });
      setIsSubmitted(true);
      toast.success('Registration submitted!');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Registration failed. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Registration Submitted"
        subtitle="Awaiting administrative approval"
        brandEyebrow="Institutional Membership"
        cardMaxWidth="max-w-[460px]"
      >
        <Helmet>
          <title>Registration Submitted – ASGARD-IRI</title>
        </Helmet>
        <div className="text-center py-6 space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center mx-auto text-[#10b981]">
            <CheckCircleIcon className="w-10 h-10" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-[#f5efe1]">
            Application Received
          </h2>
          <p className="text-sm text-[#f5efe1]/70 leading-relaxed max-w-sm mx-auto">
            Thank you for registering with ASGARD-IRI. Your application for institutional access has been queued for review by the foundation council.
          </p>
          <p className="text-xs text-[#f5efe1]/45">
            You will receive a notification at <strong>{email}</strong> once your account is verified.
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
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join the ASGARD International Foundation network"
      brandEyebrow="Become a Member"
      brandHeadline={
        <>
          Join a network advancing <em className="italic text-[#d8b878] font-semibold">frontier science</em>.
        </>
      }
      brandDescription="Create your ASGARD-IRI institutional account to access peer-reviewed journals, global summits, the ASGARD Academy, and collaboration opportunities across 45+ countries."
      brandPills={[
        { label: 'Researcher', accent: true },
        { label: 'Reviewer' },
        { label: 'Author' },
        { label: 'Participant' },
        { label: 'Institution' },
      ]}
      cardMaxWidth="max-w-[460px]"
    >
      <Helmet>
        <title>Create Account – ASGARD-IRI</title>
        <meta name="description" content="Register an institutional account with ASGARD-IRI." />
      </Helmet>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullname"
            className="block text-[11px] font-medium tracking-[0.18em] uppercase text-[#d8b878] mb-1.5"
          >
            Full Name <span className="text-[#c9a35d]/60">*</span>
          </label>
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#f5efe1]/40 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
            </svg>
            <input
              id="fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Dr. Jane Doe"
              autoComplete="name"
              required
              className="w-full h-[50px] pl-12 pr-4 bg-[#0a1733]/55 border border-[#c9a35d]/25 rounded-[10px] text-[#f5efe1] text-[14px] placeholder-[#f5efe1]/30 outline-none transition-all duration-200 focus:border-[#c9a35d] focus:bg-[#243763]/45 focus:ring-4 focus:ring-[#c9a35d]/10"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label
            htmlFor="email"
            className="block text-[11px] font-medium tracking-[0.18em] uppercase text-[#d8b878] mb-1.5"
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
              placeholder="name@university.edu"
              autoComplete="email"
              required
              className="w-full h-[50px] pl-12 pr-4 bg-[#0a1733]/55 border border-[#c9a35d]/25 rounded-[10px] text-[#f5efe1] text-[14px] placeholder-[#f5efe1]/30 outline-none transition-all duration-200 focus:border-[#c9a35d] focus:bg-[#243763]/45 focus:ring-4 focus:ring-[#c9a35d]/10"
            />
          </div>
        </div>

        {/* Role Select */}
        <div>
          <label
            htmlFor="role"
            className="block text-[11px] font-medium tracking-[0.18em] uppercase text-[#d8b878] mb-1.5"
          >
            Select Your Role <span className="text-[#c9a35d]/60">*</span>
          </label>
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#f5efe1]/40 pointer-events-none z-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 2 L20 7 V13 L12 18 L4 13 V7 Z" />
              <path d="M4 7 L12 12 L20 7" />
              <path d="M12 12 V18" />
            </svg>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full h-[50px] pl-12 pr-10 bg-[#0a1733]/55 border border-[#c9a35d]/25 rounded-[10px] text-[#f5efe1] text-[14px] outline-none transition-all duration-200 focus:border-[#c9a35d] focus:bg-[#243763]/45 focus:ring-4 focus:ring-[#c9a35d]/10 appearance-none cursor-pointer"
            >
              {publicRoles.map((r) => (
                <option key={r.value} value={r.value} className="bg-[#0a1733] text-[#f5efe1]">
                  {r.label}
                </option>
              ))}
            </select>
            {/* Custom dropdown chevron */}
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d8b878] pointer-events-none"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-[11px] font-medium tracking-[0.18em] uppercase text-[#d8b878] mb-1.5"
          >
            Password <span className="text-[#c9a35d]/60">*</span>
            <span className="font-normal text-[#f5efe1]/40 normal-case tracking-normal ml-2">
              (min. 8 characters)
            </span>
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
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full h-[50px] pl-12 pr-12 bg-[#0a1733]/55 border border-[#c9a35d]/25 rounded-[10px] text-[#f5efe1] text-[14px] placeholder-[#f5efe1]/30 outline-none transition-all duration-200 focus:border-[#c9a35d] focus:bg-[#243763]/45 focus:ring-4 focus:ring-[#c9a35d]/10"
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

          {/* Password Strength Meter */}
          {password && (
            <div className="mt-2.5">
              <div className="grid grid-cols-4 gap-1.5 h-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength >= step ? strengthColor : 'bg-[#f5efe1]/10'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#f5efe1]/45 mt-1.5">
                <span>Use 8+ chars with uppercase, number & symbol</span>
                <span className="font-medium text-[#d8b878]">
                  {passwordStrength === 1 && 'Weak'}
                  {passwordStrength === 2 && 'Fair'}
                  {passwordStrength === 3 && 'Good'}
                  {passwordStrength === 4 && 'Strong'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-[11px] font-medium tracking-[0.18em] uppercase text-[#d8b878] mb-1.5"
          >
            Confirm Password <span className="text-[#c9a35d]/60">*</span>
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
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              className="w-full h-[50px] pl-12 pr-12 bg-[#0a1733]/55 border border-[#c9a35d]/25 rounded-[10px] text-[#f5efe1] text-[14px] placeholder-[#f5efe1]/30 outline-none transition-all duration-200 focus:border-[#c9a35d] focus:bg-[#243763]/45 focus:ring-4 focus:ring-[#c9a35d]/10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#f5efe1]/40 hover:text-[#d8b878] transition-colors p-1"
            >
              {showConfirmPassword ? (
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
          {confirmPassword && password !== confirmPassword && (
            <p className="text-[11px] text-[#ef4444] mt-1.5">Passwords do not match.</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="relative w-full h-[54px] rounded-[10px] bg-gradient-to-r from-[#c9a35d] to-[#d8b878] text-[#060d22] font-semibold text-sm tracking-[0.16em] uppercase overflow-hidden cursor-pointer shadow-[0_10px_30px_-10px_rgba(201,163,93,0.5)] transition-all duration-300 hover:shadow-[0_18px_40px_-12px_rgba(201,163,93,0.65)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading && (
                <span className="inline-block w-4 h-4 border-2 border-[#060d22] border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? 'Submitting Application…' : 'Create Account'}
            </span>
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3.5 my-6 text-xs uppercase tracking-[0.12em] text-[#f5efe1]/40">
        <span className="flex-1 h-[1px] bg-[#c9a35d]/25" />
        <span>or register with</span>
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

      {/* Switch to Login */}
      <p className="text-center text-sm text-[#f5efe1]/60 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-[#d8b878] font-medium hover:underline ml-1">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
