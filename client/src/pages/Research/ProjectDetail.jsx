import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  AcademicCapIcon,
  CalendarDaysIcon,
  UserIcon,
  CurrencyDollarIcon,
  TagIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getProjectBySlug } from '../../services/research.service';
import Loader from '../../components/common/Loader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { data, loading, error } = useFetch(() => getProjectBySlug(slug), [slug]);
  const project = data?.data;

  if (loading) return <Loader fullPage />;
  if (error || !project) {
    return (
      <div className="max-w-content mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold font-display text-navy mb-2">Project Not Found</h2>
        <p className="text-grey-600 mb-6">The requested research project could not be located.</p>
        <Link to="/research" className="text-navy font-semibold hover:underline">
          ← Back to Research Overview
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>{project.title} – ASGARD-IRI Research</title>
        <meta name="description" content={project.abstract?.slice(0, 160)} />
      </Helmet>

      {/* Header */}
      <div className="bg-navy py-16 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gold" />
        <div className="max-w-content mx-auto px-6">
          <Link
            to="/research"
            className="text-white/60 hover:text-gold text-xs inline-flex items-center gap-1.5 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" /> Back to Research Directory
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-gold text-xs font-semibold tracking-widest uppercase">
              {project.area_name || 'Frontier Science'}
            </span>
            <span className="text-white/40">•</span>
            <Badge
              label={project.status?.toUpperCase() || 'ACTIVE'}
              variant={project.status === 'completed' ? 'closed' : 'open'}
            />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white max-w-4xl">
            {project.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-content mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8">
              <h2 className="font-display text-xl font-bold text-navy mb-4">Executive Abstract</h2>
              <p className="text-grey-700 text-sm leading-relaxed whitespace-pre-line">
                {project.abstract}
              </p>
            </Card>

            {project.methodology && (
              <Card className="p-8">
                <h2 className="font-display text-xl font-bold text-navy mb-4">Methodology & Framework</h2>
                <p className="text-grey-700 text-sm leading-relaxed whitespace-pre-line">
                  {project.methodology}
                </p>
              </Card>
            )}

            {project.expected_outcomes && (
              <Card className="p-8">
                <h2 className="font-display text-xl font-bold text-navy mb-4">Target Deliverables & Milestones</h2>
                <p className="text-grey-700 text-sm leading-relaxed whitespace-pre-line">
                  {project.expected_outcomes}
                </p>
              </Card>
            )}
          </div>

          {/* Sidebar Metadata */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-display font-semibold text-lg text-navy mb-4 border-b border-grey-100 pb-3">
                Project Overview
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-grey-400 block mb-0.5">Principal Investigator (PI)</span>
                  <div className="font-semibold text-navy text-sm flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-gold" />
                    {project.pi_name ? (
                      <Link to={`/researchers/${project.pi_user_id}`} className="hover:underline">
                        {project.pi_name}
                      </Link>
                    ) : (
                      'ASGARD Research Directorate'
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-grey-400 block mb-0.5">Disciplinary Domain</span>
                  <div className="font-semibold text-navy text-sm flex items-center gap-1.5">
                    <AcademicCapIcon className="w-4 h-4 text-gold" />
                    {project.area_name || 'Interdisciplinary Innovation'}
                  </div>
                </div>

                <div>
                  <span className="text-grey-400 block mb-0.5">Timeline</span>
                  <div className="text-grey-700 flex items-center gap-1.5">
                    <CalendarDaysIcon className="w-4 h-4 text-grey-400" />
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : '2025'} –{' '}
                    {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Ongoing'}
                  </div>
                </div>

                {project.funding_agency && (
                  <div>
                    <span className="text-grey-400 block mb-0.5">Sponsoring / Funding Agency</span>
                    <div className="text-grey-700 flex items-center gap-1.5">
                      <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
                      {project.funding_agency}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-grey-100">
                <Link
                  to="/opportunities?category=ra"
                  className="w-full text-center block bg-navy text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-gold hover:text-navy transition-colors"
                >
                  Apply as Research Assistant
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
