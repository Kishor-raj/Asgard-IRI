import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import ProfileTab from './ProfileTab';
import ApplicationsTab from './ApplicationsTab';
import ConferencesTab from './ConferencesTab';
import AcademyTab from './AcademyTab';
import CertificatesTab from './CertificatesTab';
import ResearcherTab from './ResearcherTab';
import InnovationTab from './InnovationTab';
import Badge from '../../components/common/Badge';

const tabs = [
  { id: 'applications', label: 'Applications' },
  { id: 'conferences',  label: 'Conferences' },
  { id: 'academy',      label: 'Academy' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'innovation',   label: 'Innovation Hub' },
  { id: 'profile',      label: 'Personal Profile' },
  { id: 'researcher',   label: 'Researcher Profile', roleOnly: 'researcher' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  // Default to 'applications' for participants, or saved tab from previous navigation
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('asgard_user_tab');
    if (saved && tabs.some((t) => t.id === saved)) {
      return saved;
    }
    return user?.role === 'researcher' ? 'researcher' : 'applications';
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    localStorage.setItem('asgard_user_tab', tabId);
  };

  return (
    <div className="bg-grey-50 min-h-screen py-6 sm:py-8">
      <Helmet>
        <title>User Dashboard – ASGARD-IRI</title>
      </Helmet>

      <div className="max-w-content mx-auto px-4 sm:px-6">
        {/* User Welcome Card */}
        <div className="bg-navy rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8 text-white relative overflow-hidden shadow-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold">
                  Welcome, {user?.fullName || 'Colleague'}
                </h1>
                <Badge label={user?.role?.replace('_', ' ').toUpperCase()} variant="category" />
              </div>
              <p className="text-white/60 text-xs sm:text-sm break-all sm:break-normal">
                Account Email: {user?.email} • Status: <span className="text-success font-medium capitalize">{user?.status}</span>
              </p>
            </div>
            {['super_admin', 'foundation_admin'].includes(user?.role) && (
              <a
                href="/admin"
                className="bg-gold text-navy text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gold-dark transition-colors shrink-0"
              >
                Go to Admin Panel →
              </a>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-grey-200 mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {tabs
              .filter((t) => !t.roleOnly || user?.role === t.roleOnly)
              .map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-gold text-navy font-semibold'
                      : 'border-transparent text-grey-600 hover:text-navy hover:border-grey-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'applications' && <ApplicationsTab />}

        {activeTab === 'conferences' && <ConferencesTab />}

        {activeTab === 'academy' && <AcademyTab />}

        {activeTab === 'certificates' && <CertificatesTab />}

        {activeTab === 'innovation' && <InnovationTab />}

        {activeTab === 'profile' && <ProfileTab />}

        {activeTab === 'researcher' && <ResearcherTab userId={user?.id} />}
      </div>
    </div>
  );
}
