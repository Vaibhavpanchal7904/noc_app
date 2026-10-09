import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  FileSpreadsheet,
  GitCompare,
  CheckSquare,
  Award,
  Wrench,
  Receipt,
  FolderOpen,
  Building2,
  Users,
  ShieldCheck,
  BarChart3,
  UploadCloud,
  UserCheck,
  Contact,
  History,
  Sliders,
  LogOut,
  Database,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { PwaInstallButton } from './PwaInstallButton';

export const Sidebar = ({ isOpen, onClose }) => {
  const { currentUser, role, logout } = useAuth();
  const { requests, teamMembers = [] } = useData();
  const navigate = useNavigate();

  const pendingApprovalsCount = requests.filter(r => r.overall_status === 'Awaiting Approval').length;
  const pendingBillsCount = requests.filter(r => r.bills?.some(b => b.bill_status === 'Submitted')).length;

  const handleLogout = async () => {
    onClose?.();
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Main Navigation">
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div className="sidebar-logo-icon">NOC</div>
          <div>
            <div className="sidebar-brand-title">CVM & CVMU</div>
            <div className="sidebar-brand-subtitle">NOC Management System</div>
          </div>
        </div>
        <button
          className="sidebar-mobile-close"
          onClick={onClose}
          aria-label="Close navigation menu"
          title="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Overview</div>
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <div className="sidebar-section-title">Requests & Workflow</div>
        <NavLink to="/requests" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <FileText size={18} />
          <span>All Requests</span>
          <span className="nav-link-badge">{requests.length}</span>
        </NavLink>

        <NavLink to="/requests/create" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <PlusCircle size={18} />
          <span>Create Request</span>
        </NavLink>

        <NavLink to="/quotations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <FileSpreadsheet size={18} />
          <span>Quotations</span>
        </NavLink>

        <NavLink to="/quotations/compare" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <GitCompare size={18} />
          <span>Quotation Comparison</span>
        </NavLink>

        <NavLink to="/approvals" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <CheckSquare size={18} />
          <span>Approval Management</span>
          {pendingApprovalsCount > 0 && (
            <span className="nav-link-badge" style={{ backgroundColor: '#f59e0b' }}>{pendingApprovalsCount}</span>
          )}
        </NavLink>

        <NavLink to="/approval-letters" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Award size={18} />
          <span>Approval Letters</span>
        </NavLink>

        <NavLink to="/work-tracking" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Wrench size={18} />
          <span>Work Tracking</span>
        </NavLink>

        <NavLink to="/bills" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Receipt size={18} />
          <span>Bills & Payments</span>
          {pendingBillsCount > 0 && (
            <span className="nav-link-badge" style={{ backgroundColor: '#ef4444' }}>{pendingBillsCount}</span>
          )}
        </NavLink>

        <NavLink to="/documents" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <FolderOpen size={18} />
          <span>Documents & Scans</span>
        </NavLink>

        <div className="sidebar-section-title">Master Data</div>
        <NavLink to="/institutes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Building2 size={18} />
          <span>Colleges / Institutes</span>
        </NavLink>

        <NavLink to="/agencies" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Users size={18} />
          <span>Agencies & Vendors</span>
        </NavLink>

        <NavLink to="/authorities" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <ShieldCheck size={18} />
          <span>Approval Authorities</span>
        </NavLink>

        <div className="sidebar-section-title">Team & Governance</div>
        <NavLink to="/team" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Contact size={18} />
          <span>Team Directory</span>
          <span className="nav-link-badge" style={{ backgroundColor: '#2563eb' }}>{teamMembers.length}</span>
        </NavLink>

        <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <UserCheck size={18} />
          <span>User Access & Roles</span>
        </NavLink>

        <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <BarChart3 size={18} />
          <span>Reports & Analytics</span>
        </NavLink>

        <NavLink to="/import-export" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <UploadCloud size={18} />
          <span>Import / Export (CSV)</span>
        </NavLink>

        <NavLink to="/audit-logs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <History size={18} />
          <span>Audit Logs</span>
        </NavLink>

        <NavLink to="/stock-notes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Database size={18} />
          <span>Historical Stock Notes</span>
        </NavLink>

        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
          <Sliders size={18} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div style={{ marginBottom: 10 }}>
          <PwaInstallButton variant="sidebar" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="user-snippet">
            <div className="user-avatar" style={{ background: '#2563eb', color: '#ffffff' }}>
              {currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info-text">
              <div className="user-name">{currentUser?.full_name || 'System User'}</div>
              <div className="user-role">{role?.replace('_', ' ')}</div>
            </div>
          </div>
          <button
            className="btn-icon"
            title="Sign out from system"
            onClick={handleLogout}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

