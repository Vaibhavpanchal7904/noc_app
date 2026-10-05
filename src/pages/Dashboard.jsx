import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  XCircle,
  Wrench,
  Receipt,
  FolderCheck,
  PlusCircle,
  Search,
  ArrowRight,
  TrendingUp,
  Building2,
  AlertCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatCurrency, formatDate } from '../utils/pdfGenerator';
import { StatusBadge } from '../components/StatusBadge';

export const Dashboard = () => {
  const { requests, institutes, agencies, organizations, syncStatus, syncError, isConfigured } = useData();
  const navigate = useNavigate();

  // Metrics Calculations
  const totalRequests = requests.length;
  const pendingQuotations = requests.filter(r => r.overall_status === 'Pending Quotations' || r.current_stage === 'requirement').length;
  const awaitingApproval = requests.filter(r => r.overall_status === 'Awaiting Approval' || r.current_stage === 'approval_pending').length;
  const approvedRequests = requests.filter(r => r.overall_status === 'Approved' || r.current_stage === 'approved').length;
  const rejectedRequests = requests.filter(r => r.overall_status === 'Rejected' || r.current_stage === 'rejected').length;
  const workInProgress = requests.filter(r => r.overall_status === 'Work In Progress' || r.current_stage === 'in_progress').length;
  const completedWork = requests.filter(r => r.overall_status === 'Work Completed' || r.current_stage === 'completed').length;
  const pendingBills = requests.filter(r => r.bills?.some(b => b.bill_status === 'Submitted') || r.overall_status === 'Pending Bill').length;
  const closedRequests = requests.filter(r => r.overall_status === 'Closed' || r.current_stage === 'closed').length;

  // Recent 6 Requests
  const recentRequests = [...requests].sort((a, b) => new Date(b.created_at || b.request_date) - new Date(a.created_at || a.request_date)).slice(0, 6);

  // Total Sanctioned Amount
  const totalSanctioned = requests.reduce((sum, r) => {
    const appr = r.approvals?.find(a => a.decision === 'Approved');
    return sum + (appr?.approved_amount || 0);
  }, 0);

  return (
    <div>
      {/* Top Banner & Quick Actions */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">NOC Operations & Sanctions Dashboard</h1>
          <div className="page-subheading">
            Charutar Vidya Mandal (CVM) & CVM University (CVMU) Central Procurement Cell
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/requests/create" className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Create New Request</span>
          </Link>
          <Link to="/quotations/compare" className="btn btn-secondary">
            <FileSpreadsheet size={16} />
            <span>Compare Quotations</span>
          </Link>
        </div>
      </div>

      {/* Sync Status Banner */}
      {!isConfigured && (
        <div className="alert alert-info" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            <span><strong>Offline / Local Storage Engine Active:</strong> Requests created on this device are saved in browser storage. To synchronize across laptops and mobile phones in real-time, connect your Supabase database in Settings.</span>
          </div>
          <Link to="/settings" className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap', marginLeft: 12 }}>
            Configure Cloud Sync →
          </Link>
        </div>
      )}

      {isConfigured && syncError && (
        <div className="alert alert-danger" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            <span><strong>Cloud Sync Warning:</strong> {syncError}</span>
          </div>
          <Link to="/settings" className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap', marginLeft: 12 }}>
            Check Settings →
          </Link>
        </div>
      )}

      {/* Primary Key Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-header">
            <span>TOTAL REQUESTS</span>
            <div className="metric-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <FileText size={16} />
            </div>
          </div>
          <div className="metric-value">{totalRequests}</div>
          <div className="metric-footer">
            <span>CVM & CVMU colleges</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span>PENDING QUOTATIONS</span>
            <div className="metric-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Clock size={16} />
            </div>
          </div>
          <div className="metric-value">{pendingQuotations}</div>
          <div className="metric-footer">
            <Link to="/requests?status=Pending Quotations">Awaiting vendor bids →</Link>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span>AWAITING APPROVAL</span>
            <div className="metric-icon-box" style={{ background: '#ffedd5', color: '#ea580c' }}>
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="metric-value">{awaitingApproval}</div>
          <div className="metric-footer">
            <Link to="/approvals">With Chairman / Registrar →</Link>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span>APPROVED REQUESTS</span>
            <div className="metric-icon-box" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="metric-value">{approvedRequests}</div>
          <div className="metric-footer">
            <span>Sanction letters issued</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span>WORK IN PROGRESS</span>
            <div className="metric-icon-box" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <Wrench size={16} />
            </div>
          </div>
          <div className="metric-value">{workInProgress}</div>
          <div className="metric-footer">
            <Link to="/work-tracking">Under execution →</Link>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span>COMPLETED WORK</span>
            <div className="metric-icon-box" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="metric-value">{completedWork}</div>
          <div className="metric-footer">
            <span>Installation verified</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span>PENDING BILLS</span>
            <div className="metric-icon-box" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <Receipt size={16} />
            </div>
          </div>
          <div className="metric-value">{pendingBills}</div>
          <div className="metric-footer">
            <Link to="/bills">Pending verification →</Link>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span>TOTAL SANCTIONED</span>
            <div className="metric-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ fontSize: 19, fontFamily: 'var(--font-mono)' }}>
            {formatCurrency(totalSanctioned)}
          </div>
          <div className="metric-footer">
            <span>Approved procurement volume</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Clock size={18} color="#2563eb" />
            <span>Recent NOC Requests & Case Activity</span>
          </div>
          <Link to="/requests" className="btn btn-secondary btn-sm">
            View All Requests <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Request No</th>
                <th>Org</th>
                <th>Institute / College</th>
                <th>Requirement Description</th>
                <th>Selected Vendor</th>
                <th>Approved Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map(req => {
                const inst = institutes.find(i => i.id === req.institute_id);
                const org = organizations.find(o => o.id === req.org_id);
                const selectedQuot = req.quotations?.find(q => q.is_selected);
                const agency = agencies.find(a => a.id === selectedQuot?.agency_id || (req.approvals?.[0]?.selected_agency_id));
                const approvedAmt = req.approvals?.find(a => a.decision === 'Approved')?.approved_amount || req.estimated_budget;

                return (
                  <tr key={req.id}>
                    <td>
                      <Link to={`/requests/${req.id}`} style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {req.request_no}
                      </Link>
                      {req.is_historical && (
                        <div style={{ fontSize: 10, color: '#94a3b8', fontStyle: 'italic' }}>Historical Sample</div>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={org?.code || 'CVM'} type="org" />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {inst?.name || 'N/A'}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        Out: {req.clg_out_no || '-'} | In: {req.clg_in_no || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                        {req.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Date: {formatDate(req.request_date)}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{agency?.name || '-'}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {formatCurrency(approvedAmt)}
                    </td>
                    <td>
                      <StatusBadge status={req.overall_status} />
                    </td>
                    <td>
                      <Link to={`/requests/${req.id}`} className="btn btn-secondary btn-sm">
                        Inspect
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
