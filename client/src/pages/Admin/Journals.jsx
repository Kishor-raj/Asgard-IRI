import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BookOpenIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getJournals } from '../../services/content.service';
import {
  createJournal,
  updateJournal,
  deleteJournal,
} from '../../services/admin.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Loader from '../../components/common/Loader';

export default function AdminJournalsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data, loading, refetch } = useFetch(getJournals);
  const journals = data?.data || [];

  const [form, setForm] = useState({
    name: '',
    issn: '',
    externalUrl: '',
    description: '',
    logoUrl: '',
    isActive: true,
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      name: '',
      issn: '',
      externalUrl: '',
      description: '',
      logoUrl: '',
      isActive: true,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (j) => {
    setEditingId(j.id);
    setForm({
      name: j.name,
      issn: j.issn || '',
      externalUrl: j.external_url || '',
      description: j.description || '',
      logoUrl: j.logo_url || '',
      isActive: j.is_active !== undefined ? j.is_active : true,
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
        await updateJournal(editingId, form);
      } else {
        await createJournal(form);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save journal.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete journal entry "${name}"?`)) return;
    try {
      await deleteJournal(id);
      refetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete journal.');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Journals – ASGARD-IRI Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Affiliated Journals Directory</h1>
          <p className="text-xs text-grey-500 mt-1">
            Curate external journal hyperlinks, ISSN numbers, and editorial portal redirects
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate} className="flex items-center gap-1.5">
          <PlusIcon className="w-4 h-4" /> Add Journal Entry
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="py-12">
            <Loader />
          </div>
        ) : journals.length === 0 ? (
          <div className="p-12 text-center text-xs text-grey-400">
            No journals recorded yet. Add your first journal entry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Journal Name</th>
                  <th className="py-3 px-4">ISSN</th>
                  <th className="py-3 px-4">External Portal URL</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-100">
                {journals.map((j) => (
                  <tr key={j.id} className="hover:bg-grey-50/50">
                    <td className="py-3 px-4 font-semibold text-navy">{j.name}</td>
                    <td className="py-3 px-4 font-mono text-grey-600">{j.issn || 'Pending'}</td>
                    <td className="py-3 px-4">
                      {j.external_url ? (
                        <a
                          href={j.external_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-navy hover:underline flex items-center gap-1 max-w-xs truncate"
                        >
                          {j.external_url} <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-grey-400">None set</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        label={j.is_active ? 'ACTIVE' : 'INACTIVE'}
                        variant={j.is_active ? 'open' : 'closed'}
                      />
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(j)}
                        className="text-navy hover:text-gold p-1"
                        title="Edit Journal"
                      >
                        <PencilSquareIcon className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(j.id, j.name)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete Journal"
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
        title={editingId ? 'Edit Journal Entry' : 'Add Affiliated Journal'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {formError}
            </div>
          )}

          <Input
            label="Journal Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. ASGARD International Journal of Machine Intelligence"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ISSN Number"
              value={form.issn}
              onChange={(e) => setForm({ ...form, issn: e.target.value })}
              placeholder="e.g. 2940-1823"
            />
            <Input
              label="Logo URL"
              value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <Input
            label="External Portal Hyperlink"
            type="url"
            value={form.externalUrl}
            onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
            placeholder="https://journal-portal.org/asgard-ai"
            required
          />

          <Textarea
            label="Editorial Scope & Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Aims, indexing status, and thematic focus..."
            rows={3}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded text-navy focus:ring-navy"
            />
            <label htmlFor="isActive" className="text-grey-700 font-medium">
              Active / Visible on public journals directory
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-grey-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingId ? 'Update Journal' : 'Save Journal'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
