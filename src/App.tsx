import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RootRedirect from './pages/RootRedirect'

// Old pages (keeping for compatibility)
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import Editor from './pages/Editor'
import Brands from './pages/Brands'
import Settings from './pages/Settings'
import AdminPanel from './pages/AdminPanel'
import About from './pages/About'
import Careers from './pages/Careers'
import Team from './pages/Team'
import Help from './pages/Help'
import Community from './pages/Community'
import Contact from './pages/Contact'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import CookieNotice from './pages/CookieNotice'
import CookiePreferences from './pages/CookiePreferences'
import Pricing from './pages/Pricing'
import Templates from './pages/Templates'
import Inspiration from './pages/Inspiration'
import Insights from './pages/Insights'

// New UI components
import DashboardNew from './pages/DashboardNew'
import BrandsNew from './pages/BrandsNew'
import ProjectsNew from './pages/ProjectsNew'
import TemplatesNew from './pages/TemplatesNew'
import ThemesNew from './pages/ThemesNew'
import SettingsNew from './pages/SettingsNew'
import CreateModeSelector from './pages/CreateModeSelector'
import AIAgentCreate from './pages/AIAgentCreate'
import WorkspaceSettings from './pages/WorkspaceSettings'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import UserProfile from './pages/UserProfile'
import HelpCenter from './pages/HelpCenter'
import Notifications from './pages/Notifications'
import VersionHistory from './pages/VersionHistory'
import Comments from './pages/Comments'
import NotFound from './pages/NotFound'
import ServerError from './pages/ServerError'
import AdminDashboard from './pages/AdminDashboard'
import LiveCollaboration from './pages/LiveCollaboration'
import ActivityFeed from './pages/ActivityFeed'
import FoldersManagement from './pages/FoldersManagement'
import TagsManagement from './pages/TagsManagement'
import AdvancedSearch from './pages/AdvancedSearch'
import TemplateCreator from './pages/TemplateCreator'
import ThemeEditor from './pages/ThemeEditor'
import PresentationRemix from './pages/PresentationRemix'
import APIKeysManagement from './pages/APIKeysManagement'
import WebhookSettings from './pages/WebhookSettings'
import PasteMode from './pages/PasteMode'
import ImportMode from './pages/ImportMode'
import SubscriptionBilling from './pages/SubscriptionBilling'
import PresentationAnalytics from './pages/PresentationAnalytics'
import IntegrationMarketplace from './pages/IntegrationMarketplace'
import BrandAssetLibrary from './pages/BrandAssetLibrary'
import StockImageBrowser from './pages/StockImageBrowser'
import IconLibraryBrowser from './pages/IconLibraryBrowser'
import Signup from './pages/Signup'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import OnboardingWelcome from './pages/OnboardingWelcome'
import OnboardingWorkspace from './pages/OnboardingWorkspace'
import OnboardingBrand from './pages/OnboardingBrand'
import SlideEditor from './pages/SlideEditor'

import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        
        {/* Auth Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Onboarding Routes */}
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/onboarding/welcome" element={<OnboardingWelcome />} />
        <Route path="/onboarding/workspace" element={<OnboardingWorkspace />} />
        <Route path="/onboarding/brand" element={<OnboardingBrand />} />
        
        {/* Editor Routes */}
        <Route path="/editor/slide/:id" element={
          <ProtectedRoute>
            <SlideEditor />
          </ProtectedRoute>
        } />
        
        {/* New UI Routes */}
        <Route path="/dashboard-new" element={
          <ProtectedRoute>
            <DashboardNew />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardNew />
          </ProtectedRoute>
        } />
        <Route path="/brands-new" element={
          <ProtectedRoute>
            <BrandsNew />
          </ProtectedRoute>
        } />
        <Route path="/brands" element={
          <ProtectedRoute>
            <BrandsNew />
          </ProtectedRoute>
        } />
        <Route path="/projects" element={
          <ProtectedRoute>
            <ProjectsNew />
          </ProtectedRoute>
        } />
        <Route path="/templates-new" element={
          <ProtectedRoute>
            <TemplatesNew />
          </ProtectedRoute>
        } />
        <Route path="/themes" element={
          <ProtectedRoute>
            <ThemesNew />
          </ProtectedRoute>
        } />
        <Route path="/settings-new" element={
          <ProtectedRoute>
            <SettingsNew />
          </ProtectedRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute>
            <CreateModeSelector />
          </ProtectedRoute>
        } />
        <Route path="/create/generate" element={
          <ProtectedRoute>
            <AIAgentCreate />
          </ProtectedRoute>
        } />
        <Route path="/create/paste" element={
          <ProtectedRoute>
            <AIAgentCreate />
          </ProtectedRoute>
        } />
        <Route path="/create/import" element={
          <ProtectedRoute>
            <AIAgentCreate />
          </ProtectedRoute>
        } />
        
        {/* Phase 4 & 5: Management and Supporting Pages */}
        <Route path="/workspace/settings" element={
          <ProtectedRoute>
            <WorkspaceSettings />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <AnalyticsDashboard />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/help-center" element={
          <ProtectedRoute>
            <HelpCenter />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/version-history/:id" element={
          <ProtectedRoute>
            <VersionHistory />
          </ProtectedRoute>
        } />
        <Route path="/comments/:id" element={
          <ProtectedRoute>
            <Comments />
          </ProtectedRoute>
        } />
        
        {/* Error Pages */}
        <Route path="/500" element={<ServerError />} />
        
        {/* Admin & Organization */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/collaboration" element={
          <ProtectedRoute>
            <LiveCollaboration />
          </ProtectedRoute>
        } />
        <Route path="/activity" element={
          <ProtectedRoute>
            <ActivityFeed />
          </ProtectedRoute>
        } />
        <Route path="/folders" element={
          <ProtectedRoute>
            <FoldersManagement />
          </ProtectedRoute>
        } />
        <Route path="/tags" element={
          <ProtectedRoute>
            <TagsManagement />
          </ProtectedRoute>
        } />
        <Route path="/search" element={
          <ProtectedRoute>
            <AdvancedSearch />
          </ProtectedRoute>
        } />
        
        {/* Creation Tools */}
        <Route path="/template/create" element={
          <ProtectedRoute>
            <TemplateCreator />
          </ProtectedRoute>
        } />
        <Route path="/theme/editor" element={
          <ProtectedRoute>
            <ThemeEditor />
          </ProtectedRoute>
        } />
        <Route path="/presentation/remix/:id" element={
          <ProtectedRoute>
            <PresentationRemix />
          </ProtectedRoute>
        } />
        
        {/* Developer Tools */}
        <Route path="/developer/api-keys" element={
          <ProtectedRoute>
            <APIKeysManagement />
          </ProtectedRoute>
        } />
        <Route path="/developer/webhooks" element={
          <ProtectedRoute>
            <WebhookSettings />
          </ProtectedRoute>
        } />
        
        {/* Creation Modes */}
        <Route path="/create/paste" element={
          <ProtectedRoute>
            <PasteMode />
          </ProtectedRoute>
        } />
        <Route path="/create/import" element={
          <ProtectedRoute>
            <ImportMode />
          </ProtectedRoute>
        } />
        
        {/* Billing & Subscription */}
        <Route path="/subscription" element={
          <ProtectedRoute>
            <SubscriptionBilling />
          </ProtectedRoute>
        } />
        
        {/* Analytics */}
        <Route path="/presentation/:id/analytics" element={
          <ProtectedRoute>
            <PresentationAnalytics />
          </ProtectedRoute>
        } />
        
        {/* Integrations & Assets */}
        <Route path="/integrations" element={
          <ProtectedRoute>
            <IntegrationMarketplace />
          </ProtectedRoute>
        } />
        <Route path="/brand/assets" element={
          <ProtectedRoute>
            <BrandAssetLibrary />
          </ProtectedRoute>
        } />
        <Route path="/assets/images" element={
          <ProtectedRoute>
            <StockImageBrowser />
          </ProtectedRoute>
        } />
        <Route path="/assets/icons" element={
          <ProtectedRoute>
            <IconLibraryBrowser />
          </ProtectedRoute>
        } />
        
        {/* Old Routes (keeping for compatibility) */}
        <Route path="/editor/:id" element={
          <ProtectedRoute>
            <Editor />
          </ProtectedRoute>
        } />
        <Route path="/settings/*" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        } />
        
        {/* Footer Pages - Product */}
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/inspiration" element={<Inspiration />} />
        <Route path="/insights" element={<Insights />} />
        
        {/* Footer Pages - Company */}
        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/team" element={<Team />} />
        <Route path="/help" element={<Help />} />
        <Route path="/community" element={<Community />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/cookie-notice" element={<CookieNotice />} />
        <Route path="/cookie-preferences" element={<CookiePreferences />} />
        
        {/* 404 Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

