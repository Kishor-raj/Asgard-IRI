import { Helmet } from 'react-helmet-async';
import Card from '../../components/common/Card';

export default function RefundPage() {
  return (
    <div>
      <Helmet>
        <title>Refund & Cancellation Policy – ASGARD-IRI</title>
        <meta name="description" content="Policies governing conference registration fees, Academy programme enrollments, and refund claims." />
      </Helmet>

      <div className="bg-navy py-14 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gold" />
        <div className="max-w-content mx-auto px-6 text-white">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-2">Participant Terms</p>
          <h1 className="font-display text-4xl font-bold">Refund & Cancellation Policy</h1>
          <p className="text-white/60 text-sm mt-2">Effective: October 2025</p>
        </div>
      </div>

      <div className="max-w-narrow mx-auto px-6 py-14">
        <Card className="p-8 prose prose-navy max-w-none text-xs text-grey-700 leading-relaxed space-y-6">
          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">1. Conference Registration Cancellations</h2>
            <p>
              Conference registrations canceled at least 30 days prior to the symposium start date are eligible for an 80% refund (20% retained for administrative and bank transaction processing). Cancellations received between 15 and 29 days prior are eligible for a 50% refund. No refunds are granted within 14 days of the event, though attendee substitution is welcomed at zero extra cost.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">2. ASGARD Academy Course Registrations</h2>
            <p>
              Enrollments for executive FDPs or certification masterclasses may be canceled up to 7 calendar days before course commencement for a full credit note or 90% monetary refund.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">3. Processing Protocol</h2>
            <p>
              Approved refunds are disbursed to the original mode of payment within 7–10 business days. For refund requests, submit your registration UID and invoice to <a href="mailto:finance@asgard-iri.org" className="text-navy font-semibold underline">finance@asgard-iri.org</a>.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
