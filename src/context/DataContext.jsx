// =====================================================================
// Data Context - Central State Store, Operational Logic & Cloud Sync
// =====================================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
import { supabase, isSupabaseConfigured } from '../supabaseClient';

const DataContext = createContext(null);

// Safe UUID generator
export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const isUUID = (str) => {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export const DataProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const broadcastChannelRef = useRef(null);

  // Sync state tracking
  const [syncStatus, setSyncStatus] = useState(isSupabaseConfigured ? 'syncing' : 'local');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncError, setSyncError] = useState(null);

  // Master State initialized with LocalStorage Cache / Seed Fallback
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

  // LocalStorage Offline Persistence
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

  // Cross-Tab / Cross-Window Synchronization via BroadcastChannel
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('noc_cross_device_sync');
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data?.type === 'REFETCH') {
            if (isSupabaseConfigured && supabase) {
              fetchCloudData();
            } else {
              const savedReqs = localStorage.getItem('noc_requests');
              if (savedReqs) setRequests(JSON.parse(savedReqs));
            }
          }
        };
        return () => {
          bc.close();
        };
      } catch (err) {
        console.warn('BroadcastChannel not available:', err);
      }
    }
  }, []);

  const notifyCrossTab = () => {
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({ type: 'REFETCH', timestamp: Date.now() });
      } catch (e) {
        // ignore
      }
    }
  };

  // Log Audit Action
  const logAudit = useCallback((action, entityType, entityId, changes) => {
    const newLog = {
      id: generateUUID(),
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

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('audit_logs')
        .insert({
          id: newLog.id,
          actor_id: isUUID(newLog.actor_id) ? newLog.actor_id : null,
          actor_name: newLog.actor_name,
          actor_email: newLog.actor_email,
          action: newLog.action,
          entity_type: newLog.entity_type,
          entity_id: newLog.entity_id,
          changes: newLog.changes,
          created_at: newLog.created_at
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase audit log insert error:', error.message);
        })
        .catch(err => console.warn('Supabase audit log catch:', err));
    }
  }, [currentUser]);

  // Transform Supabase Relational Request into Frontend Structure
  const transformSupabaseRequest = (row) => {
    return {
      id: row.id,
      request_no: row.request_no,
      org_id: row.org_id,
      institute_id: row.institute_id,
      request_date: row.request_date || new Date().toISOString().split('T')[0],
      clg_out_no: row.clg_out_no || '',
      clg_in_no: row.clg_in_no || '',
      request_type: row.request_type || 'New Purchase',
      title: row.title,
      description: row.description || '',
      estimated_budget: row.estimated_budget !== null ? parseFloat(row.estimated_budget) : null,
      current_stage: row.current_stage || 'requirement',
      overall_status: row.overall_status || 'Pending Quotations',
      internal_notes: row.internal_notes || '',
      is_historical: Boolean(row.is_historical),
      historical_notes: row.historical_notes || '',
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
      items: (row.items || row.request_items || []).map(it => ({
        id: it.id,
        item_name: it.item_name,
        category: it.category || 'General',
        quantity: parseInt(it.quantity) || 1,
        unit: it.unit || 'Nos',
        specifications: it.specifications || '',
        estimated_unit_price: it.estimated_unit_price !== null ? parseFloat(it.estimated_unit_price) : null
      })),
      quotations: (row.quotations || []).map(q => ({
        id: q.id,
        agency_id: q.agency_id,
        quotation_no: q.quotation_no || '',
        quotation_date: q.quotation_date || '',
        subtotal_amount: parseFloat(q.subtotal_amount) || 0,
        tax_percent: parseFloat(q.tax_percent) || 18,
        tax_amount: parseFloat(q.tax_amount) || 0,
        other_charges: parseFloat(q.other_charges) || 0,
        total_amount: parseFloat(q.total_amount) || 0,
        validity_date: q.validity_date || '',
        delivery_timeline: q.delivery_timeline || '15 Days',
        remarks: q.remarks || '',
        is_selected: Boolean(q.is_selected),
        selection_rationale: q.selection_rationale || '',
        document_url: q.document_url || null,
        created_by: q.created_by,
        created_at: q.created_at,
        quotation_items: (q.quotation_items || []).map(qi => ({
          id: qi.id,
          request_item_id: qi.request_item_id,
          item_name: qi.item_name,
          quantity: parseInt(qi.quantity) || 1,
          unit_price: parseFloat(qi.unit_price) || 0,
          tax_percent: parseFloat(qi.tax_percent) || 18,
          total_price: parseFloat(qi.total_price) || 0
        }))
      })),
      approvals: (row.approvals || []).map(a => ({
        id: a.id,
        authority_id: a.authority_id,
        selected_agency_id: a.selected_agency_id,
        submission_date: a.submission_date || '',
        proposed_amount: parseFloat(a.proposed_amount) || 0,
        decision: a.decision || 'Pending',
        decision_date: a.decision_date || null,
        approved_amount: a.approved_amount !== null ? parseFloat(a.approved_amount) : null,
        decision_remarks: a.decision_remarks || '',
        is_recorded_external: Boolean(a.is_recorded_external),
        decided_by: a.decided_by,
        created_at: a.created_at
      })),
      approval_letter: (row.approval_letters && row.approval_letters.length > 0) ? {
        id: row.approval_letters[0].id,
        letter_no: row.approval_letters[0].letter_no,
        letter_date: row.approval_letters[0].letter_date,
        signatory_title: row.approval_letters[0].signatory_title || '',
        signatory_name: row.approval_letters[0].signatory_name || '',
        subject: row.approval_letters[0].subject || '',
        content_body: row.approval_letters[0].content_body || '',
        dispatch_date: row.approval_letters[0].dispatch_date || null,
        dispatch_mode: row.approval_letters[0].dispatch_mode || 'Internal Dispatch',
        recipient_name: row.approval_letters[0].recipient_name || '',
        dispatch_remarks: row.approval_letters[0].dispatch_remarks || '',
        generated_pdf_url: row.approval_letters[0].generated_pdf_url || null,
        signed_letter_url: row.approval_letters[0].signed_letter_url || null,
        status: row.approval_letters[0].status || 'Generated',
        created_at: row.approval_letters[0].created_at
      } : null,
      work_record: (row.work_records && row.work_records.length > 0) ? {
        id: row.work_records[0].id,
        agency_id: row.work_records[0].agency_id,
        status: row.work_records[0].status || 'Not Started',
        start_date: row.work_records[0].start_date || null,
        completion_date: row.work_records[0].completion_date || null,
        engineer_name: row.work_records[0].engineer_name || '',
        remarks: row.work_records[0].remarks || '',
        history: (row.work_records[0].history || row.work_records[0].work_status_history || []).map(h => ({
          id: h.id,
          previous_status: h.previous_status,
          new_status: h.new_status,
          remarks: h.remarks || '',
          changed_by: h.changed_by || '',
          timestamp: h.created_at || h.timestamp
        }))
      } : null,
      bills: (row.bills || []).map(b => ({
        id: b.id,
        agency_id: b.agency_id,
        bill_no: b.bill_no,
        bill_date: b.bill_date || '',
        submitted_amount: parseFloat(b.submitted_amount) || 0,
        bill_approval_date: b.bill_approval_date || null,
        approved_amount: b.approved_amount !== null ? parseFloat(b.approved_amount) : null,
        bill_status: b.bill_status || 'Submitted',
        payment_ref: b.payment_ref || '',
        remarks: b.remarks || '',
        document_url: b.document_url || null,
        created_at: b.created_at
      }))
    };
  };

  // Fetch Entire Cloud Data from Supabase
  const fetchCloudData = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setSyncStatus('local');
      return;
    }

    try {
      setSyncStatus('syncing');
      setSyncError(null);

      // 1. Fetch Master Tables in Parallel
      const [
        orgsRes,
        instsRes,
        agenciesRes,
        authsRes,
        stockRes,
        docsRes,
        auditRes,
        reqsRes
      ] = await Promise.all([
        supabase.from('organizations').select('*').order('code'),
        supabase.from('institutes').select('*').order('name'),
        supabase.from('agencies').select('*').order('name'),
        supabase.from('approval_authorities').select('*').order('sort_order'),
        supabase.from('historical_stock_notes').select('*'),
        supabase.from('documents').select('*').order('created_at', { ascending: false }),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('requests').select(`
          *,
          items:request_items(*),
          quotations(*, quotation_items(*)),
          approvals(*),
          approval_letters(*),
          work_records(*, history:work_status_history(*)),
          bills(*)
        `).order('created_at', { ascending: false })
      ]);

      if (orgsRes.data && orgsRes.data.length > 0) {
        setOrganizations(orgsRes.data);
      }
      if (instsRes.data && instsRes.data.length > 0) {
        setInstitutes(instsRes.data);
      }
      if (agenciesRes.data && agenciesRes.data.length > 0) {
        setAgencies(agenciesRes.data);
      }
      if (authsRes.data && authsRes.data.length > 0) {
        setAuthorities(authsRes.data);
      }
      if (stockRes.data && stockRes.data.length > 0) {
        setStockNotes(stockRes.data);
      }
      if (docsRes.data) {
        setDocuments(docsRes.data);
      }
      if (auditRes.data && auditRes.data.length > 0) {
        setAuditLogs(auditRes.data);
      }

      // Handle Requests
      if (reqsRes.data && reqsRes.data.length > 0) {
        const transformed = reqsRes.data.map(transformSupabaseRequest);
        setRequests(transformed);
      } else if (reqsRes.data && reqsRes.data.length === 0) {
        // If Supabase requests table is empty, auto-seed with initial sample requests
        console.info('Supabase requests table is empty. Keeping local / initial seed requests.');
      }

      setSyncStatus('synced');
      setLastSyncTime(new Date().toISOString());
    } catch (err) {
      console.error('Supabase cloud fetch error:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  }, []);

  // Initialize Real-time Cloud Connection and Event Subscriptions
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setSyncStatus('local');
      return;
    }

    fetchCloudData();

    // Subscribe to all changes on public schema tables
    const channel = supabase
      .channel('noc-global-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => {
        fetchCloudData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'request_items' }, () => {
        fetchCloudData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotations' }, () => {
        fetchCloudData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'approvals' }, () => {
        fetchCloudData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'approval_letters' }, () => {
        fetchCloudData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_records' }, () => {
        fetchCloudData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bills' }, () => {
        fetchCloudData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => {
        fetchCloudData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'institutes' }, () => {
        fetchCloudData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agencies' }, () => {
        fetchCloudData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'approval_authorities' }, () => {
        fetchCloudData();
      })
      .subscribe();

    // Refetch on Window Focus & Network Reconnect
    const onWindowFocus = () => fetchCloudData();
    const onOnline = () => fetchCloudData();

    window.addEventListener('focus', onWindowFocus);
    window.addEventListener('online', onOnline);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('focus', onWindowFocus);
      window.removeEventListener('online', onOnline);
    };
  }, [fetchCloudData]);

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
  const createRequest = async (formData) => {
    const newReqId = generateUUID();
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
        id: generateUUID(),
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

    // Optimistic Local State Update
    setRequests(prev => [newRequest, ...prev]);
    logAudit('CREATE_REQUEST', 'request', reqNo, {
      title: newRequest.title,
      institute_id: newRequest.institute_id,
      estimated_budget: newRequest.estimated_budget
    });
    notifyCrossTab();

    // Supabase Cloud Persistence
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: reqErr } = await supabase.from('requests').insert({
          id: newReqId,
          request_no: reqNo,
          org_id: isUUID(newRequest.org_id) ? newRequest.org_id : null,
          institute_id: isUUID(newRequest.institute_id) ? newRequest.institute_id : null,
          request_date: newRequest.request_date,
          clg_out_no: newRequest.clg_out_no || null,
          clg_in_no: newRequest.clg_in_no || null,
          request_type: newRequest.request_type,
          title: newRequest.title,
          description: newRequest.description || null,
          estimated_budget: newRequest.estimated_budget,
          current_stage: newRequest.current_stage,
          overall_status: newRequest.overall_status,
          internal_notes: newRequest.internal_notes || null,
          is_historical: false,
          created_by: currentUser?.id && isUUID(currentUser.id) ? currentUser.id : null,
          created_at: newRequest.created_at
        });

        if (reqErr) console.warn('Supabase createRequest error:', reqErr.message);

        if (newRequest.items.length > 0) {
          const itemsPayload = newRequest.items.map(it => ({
            id: it.id,
            request_id: newReqId,
            item_name: it.item_name,
            category: it.category,
            quantity: it.quantity,
            unit: it.unit,
            specifications: it.specifications || null,
            estimated_unit_price: it.estimated_unit_price
          }));
          await supabase.from('request_items').insert(itemsPayload);
        }
      } catch (err) {
        console.error('Failed to sync new request to Supabase:', err);
      }
    }

    return newRequest;
  };

  // 2. Update Request
  const updateRequest = async (reqId, updates) => {
    setRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        const updated = { ...req, ...updates, updated_at: new Date().toISOString() };
        logAudit('UPDATE_REQUEST', 'request', req.request_no, updates);
        return updated;
      }
      return req;
    }));
    notifyCrossTab();

    if (isSupabaseConfigured && supabase) {
      try {
        const cloudUpdates = {};
        if (updates.title !== undefined) cloudUpdates.title = updates.title;
        if (updates.description !== undefined) cloudUpdates.description = updates.description;
        if (updates.estimated_budget !== undefined) cloudUpdates.estimated_budget = updates.estimated_budget;
        if (updates.request_type !== undefined) cloudUpdates.request_type = updates.request_type;
        if (updates.clg_out_no !== undefined) cloudUpdates.clg_out_no = updates.clg_out_no;
        if (updates.clg_in_no !== undefined) cloudUpdates.clg_in_no = updates.clg_in_no;
        if (updates.internal_notes !== undefined) cloudUpdates.internal_notes = updates.internal_notes;
        if (updates.current_stage !== undefined) cloudUpdates.current_stage = updates.current_stage;
        if (updates.overall_status !== undefined) cloudUpdates.overall_status = updates.overall_status;
        cloudUpdates.updated_at = new Date().toISOString();

        await supabase.from('requests').update(cloudUpdates).eq('id', reqId);
      } catch (err) {
        console.error('Failed to sync request update to Supabase:', err);
      }
    }
  };

  // 3. Add Quotation
  const addQuotation = async (reqId, quotationData) => {
    const quotId = generateUUID();
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

    let nextStage = 'quotations';
    let nextStatus = 'Pending Quotations';

    setRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        const updatedQuots = [...(req.quotations || []), newQuot];
        nextStage = req.current_stage === 'requirement' ? 'quotations' : req.current_stage;
        nextStatus = req.overall_status === 'Draft' ? 'Pending Quotations' : req.overall_status;
        return {
          ...req,
          quotations: updatedQuots,
          current_stage: nextStage,
          overall_status: nextStatus
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
    notifyCrossTab();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('quotations').insert({
          id: quotId,
          request_id: reqId,
          agency_id: isUUID(newQuot.agency_id) ? newQuot.agency_id : null,
          quotation_no: newQuot.quotation_no || null,
          quotation_date: newQuot.quotation_date || null,
          subtotal_amount: newQuot.subtotal_amount,
          tax_percent: newQuot.tax_percent,
          tax_amount: newQuot.tax_amount,
          other_charges: newQuot.other_charges,
          total_amount: newQuot.total_amount,
          validity_date: newQuot.validity_date || null,
          delivery_timeline: newQuot.delivery_timeline || null,
          remarks: newQuot.remarks || null,
          is_selected: false,
          created_by: currentUser?.id && isUUID(currentUser.id) ? currentUser.id : null,
          created_at: newQuot.created_at
        });

        await supabase.from('requests').update({
          current_stage: nextStage,
          overall_status: nextStatus,
          updated_at: new Date().toISOString()
        }).eq('id', reqId);
      } catch (err) {
        console.error('Failed to sync quotation to Supabase:', err);
      }
    }

    return newQuot;
  };

  // 4. Select Quotation with Rationale
  const selectQuotation = async (reqId, quotId, rationale) => {
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
    notifyCrossTab();

    if (isSupabaseConfigured && supabase) {
      try {
        // Deselect all other quotations for this request
        await supabase.from('quotations').update({ is_selected: false, selection_rationale: '' }).eq('request_id', reqId);
        // Select the chosen one
        await supabase.from('quotations').update({ is_selected: true, selection_rationale: rationale }).eq('id', quotId);
      } catch (err) {
        console.error('Failed to sync quotation selection to Supabase:', err);
      }
    }
  };

  // 5. Submit Approval / Record Decision
  const submitApproval = async (reqId, approvalData) => {
    const apprId = generateUUID();
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

    let nextStage = 'approval_pending';
    let nextStatus = 'Awaiting Approval';

    if (newApproval.decision === 'Approved') {
      nextStage = 'approved';
      nextStatus = 'Approved';
    } else if (newApproval.decision === 'Rejected') {
      nextStage = 'rejected';
      nextStatus = 'Rejected';
    } else if (newApproval.decision === 'Returned for Clarification') {
      nextStage = 'quotations';
      nextStatus = 'Returned for Clarification';
    }

    setRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        const updatedApprovals = [...(req.approvals || []), newApproval];
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
    notifyCrossTab();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('approvals').insert({
          id: apprId,
          request_id: reqId,
          authority_id: isUUID(newApproval.authority_id) ? newApproval.authority_id : null,
          selected_agency_id: isUUID(newApproval.selected_agency_id) ? newApproval.selected_agency_id : null,
          submission_date: newApproval.submission_date || null,
          proposed_amount: newApproval.proposed_amount,
          decision: newApproval.decision,
          decision_date: newApproval.decision_date || null,
          approved_amount: newApproval.approved_amount,
          decision_remarks: newApproval.decision_remarks || null,
          is_recorded_external: newApproval.is_recorded_external,
          decided_by: currentUser?.id && isUUID(currentUser.id) ? currentUser.id : null,
          created_at: newApproval.created_at
        });

        await supabase.from('requests').update({
          current_stage: nextStage,
          overall_status: nextStatus,
          updated_at: new Date().toISOString()
        }).eq('id', reqId);
      } catch (err) {
        console.error('Failed to sync approval to Supabase:', err);
      }
    }

    return newApproval;
  };

  // 6. Generate / Issue Approval Letter
  const issueApprovalLetter = async (reqId, letterData) => {
    const req = requests.find(r => r.id === reqId);
    const org = organizations.find(o => o.id === req?.org_id);
    const letterNo = letterData.letter_no || getNextLetterNo(org?.code || 'CVM');
    const letId = generateUUID();
    const wrkId = generateUUID();

    const newLetter = {
      id: letId,
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

    const initialWorkRecord = req?.work_record || {
      id: wrkId,
      agency_id: req?.approvals?.[req?.approvals?.length - 1]?.selected_agency_id || null,
      status: 'Not Started',
      start_date: null,
      completion_date: null,
      engineer_name: '',
      remarks: 'Approval letter issued. Awaiting work commencement.'
    };

    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          approval_letter: newLetter,
          work_record: initialWorkRecord
        };
      }
      return r;
    }));

    logAudit('ISSUE_APPROVAL_LETTER', 'approval_letter', letterNo, {
      request_no: req?.request_no,
      letter_no: letterNo,
      recipient: newLetter.recipient_name
    });
    notifyCrossTab();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('approval_letters').insert({
          id: letId,
          request_id: reqId,
          letter_no: letterNo,
          letter_date: newLetter.letter_date,
          signatory_title: newLetter.signatory_title,
          signatory_name: newLetter.signatory_name,
          subject: newLetter.subject,
          content_body: newLetter.content_body || null,
          dispatch_date: newLetter.dispatch_date || null,
          dispatch_mode: newLetter.dispatch_mode,
          recipient_name: newLetter.recipient_name || null,
          dispatch_remarks: newLetter.dispatch_remarks || null,
          status: newLetter.status,
          created_at: newLetter.created_at
        });

        // Insert initial work record if none exists
        if (!req?.work_record) {
          await supabase.from('work_records').insert({
            id: wrkId,
            request_id: reqId,
            agency_id: isUUID(initialWorkRecord.agency_id) ? initialWorkRecord.agency_id : null,
            status: 'Not Started',
            remarks: initialWorkRecord.remarks,
            created_at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Failed to sync approval letter to Supabase:', err);
      }
    }

    return newLetter;
  };

  // 7. Update Work Status
  const updateWorkStatus = async (reqId, workData) => {
    let nextStage = 'in_progress';
    let nextStatus = 'Work In Progress';
    if (workData.status === 'Completed') {
      nextStage = 'completed';
      nextStatus = 'Work Completed';
    } else if (workData.status === 'Not Started') {
      nextStage = 'approved';
      nextStatus = 'Approved';
    }

    const wshId = generateUUID();
    let updatedWorkRecord = null;

    setRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        const prevStatus = req.work_record?.status || 'Not Started';
        const updatedWork = {
          ...(req.work_record || {}),
          id: req.work_record?.id || generateUUID(),
          agency_id: workData.agency_id || req.work_record?.agency_id,
          status: workData.status,
          start_date: workData.start_date || req.work_record?.start_date,
          completion_date: workData.completion_date || (workData.status === 'Completed' ? new Date().toISOString().split('T')[0] : null),
          engineer_name: workData.engineer_name || req.work_record?.engineer_name || '',
          remarks: workData.remarks || req.work_record?.remarks || '',
          history: [
            ...(req.work_record?.history || []),
            {
              id: wshId,
              previous_status: prevStatus,
              new_status: workData.status,
              remarks: workData.remarks,
              changed_by: currentUser?.full_name,
              timestamp: new Date().toISOString()
            }
          ]
        };
        updatedWorkRecord = updatedWork;

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
    notifyCrossTab();

    if (isSupabaseConfigured && supabase && updatedWorkRecord) {
      try {
        await supabase.from('work_records').upsert({
          id: updatedWorkRecord.id,
          request_id: reqId,
          agency_id: isUUID(updatedWorkRecord.agency_id) ? updatedWorkRecord.agency_id : null,
          status: updatedWorkRecord.status,
          start_date: updatedWorkRecord.start_date || null,
          completion_date: updatedWorkRecord.completion_date || null,
          engineer_name: updatedWorkRecord.engineer_name || null,
          remarks: updatedWorkRecord.remarks || null,
          updated_at: new Date().toISOString()
        });

        await supabase.from('work_status_history').insert({
          id: wshId,
          work_record_id: updatedWorkRecord.id,
          previous_status: req?.work_record?.status || 'Not Started',
          new_status: workData.status,
          remarks: workData.remarks || null,
          changed_by: currentUser?.id && isUUID(currentUser.id) ? currentUser.id : null,
          created_at: new Date().toISOString()
        });

        await supabase.from('requests').update({
          current_stage: nextStage,
          overall_status: nextStatus,
          updated_at: new Date().toISOString()
        }).eq('id', reqId);
      } catch (err) {
        console.error('Failed to sync work status to Supabase:', err);
      }
    }
  };

  // 8. Add / Update Bill
  const addBill = async (reqId, billData) => {
    const billId = generateUUID();
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

    let nextStage = 'billed';
    let nextStatus = newBill.bill_status === 'Approved' ? 'Bill Approved' : 'Pending Bill';

    setRequests(prev => prev.map(req => {
      if (req.id === reqId) {
        const updatedBills = [...(req.bills || []), newBill];
        nextStage = req.current_stage === 'completed' ? 'billed' : req.current_stage;
        return {
          ...req,
          bills: updatedBills,
          current_stage: nextStage,
          overall_status: nextStatus
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
    notifyCrossTab();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('bills').insert({
          id: billId,
          request_id: reqId,
          agency_id: isUUID(newBill.agency_id) ? newBill.agency_id : null,
          bill_no: newBill.bill_no,
          bill_date: newBill.bill_date,
          submitted_amount: newBill.submitted_amount,
          bill_approval_date: newBill.bill_approval_date || null,
          approved_amount: newBill.approved_amount,
          bill_status: newBill.bill_status,
          payment_ref: newBill.payment_ref || null,
          remarks: newBill.remarks || null,
          document_url: newBill.document_url || null,
          created_at: newBill.created_at
        });

        await supabase.from('requests').update({
          current_stage: nextStage,
          overall_status: nextStatus,
          updated_at: new Date().toISOString()
        }).eq('id', reqId);
      } catch (err) {
        console.error('Failed to sync bill to Supabase:', err);
      }
    }

    return newBill;
  };

  // 9. Close Request
  const closeRequest = async (reqId, closureReason) => {
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
    notifyCrossTab();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('requests').update({
          current_stage: 'closed',
          overall_status: 'Closed',
          internal_notes: (req?.internal_notes ? req.internal_notes + '\n' : '') + `Closed: ${closureReason}`,
          updated_at: new Date().toISOString()
        }).eq('id', reqId);
      } catch (err) {
        console.error('Failed to sync closeRequest to Supabase:', err);
      }
    }
  };

  // 10. Reopen Request
  const reopenRequest = async (reqId, reopenReason) => {
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
    notifyCrossTab();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('requests').update({
          current_stage: 'in_progress',
          overall_status: 'Work In Progress',
          internal_notes: (req?.internal_notes ? req.internal_notes + '\n' : '') + `Reopened: ${reopenReason}`,
          updated_at: new Date().toISOString()
        }).eq('id', reqId);
      } catch (err) {
        console.error('Failed to sync reopenRequest to Supabase:', err);
      }
    }
  };

  // 11. Delete Request
  const deleteRequest = async (reqId) => {
    const req = requests.find(r => r.id === reqId);
    setRequests(prev => prev.filter(r => r.id !== reqId));
    logAudit('DELETE_REQUEST', 'request', req?.request_no || reqId, { id: reqId });
    notifyCrossTab();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('requests').delete().eq('id', reqId);
      } catch (err) {
        console.error('Failed to delete request from Supabase:', err);
      }
    }
  };

  // 12. Documents & Scanner Uploads
  const addDocument = async (reqId, doc) => {
    const docId = generateUUID();
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
    notifyCrossTab();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('documents').insert({
          id: docId,
          request_id: reqId,
          category: newDoc.category,
          file_name: newDoc.file_name,
          file_path: newDoc.file_path,
          file_size: newDoc.file_size,
          mime_type: newDoc.mime_type,
          uploaded_by: currentUser?.id && isUUID(currentUser.id) ? currentUser.id : null,
          is_scanned: newDoc.is_scanned,
          created_at: newDoc.created_at
        });
      } catch (err) {
        console.error('Failed to sync document to Supabase:', err);
      }
    }

    return newDoc;
  };

  // Master Data CRUD methods
  const addInstitute = async (data) => {
    const id = generateUUID();
    const newInst = { id, ...data, is_active: true };
    setInstitutes(prev => [...prev, newInst]);
    logAudit('CREATE_INSTITUTE', 'institute', data.name, data);
    notifyCrossTab();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('institutes').insert({
          id,
          org_id: isUUID(data.org_id) ? data.org_id : null,
          name: data.name,
          code: data.code || null,
          contact_person: data.contact_person || null,
          contact_email: data.contact_email || null,
          contact_phone: data.contact_phone || null,
          is_active: true
        });
      } catch (err) {
        console.error('Failed to sync new institute to Supabase:', err);
      }
    }

    return newInst;
  };

  const updateInstitute = async (id, data) => {
    setInstitutes(prev => prev.map(inst => (inst.id === id ? { ...inst, ...data } : inst)));
    logAudit('UPDATE_INSTITUTE', 'institute', id, data);
    notifyCrossTab();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('institutes').update(data).eq('id', id);
      } catch (err) {
        console.error('Failed to sync institute update to Supabase:', err);
      }
    }
  };

  const addAgency = async (data) => {
    const id = generateUUID();
    const newAgency = { id, ...data, is_active: true };
    setAgencies(prev => [...prev, newAgency]);
    logAudit('CREATE_AGENCY', 'agency', data.name, data);
    notifyCrossTab();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('agencies').insert({
          id,
          name: data.name,
          contact_person: data.contact_person || null,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          gstin: data.gstin || null,
          is_active: true
        });
      } catch (err) {
        console.error('Failed to sync new agency to Supabase:', err);
      }
    }

    return newAgency;
  };

  const updateAgency = async (id, data) => {
    setAgencies(prev => prev.map(ag => (ag.id === id ? { ...ag, ...data } : ag)));
    logAudit('UPDATE_AGENCY', 'agency', id, data);
    notifyCrossTab();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('agencies').update(data).eq('id', id);
      } catch (err) {
        console.error('Failed to sync agency update to Supabase:', err);
      }
    }
  };

  const addAuthority = async (data) => {
    const id = generateUUID();
    const newAuth = { id, ...data, is_active: true };
    setAuthorities(prev => [...prev, newAuth]);
    logAudit('CREATE_AUTHORITY', 'authority', data.title, data);
    notifyCrossTab();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('approval_authorities').insert({
          id,
          org_id: isUUID(data.org_id) ? data.org_id : null,
          title: data.title,
          officer_name: data.officer_name || null,
          sort_order: data.sort_order || 0,
          is_active: true
        });
      } catch (err) {
        console.error('Failed to sync new authority to Supabase:', err);
      }
    }

    return newAuth;
  };

  const updateAuthority = async (id, data) => {
    setAuthorities(prev => prev.map(auth => (auth.id === id ? { ...auth, ...data } : auth)));
    logAudit('UPDATE_AUTHORITY', 'authority', id, data);
    notifyCrossTab();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('approval_authorities').update(data).eq('id', id);
      } catch (err) {
        console.error('Failed to sync authority update to Supabase:', err);
      }
    }
  };

  // Reset to Factory Default Master Data
  const resetToFactoryData = async () => {
    setOrganizations(INITIAL_ORGANIZATIONS);
    setInstitutes(INITIAL_INSTITUTES);
    setAgencies(INITIAL_AGENCIES);
    setAuthorities(INITIAL_AUTHORITIES);
    setRequests(INITIAL_SAMPLE_REQUESTS);
    setDocuments([]);
    setStockNotes(INITIAL_STOCK_NOTES);
    setUsers(DEFAULT_USERS);
    logAudit('SYSTEM_RESET', 'system', 'factory_reset', { message: 'Reset all records to factory master data and historical examples.' });
    notifyCrossTab();

    if (isSupabaseConfigured && supabase) {
      fetchCloudData();
    }
  };

  // Batch CSV Import Handler
  const importCsvBatch = async (importedRequests) => {
    setRequests(prev => [...importedRequests, ...prev]);
    logAudit('BATCH_CSV_IMPORT', 'request', `Imported ${importedRequests.length} rows`, {
      count: importedRequests.length
    });
    notifyCrossTab();

    if (isSupabaseConfigured && supabase) {
      try {
        for (const req of importedRequests) {
          await supabase.from('requests').insert({
            id: isUUID(req.id) ? req.id : generateUUID(),
            request_no: req.request_no,
            org_id: isUUID(req.org_id) ? req.org_id : null,
            institute_id: isUUID(req.institute_id) ? req.institute_id : null,
            request_date: req.request_date,
            request_type: req.request_type,
            title: req.title,
            description: req.description || null,
            estimated_budget: req.estimated_budget || null,
            current_stage: req.current_stage || 'requirement',
            overall_status: req.overall_status || 'Pending Quotations',
            is_historical: Boolean(req.is_historical)
          });
        }
      } catch (err) {
        console.error('Failed to import CSV batch to Supabase:', err);
      }
    }
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
        syncStatus,
        lastSyncTime,
        syncError,
        refetchData: fetchCloudData,
        createRequest,
        updateRequest,
        deleteRequest,
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
