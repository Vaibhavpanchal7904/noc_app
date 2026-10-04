import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, Search, Printer, FileText, Send } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatCurrency, formatDate, generateApprovalLetterPdf } from '../utils/pdfGenerator';
import { StatusBadge } from '../components/StatusBadge';

export const ApprovalLetters = () => {
  const { requests, institutes, agencies, organizations, letterSettings } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // Collect all requests that have an approval letter
  const letterRecords = requests
    .filter(r => Boolean(r.approval_letter))
    .map(r => {
      const inst = institutes.find(i => i.id === r.institute_id);
      const org = organizations.find(o => o.id === r.org_id);
      const agency = agencies.find(a => a.id === (r.approvals?.[0]?.selected_agency_id || r.quotations?.find(q => q.is_selected)?.agency_id));
      const amount = r.approvals?.find(a => a.decision === 'Approved')?.approved_amount || r.estimated_budget;
      return {
        request: r,
        letter: r.approval_letter,
        institute: inst,
        agency,
        organization: org,
        amount
      };
    });

  const filtered = letterRecords.filter(item => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchNo = item.letter.letter_no.toLowerCase().includes(term);
      const matchReq = item.request.request_no.toLowerCase().includes(term);
      const matchInst = item.institute?.name.toLowerCase().includes(term);
      if (!matchNo && !matchReq && !matchInst) return false;
    }
    return true;
  });

  const handleDownloadPdf = (item) => {
    const doc = generateApprovalLetterPdf(
      item.request,
      item.letter,
      item.institute,
      item.agency,
      item.organization,
      letterSettings
    );
    doc.save(`Approval_Letter_${item.letter.letter_no.replace(/[\/\\]/g, '_')}.pdf`);
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Issued Sanction & Approval Letters</h1>
          <div className="page-subheading">
            Official university sanction letters dispatched to colleges and departments.
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by Letter Number, Request Number, College..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Letter Reference No</th>
              <th>Letter Date</th>
              <th>Organization</th>
              <th>College / Institute</th>
              <th>NOC Request Ref</th>
              <th>Sanctioned Vendor</th>
              <th>Sanction Amount</th>
              <th>Dispatch Mode & Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(item => (
                <tr key={item.letter.id}>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#2563eb' }}>
                    {item.letter.letter_no}
                  </td>
                  <td>{formatDate(item.letter.letter_date)}</td>
                  <td><StatusBadge status={item.organization?.code || 'CVM'} type="org" /></td>
                  <td>
                    <div style={{ fontWeight: 600, maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.institute?.name}
                    </div>
                  </td>
                  <td>
                    <Link to={`/requests/${item.request.id}`} style={{ fontWeight: 600 }}>
                      {item.request.request_no}
                    </Link>
                  </td>
                  <td>{item.agency?.name || '-'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#166534' }}>
                    {formatCurrency(item.amount)}
                  </td>
                  <td>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{item.letter.dispatch_mode}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{formatDate(item.letter.dispatch_date)}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        title="Download PDF"
                        onClick={() => handleDownloadPdf(item)}
                      >
                        <Download size={14} /> PDF
                      </button>
                      <Link to={`/requests/${item.request.id}`} className="btn btn-secondary btn-sm">
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">
                    <Award className="empty-state-icon" />
                    <div className="empty-state-title">No issued approval letters found</div>
                    <div className="empty-state-desc">
                      Generate sanction letters from approved cases under All Requests.
                    </div>
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
