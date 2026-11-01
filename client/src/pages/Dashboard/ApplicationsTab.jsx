import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { getMyApplications } from '../../services/opportunity.service';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';

const statusVariants = {
  applied: 'pending',
  under_review: 'active',
  shortlisted: 'featured',
  selected: 'open',
  rejected: 'closed',
};

export default function ApplicationsTab() {
  const { data, loading, error } = useFetch(getMyApplications);
  const applications = data?.data || [];

  if (loading) return <Loader />;
  if (error) return <div className="text-center py-8 text-error text-sm">{error}</div>;

  if (applications.length === 0) {
    return (
      <EmptyState
        title="No applications submitted yet"
        description="Browse available positions, fellowships, and student projects to submit your application."
        action={
          <Link
            to="/opportunities"
            className="inline-block bg-navy text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-navy-dark transition-colors"
          >
            Explore Opportunities
          </Link>
        }
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-grey-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-grey-200 flex justify-between items-center">
        <h3 className="font-display font-semibold text-navy text-lg">My Submitted Applications</h3>
        <span className="text-xs text-grey-400 font-medium">{applications.length} Applications</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-grey-50 border-b border-grey-200">
              <th className="px-6 py-3 text-left font-semibold text-grey-900">Position Title</th>
              <th className="px-6 py-3 text-left font-semibold text-grey-900">Category</th>
              <th className="px-6 py-3 text-left font-semibold text-grey-900">Applied Date</th>
              <th className="px-6 py-3 text-left font-semibold text-grey-900">Status</th>
              <th className="px-6 py-3 text-right font-semibold text-grey-900">Resume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-grey-200">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-grey-50 transition-colors">
                <td className="px-6 py-4 font-medium text-navy">
                  {app.opportunity_title}
                  {app.department && <p className="text-xs text-grey-400">{app.department}</p>}
                </td>
                <td className="px-6 py-4 capitalize text-grey-600">
                  {app.category?.replace('_', ' ')}
                </td>
                <td className="px-6 py-4 text-grey-600">
                  {new Date(app.applied_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <Badge
                    label={app.status?.replace('_', ' ').toUpperCase()}
                    variant={statusVariants[app.status] || 'pending'}
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  {app.resume_url ? (
                    <a
                      href={app.resume_url.startsWith('http') ? app.resume_url : `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${app.resume_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-info font-semibold hover:underline"
                    >
                      View PDF
                    </a>
                  ) : (
                    <span className="text-xs text-grey-400">—</span>
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
