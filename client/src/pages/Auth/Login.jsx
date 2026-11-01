import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../services/auth.service';
import { getErrorMessage, API_BASE_URL } from '../../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      login(res.data.user);
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
    <AuthLayout title="Sign In" subtitle="Access your ASGARD-IRI institutional account">
      <Helmet>
        <title>Login – ASGARD-IRI</title>
        <meta name="description" content="Sign in to ASGARD-IRI to manage your research, applications, and registrations." />
      </Helmet>

      {oauthError && (
        <div className="bg-red-50 text-error text-xs p-3 rounded-lg mb-4 text-center">
          {oauthError === 'oauth_not_configured'
            ? 'OAuth is not configured in this environment.'
            : 'Authentication through social provider failed.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
        />
        <div>
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <div className="flex justify-end mt-1">
            <Link to="/forgot-password" className="text-xs text-navy hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" variant="primary" className="w-full" loading={loading}>
          Sign In
        </Button>
      </form>

      {/* OAuth Options */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-grey-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-grey-400 font-medium">or continue with</span>
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
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-navy font-semibold hover:underline">
          Register now
        </Link>
      </p>
    </AuthLayout>
  );
}
