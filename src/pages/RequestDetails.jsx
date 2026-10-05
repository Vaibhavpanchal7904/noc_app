import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  FileText,
  FileSpreadsheet,
  CheckSquare,
  Award,
  Wrench,
  Receipt,
  FolderOpen,
  Camera,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Printer,
  History,
  Lock,
  Unlock,
  Upload
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency, formatDate, generateApprovalLetterPdf } from '../utils/pdfGenerator';
import { QuotationComparisonMatrix } from '../components/QuotationComparisonMatrix';
import { ScannerModal } from '../components/ScannerModal';
import { DocumentViewerModal } from '../components/DocumentViewerModal';

export const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    requests,
    institutes,
    agencies,
    organizations,
    authorities,
    letterSettings,
    documents,
    updateRequest,
    addQuotation,
    selectQuotation,
    submitApproval,
    issueApprovalLetter,
    updateWorkStatus,
    addBill,
    closeRequest,
    reopenRequest,
    deleteRequest,
    addDocument,
    getNextLetterNo
  } = useData();
  const { currentUser, permissions } = useAuth();

  const request = requests.find(r => r.id === id);

  // Active Tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'quotations', 'approval', 'letter', 'work', 'bills', 'documents', 'history'

  // Modals State
  const [showAddQuotModal, setShowAddQuotModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState(null);

  // Forms State
  // 1. Add Quotation Form
  const [quotForm, setQuotForm] = useState({
    agency_id: '',
    quotation_no: '',
    quotation_date: new Date().toISOString().split('T')[0],
    subtotal_amount: '',
    tax_percent: '18.00',
    tax_amount: '',
    other_charges: '0.00',
    total_amount: '',
    validity_date: '',
    delivery_timeline: '15 Days',
    remarks: ''
  });

  // 2. Approval Form
  const [apprForm, setApprForm] = useState({
    authority_id: '',
    selected_agency_id: '',
    proposed_amount: '',
    decision: 'Approved',
    decision_date: new Date().toISOString().split('T')[0],
    approved_amount: '',
    decision_remarks: '',
    is_recorded_external: false
  });

  // 3. Approval Letter Form
  const [letterForm, setLetterForm] = useState({
    letter_no: '',
    letter_date: new Date().toISOString().split('T')[0],
    signatory_title: 'Hon. Joint Secretary',
    signatory_name: 'Shri Prayasvin Patel',
    subject: '',
    dispatch_date: '',
    dispatch_mode: 'Internal Dispatch',
    recipient_name: '',
    dispatch_remarks: ''
  });

  // 4. Work Update Form
  const [workForm, setWorkForm] = useState({
    agency_id: '',
    status: 'In Progress',
    start_date: new Date().toISOString().split('T')[0],
    completion_date: '',
    engineer_name: '',
    remarks: ''
  });

  // 5. Bill Form
  const [billForm, setBillForm] = useState({
    agency_id: '',
    bill_no: '',
    bill_date: new Date().toISOString().split('T')[0],
    submitted_amount: '',
    bill_approval_date: new Date().toISOString().split('T')[0],
    approved_amount: '',
    bill_status: 'Submitted',
    payment_ref: '',
    remarks: ''
  });

  // 6. Closure / Reopen reasons
  const [closureReason, setClosureReason] = useState('All procurement, installation, and bill settlements completed.');
  const [reopenReason, setReopenReason] = useState('');

  if (!request) {
    return (
      <div className="empty-state">
        <AlertCircle className="empty-state-icon" />
        <div className="empty-state-title">Request Not Found</div>
        <div className="empty-state-desc">The requested NOC file does not exist or has been archived.</div>
        <Link to="/requests" className="btn btn-primary" style={{ marginTop: 12 }}>
          Back to All Requests
        </Link>
      </div>
    );
  }

  const inst = institutes.find(i => i.id === request.institute_id);
  const org = organizations.find(o => o.id === request.org_id);
  const requestDocs = documents.filter(d => d.request_id === request.id);

  // Workflow Stages Checklist
  const hasQuotations = (request.quotations || []).length > 0;
  const hasSelectedQuot = request.quotations?.some(q => q.is_selected);
  const latestApproval = request.approvals?.[request.approvals.length - 1];
  const isApproved = latestApproval?.decision === 'Approved';
  const hasLetter = Boolean(request.approval_letter);
  const isWorkCompleted = request.work_record?.status === 'Completed';
  const hasApprovedBill = request.bills?.some(b => b.bill_status === 'Approved');
  const isClosed = request.overall_status === 'Closed';

  // Selected Vendor
  const selectedAgencyId = latestApproval?.selected_agency_id || request.quotations?.find(q => q.is_selected)?.agency_id || request.work_record?.agency_id;
  const selectedAgency = agencies.find(a => a.id === selectedAgencyId);

  // Filter authorities for the request's organization
  const orgAuthorities = authorities.filter(a => a.org_id === request.org_id && a.is_active);

  // Handlers
  const handleOpenAddQuotation = () => {
    setQuotForm({
      agency_id: agencies[0]?.id || '',
      quotation_no: '',
      quotation_date: new Date().toISOString().split('T')[0],
      subtotal_amount: request.estimated_budget ? String(request.estimated_budget) : '',
      tax_percent: '18.00',
      tax_amount: '',
      other_charges: '0.00',
      total_amount: '',
      validity_date: '',
      delivery_timeline: '15 Days',
      remarks: ''
    });
    setShowAddQuotModal(true);
  };

  const handleQuotSubtotalChange = (val) => {
    const sub = parseFloat(val) || 0;
    const taxP = parseFloat(quotForm.tax_percent) || 0;
    const taxA = Math.round(((sub * taxP) / 100) * 100) / 100;
    const oth = parseFloat(quotForm.other_charges) || 0;
    const tot = sub + taxA + oth;
    setQuotForm(prev => ({
      ...prev,
      subtotal_amount: val,
      tax_amount: String(taxA),
      total_amount: String(tot)
    }));
  };

  const handleSaveQuotation = (e) => {
    e.preventDefault();
    if (!quotForm.agency_id) {
      alert('Please select an agency.');
      return;
    }
    if (!quotForm.subtotal_amount) {
      alert('Please enter quoted amount.');
      return;
    }
    addQuotation(request.id, quotForm);
    setShowAddQuotModal(false);
  };

  const handleOpenApprovalModal = () => {
    const selectedQuot = request.quotations?.find(q => q.is_selected) || request.quotations?.[0];
    const defaultAuth = orgAuthorities[0]?.id || '';
    setApprForm({
      authority_id: defaultAuth,
      selected_agency_id: selectedQuot?.agency_id || agencies[0]?.id || '',
      proposed_amount: selectedQuot ? String(selectedQuot.total_amount) : (request.estimated_budget ? String(request.estimated_budget) : '0'),
      decision: 'Approved',
      decision_date: new Date().toISOString().split('T')[0],
      approved_amount: selectedQuot ? String(selectedQuot.total_amount) : (request.estimated_budget ? String(request.estimated_budget) : '0'),
      decision_remarks: '',
      is_recorded_external: false
    });
    setShowApprovalModal(true);
  };

  const handleSaveApproval = (e) => {
    e.preventDefault();
    if (!apprForm.authority_id) {
      alert('Please select the approval authority.');
      return;
    }
    submitApproval(request.id, apprForm);
    setShowApprovalModal(false);
  };

  const handleOpenLetterModal = () => {
    const nextNo = getNextLetterNo(org?.code || 'CVM');
    const isCvmu = org?.code === 'CVMU';
    setLetterForm({
      letter_no: request.approval_letter?.letter_no || nextNo,
      letter_date: request.approval_letter?.letter_date || new Date().toISOString().split('T')[0],
      signatory_title: isCvmu ? letterSettings.signatoryTitleCvmu : letterSettings.signatoryTitleCvm,
      signatory_name: isCvmu ? letterSettings.signatoryNameCvmu : letterSettings.signatoryNameCvm,
      subject: request.approval_letter?.subject || `Sanction order for ${request.title}`,
      dispatch_date: request.approval_letter?.dispatch_date || new Date().toISOString().split('T')[0],
      dispatch_mode: request.approval_letter?.dispatch_mode || 'Internal Dispatch',
      recipient_name: request.approval_letter?.recipient_name || `The Principal, ${inst?.name}`,
      dispatch_remarks: request.approval_letter?.dispatch_remarks || ''
    });
    setShowLetterModal(true);
  };

  const handleSaveLetter = (e) => {
    e.preventDefault();
    issueApprovalLetter(request.id, letterForm);
    setShowLetterModal(false);
  };

  const handleDownloadLetterPdf = () => {
    if (!request.approval_letter) return;
    const doc = generateApprovalLetterPdf(
      request,
      request.approval_letter,
      inst,
      selectedAgency,
      org,
      letterSettings
    );
    doc.save(`Approval_Letter_${request.approval_letter.letter_no.replace(/[\/\\]/g, '_')}.pdf`);
  };

  const handleOpenWorkModal = () => {
    setWorkForm({
      agency_id: selectedAgencyId || agencies[0]?.id || '',
      status: request.work_record?.status || 'In Progress',
      start_date: request.work_record?.start_date || new Date().toISOString().split('T')[0],
      completion_date: request.work_record?.completion_date || '',
      engineer_name: request.work_record?.engineer_name || '',
      remarks: request.work_record?.remarks || ''
    });
    setShowWorkModal(true);
  };

  const handleSaveWork = (e) => {
    e.preventDefault();
    updateWorkStatus(request.id, workForm);
    setShowWorkModal(false);
  };

  const handleOpenBillModal = () => {
    const apprAmt = latestApproval?.approved_amount || request.estimated_budget || '0';
    setBillForm({
      agency_id: selectedAgencyId || agencies[0]?.id || '',
      bill_no: '',
      bill_date: new Date().toISOString().split('T')[0],
      submitted_amount: String(apprAmt),
      bill_approval_date: new Date().toISOString().split('T')[0],
      approved_amount: String(apprAmt),
      bill_status: 'Submitted',
      payment_ref: '',
      remarks: ''
    });
    setShowBillModal(true);
  };

  const handleSaveBill = (e) => {
    e.preventDefault();
    if (!billForm.bill_no.trim()) {
      alert('Please enter bill/invoice number.');
      return;
    }
    if (!billForm.submitted_amount) {
      alert('Please enter submitted amount.');
      return;
    }
    addBill(request.id, billForm);
    setShowBillModal(false);
  };

  const handleSaveScan = (scannedDoc) => {
    addDocument(request.id, scannedDoc);
  };

  return (
    <div>
      {/* Top Navigation & Status Banner */}
      <div className="page-header-row">
        <div>
          <Link to="/requests" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 8, color: '#64748b' }}>
            <ArrowLeft size={14} /> Back to Requests List
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 className="page-title" style={{ fontFamily: 'var(--font-mono)' }}>{request.request_no}</h1>
            <StatusBadge status={org?.code || 'CVM'} type="org" />
            <StatusBadge status={request.overall_status} />
            {request.is_historical && (
              <span className="badge" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                Historical Case Record
              </span>
            )}
          </div>
          <div className="page-subheading" style={{ marginTop: 4 }}>
            {inst?.name} • Registered on {formatDate(request.request_date)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setShowScannerModal(true)}>
            <Camera size={16} /> Scan Document
          </button>

          {!isClosed ? (
            <button className="btn btn-secondary" onClick={() => setShowCloseModal(true)}>
              <Lock size={16} /> Close Case
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={() => setShowReopenModal(true)}>
              <Unlock size={16} /> Reopen Case
            </button>
          )}

          {permissions.canDeleteRequest && (
            <button
              className="btn btn-secondary"
              style={{ color: '#dc2626', borderColor: '#fca5a5' }}
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={16} /> Delete Request
            </button>
          )}
        </div>
      </div>

      {/* 8-Stage Visual Stepper */}
      <div className="workflow-stepper">
        <div className={`workflow-step completed`}>
          <div className="step-indicator">1</div>
          <div className="step-label">Requirement</div>
        </div>
        <div className={`workflow-step ${hasQuotations ? 'completed' : 'current'}`}>
          <div className="step-indicator">2</div>
          <div className="step-label">Quotations ({request.quotations?.length || 0})</div>
        </div>
        <div className={`workflow-step ${isApproved ? 'completed' : (hasQuotations ? 'current' : '')}`}>
          <div className="step-indicator">3</div>
          <div className="step-label">Approval ({latestApproval ? latestApproval.decision : 'Pending'})</div>
        </div>
        <div className={`workflow-step ${hasLetter ? 'completed' : (isApproved ? 'current' : '')}`}>
          <div className="step-indicator">4</div>
          <div className="step-label">Sanction Letter</div>
        </div>
        <div className={`workflow-step ${isWorkCompleted ? 'completed' : (hasLetter ? 'current' : '')}`}>
          <div className="step-indicator">5</div>
          <div className="step-label">Work Tracking</div>
        </div>
        <div className={`workflow-step ${hasApprovedBill ? 'completed' : (isWorkCompleted ? 'current' : '')}`}>
          <div className="step-indicator">6</div>
          <div className="step-label">Bill Verification</div>
        </div>
        <div className={`workflow-step ${isClosed ? 'completed' : ''}`}>
          <div className="step-indicator">7</div>
          <div className="step-label">Case Closure</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: 20, overflowX: 'auto', gap: 4 }}>
        {[
          { key: 'overview', label: '1. Overview & Items', icon: FileText },
          { key: 'quotations', label: `2. Quotations (${request.quotations?.length || 0})`, icon: FileSpreadsheet },
          { key: 'approval', label: `3. Approvals (${request.approvals?.length || 0})`, icon: CheckSquare },
          { key: 'letter', label: '4. Sanction Letter', icon: Award },
          { key: 'work', label: '5. Work Progress', icon: Wrench },
          { key: 'bills', label: `6. Bills (${request.bills?.length || 0})`, icon: Receipt },
          { key: 'documents', label: `7. Documents (${requestDocs.length})`, icon: FolderOpen }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                border: 'none',
                background: 'transparent',
                borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                color: isActive ? '#2563eb' : '#64748b',
                fontWeight: isActive ? 600 : 500,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ITEMS */}
      {activeTab === 'overview' && (
        <div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Requirement Overview & College References</div>
            </div>
            <div className="card-body">
              <div className="form-row" style={{ marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Managing Organization</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{org?.name} ({org?.code})</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>College / Department</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{inst?.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Request Type</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{request.request_type}</div>
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>College Outward Letter No</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{request.clg_out_no || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>NOC Inward Register No</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{request.clg_in_no || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Estimated Budget</div>
                  <div style={{ fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(request.estimated_budget)}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Subject / Title</div>
                <div style={{ fontWeight: 600, fontSize: 15, marginTop: 2 }}>{request.title}</div>
              </div>

              {request.description && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Description / Details</div>
                  <div style={{ fontSize: 13, color: '#334155', marginTop: 2, background: '#f8fafc', padding: 12, borderRadius: 6 }}>
                    {request.description}
                  </div>
                </div>
              )}

              {request.historical_notes && (
                <div className="alert alert-warning" style={{ marginTop: 12 }}>
                  <AlertCircle size={16} />
                  <div>
                    <strong>Historical Case Note:</strong> {request.historical_notes}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Requirement Line Items & Specifications</div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container" style={{ border: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Technical Specifications</th>
                      <th>Est. Unit Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(request.items || []).map((it, idx) => (
                      <tr key={it.id || idx}>
                        <td style={{ fontWeight: 600 }}>{idx + 1}</td>
                        <td style={{ fontWeight: 600 }}>{it.item_name}</td>
                        <td>{it.category || 'General'}</td>
                        <td>{it.quantity} {it.unit || 'Nos'}</td>
                        <td style={{ fontSize: 12, color: '#475569' }}>{it.specifications || '-'}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(it.estimated_unit_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUOTATIONS & COMPARISON */}
      {activeTab === 'quotations' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Vendor Quotations & Comparative Evaluation</h2>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Collect bids from registered agencies, compare pricing & taxes, and record selection rationale.
              </div>
            </div>
            {permissions.canAddQuotation && (
              <button className="btn btn-primary" onClick={handleOpenAddQuotation}>
                <Plus size={16} /> Add Agency Quotation
              </button>
            )}
          </div>

          {/* Quotations List Table */}
          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container" style={{ border: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Agency / Vendor</th>
                      <th>Quotation No</th>
                      <th>Date</th>
                      <th>Subtotal</th>
                      <th>Tax / GST</th>
                      <th>Total Amount (INR)</th>
                      <th>Timeline</th>
                      <th>Selected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(request.quotations || []).length > 0 ? (
                      request.quotations.map(q => {
                        const ag = agencies.find(a => a.id === q.agency_id);
                        return (
                          <tr key={q.id} style={{ background: q.is_selected ? '#f0fdf4' : 'transparent' }}>
                            <td style={{ fontWeight: 600 }}>
                              <div>{ag?.name || 'Vendor'}</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>{ag?.phone}</div>
                            </td>
                            <td>{q.quotation_no || '-'}</td>
                            <td>{formatDate(q.quotation_date)}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(q.subtotal_amount)}</td>
                            <td>{q.tax_percent}% ({formatCurrency(q.tax_amount)})</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a' }}>
                              {formatCurrency(q.total_amount)}
                            </td>
                            <td>{q.delivery_timeline || '-'}</td>
                            <td>
                              {q.is_selected ? (
                                <span className="badge badge-approved">
                                  <CheckCircle2 size={12} style={{ marginRight: 2 }} /> Selected Vendor
                                </span>
                              ) : (
                                <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>
                                  Quoted
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8}>
                          <div className="empty-state">
                            <FileSpreadsheet className="empty-state-icon" />
                            <div className="empty-state-title">No agency quotations submitted yet</div>
                            <div className="empty-state-desc">Click "Add Agency Quotation" to record received bids.</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Side-by-Side Quotation Comparison Matrix */}
          {(request.quotations || []).length > 0 && (
            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-body">
                <QuotationComparisonMatrix
                  request={request}
                  agencies={agencies}
                  institutes={institutes}
                  onSelectQuotation={selectQuotation}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: APPROVAL MANAGEMENT */}
      {activeTab === 'approval' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Competent Authority Approval & Sanctions</h2>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                CVM Chairman, Hon. Joint Secretary, CVMU President, Provost, or Registrar approvals
              </div>
            </div>
            {permissions.canApprove && (
              <button className="btn btn-primary" onClick={handleOpenApprovalModal}>
                <CheckSquare size={16} /> Submit / Record Approval Decision
              </button>
            )}
          </div>

          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container" style={{ border: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Approval Authority</th>
                      <th>Selected Vendor</th>
                      <th>Submission Date</th>
                      <th>Proposed Amount</th>
                      <th>Approved Amount</th>
                      <th>Decision</th>
                      <th>Decision Date</th>
                      <th>Recorded Mode</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(request.approvals || []).length > 0 ? (
                      request.approvals.map(appr => {
                        const auth = authorities.find(a => a.id === appr.authority_id);
                        const ag = agencies.find(a => a.id === appr.selected_agency_id);
                        return (
                          <tr key={appr.id}>
                            <td style={{ fontWeight: 600 }}>
                              <div>{auth?.title || 'Authorized Authority'}</div>
                              {auth?.officer_name && <div style={{ fontSize: 11, color: '#64748b' }}>{auth.officer_name}</div>}
                            </td>
                            <td style={{ fontWeight: 500 }}>{ag?.name || '-'}</td>
                            <td>{formatDate(appr.submission_date)}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(appr.proposed_amount)}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                              {appr.approved_amount ? formatCurrency(appr.approved_amount) : '-'}
                            </td>
                            <td>
                              <StatusBadge status={appr.decision} />
                            </td>
                            <td>{formatDate(appr.decision_date)}</td>
                            <td>
                              <span style={{ fontSize: 11, color: appr.is_recorded_external ? '#d97706' : '#2563eb', fontWeight: 600 }}>
                                {appr.is_recorded_external ? 'Recorded Physical Approval' : 'In-App Approved'}
                              </span>
                            </td>
                            <td style={{ fontSize: 12, color: '#475569' }}>{appr.decision_remarks || '-'}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={9}>
                          <div className="empty-state">
                            <CheckSquare className="empty-state-icon" />
                            <div className="empty-state-title">Awaiting Approval Submission</div>
                            <div className="empty-state-desc">
                              Select a vendor quotation and submit to the competent approval authority.
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SANCTION / APPROVAL LETTER */}
      {activeTab === 'letter' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Official Sanction / Approval Order Letter</h2>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Issue formal sanction order to {inst?.name} with dispatch tracking.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {request.approval_letter && (
                <button className="btn btn-secondary" onClick={handleDownloadLetterPdf}>
                  <Download size={16} /> Download Official PDF
                </button>
              )}
              {permissions.canGenerateLetter && (
                <button className="btn btn-primary" onClick={handleOpenLetterModal}>
                  <Award size={16} /> {request.approval_letter ? 'Edit / Re-Issue Letter' : 'Generate Sanction Letter'}
                </button>
              )}
            </div>
          </div>

          {request.approval_letter ? (
            <div className="card">
              <div className="card-body">
                {/* Visual Letterhead Preview */}
                <div style={{ maxWidth: 800, margin: '0 auto', padding: '36px 40px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 16, marginBottom: 24 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.5, color: '#0f172a' }}>
                      {org?.code === 'CVMU' ? letterSettings.headerCvmuTitle : letterSettings.headerCvmTitle}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {org?.code === 'CVMU' ? letterSettings.headerCvmuSubtitle : letterSettings.headerCvmSubtitle}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', marginTop: 6 }}>
                      {letterSettings.nocDeptTitle}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 13 }}>
                    <div><strong>Ref No:</strong> {request.approval_letter.letter_no}</div>
                    <div><strong>Date:</strong> {formatDate(request.approval_letter.letter_date)}</div>
                  </div>

                  <div style={{ marginBottom: 20, fontSize: 13, lineHeight: 1.6 }}>
                    <div>To,</div>
                    <div style={{ fontWeight: 700 }}>The Principal / Head of Department</div>
                    <div>{inst?.name}</div>
                    <div>Vallabh Vidyanagar, Gujarat</div>
                  </div>

                  <div style={{ marginBottom: 20, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                    {request.approval_letter.subject}
                  </div>

                  <div style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>
                    <strong>Reference:</strong> College Outward No: {request.clg_out_no || 'N/A'} | NOC Inward No: {request.clg_in_no || 'N/A'} | File: {request.request_no}
                  </div>

                  <div style={{ fontSize: 13, lineHeight: 1.7, color: '#334155', marginBottom: 20 }}>
                    With reference to the requirement proposal submitted by your college, we are pleased to convey the sanction of the competent authority for the following procurement / service work through the approved agency <strong>{selectedAgency?.name || 'Selected Vendor'}</strong>:
                  </div>

                  <div className="table-container" style={{ marginBottom: 24 }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Item Description</th>
                          <th>Qty</th>
                          <th>Approved Vendor</th>
                          <th>Sanctioned Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(request.items || []).map((it, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{it.item_name}</td>
                            <td>{it.quantity} {it.unit || 'Nos'}</td>
                            <td>{selectedAgency?.name || 'Vendor'}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                              {formatCurrency(latestApproval?.approved_amount || request.estimated_budget)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 13 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Dispatch Mode: {request.approval_letter.dispatch_mode}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Dispatch Date: {formatDate(request.approval_letter.dispatch_date)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>For, Charutar Vidya Mandal / NOC</div>
                      <div style={{ marginTop: 24, fontWeight: 600 }}>{request.approval_letter.signatory_name}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{request.approval_letter.signatory_title}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                <div className="empty-state">
                  <Award className="empty-state-icon" />
                  <div className="empty-state-title">Approval Letter Not Yet Generated</div>
                  <div className="empty-state-desc">
                    Once the request is approved, generate the official sanction order letter for dispatch.
                  </div>
                  {isApproved && (
                    <button className="btn btn-primary" onClick={handleOpenLetterModal} style={{ marginTop: 12 }}>
                      Generate Letter Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: WORK TRACKING */}
      {activeTab === 'work' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>On-Site Work & Installation Progress</h2>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Track delivery, installation, engineer assignments, and completion certificates.
              </div>
            </div>
            {permissions.canUpdateWork && (
              <button className="btn btn-primary" onClick={handleOpenWorkModal}>
                <Wrench size={16} /> Update Work Status
              </button>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Current Execution Status</div>
              <StatusBadge status={request.work_record?.status || 'Not Started'} />
            </div>
            <div className="card-body">
              <div className="form-row" style={{ marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Executing Vendor</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedAgency?.name || 'Assigned Agency'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Assigned Engineer</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{request.work_record?.engineer_name || 'Not assigned'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Start Date</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{formatDate(request.work_record?.start_date)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Completion Date</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{formatDate(request.work_record?.completion_date)}</div>
                </div>
              </div>

              {request.work_record?.remarks && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Work Execution Remarks</div>
                  <div style={{ fontSize: 13, background: '#f8fafc', padding: 12, borderRadius: 6, marginTop: 4 }}>
                    {request.work_record.remarks}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Work Status History */}
          {(request.work_record?.history || []).length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Status Transition Audit History</div>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-container" style={{ border: 'none' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Previous Status</th>
                        <th>New Status</th>
                        <th>Updated By</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {request.work_record.history.map(h => (
                        <tr key={h.id}>
                          <td>{formatDate(h.timestamp)}</td>
                          <td><StatusBadge status={h.previous_status} /></td>
                          <td><StatusBadge status={h.new_status} /></td>
                          <td style={{ fontWeight: 600 }}>{h.changed_by}</td>
                          <td>{h.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: BILLS & PAYMENTS */}
      {activeTab === 'bills' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Vendor Bills & Payment Clearances</h2>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Track submitted bills against approved sanction amount ({formatCurrency(latestApproval?.approved_amount || request.estimated_budget)}).
              </div>
            </div>
            {permissions.canManageBills && (
              <button className="btn btn-primary" onClick={handleOpenBillModal}>
                <Plus size={16} /> Record Vendor Bill
              </button>
            )}
          </div>

          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container" style={{ border: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Bill / Invoice No</th>
                      <th>Bill Date</th>
                      <th>Agency</th>
                      <th>Submitted Bill Amount</th>
                      <th>Bill Approved Date</th>
                      <th>Bill Approved Amount</th>
                      <th>Bill Status</th>
                      <th>Payment Reference</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(request.bills || []).length > 0 ? (
                      request.bills.map(b => {
                        const ag = agencies.find(a => a.id === b.agency_id);
                        return (
                          <tr key={b.id}>
                            <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{b.bill_no}</td>
                            <td>{formatDate(b.bill_date)}</td>
                            <td style={{ fontWeight: 600 }}>{ag?.name || '-'}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                              {formatCurrency(b.submitted_amount)}
                            </td>
                            <td>{formatDate(b.bill_approval_date)}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#166534' }}>
                              {b.approved_amount ? formatCurrency(b.approved_amount) : '-'}
                            </td>
                            <td>
                              <StatusBadge status={b.bill_status} />
                            </td>
                            <td>{b.payment_ref || '-'}</td>
                            <td style={{ fontSize: 12 }}>{b.remarks || '-'}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={9}>
                          <div className="empty-state">
                            <Receipt className="empty-state-icon" />
                            <div className="empty-state-title">No vendor bills submitted yet</div>
                            <div className="empty-state-desc">
                              Once work is completed and vendor invoice arrives, record the bill here.
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: DOCUMENTS & SCANNER */}
      {activeTab === 'documents' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Confidential Digital Archive & Letter Scans</h2>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Securely store requirement letters, scanned physical sanctions, quotation PDFs, and bills.
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowScannerModal(true)}>
              <Camera size={16} /> Scan / Upload Document
            </button>
          </div>

          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container" style={{ border: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Document Name</th>
                      <th>Category</th>
                      <th>File Size</th>
                      <th>Upload Date</th>
                      <th>Uploaded By</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestDocs.length > 0 ? (
                      requestDocs.map(doc => (
                        <tr key={doc.id}>
                          <td style={{ fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <FileText size={16} color="#2563eb" />
                              <span>{doc.file_name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-info">{doc.category}</span>
                          </td>
                          <td>{doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : '-'}</td>
                          <td>{formatDate(doc.created_at)}</td>
                          <td>{doc.uploaded_by_name || 'NOC Staff'}</td>
                          <td>{doc.is_scanned ? 'Camera Scan' : 'Direct Upload'}</td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setSelectedDocForPreview(doc)}
                            >
                              Preview & Download
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7}>
                          <div className="empty-state">
                            <FolderOpen className="empty-state-icon" />
                            <div className="empty-state-title">No documents attached for this case</div>
                            <div className="empty-state-desc">
                              Use the camera scanner or file uploader to digitize official requirement and sanction papers.
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD QUOTATION */}
      {showAddQuotModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-lg">
            <div className="modal-header">
              <div className="modal-title">Record Agency Quotation</div>
              <button className="btn-icon" onClick={() => setShowAddQuotModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveQuotation}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Select Agency / Vendor <span className="required">*</span></label>
                    <select
                      className="form-control"
                      value={quotForm.agency_id}
                      onChange={e => setQuotForm({ ...quotForm, agency_id: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Agency --</option>
                      {agencies.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.contact_person})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quotation Reference Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. RTS/2026/QT/089"
                      value={quotForm.quotation_no}
                      onChange={e => setQuotForm({ ...quotForm, quotation_no: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quotation Date <span className="required">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      value={quotForm.quotation_date}
                      onChange={e => setQuotForm({ ...quotForm, quotation_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Basic Subtotal Amount (INR) <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="Amount before taxes"
                      value={quotForm.subtotal_amount}
                      onChange={e => handleQuotSubtotalChange(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tax / GST %</label>
                    <select
                      className="form-control"
                      value={quotForm.tax_percent}
                      onChange={e => {
                        const taxP = e.target.value;
                        const sub = parseFloat(quotForm.subtotal_amount) || 0;
                        const taxA = Math.round(((sub * parseFloat(taxP)) / 100) * 100) / 100;
                        const oth = parseFloat(quotForm.other_charges) || 0;
                        setQuotForm({
                          ...quotForm,
                          tax_percent: taxP,
                          tax_amount: String(taxA),
                          total_amount: String(sub + taxA + oth)
                        });
                      }}
                    >
                      <option value="0">0% (Nil / Exempted)</option>
                      <option value="5">5% GST</option>
                      <option value="12">12% GST</option>
                      <option value="18">18% GST (Standard)</option>
                      <option value="28">28% GST</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Calculated Tax Amount (INR)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={quotForm.tax_amount}
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Other / Freight Charges (INR)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={quotForm.other_charges}
                      onChange={e => {
                        const oth = parseFloat(e.target.value) || 0;
                        const sub = parseFloat(quotForm.subtotal_amount) || 0;
                        const taxA = parseFloat(quotForm.tax_amount) || 0;
                        setQuotForm({
                          ...quotForm,
                          other_charges: e.target.value,
                          total_amount: String(sub + taxA + oth)
                        });
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Quoted Amount (INR) <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      style={{ fontWeight: 700, color: '#166534', fontFamily: 'var(--font-mono)' }}
                      value={quotForm.total_amount}
                      onChange={e => setQuotForm({ ...quotForm, total_amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Delivery Timeline</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 7-10 Days"
                      value={quotForm.delivery_timeline}
                      onChange={e => setQuotForm({ ...quotForm, delivery_timeline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Remarks & Warranty Terms</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Includes 3-year on-site OEM warranty, installation included"
                    value={quotForm.remarks}
                    onChange={e => setQuotForm({ ...quotForm, remarks: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddQuotModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Quotation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: APPROVAL SUBMISSION & DECISION */}
      {showApprovalModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-lg">
            <div className="modal-header">
              <div className="modal-title">Record Sanction / Approval Decision</div>
              <button className="btn-icon" onClick={() => setShowApprovalModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveApproval}>
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
                      {orgAuthorities.map(a => (
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
                    <label className="form-label">Approval Decision <span className="required">*</span></label>
                    <select
                      className="form-control"
                      value={apprForm.decision}
                      onChange={e => setApprForm({ ...apprForm, decision: e.target.value })}
                      required
                    >
                      <option value="Approved">Approved (Sanctioned)</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Returned for Clarification">Returned for Clarification</option>
                      <option value="Pending">Pending Decision</option>
                      <option value="Cancelled">Cancelled</option>
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
                    <label className="form-label">Approved Amount (INR) <span className="required">*</span></label>
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
                    <span>Recorded External Physical Approval (e.g. Chairman physical paper signature recorded by NOC Staff)</span>
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Decision Remarks & Order Notes</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="e.g. Sanctioned under 2026-27 annual hardware renewal budget allocation..."
                    value={apprForm.decision_remarks}
                    onChange={e => setApprForm({ ...apprForm, decision_remarks: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowApprovalModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Approval Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: APPROVAL LETTER */}
      {showLetterModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-lg">
            <div className="modal-header">
              <div className="modal-title">Generate / Issue Approval Sanction Letter</div>
              <button className="btn-icon" onClick={() => setShowLetterModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveLetter}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Approval Letter Number <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={letterForm.letter_no}
                      onChange={e => setLetterForm({ ...letterForm, letter_no: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Letter Date <span className="required">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      value={letterForm.letter_date}
                      onChange={e => setLetterForm({ ...letterForm, letter_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Signatory Name <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={letterForm.signatory_name}
                      onChange={e => setLetterForm({ ...letterForm, signatory_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Signatory Title <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={letterForm.signatory_title}
                      onChange={e => setLetterForm({ ...letterForm, signatory_title: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Letter Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    value={letterForm.subject}
                    onChange={e => setLetterForm({ ...letterForm, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Dispatch Mode</label>
                    <select
                      className="form-control"
                      value={letterForm.dispatch_mode}
                      onChange={e => setLetterForm({ ...letterForm, dispatch_mode: e.target.value })}
                    >
                      <option value="Internal Dispatch">Internal University Dispatch</option>
                      <option value="Hand Delivery">Hand Delivery / Peon Book</option>
                      <option value="Official Email">Official Email</option>
                      <option value="Speed Post">Speed Post / Registered Post</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dispatch Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={letterForm.dispatch_date}
                      onChange={e => setLetterForm({ ...letterForm, dispatch_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLetterModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save & Issue Letter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: WORK UPDATE */}
      {showWorkModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title">Update Work Progress</div>
              <button className="btn-icon" onClick={() => setShowWorkModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveWork}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Work Status <span className="required">*</span></label>
                  <select
                    className="form-control"
                    value={workForm.status}
                    onChange={e => setWorkForm({ ...workForm, status: e.target.value })}
                    required
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={workForm.start_date}
                      onChange={e => setWorkForm({ ...workForm, start_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Completion Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={workForm.completion_date}
                      onChange={e => setWorkForm({ ...workForm, completion_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Field Engineer / Technician</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Nitin Solanki"
                    value={workForm.engineer_name}
                    onChange={e => setWorkForm({ ...workForm, engineer_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Progress Remarks / Inspection Findings</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Describe testing, commissioning, or delay reason..."
                    value={workForm.remarks}
                    onChange={e => setWorkForm({ ...workForm, remarks: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowWorkModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Work Status</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: BILL FORM */}
      {showBillModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-lg">
            <div className="modal-header">
              <div className="modal-title">Record Vendor Bill / Invoice</div>
              <button className="btn-icon" onClick={() => setShowBillModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveBill}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Bill / Invoice Number <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. RTS-INV-2026-901"
                      value={billForm.bill_no}
                      onChange={e => setBillForm({ ...billForm, bill_no: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bill Date <span className="required">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      value={billForm.bill_date}
                      onChange={e => setBillForm({ ...billForm, bill_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Agency / Vendor <span className="required">*</span></label>
                    <select
                      className="form-control"
                      value={billForm.agency_id}
                      onChange={e => setBillForm({ ...billForm, agency_id: e.target.value })}
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
                    <label className="form-label">Submitted Bill Amount (INR) <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={billForm.submitted_amount}
                      onChange={e => setBillForm({ ...billForm, submitted_amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bill Approval Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={billForm.bill_approval_date}
                      onChange={e => setBillForm({ ...billForm, bill_approval_date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bill Approved Amount (INR)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={billForm.approved_amount}
                      onChange={e => setBillForm({ ...billForm, approved_amount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Bill Verification Status</label>
                    <select
                      className="form-control"
                      value={billForm.bill_status}
                      onChange={e => setBillForm({ ...billForm, bill_status: e.target.value })}
                    >
                      <option value="Submitted">Submitted (Under Verification)</option>
                      <option value="Approved">Approved for Payment</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Paid">Disbursed / Paid</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Reference / UTR / Cheque No</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. RTGS-CVM-2026-1188"
                      value={billForm.payment_ref}
                      onChange={e => setBillForm({ ...billForm, payment_ref: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Audit Remarks</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Verified with stock entry register p.44"
                    value={billForm.remarks}
                    onChange={e => setBillForm({ ...billForm, remarks: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBillModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Bill</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: CASE CLOSURE */}
      {showCloseModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title">Close NOC Case</div>
              <button className="btn-icon" onClick={() => setShowCloseModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">
                <AlertCircle size={16} />
                <span>
                  Please verify that all procurement, delivery, and payment stages have been completed before closing.
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">Closure Note / Summary</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={closureReason}
                  onChange={e => setClosureReason(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCloseModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { closeRequest(request.id, closureReason); setShowCloseModal(false); }}>
                Confirm Case Closure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: REOPEN CASE */}
      {showReopenModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title">Reopen Closed Case</div>
              <button className="btn-icon" onClick={() => setShowReopenModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning">
                <AlertCircle size={16} />
                <span>Reopening a closed case will be logged in the audit trail.</span>
              </div>
              <div className="form-group">
                <label className="form-label">Reason for Reopening <span className="required">*</span></label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Additional warranty replacement claim or supplemental bill adjustment required..."
                  value={reopenReason}
                  onChange={e => setReopenReason(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowReopenModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                if (!reopenReason.trim()) {
                  alert('Please enter reason for reopening.');
                  return;
                }
                reopenRequest(request.id, reopenReason);
                setShowReopenModal(false);
              }}>
                Reopen Case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Request Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="modal-container" style={{ maxWidth: 480 }}>
            <div className="modal-header" style={{ borderBottomColor: '#fee2e2' }}>
              <div className="modal-title" style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Trash2 size={20} /> Delete Request {request.request_no}
              </div>
              <button className="btn-icon" onClick={() => !isDeleting && setShowDeleteModal(false)} disabled={isDeleting}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-danger" style={{ marginBottom: 16 }}>
                <AlertCircle size={18} />
                <div>
                  <strong>Permanent Action:</strong> This will delete request <strong>{request.request_no}</strong> ({request.title}) and all associated items, quotations, approvals, and bills across all connected devices and Supabase.
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>
                Are you sure you want to delete this NOC request? This action cannot be undone and will be recorded in the system audit logs.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: '#dc2626', borderColor: '#b91c1c' }}
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteRequest(request.id);
                    setShowDeleteModal(false);
                    navigate('/requests');
                  } catch (err) {
                    console.error('Error deleting request:', err);
                    alert('Failed to delete request. Please try again.');
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

      {/* Camera Scanner Modal */}
      <ScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onSaveScan={handleSaveScan}
        requestId={request.id}
      />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={Boolean(selectedDocForPreview)}
        onClose={() => setSelectedDocForPreview(null)}
        document={selectedDocForPreview}
      />
    </div>
  );
};
