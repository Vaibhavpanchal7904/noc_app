// =====================================================================
// NOC Approval & Quotation Management System - Master & Initial Seed Data
// =====================================================================

export const INITIAL_ORGANIZATIONS = [
  {
    id: 'org-cvm',
    code: 'CVM',
    name: 'Charutar Vidya Mandal',
    description: 'CVM Managed Colleges & Institutes'
  },
  {
    id: 'org-cvmu',
    code: 'CVMU',
    name: 'Charutar Vidya Mandal University',
    description: 'CVMU Constituent Colleges & Departments'
  }
];

export const INITIAL_INSTITUTES = [
  // CVM Institutes (27)
  { id: 'inst-1', org_id: 'org-cvm', name: 'V.P. and R.P.T.P. Science College', code: 'VP_RPTP', is_active: true },
  { id: 'inst-2', org_id: 'org-cvm', name: 'Birla Vishwakarma Mahavidyalaya (BVM)', code: 'BVM', is_active: true },
  { id: 'inst-3', org_id: 'org-cvm', name: 'B.J. Vanijya Mahavidyalaya (Commerce College)', code: 'BJVM', is_active: true },
  { id: 'inst-4', org_id: 'org-cvm', name: 'Nalini-Arvind and T.V. Patel Arts College', code: 'NATV_ARTS', is_active: true },
  { id: 'inst-5', org_id: 'org-cvm', name: 'H.M.Patel Institute of English Training and Research', code: 'HMPIETR', is_active: true },
  { id: 'inst-6', org_id: 'org-cvm', name: 'Rama Manubhai Desai College of Music and Dance', code: 'RMD_MUSIC', is_active: true },
  { id: 'inst-7', org_id: 'org-cvm', name: 'S.M. Patel College of Home Science', code: 'SMP_HOMESC', is_active: true },
  { id: 'inst-8', org_id: 'org-cvm', name: 'A.R. College of Pharmacy and G.H. Patel Institute of Pharmacy', code: 'AR_PHARMACY', is_active: true },
  { id: 'inst-9', org_id: 'org-cvm', name: 'B. and B. Institute of Technology', code: 'BBIT', is_active: true },
  { id: 'inst-10', org_id: 'org-cvm', name: 'Ipcowala – Santram College of Fine Arts', code: 'ISC_FINEARTS', is_active: true },
  { id: 'inst-11', org_id: 'org-cvm', name: 'Sophisticated Instrumentation Centre for Applied Research and Testing (SICART)', code: 'SICART', is_active: true },
  { id: 'inst-12', org_id: 'org-cvm', name: 'C.V.M. Higher Secondary Complex - Science Stream (RPTP)', code: 'CVM_HSC_SCI', is_active: true },
  { id: 'inst-13', org_id: 'org-cvm', name: 'C.V.M. Higher Secondary Complex - General Stream (TVPATEL)', code: 'CVM_HSC_GEN', is_active: true },
  { id: 'inst-14', org_id: 'org-cvm', name: 'C.V.M. Higher Secondary Complex -Vocational Stream (HOME SCIENCE)', code: 'CVM_HSC_VOC', is_active: true },
  { id: 'inst-15', org_id: 'org-cvm', name: 'G.J.Sharda Mandir(Primary)', code: 'GJ_SHARDA_PRI', is_active: true },
  { id: 'inst-16', org_id: 'org-cvm', name: 'G.J.Sharda Mandir(Secondary)', code: 'GJ_SHARDA_SEC', is_active: true },
  { id: 'inst-17', org_id: 'org-cvm', name: 'M.U.Patel Technical High School', code: 'MU_PATEL_TECH', is_active: true },
  { id: 'inst-18', org_id: 'org-cvm', name: 'S.D.Desai High School', code: 'SD_DESAI_HS', is_active: true },
  { id: 'inst-19', org_id: 'org-cvm', name: 'I. B. Patel English School (GIA)', code: 'IB_PATEL_GIA', is_active: true },
  { id: 'inst-20', org_id: 'org-cvm', name: 'I.B.Patel English School (SFI)', code: 'IB_PATEL_SFI', is_active: true },
  { id: 'inst-21', org_id: 'org-cvm', name: 'M. S. Mistry Bilingual School', code: 'MS_MISTRY', is_active: true },
  { id: 'inst-22', org_id: 'org-cvm', name: 'Vasantiben and Chandubhai Patel English School (CBSE)', code: 'VC_PATEL_CBSE', is_active: true },
  { id: 'inst-23', org_id: 'org-cvm', name: 'Chimanbhai M.U. Patel Industrial Training Centre', code: 'CMUP_ITC', is_active: true },
  { id: 'inst-24', org_id: 'org-cvm', name: 'Shardaben C.L.Patel ITI for Women (CVM Private ITI for Women)', code: 'SCLP_ITI_WOMEN', is_active: true },
  { id: 'inst-25', org_id: 'org-cvm', name: 'Kanubhai M. Patel ITI for Engineering Trades', code: 'KMP_ITI_ENG', is_active: true },
  { id: 'inst-26', org_id: 'org-cvm', name: 'Vallabh Vidyanagar Technical Institute', code: 'VVN_TECH_INST', is_active: true },
  { id: 'inst-27', org_id: 'org-cvm', name: 'CVM Health Centre', code: 'CVM_HEALTH', is_active: true },

  // CVMU Institutes (21)
  { id: 'inst-28', org_id: 'org-cvmu', name: 'N. V. Patel College of Pure and Applied Sciences (NVPAS)', code: 'NVPAS', is_active: true },
  { id: 'inst-29', org_id: 'org-cvmu', name: 'G.H. Patel College of Engineering and Technology (GCET)', code: 'GCET', is_active: true },
  { id: 'inst-30', org_id: 'org-cvmu', name: 'S.G.M.E. College of Commerce and Management (SEMCOM)', code: 'SEMCOM', is_active: true },
  { id: 'inst-31', org_id: 'org-cvmu', name: 'Institute of Science and Technology for Advanced Studies and Research (ISTAR)', code: 'ISTAR', is_active: true },
  { id: 'inst-32', org_id: 'org-cvmu', name: 'A.D. Patel Institute of Technology (ADIT)', code: 'ADIT', is_active: true },
  { id: 'inst-33', org_id: 'org-cvmu', name: 'S.S. Patel College of Physical Education', code: 'SSP_PHYSED', is_active: true },
  { id: 'inst-34', org_id: 'org-cvmu', name: 'C.Z. Patel College of Business And Management', code: 'CZP_MGMT', is_active: true },
  { id: 'inst-35', org_id: 'org-cvmu', name: 'Indukaka Ipcowala College of Pharmacy (IICP)', code: 'IICP', is_active: true },
  { id: 'inst-36', org_id: 'org-cvmu', name: 'Ashok and Rita Patel Institute of Integrated Study and Research in Biotechnology and Allied Sciences (ARIBAS)', code: 'ARIBAS', is_active: true },
  { id: 'inst-37', org_id: 'org-cvmu', name: 'Govindbhai Jorabhai Patel Institute of Ayurvedic Studies and Research', code: 'GJP_AYURVEDA', is_active: true },
  { id: 'inst-38', org_id: 'org-cvmu', name: 'Surajben Govindbhai Patel Ayurveda Hospital and Maternity Home', code: 'SGPA_HOSPITAL', is_active: true },
  { id: 'inst-39', org_id: 'org-cvmu', name: 'Waymade College of Education (English Medium)', code: 'WAYMADE_EDU', is_active: true },
  { id: 'inst-40', org_id: 'org-cvmu', name: 'Centre for Studies and Research on Life and Works of Sardar Vallabhbhai Patel (CERLIP)', code: 'CERLIP', is_active: true },
  { id: 'inst-41', org_id: 'org-cvmu', name: 'Institute of Language Studies and Applied Social Sciences (ILSASS)', code: 'ILSASS', is_active: true },
  { id: 'inst-42', org_id: 'org-cvmu', name: 'Madhuben and Bhanubhai Patel Institute of Technology (MBIT)', code: 'MBIT', is_active: true },
  { id: 'inst-43', org_id: 'org-cvmu', name: 'Shantaben Manubhai Patel School of Studies and Research in Architecture and Interior Design (SMAID)', code: 'SMAID', is_active: true },
  { id: 'inst-44', org_id: 'org-cvmu', name: 'R N Patel Ipcowala School of Law and Justice', code: 'RNPISLJ', is_active: true },
  { id: 'inst-45', org_id: 'org-cvmu', name: 'CVM College of Fine Arts', code: 'CVM_FINEARTS', is_active: true },
  { id: 'inst-46', org_id: 'org-cvmu', name: 'C L Patel Institute of Studies And Research In Renewable Energy (ISRRE)', code: 'ISRRE', is_active: true },
  { id: 'inst-47', org_id: 'org-cvmu', name: 'H. M. Patel English Studies Centre', code: 'HMP_ENG_STUDIES', is_active: true },
  { id: 'inst-48', org_id: 'org-cvmu', name: 'H.M. Patel Career Development Centre (CDC)', code: 'HMP_CDC', is_active: true }
];

export const INITIAL_AGENCIES = [
  { id: 'agency-1', name: 'Bansal Audio', contact_person: 'Deepak Bansal', phone: '9898012345', email: 'info@bansalaudio.com', address: 'Anand, Gujarat', gstin: '24AAACB1234F1Z1', is_active: true },
  { id: 'agency-2', name: 'EITL', contact_person: 'Nilesh Shah', phone: '9825023456', email: 'contact@eitl.co.in', address: 'Vallabh Vidyanagar, Gujarat', gstin: '24AAACE5678G1Z2', is_active: true },
  { id: 'agency-3', name: 'Elecon', contact_person: 'Suresh Patel', phone: '9879034567', email: 'procurement@elecon.com', address: 'Anand, Gujarat', gstin: '24AAACE9012H1Z3', is_active: true },
  { id: 'agency-4', name: 'Kevini Solutions', contact_person: 'Kevin Parikh', phone: '9426045678', email: 'sales@kevinisolutions.com', address: 'Vadodara, Gujarat', gstin: '24AAACK3456J1Z4', is_active: true },
  { id: 'agency-5', name: 'R-Tech Computers', contact_person: 'Rajesh Joshi', phone: '9898056789', email: 'rtech.computers@gmail.com', address: 'Anand, Gujarat', gstin: '24AAACR7890K1Z5', is_active: true },
  { id: 'agency-6', name: 'Rayansh Securities', contact_person: 'Amit Rana', phone: '9824067890', email: 'security@rayansh.in', address: 'Ahmedabad, Gujarat', gstin: '24AAACR1234L1Z6', is_active: true },
  { id: 'agency-7', name: 'Rise Techno Solutions', contact_person: 'Hardik Trivedi', phone: '9909078901', email: 'info@risetechno.in', address: 'Vallabh Vidyanagar, Gujarat', gstin: '24AAACR5678M1Z7', is_active: true },
  { id: 'agency-8', name: 'Yash Computers', contact_person: 'Yashwant Shah', phone: '9825189012', email: 'yashcomputers@gmail.com', address: 'Station Road, Anand, Gujarat', gstin: '24AAACY9012N1Z8', is_active: true },
  { id: 'agency-9', name: 'Bharat', contact_person: 'Bharatbhai Patel', phone: '9879290123', email: 'bharat.supplies@gmail.com', address: 'Anand, Gujarat', gstin: '24AAACB3456P1Z9', is_active: true }
];

export const INITIAL_AUTHORITIES = [
  // CVM Authorities
  { id: 'auth-1', org_id: 'org-cvm', title: 'Chairman', officer_name: 'Shri Prayasvin Patel', sort_order: 1, is_active: true },
  { id: 'auth-2', org_id: 'org-cvm', title: 'Hon. Joint Secretary', officer_name: 'Shri Mehul Patel', sort_order: 2, is_active: true },

  // CVMU Authorities
  { id: 'auth-3', org_id: 'org-cvmu', title: 'President', officer_name: 'Er. Bhikhubhai Patel', sort_order: 1, is_active: true },
  { id: 'auth-4', org_id: 'org-cvmu', title: 'Provost', officer_name: 'Dr. S. G. Patel', sort_order: 2, is_active: true },
  { id: 'auth-5', org_id: 'org-cvmu', title: 'Registrar', officer_name: 'Dr. J. D. Patel', sort_order: 3, is_active: true },
  { id: 'auth-6', org_id: 'org-cvmu', title: 'Deputy Registrar', officer_name: 'Shri B. M. Shah', sort_order: 4, is_active: true },
  { id: 'auth-7', org_id: 'org-cvmu', title: 'Registrar I/C', officer_name: 'Dr. H. N. Kapse', sort_order: 5, is_active: true }
];

export const INITIAL_STOCK_NOTES = [
  { id: 'stk-1', college_code: 'ADIT', college_name: 'A.D. Patel Institute of Technology (ADIT)', stock_count: 148, note_details: 'Historical reference distribution count' },
  { id: 'stk-2', college_code: 'GCET', college_name: 'G.H. Patel College of Engineering and Technology (GCET)', stock_count: 270, note_details: 'Historical reference distribution count' },
  { id: 'stk-3', college_code: 'NVPAS', college_name: 'N. V. Patel College of Pure and Applied Sciences (NVPAS)', stock_count: 39, note_details: 'Historical reference distribution count' },
  { id: 'stk-4', college_code: 'SEMCOM', college_name: 'S.G.M.E. College of Commerce and Management (SEMCOM)', stock_count: 29, note_details: 'Historical reference distribution count' },
  { id: 'stk-5', college_code: 'SMP_HOMESC', college_name: 'S.M. Patel College of Home Science', stock_count: 8, note_details: 'Historical reference distribution count' }
];

export const DEFAULT_USERS = [
  { id: 'usr-1', email: 'admin@cvm.gov.in', full_name: 'NOC Lead Administrator', role: 'administrator', is_active: true },
  { id: 'usr-2', email: 'staff@cvm.gov.in', full_name: 'NOC Executive Staff', role: 'noc_staff', is_active: true },
  { id: 'usr-3', email: 'approver@cvm.gov.in', full_name: 'Authority Approver (Chairman/Registrar)', role: 'approver', is_active: true },
  { id: 'usr-4', email: 'auditor@cvm.gov.in', full_name: 'Internal Auditor', role: 'auditor', is_active: true }
];

export const INITIAL_TEAM_MEMBERS = [
  // NOC Team Members (6)
  { id: 'team-1', full_name: 'Bharat Chauhan', team: 'NOC Team', role: 'NOC Team Member', email: null, phone: null, is_active: true, created_at: '2026-10-01T09:00:00Z' },
  { id: 'team-2', full_name: 'Shubhash Patel', team: 'NOC Team', role: 'NOC Team Member', email: null, phone: null, is_active: true, created_at: '2026-10-01T09:00:00Z' },
  { id: 'team-3', full_name: 'Gaurang Patel', team: 'NOC Team', role: 'NOC Team Member', email: null, phone: null, is_active: true, created_at: '2026-10-01T09:00:00Z' },
  { id: 'team-4', full_name: 'Harshdeep Patel', team: 'NOC Team', role: 'NOC Team Member', email: null, phone: null, is_active: true, created_at: '2026-10-01T09:00:00Z' },
  { id: 'team-5', full_name: 'Shyamal Solnaki', team: 'NOC Team', role: 'NOC Team Member', email: null, phone: null, is_active: true, created_at: '2026-10-01T09:00:00Z' },
  { id: 'team-6', full_name: 'Vaibhav Panchal', team: 'NOC Team', role: 'NOC Team Member', email: null, phone: null, is_active: true, created_at: '2026-10-01T09:00:00Z' },

  // Elecon Engineers (2)
  { id: 'team-7', full_name: 'Ajit Patel', team: 'Elecon Engineers', role: 'Elecon Engineer', email: null, phone: null, is_active: true, created_at: '2026-10-01T09:00:00Z' },
  { id: 'team-8', full_name: 'Mansur Pathan', team: 'Elecon Engineers', role: 'Elecon Engineer', email: null, phone: null, is_active: true, created_at: '2026-10-01T09:00:00Z' }
];

// Realistic Sample Records from Section 8 of Prompt
export const INITIAL_SAMPLE_REQUESTS = [
  {
    id: 'req-hist-a',
    request_no: 'NOC-2023-0089',
    org_id: 'org-cvm',
    institute_id: 'inst-8', // A.R. College of Pharmacy
    request_date: '2023-11-01',
    clg_out_no: 'ARCP/NOC/2023/114',
    clg_in_no: 'NOC/IN/2023/889',
    request_type: 'New Purchase',
    title: '02 New Projector Purchase For Class',
    description: '02 New Projector Purchase For Classrooms under Pharmacy Department with high lumen specifications.',
    estimated_budget: 110000.00,
    current_stage: 'completed',
    overall_status: 'Work Completed',
    internal_notes: 'Demo Historical Example A from specifications.',
    is_historical: true,
    historical_notes: 'Example A: A R Pharmacy College, Requirement: 01-11-2023, Approved: 29-12-2023, Amount: 1,04,960, Agency: Yash Computers, Status: Done',
    created_by: 'usr-2',
    created_at: '2023-11-01T10:30:00Z',
    items: [
      { id: 'item-a1', item_name: 'Classroom Multimedia Projector (4000 Lumens)', category: 'Audio-Visual', quantity: 2, unit: 'Nos', specifications: 'Full HD 1080p, HDMI/VGA, Ceiling mount kit included', estimated_unit_price: 52480.00 }
    ],
    quotations: [
      {
        id: 'quot-a1',
        agency_id: 'agency-8', // Yash Computers
        quotation_no: 'YC/2023/NOV/441',
        quotation_date: '2023-11-15',
        subtotal_amount: 88949.15,
        tax_percent: 18.00,
        tax_amount: 16010.85,
        other_charges: 0.00,
        total_amount: 104960.00,
        delivery_timeline: '7 Days',
        is_selected: true,
        selection_rationale: 'Lowest quotation meeting all high-lumens projector specifications.'
      },
      {
        id: 'quot-a2',
        agency_id: 'agency-5', // R-Tech Computers
        quotation_no: 'RTC/QTN/992',
        quotation_date: '2023-11-18',
        subtotal_amount: 95000.00,
        tax_percent: 18.00,
        tax_amount: 17100.00,
        other_charges: 0.00,
        total_amount: 112100.00,
        delivery_timeline: '10 Days',
        is_selected: false,
        selection_rationale: 'Higher cost than Yash Computers.'
      }
    ],
    approvals: [
      {
        id: 'appr-a1',
        authority_id: 'auth-1', // Chairman
        selected_agency_id: 'agency-8',
        submission_date: '2023-12-20',
        proposed_amount: 104960.00,
        decision: 'Approved',
        decision_date: '2023-12-29',
        approved_amount: 104960.00,
        decision_remarks: 'Sanctioned under annual class infrastructure allocation.',
        is_recorded_external: true
      }
    ],
    approval_letter: {
      id: 'let-a1',
      letter_no: 'CVM/NOC/APPR/2023/12-089',
      letter_date: '2023-12-30',
      signatory_title: 'Chairman',
      signatory_name: 'Shri Prayasvin Patel',
      subject: 'Sanction order for Purchase of 02 Projectors for A.R. College of Pharmacy',
      status: 'Dispatched',
      dispatch_date: '2024-01-02',
      dispatch_mode: 'Internal Dispatch'
    },
    work_record: {
      id: 'wrk-a1',
      agency_id: 'agency-8',
      status: 'Completed',
      start_date: '2024-01-05',
      completion_date: '2024-01-12',
      engineer_name: 'Nitin Solanki',
      remarks: 'Both projectors installed and tested in Room 102 and Room 204.'
    },
    bills: [
      {
        id: 'bill-a1',
        agency_id: 'agency-8',
        bill_no: 'YC-INV-2024-042',
        bill_date: '2024-01-15',
        submitted_amount: 104960.00,
        bill_approval_date: '2024-01-22',
        approved_amount: 104960.00,
        bill_status: 'Approved',
        payment_ref: 'RTGS-CVM-2024-99881',
        remarks: 'Full payment verified against delivery and inspection.'
      }
    ]
  },
  {
    id: 'req-hist-b',
    request_no: 'NOC-2023-0104',
    org_id: 'org-cvmu',
    institute_id: 'inst-29', // GCET
    request_date: '2023-11-20',
    clg_out_no: 'GCET/MECH/2023/45',
    clg_in_no: 'NOC/IN/2023/940',
    request_type: 'Repair',
    title: 'Epson Projector Lamp Change & Services',
    description: 'Epson Projector Lamp Change & Services for Mechanical Department Seminar Hall.',
    estimated_budget: 9000.00,
    current_stage: 'completed',
    overall_status: 'Work Completed',
    internal_notes: 'Demo Historical Example B from specifications.',
    is_historical: true,
    historical_notes: 'Example B: GCET College, Description: Epson Projector Lamp Change & Services, Agency: Yash Computers, Amount: 8,083, Work status: Done',
    created_by: 'usr-2',
    created_at: '2023-11-20T11:00:00Z',
    items: [
      { id: 'item-b1', item_name: 'Epson OEM Projector Lamp Replacement & Servicing', category: 'Projector Maintenance', quantity: 1, unit: 'Nos', specifications: 'Genuine Epson ELPLP lamp unit with optical cleaning', estimated_unit_price: 8083.00 }
    ],
    quotations: [
      {
        id: 'quot-b1',
        agency_id: 'agency-8', // Yash Computers
        quotation_no: 'YC/REP/2023/118',
        quotation_date: '2023-11-25',
        subtotal_amount: 6850.00,
        tax_percent: 18.00,
        tax_amount: 1233.00,
        other_charges: 0.00,
        total_amount: 8083.00,
        delivery_timeline: '3 Days',
        is_selected: true,
        selection_rationale: 'Official authorized service vendor for Epson in Anand region.'
      }
    ],
    approvals: [
      {
        id: 'appr-b1',
        authority_id: 'auth-5', // Registrar
        selected_agency_id: 'agency-8',
        submission_date: '2023-12-01',
        proposed_amount: 8083.00,
        decision: 'Approved',
        decision_date: '2023-12-05',
        approved_amount: 8083.00,
        decision_remarks: 'Approved under routine lab maintenance.',
        is_recorded_external: false
      }
    ],
    work_record: {
      id: 'wrk-b1',
      agency_id: 'agency-8',
      status: 'Completed',
      start_date: '2023-12-08',
      completion_date: '2023-12-10',
      engineer_name: 'Pravin Vaghela',
      remarks: 'Lamp replaced and calibrated.'
    },
    bills: [
      {
        id: 'bill-b1',
        agency_id: 'agency-8',
        bill_no: 'YC-SRV-8821',
        bill_date: '2023-12-12',
        submitted_amount: 8083.00,
        bill_approval_date: '2023-12-18',
        approved_amount: 8083.00,
        bill_status: 'Approved',
        payment_ref: 'CHQ-CVMU-44102',
        remarks: 'Verified'
      }
    ]
  },
  {
    id: 'req-hist-c',
    request_no: 'NOC-2024-0012',
    org_id: 'org-cvm',
    institute_id: 'inst-11', // SICART
    request_date: '2024-01-04',
    clg_out_no: 'SICART/LAB/2024/09',
    clg_in_no: 'NOC/IN/2024/018',
    request_type: 'Replacement',
    title: '04 CPU SET (i-7, 128GB SSD, 4 GB RAM)',
    description: '04 CPU SET (i-7, 128GB SSD, 4 GB RAM) for spectrometry computing workstations.',
    estimated_budget: null, // As specified in Example C, preserve missing/shifted historical values cleanly
    current_stage: 'approved',
    overall_status: 'Approved',
    internal_notes: 'Demo Historical Example C. Historical note: "Given By NOC (ADIT STOCK)". Agency/reference: Bharat.',
    is_historical: true,
    historical_notes: 'Example C: SICART College, Requirement date: 04-01-2024, Description: 04 CPU SET (i-7, 128GB SSD, 4 GB RAM), Historical note: Given By NOC (ADIT STOCK), Agency/reference: Bharat, Approval date: 19-02-2024',
    created_by: 'usr-2',
    created_at: '2024-01-04T09:15:00Z',
    items: [
      { id: 'item-c1', item_name: 'Desktop CPU Unit Core i7 (ADIT Stock Transfer)', category: 'Computer Equipment', quantity: 4, unit: 'Sets', specifications: 'Intel Core i7, 128GB SSD, 4GB RAM, Internal Transfer from ADIT Surplus', estimated_unit_price: null }
    ],
    quotations: [
      {
        id: 'quot-c1',
        agency_id: 'agency-9', // Bharat
        quotation_no: 'BH/2024/011',
        quotation_date: '2024-01-20',
        subtotal_amount: 0.00,
        tax_percent: 0.00,
        tax_amount: 0.00,
        other_charges: 0.00,
        total_amount: 0.00,
        delivery_timeline: 'Stock Transfer',
        is_selected: true,
        selection_rationale: 'Internal NOC stock distribution handled by Bharat reference.'
      }
    ],
    approvals: [
      {
        id: 'appr-c1',
        authority_id: 'auth-1', // Chairman
        selected_agency_id: 'agency-9',
        submission_date: '2024-02-05',
        proposed_amount: 0.00,
        decision: 'Approved',
        decision_date: '2024-02-19',
        approved_amount: 0.00,
        decision_remarks: 'Approved for transfer from ADIT surplus stock to SICART.',
        is_recorded_external: true
      }
    ],
    work_record: {
      id: 'wrk-c1',
      agency_id: 'agency-9',
      status: 'In Progress',
      start_date: '2024-02-22',
      completion_date: null,
      engineer_name: 'Dhaval Patel',
      remarks: 'Units picked up and under configuration.'
    },
    bills: []
  },
  {
    id: 'req-live-1',
    request_no: 'NOC-2026-0001',
    org_id: 'org-cvmu',
    institute_id: 'inst-32', // ADIT
    request_date: '2026-09-18',
    clg_out_no: 'ADIT/IT/2026/301',
    clg_in_no: 'NOC/IN/2026/102',
    request_type: 'New Purchase',
    title: 'Procurement of 50 High-Performance Computing Workstations for AI/ML Lab',
    description: 'Procurement of 50 desktop computers (Intel i7 14th Gen, 32GB DDR5 RAM, 1TB NVMe SSD, RTX 4060 GPU) with 24-inch IPS monitors for newly established AI/ML department lab.',
    estimated_budget: 4500000.00,
    current_stage: 'quotations',
    overall_status: 'Pending Quotations',
    internal_notes: 'Urgent requirement before semester commencement. 3 vendor quotations solicited.',
    is_historical: false,
    created_by: 'usr-1',
    created_at: '2026-09-18T14:20:00Z',
    items: [
      { id: 'item-l1', item_name: 'AI/ML Workstation Desktop PC (Core i7 14th Gen, 32GB RAM, RTX 4060)', category: 'IT Hardware', quantity: 50, unit: 'Nos', specifications: 'Intel i7-14700, 32GB DDR5, 1TB NVMe Gen4 SSD, NVIDIA RTX 4060 8GB, 650W Bronze PSU, Keyboard & Mouse', estimated_unit_price: 78000.00 },
      { id: 'item-l2', item_name: '24-inch FHD IPS 100Hz Professional Display Monitor', category: 'IT Hardware', quantity: 50, unit: 'Nos', specifications: '1920x1080, IPS Panel, 99% sRGB, Height Adjustable Stand, HDMI/DisplayPort', estimated_unit_price: 12000.00 }
    ],
    quotations: [
      {
        id: 'quot-l1',
        agency_id: 'agency-7', // Rise Techno Solutions
        quotation_no: 'RTS/2026/QT/089',
        quotation_date: '2026-09-22',
        subtotal_amount: 3800000.00,
        tax_percent: 18.00,
        tax_amount: 684000.00,
        other_charges: 0.00,
        total_amount: 4484000.00,
        validity_date: '2026-10-31',
        delivery_timeline: '14 Days',
        is_selected: true,
        selection_rationale: 'Lowest rate with 3-year on-site OEM warranty included.',
        quotation_items: [
          { id: 'qi-1', item_name: 'AI/ML Workstation Desktop PC', quantity: 50, unit_price: 66000.00, tax_percent: 18.00, total_price: 3894000.00 },
          { id: 'qi-2', item_name: '24-inch FHD IPS 100Hz Monitor', quantity: 50, unit_price: 10000.00, tax_percent: 18.00, total_price: 590000.00 }
        ]
      },
      {
        id: 'quot-l2',
        agency_id: 'agency-5', // R-Tech Computers
        quotation_no: 'RTC/2026/CVMU/412',
        quotation_date: '2026-09-24',
        subtotal_amount: 3950000.00,
        tax_percent: 18.00,
        tax_amount: 711000.00,
        other_charges: 0.00,
        total_amount: 4661000.00,
        validity_date: '2026-10-25',
        delivery_timeline: '21 Days',
        is_selected: false,
        selection_rationale: 'Quoted amount ₹1,77,000 higher than Rise Techno Solutions.'
      },
      {
        id: 'quot-l3',
        agency_id: 'agency-4', // Kevini Solutions
        quotation_no: 'KS/QTN/9021',
        quotation_date: '2026-09-25',
        subtotal_amount: 4100000.00,
        tax_percent: 18.00,
        tax_amount: 738000.00,
        other_charges: 15000.00,
        total_amount: 4853000.00,
        validity_date: '2026-11-05',
        delivery_timeline: '15 Days',
        is_selected: false,
        selection_rationale: 'Quoted highest rate among three agencies.'
      }
    ],
    approvals: [],
    bills: []
  }
];
