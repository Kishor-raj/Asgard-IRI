import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  AcademicCapIcon,
  CpuChipIcon,
  BuildingLibraryIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  UserIcon,
  DocumentTextIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { submitConsultancyRequest } from '../../services/content.service';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import PageHeader from '../../components/common/PageHeader';

const services = [
  {
    id: 'Research & Methodology Consulting',
    title: 'Research & Methodology Consulting',
    desc: 'Bespoke experimental design, biostatistical analysis, econometric modeling, and high-impact publication roadmaps.',
    icon: <AcademicCapIcon className="w-7 h-7 text-gold" />,
  },
  {
    id: 'Academic Curriculum & Quality Advisory',
    title: 'Academic Curriculum & Quality Advisory',
    desc: 'Aligning university curricula with international benchmarks, Outcome-Based Education (OBE), and credit transfer systems.',
    icon: <BuildingLibraryIcon className="w-7 h-7 text-gold" />,
  },
  {
    id: 'AI & Enterprise Technology Solutions',
    title: 'AI & Enterprise Technology Solutions',
    desc: 'Applied machine learning architectures, automated reasoning workflows, and algorithmic bias auditing for enterprise systems.',
    icon: <CpuChipIcon className="w-7 h-7 text-gold" />,
  },
  {
    id: 'Digital Innovation & R&D Strategy',
    title: 'Digital Innovation & R&D Strategy',
    desc: 'Technology scouting, university-industry technology transfer pipelines, and prototyping research-backed software tools.',
    icon: <LightBulbIcon className="w-7 h-7 text-gold" />,
  },
  {
    id: 'Institutional Accreditation & Ranking',
    title: 'Institutional Accreditation & Ranking',
    desc: 'Preparation, metric analysis, and dossier compilation for NAAC, NBA, NIRF, QS World Rankings, and THE rankings.',
    icon: <ShieldCheckIcon className="w-7 h-7 text-gold" />,
  },
  {
    id: 'Corporate R&D Training & Upskilling',
    title: 'Corporate R&D Training & Upskilling',
    desc: 'Tailored executive masterclasses in data science, scientific communication, patent creation, and deep-tech forecasting.',
    icon: <BriefcaseIcon className="w-7 h-7 text-gold" />,
  },
];

export default function ConsultancyPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('Research & Methodology Consulting');
  const [formData, setFormData] = useState({
    name: '',
    organisation: '',
    email: '',
    phone: '',
    projectDescription: '',
    budgetRange: '$5,000 – $25,000 / ₹4–20 Lakhs',
    preferredTimeline: '1-3 months',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenModal = (serviceTitle) => {
    if (serviceTitle) {
      setSelectedService(serviceTitle);
    }
    setStep(1);
    setSuccess(false);
    setError(null);
    setModalOpen(true);
  };

  const handleNextStep1 = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.organisation || !formData.email) {
      setError('Please provide your name, organisation, and work email to proceed.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleNextStep2 = (e) => {
    e.preventDefault();
    if (!selectedService || !formData.projectDescription) {
      setError('Please select a service practice and describe your project scope.');
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await submitConsultancyRequest({
        ...formData,
        serviceType: selectedService,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit consultation request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setModalOpen(false);
    setSuccess(false);
    setStep(1);
    setFormData({
      name: '',
      organisation: '',
      email: '',
      phone: '',
      projectDescription: '',
      budgetRange: '$5,000 – $25,000 / ₹4–20 Lakhs',
      preferredTimeline: '1-3 months',
    });
  };

  return (
    <div>
      <Helmet>
        <title>Consultancy & Advisory Services – ASGARD-IRI</title>
        <meta
          name="description"
          content="Commission expert research consulting, AI solutions, institutional accreditation advisory, and corporate training with ASGARD-IRI."
        />
      </Helmet>

      {/* Header */}
      <PageHeader
        overline="Institutional & Corporate Advisory"
        title="Consultancy & Advisory Services"
        subtitle="Translating frontier research into institutional excellence, strategic technology integration, and measurable organizational transformation."
      >
        <button
          onClick={() => handleOpenModal(null)}
          className="btn-gold"
        >
          Initiate Consultation Request →
        </button>
      </PageHeader>

      <div className="max-w-[1240px] mx-auto px-5 sm:px-7 py-14 space-y-16">
        {/* Services Grid */}
        <section>
          <div className="text-center max-w-narrow mx-auto mb-12">
            <span className="text-xs font-semibold text-gold-dark tracking-widest uppercase">
              Domain Expertise
            </span>
            <h2 className="font-display text-3xl font-bold text-navy mt-1">
              Our 6 Core Advisory Practices
            </h2>
            <p className="text-xs text-grey-600 mt-2">
              Engage our multidisciplinary panel of senior scientists, former deans, and computational specialists
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <Card key={s.id} className="p-6 flex flex-col justify-between hover:border-gold transition-colors">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center mb-4">
                    {s.icon}
                  </div>
                  <h3 className="font-display font-semibold text-lg text-navy mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-grey-600 leading-relaxed mb-6">
                    {s.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-grey-100 flex justify-between items-center">
                  <span className="text-[11px] text-grey-400 font-medium">Confidential Mandate</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenModal(s.title)}
                    className="inline-flex items-center gap-1"
                  >
                    Request Consultation <ArrowRightIcon className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Process Section */}
        <section className="bg-grey-50 -mx-6 px-6 py-12 rounded-2xl">
          <div className="max-w-content mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl font-bold text-navy">Consultation Lifecycle</h2>
              <p className="text-grey-600 text-xs mt-1">How we scope, structure, and execute advisory mandates</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Scoping & Intake', desc: 'Initial confidential discovery to define milestones, deliverables, and timelines.' },
                { step: '02', title: 'Panel Assembly', desc: 'Curating domain-specific fellows with exact academic and industrial credentials.' },
                { step: '03', title: 'Execution & Review', desc: 'Iterative delivery backed by empirical evaluations and quantitative benchmarking.' },
                { step: '04', title: 'Institutional Handover', desc: 'Final strategic dossier, artifact repositories, and executive briefing.' },
              ].map((item) => (
                <div key={item.step} className="bg-white p-5 rounded-xl border border-grey-200">
                  <div className="font-display font-bold text-2xl text-gold mb-2">{item.step}</div>
                  <h4 className="font-semibold text-navy text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-grey-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Multi-Step Consultation Request Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleReset}
        title={success ? 'Request Received' : 'Commission an Advisory Engagement'}
      >
        {success ? (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h3 className="font-display text-2xl font-bold text-navy">
              Your request has been received.
            </h3>
            <p className="text-sm text-grey-600 mt-2 max-w-md mx-auto leading-relaxed">
              Our team will review your project brief and contact you within <strong>3 business days</strong> with proposed terms and preliminary advisor matches.
            </p>
            <div className="mt-8 flex justify-center">
              <Button variant="primary" onClick={handleReset}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {/* Step Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className={step >= 1 ? 'text-navy' : 'text-grey-400'}>
                  1. Contact Details
                </span>
                <span className={step >= 2 ? 'text-navy' : 'text-grey-400'}>
                  2. Service & Scope
                </span>
                <span className={step >= 3 ? 'text-navy' : 'text-grey-400'}>
                  3. Budget & Review
                </span>
              </div>
              <div className="h-1.5 w-full bg-grey-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
                {error}
              </div>
            )}

            {/* STEP 1: Contact Details */}
            {step === 1 && (
              <form onSubmit={handleNextStep1} className="space-y-4">
                <Input
                  label="Full Name / Designation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Kumar, Dean of Research"
                  required
                />
                <Input
                  label="Organisation / Institution"
                  value={formData.organisation}
                  onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                  placeholder="e.g. Apex University / Horizon BioLabs"
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Official Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="rajesh@apex-univ.edu"
                    required
                  />
                  <Input
                    label="Contact Phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-grey-100">
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex items-center gap-1.5">
                    Next: Service Scope <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 2: Service & Project Brief */}
            {step === 2 && (
              <form onSubmit={handleNextStep2} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-grey-700 mb-1.5">
                    Advisory Practice Domain <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                    {services.map((s) => (
                      <label
                        key={s.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                          selectedService === s.id
                            ? 'border-gold bg-gold/5 text-navy font-semibold'
                            : 'border-grey-200 hover:border-grey-300 text-grey-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="serviceType"
                          value={s.id}
                          checked={selectedService === s.id}
                          onChange={(e) => setSelectedService(e.target.value)}
                          className="mt-0.5 text-gold focus:ring-gold"
                        />
                        <div>
                          <span className="block">{s.title}</span>
                          <span className="block text-[11px] text-grey-500 font-normal mt-0.5">
                            {s.desc}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <Textarea
                  label="Project Scope & Objectives"
                  value={formData.projectDescription}
                  onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                  placeholder="Outline your institutional context, primary challenges, expected deliverables, and strategic targets..."
                  rows={4}
                  required
                />

                <div className="flex justify-between gap-3 pt-4 border-t border-grey-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5"
                  >
                    <ArrowLeftIcon className="w-3.5 h-3.5" /> Back
                  </Button>
                  <Button type="submit" variant="primary" className="flex items-center gap-1.5">
                    Next: Budget & Review <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 3: Budget Range & Review Summary */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Budget Range (Estimated)"
                    value={formData.budgetRange}
                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                    options={[
                      { value: 'Under $5,000 / ₹4 Lakhs', label: 'Under $5,000 / ₹4 Lakhs' },
                      { value: '$5,000 – $25,000 / ₹4–20 Lakhs', label: '$5,000 – $25,000 / ₹4–20 Lakhs' },
                      { value: 'Over $25,000 / ₹20 Lakhs+', label: 'Over $25,000 / ₹20 Lakhs+' },
                      { value: 'Institutional Grant / Flexible', label: 'Institutional Grant / Flexible' },
                    ]}
                  />

                  <Select
                    label="Target Timeline"
                    value={formData.preferredTimeline}
                    onChange={(e) => setFormData({ ...formData, preferredTimeline: e.target.value })}
                    options={[
                      { value: 'Immediate (< 1 month)', label: 'Immediate (< 1 month)' },
                      { value: '1-3 months', label: '1 – 3 months' },
                      { value: '3-6 months', label: '3 – 6 months' },
                      { value: 'Annual retainer', label: 'Annual Retainer' },
                    ]}
                  />
                </div>

                {/* Review Summary Card */}
                <div className="bg-grey-50 rounded-xl p-4 border border-grey-200 text-xs space-y-2">
                  <h4 className="font-semibold text-navy uppercase text-[11px] tracking-wider mb-2 border-b border-grey-200 pb-1">
                    Engagement Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-grey-400 block">Contact:</span>
                      <span className="font-medium text-navy">{formData.name}</span>
                    </div>
                    <div>
                      <span className="text-grey-400 block">Organisation:</span>
                      <span className="font-medium text-navy">{formData.organisation}</span>
                    </div>
                    <div>
                      <span className="text-grey-400 block">Email:</span>
                      <span className="font-medium text-navy">{formData.email}</span>
                    </div>
                    <div>
                      <span className="text-grey-400 block">Phone:</span>
                      <span className="font-medium text-navy">{formData.phone}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-grey-200">
                    <span className="text-grey-400 block">Practice Area:</span>
                    <span className="font-semibold text-gold-dark">{selectedService}</span>
                  </div>
                  <div>
                    <span className="text-grey-400 block">Brief Excerpt:</span>
                    <p className="text-grey-600 line-clamp-2 italic">
                      "{formData.projectDescription}"
                    </p>
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t border-grey-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5"
                  >
                    <ArrowLeftIcon className="w-3.5 h-3.5" /> Back
                  </Button>
                  <Button type="submit" variant="primary" loading={loading}>
                    Submit Request
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
