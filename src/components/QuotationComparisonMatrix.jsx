import React, { useState } from 'react';
import { GitCompare, CheckCircle2, Download, Award, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate, generateQuotationComparisonPdf } from '../utils/pdfGenerator';
import { useAuth } from '../context/AuthContext';

export const QuotationComparisonMatrix = ({ request, agencies, institutes, onSelectQuotation }) => {
  const { permissions } = useAuth();
  const [selectedQuotId, setSelectedQuotId] = useState('');
  const [rationale, setRationale] = useState('');
  const [showSelectModal, setShowSelectModal] = useState(false);

  const quotations = request?.quotations || [];
  if (quotations.length === 0) {
    return (
      <div className="empty-state">
        <GitCompare className="empty-state-icon" />
        <div className="empty-state-title">No Quotations Available for Comparison</div>
        <div className="empty-state-desc">
          Add at least 2 agency quotations to generate the comparative statement and analysis.
        </div>
      </div>
    );
  }

  // Find lowest quotation total
  const minTotal = Math.min(...quotations.map(q => q.total_amount));

  const handleOpenSelection = (quotId) => {
    setSelectedQuotId(quotId);
    const existing = quotations.find(q => q.id === quotId);
    setRationale(existing?.selection_rationale || (existing?.total_amount === minTotal ? 'Lowest quoted price with required specifications.' : ''));
    setShowSelectModal(true);
  };

  const handleConfirmSelection = () => {
    if (!rationale.trim()) {
      alert('Please provide a brief justification / rationale for vendor selection.');
      return;
    }
    onSelectQuotation(request.id, selectedQuotId, rationale);
    setShowSelectModal(false);
  };

  const handleExportPdf = () => {
    const doc = generateQuotationComparisonPdf(request, institutes, agencies);
    doc.save(`Quotation_Comparison_${request.request_no}.pdf`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Comparative Statement of Quotations</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Comparison across {quotations.length} received agency bids for {request.request_no}
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleExportPdf}>
          <Download size={14} /> Download Comparative Sheet (PDF)
        </button>
      </div>

      <div className="table-container" style={{ marginBottom: 20 }}>
        <table className="matrix-table">
          <thead>
            <tr>
              <th style={{ width: '22%' }}>Comparison Criteria</th>
              {quotations.map(q => {
                const agency = agencies.find(a => a.id === q.agency_id);
                const isSelected = q.is_selected;
                const isLowest = q.total_amount === minTotal;
                return (
                  <th
                    key={q.id}
                    className={`matrix-vendor-col ${isSelected ? 'selected-vendor' : ''}`}
                    style={{ textAlign: 'center', verticalAlign: 'top', background: isSelected ? '#eff6ff' : '#f8fafc' }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{agency?.name || 'Vendor'}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Ref: {q.quotation_no || 'N/A'}</div>
                    <div style={{ marginTop: 6 }}>
                      {isSelected && (
                        <span className="badge badge-approved" style={{ fontSize: 10 }}>
                          <Award size={10} style={{ marginRight: 2 }} /> SELECTED
                        </span>
                      )}
                      {isLowest && !isSelected && (
                        <span className="lowest-price-tag">L1 Lowest</span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600 }}>Quotation Date</td>
              {quotations.map(q => (
                <td key={q.id} style={{ textAlign: 'center' }}>{formatDate(q.quotation_date)}</td>
              ))}
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Basic Subtotal Amount</td>
              {quotations.map(q => (
                <td key={q.id} style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(q.subtotal_amount)}
                </td>
              ))}
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>GST / Taxes</td>
              {quotations.map(q => (
                <td key={q.id} style={{ textAlign: 'center' }}>
                  {q.tax_percent}% ({formatCurrency(q.tax_amount)})
                </td>
              ))}
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Other / Freight Charges</td>
              {quotations.map(q => (
                <td key={q.id} style={{ textAlign: 'center' }}>
                  {q.other_charges ? formatCurrency(q.other_charges) : '₹0.00'}
                </td>
              ))}
            </tr>
            <tr style={{ background: '#f8fafc' }}>
              <td style={{ fontWeight: 700, color: '#0f172a' }}>Grand Total (INR)</td>
              {quotations.map(q => {
                const isLowest = q.total_amount === minTotal;
                return (
                  <td
                    key={q.id}
                    style={{
                      textAlign: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 14,
                      fontWeight: 700,
                      color: isLowest ? '#166534' : '#0f172a'
                    }}
                  >
                    {formatCurrency(q.total_amount)}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Delivery Timeline</td>
              {quotations.map(q => (
                <td key={q.id} style={{ textAlign: 'center' }}>{q.delivery_timeline || 'N/A'}</td>
              ))}
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Validity Period</td>
              {quotations.map(q => (
                <td key={q.id} style={{ textAlign: 'center' }}>{q.validity_date ? formatDate(q.validity_date) : 'N/A'}</td>
              ))}
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Vendor Remarks</td>
              {quotations.map(q => (
                <td key={q.id} style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>
                  {q.remarks || '-'}
                </td>
              ))}
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Action / Selection</td>
              {quotations.map(q => {
                const isSelected = q.is_selected;
                return (
                  <td key={q.id} style={{ textAlign: 'center' }}>
                    {isSelected ? (
                      <div>
                        <div style={{ color: '#166534', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <CheckCircle2 size={14} /> Selected Vendor
                        </div>
                        {q.selection_rationale && (
                          <div style={{ fontSize: 11, color: '#475569', marginTop: 4, fontStyle: 'italic' }}>
                            "{q.selection_rationale}"
                          </div>
                        )}
                        {permissions.canSelectQuotation && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ marginTop: 6, fontSize: 11 }}
                            onClick={() => handleOpenSelection(q.id)}
                          >
                            Edit Rationale
                          </button>
                        )}
                      </div>
                    ) : (
                      permissions.canSelectQuotation && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenSelection(q.id)}
                        >
                          Select for Approval
                        </button>
                      )
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Selection Modal */}
      {showSelectModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title">Vendor Quotation Selection</div>
              <button className="btn-icon" onClick={() => setShowSelectModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">
                <AlertCircle size={16} />
                <span>
                  Please enter the selection justification/rationale before submitting to the approval authority.
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Selection Rationale / Technical Justification <span className="required">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Lowest quoted rate complying with technical specifications and warranty terms..."
                  value={rationale}
                  onChange={e => setRationale(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowSelectModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirmSelection}>
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
