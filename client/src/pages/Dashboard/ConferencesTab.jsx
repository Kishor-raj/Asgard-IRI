import { useEffect, useState } from 'react';
import { ArrowDownTrayIcon, DocumentTextIcon, TicketIcon } from '@heroicons/react/24/outline';
import { getMyConferenceSubmissions, getMyConferenceRegistrations } from '../../services/content.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';

const statusVariants = {
  submitted: 'default',
  accepted: 'open',
  rejected: 'closed',
  revision_requested: 'gold',
};

export default function ConferencesTab() {
  const [submissions, setSubmissions] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('submissions');

  useEffect(() => {
    Promise.all([getMyConferenceSubmissions(), getMyConferenceRegistrations()])
      .then(([subRes, regRes]) => {
        setSubmissions(subRes?.data || []);
        setRegistrations(regRes?.data || []);
      })
      .catch((err) => {
        console.error('Failed to load conferences data', err);
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
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex gap-2 border-b border-grey-200 pb-3">
        <button
          onClick={() => setActiveSubTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeSubTab === 'submissions'
              ? 'bg-navy text-white'
              : 'bg-grey-100 text-grey-700 hover:bg-grey-200'
          }`}
        >
          <DocumentTextIcon className="w-4 h-4" />
          My Paper Submissions ({submissions.length})
        </button>
        <button
          onClick={() => setActiveSubTab('registrations')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeSubTab === 'registrations'
              ? 'bg-navy text-white'
              : 'bg-grey-100 text-grey-700 hover:bg-grey-200'
          }`}
        >
          <TicketIcon className="w-4 h-4" />
          Conference Registrations ({registrations.length})
        </button>
      </div>

      {activeSubTab === 'submissions' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-grey-100 flex justify-between items-center">
            <div>
              <h3 className="font-display font-semibold text-navy text-base">Paper Submissions</h3>
              <p className="text-[11px] text-grey-500">Track peer-review milestones, reviewer remarks, and manuscript statuses</p>
            </div>
            <a
              href="/conferences"
              className="text-xs text-navy font-semibold hover:underline"
            >
              Browse Conferences →
            </a>
          </div>

          {submissions.length === 0 ? (
            <div className="p-12 text-center text-xs text-grey-400">
              No paper submissions found. Explore our upcoming conferences to submit an abstract.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Conference & Paper</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Editorial Feedback</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4 text-right">File</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-100">
                  {submissions.map((s) => (
                    <tr key={s.id} className="hover:bg-grey-50/50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-navy">{s.title}</div>
                        <div className="text-[11px] text-grey-500">{s.conference_title}</div>
                      </td>
                      <td className="py-3 px-4 capitalize">
                        <span className="bg-navy/5 text-navy px-2 py-0.5 rounded font-medium">
                          {s.submission_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          label={s.status?.replace('_', ' ').toUpperCase()}
                          variant={statusVariants[s.status] || 'default'}
                        />
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-grey-600 line-clamp-2">
                          {s.reviewer_notes || 'Pending committee peer review.'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-grey-500">
                        {new Date(s.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {s.file_url ? (
                          <a
                            href={s.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-navy hover:text-gold font-semibold"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" /> Download PDF
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
          )}
        </Card>
      )}

      {activeSubTab === 'registrations' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-grey-100 flex justify-between items-center">
            <div>
              <h3 className="font-display font-semibold text-navy text-base">Registered Conferences</h3>
              <p className="text-[11px] text-grey-500">Confirmed attendance passes, summit schedules, and access credentials</p>
            </div>
            <a
              href="/conferences"
              className="text-xs text-navy font-semibold hover:underline"
            >
              Browse Conferences →
            </a>
          </div>

          {registrations.length === 0 ? (
            <div className="p-12 text-center text-xs text-grey-400">
              No registered conferences found. Register for upcoming summits to secure your seat.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Conference</th>
                    <th className="py-3 px-4">Dates & Venue</th>
                    <th className="py-3 px-4">Mode Preference</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-100">
                  {registrations.map((r) => (
                    <tr key={r.id} className="hover:bg-grey-50/50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-navy">{r.conference_title}</div>
                        <div className="text-[11px] text-grey-500">Attendee: {r.name} ({r.affiliation || 'N/A'})</div>
                      </td>
                      <td className="py-3 px-4 text-grey-600">
                        <div>
                          {r.start_date ? new Date(r.start_date).toLocaleDateString() : 'TBA'}
                          {r.end_date ? ` – ${new Date(r.end_date).toLocaleDateString()}` : ''}
                        </div>
                        <div className="text-[11px] text-grey-400">{r.venue || 'Hybrid'}</div>
                      </td>
                      <td className="py-3 px-4 capitalize">
                        <span className="bg-navy/5 text-navy px-2 py-0.5 rounded font-medium">
                          {r.mode_preference || 'Hybrid'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge label="CONFIRMED (SANDBOX)" variant="open" />
                      </td>
                      <td className="py-3 px-4 text-grey-500">
                        {new Date(r.registration_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
