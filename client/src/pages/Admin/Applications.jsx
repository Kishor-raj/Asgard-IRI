import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import {
  adminGetApplications,
  adminUpdateApplicationStatus,
} from '../../services/opportunity.service';
import { exportApplicationsCSV } from '../../services/admin.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const statusOptions = ['pending', 'reviewed', 'shortlisted', 'rejected', 'selected'];

export default function AdminApplicationsPage() {
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusLoading, setStatusLoading] = useState(null);

  const { data, loading, refetch } = useFetch(adminGetApplications);
  const applications = data?.data || [];

  const handleStatusChange = async (appId, newStatus) => {
    setStatusLoading(appId);
    try {
      await adminUpdateApplicationStatus(appId, newStatus);
      refetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update application status.');
    } finally {
      setStatusLoading(null);
    }
  };

  const filteredApps = applications.filter(
    (app) =>
      app.applicant_name?.toLowerCase().includes(search.toLowerCase()) ||
      app.applicant_email?.toLowerCase().includes(search.toLowerCase()) ||
      app.opportunity_title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Applications – ASGARD-IRI Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Opportunity Applications</h1>
          <p className="text-xs text-grey-500 mt-1">
            Review candidate cover letters, submitted resumes, and update recruitment status
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportApplicationsCSV()}
            className="flex items-center gap-1.5"
          >
            <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 bg-grey-50 border-b border-grey-200 flex justify-between items-center">
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="w-4 h-4 text-grey-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search candidate or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs border border-grey-200 rounded-lg bg-white w-full focus:outline-none focus:border-navy"
            />
          </div>
          <span className="text-xs text-grey-400">{filteredApps.length} Total Submissions</span>
        </div>

        {loading ? (
          <div className="py-12">
            <Loader />
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center text-xs text-grey-400">
            No candidate applications have been submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Opportunity</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Documents</th>
                  <th className="py-3 px-4">Status Pipeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-100">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-grey-50/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-navy">{app.applicant_name || 'Candidate'}</div>
                      <div className="text-[11px] text-grey-500">{app.applicant_email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-navy">{app.opportunity_title}</div>
                      <div className="text-[10px] text-gold-dark uppercase font-semibold">
                        {app.opportunity_category?.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-grey-400">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 space-x-2">
                      {app.cover_letter && (
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="inline-flex items-center gap-1 text-navy hover:underline text-[11px] font-medium"
                        >
                          <DocumentTextIcon className="w-3.5 h-3.5 text-navy" /> Letter
                        </button>
                      )}
                      {app.resume_url && (
                        <a
                          href={app.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-gold-dark hover:underline text-[11px] font-medium ml-2"
                        >
                          Resume <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={app.status || 'pending'}
                        disabled={statusLoading === app.id}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className={`text-xs rounded-lg px-2.5 py-1 border font-semibold ${
                          app.status === 'selected'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : app.status === 'shortlisted'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : app.status === 'rejected'
                            ? 'bg-red-50 text-red-800 border-red-300'
                            : 'bg-grey-50 text-grey-700 border-grey-300'
                        }`}
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Cover Letter Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Cover Letter – ${selectedApp.applicant_name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="bg-grey-50 p-3 rounded-lg border border-grey-200">
              <span className="text-grey-400 block mb-0.5">Application for:</span>
              <strong className="text-navy text-sm">{selectedApp.opportunity_title}</strong>
            </div>

            <div>
              <span className="text-grey-400 block mb-1 font-semibold">Candidate Statement:</span>
              <div className="bg-white p-4 rounded border border-grey-200 whitespace-pre-line text-sm text-grey-700 leading-relaxed max-h-80 overflow-y-auto">
                {selectedApp.cover_letter}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-grey-100">
              <Button variant="outline" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
