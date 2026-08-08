import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Category from './pages/Category';
import Join from './pages/Join';
import About from './pages/About';
import Consult from './pages/Consult';
import Events from './pages/Events';
import Guidelines from './pages/Guidelines';
import DoctorRegistration from './pages/DoctorRegistration';
import SubmitContent from './pages/SubmitContent';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Disclaimer from './pages/Disclaimer';
import ThankYou from './pages/ThankYou';
import Sitemap from './pages/Sitemap';
import SSOCallback from './pages/SSOCallback';
import Dashboard from './pages/Dashboard';
import DoctorProfile from './pages/DoctorProfile';
import ArticleDetail from './pages/ArticleDetail';
import { Profile } from './pages/Profile';
import { RequireAuth } from './components/auth/RequireAuth';

// Admin Imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminPosts from './pages/admin/AdminPosts';
import AdminEvents from './pages/admin/AdminEvents';
import AdminUsers from './pages/admin/AdminUsers';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="ayurveda" element={<Category system="ayurveda" title="Ayurveda" description="Ancient Indian science of Doshas, Dhatus & natural healing." />} />
          <Route path="yoga" element={<Category system="yoga" title="Yoga" description="Physical, mental & spiritual well-being through practice." />} />
          <Route path="unani" element={<Category system="unani" title="Unani" description="Greco-Arab healing via humoral balance & herbs." />} />
          <Route path="siddha" element={<Category system="siddha" title="Siddha" description="Ancient Tamil system of balance & mineral remedies." />} />
          <Route path="homeopathy" element={<Category system="homeopathy" title="Homeopathy" description="'Like cures like' with natural diluted substances." />} />
          <Route path="about" element={<About />} />
          <Route path="about/doctor-registration" element={<DoctorRegistration />} />
          <Route path="guidelines" element={<Guidelines />} />
          <Route path="consult" element={<Consult />} />
          <Route path="events" element={<Events />} />
          <Route path="join/*" element={<Join />} />
          <Route path="submit-content" element={<SubmitContent />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="disclaimer" element={<Disclaimer />} />
          <Route path="thank-you" element={<ThankYou />} />
          <Route path="sitemap" element={<Sitemap />} />
          <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="my-consultations" element={<RequireAuth><Dashboard defaultTab="consultations" /></RequireAuth>} />
          <Route path="my-events" element={<RequireAuth><Dashboard defaultTab="events" /></RequireAuth>} />
          <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="doctor/:id" element={<DoctorProfile />} />
          <Route path="article/:id" element={<ArticleDetail />} />
         </Route>

         {/* OAuth Callback Route */}
         <Route path="/sso-callback" element={<SSOCallback />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
