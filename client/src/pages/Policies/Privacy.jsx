import { Helmet } from 'react-helmet-async';
import Card from '../../components/common/Card';

export default function PrivacyPolicyPage() {
  return (
    <div>
      <Helmet>
        <title>Privacy Policy – ASGARD-IRI</title>
        <meta name="description" content="Official privacy policy and data governance practices of ASGARD International Foundation." />
      </Helmet>

      <div className="bg-navy py-14 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gold" />
        <div className="max-w-content mx-auto px-6 text-white">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-2">Legal & Governance</p>
          <h1 className="font-display text-4xl font-bold">Privacy Policy</h1>
          <p className="text-white/60 text-sm mt-2">Last updated: October 2025</p>
        </div>
      </div>

      <div className="max-w-narrow mx-auto px-6 py-14">
        <Card className="p-8 prose prose-navy max-w-none text-xs text-grey-700 leading-relaxed space-y-6">
          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">1. Institutional Commitment to Privacy</h2>
            <p>
              The ASGARD International Foundation for Research and Innovation (&quot;ASGARD-IRI&quot;, &quot;we&quot;, &quot;us&quot;) respects the confidentiality of personal data entrusted to us by researchers, authors, conference participants, and educational fellows. We strictly adhere to GDPR principles and international data privacy norms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">2. Information We Collect</h2>
            <p>
              We collect user-provided details including full names, institutional email addresses, affiliations, research designations, ORCID identifiers, and manuscript submission records. When submitting applications or resumes, uploaded documents are encrypted and accessible only by authorized evaluators.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">3. Use of Personal Data</h2>
            <p>
              Your information is exclusively utilized to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Process author submissions and peer evaluations</li>
              <li>Coordinate conference registrations and credential verifications</li>
              <li>Maintain the public researcher directory (only with explicit consent)</li>
              <li>Communicate administrative updates regarding academy cohorts and grants</li>
            </ul>
            <p>We never sell, rent, or trade personal data to third-party advertising brokers.</p>
          </section>

          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">4. Data Retention & Security</h2>
            <p>
              Session cookies and authentication tokens are secured with httpOnly flags and industry-standard hashing (bcrypt with 12 salt rounds). User data is stored in redundant databases with strict access control lists.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">5. Contact Information</h2>
            <p>
              For data access, rectification, or deletion requests, please contact our Data Governance Officer at <a href="mailto:privacy@asgard-iri.org" className="text-navy font-semibold underline">privacy@asgard-iri.org</a>.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
