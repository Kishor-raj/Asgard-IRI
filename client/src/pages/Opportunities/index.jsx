import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BriefcaseIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getOpportunities } from '../../services/opportunity.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SkeletonCard from '../../components/common/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import PageHeader from '../../components/common/PageHeader';

const categories = [
  { id: 'all', label: 'All Opportunities' },
  { id: 'career', label: 'Careers' },
  { id: 'internship', label: 'Internships' },
  { id: 'fellowship', label: 'Fellowships' },
  { id: 'ra', label: 'Research Assistants' },
  { id: 'student_project', label: 'Student Projects' },
  { id: 'volunteering', label: 'Volunteering' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'grant', label: 'Grants' },
];

export default function OpportunitiesPage() {
  const [selectedCat, setSelectedCat] = useState('all');
  const [page, setPage] = useState(1);

  const { data, loading, error } = useFetch(
    () => getOpportunities({ category: selectedCat, page, limit: 9 }),
    [selectedCat, page]
  );

  const opportunities = data?.data || [];
  const pagination = data?.pagination || { totalPages: 1 };

  return (
    <div>
      <Helmet>
        <title>Opportunities – ASGARD-IRI</title>
        <meta name="description" content="Explore institutional careers, research assistantships, fellowships, and grants at ASGARD-IRI." />
      </Helmet>

      {/* Header */}
      <PageHeader
        overline="Foundation Opportunities"
        title="Join Our Mission"
        subtitle="Work with world-class scholars, contribute to transformative research, and shape the future of knowledge."
      />

      {/* Main Content */}
      <div className="max-w-[1240px] mx-auto px-5 sm:px-7 py-12">
        {/* Category Tabs */}
        <div className="border-b border-grey-200 mb-8 overflow-x-auto pb-1">
          <div className="flex gap-2 min-w-max">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCat(c.id);
                  setPage(1);
                }}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                  selectedCat === c.id
                    ? 'bg-navy text-white font-semibold'
                    : 'text-grey-600 hover:bg-grey-100 hover:text-navy'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-error text-sm">{error}</div>
        ) : opportunities.length === 0 ? (
          <EmptyState
            title="No opportunities found"
            description="There are currently no open listings under this category. Please check other categories or check back soon."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <Card key={opp.id} featured={opp.category === 'fellowship' || opp.category === 'career'} className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge label={opp.category.replace('_', ' ').toUpperCase()} variant="category" />
                    <Badge label={opp.mode.toUpperCase()} variant="active" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-navy mb-2 line-clamp-2">
                    {opp.title}
                  </h3>
                  <div className="space-y-1.5 text-xs text-grey-600 mb-4">
                    {opp.department && (
                      <p className="flex items-center gap-1.5 truncate">
                        <BriefcaseIcon className="w-4 h-4 text-grey-400 shrink-0" />
                        {opp.department}
                      </p>
                    )}
                    {opp.location && (
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPinIcon className="w-4 h-4 text-grey-400 shrink-0" />
                        {opp.location}
                      </p>
                    )}
                    {opp.deadline && (
                      <p className="flex items-center gap-1.5 text-warning font-medium">
                        <ClockIcon className="w-4 h-4 text-warning shrink-0" />
                        Deadline: {new Date(opp.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-grey-600 line-clamp-3 mb-6">
                    {opp.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-grey-100 flex items-center justify-between">
                  <span className="text-xs text-grey-400 font-medium">
                    {opp.seats ? `${opp.seats} Openings` : 'Open Call'}
                  </span>
                  <Link
                    to={`/opportunities/${opp.slug || opp.id}`}
                    className="bg-navy text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-navy-dark transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={pagination.totalPages} onChange={setPage} />
      </div>
    </div>
  );
}
