import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/common/Button';
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
    <AuthLayout title="Forgot Password" subtitle="Recover your ASGARD-IRI account password">
      <Helmet>
        <title>Forgot Password – ASGARD-IRI</title>
      </Helmet>

      {submitted ? (
        <div className="text-center py-4 space-y-4">
          <p className="text-sm text-grey-600">
            If an account exists for <strong>{email}</strong>, a password reset link has been sent to your inbox.
          </p>
          <Link
            to="/login"
            className="inline-block bg-navy text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-navy-dark transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Account Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />
          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            Send Reset Link
          </Button>
          <div className="text-center pt-2">
            <Link to="/login" className="text-xs text-navy hover:underline">
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
