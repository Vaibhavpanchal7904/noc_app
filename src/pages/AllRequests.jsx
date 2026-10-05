import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Building2,
  Calendar,
  X,
  FileText,
  Trash2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency, formatDate } from '../utils/pdfGenerator';
import Papa from 'papaparse';

export const AllRequests = () => {
  const { requests, institutes, agencies, organizations, deleteRequest, refetchData } = useData();
  const { permissions } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters State
  const initialStatus = searchParams.get('status') || 'ALL';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('ALL');
  const [selectedInstitute, setSelectedInstitute] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter Logic
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Search term filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const inst = institutes.find(i => i.id === req.institute_id);
        const matchNo = req.request_no.toLowerCase().includes(term);
        const matchTitle = req.title.toLowerCase().includes(term);
        const matchInst = inst?.name.toLowerCase().includes(term);
        const matchOut = req.clg_out_no?.toLowerCase().includes(term);
        const matchIn = req.clg_in_no?.toLowerCase().includes(term);
        if (!matchNo && !matchTitle && !matchInst && !matchOut && !matchIn) return false;
      }

      // Organization filter
      if (selectedOrg !== 'ALL' && req.org_id !== selectedOrg) return false;

      // Institute filter
      if (selectedInstitute !== 'ALL' && req.institute_id !== selectedInstitute) return false;

      // Request type filter
      if (selectedType !== 'ALL' && req.request_type !== selectedType) return false;

      // Status filter
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'Historical' && !req.is_historical) return false;
        if (selectedStatus !== 'Historical' && req.overall_status !== selectedStatus) return false;
      }

      // Date Range
      if (startDate && req.request_date < startDate) return false;
      if (endDate && req.request_date > endDate) return false;

      return true;
    });
  }, [requests, institutes, searchTerm, selectedOrg, selectedInstitute, selectedType, selectedStatus, startDate, endDate]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedOrg('ALL');
    setSelectedInstitute('ALL');
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setStartDate('');
    setEndDate('');
    setSearchParams({});
  };

  const handleExportCsv = () => {
    const csvData = filteredRequests.map(r => {
      const inst = institutes.find(i => i.id === r.institute_id);
      const org = organizations.find(o => o.id === r.org_id);
      const approvedAmt = r.approvals?.find(a => a.decision === 'Approved')?.approved_amount || r.estimated_budget || '';
      return {
        'Request Number': r.request_no,
        'Organization': org?.code || 'CVM',
        'College / Institute': inst?.name || '',
        'Request Date': r.request_date,
        'College Outward No': r.clg_out_no || '',
        'NOC Inward No': r.clg_in_no || '',
        'Request Type': r.request_type,
        'Requirement Title': r.title,
        'Estimated Budget (INR)': r.estimated_budget || '',
        'Approved Amount (INR)': approvedAmt,
        'Current Status': r.overall_status,
        'Historical Flag': r.is_historical ? 'Yes' : 'No'
      };
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NOC_Requests_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">All College NOC Requests & Cases</h1>
          <div className="page-subheading">
            Manage university requirements, quotations, approvals, work tracking, and payment bills
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            className="btn btn-secondary" 
            onClick={async () => {
              setIsRefreshing(true);
              try {
                await refetchData(true);
              } catch (_) {}
              finally {
                setIsRefreshing(false);
              }
            }}
            disabled={isRefreshing}
            title="Refresh & Sync with Cloud Database"
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin-animation' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Cloud'}</span>
          </button>
          <button className="btn btn-secondary" onClick={handleExportCsv}>
            <Download size={16} /> Export to CSV
          </button>
          <Link to="/requests/create" className="btn btn-primary">
            <PlusCircle size={16} /> Register New Requirement
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by Request No, Title, College, Inward/Outward..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: 'auto' }}
          value={selectedOrg}
          onChange={e => {
            setSelectedOrg(e.target.value);
            setSelectedInstitute('ALL');
          }}
        >
          <option value="ALL">All Organizations</option>
          {organizations.map(org => (
            <option key={org.id} value={org.id}>{org.code}</option>
          ))}
        </select>

        <select
          className="form-control"
          style={{ width: 'auto', maxWidth: 220 }}
          value={selectedInstitute}
          onChange={e => setSelectedInstitute(e.target.value)}
        >
          <option value="ALL">All Colleges / Institutes</option>
          {institutes
            .filter(i => selectedOrg === 'ALL' || i.org_id === selectedOrg)
            .map(inst => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
        </select>

        <select
          className="form-control"
          style={{ width: 'auto' }}
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
        >
          <option value="ALL">All Request Types</option>
          <option value="New Purchase">New Purchase</option>
          <option value="Repair">Repair</option>
          <option value="Service">Service</option>
          <option value="Replacement">Replacement</option>
          <option value="Other">Other</option>
        </select>

        <select
          className="form-control"
          style={{ width: 'auto' }}
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="Pending Quotations">Pending Quotations</option>
          <option value="Awaiting Approval">Awaiting Approval</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Work In Progress">Work In Progress</option>
          <option value="Work Completed">Work Completed</option>
          <option value="Pending Bill">Pending Bill</option>
          <option value="Bill Approved">Bill Approved</option>
          <option value="Closed">Closed</option>
          <option value="Historical">Historical Records</option>
        </select>

        {(searchTerm || selectedOrg !== 'ALL' || selectedInstitute !== 'ALL' || selectedType !== 'ALL' || selectedStatus !== 'ALL' || startDate || endDate) && (
          <button className="btn btn-secondary btn-sm" onClick={resetFilters}>
            <X size={14} /> Clear Filters
          </button>
        )}
      </div>

      {/* Requests Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Request No</th>
              <th>Org</th>
              <th>College / Institute</th>
              <th>Requirement Title & Items</th>
              <th>Type</th>
              <th>Date</th>
              <th>Amount (Est / Appr)</th>
              <th>Stage / Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map(req => {
                const inst = institutes.find(i => i.id === req.institute_id);
                const org = organizations.find(o => o.id === req.org_id);
                const appr = req.approvals?.find(a => a.decision === 'Approved');
                const displayAmt = appr?.approved_amount || req.estimated_budget;

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
                      <div style={{ fontWeight: 500, maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {req.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {(req.items || []).length} item(s) • {(req.quotations || []).length} quotation(s)
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{req.request_type}</span>
                    </td>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                      {formatDate(req.request_date)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {displayAmt !== null && displayAmt !== undefined ? formatCurrency(displayAmt) : 'N/A'}
                    </td>
                    <td>
                      <StatusBadge status={req.overall_status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <Link to={`/requests/${req.id}`} className="btn btn-secondary btn-sm">
                          View Details
                        </Link>
                        {permissions.canDeleteRequest && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#dc2626', borderColor: '#fecaca', padding: '6px 8px' }}
                            title="Delete Request"
                            onClick={() => setRequestToDelete(req)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">
                    <FileText className="empty-state-icon" />
                    <div className="empty-state-title">No matching NOC requests found</div>
                    <div className="empty-state-desc">
                      Try adjusting your search criteria or register a new requirement.
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {requestToDelete && (
        <div className="modal-backdrop">
          <div className="modal-container" style={{ maxWidth: 480 }}>
            <div className="modal-header" style={{ borderBottomColor: '#fee2e2' }}>
              <div className="modal-title" style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Trash2 size={20} /> Delete Request {requestToDelete.request_no}
              </div>
              <button className="btn-icon" onClick={() => !isDeleting && setRequestToDelete(null)} disabled={isDeleting}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-danger" style={{ marginBottom: 16 }}>
                <AlertCircle size={18} />
                <div>
                  <strong>Permanent Action:</strong> This will delete request <strong>{requestToDelete.request_no}</strong> ({requestToDelete.title}) and all linked records across devices.
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>
                Are you sure you want to delete this NOC request? This action cannot be undone and will be logged in the audit trail.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRequestToDelete(null)} disabled={isDeleting}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: '#dc2626', borderColor: '#b91c1c' }}
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteRequest(requestToDelete.id);
                    setRequestToDelete(null);
                  } catch (err) {
                    console.error('Failed to delete request:', err);
                    alert('Failed to delete request. Please try again.');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
