import { Helmet } from 'react-helmet-async';
import Card from '../../components/common/Card';

export default function OpenAccessPage() {
  return (
    <div>
      <Helmet>
        <title>Open Access Statement – ASGARD-IRI</title>
        <meta name="description" content="Open Access mandate, CC-BY licensing, self-archiving, and repository access at ASGARD-IRI." />
      </Helmet>

      <div className="bg-navy py-14 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gold" />
        <div className="max-w-content mx-auto px-6 text-white">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-2">Knowledge Dissemination</p>
          <h1 className="font-display text-4xl font-bold">Open Access Statement</h1>
          <p className="text-white/60 text-sm mt-2">Budapest Open Access Initiative (BOAI) Compliant</p>
        </div>
      </div>

      <div className="max-w-narrow mx-auto px-6 py-14">
        <Card className="p-8 prose prose-navy max-w-none text-xs text-grey-700 leading-relaxed space-y-6">
          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">1. Open Access Philosophy</h2>
            <p>
              ASGARD-IRI is steadfastly committed to universal open access. We believe scientific inquiry financed by institutions or public bodies must be immediately and permanently free for all to read, download, copy, distribute, print, and link without paywalls or subscription barriers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">2. Licensing: Creative Commons CC-BY 4.0</h2>
            <p>
              Articles published across ASGARD-affiliated open access journals and monographs are distributed under the terms of the Creative Commons Attribution 4.0 International License (CC BY 4.0). Authors retain copyright, granting the foundation a non-exclusive license to publish.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold font-display text-navy mb-2">3. Repository Self-Archiving & Green Open Access</h2>
            <p>
              Authors are permitted and encouraged to deposit pre-print and post-print versions of their manuscripts in institutional or subject-based repositories (e.g. arXiv, bioRxiv, university repositories) with appropriate citation credit.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
