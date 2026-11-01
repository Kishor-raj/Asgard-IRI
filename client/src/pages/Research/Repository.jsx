import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
  ArrowDownTrayIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getResearchOutputs, getAreas } from '../../services/research.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import SkeletonCard from '../../components/common/SkeletonCard';

const outputTypes = [
  { value: 'all', label: 'All Output Types' },
  { value: 'journal_article', label: 'Journal Articles' },
  { value: 'conference_paper', label: 'Conference Papers' },
  { value: 'monograph', label: 'Monographs & Books' },
  { value: 'technical_report', label: 'Technical Reports' },
  { value: 'dataset', label: 'Datasets & Benchmarks' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2014 }, (_, i) => currentYear - i);

export default function ResearchRepositoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: areasData } = useFetch(getAreas);
  const areas = areasData?.data || [];

  const { data, loading } = useFetch(
    () =>
      getResearchOutputs({
        q: searchTerm,
        type: selectedType === 'all' ? '' : selectedType,
        year: selectedYear,
        area: selectedArea,
        author: authorFilter,
        page,
        limit: 9,
      }),
    [searchTerm, selectedType, selectedYear, selectedArea, authorFilter, page]
  );

  const outputs = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 9, totalPages: 1 };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(queryInput);
    setPage(1);
  };

  const handleResetFilters = () => {
    setQueryInput('');
    setSearchTerm('');
    setSelectedType('all');
    setSelectedYear('');
    setSelectedArea('');
    setAuthorFilter('');
    setPage(1);
  };

  return (
    <div className="bg-grey-50 min-h-screen py-10">
      <Helmet>
        <title>Research Repository & Scholarly Outputs – ASGARD-IRI</title>
        <meta
          name="description"
          content="Explore peer-reviewed publications, conference proceedings, preprints, technical reports, and open scientific datasets indexed by ASGARD-IRI."
        />
      </Helmet>

      {/* Header */}
      <div className="max-w-content mx-auto px-6 mb-8">
        <div className="bg-navy rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden shadow-card">
          <div className="absolute inset-x-0 top-0 h-1 bg-gold" />
          <div className="relative z-10 max-w-2xl">
            <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-2">
              Open Science & Scholarly Ledger
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              Research Outputs Repository
            </h1>
            <p className="text-white/70 text-sm leading-relaxed">
              Explore indexed monographs, peer-reviewed journal articles, international symposium proceedings, and computational datasets published by ASGARD researchers and partner institutes.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-content mx-auto px-6 space-y-6">
        {/* Search & Faceted Filter Bar */}
        <Card className="p-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-4 h-4 text-grey-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Search outputs by title, abstract keyword, or topic..."
                className="w-full pl-10 pr-4 py-2 text-xs border border-grey-200 rounded-lg focus:outline-none focus:border-navy"
              />
            </div>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-grey-100">
            <div>
              <label className="block text-grey-500 font-medium mb-1">Output Type</label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className="w-full border border-grey-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-navy"
              >
                {outputTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-grey-500 font-medium mb-1">Publication Year</label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setPage(1);
                }}
                className="w-full border border-grey-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-navy"
              >
                <option value="">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-grey-500 font-medium mb-1">Research Focus Area</label>
              <select
                value={selectedArea}
                onChange={(e) => {
                  setSelectedArea(e.target.value);
                  setPage(1);
                }}
                className="w-full border border-grey-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-navy"
              >
                <option value="">All Areas</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-grey-500 font-medium mb-1">Author Name</label>
              <input
                type="text"
                value={authorFilter}
                onChange={(e) => {
                  setAuthorFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter by author..."
                className="w-full border border-grey-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-navy"
              />
            </div>
          </div>

          {(searchTerm || selectedType !== 'all' || selectedYear || selectedArea || authorFilter) && (
            <div className="flex justify-between items-center pt-2 text-xs">
              <span className="text-grey-500">
                Filtered Results: <strong>{pagination.total}</strong> outputs found
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-navy hover:underline font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </Card>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : outputs.length === 0 ? (
          <Card className="p-16 text-center text-xs text-grey-400">
            No research outputs matched your search criteria. Try broadening your keywords or filters.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outputs.map((out) => (
              <Card
                key={out.id}
                className="p-6 flex flex-col justify-between hover:border-gold transition-colors"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <Badge
                      label={out.type?.replace('_', ' ').toUpperCase()}
                      variant="gold"
                    />
                    {out.year && (
                      <span className="text-[11px] font-semibold text-grey-500 bg-grey-100 px-2 py-0.5 rounded">
                        {out.year}
                      </span>
                    )}
                  </div>

                  <Link to={`/research/outputs/${out.slug || out.id}`}>
                    <h3 className="font-display font-semibold text-navy text-base hover:text-gold transition-colors line-clamp-2 mb-2">
                      {out.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1.5 text-xs text-grey-600 mb-3">
                    <UserIcon className="w-3.5 h-3.5 text-navy shrink-0" />
                    <span className="line-clamp-1">{out.authors_text || 'ASGARD Research Consortium'}</span>
                  </div>

                  <p className="text-xs text-grey-600 line-clamp-3 leading-relaxed mb-4">
                    {out.abstract || 'Peer-reviewed research output cataloged in the ASGARD Institute of Research & Innovation Open Repository.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-grey-100 flex items-center justify-between text-xs">
                  <Link
                    to={`/research/outputs/${out.slug || out.id}`}
                    className="text-navy hover:text-gold font-semibold"
                  >
                    View Details →
                  </Link>
                  {out.url && (
                    <a
                      href={out.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-gold-dark hover:text-navy font-semibold text-[11px]"
                    >
                      DOI / PDF <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center pt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
