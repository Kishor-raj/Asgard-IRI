import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MagnifyingGlassIcon, AcademicCapIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getAreas, getProjects, getResearchers } from '../../services/research.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SkeletonCard from '../../components/common/SkeletonCard';
import PageHeader from '../../components/common/PageHeader';
import { thumb } from '../../utils/cloudinaryTransform';

export default function ResearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');

  const { data: areasData } = useFetch(getAreas);
  const areas = areasData?.data || [];

  const { data: projectsData, loading: loadingProjects } = useFetch(
    () => getProjects({ limit: 6 }),
    []
  );
  const projects = projectsData?.data || [];

  const { data: researchersData, loading: loadingResearchers } = useFetch(
    () => getResearchers({ search: searchTerm, area: selectedArea === 'all' ? '' : selectedArea, limit: 8 }),
    [searchTerm, selectedArea]
  );
  const researchers = researchersData?.data || [];

  return (
    <div>
      <Helmet>
        <title>Research – ASGARD-IRI</title>
        <meta name="description" content="Discover our interdisciplinary research areas, strategic projects, and global researcher network." />
      </Helmet>

      {/* Header */}
      <PageHeader
        overline="Pioneering Science & Technology"
        title="Research & Innovation Repository"
        subtitle="Advancing rigorous, ethical, and high-impact scholarship across artificial intelligence, biotechnology, environmental resilience, and public health."
      />

      <div className="max-w-[1240px] mx-auto px-5 sm:px-7 py-14 space-y-16">
        {/* Research Repository Callout Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gold/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-gold-dark uppercase tracking-wider block">
              Digital Knowledge Base
            </span>
            <h2 className="font-display text-2xl font-bold text-navy">
              Open Research Outputs Repository
            </h2>
            <p className="text-grey-600 text-xs sm:text-sm max-w-xl">
              Search and download indexed manuscripts, peer-reviewed journal articles, conference proceedings, and computational datasets published across ASGARD labs.
            </p>
          </div>
          <Link
            to="/research/repository"
            className="bg-navy text-white text-xs font-semibold px-6 py-3 rounded-xl hover:bg-gold hover:text-navy transition-colors shrink-0 shadow-sm"
          >
            Explore Repository →
          </Link>
        </div>

        {/* Research Areas Grid */}
        <section>
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-navy">Research Focus Areas</h2>
            <p className="text-grey-600 mt-2 text-sm">Key disciplinary clusters driving our foundational inquiries</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {areas.map((a) => (
              <Card key={a.id} className="p-6 hover:border-gold transition-colors">
                <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center text-navy mb-4">
                  <AcademicCapIcon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-lg text-navy mb-2">{a.name}</h3>
                <p className="text-xs text-grey-600 leading-relaxed">{a.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Projects */}
        <section className="bg-[#f7f3ea]/70 border border-[rgba(201,162,39,0.15)] p-6 sm:p-10 rounded-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy">Active Projects</h2>
              <p className="text-grey-600 text-xs mt-1">Funded research initiatives currently underway</p>
            </div>
            <Link to="/opportunities?category=ra" className="text-xs font-semibold text-navy hover:text-gold flex items-center gap-1">
              Apply as Research Assistant →
            </Link>
          </div>

          {loadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <p className="text-sm text-grey-400 text-center py-8">Active project listings will be published shortly.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects.map((p) => (
                <Card key={p.id} featured className="p-6 flex flex-col justify-between">
                  <div>
                    <Badge label={p.status?.toUpperCase()} variant="open" className="mb-3" />
                    <h3 className="font-display font-semibold text-navy text-base mb-2 line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="text-xs text-grey-600 line-clamp-3 mb-4">{p.abstract}</p>
                  </div>
                  <div className="text-xs text-grey-400 pt-3 border-t border-grey-100 flex justify-between items-center">
                    <span>PI: {p.pi_name || 'Foundation Lab'}</span>
                    <Link to={`/research/projects/${p.slug || p.id}`} className="text-navy font-semibold hover:underline">
                      Learn More
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Researcher Directory */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy">Researcher Directory</h2>
              <p className="text-grey-600 text-xs mt-1">Connect and collaborate with our affiliated faculty and fellows</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 text-grey-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search researchers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-grey-200 rounded-lg text-xs bg-grey-50 focus:outline-none focus:border-navy w-full sm:w-60"
                />
              </div>
            </div>
          </div>

          {loadingResearchers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : researchers.length === 0 ? (
            <div className="text-center py-12 text-grey-400 text-sm">
              No researchers match your search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {researchers.map((r) => (
                <Card key={r.id} className="p-5 flex flex-col justify-between text-center hover:shadow-card-md">
                  <div>
                    <div className="w-20 h-20 bg-navy/10 rounded-full mx-auto mb-4 flex items-center justify-center font-display font-bold text-navy text-xl">
                      {r.profile_photo ? (
                        <img src={thumb(r.profile_photo, 200)} alt={r.full_name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        r.full_name?.charAt(0) || 'R'
                      )}
                    </div>
                    <h3 className="font-display font-semibold text-navy text-base">{r.full_name}</h3>
                    <p className="text-xs text-gold-dark font-medium mt-0.5">{r.designation || 'Researcher'}</p>
                    <p className="text-xs text-grey-600 mt-1 line-clamp-1">{r.affiliation || 'ASGARD Foundation'}</p>
                    {r.research_interests && (
                      <div className="mt-3 flex flex-wrap gap-1 justify-center">
                        {r.research_interests.split(',').slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="bg-grey-100 text-grey-600 text-[10px] px-2 py-0.5 rounded-full">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="pt-4 mt-4 border-t border-grey-100">
                    <Link
                      to={`/researchers/${r.id}`}
                      className="text-xs font-semibold text-navy hover:text-gold transition-colors inline-flex items-center gap-1"
                    >
                      View Profile <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
