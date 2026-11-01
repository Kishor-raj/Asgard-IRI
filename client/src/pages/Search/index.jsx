import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  MagnifyingGlassIcon,
  AcademicCapIcon,
  BookOpenIcon,
  BriefcaseIcon,
  NewspaperIcon,
  UserIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { searchContent } from '../../services/content.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const searchCategories = [
  { id: 'all', label: 'All Results' },
  { id: 'outputs', label: 'Research Outputs' },
  { id: 'publications', label: 'Publications' },
  { id: 'news', label: 'News & Media' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'researchers', label: 'Researchers' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'all';
  const initialYearFrom = searchParams.get('yearFrom') || '';
  const initialYearTo = searchParams.get('yearTo') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState(initialType);
  const [yearFrom, setYearFrom] = useState(initialYearFrom);
  const [yearTo, setYearTo] = useState(initialYearTo);

  const [searchData, setSearchData] = useState({
    outputs: [],
    publications: [],
    news: [],
    opportunities: [],
    researchers: [],
    counts: { outputs: 0, publications: 0, news: 0, opportunities: 0, researchers: 0, total: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async (searchTerm, typeVal, yFrom, yTo) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSearchData({
        outputs: [],
        publications: [],
        news: [],
        opportunities: [],
        researchers: [],
        counts: { outputs: 0, publications: 0, news: 0, opportunities: 0, researchers: 0, total: 0 },
      });
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const params = {
        q: searchTerm.trim(),
        type: typeVal || 'all',
      };
      if (yFrom) params.yearFrom = yFrom;
      if (yTo) params.yearTo = yTo;

      const res = await searchContent(params);
      if (res.data) {
        setSearchData(res.data);
      }
    } catch (err) {
      console.error('FTS Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, initialType, initialYearFrom, initialYearTo);
    }
  }, [initialQuery, initialType, initialYearFrom, initialYearTo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newParams = { q: query, type: activeTab };
    if (yearFrom) newParams.yearFrom = yearFrom;
    if (yearTo) newParams.yearTo = yearTo;
    setSearchParams(newParams);
    performSearch(query, activeTab, yearFrom, yearTo);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const newParams = { q: query, type: tabId };
    if (yearFrom) newParams.yearFrom = yearFrom;
    if (yearTo) newParams.yearTo = yearTo;
    setSearchParams(newParams);
    performSearch(query, tabId, yearFrom, yearTo);
  };

  const handleClearFilters = () => {
    setYearFrom('');
    setYearTo('');
    const newParams = { q: query, type: activeTab };
    setSearchParams(newParams);
    performSearch(query, activeTab, '', '');
  };

  const counts = searchData.counts || {};

  return (
    <div>
      <Helmet>
        <title>Full-Text Knowledge Search – ASGARD-IRI</title>
        <meta
          name="description"
          content="Full-text indexed search across research outputs, monographs, journal articles, funded opportunities, and scholars at ASGARD-IRI."
        />
      </Helmet>

      {/* Header */}
      <div className="bg-navy py-14 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gold" />
        <div className="max-w-content mx-auto px-6 text-center text-white relative z-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
            Global Knowledge Discovery
          </h1>
          <p className="text-white/70 text-sm max-w-narrow mx-auto mb-6">
            Accelerate your inquiry with indexed PostgreSQL full-text search across all ASGARD scholarly outputs, news, vacancies, and researchers.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 text-grey-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search keywords, titles, authors, disciplines, or DOI..."
                className="w-full pl-11 pr-4 py-3 rounded-lg text-sm bg-white text-navy focus:outline-none focus:ring-2 focus:ring-gold shadow-sm"
              />
            </div>
            <Button type="submit" variant="primary" className="px-6 py-3 shrink-0">
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="max-w-content mx-auto px-6 py-10">
        {/* Faceted Controls & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-grey-200 pb-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {searchCategories.map((cat) => {
              const count = cat.id === 'all' ? counts.total : counts[cat.id];
              return (
                <button
                  key={cat.id}
                  onClick={() => handleTabChange(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === cat.id
                      ? 'bg-navy text-white font-semibold'
                      : 'bg-grey-100 text-grey-600 hover:bg-grey-200'
                  }`}
                >
                  {cat.label}
                  {hasSearched && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        activeTab === cat.id ? 'bg-white/20 text-white' : 'bg-grey-200 text-grey-700'
                      }`}
                    >
                      {count || 0}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Year Range Facets */}
          <div className="flex items-center gap-2 text-xs">
            <FunnelIcon className="w-4 h-4 text-grey-400 shrink-0" />
            <span className="text-grey-500 font-medium">Year:</span>
            <input
              type="number"
              placeholder="From"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              className="w-16 px-2 py-1 text-xs border border-grey-200 rounded focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <span className="text-grey-400">–</span>
            <input
              type="number"
              placeholder="To"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              className="w-16 px-2 py-1 text-xs border border-grey-200 rounded focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <Button variant="outline" size="sm" onClick={handleSubmit} className="text-xs py-1 px-2.5">
              Apply
            </Button>
            {(yearFrom || yearTo) && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-grey-400 hover:text-navy underline ml-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results Container */}
        {loading ? (
          <div className="py-20">
            <Loader />
          </div>
        ) : !hasSearched ? (
          <div className="text-center py-16 text-grey-500">
            <DocumentTextIcon className="w-12 h-12 text-grey-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-navy">Enter a search keyword to query repository</p>
            <p className="text-xs text-grey-400 mt-1">
              Try terms like "Quantum", "Bioengineering", "Neural", "Fellowship", or author names.
            </p>
          </div>
        ) : counts.total === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-grey-200">
            <p className="text-base font-semibold text-navy">No matches found for "{query}"</p>
            <p className="text-xs text-grey-500 mt-1">
              Try adjusting your spelling or removing year restrictions.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Research Outputs Section */}
            {(activeTab === 'all' || activeTab === 'outputs') && searchData.outputs?.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-grey-200 pb-2">
                  <DocumentTextIcon className="w-5 h-5 text-gold-dark" />
                  <h2 className="font-display font-bold text-navy text-base">
                    Research Outputs ({searchData.outputs.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {searchData.outputs.map((item) => (
                    <Card key={item.id} className="p-4 hover:border-navy transition-colors">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="text-[11px] font-semibold uppercase text-gold-dark">
                          {item.type?.replace('_', ' ')} • {item.year || '2025'}
                        </span>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-navy font-medium hover:underline flex items-center gap-1"
                          >
                            Access Output <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <h3 className="font-display font-semibold text-navy text-sm hover:underline">
                        <Link to={`/research/outputs/${item.slug || item.id}`}>{item.title}</Link>
                      </h3>
                      {item.authors_text && (
                        <p className="text-xs text-grey-500 mt-1">Authors: {item.authors_text}</p>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Publications Section */}
            {(activeTab === 'all' || activeTab === 'publications') && searchData.publications?.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-grey-200 pb-2">
                  <BookOpenIcon className="w-5 h-5 text-gold-dark" />
                  <h2 className="font-display font-bold text-navy text-base">
                    Publications ({searchData.publications.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {searchData.publications.map((item) => (
                    <Card key={item.id} className="p-4 hover:border-navy transition-colors">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="text-[11px] font-semibold uppercase text-gold-dark">
                          {item.type?.replace('_', ' ')} • {item.year || '2025'}
                        </span>
                        {item.doi_url && (
                          <a
                            href={item.doi_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-navy font-mono hover:underline flex items-center gap-1"
                          >
                            DOI Link <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <h3 className="font-display font-semibold text-navy text-sm hover:underline">
                        <Link to="/publications">{item.title}</Link>
                      </h3>
                      {item.authors_text && (
                        <p className="text-xs text-grey-500 mt-1">Authors: {item.authors_text}</p>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Opportunities Section */}
            {(activeTab === 'all' || activeTab === 'opportunities') && searchData.opportunities?.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-grey-200 pb-2">
                  <BriefcaseIcon className="w-5 h-5 text-gold-dark" />
                  <h2 className="font-display font-bold text-navy text-base">
                    Opportunities & Positions ({searchData.opportunities.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchData.opportunities.map((item) => (
                    <Card key={item.id} className="p-4 hover:border-navy transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <Badge label={item.category?.toUpperCase() || 'OPPORTUNITY'} variant="open" />
                        <span className="text-[11px] text-grey-400 capitalize">{item.mode || 'Remote'}</span>
                      </div>
                      <h3 className="font-display font-semibold text-navy text-sm hover:underline">
                        <Link to={`/opportunities/${item.slug || item.id}`}>{item.title}</Link>
                      </h3>
                      <p className="text-xs text-grey-500 mt-1">Dept: {item.department || 'ASGARD Research'}</p>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Researchers Section */}
            {(activeTab === 'all' || activeTab === 'researchers') && searchData.researchers?.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-grey-200 pb-2">
                  <UserIcon className="w-5 h-5 text-gold-dark" />
                  <h2 className="font-display font-bold text-navy text-base">
                    Affiliated Scholars ({searchData.researchers.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchData.researchers.map((item) => (
                    <Card key={item.id} className="p-4 hover:border-navy transition-colors">
                      <h3 className="font-display font-semibold text-navy text-sm hover:underline">
                        <Link to={`/researchers/${item.id}`}>{item.full_name}</Link>
                      </h3>
                      <p className="text-xs text-gold-dark font-medium mt-0.5">
                        {item.designation || 'Research Fellow'}
                      </p>
                      <p className="text-xs text-grey-500 mt-1">
                        {item.affiliation || 'ASGARD International Research Institute'}
                      </p>
                      {item.research_interests && (
                        <p className="text-[11px] text-grey-400 mt-1 line-clamp-1">
                          Interests: {item.research_interests}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* News Section */}
            {(activeTab === 'all' || activeTab === 'news') && searchData.news?.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 border-b border-grey-200 pb-2">
                  <NewspaperIcon className="w-5 h-5 text-gold-dark" />
                  <h2 className="font-display font-bold text-navy text-base">
                    News & Announcements ({searchData.news.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {searchData.news.map((item) => (
                    <Card key={item.id} className="p-4 hover:border-navy transition-colors">
                      <span className="text-[10px] uppercase font-semibold text-grey-400">
                        {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Update'}
                      </span>
                      <h3 className="font-display font-semibold text-navy text-sm hover:underline mt-0.5">
                        <Link to="/news">{item.title}</Link>
                      </h3>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
