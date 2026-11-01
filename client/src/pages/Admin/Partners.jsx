import { useEffect, useState } from 'react';
import {
  GlobeAltIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import toast from 'react-hot-toast';
import {
  getAdminPartners,
  createAdminPartner,
  updateAdminPartner,
  deleteAdminPartner,
} from '../../services/admin.service';

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    organisation_name: '',
    website_url: '',
    collaboration_type: 'academic',
    is_active: true,
  });

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await getAdminPartners();
      setPartners(res.data);
    } catch {
      toast.error('Failed to load partner institutions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      organisation_name: '',
      website_url: '',
      collaboration_type: 'academic',
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (partner) => {
    setEditingId(partner.id);
    setFormData({
      organisation_name: partner.organisation_name,
      website_url: partner.website_url || '',
      collaboration_type: partner.collaboration_type || 'academic',
      is_active: partner.is_active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('organisation_name', formData.organisation_name);
      payload.append('website_url', formData.website_url);
      payload.append('collaboration_type', formData.collaboration_type);
      payload.append('is_active', formData.is_active);

      if (editingId) {
        await updateAdminPartner(editingId, payload);
        toast.success('Partner organisation updated.');
      } else {
        await createAdminPartner(payload);
        toast.success('Partner organisation created.');
      }
      setModalOpen(false);
      fetchPartners();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save partner.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this partner organisation?')) return;
    try {
      await deleteAdminPartner(id);
      toast.success('Partner removed.');
      fetchPartners();
    } catch {
      toast.error('Failed to delete partner.');
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-grey-200">
        <div>
          <h1 className="font-display font-bold text-2xl text-navy">
            Institutional & Research Partners
          </h1>
          <p className="text-grey-500 text-xs mt-1">
            Manage international partner universities, research consortia, and industry innovation alliances.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <PlusIcon className="w-4 h-4 mr-1.5" /> Add Partner
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12">
          <Loader />
        </div>
      ) : partners.length === 0 ? (
        <Card className="p-12 text-center text-grey-400 text-sm">
          No partner organisations found.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((p) => (
            <Card key={p.id} className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    label={p.collaboration_type?.toUpperCase()}
                    variant={p.is_active ? 'open' : 'closed'}
                  />
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      p.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-grey-100 text-grey-500'
                    }`}
                  >
                    {p.is_active ? 'Active Partner' : 'Archived'}
                  </span>
                </div>
                <h3 className="font-display font-bold text-navy text-lg mb-2">
                  {p.organisation_name}
                </h3>
                {p.website_url && (
                  <a
                    href={p.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-gold-dark hover:underline flex items-center gap-1 mb-4"
                  >
                    <span>{p.website_url}</span>
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="pt-4 border-t border-grey-100 flex justify-end gap-2 text-xs">
                <Button variant="outline" size="sm" onClick={() => handleOpenEdit(p)}>
                  <PencilSquareIcon className="w-4 h-4 mr-1" /> Edit
                </Button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                  title="Delete Partner"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Edit Partner Organisation' : 'Add New Partner Organisation'}
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <Input
              label="Organisation Name"
              value={formData.organisation_name}
              onChange={(e) => setFormData({ ...formData, organisation_name: e.target.value })}
              required
              placeholder="e.g. Apex Quantum Research Labs"
            />
            <Input
              label="Website URL"
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              placeholder="https://example.org"
            />
            <Select
              label="Collaboration Type"
              value={formData.collaboration_type}
              onChange={(e) => setFormData({ ...formData, collaboration_type: e.target.value })}
              options={[
                { value: 'academic', label: 'Academic University' },
                { value: 'research', label: 'Research Institute' },
                { value: 'institutional', label: 'Institutional Consortium' },
                { value: 'industry', label: 'Industry & Corporate Lab' },
              ]}
            />
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-navy focus:ring-navy"
              />
              <label htmlFor="is_active" className="text-grey-700 font-medium">
                Active in Public Directory & Partner Collaboration Portal
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-grey-100">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={saving}>
                Save Partner
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
