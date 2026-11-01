import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Cog6ToothIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import {
  getSiteTagline,
  updateSiteTagline,
  setPublicSchoolActive,
} from '../../services/admin.service';
import { getPublicSchoolActive } from '../../services/content.service';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/ui/Input';
import Loader from '../../components/common/Loader';

export default function AdminSettingsPage() {
  const { data: taglineData, loading: loadingTagline, refetch: refetchTagline } = useFetch(getSiteTagline);

  const [tagline, setTagline] = useState('');
  const [savingTagline, setSavingTagline] = useState(false);

  const [schoolActive, setSchoolActive] = useState(false);
  const [loadingSchool, setLoadingSchool] = useState(true);
  const [togglingSchool, setTogglingSchool] = useState(false);

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (taglineData?.data) {
      setTagline(taglineData.data.setting_value || taglineData.data.tagline || '');
    }
  }, [taglineData]);

  useEffect(() => {
    getPublicSchoolActive()
      .then((res) => {
        if (res && typeof res.active === 'boolean') {
          setSchoolActive(res.active);
        }
      })
      .catch((err) => {
        console.error('Failed to load public school active state:', err);
      })
      .finally(() => {
        setLoadingSchool(false);
      });
  }, []);

  const handleSaveTagline = async (e) => {
    e.preventDefault();
    setSavingTagline(true);
    setFeedback(null);
    try {
      await updateSiteTagline(tagline);
      setFeedback({ type: 'success', message: 'Site tagline updated successfully.' });
      refetchTagline();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to update site tagline.',
      });
    } finally {
      setSavingTagline(false);
    }
  };

  const handleToggleSchool = async () => {
    setTogglingSchool(true);
    setFeedback(null);
    const nextState = !schoolActive;
    try {
      const res = await setPublicSchoolActive(nextState);
      if (res && res.success) {
        setSchoolActive(nextState);
        setFeedback({
          type: 'success',
          message: nextState
            ? 'Public School navigation item is now visible in the main header.'
            : 'Public School navigation item is now hidden from the public header.',
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to update Public School visibility.',
      });
    } finally {
      setTogglingSchool(false);
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Site Settings – ASGARD-IRI Admin</title>
      </Helmet>

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Global Platform Settings</h1>
        <p className="text-xs text-grey-500 mt-1">
          Configure site-wide branding, metadata, and controlled institutional module visibility
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs flex justify-between items-center ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-bold ml-4">
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 max-w-3xl">
        {/* Branding Card */}
        <Card className="p-6">
          <h2 className="font-display font-semibold text-base text-navy mb-4 border-b border-grey-100 pb-3">
            Foundation Branding
          </h2>

          {loadingTagline ? (
            <div className="py-8">
              <Loader />
            </div>
          ) : (
            <form onSubmit={handleSaveTagline} className="space-y-4 text-xs">
              <Input
                label="Official Site Tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. International Foundation for Research and Innovation"
                required
              />
              <p className="text-[11px] text-grey-400">
                This tagline is displayed across the public hero banner, footer credits, and SEO metadata.
              </p>

              <div className="pt-4 border-t border-grey-100 flex justify-end">
                <Button type="submit" variant="primary" loading={savingTagline}>
                  Save Tagline
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Public School Visibility Switch (Phase 4) */}
        <Card className="p-6">
          <div className="flex items-center justify-between border-b border-grey-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <AcademicCapIcon className="w-5 h-5 text-gold-dark" />
              <h2 className="font-display font-semibold text-base text-navy">
                Public School Module Visibility
              </h2>
            </div>
            <Badge
              label={schoolActive ? 'VISIBLE IN NAV' : 'HIDDEN FROM NAV'}
              variant={schoolActive ? 'open' : 'closed'}
            />
          </div>

          {loadingSchool ? (
            <div className="py-6">
              <Loader />
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <p className="text-grey-600 leading-relaxed">
                By default, the <strong>ASGARD Public School</strong> route (<code className="bg-grey-100 px-1 py-0.5 rounded text-[11px]">/public-school</code>) is a strictly controlled informational placeholder without any unverified accreditation or admission claims.
              </p>
              <p className="text-grey-500 text-[11px] leading-relaxed">
                Toggle this switch to control whether the "Public School" link appears in the main public navbar. When turned OFF, direct URL access to the placeholder remains available, but it is completely excluded from public menus.
              </p>

              <div className="p-4 bg-grey-50 rounded-xl border border-grey-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="font-semibold text-navy block text-sm">
                    {schoolActive ? 'Public School is Visible' : 'Public School is Hidden'}
                  </span>
                  <span className="text-[11px] text-grey-500">
                    {schoolActive
                      ? 'The navigation item is active on both desktop and mobile headers.'
                      : 'The navigation item is completely hidden from public visitors.'}
                  </span>
                </div>

                <Button
                  variant={schoolActive ? 'outline' : 'primary'}
                  size="sm"
                  onClick={handleToggleSchool}
                  loading={togglingSchool}
                  className="flex items-center gap-1.5"
                >
                  {schoolActive ? (
                    <>
                      <EyeSlashIcon className="w-4 h-4" /> Hide from Navbar
                    </>
                  ) : (
                    <>
                      <EyeIcon className="w-4 h-4" /> Show in Navbar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
