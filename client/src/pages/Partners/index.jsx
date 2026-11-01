import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  GlobeAltIcon,
  AcademicCapIcon,
  BuildingOffice2Icon,
  ArrowTopRightOnSquareIcon,
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import { getPublicPartners, getPartnerPortalData } from '../../services/content.service';

export default function PartnersPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'portal'
  const [partners, setPartners] = useState([]);
  const [portalData, setPortalData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'directory') {
      getPublicPartners()
        .then((res) => setPartners(res.data || []))
        .catch(() => setPartners([]))
        .finally(() => setLoading(false));
    } else {
      getPartnerPortalData()
        .then((res) => setPortalData(res.data || {}))
        .catch(() => setPortalData(null))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  return (
    <div>
      <Helmet>
        <title>Institutional Partners & Collaboration Portal – ASGARD-IRI</title>
        <meta
          name="description"
          content="Explore international academic institutions, research consortia, and industry partners affiliated with ASGARD-IRI."
        />
      </Helmet>

      {/* Header */}
      <PageHeader
        overline="Global Academic Alliances"
        title="Institutional Partners & Collaboration"
        subtitle="Fostering international research networks, joint laboratories, and co-sponsored symposia across 40+ countries."
      />

      <div className="max-w-[1240px] mx-auto px-5 sm:px-7 py-12">
        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-grey-200 pb-4 mb-8">
          <button
            onClick={() => setActiveTab('directory')}
            className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${
              activeTab === 'directory'
                ? 'border-navy text-navy'
                : 'border-transparent text-grey-500 hover:text-navy'
            }`}
          >
            Partner Directory ({partners.length || 3})
          </button>
          <button
            onClick={() => setActiveTab('portal')}
            className={`text-sm font-semibold pb-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'portal'
                ? 'border-gold text-navy font-bold'
                : 'border-transparent text-grey-500 hover:text-navy'
            }`}
          >
            <ShieldCheckIcon className="w-4 h-4 text-gold" />
            Partner Collaboration Portal
          </button>
        </div>

        {loading ? (
          <div className="py-16">
            <Loader />
          </div>
        ) : activeTab === 'directory' ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((p) => (
                <Card key={p.id} className="p-6 flex flex-col justify-between hover:shadow-card transition-shadow">
                  <div>
                    <div className="w-12 h-12 bg-navy/5 rounded-xl flex items-center justify-center text-navy mb-4">
                      {p.collaboration_type === 'academic' ? (
                        <AcademicCapIcon className="w-6 h-6 text-navy" />
                      ) : p.collaboration_type === 'research' ? (
                        <GlobeAltIcon className="w-6 h-6 text-gold" />
                      ) : (
                        <BuildingOffice2Icon className="w-6 h-6 text-navy" />
                      )}
                    </div>
                    <Badge label={p.collaboration_type?.toUpperCase()} variant="open" />
                    <h3 className="font-display font-bold text-navy text-lg mt-3 mb-2">
                      {p.organisation_name}
                    </h3>
                    <p className="text-grey-600 text-xs leading-relaxed">
                      Affiliated international partner collaborating on joint doctoral workshops, peer publication, and technological exchange.
                    </p>
                  </div>
                  {p.website_url && (
                    <div className="pt-4 border-t border-grey-100 mt-4">
                      <a
                        href={p.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-gold-dark hover:underline flex items-center gap-1"
                      >
                        <span>Visit Official Portal</span>
                        <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Partner Collaboration Portal (Blueprint 5.6) */
          <div className="space-y-8">
            <Card className="p-6 bg-gradient-to-r from-navy to-navy-dark text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center text-gold shrink-0">
                  <ShieldCheckIcon className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-white mb-1">
                    ASGARD Partner Collaboration Network
                  </h2>
                  <p className="text-white/80 text-xs max-w-2xl leading-relaxed">
                    Dedicated collaboration workspace providing verified partner institutions with shared research outputs, joint conference agendas, and reciprocal academic credential validation.
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Joint Research Outputs */}
              <Card className="p-6">
                <h3 className="font-display font-bold text-base text-navy mb-4 flex items-center gap-2">
                  <DocumentDuplicateIcon className="w-5 h-5 text-gold-dark" />
                  Active Co-Authored Publications
                </h3>
                <div className="space-y-3">
                  {portalData?.jointPublications?.length === 0 ? (
                    <p className="text-grey-400 text-xs">No joint papers loaded.</p>
                  ) : (
                    portalData?.jointPublications?.map((pub) => (
                      <div
                        key={pub.id}
                        className="p-4 rounded-xl bg-grey-50 border border-grey-200 text-xs"
                      >
                        <span className="text-[10px] text-grey-400 font-mono block mb-1">
                          {pub.journal_title || 'ASGARD Open Access'} · {pub.year || '2026'}
                        </span>
                        <h4 className="font-semibold text-navy mb-1">{pub.title}</h4>
                        <p className="text-grey-500 text-[11px] line-clamp-1">{pub.authors}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Collaborative Symposia */}
              <Card className="p-6">
                <h3 className="font-display font-bold text-base text-navy mb-4 flex items-center gap-2">
                  <CalendarDaysIcon className="w-5 h-5 text-gold-dark" />
                  Co-Sponsored Academic Summits
                </h3>
                <div className="space-y-3">
                  {portalData?.collaborativeConferences?.length === 0 ? (
                    <p className="text-grey-400 text-xs">No collaborative symposia scheduled.</p>
                  ) : (
                    portalData?.collaborativeConferences?.map((conf) => (
                      <div
                        key={conf.id}
                        className="p-4 rounded-xl bg-grey-50 border border-grey-200 text-xs"
                      >
                        <span className="text-[10px] text-gold-dark font-semibold uppercase block mb-1">
                          Hybrid / International Summit
                        </span>
                        <h4 className="font-semibold text-navy mb-1">{conf.title}</h4>
                        <p className="text-grey-500 text-[11px]">
                          Dates: {conf.start_date ? new Date(conf.start_date).toLocaleDateString() : 'TBA'} · Venue: {conf.venue}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
