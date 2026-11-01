import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  AcademicCapIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getAreas, getProjects, getResearchOutputs } from '../../services/research.service';
import {
  createResearchArea,
  createProject,
  updateProject,
  deleteProject,
  adminCreateResearchOutput,
  adminUpdateResearchOutput,
  adminDeleteResearchOutput,
} from '../../services/admin.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Loader from '../../components/common/Loader';

export default function AdminResearchPage() {
  const [activeTab, setActiveTab] = useState('projects');
  const [projectModal, setProjectModal] = useState(false);
  const [areaModal, setAreaModal] = useState(false);
  const [outputModal, setOutputModal] = useState(false);

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingOutputId, setEditingOutputId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Focus Areas
  const { data: areasData, refetch: refetchAreas } = useFetch(getAreas);
  const areas = areasData?.data || [];

  // Research Projects
  const { data: projectsData, loading: loadingProjects, refetch: refetchProjects } = useFetch(
    () => getProjects({ limit: 100 })
  );
  const projects = projectsData?.data || [];

  // Research Outputs
  const { data: outputsData, loading: loadingOutputs, refetch: refetchOutputs } = useFetch(
    () => getResearchOutputs({ limit: 100 })
  );
  const outputs = outputsData?.data || [];

  // Form states
  const [projectForm, setProjectForm] = useState({
    title: '',
    areaId: '',
    abstract: '',
    methodology: '',
    expectedOutcomes: '',
    fundingAgency: '',
    startDate: '',
    endDate: '',
    status: 'active',
  });

  const [areaForm, setAreaForm] = useState({
    name: '',
    description: '',
  });

  const [outputForm, setOutputForm] = useState({
    title: '',
    type: 'working_paper',
    authorsText: '',
    year: new Date().getFullYear(),
    doi: '',
    abstract: '',
    url: '',
    projectId: '',
    areaId: '',
  });

  // Handlers for Projects
  const handleOpenCreateProject = () => {
    setEditingProjectId(null);
    setProjectForm({
      title: '',
      areaId: areas[0]?.id || '',
      abstract: '',
      methodology: '',
      expectedOutcomes: '',
      fundingAgency: '',
      startDate: '',
      endDate: '',
      status: 'active',
    });
    setFormError(null);
    setProjectModal(true);
  };

  const handleOpenEditProject = (p) => {
    setEditingProjectId(p.id);
    setProjectForm({
      title: p.title,
      areaId: p.area_id || '',
      abstract: p.abstract || '',
      methodology: p.methodology || '',
      expectedOutcomes: p.expected_outcomes || '',
      fundingAgency: p.funding_agency || '',
      startDate: p.start_date ? p.start_date.split('T')[0] : '',
      endDate: p.end_date ? p.end_date.split('T')[0] : '',
      status: p.status || 'active',
    });
    setFormError(null);
    setProjectModal(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editingProjectId) {
        await updateProject(editingProjectId, projectForm);
      } else {
        await createProject(projectForm);
      }
      setProjectModal(false);
      refetchProjects();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (id, title) => {
    if (!window.confirm(`Delete research project "${title}"?`)) return;
    try {
      await deleteProject(id);
      refetchProjects();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete project.');
    }
  };

  // Handlers for Areas
  const handleSaveArea = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await createResearchArea(areaForm);
      setAreaModal(false);
      setAreaForm({ name: '', description: '' });
      refetchAreas();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create area.');
    } finally {
      setSaving(false);
    }
  };

  // Handlers for Research Outputs
  const handleOpenCreateOutput = () => {
    setEditingOutputId(null);
    setOutputForm({
      title: '',
      type: 'working_paper',
      authorsText: '',
      year: new Date().getFullYear(),
      doi: '',
      abstract: '',
      url: '',
      projectId: '',
      areaId: areas[0]?.id || '',
    });
    setFormError(null);
    setOutputModal(true);
  };

  const handleOpenEditOutput = (out) => {
    setEditingOutputId(out.id);
    setOutputForm({
      title: out.title || '',
      type: out.type || 'working_paper',
      authorsText: out.authors_text || '',
      year: out.year || new Date().getFullYear(),
      doi: out.doi || '',
      abstract: out.abstract || '',
      url: out.url || '',
      projectId: out.project_id || '',
      areaId: out.area_id || '',
    });
    setFormError(null);
    setOutputModal(true);
  };

  const handleSaveOutput = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editingOutputId) {
        await adminUpdateResearchOutput(editingOutputId, outputForm);
      } else {
        await adminCreateResearchOutput(outputForm);
      }
      setOutputModal(false);
      refetchOutputs();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save output.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOutput = async (id, title) => {
    if (!window.confirm(`Delete research output "${title}"?`)) return;
    try {
      await adminDeleteResearchOutput(id);
      refetchOutputs();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete output.');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Research – ASGARD-IRI Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Research Management</h1>
          <p className="text-xs text-grey-500 mt-1">
            Govern disciplinary clusters, funded initiatives, and scientific repository deliverables
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'areas' && (
            <Button variant="primary" size="sm" onClick={() => setAreaModal(true)}>
              + New Focus Area
            </Button>
          )}
          {activeTab === 'projects' && (
            <Button variant="primary" size="sm" onClick={handleOpenCreateProject}>
              + New Research Project
            </Button>
          )}
          {activeTab === 'outputs' && (
            <Button variant="primary" size="sm" onClick={handleOpenCreateOutput}>
              + New Research Output
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-grey-200">
        <button
          onClick={() => setActiveTab('projects')}
          className={`py-3 px-6 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'projects' ? 'border-gold text-navy' : 'border-transparent text-grey-500'
          }`}
        >
          Research Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('outputs')}
          className={`py-3 px-6 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'outputs' ? 'border-gold text-navy' : 'border-transparent text-grey-500'
          }`}
        >
          Repository Outputs ({outputs.length})
        </button>
        <button
          onClick={() => setActiveTab('areas')}
          className={`py-3 px-6 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'areas' ? 'border-gold text-navy' : 'border-transparent text-grey-500'
          }`}
        >
          Disciplinary Focus Areas ({areas.length})
        </button>
      </div>

      {/* Tab 1: Projects */}
      {activeTab === 'projects' && (
        <Card className="overflow-hidden">
          {loadingProjects ? (
            <div className="py-12">
              <Loader />
            </div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center text-xs text-grey-400">
              No research projects found. Create one to begin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Domain Area</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Funding Sponsor</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-100">
                  {projects.map((p) => (
                    <tr key={p.id} className="hover:bg-grey-50/50">
                      <td className="py-3 px-4 font-semibold text-navy max-w-sm truncate">
                        {p.title}
                      </td>
                      <td className="py-3 px-4 text-grey-600">
                        {p.area_name || 'Frontier Science'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge label={p.status?.toUpperCase()} variant="open" />
                      </td>
                      <td className="py-3 px-4 text-grey-500">{p.funding_agency || 'ASGARD Internal'}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditProject(p)}
                          className="text-navy hover:text-gold p-1"
                          title="Edit Project"
                        >
                          <PencilSquareIcon className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id, p.title)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete Project"
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

      {/* Tab 2: Outputs */}
      {activeTab === 'outputs' && (
        <Card className="overflow-hidden">
          {loadingOutputs ? (
            <div className="py-12">
              <Loader />
            </div>
          ) : outputs.length === 0 ? (
            <div className="p-12 text-center text-xs text-grey-400">
              No research outputs recorded in the repository. Add one to publish.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Title & Authors</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Year</th>
                    <th className="py-3 px-4">Focus Area</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-100">
                  {outputs.map((out) => (
                    <tr key={out.id} className="hover:bg-grey-50/50">
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-semibold text-navy truncate">{out.title}</div>
                        <div className="text-[11px] text-grey-400 truncate">{out.authors_text}</div>
                      </td>
                      <td className="py-3 px-4 capitalize text-grey-600">
                        {out.type?.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-grey-500 font-mono">{out.year}</td>
                      <td className="py-3 px-4 text-grey-500">{out.area_name || 'Frontier Science'}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {out.url && (
                          <a
                            href={out.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-grey-400 hover:text-navy p-1 inline-block"
                            title="Open Link"
                          >
                            <ArrowTopRightOnSquareIcon className="w-4 h-4 inline" />
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenEditOutput(out)}
                          className="text-navy hover:text-gold p-1"
                          title="Edit Output"
                        >
                          <PencilSquareIcon className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteOutput(out.id, out.title)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete Output"
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

      {/* Tab 3: Areas */}
      {activeTab === 'areas' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Focus Area Name</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-100">
                {areas.map((a) => (
                  <tr key={a.id} className="hover:bg-grey-50/50">
                    <td className="py-3 px-4 font-semibold text-navy">{a.name}</td>
                    <td className="py-3 px-4 text-grey-600">{a.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Project Modal */}
      <Modal
        isOpen={projectModal}
        onClose={() => setProjectModal(false)}
        title={editingProjectId ? 'Edit Research Project' : 'New Research Project'}
      >
        <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {formError}
            </div>
          )}
          <Input
            label="Project Title"
            value={projectForm.title}
            onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
            placeholder="e.g. Distributed Quantum Cryptography"
            required
          />
          <Select
            label="Focus Area"
            value={projectForm.areaId}
            onChange={(e) => setProjectForm({ ...projectForm, areaId: e.target.value })}
            options={areas.map((a) => ({ value: a.id, label: a.name }))}
            required
          />
          <Textarea
            label="Abstract / Problem Statement"
            value={projectForm.abstract}
            onChange={(e) => setProjectForm({ ...projectForm, abstract: e.target.value })}
            rows={3}
          />
          <Textarea
            label="Methodology"
            value={projectForm.methodology}
            onChange={(e) => setProjectForm({ ...projectForm, methodology: e.target.value })}
            rows={2}
          />
          <Textarea
            label="Expected Outcomes"
            value={projectForm.expectedOutcomes}
            onChange={(e) => setProjectForm({ ...projectForm, expectedOutcomes: e.target.value })}
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Funding Agency"
              value={projectForm.fundingAgency}
              onChange={(e) => setProjectForm({ ...projectForm, fundingAgency: e.target.value })}
              placeholder="e.g. ASGARD Frontier Grant"
            />
            <Select
              label="Status"
              value={projectForm.status}
              onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={projectForm.startDate}
              onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={projectForm.endDate}
              onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setProjectModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingProjectId ? 'Update Project' : 'Save Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Output Modal */}
      <Modal
        isOpen={outputModal}
        onClose={() => setOutputModal(false)}
        title={editingOutputId ? 'Edit Research Output' : 'New Research Repository Output'}
      >
        <form onSubmit={handleSaveOutput} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {formError}
            </div>
          )}
          <Input
            label="Output Title"
            value={outputForm.title}
            onChange={(e) => setOutputForm({ ...outputForm, title: e.target.value })}
            placeholder="e.g. Scalable Error-Correction Protocols in Silicon Photonic Qubits"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Output Type"
              value={outputForm.type}
              onChange={(e) => setOutputForm({ ...outputForm, type: e.target.value })}
              options={[
                { value: 'working_paper', label: 'Working Paper' },
                { value: 'preprint', label: 'Preprint' },
                { value: 'technical_report', label: 'Technical Report' },
                { value: 'policy_brief', label: 'Policy Brief' },
                { value: 'monograph', label: 'Monograph' },
                { value: 'dataset', label: 'Dataset' },
              ]}
              required
            />
            <Input
              label="Publication Year"
              type="number"
              value={outputForm.year}
              onChange={(e) => setOutputForm({ ...outputForm, year: e.target.value })}
              required
            />
          </div>
          <Input
            label="Authors (Comma separated)"
            value={outputForm.authorsText}
            onChange={(e) => setOutputForm({ ...outputForm, authorsText: e.target.value })}
            placeholder="Dr. K. Vance, Prof. Elena Rostova"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Digital Object Identifier (DOI)"
              value={outputForm.doi}
              onChange={(e) => setOutputForm({ ...outputForm, doi: e.target.value })}
              placeholder="10.1000/182"
            />
            <Input
              label="Full-Text URL / PDF Link"
              value={outputForm.url}
              onChange={(e) => setOutputForm({ ...outputForm, url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <Select
            label="Associated Focus Area"
            value={outputForm.areaId}
            onChange={(e) => setOutputForm({ ...outputForm, areaId: e.target.value })}
            options={areas.map((a) => ({ value: a.id, label: a.name }))}
          />
          <Textarea
            label="Scholarly Abstract"
            value={outputForm.abstract}
            onChange={(e) => setOutputForm({ ...outputForm, abstract: e.target.value })}
            rows={4}
            placeholder="Summary of research methods, findings, and scientific significance..."
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setOutputModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingOutputId ? 'Update Output' : 'Publish Output'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Area Modal */}
      <Modal
        isOpen={areaModal}
        onClose={() => setAreaModal(false)}
        title="Create New Disciplinary Focus Area"
      >
        <form onSubmit={handleSaveArea} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {formError}
            </div>
          )}
          <Input
            label="Focus Area Name"
            value={areaForm.name}
            onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
            placeholder="e.g. Quantum Computing & Cryptography"
            required
          />
          <Textarea
            label="Description"
            value={areaForm.description}
            onChange={(e) => setAreaForm({ ...areaForm, description: e.target.value })}
            placeholder="Scope of inquiries and related disciplinary clusters..."
            rows={3}
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setAreaModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Create Area
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
