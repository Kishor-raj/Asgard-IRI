import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error(
        error === 'oauth_not_configured'
          ? 'Google OAuth is not configured.'
          : 'Authentication through Google failed.'
      );
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }

    if (token) {
      handleOAuthCallback(token)
        .then((userData) => {
          toast.success('Signed in with Google successfully!');
          const redirectPath = ['super_admin', 'foundation_admin'].includes(userData?.role)
            ? '/admin'
            : '/dashboard';
          navigate(redirectPath, { replace: true });
        })
        .catch((err) => {
          console.error('Failed to complete OAuth callback:', err);
          toast.error('Authentication succeeded, but failed to load user profile. Please log in.');
          navigate('/login?error=oauth_profile_failed', { replace: true });
        });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, handleOAuthCallback]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-grey-50 px-4">
      <Helmet>
        <title>Authenticating – ASGARD-IRI</title>
      </Helmet>
      <Loader />
      <p className="mt-4 text-sm text-grey-600 font-medium">
        Completing sign in with Google...
      </p>
    </div>
  );
}
