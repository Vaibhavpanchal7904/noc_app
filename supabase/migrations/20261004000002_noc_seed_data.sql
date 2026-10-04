-- =====================================================================
-- NOC Approval & Quotation Management System
-- Migration 02: Initial Master Data & Historical Demo Records
-- =====================================================================

-- 1. Insert Organizations
INSERT INTO public.organizations (id, code, name, description) VALUES
('11111111-1111-1111-1111-111111111111', 'CVM', 'Charutar Vidya Mandal', 'CVM Managed Institutes & Colleges'),
('22222222-2222-2222-2222-222222222222', 'CVMU', 'Charutar Vidya Mandal University', 'CVMU Constituent Colleges & Departments')
ON CONFLICT (code) DO NOTHING;

-- 2. Insert CVM Institutes (27 institutes)
INSERT INTO public.institutes (org_id, name, code) VALUES
('11111111-1111-1111-1111-111111111111', 'V.P. and R.P.T.P. Science College', 'VP_RPTP'),
('11111111-1111-1111-1111-111111111111', 'Birla Vishwakarma Mahavidyalaya (BVM)', 'BVM'),
('11111111-1111-1111-1111-111111111111', 'B.J. Vanijya Mahavidyalaya (Commerce College)', 'BJVM'),
('11111111-1111-1111-1111-111111111111', 'Nalini-Arvind and T.V. Patel Arts College', 'NATV_ARTS'),
('11111111-1111-1111-1111-111111111111', 'H.M.Patel Institute of English Training and Research', 'HMPIETR'),
('11111111-1111-1111-1111-111111111111', 'Rama Manubhai Desai College of Music and Dance', 'RMD_MUSIC'),
('11111111-1111-1111-1111-111111111111', 'S.M. Patel College of Home Science', 'SMP_HOMESC'),
('11111111-1111-1111-1111-111111111111', 'A.R. College of Pharmacy and G.H. Patel Institute of Pharmacy', 'AR_PHARMACY'),
('11111111-1111-1111-1111-111111111111', 'B. and B. Institute of Technology', 'BBIT'),
('11111111-1111-1111-1111-111111111111', 'Ipcowala – Santram College of Fine Arts', 'ISC_FINEARTS'),
('11111111-1111-1111-1111-111111111111', 'Sophisticated Instrumentation Centre for Applied Research and Testing (SICART)', 'SICART'),
('11111111-1111-1111-1111-111111111111', 'C.V.M. Higher Secondary Complex - Science Stream (RPTP)', 'CVM_HSC_SCI'),
('11111111-1111-1111-1111-111111111111', 'C.V.M. Higher Secondary Complex - General Stream (TVPATEL)', 'CVM_HSC_GEN'),
('11111111-1111-1111-1111-111111111111', 'C.V.M. Higher Secondary Complex -Vocational Stream (HOME SCIENCE)', 'CVM_HSC_VOC'),
('11111111-1111-1111-1111-111111111111', 'G.J.Sharda Mandir(Primary)', 'GJ_SHARDA_PRI'),
('11111111-1111-1111-1111-111111111111', 'G.J.Sharda Mandir(Secondary)', 'GJ_SHARDA_SEC'),
('11111111-1111-1111-1111-111111111111', 'M.U.Patel Technical High School', 'MU_PATEL_TECH'),
('11111111-1111-1111-1111-111111111111', 'S.D.Desai High School', 'SD_DESAI_HS'),
('11111111-1111-1111-1111-111111111111', 'I. B. Patel English School (GIA)', 'IB_PATEL_GIA'),
('11111111-1111-1111-1111-111111111111', 'I.B.Patel English School (SFI)', 'IB_PATEL_SFI'),
('11111111-1111-1111-1111-111111111111', 'M. S. Mistry Bilingual School', 'MS_MISTRY'),
('11111111-1111-1111-1111-111111111111', 'Vasantiben and Chandubhai Patel English School (CBSE)', 'VC_PATEL_CBSE'),
('11111111-1111-1111-1111-111111111111', 'Chimanbhai M.U. Patel Industrial Training Centre', 'CMUP_ITC'),
('11111111-1111-1111-1111-111111111111', 'Shardaben C.L.Patel ITI for Women (CVM Private ITI for Women)', 'SCLP_ITI_WOMEN'),
('11111111-1111-1111-1111-111111111111', 'Kanubhai M. Patel ITI for Engineering Trades', 'KMP_ITI_ENG'),
('11111111-1111-1111-1111-111111111111', 'Vallabh Vidyanagar Technical Institute', 'VVN_TECH_INST'),
('11111111-1111-1111-1111-111111111111', 'CVM Health Centre', 'CVM_HEALTH');

-- 3. Insert CVMU Institutes (21 institutes)
INSERT INTO public.institutes (org_id, name, code) VALUES
('22222222-2222-2222-2222-222222222222', 'N. V. Patel College of Pure and Applied Sciences (NVPAS)', 'NVPAS'),
('22222222-2222-2222-2222-222222222222', 'G.H. Patel College of Engineering and Technology (GCET)', 'GCET'),
('22222222-2222-2222-2222-222222222222', 'S.G.M.E. College of Commerce and Management (SEMCOM)', 'SEMCOM'),
('22222222-2222-2222-2222-222222222222', 'Institute of Science and Technology for Advanced Studies and Research (ISTAR)', 'ISTAR'),
('22222222-2222-2222-2222-222222222222', 'A.D. Patel Institute of Technology (ADIT)', 'ADIT'),
('22222222-2222-2222-2222-222222222222', 'S.S. Patel College of Physical Education', 'SSP_PHYSED'),
('22222222-2222-2222-2222-222222222222', 'C.Z. Patel College of Business And Management', 'CZP_MGMT'),
('22222222-2222-2222-2222-222222222222', 'Indukaka Ipcowala College of Pharmacy (IICP)', 'IICP'),
('22222222-2222-2222-2222-222222222222', 'Ashok and Rita Patel Institute of Integrated Study and Research in Biotechnology and Allied Sciences (ARIBAS)', 'ARIBAS'),
('22222222-2222-2222-2222-222222222222', 'Govindbhai Jorabhai Patel Institute of Ayurvedic Studies and Research', 'GJP_AYURVEDA'),
('22222222-2222-2222-2222-222222222222', 'Surajben Govindbhai Patel Ayurveda Hospital and Maternity Home', 'SGPA_HOSPITAL'),
('22222222-2222-2222-2222-222222222222', 'Waymade College of Education (English Medium)', 'WAYMADE_EDU'),
('22222222-2222-2222-2222-222222222222', 'Centre for Studies and Research on Life and Works of Sardar Vallabhbhai Patel (CERLIP)', 'CERLIP'),
('22222222-2222-2222-2222-222222222222', 'Institute of Language Studies and Applied Social Sciences (ILSASS)', 'ILSASS'),
('22222222-2222-2222-2222-222222222222', 'Madhuben and Bhanubhai Patel Institute of Technology (MBIT)', 'MBIT'),
('22222222-2222-2222-2222-222222222222', 'Shantaben Manubhai Patel School of Studies and Research in Architecture and Interior Design (SMAID)', 'SMAID'),
('22222222-2222-2222-2222-222222222222', 'R N Patel Ipcowala School of Law and Justice', 'RNPISLJ'),
('22222222-2222-2222-2222-222222222222', 'CVM College of Fine Arts', 'CVM_FINEARTS'),
('22222222-2222-2222-2222-222222222222', 'C L Patel Institute of Studies And Research In Renewable Energy (ISRRE)', 'ISRRE'),
('22222222-2222-2222-2222-222222222222', 'H. M. Patel English Studies Centre', 'HMP_ENG_STUDIES'),
('22222222-2222-2222-2222-222222222222', 'H.M. Patel Career Development Centre (CDC)', 'HMP_CDC');

-- 4. Insert Initial Agencies (9 vendors)
INSERT INTO public.agencies (name, contact_person, phone, email, address) VALUES
('Bansal Audio', 'Deepak Bansal', '9898012345', 'info@bansalaudio.com', 'Anand, Gujarat'),
('EITL', 'Nilesh Shah', '9825023456', 'contact@eitl.co.in', 'Vallabh Vidyanagar, Gujarat'),
('Elecon', 'Suresh Patel', '9879034567', 'procurement@elecon.com', 'Anand, Gujarat'),
('Kevini Solutions', 'Kevin Parikh', '9426045678', 'sales@kevinisolutions.com', 'Vadodara, Gujarat'),
('R-Tech Computers', 'Rajesh Joshi', '9898056789', 'rtech.computers@gmail.com', 'Anand, Gujarat'),
('Rayansh Securities', 'Amit Rana', '9824067890', 'security@rayansh.in', 'Ahmedabad, Gujarat'),
('Rise Techno Solutions', 'Hardik Trivedi', '9909078901', 'info@risetechno.in', 'Vallabh Vidyanagar, Gujarat'),
('Yash Computers', 'Yashwant Shah', '9825189012', 'yashcomputers@gmail.com', 'Station Road, Anand, Gujarat'),
('Bharat', 'Bharatbhai Patel', '9879290123', 'bharat.supplies@gmail.com', 'Anand, Gujarat');

-- 5. Insert Approval Authorities
-- CVM Authorities
INSERT INTO public.approval_authorities (org_id, title, sort_order) VALUES
('11111111-1111-1111-1111-111111111111', 'Chairman', 1),
('11111111-1111-1111-1111-111111111111', 'Hon. Joint Secretary', 2);

-- CVMU Authorities
INSERT INTO public.approval_authorities (org_id, title, sort_order) VALUES
('22222222-2222-2222-2222-222222222222', 'President', 1),
('22222222-2222-2222-2222-222222222222', 'Provost', 2),
('22222222-2222-2222-2222-222222222222', 'Registrar', 3),
('22222222-2222-2222-2222-222222222222', 'Deputy Registrar', 4),
('22222222-2222-2222-2222-222222222222', 'Registrar I/C', 5);

-- 6. Insert Historical Stock Reference Notes
INSERT INTO public.historical_stock_notes (college_code, college_name, stock_count, note_details) VALUES
('ADIT', 'A.D. Patel Institute of Technology (ADIT)', 148, 'Historical reference distribution count'),
('GCET', 'G.H. Patel College of Engineering and Technology (GCET)', 270, 'Historical reference distribution count'),
('NVPAS', 'N. V. Patel College of Pure and Applied Sciences (NVPAS)', 39, 'Historical reference distribution count'),
('SEMCOM', 'S.G.M.E. College of Commerce and Management (SEMCOM)', 29, 'Historical reference distribution count'),
('SMP_HOMESC', 'S.M. Patel College of Home Science', 8, 'Historical reference distribution count');
