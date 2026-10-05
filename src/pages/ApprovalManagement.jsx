import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, AlertCircle, CheckCircle2, XCircle, Search, Clock, Download, Building2, UserCheck, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/pdfGenerator';
import { StatusBadge } from '../components/StatusBadge';
import Papa from 'papaparse';

export const ApprovalManagement = () => {
  const { requests, institutes, agencies, authorities, organizations, submitApproval } = useData();
  const { permissions } = useAuth();
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [selectedOrg, setSelectedOrg] = useState('ALL');
  const [selectedAuthority, setSelectedAuthority] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected request for modal action
  const [selectedReq, setSelectedReq] = useState(null);
  const [apprForm, setApprForm] = useState({
    authority_id: '',
    selected_agency_id: '',
    decision: 'Approved',
    decision_date: new Date().toISOString().split('T')[0],
    approved_amount: '',
    decision_remarks: '',
    is_recorded_external: false
  });

  // Calculate Summary Statistics
  const stats = useMemo(() => {
    let totalSanctionedAmount = 0;
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

    requests.forEach(r => {
      const isAppr = r.approvals?.some(a => a.decision === 'Approved');
      const isRej = r.approvals?.some(a => a.decision === 'Rejected');
      const isPending = r.overall_status === 'Awaiting Approval' || (r.quotations?.length > 0 && (!r.approvals || r.approvals.length === 0));

      if (isAppr) {
        approvedCount++;
        const appr = r.approvals.find(a => a.decision === 'Approved');
        totalSanctionedAmount += (parseFloat(appr?.approved_amount) || parseFloat(r.estimated_budget) || 0);
      } else if (isRej) {
        rejectedCount++;
      } else if (isPending) {
        pendingCount++;
      }
    });

    return {
      total: requests.length,
      approved: approvedCount,
      pending: pendingCount,
      rejected: rejectedCount,
      totalAmount: totalSanctionedAmount
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const isPending = r.overall_status === 'Awaiting Approval' || (r.quotations?.length > 0 && (!r.approvals || r.approvals.length === 0));
      const isAppr = r.approvals?.some(a => a.decision === 'Approved');
      const isRej = r.approvals?.some(a => a.decision === 'Rejected');

      if (filterMode === 'pending' && !isPending) return false;
      if (filterMode === 'approved' && !isAppr) return false;
      if (filterMode === 'rejected' && !isRej) return false;

      // Org filter
      if (selectedOrg !== 'ALL' && r.org_id !== selectedOrg) return false;

      // Authority filter
      if (selectedAuthority !== 'ALL') {
        const hasAuth = r.approvals?.some(a => a.authority_id === selectedAuthority);
        if (!hasAuth) return false;
      }

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const inst = institutes.find(i => i.id === r.institute_id);
        const latestAppr = r.approvals?.[r.approvals.length - 1];
        const auth = authorities.find(a => a.id === latestAppr?.authority_id);
        const selectedQuot = r.quotations?.find(q => q.is_selected) || r.quotations?.[0];
        const agency = agencies.find(a => a.id === selectedQuot?.agency_id || latestAppr?.selected_agency_id);

        const matchNo = r.request_no?.toLowerCase().includes(term);
        const matchTitle = r.title?.toLowerCase().includes(term);
        const matchInst = inst?.name?.toLowerCase().includes(term);
        const matchAgency = agency?.name?.toLowerCase().includes(term);
        const matchAuth = auth?.title?.toLowerCase().includes(term) || auth?.officer_name?.toLowerCase().includes(term);

        if (!matchNo && !matchTitle && !matchInst && !matchAgency && !matchAuth) {
          return false;
        }
      }
      return true;
    });
  }, [requests, institutes, agencies, authorities, filterMode, selectedOrg, selectedAuthority, searchTerm]);

  const handleOpenDecision = (req) => {
    setSelectedReq(req);
    const selectedQuot = req.quotations?.find(q => q.is_selected) || req.quotations?.[0];
    const orgAuths = authorities.filter(a => a.org_id === req.org_id && a.is_active);
    setApprForm({
      authority_id: orgAuths[0]?.id || authorities[0]?.id || '',
      selected_agency_id: selectedQuot?.agency_id || agencies[0]?.id || '',
      decision: 'Approved',
      decision_date: new Date().toISOString().split('T')[0],
      approved_amount: selectedQuot ? String(selectedQuot.total_amount) : (req.estimated_budget ? String(req.estimated_budget) : '0'),
      decision_remarks: selectedQuot?.selection_rationale || '',
      is_recorded_external: false
    });
  };

  const handleSaveDecision = async (e) => {
    e.preventDefault();
    if (!apprForm.authority_id) {
      alert('Please select an approval authority.');
      return;
    }
    await submitApproval(selectedReq.id, apprForm);
    setSelectedReq(null);
  };

  const handleExportCsv = () => {
    const csvData = filteredRequests.map(r => {
      const inst = institutes.find(i => i.id === r.institute_id);
      const org = organizations.find(o => o.id === r.org_id);
      const selectedQuot = r.quotations?.find(q => q.is_selected) || r.quotations?.[0];
      const agency = agencies.find(a => a.id === selectedQuot?.agency_id || (r.approvals?.[0]?.selected_agency_id));
      const latestAppr = r.approvals?.[r.approvals.length - 1];
      const auth = authorities.find(a => a.id === latestAppr?.authority_id);
      const amount = latestAppr?.approved_amount || selectedQuot?.total_amount || r.estimated_budget || 0;

      const approverText = auth
        ? (auth.officer_name ? `${auth.title} (${auth.officer_name})` : auth.title)
        : (latestAppr ? 'Authorized Authority' : 'Pending Approval');

      const approvalDateText = latestAppr?.decision_date || latestAppr?.submission_date || r.request_date || '';

      return {
        'Request Number': r.request_no,
        'Organization': org?.code || 'CVM',
        'College / Department': inst?.name || '',
        'Requirement Title': r.title,
        'Selected Vendor': agency?.name || 'Pending Selection',
        'Sanction Amount (INR)': amount,
        'Approved By (Authority & Officer)': approverText,
        'Approval Date': approvalDateText,
        'Decision Status': latestAppr ? latestAppr.decision : r.overall_status,
        'Sanction Letter Number': r.approval_letter?.letter_no || 'Not Issued'
      };
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NOC_Approvals_Sanctions_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Approvals & Sanctions Register</h1>
          <div className="page-subheading">
            Central ledger of all NOC requests showing who approved each file, sanction dates, approved amounts, and formal authority orders.
          </div>
        </div>
        <button className="btn btn-secondary" onClick={handleExportCsv}>
          <Download size={16} /> Export Register (CSV)
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Total Requests</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-desc">All registered cases</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #16a34a' }}>
          <div className="stat-label" style={{ color: '#16a34a' }}>Sanctioned / Approved</div>
          <div className="stat-value" style={{ color: '#16a34a' }}>{stats.approved}</div>
          <div className="stat-desc">Formal orders granted</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-label" style={{ color: '#d97706' }}>Awaiting Approval</div>
          <div className="stat-value" style={{ color: '#d97706' }}>{stats.pending}</div>
          <div className="stat-desc">Pending authority sanction</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #2563eb' }}>
          <div className="stat-label">Total Sanctioned Value</div>
          <div className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: 20 }}>
            {formatCurrency(stats.totalAmount)}
          </div>
          <div className="stat-desc">Combined approved budget</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className={`btn btn-sm ${filterMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilterMode('all')}
                >
                  All ({requests.length})
                </button>
                <button
                  className={`btn btn-sm ${filterMode === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilterMode('pending')}
                >
                  Awaiting Decision ({stats.pending})
                </button>
                <button
                  className={`btn btn-sm ${filterMode === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilterMode('approved')}
                >
                  Approved ({stats.approved})
                </button>
                <button
                  className={`btn btn-sm ${filterMode === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilterMode('rejected')}
                >
                  Rejected ({stats.rejected})
                </button>
              </div>

              {/* Org Selector */}
              <select
                className="form-control form-control-sm"
                style={{ width: 'auto', minWidth: 140 }}
                value={selectedOrg}
                onChange={e => setSelectedOrg(e.target.value)}
              >
                <option value="ALL">All Organizations</option>
                {organizations.map(o => (
                  <option key={o.id} value={o.id}>{o.name} ({o.code})</option>
                ))}
              </select>

              {/* Authority Selector */}
              <select
                className="form-control form-control-sm"
                style={{ width: 'auto', minWidth: 200 }}
                value={selectedAuthority}
                onChange={e => setSelectedAuthority(e.target.value)}
              >
                <option value="ALL">All Approving Authorities</option>
                <optgroup label="CVM Authorities">
                  {authorities.filter(a => a.org_id === 'org-cvm' || a.org_code === 'CVM').map(a => (
                    <option key={a.id} value={a.id}>{a.title} {a.officer_name ? `— ${a.officer_name}` : ''}</option>
                  ))}
                </optgroup>
                <optgroup label="CVMU Authorities">
                  {authorities.filter(a => a.org_id === 'org-cvmu' || a.org_code === 'CVMU').map(a => (
                    <option key={a.id} value={a.id}>{a.title} {a.officer_name ? `— ${a.officer_name}` : ''}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="search-input-wrapper" style={{ minWidth: 260 }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search by Request No, College, Vendor, Approver..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Approvals & Sanctions Register Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '12%' }}>Request No</th>
                  <th style={{ width: '8%' }}>Org</th>
                  <th style={{ width: '18%' }}>College / Department</th>
                  <th style={{ width: '16%' }}>Requirement Title & Vendor</th>
                  <th style={{ width: '12%' }}>Sanction Amount</th>
                  <th style={{ width: '18%' }}>Approved By (Kisne Approve Kiya)</th>
                  <th style={{ width: '12%' }}>Approval Date (Kab)</th>
                  <th style={{ width: '10%' }}>Status</th>
                  <th style={{ width: '8%' }}>Sanction Order</th>
                  <th style={{ width: '8%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map(req => {
                    const inst = institutes.find(i => i.id === req.institute_id);
                    const org = organizations.find(o => o.id === req.org_id);
                    const selectedQuot = req.quotations?.find(q => q.is_selected) || req.quotations?.[0];
                    const agency = agencies.find(a => a.id === selectedQuot?.agency_id || (req.approvals?.[0]?.selected_agency_id));
                    const latestAppr = req.approvals?.[req.approvals.length - 1];
                    const auth = authorities.find(a => a.id === latestAppr?.authority_id);
                    const amount = latestAppr?.approved_amount || selectedQuot?.total_amount || req.estimated_budget;

                    return (
                      <tr key={req.id}>
                        <td>
                          <Link to={`/requests/${req.id}?tab=approval`} style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#2563eb' }}>
                            {req.request_no}
                          </Link>
                          {req.request_date && (
                            <div style={{ fontSize: 11, color: '#64748b' }}>
                              Req: {formatDate(req.request_date)}
                            </div>
                          )}
                        </td>
                        <td><StatusBadge status={org?.code || 'CVM'} type="org" /></td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>
                            {inst?.name || 'General'}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, color: '#0f172a' }}>
                            {req.title}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                            Vendor: <strong style={{ color: '#334155' }}>{agency?.name || 'Pending Selection'}</strong>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a' }}>
                          {formatCurrency(amount)}
                        </td>
                        <td>
                          {latestAppr ? (
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <UserCheck size={14} color="#16a34a" />
                                <span>{auth?.title || 'Sanctioning Authority'}</span>
                              </div>
                              {auth?.officer_name && (
                                <div style={{ fontSize: 11, color: '#475569', marginLeft: 18 }}>
                                  {auth.officer_name}
                                </div>
                              )}
                              {latestAppr.is_recorded_external && (
                                <div style={{ fontSize: 10, color: '#d97706', fontWeight: 600, marginLeft: 18 }}>
                                  (Offline Signed Paper)
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
                              Pending Authority Sanction
                            </div>
                          )}
                        </td>
                        <td>
                          {latestAppr?.decision_date ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500, color: '#0f172a' }}>
                              <Calendar size={13} color="#64748b" />
                              <span>{formatDate(latestAppr.decision_date)}</span>
                            </div>
                          ) : latestAppr?.submission_date ? (
                            <div style={{ fontSize: 11, color: '#64748b' }}>
                              Submitted: {formatDate(latestAppr.submission_date)}
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>-</span>
                          )}
                        </td>
                        <td>
                          <StatusBadge status={latestAppr ? latestAppr.decision : req.overall_status} />
                        </td>
                        <td>
                          {req.approval_letter ? (
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#16a34a' }}>
                              {req.approval_letter.letter_no}
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>Not Issued</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {permissions.canApprove && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleOpenDecision(req)}
                                title="Record or Update Approval"
                              >
                                {latestAppr ? 'Update' : 'Decide'}
                              </button>
                            )}
                            <Link to={`/requests/${req.id}?tab=approval`} className="btn btn-secondary btn-sm">
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10}>
                      <div className="empty-state">
                        <CheckSquare className="empty-state-icon" />
                        <div className="empty-state-title">No requests match the selected approval criteria</div>
                        <div className="empty-state-desc">Try clearing filters or search terms.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      {selectedReq && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-lg">
            <div className="modal-header">
              <div className="modal-title">Record Approval Decision for {selectedReq.request_no}</div>
              <button className="btn-icon" onClick={() => setSelectedReq(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveDecision}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Approval Authority <span className="required">*</span></label>
                    <select
                      className="form-control"
                      value={apprForm.authority_id}
                      onChange={e => setApprForm({ ...apprForm, authority_id: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Authority --</option>
                      {authorities
                        .filter(a => a.org_id === selectedReq.org_id && a.is_active)
                        .map(a => (
                          <option key={a.id} value={a.id}>
                            {a.title} {a.officer_name ? `(${a.officer_name})` : ''}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Selected Agency / Vendor <span className="required">*</span></label>
                    <select
                      className="form-control"
                      value={apprForm.selected_agency_id}
                      onChange={e => setApprForm({ ...apprForm, selected_agency_id: e.target.value })}
                      required
                    >
                      {agencies.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Decision <span className="required">*</span></label>
                    <select
                      className="form-control"
                      value={apprForm.decision}
                      onChange={e => setApprForm({ ...apprForm, decision: e.target.value })}
                      required
                    >
                      <option value="Approved">Approved (Sanctioned)</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Returned for Clarification">Returned for Clarification</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Decision Date <span className="required">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      value={apprForm.decision_date}
                      onChange={e => setApprForm({ ...apprForm, decision_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Approved Sanction Amount (INR) <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                      value={apprForm.approved_amount}
                      onChange={e => setApprForm({ ...apprForm, approved_amount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={apprForm.is_recorded_external}
                      onChange={e => setApprForm({ ...apprForm, is_recorded_external: e.target.checked })}
                    />
                    <span>Recorded Physical Offline Approval (Chairman/Officer signed physical paper)</span>
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Decision Remarks / Order Notes</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Enter approval conditions, budget allocation head, or return reasons..."
                    value={apprForm.decision_remarks}
                    onChange={e => setApprForm({ ...apprForm, decision_remarks: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedReq(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Approval Decision</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
