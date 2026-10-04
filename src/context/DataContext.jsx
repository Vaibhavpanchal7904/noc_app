// =====================================================================
// Data Context - Central State Store & Operational Business Logic
// =====================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_ORGANIZATIONS,
  INITIAL_INSTITUTES,
  INITIAL_AGENCIES,
  INITIAL_AUTHORITIES,
  INITIAL_STOCK_NOTES,
  INITIAL_SAMPLE_REQUESTS,
  DEFAULT_USERS
} from '../data/initialData';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { currentUser } = useAuth();

  // Master State with LocalStorage Persistence
  const [organizations, setOrganizations] = useState(() => {
    const saved = localStorage.getItem('noc_organizations');
    return saved ? JSON.parse(saved) : INITIAL_ORGANIZATIONS;
  });

  const [institutes, setInstitutes] = useState(() => {
    const saved = localStorage.getItem('noc_institutes');
    return saved ? JSON.parse(saved) : INITIAL_INSTITUTES;
  });

  const [agencies, setAgencies] = useState(() => {
    const saved = localStorage.getItem('noc_agencies');
    return saved ? JSON.parse(saved) : INITIAL_AGENCIES;
  });

  const [authorities, setAuthorities] = useState(() => {
    const saved = localStorage.getItem('noc_authorities');
    return saved ? JSON.parse(saved) : INITIAL_AUTHORITIES;
  });

  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem('noc_requests');
    return saved ? JSON.parse(saved) : INITIAL_SAMPLE_REQUESTS;
  });

  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('noc_documents');
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('noc_audit_logs');
    return saved ? JSON.parse(saved) : [
      {
        id: 'log-init-1',
        actor_id: 'usr-1',
        actor_name: 'NOC Lead Administrator',
        actor_email: 'admin@cvm.gov.in',
        action: 'SYSTEM_INITIALIZATION',
        entity_type: 'system',
        entity_id: 'init',
        changes: { message: 'Initialized master records for CVM (27 institutes) & CVMU (21 institutes), 9 agencies and authorities.' },
        created_at: new Date().toISOString()
      }
    ];
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('noc_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [stockNotes, setStockNotes] = useState(() => {
    const saved = localStorage.getItem('noc_stock_notes');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_NOTES;
  });

  // Approval Letter Settings
  const [letterSettings, setLetterSettings] = useState(() => {
    const saved = localStorage.getItem('noc_letter_settings');
    return saved ? JSON.parse(saved) : {
      headerCvmTitle: 'CHARUTAR VIDYA MANDAL',
      headerCvmSubtitle: 'VALLABH VIDYANAGAR - 388120, GUJARAT, INDIA',
      headerCvmuTitle: 'CVM UNIVERSITY',
      headerCvmuSubtitle: 'VALLABH VIDYANAGAR, ANAND, GUJARAT',
      nocDeptTitle: 'NETWORK OPERATIONS & HARDWARE PROCUREMENT CELL (NOC)',
      phone: '+91 2692 236498',
      email: 'noc@cvm.gov.in',
      signatoryNameCvm: 'Shri Prayasvin Patel',
      signatoryTitleCvm: 'Hon. Joint Secretary / Chairman',
      signatoryNameCvmu: 'Dr. J. D. Patel',
      signatoryTitleCvmu: 'Registrar',
      footerNote: 'This is a computer-generated sanction / approval order issued by the Central NOC Department.'
    };
  });

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem('noc_organizations', JSON.stringify(organizations)); }, [organizations]);
  useEffect(() => { localStorage.setItem('noc_institutes', JSON.stringify(institutes)); }, [institutes]);
  useEffect(() => { localStorage.setItem('noc_agencies', JSON.stringify(agencies)); }, [agencies]);
  useEffect(() => { localStorage.setItem('noc_authorities', JSON.stringify(authorities)); }, [authorities]);
  useEffect(() => { localStorage.setItem('noc_requests', JSON.stringify(requests)); }, [requests]);
  useEffect(() => { localStorage.setItem('noc_documents', JSON.stringify(documents)); }, [documents]);
  useEffect(() => { localStorage.setItem('noc_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('noc_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('noc_stock_notes', JSON.stringify(stockNotes)); }, [stockNotes]);
  useEffect(() => { localStorage.setItem('noc_letter_settings', JSON.stringify(letterSettings)); }, [letterSettings]);

  // Log Audit Action
  const logAudit = (action, entityType, entityId, changes) => {
    const newLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      actor_id: currentUser?.id || 'system',
      actor_name: currentUser?.full_name || 'System User',
      actor_email: currentUser?.email || 'system@cvm.gov.in',
      action,
      entity_type: entityType,
      entity_id: String(entityId),
      changes,
      created_at: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Helper to generate Next Request Number e.g. NOC-2026-0002
  const getNextRequestNo = () => {
    const year = new Date().getFullYear();
    const count = requests.length + 1;
    const padded = String(count).padStart(4, '0');
    return `NOC-${year}-${padded}`;
  };

  // Helper to generate Approval Letter Number
  const getNextLetterNo = (orgCode = 'CVM') => {
    const year = new Date().getFullYear();
    const count = requests.filter(r => r.approval_letter).length + 1;
    const padded = String(count).padStart(3, '0');
    return `${orgCode}/NOC/APPR/${year}/${padded}`;
  };

  // 1. Create Request
  const createRequest = (formData) => {
    const newReqId = 'req-' + Date.now();
    const reqNo = formData.request_no || getNextRequestNo();

    const newRequest = {
      id: newReqId,
      request_no: reqNo,
      org_id: formData.org_id,
      institute_id: formData.institute_id,
      request_date: formData.request_date || new Date().toISOString().split('T')[0],
      clg_out_no: formData.clg_out_no || '',
      clg_in_no: formData.clg_in_no || '',
      request_type: formData.request_type || 'New Purchase',
      title: formData.title,
      description: formData.description || '',
      estimated_budget: formData.estimated_budget ? parseFloat(formData.estimated_budget) : null,
      current_stage: 'requirement',
      overall_status: 'Pending Quotations',
      internal_notes: formData.internal_notes || '',
      is_historical: false,
      created_by: currentUser?.id,
      created_at: new Date().toISOString(),
      items: (formData.items || []).map((it, idx) => ({
        id: 'item-' + Date.now() + '-' + idx,
        item_name: it.item_name,
        category: it.category || 'General',
        quantity: parseInt(it.quantity) || 1,
        unit: it.unit || 'Nos',
        specifications: it.specifications || '',
        estimated_unit_price: it.estimated_unit_price ? parseFloat(it.estimated_unit_price) : null
      })),
      quotations: [],
      approvals: [],
      bills: []
    };

    setRequests(prev => [newRequest, ...prev]);
    logAudit('CREATE_REQUEST', 'request', reqNo, {
      title: newRequest.title,
      institute_id: newRequest.institute_id,
      estimated_budget: newRequest.estimated_budget
    });
    return newRequest;
  };

  // 2. Update Request
  const updateRequest = (reqId, updates) => {
    setRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        const updated = { ...req, ...updates, updated_at: new Date().toISOString() };
        logAudit('UPDATE_REQUEST', 'request', req.request_no, updates);
        return updated;
      }
      return req;
    }));
  };

  // 3. Add Quotation
  const addQuotation = (reqId, quotationData) => {
    const quotId = 'quot-' + Date.now();
    const subtotal = parseFloat(quotationData.subtotal_amount) || 0;
    const taxPercent = parseFloat(quotationData.tax_percent) || 18;
    const taxAmt = quotationData.tax_amount !== undefined 
      ? parseFloat(quotationData.tax_amount) 
      : Math.round(((subtotal * taxPercent) / 100) * 100) / 100;
    const otherCharges = parseFloat(quotationData.other_charges) || 0;
    const totalAmt = quotationData.total_amount 
      ? parseFloat(quotationData.total_amount) 
      : (subtotal + taxAmt + otherCharges);

    const newQuot = {
      id: quotId,
      agency_id: quotationData.agency_id,
      quotation_no: quotationData.quotation_no || '',
      quotation_date: quotationData.quotation_date || new Date().toISOString().split('T')[0],
      subtotal_amount: subtotal,
      tax_percent: taxPercent,
      tax_amount: taxAmt,
      other_charges: otherCharges,
      total_amount: totalAmt,
      validity_date: quotationData.validity_date || '',
      delivery_timeline: quotationData.delivery_timeline || '15 Days',
      remarks: quotationData.remarks || '',
      is_selected: false,
      selection_rationale: '',
      document_url: quotationData.document_url || null,
      created_by: currentUser?.id,
      created_at: new Date().toISOString(),
      quotation_items: quotationData.quotation_items || []
    };

    setRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        const updatedQuots = [...(req.quotations || []), newQuot];
        const nextStage = req.current_stage === 'requirement' ? 'quotations' : req.current_stage;
        return {
          ...req,
          quotations: updatedQuots,
          current_stage: nextStage,
          overall_status: req.overall_status === 'Draft' ? 'Pending Quotations' : req.overall_status
        };
      }
      return req;
    }));

    const req = requests.find(r => r.id === reqId);
    logAudit('ADD_QUOTATION', 'quotation', quotId, {
      request_no: req?.request_no,
      agency_id: quotationData.agency_id,
      total_amount: totalAmt
    });
    return newQuot;
  };

  // 4. Select Quotation with Rationale
  const selectQuotation = (reqId, quotId, rationale) => {
    setRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        const updatedQuots = (req.quotations || []).map(q => ({
          ...q,
          is_selected: q.id === quotId,
          selection_rationale: q.id === quotId ? rationale : ''
        }));
        return {
          ...req,
          quotations: updatedQuots
        };
      }
      return req;
    }));

    const req = requests.find(r => r.id === reqId);
    logAudit('SELECT_QUOTATION', 'quotation', quotId, {
      request_no: req?.request_no,
      rationale
    });
  };

  // 5. Submit Approval / Record Decision
  const submitApproval = (reqId, approvalData) => {
    const apprId = 'appr-' + Date.now();
    const newApproval = {
      id: apprId,
      authority_id: approvalData.authority_id,
      selected_agency_id: approvalData.selected_agency_id,
      submission_date: approvalData.submission_date || new Date().toISOString().split('T')[0],
      proposed_amount: parseFloat(approvalData.proposed_amount) || 0,
      decision: approvalData.decision || 'Pending',
      decision_date: approvalData.decision_date || (approvalData.decision !== 'Pending' ? new Date().toISOString().split('T')[0] : null),
      approved_amount: approvalData.approved_amount ? parseFloat(approvalData.approved_amount) : (approvalData.decision === 'Approved' ? parseFloat(approvalData.proposed_amount) : null),
      decision_remarks: approvalData.decision_remarks || '',
      is_recorded_external: Boolean(approvalData.is_recorded_external),
      decided_by: currentUser?.id,
      created_at: new Date().toISOString()
    };

    setRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        const updatedApprovals = [...(req.approvals || []), newApproval];
        let nextStage = req.current_stage;
        let nextStatus = req.overall_status;

        if (newApproval.decision === 'Approved') {
          nextStage = 'approved';
          nextStatus = 'Approved';
        } else if (newApproval.decision === 'Rejected') {
          nextStage = 'rejected';
          nextStatus = 'Rejected';
        } else if (newApproval.decision === 'Returned for Clarification') {
          nextStage = 'quotations';
          nextStatus = 'Returned for Clarification';
        } else {
          nextStage = 'approval_pending';
          nextStatus = 'Awaiting Approval';
        }

        return {
          ...req,
          approvals: updatedApprovals,
          current_stage: nextStage,
          overall_status: nextStatus
        };
      }
      return req;
    }));

    const req = requests.find(r => r.id === reqId);
    logAudit('RECORD_APPROVAL_DECISION', 'approval', apprId, {
      request_no: req?.request_no,
      decision: newApproval.decision,
      approved_amount: newApproval.approved_amount,
      is_recorded_external: newApproval.is_recorded_external
    });
    return newApproval;
  };

  // 6. Generate / Issue Approval Letter
  const issueApprovalLetter = (reqId, letterData) => {
    const req = requests.find(r => r.id === reqId);
    const org = organizations.find(o => o.id === req?.org_id);
    const letterNo = letterData.letter_no || getNextLetterNo(org?.code || 'CVM');

    const newLetter = {
      id: 'let-' + Date.now(),
      request_id: reqId,
      letter_no: letterNo,
      letter_date: letterData.letter_date || new Date().toISOString().split('T')[0],
      signatory_title: letterData.signatory_title || 'Hon. Joint Secretary',
      signatory_name: letterData.signatory_name || 'Shri Prayasvin Patel',
      subject: letterData.subject || `Sanction order for ${req?.title}`,
      content_body: letterData.content_body || '',
      dispatch_date: letterData.dispatch_date || null,
      dispatch_mode: letterData.dispatch_mode || 'Internal Dispatch',
      recipient_name: letterData.recipient_name || '',
      dispatch_remarks: letterData.dispatch_remarks || '',
      status: letterData.status || 'Generated',
      created_at: new Date().toISOString()
    };

    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          approval_letter: newLetter,
          // Initialize work record if not present
          work_record: r.work_record || {
            id: 'wrk-' + Date.now(),
            agency_id: r.approvals?.[r.approvals.length - 1]?.selected_agency_id || null,
            status: 'Not Started',
            start_date: null,
            completion_date: null,
            engineer_name: '',
            remarks: 'Approval letter issued. Awaiting work commencement.'
          }
        };
      }
      return r;
    }));

    logAudit('ISSUE_APPROVAL_LETTER', 'approval_letter', letterNo, {
      request_no: req?.request_no,
      letter_no: letterNo,
      recipient: newLetter.recipient_name
    });
    return newLetter;
  };

  // 7. Update Work Status
  const updateWorkStatus = (reqId, workData) => {
    setRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        const prevStatus = req.work_record?.status || 'Not Started';
        const updatedWork = {
          ...(req.work_record || {}),
          id: req.work_record?.id || ('wrk-' + Date.now()),
          agency_id: workData.agency_id || req.work_record?.agency_id,
          status: workData.status,
          start_date: workData.start_date || req.work_record?.start_date,
          completion_date: workData.completion_date || (workData.status === 'Completed' ? new Date().toISOString().split('T')[0] : null),
          engineer_name: workData.engineer_name || req.work_record?.engineer_name || '',
          remarks: workData.remarks || req.work_record?.remarks || '',
          history: [
            ...(req.work_record?.history || []),
            {
              id: 'wsh-' + Date.now(),
              previous_status: prevStatus,
              new_status: workData.status,
              remarks: workData.remarks,
              changed_by: currentUser?.full_name,
              timestamp: new Date().toISOString()
            }
          ]
        };

        let nextStage = req.current_stage;
        let nextStatus = req.overall_status;
        if (workData.status === 'In Progress') {
          nextStage = 'in_progress';
          nextStatus = 'Work In Progress';
        } else if (workData.status === 'Completed') {
          nextStage = 'completed';
          nextStatus = 'Work Completed';
        }

        return {
          ...req,
          work_record: updatedWork,
          current_stage: nextStage,
          overall_status: nextStatus
        };
      }
      return req;
    }));

    const req = requests.find(r => r.id === reqId);
    logAudit('UPDATE_WORK_STATUS', 'work_record', req?.request_no, {
      status: workData.status,
      engineer: workData.engineer_name
    });
  };

  // 8. Add / Update Bill
  const addBill = (reqId, billData) => {
    const billId = 'bill-' + Date.now();
    const newBill = {
      id: billId,
      agency_id: billData.agency_id,
      bill_no: billData.bill_no,
      bill_date: billData.bill_date || new Date().toISOString().split('T')[0],
      submitted_amount: parseFloat(billData.submitted_amount) || 0,
      bill_approval_date: billData.bill_approval_date || null,
      approved_amount: billData.approved_amount ? parseFloat(billData.approved_amount) : null,
      bill_status: billData.bill_status || 'Submitted',
      payment_ref: billData.payment_ref || '',
      remarks: billData.remarks || '',
      document_url: billData.document_url || null,
      created_at: new Date().toISOString()
    };

    setRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        const updatedBills = [...(req.bills || []), newBill];
        return {
          ...req,
          bills: updatedBills,
          current_stage: req.current_stage === 'completed' ? 'billed' : req.current_stage,
          overall_status: newBill.bill_status === 'Approved' ? 'Bill Approved' : 'Pending Bill'
        };
      }
      return req;
    }));

    const req = requests.find(r => r.id === reqId);
    logAudit('ADD_BILL', 'bill', billData.bill_no, {
      request_no: req?.request_no,
      submitted_amount: newBill.submitted_amount,
      bill_status: newBill.bill_status
    });
    return newBill;
  };

  // 9. Close Request
  const closeRequest = (reqId, closureReason) => {
    setRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        return {
          ...req,
          current_stage: 'closed',
          overall_status: 'Closed',
          closure_date: new Date().toISOString().split('T')[0],
          closure_reason: closureReason
        };
      }
      return req;
    }));

    const req = requests.find(r => r.id === reqId);
    logAudit('CLOSE_REQUEST', 'request', req?.request_no, { reason: closureReason });
  };

  // 10. Reopen Request
  const reopenRequest = (reqId, reopenReason) => {
    setRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        return {
          ...req,
          current_stage: 'in_progress',
          overall_status: 'Work In Progress',
          reopened_at: new Date().toISOString(),
          reopen_reason: reopenReason
        };
      }
      return req;
    }));

    const req = requests.find(r => r.id === reqId);
    logAudit('REOPEN_REQUEST', 'request', req?.request_no, { reason: reopenReason });
  };

  // 11. Documents & Scanner Uploads
  const addDocument = (reqId, doc) => {
    const docId = 'doc-' + Date.now();
    const newDoc = {
      id: docId,
      request_id: reqId,
      category: doc.category || 'Other',
      file_name: doc.file_name,
      file_path: doc.file_path || doc.dataUrl,
      file_size: doc.file_size || 0,
      mime_type: doc.mime_type || 'application/pdf',
      uploaded_by: currentUser?.id,
      uploaded_by_name: currentUser?.full_name,
      is_scanned: Boolean(doc.is_scanned),
      created_at: new Date().toISOString()
    };

    setDocuments(prev => [newDoc, ...prev]);
    const req = requests.find(r => r.id === reqId);
    logAudit('UPLOAD_DOCUMENT', 'document', doc.file_name, {
      request_no: req?.request_no,
      category: newDoc.category,
      is_scanned: newDoc.is_scanned
    });
    return newDoc;
  };

  // Master Data Add/Edit methods
  const addInstitute = (data) => {
    const id = 'inst-' + (institutes.length + 1);
    const newInst = { id, ...data, is_active: true };
    setInstitutes(prev => [...prev, newInst]);
    logAudit('CREATE_INSTITUTE', 'institute', data.name, data);
    return newInst;
  };

  const updateInstitute = (id, data) => {
    setInstitutes(prev => prev.map(inst => inst.id === id ? { ...inst, ...data } : inst));
    logAudit('UPDATE_INSTITUTE', 'institute', id, data);
  };

  const addAgency = (data) => {
    const id = 'agency-' + (agencies.length + 1);
    const newAgency = { id, ...data, is_active: true };
    setAgencies(prev => [...prev, newAgency]);
    logAudit('CREATE_AGENCY', 'agency', data.name, data);
    return newAgency;
  };

  const updateAgency = (id, data) => {
    setAgencies(prev => prev.map(ag => ag.id === id ? { ...ag, ...data } : ag));
    logAudit('UPDATE_AGENCY', 'agency', id, data);
  };

  const addAuthority = (data) => {
    const id = 'auth-' + (authorities.length + 1);
    const newAuth = { id, ...data, is_active: true };
    setAuthorities(prev => [...prev, newAuth]);
    logAudit('CREATE_AUTHORITY', 'authority', data.title, data);
    return newAuth;
  };

  const updateAuthority = (id, data) => {
    setAuthorities(prev => prev.map(auth => auth.id === id ? { ...auth, ...data } : auth));
    logAudit('UPDATE_AUTHORITY', 'authority', id, data);
  };

  // Reset to Factory Default Demo Data
  const resetToFactoryData = () => {
    setOrganizations(INITIAL_ORGANIZATIONS);
    setInstitutes(INITIAL_INSTITUTES);
    setAgencies(INITIAL_AGENCIES);
    setAuthorities(INITIAL_AUTHORITIES);
    setRequests(INITIAL_SAMPLE_REQUESTS);
    setDocuments([]);
    setStockNotes(INITIAL_STOCK_NOTES);
    setUsers(DEFAULT_USERS);
    logAudit('SYSTEM_RESET', 'system', 'factory_reset', { message: 'Reset all records to factory master data and historical examples.' });
  };

  // Batch CSV Import Handler
  const importCsvBatch = (importedRequests) => {
    setRequests(prev => [...importedRequests, ...prev]);
    logAudit('BATCH_CSV_IMPORT', 'request', `Imported ${importedRequests.length} rows`, {
      count: importedRequests.length
    });
  };

  return (
    <DataContext.Provider
      value={{
        organizations,
        institutes,
        agencies,
        authorities,
        requests,
        documents,
        auditLogs,
        users,
        stockNotes,
        letterSettings,
        setLetterSettings,
        createRequest,
        updateRequest,
        addQuotation,
        selectQuotation,
        submitApproval,
        issueApprovalLetter,
        updateWorkStatus,
        addBill,
        closeRequest,
        reopenRequest,
        addDocument,
        addInstitute,
        updateInstitute,
        addAgency,
        updateAgency,
        addAuthority,
        updateAuthority,
        resetToFactoryData,
        importCsvBatch,
        logAudit,
        getNextRequestNo,
        getNextLetterNo
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
