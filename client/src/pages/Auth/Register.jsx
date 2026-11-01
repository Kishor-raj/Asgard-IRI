import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/common/Button';
import { register as registerApi } from '../../services/auth.service';
import { getErrorMessage, API_BASE_URL } from '../../services/api';

const publicRoles = [
  { value: 'researcher',            label: 'Researcher (Institutional/Independent)' },
  { value: 'author',                label: 'Author / Contributor' },
  { value: 'reviewer',              label: 'Peer Reviewer' },
  { value: 'participant_applicant', label: 'Participant / Opportunity Applicant' },
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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('participant_applicant');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      <AuthLayout title="Registration Submitted">
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-success">
            <CheckCircleIcon className="w-10 h-10" />
          </div>
          <h2 className="font-display text-xl font-bold text-navy">
            Awaiting Admin Approval
          </h2>
          <p className="text-sm text-grey-600 leading-relaxed">
            Thank you for registering with ASGARD-IRI. Your account request as <strong>{role.replace('_', ' ')}</strong> has been sent to our foundation administrators for review.
          </p>
          <p className="text-xs text-grey-400">
            You will receive an email once your account has been reviewed.
          </p>
          <div className="pt-4">
            <Link
              to="/login"
              className="inline-block bg-navy text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-navy-dark transition-colors"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create Account" subtitle="Join the ASGARD International Foundation network">
      <Helmet>
        <title>Register – ASGARD-IRI</title>
        <meta name="description" content="Register an institutional account with ASGARD-IRI." />
      </Helmet>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Dr. Jane Doe"
          required
        />
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@university.edu"
          required
        />
        <Select
          label="Select Your Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          {publicRoles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
        <Input
          label="Password (min. 8 characters)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <Button type="submit" variant="primary" className="w-full" loading={loading}>
          Submit Registration
        </Button>
      </form>

      {/* OAuth Options */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-grey-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-grey-400 font-medium">or register with</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <a
          href={`${API_BASE_URL}/auth/google`}
          className="flex items-center justify-center gap-2 border border-grey-200 rounded-lg px-4 py-2.5 text-sm font-medium text-grey-900 hover:bg-grey-50 transition-colors"
        >
          Google
        </a>
      </div>

      <p className="text-center text-xs text-grey-600 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-navy font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
