import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  DocumentCheckIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { verifyCertificate } from '../../services/content.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const [uid, setUid] = useState(searchParams.get('uid') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const doVerify = async (targetUid) => {
    const trimmed = (targetUid || uid).trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await verifyCertificate(trimmed);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Certificate not found. Please verify the UID code.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const queryUid = searchParams.get('uid');
    if (queryUid) {
      setUid(queryUid);
      doVerify(queryUid);
    }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    doVerify(uid);
  };

  return (
    <div className="bg-grey-50 min-h-[75vh] py-16 px-4">
      <Helmet>
        <title>Credential & Certificate Verification – ASGARD-IRI</title>
        <meta
          name="description"
          content="Public registry verification for ASGARD-IRI certificates, conference speaker awards, and academy credentials."
        />
      </Helmet>

      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <DocumentCheckIcon className="w-8 h-8 text-navy" />
          </div>
          <h1 className="font-display text-3xl font-bold text-navy mb-2">
            Certificate & Credential Verification
          </h1>
          <p className="text-grey-600 text-sm max-w-md mx-auto">
            Validate the authentic issuance of ASGARD-IRI diplomas, conference speaker credentials, and academy completion records.
          </p>
        </div>

        {/* Search Input Box */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="Enter 36-character Certificate UID (e.g. 550e8400-...)"
              className="flex-1 border border-grey-200 rounded-lg px-4 py-2.5 text-xs bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy font-mono"
              required
            />
            <Button type="submit" variant="primary" loading={loading}>
              Verify Credential
            </Button>
          </form>
          <p className="text-[11px] text-grey-400 mt-2">
            UID codes can be found on the physical or PDF certificate footer.
          </p>
        </Card>

        {/* Loading */}
        {loading && (
          <div className="py-8">
            <Loader />
          </div>
        )}

        {/* Error / Not Found State */}
        {error && !loading && (
          <Card className="p-6 border-red-200 bg-red-50/50 text-center space-y-2">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
              <ExclamationCircleIcon className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-red-700 text-base">
              Verification Failed
            </h3>
            <p className="text-xs text-red-600 max-w-md mx-auto">
              {error}
            </p>
            <p className="text-[11px] text-grey-500 pt-2">
              For manual validation assistance, please contact{' '}
              <a href="mailto:certificates@asgard-iri.org" className="underline font-medium text-navy">
                certificates@asgard-iri.org
              </a>.
            </p>
          </Card>
        )}

        {/* Verified Result Card */}
        {result && !loading && (
          <Card className="p-8 border-gold/50 shadow-card bg-white relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-navy via-gold to-navy" />

            <div className="flex items-center justify-between pb-4 border-b border-grey-100">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-6 h-6 text-success" />
                <span className="text-xs font-bold text-success uppercase tracking-wider">
                  Verified Authentic Credential
                </span>
              </div>
              <Badge label="OFFICIAL RECORD" variant="open" />
            </div>

            <div className="py-6 space-y-4">
              <div>
                <span className="text-[11px] text-grey-400 uppercase font-semibold block">
                  Recipient Scholar / Participant
                </span>
                <h2 className="font-display font-bold text-2xl text-navy">
                  {result.recipient_name || 'Academic Scholar'}
                </h2>
              </div>

              <div>
                <span className="text-[11px] text-grey-400 uppercase font-semibold block">
                  Awarded / Certified For
                </span>
                <p className="text-navy font-semibold text-base">
                  {result.issued_for_label}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-grey-50 p-4 rounded-xl border border-grey-200 text-xs">
                <div>
                  <span className="text-grey-400 block font-medium">Credential Category</span>
                  <span className="font-semibold text-navy capitalize">{result.issued_for_type}</span>
                </div>
                <div>
                  <span className="text-grey-400 block font-medium">Date of Issuance</span>
                  <span className="font-semibold text-navy">
                    {result.issued_date ? new Date(result.issued_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-grey-400 uppercase font-semibold block mb-0.5">
                  Unique Cryptographic Identifier (UID)
                </span>
                <span className="font-mono text-xs text-navy font-medium bg-grey-100 px-2 py-1 rounded block break-all">
                  {result.certificate_uid}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-grey-100 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-[11px] text-grey-500">
                Issued under the authority of ASGARD Institute of Research & Innovation.
              </span>
              {result.pdf_url && (
                <a
                  href={result.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 bg-navy text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gold hover:text-navy transition-colors shrink-0"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" /> Download Certificate PDF
                </a>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
