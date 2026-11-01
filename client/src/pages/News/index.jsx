import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  CalendarDaysIcon,
  TagIcon,
  ArrowRightIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getNews } from '../../services/content.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import SkeletonCard from '../../components/common/SkeletonCard';
import Pagination from '../../components/common/Pagination';
import PageHeader from '../../components/common/PageHeader';

const typeTabs = [
  { id: 'all', label: 'All Dispatches' },
  { id: 'news', label: 'News' },
  { id: 'announcement', label: 'Announcements' },
  { id: 'press_release', label: 'Press Releases' },
  { id: 'research_highlight', label: 'Research Highlights' },
];

export default function NewsPage() {
  const [selectedType, setSelectedType] = useState('all');
  const [page, setPage] = useState(1);
  const [activeArticle, setActiveArticle] = useState(null);

  const { data, loading, error } = useFetch(
    () => getNews({ type: selectedType === 'all' ? '' : selectedType, page, limit: 9 }),
    [selectedType, page]
  );

  const newsList = data?.data || [];
  const pagination = data?.pagination || { totalPages: 1 };

  return (
    <div>
      <Helmet>
        <title>News & Press Room – ASGARD-IRI</title>
        <meta
          name="description"
          content="Latest institutional announcements, scientific discoveries, press releases, and research highlights from ASGARD-IRI."
        />
      </Helmet>

      {/* Header */}
      <PageHeader
        overline="Press Room & Communications"
        title="News & Research Dispatches"
        subtitle="Stay informed with official foundation communiqués, grant announcements, strategic partnerships, and breakthroughs from affiliated laboratories."
      />

      <div className="max-w-[1240px] mx-auto px-5 sm:px-7 py-12">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-grey-200 pb-4 mb-8 overflow-x-auto">
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

        {/* News Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : newsList.length === 0 ? (
          <div className="text-center py-16 text-grey-400 text-sm">
            No news articles found under the selected category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsList.map((item) => (
              <Card key={item.id} className="p-6 flex flex-col justify-between hover:border-gold transition-colors">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <Badge
                      label={item.type?.replace('_', ' ').toUpperCase() || 'NEWS'}
                      variant={item.is_featured ? 'gold' : 'default'}
                    />
                    <span className="text-xs text-grey-400">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    </span>
                  </div>

                  {item.cover_image_url && (
                    <div className="w-full h-40 rounded-lg overflow-hidden mb-4 bg-grey-100">
                      <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <h3 className="font-display font-semibold text-lg text-navy mb-2 line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-grey-600 line-clamp-3 mb-6 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                <div className="pt-4 border-t border-grey-100 flex items-center justify-between">
                  <span className="text-[11px] text-grey-400">ASGARD Press Office</span>
                  <button
                    onClick={() => setActiveArticle(item)}
                    className="text-xs font-semibold text-navy hover:text-gold transition-colors inline-flex items-center gap-1"
                  >
                    Read Story <ArrowRightIcon className="w-3 h-3" />
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

      {/* Article Detail Modal */}
      {activeArticle && (
        <Modal
          isOpen={!!activeArticle}
          onClose={() => setActiveArticle(null)}
          title={activeArticle.title}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-grey-100 text-grey-500">
              <Badge label={activeArticle.type?.toUpperCase()} variant="open" />
              <span>
                Published: {activeArticle.created_at ? new Date(activeArticle.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
              </span>
            </div>

            {activeArticle.cover_image_url && (
              <div className="w-full h-56 rounded-lg overflow-hidden">
                <img
                  src={activeArticle.cover_image_url}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="text-sm text-grey-800 leading-relaxed whitespace-pre-line space-y-3">
              {activeArticle.content}
            </div>

            <div className="pt-4 border-t border-grey-100 flex justify-end">
              <Button variant="outline" onClick={() => setActiveArticle(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
