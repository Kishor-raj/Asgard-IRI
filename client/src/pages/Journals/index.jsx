import { Helmet } from 'react-helmet-async';
import { ArrowTopRightOnSquareIcon, BookOpenIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getJournals } from '../../services/content.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SkeletonCard from '../../components/common/SkeletonCard';
import PageHeader from '../../components/common/PageHeader';

export default function JournalsPage() {
  const { data, loading, error } = useFetch(getJournals);
  const journals = data?.data || [];

  return (
    <div>
      <Helmet>
        <title>Scholarly Journals – ASGARD-IRI</title>
        <meta
          name="description"
          content="Explore peer-reviewed open access academic journals affiliated with ASGARD International Foundation."
        />
      </Helmet>

      {/* Header */}
      <PageHeader
        overline="Open Access Scholarly Dissemination"
        title="Affiliated International Journals"
        subtitle="High-integrity, peer-reviewed journals published with strict adherence to COPE ethical guidelines and indexed in prominent global academic databases."
      />

      <div className="max-w-[1240px] mx-auto px-5 sm:px-7 py-14 space-y-12">
        {/* Notice on External Portal */}
        <div className="bg-gold/10 border border-gold/30 rounded-xl p-5 flex items-start gap-3.5">
          <BookOpenIcon className="w-5 h-5 text-navy shrink-0 mt-0.5" />
          <div className="text-xs text-navy/90 leading-relaxed">
            <span className="font-semibold block mb-0.5">External Journal Management Portals</span>
            Each journal maintains an independent editorial board, submission portal, and archival repository hosted on dedicated peer-review infrastructures. Click &quot;Visit Journal Portal&quot; on any card below to read published articles or submit manuscripts.
          </div>
        </div>

        {/* Journals Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : journals.length === 0 ? (
          <div className="text-center py-16 text-grey-400 text-sm">
            Journal titles are currently being catalogued. Please check back shortly.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journals.map((journal) => (
              <Card key={journal.id} className="p-6 flex flex-col justify-between hover:border-gold transition-colors">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <Badge label={journal.is_active ? 'INDEXED & ACTIVE' : 'ARCHIVED'} variant={journal.is_active ? 'open' : 'closed'} />
                    {journal.issn && (
                      <span className="text-[11px] font-mono text-grey-500 bg-grey-100 px-2 py-0.5 rounded">
                        ISSN: {journal.issn}
                      </span>
                    )}
                  </div>

                  {journal.logo_url && (
                    <div className="w-12 h-12 rounded-lg bg-navy/5 p-2 mb-4">
                      <img src={journal.logo_url} alt={journal.name} className="w-full h-full object-contain" />
                    </div>
                  )}

                  <h3 className="font-display font-semibold text-lg text-navy mb-2">
                    {journal.name}
                  </h3>
                  <p className="text-xs text-grey-600 line-clamp-3 leading-relaxed mb-6">
                    {journal.description || 'International multidisciplinary publication adhering to open-access scholarly principles and double-blind peer review.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-grey-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-grey-400">Open Access • CC-BY</span>
                  <a
                    href={journal.external_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-navy text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gold hover:text-navy transition-colors w-full sm:w-auto justify-center"
                  >
                    Visit Journal Portal <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
