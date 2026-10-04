import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, Search, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatCurrency, formatDate } from '../utils/pdfGenerator';
import { StatusBadge } from '../components/StatusBadge';

export const BillsPage = () => {
  const { requests, institutes, agencies } = useData();
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Collect all bills
  const allBills = requests.flatMap(req => {
    const inst = institutes.find(i => i.id === req.institute_id);
    const approvedQuotAmt = req.approvals?.find(a => a.decision === 'Approved')?.approved_amount || req.estimated_budget;
    return (req.bills || []).map(b => ({
      ...b,
      request_id: req.id,
      request_no: req.request_no,
      request_title: req.title,
      institute_name: inst?.name || 'N/A',
      approved_quot_amt: approvedQuotAmt
    }));
  });

  const filtered = allBills.filter(b => {
    if (filterStatus !== 'ALL' && b.bill_status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const ag = agencies.find(a => a.id === b.agency_id);
      const matchNo = b.bill_no.toLowerCase().includes(term);
      const matchReq = b.request_no.toLowerCase().includes(term);
      const matchAg = ag?.name.toLowerCase().includes(term);
      const matchInst = b.institute_name.toLowerCase().includes(term);
      if (!matchNo && !matchReq && !matchAg && !matchInst) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Vendor Bills & Payment Clearances</h1>
          <div className="page-subheading">
            Track submitted vendor invoices, compare against sanctioned quotation amounts, and monitor approvals.
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div style={{ display: 'flex', gap: 8 }}>
          {['ALL', 'Submitted', 'Approved', 'Paid', 'Rejected'].map(st => (
            <button
              key={st}
              className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterStatus(st)}
            >
              {st === 'ALL' ? 'All Bills' : st}
            </button>
          ))}
        </div>

        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by Bill No, Request No, Vendor, College..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bill / Invoice No</th>
              <th>Bill Date</th>
              <th>Agency / Vendor</th>
              <th>NOC Request Ref</th>
              <th>College / Department</th>
              <th>Sanctioned Amount</th>
              <th>Submitted Bill Amount</th>
              <th>Bill Approved Amount</th>
              <th>Status</th>
              <th>Payment Ref</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(b => {
                const ag = agencies.find(a => a.id === b.agency_id);
                return (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{b.bill_no}</td>
                    <td>{formatDate(b.bill_date)}</td>
                    <td style={{ fontWeight: 600 }}>{ag?.name || '-'}</td>
                    <td>
                      <Link to={`/requests/${b.request_id}`} style={{ fontWeight: 600, color: '#2563eb' }}>
                        {b.request_no}
                      </Link>
                    </td>
                    <td>
                      <div style={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {b.institute_name}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(b.approved_quot_amt)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {formatCurrency(b.submitted_amount)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#166534' }}>
                      {b.approved_amount ? formatCurrency(b.approved_amount) : '-'}
                    </td>
                    <td>
                      <StatusBadge status={b.bill_status} />
                    </td>
                    <td style={{ fontSize: 12 }}>{b.payment_ref || '-'}</td>
                    <td>
                      <Link to={`/requests/${b.request_id}`} className="btn btn-secondary btn-sm">
                        Inspect
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11}>
                  <div className="empty-state">
                    <Receipt className="empty-state-icon" />
                    <div className="empty-state-title">No vendor bills match the filter</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
