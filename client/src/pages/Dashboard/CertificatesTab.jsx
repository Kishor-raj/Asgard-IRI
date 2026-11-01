import { useEffect, useState } from 'react';
import { ArrowDownTrayIcon, CheckBadgeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { getMyCertificates } from '../../services/content.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';

export default function CertificatesTab() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCertificates()
      .then((res) => {
        setCertificates(res?.data || []);
      })
      .catch((err) => {
        console.error('Failed to load certificates', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-12">
        <Loader />
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-grey-100 flex justify-between items-center">
        <div>
          <h3 className="font-display font-semibold text-navy text-base">Issued Credentials & Certificates</h3>
          <p className="text-[11px] text-grey-500">Official cryptographic credentials verifiable by university boards and international accreditation bodies</p>
        </div>
        <a
          href="/verify"
          className="text-xs text-navy font-semibold hover:underline flex items-center gap-1"
        >
          <ShieldCheckIcon className="w-4 h-4 text-gold" /> Verify Any UID
        </a>
      </div>

      {certificates.length === 0 ? (
        <div className="p-12 text-center text-xs text-grey-400">
          No certificates issued for your account yet. Certificates are issued upon completing academy programmes or presenting at ASGARD conferences.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Event / Awarded For</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Certificate UID</th>
                <th className="py-3 px-4">Issued Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-100">
              {certificates.map((c) => (
                <tr key={c.id} className="hover:bg-grey-50/50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-navy flex items-center gap-1.5">
                      <CheckBadgeIcon className="w-4 h-4 text-gold shrink-0" />
                      {c.issued_for_label}
                    </div>
                  </td>
                  <td className="py-3 px-4 capitalize">
                    <span className="bg-navy/5 text-navy px-2 py-0.5 rounded font-medium">
                      {c.issued_for_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-grey-600">
                    <a
                      href={`/verify?uid=${c.certificate_uid}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-gold hover:underline"
                    >
                      {c.certificate_uid}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-grey-500">
                    {c.issued_date ? new Date(c.issued_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge label="AUTHENTIC" variant="open" />
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <a
                      href={`/verify?uid=${c.certificate_uid}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-navy hover:text-gold font-semibold"
                    >
                      Verify
                    </a>
                    {c.pdf_url && (
                      <a
                        href={c.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-gold-dark hover:text-navy font-semibold ml-2"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" /> PDF
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
