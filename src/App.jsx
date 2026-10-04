import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

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
import { ReportsPage } from './pages/ReportsPage';
import { ImportExportPage } from './pages/ImportExportPage';
import { UserManagement } from './pages/UserManagement';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { HistoricalStockPage } from './pages/HistoricalStockPage';
import { SettingsPage } from './pages/SettingsPage';
import { Login } from './pages/Login';

// Layout with Sidebar and Header
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
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
        <DataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Application Protected Pages */}
            <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/requests" element={<AppLayout><AllRequests /></AppLayout>} />
            <Route path="/requests/create" element={<AppLayout><CreateRequest /></AppLayout>} />
            <Route path="/requests/:id" element={<AppLayout><RequestDetails /></AppLayout>} />
            <Route path="/quotations" element={<AppLayout><QuotationsList /></AppLayout>} />
            <Route path="/quotations/compare" element={<AppLayout><QuotationComparisonPage /></AppLayout>} />
            <Route path="/approvals" element={<AppLayout><ApprovalManagement /></AppLayout>} />
            <Route path="/approval-letters" element={<AppLayout><ApprovalLetters /></AppLayout>} />
            <Route path="/work-tracking" element={<AppLayout><WorkTrackingPage /></AppLayout>} />
            <Route path="/bills" element={<AppLayout><BillsPage /></AppLayout>} />
            <Route path="/documents" element={<AppLayout><DocumentsPage /></AppLayout>} />
            <Route path="/institutes" element={<AppLayout><InstitutesPage /></AppLayout>} />
            <Route path="/agencies" element={<AppLayout><AgenciesPage /></AppLayout>} />
            <Route path="/authorities" element={<AppLayout><AuthoritiesPage /></AppLayout>} />
            <Route path="/reports" element={<AppLayout><ReportsPage /></AppLayout>} />
            <Route path="/import-export" element={<AppLayout><ImportExportPage /></AppLayout>} />
            <Route path="/users" element={<AppLayout><UserManagement /></AppLayout>} />
            <Route path="/audit-logs" element={<AppLayout><AuditLogsPage /></AppLayout>} />
            <Route path="/stock-notes" element={<AppLayout><HistoricalStockPage /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
