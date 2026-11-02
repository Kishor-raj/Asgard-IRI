import { Routes, Route } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import AdminLayout from '../components/layout/AdminLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import HomePage from '../pages/Home';
import AboutPage from '../pages/About';
import ResearchPage from '../pages/Research';
import ResearchRepositoryPage from '../pages/Research/Repository';
import ResearchOutputDetailPage from '../pages/Research/OutputDetail';
import ResearcherProfilePage from '../pages/Research/ResearcherProfile';
import ProjectDetailPage from '../pages/Research/ProjectDetail';
import JournalsPage from '../pages/Journals';
import PublicationsPage from '../pages/Publications';
import ConferencesPage from '../pages/Conferences';
import AcademyPage from '../pages/Academy';
import AITechLabPage from '../pages/AITechLab';
import InnovationHubPage from '../pages/InnovationHub';
import ConsultancyPage from '../pages/Consultancy';
import OpportunitiesPage from '../pages/Opportunities';
import OpportunityDetailPage from '../pages/Opportunities/OpportunityDetail';
import ApplyPage from '../pages/Opportunities/Apply';
import NewsPage from '../pages/News';
import EventsPage from '../pages/Events';
import GalleryPage from '../pages/Gallery';
import ContactPage from '../pages/Contact';
import SearchPage from '../pages/Search';
import VerifyPage from '../pages/Verify';
import PublicSchoolPage from '../pages/PublicSchool';
import ComponentShowcasePage from '../pages/ComponentShowcase';
import NotFoundPage from '../pages/NotFound';

// Policy Pages
import PrivacyPolicyPage from '../pages/Policies/Privacy';
import TermsPage from '../pages/Policies/Terms';
import EthicsPage from '../pages/Policies/Ethics';
import PeerReviewPage from '../pages/Policies/PeerReview';
import OpenAccessPage from '../pages/Policies/OpenAccess';
import RefundPage from '../pages/Policies/Refund';

// Auth Pages
import LoginPage from '../pages/Auth/Login';
import RegisterPage from '../pages/Auth/Register';
import ForgotPasswordPage from '../pages/Auth/ForgotPassword';
import ResetPasswordPage from '../pages/Auth/ResetPassword';
import AuthCallbackPage from '../pages/Auth/Callback';

// Dashboard Page
import DashboardPage from '../pages/Dashboard';

// Admin Pages
import AdminDashboardPage from '../pages/Admin/Dashboard';
import AdminUsersPage from '../pages/Admin/Users';
import AdminResearchPage from '../pages/Admin/Research';
import AdminJournalsPage from '../pages/Admin/Journals';
import AdminPublicationsPage from '../pages/Admin/Publications';
import AdminConferencesPage from '../pages/Admin/Conferences';
import AdminAcademyPage from '../pages/Admin/Academy';
import AdminOpportunitiesPage from '../pages/Admin/Opportunities';
import AdminApplicationsPage from '../pages/Admin/Applications';
import AdminCertificatesPage from '../pages/Admin/Certificates';
import AdminNewsPage from '../pages/Admin/News';
import AdminInnovationHubPage from '../pages/Admin/InnovationHub';
import AdminConsultancyPage from '../pages/Admin/Consultancy';
import AdminSettingsPage from '../pages/Admin/Settings';
import AdminAnalyticsPage from '../pages/Admin/Analytics';
import AdminPaymentsPage from '../pages/Admin/Payments';
import AdminPartnersPage from '../pages/Admin/Partners';
import PartnersPage from '../pages/Partners';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes with PageLayout */}
      <Route
        path="/"
        element={
          <PageLayout>
            <HomePage />
          </PageLayout>
        }
      />
      <Route
        path="/about"
        element={
          <PageLayout>
            <AboutPage />
          </PageLayout>
        }
      />
      <Route
        path="/research"
        element={
          <PageLayout>
            <ResearchPage />
          </PageLayout>
        }
      />
      <Route
        path="/research/repository"
        element={
          <PageLayout>
            <ResearchRepositoryPage />
          </PageLayout>
        }
      />
      <Route
        path="/research/outputs/:slug"
        element={
          <PageLayout>
            <ResearchOutputDetailPage />
          </PageLayout>
        }
      />
      <Route
        path="/research/projects/:slug"
        element={
          <PageLayout>
            <ProjectDetailPage />
          </PageLayout>
        }
      />
      <Route
        path="/researchers/:id"
        element={
          <PageLayout>
            <ResearcherProfilePage />
          </PageLayout>
        }
      />
      <Route
        path="/journals"
        element={
          <PageLayout>
            <JournalsPage />
          </PageLayout>
        }
      />
      <Route
        path="/publications"
        element={
          <PageLayout>
            <PublicationsPage />
          </PageLayout>
        }
      />
      <Route
        path="/conferences"
        element={
          <PageLayout>
            <ConferencesPage />
          </PageLayout>
        }
      />
      <Route
        path="/academy"
        element={
          <PageLayout>
            <AcademyPage />
          </PageLayout>
        }
      />
      <Route
        path="/ai-tech-lab"
        element={
          <PageLayout>
            <AITechLabPage />
          </PageLayout>
        }
      />
      <Route
        path="/innovation-hub"
        element={
          <PageLayout>
            <InnovationHubPage />
          </PageLayout>
        }
      />
      <Route
        path="/consultancy"
        element={
          <PageLayout>
            <ConsultancyPage />
          </PageLayout>
        }
      />
      <Route
        path="/opportunities"
        element={
          <PageLayout>
            <OpportunitiesPage />
          </PageLayout>
        }
      />
      <Route
        path="/opportunities/:slug"
        element={
          <PageLayout>
            <OpportunityDetailPage />
          </PageLayout>
        }
      />
      <Route
        path="/opportunities/:id/apply"
        element={
          <ProtectedRoute>
            <PageLayout>
              <ApplyPage />
            </PageLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/news"
        element={
          <PageLayout>
            <NewsPage />
          </PageLayout>
        }
      />
      <Route
        path="/events"
        element={
          <PageLayout>
            <EventsPage />
          </PageLayout>
        }
      />
      <Route
        path="/gallery"
        element={
          <PageLayout>
            <GalleryPage />
          </PageLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <PageLayout>
            <ContactPage />
          </PageLayout>
        }
      />
      <Route
        path="/search"
        element={
          <PageLayout>
            <SearchPage />
          </PageLayout>
        }
      />
      <Route
        path="/verify"
        element={
          <PageLayout>
            <VerifyPage />
          </PageLayout>
        }
      />
      <Route
        path="/public-school"
        element={
          <PageLayout>
            <PublicSchoolPage />
          </PageLayout>
        }
      />
      <Route
        path="/partners"
        element={
          <PageLayout>
            <PartnersPage />
          </PageLayout>
        }
      />
      <Route
        path="/showcase"
        element={
          <PageLayout>
            <ComponentShowcasePage />
          </PageLayout>
        }
      />

      {/* Policy Pages */}
      <Route
        path="/policies/privacy"
        element={
          <PageLayout>
            <PrivacyPolicyPage />
          </PageLayout>
        }
      />
      <Route
        path="/policies/terms"
        element={
          <PageLayout>
            <TermsPage />
          </PageLayout>
        }
      />
      <Route
        path="/policies/ethics"
        element={
          <PageLayout>
            <EthicsPage />
          </PageLayout>
        }
      />
      <Route
        path="/policies/peer-review"
        element={
          <PageLayout>
            <PeerReviewPage />
          </PageLayout>
        }
      />
      <Route
        path="/policies/open-access"
        element={
          <PageLayout>
            <OpenAccessPage />
          </PageLayout>
        }
      />
      <Route
        path="/policies/refund"
        element={
          <PageLayout>
            <RefundPage />
          </PageLayout>
        }
      />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* User Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Panel Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'foundation_admin', 'content_editor', 'research_admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="research" element={<AdminResearchPage />} />
        <Route path="journals" element={<AdminJournalsPage />} />
        <Route path="publications" element={<AdminPublicationsPage />} />
        <Route path="conferences" element={<AdminConferencesPage />} />
        <Route path="academy" element={<AdminAcademyPage />} />
        <Route path="opportunities" element={<AdminOpportunitiesPage />} />
        <Route path="applications" element={<AdminApplicationsPage />} />
        <Route path="certificates" element={<AdminCertificatesPage />} />
        <Route path="news" element={<AdminNewsPage />} />
        <Route path="innovation" element={<AdminInnovationHubPage />} />
        <Route path="consultancy" element={<AdminConsultancyPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="partners" element={<AdminPartnersPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <PageLayout>
            <NotFoundPage />
          </PageLayout>
        }
      />
    </Routes>
  );
}
