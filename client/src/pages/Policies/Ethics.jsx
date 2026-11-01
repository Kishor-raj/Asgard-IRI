import { Helmet } from 'react-helmet-async';
import Card from '../../components/common/Card';

export default function EthicsPage() {
  return (
    <div>
      <Helmet>
        <title>Publication & Research Ethics – ASGARD-IRI</title>
        <meta name="description" content="Ethical guidelines, COPE compliance, authorship standards, and research misconduct policies at ASGARD-IRI." />
      </Helmet>

      <div className="bg-navy py-14 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gold" />
        <div className="max-w-content mx-auto px-6 text-white">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-2">Academic Standards</p>
          <h1 className="font-display text-4xl font-bold">Research & Publication Ethics</h1>
          <p className="text-white/60 text-sm mt-2">COPE Core Practices Compliance</p>
        </div>
      </div>

      <div className="max-w-narrow mx-auto px-6 py-14">
        <Card className="p-8 prose prose-navy max-w-none text-xs text-grey-700 leading-relaxed space-y-6">
          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">1. Committee on Publication Ethics (COPE) Standards</h2>
            <p>
              ASGARD-IRI strictly aligns its publishing workflows, editorial boards, and peer reviewers with the Committee on Publication Ethics (COPE) Code of Conduct. We maintain zero tolerance for falsification, fabrication, redundant publication, and unauthorized authorship attribution.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">2. Authorship & Contributorship</h2>
            <p>
              Authorship credit must be grounded in substantial contributions to conception, design, acquisition of empirical data, or analysis. All designated co-authors must approve the final version of the manuscript and consent to its submission. Ghost authorship and gift authorship are strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">3. Conflict of Interest Disclosure</h2>
            <p>
              Authors, editors, and reviewers must disclose any commercial, financial, or institutional associations that could influence or bias their scholarly judgment.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">4. AI-Generated Content & Tool Disclosure</h2>
            <p>
              The use of Generative AI tools (LLMs, code synthesizers) must be transparently disclosed in the methodology or acknowledgments section. AI systems cannot be credited as authors or co-authors.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
