import { Helmet } from 'react-helmet-async';
import Card from '../../components/common/Card';

export default function TermsPage() {
  return (
    <div>
      <Helmet>
        <title>Terms of Use – ASGARD-IRI</title>
        <meta name="description" content="Terms of use governing participation in ASGARD-IRI digital repositories, conferences, and publications." />
      </Helmet>

      <div className="bg-navy py-14 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gold" />
        <div className="max-w-content mx-auto px-6 text-white">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-2">Legal & Governance</p>
          <h1 className="font-display text-4xl font-bold">Terms of Use</h1>
          <p className="text-white/60 text-sm mt-2">Effective: October 2025</p>
        </div>
      </div>

      <div className="max-w-narrow mx-auto px-6 py-14">
        <Card className="p-8 prose prose-navy max-w-none text-xs text-grey-700 leading-relaxed space-y-6">
          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing the ASGARD International Foundation for Research and Innovation website, platforms, and services, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Use and our Code of Academic Conduct.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">2. Academic Integrity & Conduct</h2>
            <p>
              Users registering as researchers, authors, or reviewers affirm that all submitted biographical data, academic affiliations, and research outputs are authentic. Plagiarism, fabricated experimental data, or submission of predatory works will lead to immediate account termination and reporting to affiliated institutions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">3. Intellectual Property Rights</h2>
            <p>
              Unless otherwise specified under Creative Commons licenses (such as CC-BY 4.0 for open-access articles), all website materials, brand assets, logos, and courseware are the intellectual property of ASGARD International Foundation.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">4. Disclaimer & Limitations of Liability</h2>
            <p>
              ASGARD-IRI publishes research findings as submitted and peer-reviewed by independent scholars. The opinions expressed in publications and conferences are those of the respective authors and do not necessarily represent the official views of the foundation.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
