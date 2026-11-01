import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  AcademicCapIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getAcademyPrograms } from '../../services/content.service';
import {
  createAcademyProgram,
  updateAcademyProgram,
  deleteAcademyProgram,
  getAdminAcademyRegistrations,
  adminUpdateAcademyRegistrationStatus,
  exportAcademyRegistrationsCSV,
} from '../../services/admin.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Loader from '../../components/common/Loader';

const programTypes = [
  { value: 'course', label: 'Certificate Course' },
  { value: 'fdp', label: 'Faculty Development (FDP)' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Doctoral Seminar' },
  { value: 'methodology', label: 'Research Methodology' },
  { value: 'ai_ml', label: 'AI & Machine Learning' },
  { value: 'writing', label: 'Academic Writing' },
];

const regStatusVariants = {
  applied: 'default',
  confirmed: 'open',
  completed: 'category',
  cancelled: 'closed',
};

export default function AdminAcademyPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Registrations Modal State
  const [enrollmentsModalOpen, setEnrollmentsModalOpen] = useState(false);
  const [activeProgram, setActiveProgram] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);

  const { data, loading, refetch } = useFetch(getAcademyPrograms);
  const programs = data?.data || [];

  const [form, setForm] = useState({
    type: 'course',
    title: '',
    description: '',
    duration: '',
    mode: 'online',
    startDate: '',
    endDate: '',
    seats: 30,
    isActive: true,
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      type: 'course',
      title: '',
      description: '',
      duration: '',
      mode: 'online',
      startDate: '',
      endDate: '',
      seats: 30,
      isActive: true,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingId(p.id);
    setForm({
      type: p.type || 'course',
      title: p.title,
      description: p.description || '',
      duration: p.duration || '',
      mode: p.mode || 'online',
      startDate: p.start_date ? p.start_date.split('T')[0] : '',
      endDate: p.end_date ? p.end_date.split('T')[0] : '',
      seats: p.seats || 30,
      isActive: p.is_active !== undefined ? p.is_active : true,
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
        await updateAcademyProgram(editingId, form);
        toast.success('Programme updated successfully.');
      } else {
        await createAcademyProgram(form);
        toast.success('Programme created successfully.');
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save programme.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete programme "${title}"?`)) return;
    try {
      await deleteAcademyProgram(id);
      toast.success('Programme deleted.');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete programme.');
    }
  };

  // Open Enrolled Learners Modal
  const handleOpenEnrollments = async (p = null) => {
    setActiveProgram(p);
    setLoadingEnrollments(true);
    setEnrollmentsModalOpen(true);
    try {
      const params = p ? { programId: p.id } : {};
      const res = await getAdminAcademyRegistrations(params);
      setEnrollments(res.data || []);
    } catch (err) {
      toast.error('Failed to load academy enrollments.');
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const handleStatusChange = async (regId, newStatus) => {
    try {
      await adminUpdateAcademyRegistrationStatus(regId, { status: newStatus });
      toast.success(`Enrollment marked as ${newStatus}.`);
      setEnrollments((prev) =>
        prev.map((e) => (e.id === regId ? { ...e, status: newStatus } : e))
      );
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update enrollment status.');
    }
  };

  const handleExportCSV = async () => {
    setExportingCSV(true);
    try {
      const params = activeProgram ? { programId: activeProgram.id } : {};
      await exportAcademyRegistrationsCSV(params);
      toast.success('Academy enrollments exported as CSV.');
    } catch (err) {
      toast.error('Failed to export enrollments CSV.');
    } finally {
      setExportingCSV(false);
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Academy – ASGARD-IRI Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Academy Programmes</h1>
          <p className="text-xs text-grey-500 mt-1">
            Organize faculty development programmes, track learner enrollments, and export cohort rosters
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenEnrollments(null)}
            className="flex items-center gap-1.5"
          >
            <UserGroupIcon className="w-4 h-4" /> All Enrolled Learners
          </Button>
          <Button variant="primary" onClick={handleOpenCreate} className="flex items-center gap-1.5">
            <PlusIcon className="w-4 h-4" /> Add Programme
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="py-12">
            <Loader />
          </div>
        ) : programs.length === 0 ? (
          <div className="p-12 text-center text-xs text-grey-400">
            No academy programmes found. Add your first programme.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Duration & Mode</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Workflows & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-100">
                {programs.map((p) => (
                  <tr key={p.id} className="hover:bg-grey-50/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-navy max-w-sm truncate">{p.title}</div>
                      <div className="text-[11px] text-grey-500">
                        {p.start_date ? new Date(p.start_date).toLocaleDateString() : 'Rolling'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge label={p.type?.replace('_', ' ').toUpperCase()} variant="gold" />
                    </td>
                    <td className="py-3 px-4 text-grey-600 capitalize">
                      {p.duration || '4 Weeks'} · {p.mode || 'Online'}
                    </td>
                    <td className="py-3 px-4 text-grey-600 font-semibold">
                      {p.seats || 30}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        label={p.is_active ? 'ACTIVE' : 'INACTIVE'}
                        variant={p.is_active ? 'open' : 'closed'}
                      />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEnrollments(p)}
                        className="inline-flex items-center gap-1 bg-navy/5 text-navy hover:bg-navy hover:text-white px-2 py-1 rounded text-[11px] font-semibold transition-colors"
                        title="View Enrolled Learners"
                      >
                        <UserGroupIcon className="w-3.5 h-3.5" /> Learners
                      </button>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="text-navy hover:text-gold p-1"
                        title="Edit Programme"
                      >
                        <PencilSquareIcon className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete Programme"
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

      {/* Programme Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Programme' : 'Add Academy Programme'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {formError}
            </div>
          )}

          <Input
            label="Programme Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Advanced Structural Equation Modeling in R & Python"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Programme Category"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              required
            >
              {programTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>

            <Select
              label="Instruction Mode"
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}
            >
              <option value="online">Online Live</option>
              <option value="self-paced">Self-Paced Online</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-Site Workshop</option>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Duration"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="e.g. 6 Weeks / 40 Hours"
            />
            <Input
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              label="Seat Capacity"
              type="number"
              min="1"
              value={form.seats}
              onChange={(e) => setForm({ ...form, seats: parseInt(e.target.value, 10) || 30 })}
            />
          </div>

          <Textarea
            label="Curriculum & Syllabus Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Weekly topics, prerequisites, instructional goals..."
            rows={4}
            required
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isProgActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded text-navy focus:ring-navy"
            />
            <label htmlFor="isProgActive" className="text-grey-700 font-medium">
              Active / Visible on public academy catalogue
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-grey-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingId ? 'Update Programme' : 'Save Programme'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Enrolled Learners Modal with CSV Export */}
      {enrollmentsModalOpen && (
        <Modal
          isOpen={enrollmentsModalOpen}
          onClose={() => setEnrollmentsModalOpen(false)}
          title={
            activeProgram
              ? `Enrolled Learners: ${activeProgram.title}`
              : 'All Enrolled Academy Learners'
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-grey-100">
              <span className="text-grey-600 font-medium">
                Total Learners: <strong>{enrollments.length}</strong>
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportCSV}
                loading={exportingCSV}
                className="flex items-center gap-1.5"
              >
                <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Export Enrollments (CSV)
              </Button>
            </div>

            {loadingEnrollments ? (
              <div className="py-8">
                <Loader />
              </div>
            ) : enrollments.length === 0 ? (
              <div className="p-8 text-center text-grey-400">
                No learners enrolled in this programme yet.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[60vh]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Learner</th>
                      <th className="py-2.5 px-3">Programme</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Enrolled On</th>
                      <th className="py-2.5 px-3 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-grey-100">
                    {enrollments.map((enr) => (
                      <tr key={enr.id} className="hover:bg-grey-50/50">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-navy">{enr.name}</div>
                          <div className="text-[11px] text-grey-500">{enr.email}</div>
                          <div className="text-[11px] text-grey-400">{enr.affiliation}</div>
                        </td>
                        <td className="py-2.5 px-3 text-grey-700 max-w-xs truncate">
                          {enr.program_title}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge
                            label={enr.status?.toUpperCase()}
                            variant={regStatusVariants[enr.status] || 'default'}
                          />
                        </td>
                        <td className="py-2.5 px-3 text-grey-500">
                          {new Date(enr.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <select
                            value={enr.status}
                            onChange={(e) => handleStatusChange(enr.id, e.target.value)}
                            className="text-[11px] border border-grey-200 rounded px-2 py-1 bg-white focus:outline-none focus:border-navy"
                          >
                            <option value="applied">Applied</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-3 border-t border-grey-100 flex justify-end">
              <Button variant="outline" onClick={() => setEnrollmentsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
