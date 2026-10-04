import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, AlertCircle, CheckCircle2, XCircle, Search, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/pdfGenerator';
import { StatusBadge } from '../components/StatusBadge';

export const ApprovalManagement = () => {
  const { requests, institutes, agencies, authorities, organizations, submitApproval } = useData();
  const { permissions } = useAuth();
  const [filterMode, setFilterMode] = useState('pending'); // 'pending', 'all', 'approved', 'rejected'
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

  const filteredRequests = requests.filter(r => {
    const isPending = r.overall_status === 'Awaiting Approval' || (r.quotations?.length > 0 && r.approvals?.length === 0);
    const isAppr = r.approvals?.some(a => a.decision === 'Approved');
    const isRej = r.approvals?.some(a => a.decision === 'Rejected');

    if (filterMode === 'pending' && !isPending) return false;
    if (filterMode === 'approved' && !isAppr) return false;
    if (filterMode === 'rejected' && !isRej) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const inst = institutes.find(i => i.id === r.institute_id);
      if (!r.request_no.toLowerCase().includes(term) && !r.title.toLowerCase().includes(term) && !inst?.name.toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });

  const handleOpenDecision = (req) => {
    setSelectedReq(req);
    const selectedQuot = req.quotations?.find(q => q.is_selected) || req.quotations?.[0];
    const orgAuths = authorities.filter(a => a.org_id === req.org_id && a.is_active);
    setApprForm({
      authority_id: orgAuths[0]?.id || '',
      selected_agency_id: selectedQuot?.agency_id || agencies[0]?.id || '',
      decision: 'Approved',
      decision_date: new Date().toISOString().split('T')[0],
      approved_amount: selectedQuot ? String(selectedQuot.total_amount) : (req.estimated_budget ? String(req.estimated_budget) : '0'),
      decision_remarks: '',
      is_recorded_external: false
    });
  };

  const handleSaveDecision = (e) => {
    e.preventDefault();
    if (!apprForm.authority_id) {
      alert('Please select an approval authority.');
      return;
    }
    submitApproval(selectedReq.id, apprForm);
    setSelectedReq(null);
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Approval Management & Sanction Decisions</h1>
          <div className="page-subheading">
            Review submitted college requirements, evaluate selected vendor quotations, and record sanction orders.
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${filterMode === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterMode('pending')}
          >
            Awaiting Decisions ({requests.filter(r => r.overall_status === 'Awaiting Approval' || (r.quotations?.length > 0 && r.approvals?.length === 0)).length})
          </button>
          <button
            className={`btn btn-sm ${filterMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterMode('all')}
          >
            All Requests ({requests.length})
          </button>
          <button
            className={`btn btn-sm ${filterMode === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterMode('approved')}
          >
            Sanctioned / Approved
          </button>
          <button
            className={`btn btn-sm ${filterMode === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterMode('rejected')}
          >
            Rejected
          </button>
        </div>

        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search cases for approval..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Request No</th>
              <th>Org</th>
              <th>College / Department</th>
              <th>Requirement Title</th>
              <th>Selected Vendor</th>
              <th>Quoted / Sanction Amount</th>
              <th>Decision Status</th>
              <th>Authority</th>
              <th>Action</th>
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
                      <Link to={`/requests/${req.id}`} style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {req.request_no}
                      </Link>
                    </td>
                    <td><StatusBadge status={org?.code || 'CVM'} type="org" /></td>
                    <td>
                      <div style={{ fontWeight: 600, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {inst?.name}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {req.title}
                      </div>
                    </td>
                    <td>{agency?.name || 'Pending Selection'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {formatCurrency(amount)}
                    </td>
                    <td>
                      <StatusBadge status={latestAppr ? latestAppr.decision : req.overall_status} />
                    </td>
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>
                        {auth?.title || (req.org_id === 'org-cvmu' ? 'Registrar / Provost' : 'Chairman / Hon. Jt Sec')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {permissions.canApprove && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenDecision(req)}
                          >
                            Decide
                          </button>
                        )}
                        <Link to={`/requests/${req.id}`} className="btn btn-secondary btn-sm">
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">
                    <CheckSquare className="empty-state-icon" />
                    <div className="empty-state-title">No requests found in this approval state</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
                          <option key={a.id} value={a.id}>{a.title} {a.officer_name ? `(${a.officer_name})` : ''}</option>
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
                    <span>Recorded Physical Offline Approval (NOC staff recorded external approval)</span>
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Decision Remarks</label>
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
