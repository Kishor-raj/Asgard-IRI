import { Helmet } from 'react-helmet-async';
import Card from '../../components/common/Card';

export default function PeerReviewPage() {
  return (
    <div>
      <Helmet>
        <title>Peer Review Policy – ASGARD-IRI</title>
        <meta name="description" content="Double-blind peer review methodology, review stages, and reviewer guidelines at ASGARD-IRI." />
      </Helmet>

      <div className="bg-navy py-14 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gold" />
        <div className="max-w-content mx-auto px-6 text-white">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-2">Editorial Quality</p>
          <h1 className="font-display text-4xl font-bold">Peer Review Policy</h1>
          <p className="text-white/60 text-sm mt-2">Rigorous Double-Blind Evaluation</p>
        </div>
      </div>

      <div className="max-w-narrow mx-auto px-6 py-14">
        <Card className="p-8 prose prose-navy max-w-none text-xs text-grey-700 leading-relaxed space-y-6">
          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">1. Double-Blind Review Model</h2>
            <p>
              To eliminate bias related to institutional prestige, geographical location, gender, or nationality, ASGARD-IRI applies a strict double-blind peer review system across all affiliated journals, book series, and conference proceedings. The identities of both the authors and reviewers remain anonymized throughout the evaluation lifecycle.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">2. Review Stages & Timeline</h2>
            <ul className="list-decimal pl-5 space-y-1">
              <li><strong>Initial Editorial Screening:</strong> Plagiarism detection (Turnitin/iThenticate threshold &lt; 15%) and scope assessment (3–5 business days).</li>
              <li><strong>External Review:</strong> Assignment to minimum two independent subject matter referees (3–4 weeks).</li>
              <li><strong>Editorial Decision:</strong> Accept, Minor Revision, Major Revision, or Reject.</li>
              <li><strong>Revision & Re-evaluation:</strong> Authors address reviewer critique line-by-line prior to final acceptance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">3. Reviewer Expectations & Confidentiality</h2>
            <p>
              Reviewers must treat all submitted manuscripts as strictly confidential documents. Reviewers are prohibited from using unpublished data or findings in their own investigations.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
