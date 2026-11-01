import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CalendarDaysIcon,
  MapPinIcon,
  AcademicCapIcon,
  DocumentArrowUpIcon,
  TicketIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import {
  getConferences,
  submitConferencePaper,
  registerConference,
} from '../../services/content.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import PageHeader from '../../components/common/PageHeader';
import Textarea from '../../components/ui/Textarea';
import PaymentCheckout from '../../components/common/PaymentCheckout';
import DummyPayment from '../../components/common/DummyPayment';
import SkeletonCard from '../../components/common/SkeletonCard';
import { cover } from '../../utils/cloudinaryTransform';

const statusTabs = [
  { id: 'all', label: 'All Conferences' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'past', label: 'Past Proceedings' },
];

export default function ConferencesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedStatus, setSelectedStatus] = useState('upcoming');
  const [activeConf, setActiveConf] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Paper Submission State
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submittingPaper, setSubmittingPaper] = useState(false);
  const [paperForm, setPaperForm] = useState({
    title: '',
    abstract: '',
    submissionType: 'paper',
    keywords: '',
    file: null,
  });

  // Registration State
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [regStep, setRegStep] = useState(1); // 1: Info, 2: DummyPayment, 3: Success
  const [registering, setRegistering] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    affiliation: '',
    designation: '',
    modePreference: 'hybrid',
  });
  const [confirmedReg, setConfirmedReg] = useState(null);
  const [pendingReg, setPendingReg] = useState(null);
  const [issuedCert, setIssuedCert] = useState(null);

  const { data, loading } = useFetch(
    () => getConferences(selectedStatus === 'all' ? {} : { status: selectedStatus }),
    [selectedStatus]
  );

  const conferences = data?.data || [];

  const handleOpenDetail = (conf) => {
    setActiveConf(conf);
    setDetailModalOpen(true);
  };

  const handleOpenSubmit = (conf) => {
    if (!user) {
      toast.error('Please log in to submit a research paper.');
      navigate('/login');
      return;
    }
    setActiveConf(conf);
    setPaperForm({
      title: '',
      abstract: '',
      submissionType: 'paper',
      keywords: '',
      file: null,
    });
    setSubmitModalOpen(true);
  };

  const handleOpenRegister = (conf) => {
    setActiveConf(conf);
    setRegForm({
      name: user?.fullName || '',
      email: user?.email || '',
      affiliation: user?.affiliation || '',
      designation: '',
      modePreference: conf.mode === 'online' ? 'virtual' : 'hybrid',
    });
    setRegStep(1);
    setConfirmedReg(null);
    setRegModalOpen(true);
  };

  const handlePaperSubmit = async (e) => {
    e.preventDefault();
    if (!paperForm.file) {
      toast.error('Please attach your paper in PDF format.');
      return;
    }
    setSubmittingPaper(true);

    try {
      const formData = new FormData();
      formData.append('title', paperForm.title);
      formData.append('abstract', paperForm.abstract);
      formData.append('submissionType', paperForm.submissionType);
      formData.append('keywords', paperForm.keywords);
      formData.append('file', paperForm.file);

      await submitConferencePaper(activeConf.id, formData);
      toast.success('Paper submitted successfully! Review status in your dashboard.');
      setSubmitModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit paper.');
    } finally {
      setSubmittingPaper(false);
    }
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setRegistering(true);
    try {
      const res = await registerConference(activeConf.id, regForm);
      setPendingReg(res.data);
      setRegStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.');
    } finally {
      setRegistering(false);
    }
  };

  const handleConfirmRegistration = async () => {
    setRegistering(true);
    try {
      const res = await registerConference(activeConf.id, regForm);
      setConfirmedReg(res.data);
      setRegStep(3);
      toast.success('Conference registration confirmed!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Conferences & Symposia – ASGARD-IRI</title>
        <meta
          name="description"
          content="Participate in international academic conferences, submit research papers, and collaborate with leading global scholars."
        />
      </Helmet>

      {/* Header */}
      <PageHeader
        overline="Global Academic Gatherings"
        title="International Conferences & Symposia"
        subtitle="Convening researchers, engineers, practitioners, and doctoral fellows worldwide to debate frontier discoveries and publish indexed proceedings."
      />

      <div className="max-w-[1240px] mx-auto px-5 sm:px-7 py-12">
        {/* Status Tabs */}
        <div className="flex gap-2 border-b border-grey-200 pb-4 mb-8 overflow-x-auto">
          {statusTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedStatus(t.id)}
              className={`px-4 py-2 text-xs rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedStatus === t.id
                  ? 'bg-navy text-white font-semibold'
                  : 'bg-grey-100 text-grey-700 hover:bg-grey-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Conferences List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : conferences.length === 0 ? (
          <div className="text-center py-16 text-grey-400 text-sm">
            No conferences found under the selected filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conferences.map((conf) => (
              <Card key={conf.id} className="p-6 flex flex-col justify-between hover:border-gold transition-colors">
                <div>
                  {conf.cover_image_url && (
                    <div className="w-full h-44 mb-4 rounded-lg overflow-hidden bg-navy/5">
                      <img
                        src={cover(conf.cover_image_url, 800, 400)}
                        alt={conf.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <Badge
                      label={conf.status?.toUpperCase() || 'UPCOMING'}
                      variant={conf.status === 'upcoming' ? 'open' : conf.status === 'ongoing' ? 'gold' : 'closed'}
                    />
                    <span className="text-[11px] font-semibold text-navy bg-navy/5 px-2.5 py-0.5 rounded-full capitalize">
                      {conf.mode || 'Hybrid'}
                    </span>
                  </div>

                  <h3 className="font-display font-semibold text-lg text-navy mb-2 line-clamp-2">
                    {conf.title}
                  </h3>

                  {conf.theme && (
                    <p className="text-xs text-gold-dark font-medium mb-3 line-clamp-1">
                      Theme: {conf.theme}
                    </p>
                  )}

                  <p className="text-xs text-grey-600 line-clamp-3 mb-6 leading-relaxed">
                    {conf.description || 'International academic conference bringing together scholars from across the globe to present peer-reviewed abstracts and papers.'}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-grey-100 text-xs">
                  <div className="flex items-center gap-2 text-grey-600">
                    <CalendarDaysIcon className="w-4 h-4 text-navy shrink-0" />
                    <span>
                      {conf.start_date ? new Date(conf.start_date).toLocaleDateString() : 'Dates TBA'}
                      {conf.end_date ? ` – ${new Date(conf.end_date).toLocaleDateString()}` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-grey-600">
                    <MapPinIcon className="w-4 h-4 text-navy shrink-0" />
                    <span className="line-clamp-1">{conf.venue || 'Virtual & Campus Hybrid'}</span>
                  </div>

                  <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-grey-50">
                    <button
                      onClick={() => handleOpenDetail(conf)}
                      className="text-navy text-xs font-semibold hover:underline"
                    >
                      View Details
                    </button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenSubmit(conf)}
                        className="flex items-center gap-1"
                      >
                        <DocumentArrowUpIcon className="w-3.5 h-3.5" /> Submit Paper
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenRegister(conf)}
                        className="flex items-center gap-1"
                      >
                        <TicketIcon className="w-3.5 h-3.5" /> Register
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Conference Detail Modal */}
      {detailModalOpen && activeConf && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={activeConf.title}
        >
          <div className="space-y-4 text-xs">
            {activeConf.cover_image_url && (
              <div className="w-full h-52 -mt-2 mb-3 rounded-lg overflow-hidden bg-navy/5">
                <img
                  src={cover(activeConf.cover_image_url, 1200, 500)}
                  alt={activeConf.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-wrap gap-2 items-center pb-2 border-b border-grey-100">
              <Badge label={activeConf.status?.toUpperCase()} variant="open" />
              <span className="bg-navy/10 text-navy font-semibold px-2 py-0.5 rounded capitalize">
                Mode: {activeConf.mode || 'Hybrid'}
              </span>
            </div>

            {activeConf.theme && (
              <div>
                <span className="font-bold text-navy block mb-0.5">Conference Theme:</span>
                <p className="text-grey-700 text-sm">{activeConf.theme}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 bg-grey-50 p-3 rounded-lg border border-grey-200">
              <div>
                <span className="font-semibold text-grey-400 block">Dates</span>
                <p className="text-navy font-medium">
                  {activeConf.start_date ? new Date(activeConf.start_date).toLocaleDateString() : 'TBA'}
                  {activeConf.end_date ? ` – ${new Date(activeConf.end_date).toLocaleDateString()}` : ''}
                </p>
              </div>
              <div>
                <span className="font-semibold text-grey-400 block">Venue</span>
                <p className="text-navy font-medium">{activeConf.venue || 'Hybrid'}</p>
              </div>
            </div>

            <div>
              <span className="font-bold text-navy block mb-1">About the Conference:</span>
              <p className="text-grey-700 leading-relaxed whitespace-pre-line text-sm">
                {activeConf.description || 'Papers presented at ASGARD conferences will be considered for inclusion in peer-reviewed proceedings and partner journal special issues.'}
              </p>
            </div>

            <div className="pt-3 border-t border-grey-100 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDetailModalOpen(false);
                  handleOpenSubmit(activeConf);
                }}
              >
                Submit Paper
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setDetailModalOpen(false);
                  handleOpenRegister(activeConf);
                }}
              >
                Register as Attendee
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Paper Submission Modal */}
      {submitModalOpen && activeConf && (
        <Modal
          isOpen={submitModalOpen}
          onClose={() => setSubmitModalOpen(false)}
          title={`Submit Research Paper: ${activeConf.title}`}
        >
          <form onSubmit={handlePaperSubmit} className="space-y-4 text-xs">
            <p className="text-grey-500">
              Submissions undergo double-blind peer review. Accepted papers are published in indexed symposium proceedings.
            </p>

            <Input
              label="Paper Title"
              value={paperForm.title}
              onChange={(e) => setPaperForm({ ...paperForm, title: e.target.value })}
              placeholder="e.g. Distributed Consensus in Asynchronous High-Throughput Networks"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Submission Type"
                value={paperForm.submissionType}
                onChange={(e) => setPaperForm({ ...paperForm, submissionType: e.target.value })}
                required
              >
                <option value="paper">Full Research Paper</option>
                <option value="abstract">Short Paper / Extended Abstract</option>
                <option value="poster">Poster Presentation</option>
                <option value="panel">Panel Discussion Proposal</option>
              </Select>

              <Input
                label="Keywords (comma-separated)"
                value={paperForm.keywords}
                onChange={(e) => setPaperForm({ ...paperForm, keywords: e.target.value })}
                placeholder="AI, Distributed Systems, Cryptography"
              />
            </div>

            <Textarea
              label="Abstract"
              value={paperForm.abstract}
              onChange={(e) => setPaperForm({ ...paperForm, abstract: e.target.value })}
              rows={4}
              placeholder="Provide a concise scholarly summary of the methodology, results, and implications (200-400 words)..."
              required
            />

            <div>
              <label className="block text-grey-700 font-medium mb-1">
                Manuscript Document (PDF format only, max 10MB) *
              </label>
              <input
                type="file"
                accept=".pdf"
                required
                onChange={(e) => setPaperForm({ ...paperForm, file: e.target.files[0] })}
                className="w-full text-xs text-grey-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-navy/10 file:text-navy hover:file:bg-navy/20 cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-grey-100">
              <Button type="button" variant="outline" onClick={() => setSubmitModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submittingPaper}>
                Submit Manuscript
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Conference Registration Modal */}
      {regModalOpen && activeConf && (
        <Modal
          isOpen={regModalOpen}
          onClose={() => setRegModalOpen(false)}
          title={`Register: ${activeConf.title}`}
        >
          {regStep === 1 && (
            <form onSubmit={handleProceedToPayment} className="space-y-4 text-xs">
              <p className="text-grey-500">
                Confirm your participant information for delegate badges and digital certificates.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  placeholder="Dr. Jane Doe"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  placeholder="jane.doe@university.edu"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Affiliation / University"
                  value={regForm.affiliation}
                  onChange={(e) => setRegForm({ ...regForm, affiliation: e.target.value })}
                  placeholder="National University of Singapore"
                  required
                />
                <Input
                  label="Designation / Academic Title"
                  value={regForm.designation}
                  onChange={(e) => setRegForm({ ...regForm, designation: e.target.value })}
                  placeholder="Associate Professor / PhD Fellow"
                />
              </div>

              <Select
                label="Attendance Mode Preference"
                value={regForm.modePreference}
                onChange={(e) => setRegForm({ ...regForm, modePreference: e.target.value })}
                required
              >
                <option value="hybrid">Hybrid (Campus + Live Streams)</option>
                <option value="in_person">In-Person (On Campus)</option>
                <option value="virtual">Virtual Attendance (Remote Stream)</option>
              </Select>

              <div className="flex justify-end gap-3 pt-3 border-t border-grey-100">
                <Button type="button" variant="outline" onClick={() => setRegModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Proceed to Checkout →
                </Button>
              </div>
            </form>
          )}

          {regStep === 2 && (
            <div className="space-y-4">
              <PaymentCheckout
                amount={2500}
                currency="INR"
                entityType="conference_registration"
                entityId={pendingReg?.id}
                participantName={regForm.name}
                participantEmail={regForm.email}
                title={`${activeConf.title} — Registration Fee`}
                onSuccess={(paymentResult) => {
                  setConfirmedReg(paymentResult.registration || pendingReg);
                  setIssuedCert(paymentResult.certificate);
                  setRegStep(3);
                }}
                onCancel={() => setRegStep(1)}
              />
            </div>
          )}

          {regStep === 3 && (
            <div className="text-center py-6 space-y-4 text-xs">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto text-success">
                <CheckCircleIcon className="w-10 h-10" />
              </div>
              <h3 className="font-display font-bold text-navy text-xl">
                Registration Confirmed!
              </h3>
              <p className="text-grey-600 max-w-sm mx-auto">
                Thank you, <strong>{regForm.name}</strong>. Your delegate pass and credential certificate for <strong>{activeConf.title}</strong> have been confirmed.
              </p>
              {confirmedReg && (
                <div className="p-3 bg-grey-50 border border-grey-200 rounded-lg inline-block text-left text-xs font-mono">
                  Registration ID: #{confirmedReg.id} <br />
                  Mode: {confirmedReg.mode_preference} <br />
                  Payment Status: Paid (Verified via Gateway)
                </div>
              )}
              {issuedCert && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left space-y-2 max-w-md mx-auto">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Official Credential Certificate Auto-Issued</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    UID: <span className="font-mono break-all">{issuedCert.certificate_uid}</span>
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {issuedCert.pdf_url && (
                      <a
                        href={issuedCert.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs bg-navy text-white px-3 py-1.5 rounded font-medium hover:bg-gold hover:text-navy transition-colors inline-block"
                      >
                        Download PDF
                      </a>
                    )}
                    <button
                      onClick={() => navigate(`/verify?uid=${issuedCert.certificate_uid}`)}
                      className="text-xs border border-navy/20 text-navy px-3 py-1.5 rounded font-medium hover:bg-navy/5 transition-colors inline-block"
                    >
                      Verify Credential →
                    </button>
                  </div>
                </div>
              )}
              <div className="flex justify-center gap-3 pt-4">
                <Button variant="outline" onClick={() => setRegModalOpen(false)}>
                  Close
                </Button>
                <Button variant="primary" onClick={() => navigate('/dashboard')}>
                  View in Dashboard →
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
