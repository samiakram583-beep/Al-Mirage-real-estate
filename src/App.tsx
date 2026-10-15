import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { SettingsProvider } from './context/SettingsContext';

// Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AdminLayout } from './components/admin/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { PropertiesPage } from './pages/public/PropertiesPage';
import { PropertyDetailPage } from './pages/public/PropertyDetailPage';
import { AreasPage } from './pages/public/AreasPage';
import { AreaDetailPage } from './pages/public/AreaDetailPage';
import { AgentsPage } from './pages/public/AgentsPage';
import { AgentDetailPage } from './pages/public/AgentDetailPage';
import { AboutPage } from './pages/public/AboutPage';
import { ServicesPage } from './pages/public/ServicesPage';
import { ContactPage } from './pages/public/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminPropertiesPage } from './pages/admin/AdminPropertiesPage';
import { AdminPropertyEditPage } from './pages/admin/AdminPropertyEditPage';
import { AdminAgentsPage } from './pages/admin/AdminAgentsPage';
import { AdminLeadsPage } from './pages/admin/AdminLeadsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminTestimonialsPage } from './pages/admin/AdminTestimonialsPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';

// Scroll to top helper on navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

// Public layout wrapper with Navbar & Footer
const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <FavoritesProvider>
            <SettingsProvider>
              <ScrollToTop />
              <Routes>
                {/* Public Website Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/properties" element={<PropertiesPage />} />
                  <Route path="/properties/:slug" element={<PropertyDetailPage />} />
                  <Route path="/buy" element={<PropertiesPage forcedPurpose="Sale" />} />
                  <Route path="/rent" element={<PropertiesPage forcedPurpose="Rent" />} />
                  <Route path="/areas" element={<AreasPage />} />
                  <Route path="/areas/:slug" element={<AreaDetailPage />} />
                  <Route path="/agents" element={<AgentsPage />} />
                  <Route path="/agents/:id" element={<AgentDetailPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                </Route>

                {/* Admin Auth Route */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Protected Admin Console Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="properties" element={<AdminPropertiesPage />} />
                  <Route path="properties/new" element={<AdminPropertyEditPage />} />
                  <Route path="properties/:id/edit" element={<AdminPropertyEditPage />} />
                  <Route path="agents" element={<AdminAgentsPage />} />
                  <Route path="leads" element={<AdminLeadsPage />} />
                  <Route path="testimonials" element={<AdminTestimonialsPage />} />
                  <Route path="services" element={<AdminServicesPage />} />
                  <Route path="analytics" element={<AdminAnalyticsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>

                {/* 404 Routes */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </SettingsProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
