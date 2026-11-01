import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  ArrowTopRightOnSquareIcon,
  DocumentArrowDownIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getPublications } from '../../services/content.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SkeletonCard from '../../components/common/SkeletonCard';
import Pagination from '../../components/common/Pagination';
import PageHeader from '../../components/common/PageHeader';
import { thumb } from '../../utils/cloudinaryTransform';

const typeTabs = [
  { id: 'all', label: 'All Publications' },
  { id: 'book', label: 'Books' },
  { id: 'ebook', label: 'eBooks' },
  { id: 'proceedings', label: 'Proceedings' },
  { id: 'report', label: 'Technical Reports' },
  { id: 'monograph', label: 'Monographs' },
];

export default function PublicationsPage() {
  const [selectedType, setSelectedType] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedPub, setSelectedPub] = useState(null);

  const { data, loading, error } = useFetch(
    () => getPublications({ type: selectedType === 'all' ? '' : selectedType, search, page, limit: 9 }),
    [selectedType, search, page]
  );

  const publications = data?.data || [];
  const pagination = data?.pagination || { totalPages: 1 };

  return (
    <div>
      <Helmet>
        <title>Publications & Monographs – ASGARD-IRI</title>
        <meta
          name="description"
          content="Browse academic books, conference proceedings, monographs, and research reports published by ASGARD-IRI."
        />
      </Helmet>

      {/* Header */}
      <PageHeader
        overline="Academic Press & Scholarly Works"
        title="Publications & Monographs"
        subtitle="Comprehensive scholarly catalogue comprising peer-reviewed edited volumes, conference proceedings, doctoral monographs, and technical whitepapers."
      />

      <div className="max-w-[1240px] mx-auto px-5 sm:px-7 py-12">
        {/* Controls: Tabs & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-grey-200">
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
            {typeTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedType(t.id);
                  setPage(1);
                }}
                className={`px-4 py-2 text-xs rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedType === t.id
                    ? 'bg-navy text-white font-semibold'
                    : 'bg-grey-100 text-grey-700 hover:bg-grey-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <MagnifyingGlassIcon className="w-4 h-4 text-grey-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search title, author, ISBN..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-4 py-2 text-xs border border-grey-200 rounded-lg bg-grey-50 focus:outline-none focus:border-navy w-full"
            />
          </div>
        </div>

        {/* Publications Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : publications.length === 0 ? (
          <div className="text-center py-16 text-grey-400 text-sm">
            No publications found matching your selected criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publications.map((pub) => (
              <Card key={pub.id} className="p-6 flex flex-col justify-between hover:border-gold transition-colors">
                <div>
                  {pub.cover_url && (
                    <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-navy/5 flex items-center justify-center">
                      <img
                        src={thumb(pub.cover_url, 300)}
                        alt={pub.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <Badge
                      label={pub.type?.replace('_', ' ').toUpperCase() || 'BOOK'}
                      variant="default"
                    />
                    <span className="text-xs text-grey-400 font-medium">
                      {pub.publication_year || pub.year || '2025'}
                    </span>
                  </div>

                  <h3 className="font-display font-semibold text-navy text-lg mb-2 line-clamp-2">
                    {pub.title}
                  </h3>

                  {pub.authors && (
                    <p className="text-xs text-gold-dark font-medium mb-3 line-clamp-1">
                      By {pub.authors}
                    </p>
                  )}

                  <p className="text-xs text-grey-600 line-clamp-3 mb-4 leading-relaxed">
                    {pub.abstract || pub.description || 'Scholarly publication published under the ASGARD International Foundation Academic Press imprint.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-grey-100 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-grey-400">
                    {pub.isbn ? `ISBN: ${pub.isbn}` : pub.doi ? `DOI: ${pub.doi}` : 'ASGARD Press'}
                  </div>
                  <button
                    onClick={() => setSelectedPub(pub)}
                    className="text-xs font-semibold text-navy hover:text-gold transition-colors inline-flex items-center gap-1"
                  >
                    View Details →
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-10">
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Publication Detail Modal */}
      {selectedPub && (
        <Modal
          isOpen={!!selectedPub}
          onClose={() => setSelectedPub(null)}
          title={selectedPub.title}
        >
          <div className="space-y-4 text-xs">
            {selectedPub.cover_url && (
              <div className="w-full h-48 -mt-2 mb-3 rounded-lg overflow-hidden bg-navy/5 flex items-center justify-center">
                <img
                  src={thumb(selectedPub.cover_url, 300)}
                  alt={selectedPub.title}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="flex flex-wrap gap-2 items-center pb-2 border-b border-grey-100">
              <Badge label={selectedPub.type?.toUpperCase()} variant="default" />
              <span className="text-grey-500 font-semibold">Year: {selectedPub.publication_year || selectedPub.year || '2025'}</span>
              {selectedPub.isbn && <span className="font-mono text-grey-500">ISBN: {selectedPub.isbn}</span>}
              {selectedPub.doi && <span className="font-mono text-grey-500">DOI: {selectedPub.doi}</span>}
            </div>

            {selectedPub.authors && (
              <div>
                <span className="font-bold text-navy block mb-0.5">Authors / Editors:</span>
                <p className="text-grey-700">{selectedPub.authors}</p>
              </div>
            )}

            <div>
              <span className="font-bold text-navy block mb-1">Abstract & Description:</span>
              <p className="text-grey-700 leading-relaxed text-sm whitespace-pre-line">
                {selectedPub.abstract || selectedPub.description || 'Full bibliographic entry and description available in library catalogue.'}
              </p>
            </div>

            <div className="pt-4 border-t border-grey-100 flex justify-end gap-3">
              {selectedPub.doi && (
                <a
                  href={`https://doi.org/${selectedPub.doi}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 bg-navy text-white px-4 py-2 rounded-lg font-semibold hover:bg-gold hover:text-navy transition-colors text-xs"
                >
                  Access via DOI <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
