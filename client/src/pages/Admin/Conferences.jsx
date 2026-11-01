import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  AcademicCapIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getConferences } from '../../services/content.service';
import {
  createConference,
  updateConference,
  deleteConference,
  getAdminConferenceSubmissions,
  adminUpdateSubmissionStatus,
  getAdminConferenceRegistrations,
  exportConferenceRegistrationsCSV,
} from '../../services/admin.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Loader from '../../components/common/Loader';

const statusVariants = {
  submitted: 'default',
  accepted: 'open',
  rejected: 'closed',
  revision_requested: 'gold',
};

export default function AdminConferencesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Submissions Modal State
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [activeConference, setActiveConference] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [reviewerNotesMap, setReviewerNotesMap] = useState({});

  // Registrations Modal State
  const [registrationsModalOpen, setRegistrationsModalOpen] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);

  const { data, loading, refetch } = useFetch(getConferences);
  const conferences = data?.data || [];

  const [form, setForm] = useState({
    title: '',
    theme: '',
    status: 'upcoming',
    startDate: '',
    endDate: '',
    venue: '',
    mode: 'hybrid',
    description: '',
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      title: '',
      theme: '',
      status: 'upcoming',
      startDate: '',
      endDate: '',
      venue: '',
      mode: 'hybrid',
      description: '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c.id);
    setForm({
      title: c.title,
      theme: c.theme || '',
      status: c.status || 'upcoming',
      startDate: c.start_date ? c.start_date.split('T')[0] : '',
      endDate: c.end_date ? c.end_date.split('T')[0] : '',
      venue: c.venue || '',
      mode: c.mode || 'hybrid',
      description: c.description || '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      if (editingId) {
        await updateConference(editingId, form);
        toast.success('Conference updated successfully.');
      } else {
        await createConference(form);
        toast.success('Conference created successfully.');
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save conference.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete conference "${title}"?`)) return;
    try {
      await deleteConference(id);
      toast.success('Conference deleted.');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete conference.');
    }
  };

  // Open Submissions Review
  const handleOpenSubmissions = async (conf) => {
    setActiveConference(conf);
    setLoadingSubmissions(true);
    setSubmissionsModalOpen(true);
    try {
      const res = await getAdminConferenceSubmissions(conf.id);
      setSubmissions(res.data || []);
      const notes = {};
      (res.data || []).forEach((s) => {
        notes[s.id] = s.reviewer_notes || '';
      });
      setReviewerNotesMap(notes);
    } catch (err) {
      toast.error('Failed to load conference submissions.');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleUpdateSubmissionStatus = async (subId, newStatus) => {
    try {
      const notes = reviewerNotesMap[subId] || '';
      await adminUpdateSubmissionStatus(subId, {
        status: newStatus,
        reviewerNotes: notes,
      });
      toast.success(`Submission marked as ${newStatus}.`);
      // Update local state
      setSubmissions((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, status: newStatus, reviewer_notes: notes } : s))
      );
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update submission.');
    }
  };

  // Open Registrations View
  const handleOpenRegistrations = async (conf) => {
    setActiveConference(conf);
    setLoadingRegistrations(true);
    setRegistrationsModalOpen(true);
    try {
      const res = await getAdminConferenceRegistrations(conf.id);
      setRegistrations(res.data || []);
    } catch (err) {
      toast.error('Failed to load conference registrations.');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleExportRegistrationsCSV = async () => {
    if (!activeConference) return;
    setExportingCSV(true);
    try {
      await exportConferenceRegistrationsCSV(activeConference.id);
      toast.success('Registrations exported as CSV.');
    } catch (err) {
      toast.error('Failed to export registrations CSV.');
    } finally {
      setExportingCSV(false);
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Conferences – ASGARD-IRI Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Conferences & Symposia</h1>
          <p className="text-xs text-grey-500 mt-1">
            Schedule international scientific symposia, review submitted abstracts, and export attendee rosters
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate} className="flex items-center gap-1.5">
          <PlusIcon className="w-4 h-4" /> Add Conference
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="py-12">
            <Loader />
          </div>
        ) : conferences.length === 0 ? (
          <div className="p-12 text-center text-xs text-grey-400">
            No conferences registered yet. Add your first conference.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Title & Theme</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Venue & Mode</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Workflows & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-100">
                {conferences.map((c) => (
                  <tr key={c.id} className="hover:bg-grey-50/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-navy max-w-sm truncate">{c.title}</div>
                      <div className="text-[11px] text-grey-500">{c.theme || 'Interdisciplinary'}</div>
                    </td>
                    <td className="py-3 px-4 text-grey-600">
                      {c.start_date ? new Date(c.start_date).toLocaleDateString() : 'TBA'}
                    </td>
                    <td className="py-3 px-4 text-grey-600 capitalize">
                      {c.mode || 'hybrid'} {c.venue ? `· ${c.venue}` : ''}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        label={c.status?.toUpperCase()}
                        variant={c.status === 'upcoming' ? 'open' : c.status === 'ongoing' ? 'gold' : 'closed'}
                      />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenSubmissions(c)}
                        className="inline-flex items-center gap-1 bg-navy/5 text-navy hover:bg-navy hover:text-white px-2 py-1 rounded text-[11px] font-semibold transition-colors"
                        title="View & Review Paper Submissions"
                      >
                        <DocumentTextIcon className="w-3.5 h-3.5" /> Submissions
                      </button>
                      <button
                        onClick={() => handleOpenRegistrations(c)}
                        className="inline-flex items-center gap-1 bg-gold/10 text-gold-dark hover:bg-gold hover:text-navy px-2 py-1 rounded text-[11px] font-semibold transition-colors"
                        title="View Attendee Registrations"
                      >
                        <UserGroupIcon className="w-3.5 h-3.5" /> Registrations
                      </button>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="text-navy hover:text-gold p-1"
                        title="Edit Conference"
                      >
                        <PencilSquareIcon className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.title)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete Conference"
                      >
                        <TrashIcon className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Conference Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Conference' : 'Schedule New Conference'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {formError}
            </div>
          )}

          <Input
            label="Conference Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. 5th International Conference on Autonomous Agents & Science"
            required
          />

          <Input
            label="Conference Theme"
            value={form.theme}
            onChange={(e) => setForm({ ...form, theme: e.target.value })}
            placeholder="e.g. Frontier Computing in Low-Resource Regimes"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Conference Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="past">Past</option>
            </Select>

            <Select
              label="Attendance Mode"
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}
            >
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-Site Only</option>
              <option value="online">Virtual / Online Only</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>

          <Input
            label="Venue / Host Campus"
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
            placeholder="e.g. International Convention Centre & Zoom Hybrid"
          />

          <Textarea
            label="Full Description & Call for Papers"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Call for papers, key tracks, keynote speakers..."
            rows={4}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-grey-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingId ? 'Update Conference' : 'Save Conference'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submissions Review Modal */}
      {submissionsModalOpen && activeConference && (
        <Modal
          isOpen={submissionsModalOpen}
          onClose={() => setSubmissionsModalOpen(false)}
          title={`Paper Submissions: ${activeConference.title}`}
        >
          <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto">
            {loadingSubmissions ? (
              <div className="py-8">
                <Loader />
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-8 text-center text-grey-400">
                No papers submitted for this conference yet.
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 bg-grey-50 rounded-xl border border-grey-200 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div>
                        <h4 className="font-semibold text-navy text-sm">{sub.title}</h4>
                        <div className="text-[11px] text-grey-500">
                          Submitter: {sub.submitter_name || 'Scholar'} ({sub.submitter_email}) · Type: <span className="capitalize">{sub.submission_type}</span>
                        </div>
                      </div>
                      <Badge
                        label={sub.status?.replace('_', ' ').toUpperCase()}
                        variant={statusVariants[sub.status] || 'default'}
                      />
                    </div>

                    <p className="text-grey-700 bg-white p-3 rounded border border-grey-100 leading-relaxed text-[11px]">
                      <strong>Abstract:</strong> {sub.abstract}
                    </p>

                    <div className="flex items-center justify-between text-[11px]">
                      <div>
                        {sub.keywords && (
                          <span className="text-grey-500">
                            <strong>Keywords:</strong> {sub.keywords}
                          </span>
                        )}
                      </div>
                      {sub.file_url && (
                        <a
                          href={sub.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-navy hover:text-gold font-semibold"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" /> Download Manuscript PDF
                        </a>
                      )}
                    </div>

                    {/* Review Feedback & Decision Controls */}
                    <div className="pt-2 border-t border-grey-200 flex flex-col sm:flex-row gap-3 items-center">
                      <input
                        type="text"
                        value={reviewerNotesMap[sub.id] || ''}
                        onChange={(e) =>
                          setReviewerNotesMap({ ...reviewerNotesMap, [sub.id]: e.target.value })
                        }
                        placeholder="Add peer review feedback or notes..."
                        className="flex-1 border border-grey-200 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-navy"
                      />
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateSubmissionStatus(sub.id, 'accepted')}
                          className="px-2.5 py-1.5 bg-success text-white rounded text-xs font-semibold hover:bg-green-700 flex items-center gap-1"
                        >
                          <CheckCircleIcon className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateSubmissionStatus(sub.id, 'rejected')}
                          className="px-2.5 py-1.5 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 flex items-center gap-1"
                        >
                          <XCircleIcon className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateSubmissionStatus(sub.id, 'revision_requested')}
                          className="px-2.5 py-1.5 bg-gold text-navy rounded text-xs font-semibold hover:bg-gold-dark"
                        >
                          Revision
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-grey-100 flex justify-end">
              <Button variant="outline" onClick={() => setSubmissionsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Registrations List Modal with CSV Export */}
      {registrationsModalOpen && activeConference && (
        <Modal
          isOpen={registrationsModalOpen}
          onClose={() => setRegistrationsModalOpen(false)}
          title={`Attendee Registrations: ${activeConference.title}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-grey-100">
              <span className="text-grey-600 font-medium">
                Total Registrations: <strong>{registrations.length}</strong>
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportRegistrationsCSV}
                loading={exportingCSV}
                className="flex items-center gap-1.5"
              >
                <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Export Registrations (CSV)
              </Button>
            </div>

            {loadingRegistrations ? (
              <div className="py-8">
                <Loader />
              </div>
            ) : registrations.length === 0 ? (
              <div className="p-8 text-center text-grey-400">
                No participants registered for this conference yet.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[60vh]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Attendee</th>
                      <th className="py-2.5 px-3">Affiliation</th>
                      <th className="py-2.5 px-3">Mode</th>
                      <th className="py-2.5 px-3">Payment</th>
                      <th className="py-2.5 px-3">Registered On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-grey-100">
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-grey-50/50">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-navy">{reg.name}</div>
                          <div className="text-[11px] text-grey-500">{reg.email}</div>
                        </td>
                        <td className="py-2.5 px-3 text-grey-600">
                          <div>{reg.affiliation || 'N/A'}</div>
                          <div className="text-[11px] text-grey-400">{reg.designation || ''}</div>
                        </td>
                        <td className="py-2.5 px-3 capitalize">
                          <span className="bg-navy/5 text-navy px-2 py-0.5 rounded font-medium">
                            {reg.mode_preference}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge label="PAID" variant="open" />
                        </td>
                        <td className="py-2.5 px-3 text-grey-500">
                          {new Date(reg.registration_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-3 border-t border-grey-100 flex justify-end">
              <Button variant="outline" onClick={() => setRegistrationsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
