import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Prevent dashboard flash while restoring Supabase session
  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-[#173C32] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-[#171A18]">Verifying administrator session...</p>
      </div>
    );
  }

  // Strictly protected route check
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0">
        <div className="fixed inset-y-0 w-64 z-30">
          <AdminSidebar />
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 h-full z-10">
            <AdminSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Outlet context={{ openMobileSidebar: () => setMobileSidebarOpen(true) }} />
      </div>
    </div>
  );
};
