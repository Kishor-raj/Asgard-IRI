import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  UsersIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  PlusCircleIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  DocumentTextIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import {
  getAdminStats,
  getReportsSummary,
  exportApplicationsCSV,
  exportAcademyRegistrationsCSV,
  exportInnovationApplicationsCSV,
} from '../../services/admin.service';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export default function AdminDashboardPage() {
  const { data: statsData, loading: loadingStats } = useFetch(getAdminStats);
  const { data: reportsData, loading: loadingReports } = useFetch(getReportsSummary);

  const stats = statsData?.data || {
    pendingUsersCount: 0,
    openOpportunitiesCount: 0,
    newEnquiriesCount: 0,
    totalResearchersCount: 0,
  };

  const reports = reportsData?.data || {
    users: { total: 0, pending: 0, active: 0 },
    applications: { total: 0, selected: 0 },
    academy: { registrations: 0, certificatesIssued: 0 },
    research: { outputs: 0 },
    conferences: { count: 0, submissions: 0 },
    innovation: { applications: 0, activePrograms: 0 },
  };

  const statCards = [
    {
      label: 'Pending User Approvals',
      value: stats.pendingUsersCount,
      icon: <UsersIcon className="w-6 h-6 text-amber-600" />,
      color: 'bg-amber-50 border-amber-200 text-amber-900',
      link: '/admin/users',
      action: 'Review Pending Users',
    },
    {
      label: 'Open Opportunities',
      value: stats.openOpportunitiesCount,
      icon: <BriefcaseIcon className="w-6 h-6 text-navy" />,
      color: 'bg-navy/5 border-navy/20 text-navy',
      link: '/admin/opportunities',
      action: 'Manage Listings',
    },
    {
      label: 'New Enquiries',
      value: stats.newEnquiriesCount,
      icon: <EnvelopeIcon className="w-6 h-6 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      link: '/admin/applications',
      action: 'View Applications',
    },
    {
      label: 'Affiliated Researchers',
      value: stats.totalResearchersCount,
      icon: <AcademicCapIcon className="w-6 h-6 text-gold-dark" />,
      color: 'bg-gold/10 border-gold/30 text-navy',
      link: '/admin/research',
      action: 'Manage Research',
    },
  ];

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Admin Dashboard – ASGARD-IRI</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Executive Administration</h1>
          <p className="text-xs text-grey-500 mt-1">
            Real-time operations, account approvals, and institutional data orchestration
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/opportunities"
            className="inline-flex items-center gap-1.5 bg-navy text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gold hover:text-navy transition-colors"
          >
            <PlusCircleIcon className="w-4 h-4" /> New Opportunity
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      {loadingStats ? (
        <div className="py-12">
          <Loader />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`p-6 rounded-xl border flex flex-col justify-between ${card.color}`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">{card.label}</span>
                  {card.icon}
                </div>
                <div className="font-display text-3xl font-bold tracking-tight mb-4">
                  {card.value}
                </div>
              </div>
              <Link
                to={card.link}
                className="text-xs font-semibold flex items-center gap-1 hover:underline pt-2 border-t border-black/5"
              >
                {card.action} <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Institutional Analytics & Reports Summary (Phase 3) */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-grey-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center text-navy">
              <ChartBarIcon className="w-6 h-6 text-gold-dark" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-navy">
                Institutional Reports & Analytical Breakdown
              </h2>
              <p className="text-xs text-grey-500">
                Aggregated system health metrics across scholarship, admissions, and innovation cohorts
              </p>
            </div>
          </div>

          {/* Quick Universal CSV Exports */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportApplicationsCSV()}
              className="text-xs flex items-center gap-1"
            >
              <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Opportunity CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportAcademyRegistrationsCSV()}
              className="text-xs flex items-center gap-1"
            >
              <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Academy CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportInnovationApplicationsCSV()}
              className="text-xs flex items-center gap-1"
            >
              <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Innovation CSV
            </Button>
          </div>
        </div>

        {loadingReports ? (
          <div className="py-8">
            <Loader />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-grey-50 p-4 rounded-xl border border-grey-200">
              <span className="text-[11px] font-semibold text-grey-500 uppercase tracking-wider block mb-1">
                Total Users
              </span>
              <div className="font-display text-2xl font-bold text-navy">
                {reports.users.total}
              </div>
              <span className="text-[10px] text-grey-400 mt-1 block">
                {reports.users.active} Active · {reports.users.pending} Pending
              </span>
            </div>

            <div className="bg-grey-50 p-4 rounded-xl border border-grey-200">
              <span className="text-[11px] font-semibold text-grey-500 uppercase tracking-wider block mb-1">
                Applications
              </span>
              <div className="font-display text-2xl font-bold text-navy">
                {reports.applications.total}
              </div>
              <span className="text-[10px] text-grey-400 mt-1 block">
                {reports.applications.selected} Candidate Offers
              </span>
            </div>

            <div className="bg-grey-50 p-4 rounded-xl border border-grey-200">
              <span className="text-[11px] font-semibold text-grey-500 uppercase tracking-wider block mb-1">
                Academy Enrolments
              </span>
              <div className="font-display text-2xl font-bold text-navy">
                {reports.academy.registrations}
              </div>
              <span className="text-[10px] text-grey-400 mt-1 block">
                {reports.academy.certificatesIssued} Credentials Issued
              </span>
            </div>

            <div className="bg-grey-50 p-4 rounded-xl border border-grey-200">
              <span className="text-[11px] font-semibold text-grey-500 uppercase tracking-wider block mb-1">
                Research Outputs
              </span>
              <div className="font-display text-2xl font-bold text-navy">
                {reports.research.outputs}
              </div>
              <span className="text-[10px] text-grey-400 mt-1 block">
                Repository Deliverables
              </span>
            </div>

            <div className="bg-grey-50 p-4 rounded-xl border border-grey-200">
              <span className="text-[11px] font-semibold text-grey-500 uppercase tracking-wider block mb-1">
                Conferences
              </span>
              <div className="font-display text-2xl font-bold text-navy">
                {reports.conferences.count}
              </div>
              <span className="text-[10px] text-grey-400 mt-1 block">
                {reports.conferences.submissions} Paper Submissions
              </span>
            </div>

            <div className="bg-grey-50 p-4 rounded-xl border border-grey-200">
              <span className="text-[11px] font-semibold text-grey-500 uppercase tracking-wider block mb-1">
                Innovation Hub
              </span>
              <div className="font-display text-2xl font-bold text-navy">
                {reports.innovation.applications}
              </div>
              <span className="text-[10px] text-grey-400 mt-1 block">
                {reports.innovation.activePrograms} Cohort Tracks
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h2 className="font-display font-semibold text-base text-navy mb-2">User Access Control</h2>
          <p className="text-xs text-grey-600 mb-4 leading-relaxed">
            Review registration requests, approve faculty credentials, and toggle account roles across 15 institutional tiers.
          </p>
          <Link
            to="/admin/users"
            className="text-xs font-semibold text-navy hover:text-gold flex items-center gap-1"
          >
            Open Users Table →
          </Link>
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold text-base text-navy mb-2">Opportunities & Grants</h2>
          <p className="text-xs text-grey-600 mb-4 leading-relaxed">
            Publish institutional fellowships, student research grants, editorial vacancies, and manage candidate submissions.
          </p>
          <Link
            to="/admin/opportunities"
            className="text-xs font-semibold text-navy hover:text-gold flex items-center gap-1"
          >
            Review Listings →
          </Link>
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold text-base text-navy mb-2">Innovation Hub Studio</h2>
          <p className="text-xs text-grey-600 mb-4 leading-relaxed">
            Manage deep-tech incubation cohorts, student hackathons, and evaluate applicant startup pitch decks.
          </p>
          <Link
            to="/admin/innovation"
            className="text-xs font-semibold text-navy hover:text-gold flex items-center gap-1"
          >
            Manage Innovation Hub →
          </Link>
        </Card>
      </div>

    </div>
  );
}
