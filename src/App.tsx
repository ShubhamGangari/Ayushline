import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import Layout from './components/layout/Layout';

// ─── Scroll to top on route change ────────────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

// ─── Fast, lightweight page loading indicator ────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center bg-ayush-cream/60">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-ayush-gold border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading..." />
        <span className="text-xs font-ui text-ayush-charcoal/50">Loading…</span>
      </div>
    </div>
  );
}

// ─── Core Pages (Direct imports for instantaneous 0ms tab navigation) ────────
import Home from './pages/Home';
import Category from './pages/Category';
import Join from './pages/Join';
import About from './pages/About';
import Consult from './pages/Consult';
import WhatsNew from './pages/WhatsNew';
import Guidelines from './pages/Guidelines';
import Dashboard from './pages/Dashboard';
import { Profile } from './pages/Profile';
import NotFound from './pages/NotFound';

// ─── Secondary Pages & Admin Portal (Code-split on demand) ───────────────────
const DoctorRegistration = lazy(() => import('./pages/DoctorRegistration'));
const SubmitContent      = lazy(() => import('./pages/SubmitContent'));
const PrivacyPolicy      = lazy(() => import('./pages/PrivacyPolicy'));
const Disclaimer         = lazy(() => import('./pages/Disclaimer'));
const ThankYou           = lazy(() => import('./pages/ThankYou'));
const Sitemap            = lazy(() => import('./pages/Sitemap'));
const SSOCallback        = lazy(() => import('./pages/SSOCallback'));
const DoctorProfile      = lazy(() => import('./pages/DoctorProfile'));
const ArticleDetail      = lazy(() => import('./pages/ArticleDetail'));

// Admin pages — separate chunk group (only loaded for admins)
const AdminLayout    = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminDoctors   = lazy(() => import('./pages/admin/AdminDoctors'));
const AdminPosts     = lazy(() => import('./pages/admin/AdminPosts'));
const AdminEvents    = lazy(() => import('./pages/admin/AdminEvents'));
const AdminUsers     = lazy(() => import('./pages/admin/AdminUsers'));

// ─── Auth guard wrapper ───────────────────────────────────────────────────────
import { RequireAuth } from './components/auth/RequireAuth';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="ayurveda"    element={<Category system="ayurveda"    title="Ayurveda"    description="Ancient Indian science of Doshas, Dhatus & natural healing." />} />
              <Route path="yoga"        element={<Category system="yoga"        title="Yoga"        description="Physical, mental & spiritual well-being through practice." />} />
              <Route path="unani"       element={<Category system="unani"       title="Unani"       description="Greco-Arab healing via humoral balance & herbs." />} />
              <Route path="siddha"      element={<Category system="siddha"      title="Siddha"      description="Ancient Tamil system of balance & mineral remedies." />} />
              <Route path="homeopathy"  element={<Category system="homeopathy"  title="Homeopathy"  description="'Like cures like' with natural diluted substances." />} />
              <Route path="about"       element={<About />} />
              <Route path="about-us"    element={<About />} />
              <Route path="about/doctor-registration" element={<DoctorRegistration />} />
              <Route path="doctor-registration"       element={<DoctorRegistration />} />
              <Route path="guidelines"  element={<Guidelines />} />
              <Route path="consult"     element={<Consult />} />
              <Route path="consultation" element={<Consult />} />
              <Route path="whats-new"   element={<WhatsNew />} />
              <Route path="events"      element={<WhatsNew />} />
              <Route path="join/*"      element={<Join />} />
              <Route path="submit-content" element={<SubmitContent />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="disclaimer"  element={<Disclaimer />} />
              <Route path="thank-you"   element={<ThankYou />} />
              <Route path="sitemap"     element={<Sitemap />} />
              <Route path="dashboard"   element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="my-consultations" element={<RequireAuth><Dashboard defaultTab="consultations" /></RequireAuth>} />
              <Route path="my-events"   element={<RequireAuth><Dashboard defaultTab="events" /></RequireAuth>} />
              <Route path="profile"     element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="doctor/:id"  element={<DoctorProfile />} />
              <Route path="doctors/:id" element={<DoctorProfile />} />
              <Route path="article/:id" element={<ArticleDetail />} />
              <Route path="articles/:id" element={<ArticleDetail />} />
              <Route path="*"           element={<NotFound />} />
            </Route>

            {/* OAuth Callback Route */}
            <Route path="/sso-callback" element={<SSOCallback />} />

            {/* Admin Portal — separate lazy chunk */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index          element={<AdminDashboard />} />
              <Route path="doctors" element={<AdminDoctors />} />
              <Route path="posts"   element={<AdminPosts />} />
              <Route path="events"  element={<AdminEvents />} />
              <Route path="users"   element={<AdminUsers />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
