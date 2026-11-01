import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  AcademicCapIcon,
  ClockIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { getAcademyPrograms, registerAcademyProgram } from '../../services/content.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/ui/Input';
import { useTranslation } from 'react-i18next';
import PaymentCheckout from '../../components/common/PaymentCheckout';
import DummyPayment from '../../components/common/DummyPayment';
import SkeletonCard from '../../components/common/SkeletonCard';
import PageHeader from '../../components/common/PageHeader';
import { cover } from '../../utils/cloudinaryTransform';

const typeTabs = [
  { id: 'all', label: 'All Programmes' },
  { id: 'course', label: 'Certificate Courses' },
  { id: 'fdp', label: 'Faculty Development (FDP)' },
  { id: 'workshop', label: 'Workshops' },
  { id: 'seminar', label: 'Doctoral Seminars' },
  { id: 'methodology', label: 'Research Methodology' },
  { id: 'ai_ml', label: 'AI & Machine Learning' },
  { id: 'writing', label: 'Academic Writing' },
];

export default function AcademyPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState('all');
  const [activeProg, setActiveProg] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Registration Modal State
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [regStep, setRegStep] = useState(1); // 1: Details, 2: Dummy Payment, 3: Success
  const [registering, setRegistering] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    affiliation: '',
    designation: '',
  });
  const [confirmedReg, setConfirmedReg] = useState(null);
  const [pendingReg, setPendingReg] = useState(null);
  const [issuedCert, setIssuedCert] = useState(null);

  const { data, loading } = useFetch(
    () => getAcademyPrograms(selectedType === 'all' ? {} : { type: selectedType }),
    [selectedType]
  );

  const programs = data?.data || [];

  const handleOpenDetail = (prog) => {
    setActiveProg(prog);
    setDetailModalOpen(true);
  };

  const handleOpenRegister = (prog) => {
    if (!user) {
      toast.error('Please log in to register for an academy programme.');
      navigate('/login');
      return;
    }
    setActiveProg(prog);
    setRegForm({
      name: user?.fullName || '',
      email: user?.email || '',
      affiliation: user?.affiliation || '',
      designation: '',
    });
    setRegStep(1);
    setConfirmedReg(null);
    setRegModalOpen(true);
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setRegistering(true);
    try {
      const res = await registerAcademyProgram(activeProg.id, regForm);
      setPendingReg(res.data);
      setRegStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enrollment registration failed.');
    } finally {
      setRegistering(false);
    }
  };

  const handleConfirmEnrollment = async () => {
    setRegistering(true);
    try {
      const res = await registerAcademyProgram(activeProg.id, regForm);
      setConfirmedReg(res.data);
      setRegStep(3);
      toast.success('Academy enrollment confirmed!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enrollment failed.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div>
      <Helmet>
        <title>ASGARD Academy – Academic & Research Training</title>
        <meta
          name="description"
          content="Professional development programmes, Faculty Development Programmes (FDPs), doctoral workshops, and AI certifications at ASGARD Academy."
        />
      </Helmet>

      {/* Header */}
      <PageHeader
        overline="Academic Excellence & Professional Upskilling"
        title="ASGARD Academy"
        subtitle="High-caliber instructional modules for university faculty, PhD scholars, and scientific professionals led by renowned domain experts."
      />

      <div className="max-w-[1240px] mx-auto px-5 sm:px-7 py-12">
        {/* Type Tabs */}
        <div className="flex gap-2 border-b border-grey-200 pb-4 mb-8 overflow-x-auto">
          {typeTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-4 py-2 text-xs rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedType === t.id
                  ? 'bg-navy text-white font-semibold'
                  : 'bg-grey-100 text-grey-700 hover:bg-grey-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Programs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-16 text-grey-400 text-sm">
            No programmes found under the selected category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((prog) => (
              <Card key={prog.id} className="p-6 flex flex-col justify-between hover:border-gold transition-colors">
                <div>
                  {prog.cover_image_url && (
                    <div className="w-full h-44 mb-4 rounded-lg overflow-hidden bg-navy/5">
                      <img
                        src={cover(prog.cover_image_url, 800, 400)}
                        alt={prog.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <Badge
                      label={prog.type?.replace('_', ' ').toUpperCase() || 'COURSE'}
                      variant="open"
                    />
                    <span className="text-[11px] font-semibold text-navy bg-navy/5 px-2.5 py-0.5 rounded-full capitalize">
                      {prog.mode || 'Online Live'}
                    </span>
                  </div>

                  <h3 className="font-display font-semibold text-lg text-navy mb-2 line-clamp-2">
                    {prog.title}
                  </h3>

                  <p className="text-xs text-grey-600 line-clamp-3 mb-6 leading-relaxed">
                    {prog.description || 'Intensive curriculum designed to advance foundational methodologies, data analytics, and high-impact publishing.'}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-grey-100 text-xs">
                  <div className="flex items-center justify-between text-grey-600">
                    <div className="flex items-center gap-1.5">
                      <ClockIcon className="w-4 h-4 text-navy shrink-0" />
                      <span>{prog.duration || '4 Weeks'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserGroupIcon className="w-4 h-4 text-navy shrink-0" />
                      <span>{prog.seats ? `${prog.seats} Seats` : 'Limited Cohort'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-grey-600">
                    <CalendarDaysIcon className="w-4 h-4 text-navy shrink-0" />
                    <span>Starts: {prog.start_date ? new Date(prog.start_date).toLocaleDateString() : 'Rolling Admission'}</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenDetail(prog)}
                      className="text-navy text-xs font-semibold hover:underline"
                    >
                      View Syllabus
                    </button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenRegister(prog)}
                    >
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Program Detail Modal */}
      {detailModalOpen && activeProg && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={activeProg.title}
        >
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap gap-2 items-center pb-2 border-b border-grey-100">
              <Badge label={activeProg.type?.toUpperCase()} variant="open" />
              <span className="bg-navy/10 text-navy font-semibold px-2 py-0.5 rounded capitalize">
                Mode: {activeProg.mode || 'Online Live'}
              </span>
              <span className="text-grey-500 font-semibold">Duration: {activeProg.duration || '4 Weeks'}</span>
            </div>

            <div>
              <span className="font-bold text-navy block mb-1">Programme Overview & Objectives:</span>
              <p className="text-grey-700 leading-relaxed whitespace-pre-line text-sm">
                {activeProg.description || 'Comprehensive training providing theoretical foundations and hands-on laboratory exercises with personalized feedback from faculty.'}
              </p>
            </div>

            <div className="bg-grey-50 p-3 rounded-lg border border-grey-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-grey-500">Scheduled Commencement:</span>
                <span className="font-semibold text-navy">
                  {activeProg.start_date ? new Date(activeProg.start_date).toLocaleDateString() : 'Rolling Cohort'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-grey-500">Cohort Capacity:</span>
                <span className="font-semibold text-navy">
                  {activeProg.seats ? `${activeProg.seats} Participants` : '30 Participants Max'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-grey-100 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setDetailModalOpen(false);
                  handleOpenRegister(activeProg);
                }}
              >
                Enroll in Programme
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Program Enrollment Modal */}
      {regModalOpen && activeProg && (
        <Modal
          isOpen={regModalOpen}
          onClose={() => setRegModalOpen(false)}
          title={`Enroll: ${activeProg.title}`}
        >
          {regStep === 1 && (
            <form onSubmit={handleProceedToPayment} className="space-y-4 text-xs">
              <p className="text-grey-500">
                Confirm your learner credentials to reserve a seat in this academy cohort.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  placeholder="Prof. Alex Smith"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  placeholder="alex.smith@institute.edu"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Institutional Affiliation"
                  value={regForm.affiliation}
                  onChange={(e) => setRegForm({ ...regForm, affiliation: e.target.value })}
                  placeholder="School of Computer Science & Robotics"
                  required
                />
                <Input
                  label="Designation / Role"
                  value={regForm.designation}
                  onChange={(e) => setRegForm({ ...regForm, designation: e.target.value })}
                  placeholder="Assistant Professor / Lead Researcher"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-grey-100">
                <Button type="button" variant="outline" onClick={() => setRegModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Proceed to Payment →
                </Button>
              </div>
            </form>
          )}

          {regStep === 2 && (
            <div className="space-y-4">
              <PaymentCheckout
                amount={3500}
                currency="INR"
                entityType="academy_registration"
                entityId={pendingReg?.id}
                participantName={regForm.name}
                participantEmail={regForm.email}
                title={`${activeProg.title} — Tuition & Certification`}
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
                Enrollment Confirmed!
              </h3>
              <p className="text-grey-600 max-w-sm mx-auto">
                Congratulations, <strong>{regForm.name}</strong>. Your seat and official completion credential for <strong>{activeProg.title}</strong> have been secured.
              </p>
              {confirmedReg && (
                <div className="p-3 bg-grey-50 border border-grey-200 rounded-lg inline-block text-left text-xs font-mono">
                  Enrollment ID: #{confirmedReg.id} <br />
                  Status: Confirmed & Paid <br />
                  Gateway: Razorpay Verified
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
