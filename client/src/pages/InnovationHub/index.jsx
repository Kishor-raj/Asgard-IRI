import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  RocketLaunchIcon,
  TrophyIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import {
  getInnovationPrograms,
  getInnovationMentors,
  applyToInnovationProgram,
} from '../../services/content.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';

const fallbackPrograms = [
  {
    id: 'default-1',
    title: 'ASGARD Deep-Tech Incubator',
    category: 'incubation',
    tag: 'Incubation',
    duration: '6 Months',
    description:
      'Seed-stage support for research-derived startups across biotechnology, robotics, renewable energy, and scientific computing.',
  },
  {
    id: 'default-2',
    title: 'Annual Global Student Hackathon',
    category: 'hackathon',
    tag: 'Hackathon',
    duration: '48 Hours',
    description:
      'Inter-university competitive software and hardware design sprint solving real-world climate, healthcare, and educational bottlenecks.',
  },
  {
    id: 'default-3',
    title: 'Intellectual Property & Patent Studio',
    category: 'ip_support',
    tag: 'IP Protection',
    duration: 'Ongoing',
    description:
      'Expert legal and prior-art filing guidance helping faculty and doctoral scholars protect and commercialize foundational discoveries.',
  },
  {
    id: 'default-4',
    title: 'Industry-Academic Prototype Sprint',
    category: 'venture',
    tag: 'Proof of Concept',
    duration: '3 Months',
    description:
      'Matching corporate R&D challenges with post-doctoral fellows to deliver working proof-of-concept prototypes.',
  },
];

const fallbackMentors = [
  {
    id: 'm-1',
    name: 'Siddharth Rao',
    role: 'Partner, Frontier Ventures',
    domain: 'Deep-Tech & Early-Stage Scaling',
  },
  {
    id: 'm-2',
    name: 'Dr. Clara Montero',
    role: 'Chief Scientific Officer, BioForge',
    domain: 'Translational Medicine & Diagnostics',
  },
  {
    id: 'm-3',
    name: 'David K. Henderson',
    role: 'Managing IP Counsel, PatentWorks',
    domain: 'Patent Law & Technology Transfer',
  },
  {
    id: 'm-4',
    name: 'Dr. Elena Wu',
    role: 'Director of AI Alliances',
    domain: 'Enterprise Cloud & Machine Intelligence',
  },
];

export default function InnovationHubPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Data fetching
  const { data: progData, loading: loadingProgs } = useFetch(getInnovationPrograms);
  const { data: mentorData } = useFetch(getInnovationMentors);

  const programs = progData?.data?.length > 0 ? progData.data : fallbackPrograms;
  const mentors = mentorData?.data?.length > 0 ? mentorData.data : fallbackMentors;

  // Application Modal state
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [memberNames, setMemberNames] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [domain, setDomain] = useState('Biotechnology');
  const [briefFile, setBriefFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleOpenApply = (prog) => {
    if (!user) {
      navigate('/login?redirect=/innovation-hub');
      return;
    }
    setSelectedProgram(prog);
    setTeamName('');
    setMemberNames(user.fullName || '');
    setProjectTitle('');
    setDomain('Biotechnology');
    setBriefFile(null);
    setFormError(null);
    setSubmitSuccess(false);
    setIsModalOpen(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!briefFile) {
      setFormError('Please select a project brief or proposal document (PDF format).');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const formData = new FormData();
    formData.append('teamName', teamName);
    formData.append('memberNames', memberNames);
    formData.append('projectTitle', projectTitle);
    formData.append('domain', domain);
    formData.append('brief', briefFile);

    try {
      await applyToInnovationProgram(selectedProgram.id, formData);
      setSubmitSuccess(true);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Innovation Hub & Venture Studio – ASGARD-IRI</title>
        <meta
          name="description"
          content="Transforming academic discoveries into real-world impact through incubation, patent support, student hackathons, and venture mentoring."
        />
      </Helmet>

      {/* Header */}
      <PageHeader
        overline="Translational Research & Entrepreneurship"
        title="ASGARD Innovation Hub"
        subtitle="Empowering visionary scholars, students, and research teams to transform laboratory prototypes into scalable, patent-protected societal enterprises."
      />

      <div className="max-w-[1240px] mx-auto px-5 sm:px-7 py-14 space-y-16">
        {/* Hub Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-gold/40">
            <RocketLaunchIcon className="w-8 h-8 text-gold mb-3" />
            <h3 className="font-display font-semibold text-lg text-navy mb-2">Venture Incubation</h3>
            <p className="text-xs text-grey-600 leading-relaxed">
              Providing equity-free seed grants, co-working laboratory space, and strategic industry
              introductions for university spin-outs.
            </p>
          </Card>

          <Card className="p-6 border-navy/30">
            <ShieldCheckIcon className="w-8 h-8 text-navy mb-3" />
            <h3 className="font-display font-semibold text-lg text-navy mb-2">
              IP Protection & Filing
            </h3>
            <p className="text-xs text-grey-600 leading-relaxed">
              Navigating global patent landscapes, drafting utility patents, and safeguarding sovereign
              intellectual property assets.
            </p>
          </Card>

          <Card className="p-6 border-gold/40">
            <TrophyIcon className="w-8 h-8 text-gold mb-3" />
            <h3 className="font-display font-semibold text-lg text-navy mb-2">
              Hackathons & Challenges
            </h3>
            <p className="text-xs text-grey-600 leading-relaxed">
              Hosting competitive student challenges with prize pools, mentorship, and opportunities
              to join full-time research fellowships.
            </p>
          </Card>
        </section>

        {/* Programmes Grid */}
        <section>
          <div className="text-center max-w-narrow mx-auto mb-10">
            <span className="text-xs font-semibold text-gold-dark tracking-widest uppercase">
              Active Cohorts
            </span>
            <h2 className="font-display text-3xl font-bold text-navy mt-1">
              Innovation Programmes & Challenges
            </h2>
            <p className="text-xs text-grey-600 mt-2">
              Structured initiatives connecting ambitious researchers with commercialization mentors
            </p>
          </div>

          {loadingProgs ? (
            <div className="py-12">
              <Loader />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {programs.map((prog) => (
                <Card
                  key={prog.id || prog.title}
                  className="p-6 flex flex-col justify-between hover:border-gold transition-colors"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <Badge
                        label={prog.category ? prog.category.replace('_', ' ').toUpperCase() : (prog.tag || 'COHORT')}
                        variant="open"
                      />
                      <span className="text-xs text-grey-400 font-medium">
                        Duration: {prog.duration || '6 Months'}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-lg text-navy mb-2">
                      {prog.title}
                    </h3>
                    <p className="text-xs text-grey-600 leading-relaxed mb-6">
                      {prog.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-grey-100 flex items-center justify-between">
                    <span className="text-xs text-grey-500 font-medium">
                      Status: {prog.status ? prog.status.toUpperCase() : 'OPEN'}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenApply(prog)}
                    >
                      Apply Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Mentor Directory Section */}
        <section className="bg-navy text-white -mx-6 px-6 py-14 rounded-2xl">
          <div className="max-w-content mx-auto">
            <div className="text-center max-w-narrow mx-auto mb-10">
              <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-1">
                Advisory Guidance
              </p>
              <h2 className="font-display text-3xl font-bold text-white">
                Industry & Venture Mentors
              </h2>
              <p className="text-white/60 text-xs mt-2">
                Accomplished founders, venture capitalists, and intellectual property strategists counseling our cohort founders
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {mentors.map((m) => (
                <div
                  key={m.id || m.name}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-gold/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center font-display font-bold text-sm mb-3">
                    {m.name ? m.name.charAt(0) : 'M'}
                  </div>
                  <h4 className="font-display font-semibold text-white text-base">{m.name}</h4>
                  <p className="text-xs text-gold-light mt-0.5">{m.role || m.designation}</p>
                  <p className="text-[11px] text-white/60 mt-2">{m.domain || m.expertise_area}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Application Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Apply to ${selectedProgram?.title || 'Programme'}`}
      >
        {submitSuccess ? (
          <div className="text-center py-6">
            <CheckCircleIcon className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold text-navy">Application Submitted!</h3>
            <p className="text-sm text-grey-600 mt-2 mb-6">
              Your innovation application and project proposal brief have been received. The Innovation Committee will review your submission.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center bg-navy text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gold hover:text-navy transition-colors"
              >
                Track in Dashboard →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitApplication} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                {formError}
              </div>
            )}

            <Input
              label="Team or Venture Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. BioSynthetica Labs"
              required
            />

            <Input
              label="Team Members & Affiliations"
              value={memberNames}
              onChange={(e) => setMemberNames(e.target.value)}
              placeholder="e.g. Dr. Jane Doe (Lead), Alex Smith (Engineer)"
              required
            />

            <Input
              label="Proposed Project / Solution Title"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. Decentralized Microgrid Optimization Engine"
              required
            />

            <Select
              label="Technology Domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              options={[
                { value: 'Biotechnology', label: 'Biotechnology & Healthcare' },
                { value: 'AI & Machine Intelligence', label: 'AI & Machine Intelligence' },
                { value: 'Clean Energy & Climate', label: 'Clean Energy & Climate Tech' },
                { value: 'Robotics & Hardware', label: 'Robotics & Automation' },
                { value: 'Quantum & Frontier Computing', label: 'Quantum & Frontier Computing' },
                { value: 'Agritech & Food Systems', label: 'Agritech & Food Systems' },
              ]}
              required
            />

            <div>
              <label className="block text-xs font-medium text-grey-700 mb-1">
                Project Proposal Brief (PDF) <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setBriefFile(e.target.files[0])}
                className="w-full text-xs text-grey-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-navy/10 file:text-navy hover:file:bg-navy/20 cursor-pointer"
                required
              />
              <p className="text-[11px] text-grey-400 mt-1">
                Upload your executive summary, pitch deck, or technical brief (PDF, max 10MB).
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitting}>
                Submit Application
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
