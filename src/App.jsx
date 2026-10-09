import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PwaProvider } from './context/PwaContext';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastNotification } from './components/ToastNotification';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

import { Dashboard } from './pages/Dashboard';
import { AllRequests } from './pages/AllRequests';
import { CreateRequest } from './pages/CreateRequest';
import { RequestDetails } from './pages/RequestDetails';
import { QuotationsList } from './pages/QuotationsList';
import { QuotationComparisonPage } from './pages/QuotationComparisonPage';
import { ApprovalManagement } from './pages/ApprovalManagement';
import { ApprovalLetters } from './pages/ApprovalLetters';
import { WorkTrackingPage } from './pages/WorkTrackingPage';
import { BillsPage } from './pages/BillsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { InstitutesPage } from './pages/InstitutesPage';
import { AgenciesPage } from './pages/AgenciesPage';
import { AuthoritiesPage } from './pages/AuthoritiesPage';
import { TeamDirectoryPage } from './pages/TeamDirectoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { ImportExportPage } from './pages/ImportExportPage';
import { UserManagement } from './pages/UserManagement';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { HistoricalStockPage } from './pages/HistoricalStockPage';
import { SettingsPage } from './pages/SettingsPage';
import { Login } from './pages/Login';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <div style={{ textAlign: 'center', color: '#ffffff' }}>
          <div className="spin-animation" style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#38bdf8', borderRadius: '50%', margin: '0 auto 16px' }} />
          <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: '0.5px' }}>Verifying internal credentials...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Layout with Sidebar and Header
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Realtime Floating Toast Alerts */}
      <ToastNotification />

      {/* Mobile Drawer Backdrop */}
      <div 
        className={`sidebar-backdrop ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PwaProvider>
          <DataProvider>
            <NotificationProvider>
              <Routes>
                <Route path="/login" element={<Login />} />

                {/* Application Protected Pages */}
                <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
                <Route path="/requests" element={<ProtectedRoute><AppLayout><AllRequests /></AppLayout></ProtectedRoute>} />
                <Route path="/requests/create" element={<ProtectedRoute><AppLayout><CreateRequest /></AppLayout></ProtectedRoute>} />
                <Route path="/requests/:id" element={<ProtectedRoute><AppLayout><RequestDetails /></AppLayout></ProtectedRoute>} />
                <Route path="/quotations" element={<ProtectedRoute><AppLayout><QuotationsList /></AppLayout></ProtectedRoute>} />
                <Route path="/quotations/compare" element={<ProtectedRoute><AppLayout><QuotationComparisonPage /></AppLayout></ProtectedRoute>} />
                <Route path="/approvals" element={<ProtectedRoute><AppLayout><ApprovalManagement /></AppLayout></ProtectedRoute>} />
                <Route path="/approval-letters" element={<ProtectedRoute><AppLayout><ApprovalLetters /></AppLayout></ProtectedRoute>} />
                <Route path="/work-tracking" element={<ProtectedRoute><AppLayout><WorkTrackingPage /></AppLayout></ProtectedRoute>} />
                <Route path="/bills" element={<ProtectedRoute><AppLayout><BillsPage /></AppLayout></ProtectedRoute>} />
                <Route path="/documents" element={<ProtectedRoute><AppLayout><DocumentsPage /></AppLayout></ProtectedRoute>} />
                <Route path="/institutes" element={<ProtectedRoute><AppLayout><InstitutesPage /></AppLayout></ProtectedRoute>} />
                <Route path="/agencies" element={<ProtectedRoute><AppLayout><AgenciesPage /></AppLayout></ProtectedRoute>} />
                <Route path="/authorities" element={<ProtectedRoute><AppLayout><AuthoritiesPage /></AppLayout></ProtectedRoute>} />
                <Route path="/team" element={<ProtectedRoute><AppLayout><TeamDirectoryPage /></AppLayout></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><AppLayout><ReportsPage /></AppLayout></ProtectedRoute>} />
                <Route path="/import-export" element={<ProtectedRoute><AppLayout><ImportExportPage /></AppLayout></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute><AppLayout><UserManagement /></AppLayout></ProtectedRoute>} />
                <Route path="/audit-logs" element={<ProtectedRoute><AppLayout><AuditLogsPage /></AppLayout></ProtectedRoute>} />
                <Route path="/stock-notes" element={<ProtectedRoute><AppLayout><HistoricalStockPage /></AppLayout></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </NotificationProvider>
          </DataProvider>
        </PwaProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

