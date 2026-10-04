import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, AlertCircle, ArrowRight, RefreshCw, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/pdfGenerator';
import Papa from 'papaparse';

export const ImportExportPage = () => {
  const { institutes, agencies, organizations, requests, importCsvBatch, getNextRequestNo } = useData();
  const { permissions } = useAuth();

  const [step, setStep] = useState(1); // 1: Upload, 2: Map Columns, 3: Preview & Validate, 4: Results
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    date: '',
    college_name: '',
    description: '',
    agency_name: '',
    approval_date: '',
    approval_amount: '',
    work_status: '',
    bill_approval_date: '',
    bill_amount: '',
    engineer_name: '',
    clg_out_no: '',
    clg_in_no: ''
  });

  const [parsedData, setParsedData] = useState([]);
  const [validationSummary, setValidationSummary] = useState({ validCount: 0, errorCount: 0, duplicateCount: 0 });
  const [importResult, setImportResult] = useState(null);

  const fileInputRef = useRef(null);

  // Known field label auto-matching
  const autoMapHeaders = (headers) => {
    const mapping = { ...columnMapping };
    headers.forEach(h => {
      const hLower = h.toLowerCase().trim();
      if (hLower.includes('date') && !hLower.includes('appr') && !hLower.includes('bill')) mapping.date = h;
      else if (hLower.includes('college') || hLower.includes('clg') || hLower.includes('institute')) mapping.college_name = h;
      else if (hLower.includes('desc') || hLower.includes('detail') || hLower.includes('item') || hLower.includes('product')) mapping.description = h;
      else if (hLower.includes('agency') || hLower.includes('vendor')) mapping.agency_name = h;
      else if (hLower.includes('appr') && hLower.includes('date')) mapping.approval_date = h;
      else if (hLower.includes('appr') && (hLower.includes('amt') || hLower.includes('amount'))) mapping.approval_amount = h;
      else if (hLower.includes('work') || hLower.includes('status')) mapping.work_status = h;
      else if (hLower.includes('bill') && hLower.includes('date')) mapping.bill_approval_date = h;
      else if (hLower.includes('bill') && (hLower.includes('amt') || hLower.includes('amount'))) mapping.bill_amount = h;
      else if (hLower.includes('eng') || hLower.includes('engineer')) mapping.engineer_name = h;
      else if (hLower.includes('out')) mapping.clg_out_no = h;
      else if (hLower.includes('in')) mapping.clg_in_no = h;
    });
    setColumnMapping(mapping);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          alert('CSV file is empty.');
          return;
        }
        const headers = results.meta.fields || [];
        setCsvHeaders(headers);
        setRawRows(results.data);
        autoMapHeaders(headers);
        setStep(2);
      },
      error: (error) => {
        alert('Failed to parse CSV file: ' + error.message);
      }
    });
  };

  // Process rows with mapping
  const processValidation = () => {
    let valid = 0;
    let errors = 0;
    let duplicates = 0;

    const existingOutNos = new Set(requests.map(r => r.clg_out_no).filter(Boolean));

    const processed = rawRows.map((row, index) => {
      const issues = [];
      const collegeRaw = row[columnMapping.college_name]?.trim();
      const descRaw = row[columnMapping.description]?.trim();
      const dateRaw = row[columnMapping.date]?.trim();
      const agencyRaw = row[columnMapping.agency_name]?.trim();
      const apprAmtRaw = row[columnMapping.approval_amount]?.trim();
      const apprDateRaw = row[columnMapping.approval_date]?.trim();
      const workStatusRaw = row[columnMapping.work_status]?.trim();
      const billAmtRaw = row[columnMapping.bill_amount]?.trim();
      const clgOutRaw = row[columnMapping.clg_out_no]?.trim();

      if (!descRaw) {
        issues.push('Missing description / requirement details');
      }

      // Match College
      let matchedInst = null;
      if (collegeRaw) {
        matchedInst = institutes.find(i => 
          i.name.toLowerCase() === collegeRaw.toLowerCase() ||
          i.name.toLowerCase().includes(collegeRaw.toLowerCase()) ||
          collegeRaw.toLowerCase().includes(i.name.toLowerCase()) ||
          (i.code && i.code.toLowerCase() === collegeRaw.toLowerCase())
        );
      }
      if (!matchedInst) {
        issues.push(`Unrecognized college: "${collegeRaw || 'Blank'}" (will map to default CVM college)`);
      }

      // Match Agency
      let matchedAgency = null;
      if (agencyRaw) {
        matchedAgency = agencies.find(a => 
          a.name.toLowerCase() === agencyRaw.toLowerCase() ||
          a.name.toLowerCase().includes(agencyRaw.toLowerCase()) ||
          agencyRaw.toLowerCase().includes(a.name.toLowerCase())
        );
      }

      // Parse Amount safely without guessing
      let parsedApprAmt = null;
      if (apprAmtRaw) {
        const cleanAmt = apprAmtRaw.replace(/[^0-9.]/g, '');
        if (cleanAmt) parsedApprAmt = parseFloat(cleanAmt);
      }

      let parsedBillAmt = null;
      if (billAmtRaw) {
        const cleanAmt = billAmtRaw.replace(/[^0-9.]/g, '');
        if (cleanAmt) parsedBillAmt = parseFloat(cleanAmt);
      }

      // Check duplicate
      const isDuplicate = clgOutRaw && existingOutNos.has(clgOutRaw);
      if (isDuplicate) {
        duplicates++;
        issues.push(`Duplicate College Outward No: ${clgOutRaw}`);
      }

      if (issues.length > 0) errors++;
      else valid++;

      return {
        rowNumber: index + 1,
        raw: row,
        matchedInst: matchedInst || institutes[0],
        matchedAgency,
        date: dateRaw || new Date().toISOString().split('T')[0],
        description: descRaw || 'Historical Item Requirement',
        apprAmount: parsedApprAmt,
        apprDate: apprDateRaw || null,
        workStatus: workStatusRaw || 'Completed',
        billAmount: parsedBillAmt,
        engineerName: row[columnMapping.engineer_name]?.trim() || '',
        clgOutNo: clgOutRaw || '',
        clgInNo: row[columnMapping.clg_in_no]?.trim() || '',
        issues,
        isValid: issues.length === 0
      };
    });

    setParsedData(processed);
    setValidationSummary({ validCount: valid, errorCount: errors, duplicateCount: duplicates });
    setStep(3);
  };

  const executeImport = () => {
    const importItems = parsedData.map((item, idx) => {
      const reqId = 'req-imp-' + Date.now() + '-' + idx;
      const reqNo = `NOC-IMP-${String(requests.length + idx + 1).padStart(4, '0')}`;
      const inst = item.matchedInst;

      return {
        id: reqId,
        request_no: reqNo,
        org_id: inst.org_id,
        institute_id: inst.id,
        request_date: item.date,
        clg_out_no: item.clgOutNo,
        clg_in_no: item.clgInNo,
        request_type: 'Other',
        title: item.description,
        description: `Imported legacy record. Original row details: ${JSON.stringify(item.raw)}`,
        estimated_budget: item.apprAmount,
        current_stage: item.workStatus?.toLowerCase().includes('done') || item.workStatus?.toLowerCase().includes('complete') ? 'completed' : 'approved',
        overall_status: item.workStatus?.toLowerCase().includes('done') || item.workStatus?.toLowerCase().includes('complete') ? 'Work Completed' : 'Approved',
        is_historical: true,
        historical_notes: `Legacy imported row #${item.rowNumber}. Agency: ${item.matchedAgency?.name || item.raw[columnMapping.agency_name] || 'N/A'}, Approval Amt: ${item.apprAmount || 'N/A'}`,
        created_at: new Date().toISOString(),
        items: [
          {
            id: 'item-imp-' + idx,
            item_name: item.description,
            category: 'Legacy Item',
            quantity: 1,
            unit: 'Nos',
            specifications: 'Imported from legacy record',
            estimated_unit_price: item.apprAmount
          }
        ],
        quotations: item.matchedAgency ? [
          {
            id: 'quot-imp-' + idx,
            agency_id: item.matchedAgency.id,
            quotation_no: 'LEGACY-QTN',
            quotation_date: item.date,
            subtotal_amount: item.apprAmount || 0,
            tax_percent: 0,
            tax_amount: 0,
            other_charges: 0,
            total_amount: item.apprAmount || 0,
            is_selected: true,
            selection_rationale: 'Historical sanctioned agency'
          }
        ] : [],
        approvals: item.apprAmount ? [
          {
            id: 'appr-imp-' + idx,
            authority_id: null,
            selected_agency_id: item.matchedAgency?.id || null,
            submission_date: item.date,
            proposed_amount: item.apprAmount,
            decision: 'Approved',
            decision_date: item.apprDate || item.date,
            approved_amount: item.apprAmount,
            decision_remarks: 'Imported from historical ledger',
            is_recorded_external: true
          }
        ] : [],
        work_record: {
          id: 'wrk-imp-' + idx,
          agency_id: item.matchedAgency?.id || null,
          status: item.workStatus?.toLowerCase().includes('done') || item.workStatus?.toLowerCase().includes('complete') ? 'Completed' : 'In Progress',
          start_date: item.apprDate || item.date,
          completion_date: item.workStatus?.toLowerCase().includes('done') || item.workStatus?.toLowerCase().includes('complete') ? (item.apprDate || item.date) : null,
          engineer_name: item.engineerName,
          remarks: 'Imported historical work progress'
        },
        bills: item.billAmount ? [
          {
            id: 'bill-imp-' + idx,
            agency_id: item.matchedAgency?.id || null,
            bill_no: 'LEGACY-BILL',
            bill_date: item.date,
            submitted_amount: item.billAmount,
            bill_approval_date: item.date,
            approved_amount: item.billAmount,
            bill_status: 'Approved',
            remarks: 'Legacy bill payment'
          }
        ] : []
      };
    });

    importCsvBatch(importItems);
    setImportResult({ count: importItems.length });
    setStep(4);
  };

  const handleDownloadSampleCsv = () => {
    const sampleRows = [
      {
        'Date': '01-11-2023',
        'College Name': 'A.R. College of Pharmacy and G.H. Patel Institute of Pharmacy',
        'Description': '02 New Projector Purchase For Class',
        'Agency Name': 'Yash Computers',
        'Approval Date': '29-12-2023',
        'Approval Amount': '104960',
        'Work Status': 'Done',
        'Bill Approval Date': '22-01-2024',
        'Bill Amount': '104960',
        'Eng. Name': 'Nitin Solanki',
        'College Outward No': 'ARCP/NOC/2023/114'
      },
      {
        'Date': '20-11-2023',
        'College Name': 'G.H. Patel College of Engineering and Technology (GCET)',
        'Description': 'Epson Projector Lamp Change & Services',
        'Agency Name': 'Yash Computers',
        'Approval Date': '05-12-2023',
        'Approval Amount': '8083',
        'Work Status': 'Done',
        'Bill Approval Date': '18-12-2023',
        'Bill Amount': '8083',
        'Eng. Name': 'Pravin Vaghela',
        'College Outward No': 'GCET/MECH/2023/45'
      },
      {
        'Date': '04-01-2024',
        'College Name': 'Sophisticated Instrumentation Centre for Applied Research and Testing (SICART)',
        'Description': '04 CPU SET (i-7, 128GB SSD, 4 GB RAM)',
        'Agency Name': 'Bharat',
        'Approval Date': '19-02-2024',
        'Approval Amount': '',
        'Work Status': 'In Progress',
        'Bill Approval Date': '',
        'Bill Amount': '',
        'Eng. Name': 'Dhaval Patel',
        'College Outward No': 'SICART/LAB/2024/09'
      }
    ];

    const csv = Papa.unparse(sampleRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'NOC_Legacy_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Google Sheet & Legacy CSV Data Importer</h1>
          <div className="page-subheading">
            Import historical ledgers and spreadsheets with column mapping, duplicate protection, and preview verification.
          </div>
        </div>
        <button className="btn btn-secondary" onClick={handleDownloadSampleCsv}>
          <Download size={16} /> Download Sample Template CSV
        </button>
      </div>

      {/* Stepper */}
      <div className="workflow-stepper" style={{ marginBottom: 24 }}>
        <div className={`workflow-step ${step >= 1 ? 'completed' : ''}`}>
          <div className="step-indicator">1</div>
          <div className="step-label">Upload File</div>
        </div>
        <div className={`workflow-step ${step >= 2 ? 'completed' : ''}`}>
          <div className="step-indicator">2</div>
          <div className="step-label">Map Columns</div>
        </div>
        <div className={`workflow-step ${step >= 3 ? 'completed' : ''}`}>
          <div className="step-indicator">3</div>
          <div className="step-label">Preview & Validate</div>
        </div>
        <div className={`workflow-step ${step >= 4 ? 'completed' : ''}`}>
          <div className="step-indicator">4</div>
          <div className="step-label">Import Success</div>
        </div>
      </div>

      {/* STEP 1: UPLOAD FILE */}
      {step === 1 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Upload Historical Spreadsheet / CSV File</div>
          </div>
          <div className="card-body">
            <div
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: 8,
                padding: '48px 24px',
                textAlign: 'center',
                background: '#f8fafc',
                cursor: 'pointer'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={48} color="#2563eb" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontSize: 16, fontWeight: 700 }}>Choose CSV file exported from Google Sheets or Excel</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
                Supports standard comma-separated files (.csv)
              </div>
              <button type="button" className="btn btn-primary" style={{ marginTop: 16 }}>
                Select CSV File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: MAP COLUMNS */}
      {step === 2 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Map Historical Spreadsheet Columns</div>
            <span style={{ fontSize: 12, color: '#64748b' }}>{rawRows.length} rows detected in file</span>
          </div>
          <div className="card-body">
            <div className="alert alert-info">
              <AlertCircle size={18} />
              <span>
                Verify that the detected columns match the corresponding NOC database fields. Blank entries or unknown fields will be handled safely without fabrication.
              </span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Requirement Date</label>
                <select className="form-control" value={columnMapping.date} onChange={e => setColumnMapping({ ...columnMapping, date: e.target.value })}>
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">College / Institute Name <span className="required">*</span></label>
                <select className="form-control" value={columnMapping.college_name} onChange={e => setColumnMapping({ ...columnMapping, college_name: e.target.value })} required>
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Details <span className="required">*</span></label>
                <select className="form-control" value={columnMapping.description} onChange={e => setColumnMapping({ ...columnMapping, description: e.target.value })} required>
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Agency / Vendor Name</label>
                <select className="form-control" value={columnMapping.agency_name} onChange={e => setColumnMapping({ ...columnMapping, agency_name: e.target.value })}>
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Approval Date</label>
                <select className="form-control" value={columnMapping.approval_date} onChange={e => setColumnMapping({ ...columnMapping, approval_date: e.target.value })}>
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Approval Amount</label>
                <select className="form-control" value={columnMapping.approval_amount} onChange={e => setColumnMapping({ ...columnMapping, approval_amount: e.target.value })}>
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Work Status</label>
                <select className="form-control" value={columnMapping.work_status} onChange={e => setColumnMapping({ ...columnMapping, work_status: e.target.value })}>
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Bill Approval Date</label>
                <select className="form-control" value={columnMapping.bill_approval_date} onChange={e => setColumnMapping({ ...columnMapping, bill_approval_date: e.target.value })}>
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Bill Amount</label>
                <select className="form-control" value={columnMapping.bill_amount} onChange={e => setColumnMapping({ ...columnMapping, bill_amount: e.target.value })}>
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Field Engineer Name</label>
                <select className="form-control" value={columnMapping.engineer_name} onChange={e => setColumnMapping({ ...columnMapping, engineer_name: e.target.value })}>
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">College Outward No</label>
                <select className="form-control" value={columnMapping.clg_out_no} onChange={e => setColumnMapping({ ...columnMapping, clg_out_no: e.target.value })}>
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">NOC Inward No</label>
                <select className="form-control" value={columnMapping.clg_in_no} onChange={e => setColumnMapping({ ...columnMapping, clg_in_no: e.target.value })}>
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="card-footer">
            <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
            <button className="btn btn-primary" onClick={processValidation}>
              Preview & Validate Data <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PREVIEW & VALIDATE */}
      {step === 3 && (
        <div>
          <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="metric-card">
              <div className="metric-card-header"><span>TOTAL ROWS</span></div>
              <div className="metric-value">{parsedData.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-card-header"><span>CLEAN ROWS</span></div>
              <div className="metric-value" style={{ color: '#166534' }}>{validationSummary.validCount}</div>
            </div>
            <div className="metric-card">
              <div className="metric-card-header"><span>ROWS WITH NOTICES</span></div>
              <div className="metric-value" style={{ color: '#d97706' }}>{validationSummary.errorCount}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Preview Mapped Records Before Import</div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container" style={{ border: 'none', maxHeight: 400 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>College</th>
                      <th>Description</th>
                      <th>Agency</th>
                      <th>Appr Amount</th>
                      <th>Work Status</th>
                      <th>Validation Notices</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map(row => (
                      <tr key={row.rowNumber} style={{ background: row.issues.length > 0 ? '#fffbeb' : 'transparent' }}>
                        <td>{row.rowNumber}</td>
                        <td>{row.date}</td>
                        <td>{row.matchedInst?.name}</td>
                        <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.description}</td>
                        <td>{row.matchedAgency?.name || row.raw[columnMapping.agency_name] || '-'}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{row.apprAmount ? formatCurrency(row.apprAmount) : 'N/A'}</td>
                        <td><StatusBadge status={row.workStatus} /></td>
                        <td>
                          {row.issues.length > 0 ? (
                            <div style={{ fontSize: 11, color: '#d97706' }}>
                              {row.issues.join(', ')}
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>✓ Valid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer">
              <button className="btn btn-secondary" onClick={() => setStep(2)}>Back to Mapping</button>
              <button className="btn btn-primary btn-lg" onClick={executeImport}>
                Confirm & Import {parsedData.length} Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: RESULTS */}
      {step === 4 && (
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 12px auto' }} />
              <div className="empty-state-title" style={{ fontSize: 18 }}>Import Completed Successfully!</div>
              <div className="empty-state-desc">
                {importResult?.count} historical records have been imported into the NOC database with full relational integrity and audit logging.
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)}>
                  Import Another File
                </button>
                <a href="/requests" className="btn btn-primary">
                  View All Requests
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
