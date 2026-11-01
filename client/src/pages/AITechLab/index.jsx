import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CpuChipIcon,
  EyeIcon,
  ChatBubbleBottomCenterTextIcon,
  ShieldCheckIcon,
  CircleStackIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import PageHeader from '../../components/common/PageHeader';

const focusAreas = [
  {
    title: 'Generative Intelligence & LLMs',
    description: 'Fine-tuning sovereign language models on specialized scientific literature for accelerated discovery.',
    icon: <SparklesIcon className="w-6 h-6 text-gold" />,
  },
  {
    title: 'Computer Vision & Medical Imaging',
    description: 'Self-supervised diagnostic models for low-resource radiographic and histological analysis.',
    icon: <EyeIcon className="w-6 h-6 text-gold" />,
  },
  {
    title: 'Edge AI & Embedded Computing',
    description: 'Ultra-low-power neuromorphic inference for environmental sensor networks and field genomics.',
    icon: <CpuChipIcon className="w-6 h-6 text-gold" />,
  },
  {
    title: 'Multilingual NLP & Speech',
    description: 'Preserving and synthesizing low-resource regional dialects and scholarly translation engines.',
    icon: <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-gold" />,
  },
  {
    title: 'AI Alignment & Algorithmic Ethics',
    description: 'Auditing bias, hallucinatory drifts, and provenance in automated scientific reasoning systems.',
    icon: <ShieldCheckIcon className="w-6 h-6 text-gold" />,
  },
  {
    title: 'Open Scientific Data Infrastructure',
    description: 'Curating open-access multimodal datasets adhering to FAIR (Findable, Accessible, Interoperable, Reusable) tenets.',
    icon: <CircleStackIcon className="w-6 h-6 text-gold" />,
  },
];

const labProjects = [
  {
    title: 'Project Asgard-Omni: Multimodal Scholarly Discovery Engine',
    area: 'Generative AI',
    status: 'Active Lab Prototype',
    desc: 'An open-weights retrieval-augmented intelligence tool designed to parse cross-disciplinary chemical and pharmacological papers.',
  },
  {
    title: 'BioSentry: Edge-Deployed Field Pathogen Classifier',
    area: 'Edge Computing',
    status: 'Field Testing',
    desc: 'Deploying quantised neural networks on low-cost microcontrollers for instantaneous crop blight classification.',
  },
  {
    title: 'VeritasAudit: Open-Source AI Factuality & Provenance Verifier',
    area: 'AI Ethics',
    status: 'In Review',
    desc: 'Automated citation tracing that evaluates synthetic papers for hallucinated references and data leakage.',
  },
];

export default function AITechLabPage() {
  return (
    <div>
      <Helmet>
        <title>AI & Emerging Tech Lab – ASGARD-IRI</title>
        <meta
          name="description"
          content="Explore ASGARD Artificial Intelligence & Emerging Tech Lab: pioneering generative models, edge machine learning, and ethical AI stewardship."
        />
      </Helmet>

      {/* Header */}
      <PageHeader
        overline="Frontier Laboratory"
        title="AI & Emerging Technology Lab"
        subtitle="Conducting foundational and applied computational research at the intersection of generative artificial intelligence, machine perception, and high-performance engineering."
      />

      <div className="max-w-[1240px] mx-auto px-5 sm:px-7 py-14 space-y-16">
        {/* Lab Overview */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-semibold text-gold-dark tracking-widest uppercase">
              Computational Stewardship
            </span>
            <h2 className="font-display text-3xl font-bold text-navy mt-1 mb-4">
              Building Open, Ethical, and Reproducible AI
            </h2>
            <p className="text-grey-700 text-sm leading-relaxed mb-4">
              The ASGARD AI & Emerging Tech Lab brings together computer scientists, statisticians, domain ethicists, and graduate fellows to solve high-dimensional scientific challenges. Unlike commercial labs driven solely by enterprise monetization, our work is dedicated to public-interest computing, open science, and sovereign data governance.
            </p>
            <p className="text-grey-700 text-sm leading-relaxed">
              We provide affiliated researchers access to high-performance GPU compute clusters, proprietary scientific benchmarks, and a supportive environment for interdisciplinary synthesis.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                to="/opportunities?category=fellowship"
                className="bg-navy text-white text-xs font-semibold px-6 py-3 rounded-lg hover:bg-gold hover:text-navy transition-colors inline-flex items-center gap-2"
              >
                Apply for AI Fellowship <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/contact"
                className="border border-grey-300 text-grey-800 text-xs font-semibold px-6 py-3 rounded-lg hover:border-navy hover:text-navy transition-colors"
              >
                Propose Research Collaboration
              </Link>
            </div>
          </div>

          <div className="bg-navy rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
            <h3 className="font-display font-bold text-xl text-gold mb-4">
              Lab Compute & Facilities
            </h3>
            <ul className="space-y-4 text-xs text-white/80">
              <li className="flex items-start gap-3">
                <CpuChipIcon className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Dedicated GPU Cluster</strong>
                  NVIDIA H100 and A100 nodes dedicated to distributed model fine-tuning and biomedical embedding generations.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CircleStackIcon className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Petabyte Sovereign Storage</strong>
                  Zero-latency access to pre-processed multimodal datasets for vision, language, and tabular scientific models.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheckIcon className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Reproducibility Sandbox</strong>
                  Automated containerized environments guaranteeing that every published weight and code repository executes flawlessly.
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Capabilities Grid */}
        <section>
          <div className="text-center max-w-narrow mx-auto mb-10">
            <span className="text-xs font-semibold text-gold-dark tracking-widest uppercase">
              Specialized Divisions
            </span>
            <h2 className="font-display text-3xl font-bold text-navy mt-1">
              Core Technical Focus Areas
            </h2>
            <p className="text-xs text-grey-600 mt-2">
              Our research pillars push the frontier of computational inquiry
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {focusAreas.map((area) => (
              <Card key={area.title} className="p-6 hover:border-gold transition-colors">
                <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center mb-4">
                  {area.icon}
                </div>
                <h3 className="font-display font-semibold text-base text-navy mb-2">
                  {area.title}
                </h3>
                <p className="text-xs text-grey-600 leading-relaxed">
                  {area.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Lab Projects Showcase */}
        <section className="bg-grey-50 -mx-6 px-6 py-12 rounded-2xl">
          <div className="max-w-content mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-navy">Flagship Lab Projects</h2>
                <p className="text-grey-600 text-xs mt-1">Demonstrators built inside ASGARD computational facilities</p>
              </div>
              <Link to="/research" className="text-xs font-semibold text-navy hover:text-gold">
                Browse Full Research Archive →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {labProjects.map((p) => (
                <Card key={p.title} featured className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[11px] font-semibold text-gold-dark tracking-wide uppercase">
                        {p.area}
                      </span>
                      <Badge label={p.status} variant="open" />
                    </div>
                    <h3 className="font-display font-semibold text-navy text-base mb-2">
                      {p.title}
                    </h3>
                    <p className="text-xs text-grey-600 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-grey-100 flex justify-between items-center text-xs">
                    <span className="text-grey-400">Status: Active</span>
                    <Link to="/contact" className="text-navy font-semibold hover:underline">
                      Inquire About Code →
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
