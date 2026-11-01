import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CalendarDaysIcon, MapPinIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getConferences } from '../../services/content.service';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { cover } from '../../utils/cloudinaryTransform';

export default function ConferenceDetailPage() {
  const { id, slug } = useParams();
  const { data, loading } = useFetch(getConferences);
  const conferences = data?.data || [];
  const conf = conferences.find(c => String(c.id) === String(id) || c.slug === slug || c.slug === id);

  if (loading) return <Loader fullPage />;
  if (!conf) {
    return (
      <div className="max-w-content mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold font-display text-navy mb-2">Conference Not Found</h2>
        <p className="text-grey-600 mb-6">The requested symposium or conference could not be located.</p>
        <Link to="/conferences" className="text-navy font-semibold hover:underline inline-flex items-center gap-1">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Conferences
        </Link>
      </div>
    );
  }

  const coverImageUrl = conf.cover_image_url || conf.cover_url;

  return (
    <div className="min-h-screen bg-grey-50 pb-20">
      <Helmet>
        <title>{conf.title} | ASGARD-IRI Conferences</title>
        <meta name="description" content={conf.description || conf.theme || conf.title} />
      </Helmet>

      {/* Hero / Cover Image */}
      {coverImageUrl && (
        <div className="w-full h-80 md:h-96 relative overflow-hidden bg-navy">
          <img
            src={cover(coverImageUrl, 1200, 500)}
            alt={conf.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />
        </div>
      )}

      <div className="max-w-content mx-auto px-6 pt-8">
        <Link to="/conferences" className="inline-flex items-center gap-1 text-sm font-semibold text-navy hover:underline mb-6">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Conferences
        </Link>

        <div className="bg-white rounded-xl shadow-card p-8 border border-grey-100">
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <Badge label={conf.status?.toUpperCase() || 'UPCOMING'} variant="open" />
            <span className="text-xs bg-navy/10 text-navy font-semibold px-2.5 py-1 rounded capitalize">
              Mode: {conf.mode || 'Hybrid'}
            </span>
          </div>

          <h1 className="text-3xl font-display font-bold text-navy mb-3">{conf.title}</h1>
          {conf.theme && (
            <p className="text-sm text-gold-dark font-medium mb-6">Theme: {conf.theme}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-grey-50 p-4 rounded-lg mb-6 text-sm">
            <div className="flex items-center gap-2 text-grey-700">
              <CalendarDaysIcon className="w-5 h-5 text-navy shrink-0" />
              <span>
                {conf.start_date ? new Date(conf.start_date).toLocaleDateString() : 'TBA'}
                {conf.end_date ? ` – ${new Date(conf.end_date).toLocaleDateString()}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 text-grey-700">
              <MapPinIcon className="w-5 h-5 text-navy shrink-0" />
              <span>{conf.venue || 'Hybrid'}</span>
            </div>
          </div>

          <div className="prose max-w-none text-grey-700 leading-relaxed text-sm">
            <h3 className="text-lg font-bold text-navy mb-2">About this Conference</h3>
            <p className="whitespace-pre-line">{conf.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
