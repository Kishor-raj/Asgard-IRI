import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BookOpenIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getPublications } from '../../services/content.service';
import {
  createPublication,
  updatePublication,
  deletePublication,
} from '../../services/admin.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Loader from '../../components/common/Loader';

const types = [
  { value: 'book', label: 'Book' },
  { value: 'ebook', label: 'eBook' },
  { value: 'proceedings', label: 'Proceedings' },
  { value: 'report', label: 'Technical Report' },
  { value: 'monograph', label: 'Monograph' },
];

export default function AdminPublicationsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data, loading, refetch } = useFetch(() => getPublications({ limit: 100 }));
  const publications = data?.data || [];

  const [form, setForm] = useState({
    type: 'book',
    title: '',
    authors: '',
    publicationYear: new Date().getFullYear(),
    isbn: '',
    doi: '',
    abstract: '',
    coverImageUrl: '',
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      type: 'book',
      title: '',
      authors: '',
      publicationYear: new Date().getFullYear(),
      isbn: '',
      doi: '',
      abstract: '',
      coverImageUrl: '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (pub) => {
    setEditingId(pub.id);
    setForm({
      type: pub.type || 'book',
      title: pub.title,
      authors: pub.authors || '',
      publicationYear: pub.publication_year || pub.year || new Date().getFullYear(),
      isbn: pub.isbn || '',
      doi: pub.doi || '',
      abstract: pub.abstract || '',
      coverImageUrl: pub.cover_image_url || '',
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
        await updatePublication(editingId, form);
      } else {
        await createPublication(form);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save publication.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete publication "${title}"?`)) return;
    try {
      await deletePublication(id);
      refetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete publication.');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Publications – ASGARD-IRI Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Publications Catalogue</h1>
          <p className="text-xs text-grey-500 mt-1">
            Publish academic monographs, conference proceedings volumes, and research whitepapers
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate} className="flex items-center gap-1.5">
          <PlusIcon className="w-4 h-4" /> Add Publication
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="py-12">
            <Loader />
          </div>
        ) : publications.length === 0 ? (
          <div className="p-12 text-center text-xs text-grey-400">
            No publications catalogued yet. Click &quot;Add Publication&quot; to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Title & Authors</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">ISBN / DOI</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-100">
                {publications.map((pub) => (
                  <tr key={pub.id} className="hover:bg-grey-50/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-navy max-w-sm truncate">{pub.title}</div>
                      <div className="text-[11px] text-grey-500">{pub.authors}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge label={pub.type?.toUpperCase()} variant="gold" />
                    </td>
                    <td className="py-3 px-4 text-grey-600">
                      {pub.publication_year || pub.year || '2025'}
                    </td>
                    <td className="py-3 px-4 font-mono text-grey-500 text-[11px]">
                      {pub.isbn ? `ISBN: ${pub.isbn}` : pub.doi ? `DOI: ${pub.doi}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(pub)}
                        className="text-navy hover:text-gold p-1"
                        title="Edit Publication"
                      >
                        <PencilSquareIcon className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(pub.id, pub.title)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete Publication"
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
        title={editingId ? 'Edit Publication Entry' : 'Add Scholarly Publication'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {formError}
            </div>
          )}

          <Input
            label="Publication Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Advances in Sovereign AI & Algorithmic Ethics"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Publication Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              required
            >
              {types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>

            <Input
              label="Publication Year"
              type="number"
              value={form.publicationYear}
              onChange={(e) => setForm({ ...form, publicationYear: parseInt(e.target.value, 10) })}
              required
            />
          </div>

          <Input
            label="Authors / Editors"
            value={form.authors}
            onChange={(e) => setForm({ ...form, authors: e.target.value })}
            placeholder="e.g. Dr. Jane Doe, Prof. Rajesh S."
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ISBN (for books/monographs)"
              value={form.isbn}
              onChange={(e) => setForm({ ...form, isbn: e.target.value })}
              placeholder="978-0-..."
            />
            <Input
              label="DOI Identifier"
              value={form.doi}
              onChange={(e) => setForm({ ...form, doi: e.target.value })}
              placeholder="10.5555/asgard.2025.1"
            />
          </div>

          <Input
            label="Cover Image URL"
            value={form.coverImageUrl}
            onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
            placeholder="https://..."
          />

          <Textarea
            label="Abstract / Overview"
            value={form.abstract}
            onChange={(e) => setForm({ ...form, abstract: e.target.value })}
            placeholder="Executive abstract, table of contents, or book summary..."
            rows={4}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-grey-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingId ? 'Update Publication' : 'Save Publication'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
