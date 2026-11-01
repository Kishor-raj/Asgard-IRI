-- 04_phase3_sample_data.sql

-- 1. Research Outputs
INSERT INTO research_outputs (title, slug, type, authors_text, abstract, url, year) VALUES
  (
    'Self-Supervised Geometric Deep Learning for Protein-Ligand Binding Affinity',
    'self-supervised-geometric-dl-protein-binding',
    'journal_article',
    'Dr. Aris Thorne, Dr. Elena Rostova, Marcus Vance',
    'We introduce SE(3)-equivariant graph neural architectures capable of predicting stereospecific binding affinities across uncharacterized macrocyclic complexes without experimental crystallographic coordinates.',
    'https://doi.org/10.1038/s41586-025-08122-x',
    2025
  ),
  (
    'Fault-Tolerant Surface Codes under Asymmetric Correlated Pauli Dephasing',
    'fault-tolerant-surface-codes-asymmetric-dephasing',
    'conference_paper',
    'Dr. Maya Lin, Dr. Sarah Jenkins',
    'Comprehensive analytical formulation and numerical Monte Carlo benchmarking demonstrating a 1.82% threshold under biased dephasing noise on planar transmon lattices.',
    'https://doi.org/10.1103/PhysRevLett.134.020501',
    2026
  ),
  (
    'Decentralized Autonomous Verification Protocols for Open Science Repositories',
    'decentralized-verification-protocols-open-science',
    'technical_report',
    'Dr. Elena Rostova, Devraj Patel',
    'An enterprise consensus mechanism ensuring immutable provenance, reproducible computational notebooks, and cryptographic peer-review attestation.',
    'https://asgard-iri.org/reports/tr-2025-09.pdf',
    2025
  ),
  (
    'Ethical Alignment Frameworks for Autonomous Scientific Agents in High-Consequence Synthesis',
    'ethical-alignment-frameworks-scientific-agents',
    'monograph',
    'Prof. Alistair Sterling, Dr. Maya Lin',
    'A rigorous treatise establishing multi-objective safety boundaries for AI copilots orchestrating automated wet-lab robotic synthesis of novel biological compounds.',
    'https://doi.org/10.1093/oxfordhb/978019888.001.0001',
    2024
  ),
  (
    'Open-Benchmark: Multilingual Corpus for Dravidian and Indo-Aryan Low-Resource Machine Translation',
    'multilingual-corpus-low-resource-translation',
    'dataset',
    'Devraj Patel, Dr. Aris Thorne',
    'Over 14 million token-aligned parallel sentences spanning 8 under-represented linguistic families with morphological annotations and gold-standard BLEU evaluation sets.',
    'https://huggingface.co/datasets/asgard-iri/indic-benchmark',
    2024
  )
ON CONFLICT (slug) DO NOTHING;

-- 2. Innovation Hub Programs
INSERT INTO innovation_programs (type, title, slug, description, start_date, end_date, is_active) VALUES
  (
    'hackathon',
    'Global AI for Science Hackathon 2026',
    'global-ai-science-hackathon-2026',
    '48-hour global sprint tackling frontier challenges in generative molecular design, climate physics emulators, and autonomous materials discovery with $50,000 in compute grants.',
    '2026-11-20',
    '2026-11-22',
    true
  ),
  (
    'incubation',
    'DeepTech & Quantum Incubation Cohort IV',
    'deeptech-quantum-incubation-cohort-iv',
    '6-month intensive incubation accelerator for doctoral spin-offs and pre-seed scientific ventures. Includes access to high-performance GPU clusters, IP legal counsel, and seed angel networks.',
    '2027-01-10',
    '2027-07-10',
    true
  ),
  (
    'challenge',
    'Autonomous Robotics & Edge Perception Grand Challenge',
    'autonomous-robotics-edge-challenge',
    'Competitive design challenge targeting real-time vision-language-action (VLA) models deployed on sub-15W neuromorphic compute architectures.',
    '2026-12-01',
    '2027-02-28',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- 3. Mentors Directory
INSERT INTO mentors (full_name, designation, organisation, domain_tags, bio, is_active) VALUES
  (
    'Dr. Sophia Henderson',
    'Chief AI Scientist',
    'Apex BioFoundry & Cambridge Research Fellow',
    'Generative Chemistry, Graph Neural Networks, Structural Biology',
    'Pioneered foundation models for de novo antibody optimization with over 45 high-impact Nature and Science publications.',
    true
  ),
  (
    'Vikramaditya Rao',
    'Founding Partner',
    'Frontier Ventures Singapore',
    'Venture Incubation, Tech Commercialization, DeepTech IP',
    'Ex-founder with two successful scientific hardware exits; mentors scientific founders transitioning from university labs to scalable enterprises.',
    true
  ),
  (
    'Prof. Nathan Chen',
    'Chair of Quantum Information',
    'Institute for Advanced Quantum Technologies',
    'Quantum Cryptography, Topological Qubits, Hardware Systems',
    'Senior IEEE Fellow leading international consortia in fault-tolerant cryogenic computing and hybrid quantum-classical algorithms.',
    true
  ),
  (
    'Dr. Amara Okafor',
    'Principal Research Director',
    'Global Health Informatics Institute',
    'Epidemiological Modeling, Federated Learning, Bioethics',
    'World Health Organization advisor on ethical surveillance architectures and distributed hospital network data federations.',
    true
  )
ON CONFLICT DO NOTHING;
