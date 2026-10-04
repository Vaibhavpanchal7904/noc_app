import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileSpreadsheet, Search, Filter, GitCompare, Building2, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatCurrency, formatDate } from '../utils/pdfGenerator';
import { StatusBadge } from '../components/StatusBadge';

export const QuotationsList = () => {
  const { requests, agencies, institutes, organizations } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('ALL');

  // Flatten all quotations across requests
  const allQuotations = requests.flatMap(req => {
    const inst = institutes.find(i => i.id === req.institute_id);
    const org = organizations.find(o => o.id === req.org_id);
    return (req.quotations || []).map(q => ({
      ...q,
      request_id: req.id,
      request_no: req.request_no,
      request_title: req.title,
      institute_name: inst?.name || 'N/A',
      org_code: org?.code || 'CVM'
    }));
  });

  const filtered = allQuotations.filter(q => {
    const agency = agencies.find(a => a.id === q.agency_id);
    if (selectedAgency !== 'ALL' && q.agency_id !== selectedAgency) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchNo = q.quotation_no?.toLowerCase().includes(term);
      const matchReq = q.request_no.toLowerCase().includes(term);
      const matchAg = agency?.name.toLowerCase().includes(term);
      const matchInst = q.institute_name.toLowerCase().includes(term);
      if (!matchNo && !matchReq && !matchAg && !matchInst) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Vendor Quotations Repository</h1>
          <div className="page-subheading">
            Overview of all quotations received from registered agencies across CVM & CVMU requests
          </div>
        </div>
        <Link to="/quotations/compare" className="btn btn-primary">
          <GitCompare size={16} /> Quotation Comparison Matrix
        </Link>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by Quotation No, Request No, Agency, College..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: 'auto' }}
          value={selectedAgency}
          onChange={e => setSelectedAgency(e.target.value)}
        >
          <option value="ALL">All Agencies ({agencies.length})</option>
          {agencies.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Quotation Ref</th>
              <th>Agency / Vendor</th>
              <th>NOC Request</th>
              <th>College / Department</th>
              <th>Quotation Date</th>
              <th>Subtotal</th>
              <th>GST / Tax</th>
              <th>Total Amount (INR)</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(q => {
                const ag = agencies.find(a => a.id === q.agency_id);
                return (
                  <tr key={q.id} style={{ background: q.is_selected ? '#f0fdf4' : 'transparent' }}>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {q.quotation_no || 'Ref Pending'}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{ag?.name || 'Agency'}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{ag?.phone}</div>
                    </td>
                    <td>
                      <Link to={`/requests/${q.request_id}`} style={{ fontWeight: 600, color: '#2563eb' }}>
                        {q.request_no}
                      </Link>
                    </td>
                    <td>
                      <div style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {q.institute_name}
                      </div>
                    </td>
                    <td>{formatDate(q.quotation_date)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(q.subtotal_amount)}</td>
                    <td>{q.tax_percent}% ({formatCurrency(q.tax_amount)})</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a' }}>
                      {formatCurrency(q.total_amount)}
                    </td>
                    <td>
                      {q.is_selected ? (
                        <span className="badge badge-approved">
                          <CheckCircle2 size={12} style={{ marginRight: 2 }} /> Selected
                        </span>
                      ) : (
                        <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>
                          Quoted
                        </span>
                      )}
                    </td>
                    <td>
                      <Link to={`/requests/${q.request_id}`} className="btn btn-secondary btn-sm">
                        Inspect
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10}>
                  <div className="empty-state">
                    <FileSpreadsheet className="empty-state-icon" />
                    <div className="empty-state-title">No quotations match the filter</div>
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
