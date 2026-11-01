import { useEffect, useState } from 'react';
import { getMyAcademyRegistrations } from '../../services/content.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';

const statusVariants = {
  applied: 'default',
  confirmed: 'open',
  completed: 'category',
  cancelled: 'closed',
};

export default function AcademyTab() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAcademyRegistrations()
      .then((res) => {
        setEnrollments(res?.data || []);
      })
      .catch((err) => {
        console.error('Failed to load academy enrollments', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-12">
        <Loader />
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-grey-100 flex justify-between items-center">
        <div>
          <h3 className="font-display font-semibold text-navy text-base">Enrolled Academy Programmes</h3>
          <p className="text-[11px] text-grey-500">Access executive masterclasses, FDP cohorts, and doctoral research methodology modules</p>
        </div>
        <a
          href="/academy"
          className="text-xs text-navy font-semibold hover:underline"
        >
          Browse Academy →
        </a>
      </div>

      {enrollments.length === 0 ? (
        <div className="p-12 text-center text-xs text-grey-400">
          You are not currently enrolled in any academy programmes. Explore our curriculum to join the next cohort.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Programme Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Duration & Mode</th>
                <th className="py-3 px-4">Enrollment Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Enrolled Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-100">
              {enrollments.map((e) => (
                <tr key={e.id} className="hover:bg-grey-50/50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-navy">{e.program_title}</div>
                    <div className="text-[11px] text-grey-500">Registration ID: #{e.id}</div>
                  </td>
                  <td className="py-3 px-4 capitalize">
                    <Badge label={e.program_type?.replace('_', ' ').toUpperCase()} variant="gold" />
                  </td>
                  <td className="py-3 px-4 text-grey-600 capitalize">
                    {e.duration || '4 Weeks'} · {e.program_mode || 'Online'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      label={e.status?.toUpperCase()}
                      variant={statusVariants[e.status] || 'default'}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <Badge label="PAID (SANDBOX)" variant="open" />
                  </td>
                  <td className="py-3 px-4 text-grey-500">
                    {new Date(e.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
