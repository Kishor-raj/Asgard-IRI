import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  RocketLaunchIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import {
  getInnovationPrograms,
  getInnovationMentors,
} from '../../services/content.service';
import {
  adminCreateInnovationProgram,
  adminUpdateInnovationProgram,
  adminDeleteInnovationProgram,
  getAdminInnovationApplications,
  adminUpdateInnovationApplicationStatus,
  exportInnovationApplicationsCSV,
  adminCreateMentor,
  adminUpdateMentor,
  adminDeleteMentor,
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
  applied: 'pending',
  under_review: 'active',
  shortlisted: 'featured',
  accepted: 'open',
  rejected: 'closed',
};

export default function AdminInnovationHubPage() {
  const [activeTab, setActiveTab] = useState('applications');

  // Programs state & modal
  const { data: progsData, loading: loadingProgs, refetch: refetchProgs } = useFetch(getInnovationPrograms);
  const programs = progsData?.data || [];
  const [progModalOpen, setProgModalOpen] = useState(false);
  const [editingProgId, setEditingProgId] = useState(null);
  const [progForm, setProgForm] = useState({
    title: '',
    category: 'incubation',
    duration: '6 Months',
    description: '',
    eligibility: '',
    fundingDetails: '',
    status: 'open',
  });

  // Applications state & review modal
  const { data: appsData, loading: loadingApps, refetch: refetchApps } = useFetch(getAdminInnovationApplications);
  const applications = appsData?.data || [];
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('applied');
  const [reviewNotes, setReviewNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Mentors state & modal
  const { data: mentorsData, loading: loadingMentors, refetch: refetchMentors } = useFetch(getInnovationMentors);
  const mentors = mentorsData?.data || [];
  const [mentorModalOpen, setMentorModalOpen] = useState(false);
  const [editingMentorId, setEditingMentorId] = useState(null);
  const [mentorForm, setMentorForm] = useState({
    name: '',
    role: '',
    domain: '',
    bio: '',
    avatarUrl: '',
    linkedinUrl: '',
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Handlers for Programs
  const handleOpenCreateProg = () => {
    setEditingProgId(null);
    setProgForm({
      title: '',
      category: 'incubation',
      duration: '6 Months',
      description: '',
      eligibility: '',
      fundingDetails: '',
      status: 'open',
    });
    setErrorMsg(null);
    setProgModalOpen(true);
  };

  const handleOpenEditProg = (p) => {
    setEditingProgId(p.id);
    setProgForm({
      title: p.title || '',
      category: p.category || 'incubation',
      duration: p.duration || '',
      description: p.description || '',
      eligibility: p.eligibility || '',
      fundingDetails: p.funding_details || '',
      status: p.status || 'open',
    });
    setErrorMsg(null);
    setProgModalOpen(true);
  };

  const handleSaveProg = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      if (editingProgId) {
        await adminUpdateInnovationProgram(editingProgId, progForm);
      } else {
        await adminCreateInnovationProgram(progForm);
      }
      setProgModalOpen(false);
      refetchProgs();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to save programme.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProg = async (id, title) => {
    if (!window.confirm(`Delete programme "${title}"?`)) return;
    try {
      await adminDeleteInnovationProgram(id);
      refetchProgs();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete programme.');
    }
  };

  // Handlers for Applications
  const handleOpenReview = (app) => {
    setSelectedApp(app);
    setNewStatus(app.status || 'applied');
    setReviewNotes(app.review_notes || '');
    setErrorMsg(null);
    setReviewModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    setErrorMsg(null);
    try {
      await adminUpdateInnovationApplicationStatus(selectedApp.id, {
        status: newStatus,
        reviewNotes,
      });
      setReviewModalOpen(false);
      refetchApps();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update application status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportInnovationApplicationsCSV();
    } catch (err) {
      alert('Failed to export applications.');
    }
  };

  // Handlers for Mentors
  const handleOpenCreateMentor = () => {
    setEditingMentorId(null);
    setMentorForm({
      name: '',
      role: '',
      domain: '',
      bio: '',
      avatarUrl: '',
      linkedinUrl: '',
    });
    setErrorMsg(null);
    setMentorModalOpen(true);
  };

  const handleOpenEditMentor = (m) => {
    setEditingMentorId(m.id);
    setMentorForm({
      name: m.name || '',
      role: m.role || '',
      domain: m.domain || '',
      bio: m.bio || '',
      avatarUrl: m.avatar_url || '',
      linkedinUrl: m.linkedin_url || '',
    });
    setErrorMsg(null);
    setMentorModalOpen(true);
  };

  const handleSaveMentor = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      if (editingMentorId) {
        await adminUpdateMentor(editingMentorId, mentorForm);
      } else {
        await adminCreateMentor(mentorForm);
      }
      setMentorModalOpen(false);
      refetchMentors();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to save mentor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMentor = async (id, name) => {
    if (!window.confirm(`Delete mentor "${name}"?`)) return;
    try {
      await adminDeleteMentor(id);
      refetchMentors();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete mentor.');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Innovation Hub – ASGARD-IRI Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Innovation Hub Governance</h1>
          <p className="text-xs text-grey-500 mt-1">
            Oversee venture incubation cohorts, review startup submissions, and coordinate industry mentors
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'applications' && (
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex items-center gap-1.5">
              <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV
            </Button>
          )}
          {activeTab === 'programs' && (
            <Button variant="primary" size="sm" onClick={handleOpenCreateProg}>
              + New Programme
            </Button>
          )}
          {activeTab === 'mentors' && (
            <Button variant="primary" size="sm" onClick={handleOpenCreateMentor}>
              + New Mentor
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-grey-200">
        <button
          onClick={() => setActiveTab('applications')}
          className={`py-3 px-6 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'applications' ? 'border-gold text-navy' : 'border-transparent text-grey-500'
          }`}
        >
          Candidate Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('programs')}
          className={`py-3 px-6 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'programs' ? 'border-gold text-navy' : 'border-transparent text-grey-500'
          }`}
        >
          Cohort Programmes ({programs.length})
        </button>
        <button
          onClick={() => setActiveTab('mentors')}
          className={`py-3 px-6 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'mentors' ? 'border-gold text-navy' : 'border-transparent text-grey-500'
          }`}
        >
          Advisory Mentors ({mentors.length})
        </button>
      </div>

      {/* Tab 1: Applications */}
      {activeTab === 'applications' && (
        <Card className="overflow-hidden">
          {loadingApps ? (
            <div className="py-12">
              <Loader />
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center text-xs text-grey-400">
              No cohort applications received yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Programme & Team</th>
                    <th className="py-3 px-4">Project Title</th>
                    <th className="py-3 px-4">Domain</th>
                    <th className="py-3 px-4">Submitter</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-grey-50/50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-navy">{app.team_name}</div>
                        <div className="text-[11px] text-grey-400">{app.program_title}</div>
                      </td>
                      <td className="py-3 px-4 text-grey-700 max-w-xs truncate">
                        {app.project_title}
                      </td>
                      <td className="py-3 px-4 text-grey-500">{app.domain}</td>
                      <td className="py-3 px-4 text-grey-500">
                        <div>{app.submitter_name || 'Candidate'}</div>
                        <div className="text-[10px] text-grey-400">{app.user_email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          label={app.status?.toUpperCase()}
                          variant={statusVariants[app.status] || 'pending'}
                        />
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {app.brief_url && (
                          <a
                            href={app.brief_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gold-dark hover:text-navy inline-flex items-center gap-0.5"
                            title="Download PDF Brief"
                          >
                            PDF <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReview(app)}
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
      )}

      {/* Tab 2: Programmes */}
      {activeTab === 'programs' && (
        <Card className="overflow-hidden">
          {loadingProgs ? (
            <div className="py-12">
              <Loader />
            </div>
          ) : programs.length === 0 ? (
            <div className="p-12 text-center text-xs text-grey-400">
              No programmes registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-100">
                  {programs.map((p) => (
                    <tr key={p.id} className="hover:bg-grey-50/50">
                      <td className="py-3 px-4 font-semibold text-navy max-w-sm truncate">{p.title}</td>
                      <td className="py-3 px-4 capitalize text-grey-600">{p.category?.replace('_', ' ')}</td>
                      <td className="py-3 px-4 text-grey-500">{p.duration || 'Flexible'}</td>
                      <td className="py-3 px-4">
                        <Badge label={p.status?.toUpperCase() || 'OPEN'} variant="open" />
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditProg(p)}
                          className="text-navy hover:text-gold p-1"
                        >
                          <PencilSquareIcon className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteProg(p.id, p.title)}
                          className="text-red-500 hover:text-red-700 p-1"
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
      )}

      {/* Tab 3: Mentors */}
      {activeTab === 'mentors' && (
        <Card className="overflow-hidden">
          {loadingMentors ? (
            <div className="py-12">
              <Loader />
            </div>
          ) : mentors.length === 0 ? (
            <div className="p-12 text-center text-xs text-grey-400">
              No mentors added yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Role / Title</th>
                    <th className="py-3 px-4">Advisory Domain</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-100">
                  {mentors.map((m) => (
                    <tr key={m.id} className="hover:bg-grey-50/50">
                      <td className="py-3 px-4 font-semibold text-navy">{m.name}</td>
                      <td className="py-3 px-4 text-grey-600">{m.role}</td>
                      <td className="py-3 px-4 text-grey-500">{m.domain}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditMentor(m)}
                          className="text-navy hover:text-gold p-1"
                        >
                          <PencilSquareIcon className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteMentor(m.id, m.name)}
                          className="text-red-500 hover:text-red-700 p-1"
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
      )}

      {/* Programme Create/Edit Modal */}
      <Modal
        isOpen={progModalOpen}
        onClose={() => setProgModalOpen(false)}
        title={editingProgId ? 'Edit Programme' : 'New Innovation Programme'}
      >
        <form onSubmit={handleSaveProg} className="space-y-4">
          {errorMsg && <div className="p-2 bg-red-50 text-red-600 text-xs rounded">{errorMsg}</div>}
          <Input
            label="Programme Title"
            value={progForm.title}
            onChange={(e) => setProgForm({ ...progForm, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={progForm.category}
              onChange={(e) => setProgForm({ ...progForm, category: e.target.value })}
              options={[
                { value: 'incubation', label: 'Incubation' },
                { value: 'hackathon', label: 'Hackathon' },
                { value: 'ip_support', label: 'IP Support' },
                { value: 'venture', label: 'Venture Studio' },
              ]}
              required
            />
            <Input
              label="Cohort Duration"
              value={progForm.duration}
              onChange={(e) => setProgForm({ ...progForm, duration: e.target.value })}
              placeholder="e.g. 6 Months"
            />
          </div>
          <Textarea
            label="Programme Description"
            value={progForm.description}
            onChange={(e) => setProgForm({ ...progForm, description: e.target.value })}
            rows={3}
            required
          />
          <Input
            label="Eligibility Criteria"
            value={progForm.eligibility}
            onChange={(e) => setProgForm({ ...progForm, eligibility: e.target.value })}
            placeholder="e.g. Faculty, post-docs, doctoral scholars"
          />
          <Input
            label="Funding / Grant Details"
            value={progForm.fundingDetails}
            onChange={(e) => setProgForm({ ...progForm, fundingDetails: e.target.value })}
            placeholder="e.g. Up to $50,000 equity-free seed grant"
          />
          <Select
            label="Status"
            value={progForm.status}
            onChange={(e) => setProgForm({ ...progForm, status: e.target.value })}
            options={[
              { value: 'open', label: 'Open' },
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setProgModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Programme
            </Button>
          </div>
        </form>
      </Modal>

      {/* Application Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Review Application: ${selectedApp?.team_name || ''}`}
      >
        <form onSubmit={handleSaveStatus} className="space-y-4">
          {errorMsg && <div className="p-2 bg-red-50 text-red-600 text-xs rounded">{errorMsg}</div>}
          <div className="bg-grey-50 p-3 rounded-lg text-xs space-y-1">
            <div><strong>Programme:</strong> {selectedApp?.program_title}</div>
            <div><strong>Project:</strong> {selectedApp?.project_title}</div>
            <div><strong>Domain:</strong> {selectedApp?.domain}</div>
            <div><strong>Team Members:</strong> {selectedApp?.member_names || selectedApp?.members_names}</div>
          </div>
          <Select
            label="Application Review Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: 'applied', label: 'Applied (Pending)' },
              { value: 'under_review', label: 'Under Review' },
              { value: 'shortlisted', label: 'Shortlisted' },
              { value: 'accepted', label: 'Accepted into Cohort' },
              { value: 'rejected', label: 'Rejected' },
            ]}
            required
          />
          <Textarea
            label="Reviewer Notes / Feedback (Emailed to applicant)"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={4}
            placeholder="Provide constructive feedback or cohort orientation instructions..."
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={updatingStatus}>
              Update Status & Notify
            </Button>
          </div>
        </form>
      </Modal>

      {/* Mentor Create/Edit Modal */}
      <Modal
        isOpen={mentorModalOpen}
        onClose={() => setMentorModalOpen(false)}
        title={editingMentorId ? 'Edit Mentor' : 'New Advisory Mentor'}
      >
        <form onSubmit={handleSaveMentor} className="space-y-4">
          {errorMsg && <div className="p-2 bg-red-50 text-red-600 text-xs rounded">{errorMsg}</div>}
          <Input
            label="Mentor Full Name"
            value={mentorForm.name}
            onChange={(e) => setMentorForm({ ...mentorForm, name: e.target.value })}
            required
          />
          <Input
            label="Role / Title"
            value={mentorForm.role}
            onChange={(e) => setMentorForm({ ...mentorForm, role: e.target.value })}
            placeholder="e.g. Partner, Frontier Ventures"
            required
          />
          <Input
            label="Advisory Domain"
            value={mentorForm.domain}
            onChange={(e) => setMentorForm({ ...mentorForm, domain: e.target.value })}
            placeholder="e.g. Deep-Tech, Diagnostics, Patent Law"
            required
          />
          <Textarea
            label="Short Bio"
            value={mentorForm.bio}
            onChange={(e) => setMentorForm({ ...mentorForm, bio: e.target.value })}
            rows={3}
          />
          <Input
            label="Avatar URL"
            value={mentorForm.avatarUrl}
            onChange={(e) => setMentorForm({ ...mentorForm, avatarUrl: e.target.value })}
            placeholder="https://..."
          />
          <Input
            label="LinkedIn URL"
            value={mentorForm.linkedinUrl}
            onChange={(e) => setMentorForm({ ...mentorForm, linkedinUrl: e.target.value })}
            placeholder="https://linkedin.com/in/..."
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setMentorModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Mentor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
