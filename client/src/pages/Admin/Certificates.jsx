import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  ShieldCheckIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  CheckBadgeIcon,
  DocumentArrowUpIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import {
  adminGetCertificates,
  adminIssueCertificate,
  getAdminUsers,
} from '../../services/admin.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Loader from '../../components/common/Loader';

const issuedTypes = [
  { value: 'conference', label: 'Conference Delegate / Presenter' },
  { value: 'academy', label: 'Academy Programme Graduate' },
  { value: 'opportunity', label: 'Fellowship / Grant Recipient' },
  { value: 'other', label: 'Honorary / General Credential' },
];

export default function AdminCertificatesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [formError, setFormError] = useState(null);

  const { data: certsData, loading: loadingCerts, refetch: refetchCerts } = useFetch(adminGetCertificates);
  const certificates = certsData?.data || [];

  const { data: usersData } = useFetch(() => getAdminUsers({ limit: 100 }));
  const users = usersData?.data || [];

  const [form, setForm] = useState({
    userId: '',
    issuedForType: 'conference',
    issuedForLabel: '',
    issuedDate: new Date().toISOString().split('T')[0],
    pdfFile: null,
  });

  const handleOpenIssue = () => {
    setForm({
      userId: users[0]?.id || '',
      issuedForType: 'conference',
      issuedForLabel: '',
      issuedDate: new Date().toISOString().split('T')[0],
      pdfFile: null,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!form.userId) {
      setFormError('Please select a recipient user.');
      return;
    }
    if (!form.issuedForLabel) {
      setFormError('Please enter the event or award label.');
      return;
    }

    setIssuing(true);
    setFormError(null);

    try {
      const formData = new FormData();
      formData.append('userId', form.userId);
      formData.append('issuedForType', form.issuedForType);
      formData.append('issuedForLabel', form.issuedForLabel);
      if (form.issuedDate) formData.append('issuedDate', form.issuedDate);
      if (form.pdfFile) formData.append('pdf', form.pdfFile);

      await adminIssueCertificate(formData);
      toast.success('Certificate issued successfully with cryptographic UID.');
      setModalOpen(false);
      refetchCerts();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to issue certificate.');
    } finally {
      setIssuing(false);
    }
  };

  const copyVerifyUrl = (uid) => {
    const url = `${window.location.origin}/verify?uid=${uid}`;
    navigator.clipboard.writeText(url);
    toast.success('Public verification URL copied to clipboard.');
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Certificates – ASGARD-IRI Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Certificate Authority & Verification</h1>
          <p className="text-xs text-grey-500 mt-1">
            Issue cryptographically verifiable certificates, attach PDF documents, and manage credentials
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenIssue} className="flex items-center gap-1.5">
          <PlusIcon className="w-4 h-4" /> Issue Certificate
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-navy/10 rounded-xl text-navy">
              <CheckBadgeIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-grey-400 font-semibold uppercase block">Total Issued</span>
              <span className="text-xl font-bold text-navy">{certificates.length} Credentials</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gold/10 rounded-xl text-gold-dark">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-grey-400 font-semibold uppercase block">Public Ledger</span>
              <a href="/verify" target="_blank" rel="noreferrer" className="text-xs font-bold text-navy hover:underline">
                /verify Registry Active →
              </a>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <DocumentArrowUpIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-grey-400 font-semibold uppercase block">Digital Format</span>
              <span className="text-xs font-bold text-navy">Manual PDF + UUID Ledger</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Issued Certificates Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-grey-100 flex justify-between items-center">
          <h3 className="font-display font-semibold text-navy text-sm">Issued Certificate Records</h3>
          <span className="text-xs text-grey-400">Cryptographically verifiable by UID</span>
        </div>

        {loadingCerts ? (
          <div className="py-12">
            <Loader />
          </div>
        ) : certificates.length === 0 ? (
          <div className="p-12 text-center text-xs text-grey-400">
            No certificates issued yet. Click "Issue Certificate" to grant the first credential.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Awarded / Issued For</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Certificate UID</th>
                  <th className="py-3 px-4">Issued Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-100">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-grey-50/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-navy">
                        {cert.user_full_name || 'Academic Scholar'}
                      </div>
                      <div className="text-[11px] text-grey-500">{cert.user_email}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-grey-800 line-clamp-2">
                        {cert.issued_for_label}
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <Badge label={cert.issued_for_type} variant="gold" />
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-grey-600">
                      <span className="bg-grey-100 px-1.5 py-0.5 rounded">
                        {cert.certificate_uid?.substring(0, 18)}...
                      </span>
                    </td>
                    <td className="py-3 px-4 text-grey-500">
                      {cert.issued_date ? new Date(cert.issued_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => copyVerifyUrl(cert.certificate_uid)}
                        className="text-grey-600 hover:text-navy p-1"
                        title="Copy Public Verification Link"
                      >
                        <ClipboardDocumentIcon className="w-4 h-4 inline" />
                      </button>
                      <a
                        href={`/verify?uid=${cert.certificate_uid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-navy hover:text-gold font-semibold text-xs"
                      >
                        Verify
                      </a>
                      {cert.pdf_url && (
                        <a
                          href={cert.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-gold-dark hover:text-navy font-semibold text-xs ml-2"
                        >
                          <ArrowDownTrayIcon className="w-3.5 h-3.5" /> PDF
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Issue Certificate Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Issue Verifiable Certificate"
        >
          <form onSubmit={handleIssue} className="space-y-4 text-xs">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-grey-700 font-medium mb-1">
                Recipient User *
              </label>
              <select
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                className="w-full border border-grey-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:border-navy"
                required
              >
                <option value="">Select a registered user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.email}) — {u.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Certificate Category"
                value={form.issuedForType}
                onChange={(e) => setForm({ ...form, issuedForType: e.target.value })}
                required
              >
                {issuedTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>

              <Input
                label="Date of Issuance"
                type="date"
                value={form.issuedDate}
                onChange={(e) => setForm({ ...form, issuedDate: e.target.value })}
                required
              />
            </div>

            <Input
              label="Certificate Award Title / Event Label *"
              value={form.issuedForLabel}
              onChange={(e) => setForm({ ...form, issuedForLabel: e.target.value })}
              placeholder="e.g. 5th International Conference on AI & Ethics - Best Research Paper"
              required
            />

            <div>
              <label className="block text-grey-700 font-medium mb-1">
                Certificate Document (PDF file upload)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setForm({ ...form, pdfFile: e.target.files[0] })}
                className="w-full text-xs text-grey-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-navy/10 file:text-navy hover:file:bg-navy/20 cursor-pointer"
              />
              <span className="text-[10px] text-grey-400 mt-1 block">
                Attach the issued PDF certificate to enable user download from their dashboard.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-grey-100">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={issuing}>
                Issue & Generate UID
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
