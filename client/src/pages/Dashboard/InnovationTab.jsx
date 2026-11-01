import { Link } from 'react-router-dom';
import { ArrowTopRightOnSquareIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getMyInnovationApplications } from '../../services/content.service';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';

const statusVariants = {
  applied: 'pending',
  under_review: 'active',
  shortlisted: 'featured',
  accepted: 'open',
  rejected: 'closed',
};

export default function InnovationTab() {
  const { data, loading, error } = useFetch(getMyInnovationApplications);
  const applications = data?.data || [];

  if (loading) return <Loader />;
  if (error) return <div className="text-center py-8 text-error text-sm">{error}</div>;

  if (applications.length === 0) {
    return (
      <EmptyState
        title="No innovation cohort applications found"
        description="Browse available incubation programmes, student hackathons, and venture studio tracks to apply with your research team."
        action={
          <Link
            to="/innovation-hub"
            className="inline-flex items-center gap-2 bg-navy text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-gold hover:text-navy transition-colors"
          >
            <RocketLaunchIcon className="w-4 h-4" /> Explore Innovation Programmes
          </Link>
        }
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-grey-200 overflow-hidden shadow-card">
      <div className="px-6 py-4 border-b border-grey-200 flex justify-between items-center bg-grey-50/50">
        <div>
          <h3 className="font-display font-semibold text-navy text-lg">
            My Innovation & Venture Applications
          </h3>
          <p className="text-xs text-grey-500 mt-0.5">
            Real-time review updates for submitted incubation briefs, prototypes, and challenge pitches
          </p>
        </div>
        <span className="text-xs text-grey-500 font-medium bg-grey-100 px-3 py-1 rounded-full">
          {applications.length} Submitted
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-grey-50 border-b border-grey-200 text-left text-xs uppercase tracking-wider text-grey-500 font-semibold">
              <th className="px-6 py-3">Programme</th>
              <th className="px-6 py-3">Team Name</th>
              <th className="px-6 py-3">Project Title</th>
              <th className="px-6 py-3">Domain</th>
              <th className="px-6 py-3">Submitted</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Pitch Brief</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-grey-200 text-xs">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-grey-50/80 transition-colors">
                <td className="px-6 py-4 font-semibold text-navy">
                  {app.program_title || 'Incubation Cohort'}
                </td>
                <td className="px-6 py-4 text-grey-700 font-medium">
                  {app.team_name}
                </td>
                <td className="px-6 py-4 text-grey-600 max-w-xs truncate">
                  {app.project_title}
                </td>
                <td className="px-6 py-4 text-grey-500">
                  {app.domain}
                </td>
                <td className="px-6 py-4 text-grey-400">
                  {app.created_at ? new Date(app.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-4">
                  <Badge
                    label={app.status ? app.status.replace('_', ' ').toUpperCase() : 'PENDING'}
                    variant={statusVariants[app.status] || 'pending'}
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  {app.brief_url ? (
                    <a
                      href={app.brief_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-gold-dark hover:text-navy font-semibold text-xs"
                    >
                      PDF Brief <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-grey-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
