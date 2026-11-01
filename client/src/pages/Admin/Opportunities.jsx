import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BriefcaseIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import {
  adminGetOpportunities,
  adminCreateOpportunity,
  adminUpdateOpportunity,
  adminDeleteOpportunity,
} from '../../services/opportunity.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Loader from '../../components/common/Loader';

const categories = [
  { value: 'career', label: 'Careers' },
  { value: 'internship', label: 'Internships' },
  { value: 'fellowship', label: 'Fellowships' },
  { value: 'ra', label: 'Research Assistants' },
  { value: 'student_project', label: 'Student Projects' },
  { value: 'volunteering', label: 'Volunteering' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'grant', label: 'Grants' },
];

export default function AdminOpportunitiesPage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [form, setForm] = useState({
    title: '',
    category: 'career',
    department: '',
    description: '',
    requirements: '',
    location: '',
    mode: 'hybrid',
    deadline: '',
    vacancies: 1,
    stipend: '',
    fee: 0,
    status: 'open',
  });

  const { data, loading, refetch } = useFetch(adminGetOpportunities);
  const opportunities = data?.data || [];

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      title: '',
      category: 'career',
      department: '',
      description: '',
      requirements: '',
      location: '',
      mode: 'hybrid',
      deadline: '',
      vacancies: 1,
      stipend: '',
      fee: 0,
      status: 'open',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (opp) => {
    setEditingId(opp.id);
    setForm({
      title: opp.title,
      category: opp.category,
      department: opp.department || '',
      description: opp.description || '',
      requirements: opp.requirements || '',
      location: opp.location || '',
      mode: opp.mode || 'hybrid',
      deadline: opp.deadline ? opp.deadline.split('T')[0] : '',
      vacancies: opp.vacancies || 1,
      stipend: opp.stipend || '',
      fee: opp.fee || 0,
      status: opp.status || 'open',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      if (editingId) {
        await adminUpdateOpportunity(editingId, form);
      } else {
        await adminCreateOpportunity(form);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save opportunity.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to close the opportunity: "${title}"?`)) return;
    try {
      await adminDeleteOpportunity(id);
      refetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to close opportunity.');
    }
  };

  const filteredOpps = opportunities.filter((o) =>
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Opportunities – ASGARD-IRI Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Opportunities & Grants Management</h1>
          <p className="text-xs text-grey-500 mt-1">
            Create and edit institutional openings, fellowship postings, and research calls
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate} className="flex items-center gap-1.5">
          <PlusIcon className="w-4 h-4" /> Create Opportunity
        </Button>
      </div>

      <Card className="overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 bg-grey-50 border-b border-grey-200 flex justify-between items-center">
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="w-4 h-4 text-grey-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs border border-grey-200 rounded-lg bg-white w-full focus:outline-none focus:border-navy"
            />
          </div>
          <span className="text-xs text-grey-400">{filteredOpps.length} Total Listings</span>
        </div>

        {loading ? (
          <div className="py-12">
            <Loader />
          </div>
        ) : filteredOpps.length === 0 ? (
          <div className="p-12 text-center text-xs text-grey-400">
            No opportunities found. Click &quot;Create Opportunity&quot; to publish your first posting.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Mode / Location</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-100">
                {filteredOpps.map((opp) => (
                  <tr key={opp.id} className="hover:bg-grey-50/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-navy">{opp.title}</div>
                      <div className="text-[11px] text-grey-500">{opp.department || 'Foundation'}</div>
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <Badge label={opp.category?.replace('_', ' ')} variant="gold" />
                    </td>
                    <td className="py-3 px-4 text-grey-600 capitalize">
                      {opp.mode} {opp.location ? `(${opp.location})` : ''}
                    </td>
                    <td className="py-3 px-4 text-grey-500">
                      {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'Rolling'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        label={opp.status?.toUpperCase()}
                        variant={opp.status === 'open' ? 'open' : 'closed'}
                      />
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(opp)}
                        className="text-navy hover:text-gold p-1"
                        title="Edit Opportunity"
                      >
                        <PencilSquareIcon className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(opp.id, opp.title)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Close Opportunity"
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

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Opportunity' : 'Create New Opportunity'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {formError}
            </div>
          )}

          <Input
            label="Listing Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Postdoctoral Fellow in Bioethics"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>

            <Input
              label="Department / Lab"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="e.g. AI & Emerging Tech Lab"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Mode"
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}
            >
              <option value="remote">Remote</option>
              <option value="onsite">On-Site</option>
              <option value="hybrid">Hybrid</option>
            </Select>

            <Input
              label="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Cambridge, UK"
            />

            <Input
              label="Application Deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Vacancies"
              type="number"
              min="1"
              value={form.vacancies}
              onChange={(e) => setForm({ ...form, vacancies: parseInt(e.target.value, 10) || 1 })}
            />
            <Input
              label="Stipend / Grant"
              value={form.stipend}
              onChange={(e) => setForm({ ...form, stipend: e.target.value })}
              placeholder="e.g. Competitive / ₹50,000"
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </Select>
          </div>

          <Textarea
            label="Full Description & Responsibilities"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Detailed description of the opportunity..."
            rows={4}
            required
          />

          <Textarea
            label="Eligibility & Requirements"
            value={form.requirements}
            onChange={(e) => setForm({ ...form, requirements: e.target.value })}
            placeholder="Qualifications, technical skills, prior publications..."
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-grey-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={formLoading}>
              {editingId ? 'Update Opportunity' : 'Publish Opportunity'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
