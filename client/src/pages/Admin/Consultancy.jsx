import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BriefcaseIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import {
  getAdminConsultancyRequests,
  adminUpdateConsultancyRequestStatus,
  exportConsultancyRequestsCSV,
} from '../../services/admin.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Loader from '../../components/common/Loader';

const statusVariants = {
  new: 'pending',
  reviewed: 'active',
  in_discussion: 'featured',
  engaged: 'open',
  closed: 'closed',
};

export default function AdminConsultancyPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading, refetch } = useFetch(
    () => getAdminConsultancyRequests({ status: statusFilter || undefined }),
    [statusFilter]
  );
  const requests = data?.data || [];

  // Review & Update Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [newStatus, setNewStatus] = useState('new');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const handleOpenReview = (reqItem) => {
    setSelectedReq(reqItem);
    setNewStatus(reqItem.status || 'new');
    setAdminNotes(reqItem.admin_notes || '');
    setUpdateError(null);
    setReviewModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateError(null);
    try {
      await adminUpdateConsultancyRequestStatus(selectedReq.id, {
        status: newStatus,
        adminNotes,
      });
      setReviewModalOpen(false);
      refetch();
    } catch (err) {
      setUpdateError(err.response?.data?.error || 'Failed to update request status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportConsultancyRequestsCSV({ status: statusFilter || undefined });
    } catch (err) {
      alert('Failed to export consultancy requests CSV.');
    }
  };

  const filteredRequests = requests.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      r.name?.toLowerCase().includes(term) ||
      r.organisation?.toLowerCase().includes(term) ||
      r.email?.toLowerCase().includes(term) ||
      r.service_type?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Consultancy Requests – ASGARD-IRI Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">
            Consultancy & Advisory Engagements
          </h1>
          <p className="text-xs text-grey-500 mt-1">
            Review incoming institutional inquiries, scope advisory contracts, and manage client engagement milestones
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5"
          >
            <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <MagnifyingGlassIcon className="w-4 h-4 text-grey-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search client, organisation, service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs border border-grey-200 rounded-lg bg-white w-full focus:outline-none focus:border-navy"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-grey-500 whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-grey-200 rounded-lg px-2.5 py-1.5 bg-white text-navy focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="new">New (Pending Review)</option>
            <option value="reviewed">Reviewed</option>
            <option value="in_discussion">In Discussion</option>
            <option value="engaged">Engaged / Contracted</option>
            <option value="closed">Closed / Archived</option>
          </select>
        </div>
      </Card>

      {/* Requests Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="py-12">
            <Loader />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-xs text-grey-400">
            No consultation requests found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Client / Organisation</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Practice Area</th>
                  <th className="py-3 px-4">Budget & Timeline</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-grey-50/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-navy">{req.name}</div>
                      <div className="text-[11px] text-grey-500">{req.organisation}</div>
                    </td>
                    <td className="py-3 px-4 text-grey-600">
                      <div>{req.email}</div>
                      <div className="text-[10px] text-grey-400">{req.phone}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-navy max-w-xs truncate">
                      {req.service_type}
                    </td>
                    <td className="py-3 px-4 text-grey-500">
                      <div>{req.budget_range || 'Flexible'}</div>
                      <div className="text-[10px] text-grey-400">{req.preferred_timeline || 'Standard'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        label={req.status?.replace('_', ' ').toUpperCase()}
                        variant={statusVariants[req.status] || 'pending'}
                      />
                    </td>
                    <td className="py-3 px-4 text-grey-400">
                      {req.created_at ? new Date(req.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReview(req)}
                        className="text-[11px] py-1 px-2"
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Review & Status Update Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Consultation Request: ${selectedReq?.organisation || ''}`}
      >
        <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
          {updateError && (
            <div className="p-2 bg-red-50 text-red-600 text-xs rounded">{updateError}</div>
          )}

          {/* Client Details Box */}
          <div className="bg-grey-50 p-3 rounded-lg space-y-1.5 border border-grey-200">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-grey-400 block text-[10px]">Client:</span>
                <span className="font-semibold text-navy">{selectedReq?.name}</span>
              </div>
              <div>
                <span className="text-grey-400 block text-[10px]">Organisation:</span>
                <span className="font-semibold text-navy">{selectedReq?.organisation}</span>
              </div>
              <div>
                <span className="text-grey-400 block text-[10px]">Email:</span>
                <span className="font-medium text-navy">{selectedReq?.email}</span>
              </div>
              <div>
                <span className="text-grey-400 block text-[10px]">Phone:</span>
                <span className="font-medium text-navy">{selectedReq?.phone}</span>
              </div>
            </div>
            <div className="pt-1.5 border-t border-grey-200">
              <span className="text-grey-400 block text-[10px]">Practice Area:</span>
              <span className="font-semibold text-gold-dark">{selectedReq?.service_type}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-grey-200 text-[11px]">
              <div><strong>Budget:</strong> {selectedReq?.budget_range || 'Flexible'}</div>
              <div><strong>Timeline:</strong> {selectedReq?.preferred_timeline || 'Standard'}</div>
            </div>
          </div>

          {/* Project Brief */}
          <div>
            <label className="block text-xs font-medium text-grey-700 mb-1">
              Project Description & Scope of Mandate:
            </label>
            <div className="p-3 bg-white border border-grey-200 rounded-lg text-grey-700 whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
              {selectedReq?.project_description}
            </div>
          </div>

          {/* Status Dropdown */}
          <Select
            label="Engagement Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: 'new', label: 'New (Pending Review)' },
              { value: 'reviewed', label: 'Reviewed (Initial Assessment Complete)' },
              { value: 'in_discussion', label: 'In Discussion (Discovery Call Scheduled)' },
              { value: 'engaged', label: 'Engaged (Active Advisory Mandate)' },
              { value: 'closed', label: 'Closed (Completed or Archived)' },
            ]}
            required
          />

          {/* Admin Notes */}
          <Textarea
            label="Internal Notes & Contact History"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            placeholder="Log discussion notes, assigned senior fellows, NDA status, or milestone updates..."
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-grey-100">
            <Button type="button" variant="outline" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={updating}>
              Update Status & Notes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
