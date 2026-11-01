import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Card from '../../components/common/Card';
import PageHeader from '../../components/common/PageHeader';
import {
  GlobeAltIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  UserGroupIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const leadership = [
  {
    name: 'Prof. Dr. Elizabeth Vance',
    role: 'President & Executive Director',
    affiliation: 'Formerly Cambridge Centre for Science & Policy',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    bio: 'Pioneered international frameworks for cross-border research integrity and open-access infrastructure across Europe and Asia.',
  },
  {
    name: 'Dr. Rajesh Subramaniam',
    role: 'Vice President of Research & Innovation',
    affiliation: 'Ph.D., Indian Institute of Science',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    bio: 'Leads foundational initiatives in high-performance computing, quantum information, and automated synthesis.',
  },
  {
    name: 'Dr. Aris Thorne',
    role: 'Dean of Academic Programmes',
    affiliation: 'Doctor of Education, Oxford University',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    bio: 'Oversees FDPs, research methodology institutes, doctoral symposiums, and institutional curriculum accreditations.',
  },
  {
    name: 'Maria Elena Rostova',
    role: 'Director of Publications & Open Access',
    affiliation: 'International Scholarly Publishing Consortium',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    bio: 'Architect of ASGARD open monograph series and indexing integration across Scopus, Web of Science, and DOAJ.',
  },
];

const advisoryBoard = [
  {
    name: 'Prof. Henrik Lindqvist',
    title: 'Senior Fellow, Nordic Institute for Bioethics',
    country: 'Sweden',
  },
  {
    name: 'Dr. Keiko Tanaka',
    title: 'Director of Applied Intelligence Laboratory',
    country: 'Japan',
  },
  {
    name: 'Prof. David O. Adeleke',
    title: 'Chair of Global Health Informatics',
    country: 'Nigeria',
  },
  {
    name: 'Dr. Carlos Mendoza',
    title: 'Emeritus Professor of Computational Engineering',
    country: 'Spain',
  },
];

export default function AboutPage() {
  const { t } = useTranslation();
  return (
    <div>
      <Helmet>
        <title>{t('about.title', 'About ASGARD-IRI')} – ASGARD-IRI</title>
        <meta
          name="description"
          content="Learn about ASGARD International Foundation for Research and Innovation, our charter, executive leadership, and global advisory board."
        />
      </Helmet>

      {/* Header */}
      <PageHeader
        overline="Institutional Charter & Governance"
        title={t('about.title', 'About ASGARD-IRI')}
        subtitle={t('about.subtitle', 'An autonomous, non-partisan international foundation establishing institutional credibility through rigorous research, open publishing, and global scholarship.')}
      />

      <div className="max-w-[1240px] mx-auto px-5 sm:px-7 py-10 sm:py-14 lg:py-20 space-y-12 sm:space-y-16 lg:space-y-20">
        {/* Foundation Overview */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div>
            <span className="text-xs font-semibold text-gold-dark tracking-widest uppercase">
              Our Genesis
            </span>
            <h2 className="font-display text-3xl font-bold text-navy mt-2 mb-6">
              Advancing Global Knowledge Without Borders
            </h2>
            <div className="space-y-4 text-grey-700 text-sm leading-relaxed">
              <p>
                The <strong>ASGARD International Foundation for Research and Innovation (ASGARD-IRI)</strong> was chartered to bridge the gap between academic exploration and real-world societal impact. In an era of rapid technological transition, scientific advancement requires principled governance, unhindered peer access, and cross-border collaboration.
              </p>
              <p>
                We serve universities, independent research scholars, doctoral candidates, and innovative laboratories worldwide. By combining open scholarly journals, monograph publishing, international conferences, and applied technology laboratories under one roof, ASGARD-IRI creates an uncompromised ecosystem for scientific discovery.
              </p>
              <p>
                All our proceedings, journal articles, and academic monographs undergo strict double-blind peer review and maintain compliance with COPE (Committee on Publication Ethics) international guidelines.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-6 !bg-navy text-white border-navy flex flex-col justify-between shadow-card">
              <GlobeAltIcon className="w-8 h-8 text-gold mb-4" />
              <div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">Global Reach</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Collaborative research partnerships spanning over 40 countries and 120 institutions.
                </p>
              </div>
            </Card>

            <Card className="p-6 !bg-gold/10 border-gold/30 flex flex-col justify-between shadow-card">
              <ShieldCheckIcon className="w-8 h-8 text-gold-dark mb-4" />
              <div>
                <h3 className="font-display font-semibold text-lg text-navy mb-2">Ethical Rigor</h3>
                <p className="text-xs text-grey-700 leading-relaxed">
                  Unbending commitment to reproducible science, open access, and ethical AI standards.
                </p>
              </div>
            </Card>

            <Card className="p-6 !bg-grey-50 border-grey-200 flex flex-col justify-between shadow-card">
              <LightBulbIcon className="w-8 h-8 text-gold-dark mb-4" />
              <div>
                <h3 className="font-display font-semibold text-lg text-navy mb-2">Applied Tech</h3>
                <p className="text-xs text-grey-700 leading-relaxed">
                  Incubating deep-tech prototypes and transferring laboratory research into societal solutions.
                </p>
              </div>
            </Card>

            <Card className="p-6 !bg-navy-light text-white border-navy-light flex flex-col justify-between shadow-card">
              <UserGroupIcon className="w-8 h-8 text-gold mb-4" />
              <div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">Academic Mentorship</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Training the next generation of doctoral scholars and early-career faculty.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="bg-[#f7f3ea]/70 border border-[rgba(201,162,39,0.15)] p-6 sm:p-10 rounded-2xl">
          <div className="max-w-content mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 bg-white border-l-4 border-l-gold">
              <div className="flex items-center gap-3 mb-4">
                <SparklesIcon className="w-6 h-6 text-gold" />
                <h3 className="font-display font-bold text-2xl text-navy">Our Vision</h3>
              </div>
              <p className="text-sm text-grey-700 leading-relaxed">
                To be the world’s preeminent independent foundation for democratic scholarship, ethical scientific stewardship, and transformative technological innovation that elevates humanity.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-grey-600">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  Democratize access to peer-reviewed science worldwide
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  Establish unbiased academic evaluation benchmarks
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  Cultivate cross-cultural interdisciplinary breakthroughs
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-white border-l-4 border-l-navy">
              <div className="flex items-center gap-3 mb-4">
                <LightBulbIcon className="w-6 h-6 text-navy" />
                <h3 className="font-display font-bold text-2xl text-navy">Our Mission</h3>
              </div>
              <p className="text-sm text-grey-700 leading-relaxed">
                To empower researchers, academics, and innovators through open knowledge infrastructures, prestigious international conferences, high-caliber publications, and industry-aligned doctoral training.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-grey-600">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  Publish rigorous open-access journals and monographs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  Host global research symposia with indexation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  Incubate ethical AI and biotechnology research initiatives
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Executive Leadership */}
        <section>
          <div className="text-center max-w-narrow mx-auto mb-12">
            <span className="text-xs font-semibold text-gold-dark tracking-widest uppercase">
              Governing Council
            </span>
            <h2 className="font-display text-3xl font-bold text-navy mt-1">
              Executive Leadership
            </h2>
            <p className="text-xs text-grey-600 mt-2">
              Distinguished scholars and administrators guiding the foundation&apos;s strategic direction
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((person) => (
              <Card key={person.name} className="overflow-hidden flex flex-col justify-between">
                <div>
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="w-full h-48 object-cover object-top"
                  />
                  <div className="p-5">
                    <h3 className="font-display font-semibold text-base text-navy">{person.name}</h3>
                    <p className="text-xs text-gold-dark font-medium mt-0.5">{person.role}</p>
                    <p className="text-[11px] text-grey-400 mt-1">{person.affiliation}</p>
                    <p className="text-xs text-grey-600 mt-3 leading-relaxed">{person.bio}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Global Advisory Board */}
        <section className="bg-[#03060f] text-white p-6 sm:p-10 rounded-2xl border border-[rgba(201,162,39,0.22)] shadow-xl">
          <div className="max-w-content mx-auto">
            <div className="text-center max-w-narrow mx-auto mb-10">
              <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-1">
                International Perspective
              </p>
              <h2 className="font-display text-3xl font-bold text-white">
                Global Advisory Board
              </h2>
              <p className="text-white/60 text-xs mt-2">
                Providing external oversight and domain expertise across international research networks
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {advisoryBoard.map((advisor) => (
                <div
                  key={advisor.name}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-gold/40 transition-colors"
                >
                  <div className="text-gold text-xs font-semibold uppercase tracking-wider mb-1">
                    {advisor.country}
                  </div>
                  <h4 className="font-display font-semibold text-white text-base">
                    {advisor.name}
                  </h4>
                  <p className="text-xs text-white/60 mt-1">{advisor.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
