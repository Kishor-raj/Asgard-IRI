import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getOpportunityBySlug } from '../../services/opportunity.service';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';

export default function OpportunityDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { data, loading, error } = useFetch(() => getOpportunityBySlug(slug), [slug]);

  const opp = data?.data;

  if (loading) return <Loader fullPage />;
  if (error || !opp) {
    return (
      <div className="max-w-content mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold font-display text-navy mb-2">Opportunity Not Found</h2>
        <p className="text-grey-600 mb-6">The requested position or program could not be located.</p>
        <Link to="/opportunities" className="text-navy font-semibold hover:underline">
          ← Back to All Opportunities
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>{opp.title} – ASGARD-IRI</title>
        <meta name="description" content={opp.description?.slice(0, 150)} />
      </Helmet>

      {/* Header */}
      <div className="bg-navy py-14 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gold" />
        <div className="max-w-content mx-auto px-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-gold text-xs font-semibold tracking-widest uppercase">
              {opp.category?.replace('_', ' ')}
            </span>
            <span className="text-white/40">•</span>
            <Badge label={opp.status.toUpperCase()} variant={opp.status === 'open' ? 'open' : 'closed'} />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white max-w-3xl">
            {opp.title}
          </h1>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-content mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="font-display font-semibold text-xl text-navy mb-3">About this Opportunity</h2>
            <p className="text-grey-900 leading-relaxed whitespace-pre-line">{opp.description}</p>
          </div>

          {opp.eligibility && (
            <div>
              <h2 className="font-display font-semibold text-xl text-navy mb-3">Eligibility</h2>
              <p className="text-grey-900 leading-relaxed whitespace-pre-line">{opp.eligibility}</p>
            </div>
          )}

          {opp.responsibilities && (
            <div>
              <h2 className="font-display font-semibold text-xl text-navy mb-3">Key Responsibilities</h2>
              <p className="text-grey-900 leading-relaxed whitespace-pre-line">{opp.responsibilities}</p>
            </div>
          )}

          {opp.required_skills && (
            <div>
              <h2 className="font-display font-semibold text-xl text-navy mb-3">Required Skills & Expertise</h2>
              <p className="text-grey-900 leading-relaxed whitespace-pre-line">{opp.required_skills}</p>
            </div>
          )}
        </div>

        {/* Sidebar Summary Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-grey-200 p-6 shadow-card space-y-5">
            <h3 className="font-display font-semibold text-lg text-navy border-b border-grey-100 pb-3">
              Position Overview
            </h3>

            <div className="space-y-4 text-sm">
              {opp.department && (
                <div className="flex items-start gap-3">
                  <BriefcaseIcon className="w-5 h-5 text-navy shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-grey-400">Department</p>
                    <p className="font-medium text-grey-900">{opp.department}</p>
                  </div>
                </div>
              )}

              {opp.location && (
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-navy shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-grey-400">Location</p>
                    <p className="font-medium text-grey-900">{opp.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <ClockIcon className="w-5 h-5 text-navy shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-grey-400">Work Mode</p>
                  <p className="font-medium text-grey-900 capitalize">{opp.mode}</p>
                </div>
              </div>

              {opp.duration && (
                <div className="flex items-start gap-3">
                  <CalendarDaysIcon className="w-5 h-5 text-navy shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-grey-400">Duration</p>
                    <p className="font-medium text-grey-900">{opp.duration}</p>
                  </div>
                </div>
              )}

              {opp.stipend_info && (
                <div className="flex items-start gap-3">
                  <CurrencyRupeeIcon className="w-5 h-5 text-navy shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-grey-400">Compensation / Stipend</p>
                    <p className="font-medium text-grey-900">{opp.stipend_info}</p>
                  </div>
                </div>
              )}

              {opp.deadline && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-warning/20">
                  <p className="text-xs font-semibold text-warning">Application Deadline</p>
                  <p className="text-sm font-bold text-grey-900">
                    {new Date(opp.deadline).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>

            {opp.status === 'open' ? (
              user ? (
                <Link
                  to={`/opportunities/${opp.id}/apply`}
                  className="block text-center bg-gold text-navy font-semibold px-6 py-3 rounded-lg hover:bg-gold-dark transition-colors"
                >
                  Apply for this Position
                </Link>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block text-center bg-navy text-white font-semibold px-6 py-3 rounded-lg hover:bg-navy-dark transition-colors text-sm"
                  >
                    Sign In to Apply
                  </Link>
                  <p className="text-center text-xs text-grey-400">
                    Registration is free and required to submit applications.
                  </p>
                </div>
              )
            ) : (
              <div className="text-center p-3 bg-grey-100 rounded-lg text-sm text-grey-600 font-medium">
                This position is closed
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
