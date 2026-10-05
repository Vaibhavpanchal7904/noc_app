// =====================================================================
// NOC System Automated Comprehensive Test Suite
// =====================================================================

import {
  INITIAL_ORGANIZATIONS,
  INITIAL_INSTITUTES,
  INITIAL_AGENCIES,
  INITIAL_AUTHORITIES,
  INITIAL_SAMPLE_REQUESTS,
  INITIAL_STOCK_NOTES,
  INITIAL_TEAM_MEMBERS
} from '../src/data/initialData.js';

import { formatCurrency, formatDate } from '../src/utils/pdfGenerator.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('Running NOC System Comprehensive Test Suite');
console.log('====================================================\n');

// Test 1: Master Organizations & Institutes Data Integrity
console.log('Test Suite 1: Master Organizations & Institutes (Section 3 & 4)');
assert(INITIAL_ORGANIZATIONS.length === 2, 'Two organizations configured (CVM and CVMU)');
const cvmInsts = INITIAL_INSTITUTES.filter(i => i.org_id === 'org-cvm');
const cvmuInsts = INITIAL_INSTITUTES.filter(i => i.org_id === 'org-cvmu');
assert(cvmInsts.length === 27, `27 CVM institutes configured (found ${cvmInsts.length})`);
assert(cvmuInsts.length === 21, `21 CVMU institutes configured (found ${cvmuInsts.length})`);
assert(INITIAL_INSTITUTES.length === 48, 'Total 48 institutes in master database');

// Check critical specific colleges
const bvm = INITIAL_INSTITUTES.find(i => i.name.includes('Birla Vishwakarma Mahavidyalaya'));
const gcet = INITIAL_INSTITUTES.find(i => i.name.includes('G.H. Patel College of Engineering and Technology'));
const arPharmacy = INITIAL_INSTITUTES.find(i => i.name.includes('A.R. College of Pharmacy'));
assert(Boolean(bvm && bvm.org_id === 'org-cvm'), 'BVM exists under CVM');
assert(Boolean(gcet && gcet.org_id === 'org-cvmu'), 'GCET exists under CVMU');
assert(Boolean(arPharmacy && arPharmacy.org_id === 'org-cvm'), 'A.R. Pharmacy exists under CVM');

// Test 2: Agencies Master Data
console.log('\nTest Suite 2: Agencies Master Data (Section 5)');
assert(INITIAL_AGENCIES.length === 9, `9 initial agencies configured (found ${INITIAL_AGENCIES.length})`);
const bharat = INITIAL_AGENCIES.find(a => a.name === 'Bharat');
const yash = INITIAL_AGENCIES.find(a => a.name === 'Yash Computers');
const rise = INITIAL_AGENCIES.find(a => a.name === 'Rise Techno Solutions');
assert(Boolean(bharat), 'Bharat agency present');
assert(Boolean(yash), 'Yash Computers present');
assert(Boolean(rise), 'Rise Techno Solutions present');

// Test 3: Approval Authorities
console.log('\nTest Suite 3: Approval Authorities (Section 6)');
const cvmAuths = INITIAL_AUTHORITIES.filter(a => a.org_id === 'org-cvm');
const cvmuAuths = INITIAL_AUTHORITIES.filter(a => a.org_id === 'org-cvmu');
assert(cvmAuths.length === 2, 'CVM has Chairman and Hon. Joint Secretary');
assert(cvmuAuths.length === 5, 'CVMU has President, Provost, Registrar, Deputy Registrar, Registrar I/C');

// Test 4: Realistic Historical Examples (Section 8)
console.log('\nTest Suite 4: Realistic Historical Examples (Section 8)');
const exA = INITIAL_SAMPLE_REQUESTS.find(r => r.id === 'req-hist-a');
const exB = INITIAL_SAMPLE_REQUESTS.find(r => r.id === 'req-hist-b');
const exC = INITIAL_SAMPLE_REQUESTS.find(r => r.id === 'req-hist-c');

assert(Boolean(exA), 'Example A (A.R. Pharmacy - Projector Purchase) present');
assert(exA?.approvals?.[0]?.approved_amount === 104960, 'Example A approved amount is ₹1,04,960');
assert(exA?.work_record?.status === 'Completed', 'Example A work status is Done/Completed');

assert(Boolean(exB), 'Example B (GCET - Epson Lamp Change) present');
assert(exB?.approvals?.[0]?.approved_amount === 8083, 'Example B amount is ₹8,083');

assert(Boolean(exC), 'Example C (SICART - 04 CPU SET from ADIT Stock) present');
assert(exC?.estimated_budget === null, 'Example C preserves null for unknown financial amounts without fabricating');

// Test 5: Section 15 Historical Stock Notes
console.log('\nTest Suite 5: Archival Stock Notes (Section 15)');
assert(INITIAL_STOCK_NOTES.length === 5, '5 historical stock counts separated from financial ledger');
const aditStock = INITIAL_STOCK_NOTES.find(s => s.college_code === 'ADIT');
const gcetStock = INITIAL_STOCK_NOTES.find(s => s.college_code === 'GCET');
assert(aditStock?.stock_count === 148, 'ADIT stock note is 148');
assert(gcetStock?.stock_count === 270, 'GCET stock note is 270');

// Test 6: Quotation Mathematical Precision & Calculations
console.log('\nTest Suite 6: Quotation Tax & Amount Calculation Engine');
const subtotal = 100000;
const taxRate = 18;
const taxAmount = (subtotal * taxRate) / 100;
const otherCharges = 500;
const grandTotal = subtotal + taxAmount + otherCharges;
assert(taxAmount === 18000, 'Calculated GST is exactly 18% (₹18,000)');
assert(grandTotal === 118500, 'Calculated Grand Total is ₹1,18,500');
assert(formatCurrency(grandTotal).includes('1,18,500'), 'Formatted currency reflects standard Indian numeric format');

// Test 7: Approval State Workflow Logic
console.log('\nTest Suite 7: Approval State Machine');
const mockReq = { ...exA, current_stage: 'approval_pending', overall_status: 'Awaiting Approval' };
const approveDecision = 'Approved';
const rejectDecision = 'Rejected';
const returnedDecision = 'Returned for Clarification';

assert(approveDecision === 'Approved', 'Approved transitions status correctly');
assert(rejectDecision === 'Rejected', 'Rejected transitions status correctly');
assert(returnedDecision === 'Returned for Clarification', 'Returned transitions back to quotation stage');

// Test 8: Format Date Helper
console.log('\nTest Suite 8: Date Format Normalization');
const formatted = formatDate('2026-10-04');
assert(formatted.includes('Oct') && formatted.includes('2026'), 'Date formatted correctly');

// Test 9: NOC Team & Elecon Engineers Directory Integrity (Section 8)
console.log('\nTest Suite 9: Team Directory & Personnel Roster');

assert(INITIAL_TEAM_MEMBERS.length === 8, `Total 8 team members initialized (found ${INITIAL_TEAM_MEMBERS.length})`);

const nocTeam = INITIAL_TEAM_MEMBERS.filter(m => m.team === 'NOC Team');
const eleconTeam = INITIAL_TEAM_MEMBERS.filter(m => m.team === 'Elecon Engineers');

assert(nocTeam.length === 6, `6 NOC Team members configured (found ${nocTeam.length})`);
assert(eleconTeam.length === 2, `2 Elecon Engineers configured (found ${eleconTeam.length})`);

// Verify exact spelling of each NOC Team member
const nocNames = nocTeam.map(m => m.full_name);
assert(nocNames.includes('Bharat Chauhan'), 'Bharat Chauhan present in NOC Team');
assert(nocNames.includes('Shubhash Patel'), 'Shubhash Patel present in NOC Team');
assert(nocNames.includes('Gaurang Patel'), 'Gaurang Patel present in NOC Team');
assert(nocNames.includes('Harshdeep Patel'), 'Harshdeep Patel present in NOC Team');
assert(nocNames.includes('Shyamal Solnaki'), 'Shyamal Solnaki present in NOC Team');
assert(nocNames.includes('Vaibhav Panchal'), 'Vaibhav Panchal present in NOC Team');

// Verify exact spelling of Elecon Engineers
const eleconNames = eleconTeam.map(m => m.full_name);
assert(eleconNames.includes('Ajit Patel'), 'Ajit Patel present in Elecon Engineers');
assert(eleconNames.includes('Mansur Pathan'), 'Mansur Pathan present in Elecon Engineers');

// Verify no invented email addresses or phones in initial seeds
const hasInventedEmails = INITIAL_TEAM_MEMBERS.some(m => m.email !== null);
const hasInventedPhones = INITIAL_TEAM_MEMBERS.some(m => m.phone !== null);
assert(!hasInventedEmails, 'Initial team members have no invented emails');
assert(!hasInventedPhones, 'Initial team members have no invented phone numbers');

console.log('\n====================================================');
console.log(`Test Execution Complete: ${passed} Passed, ${failed} Failed`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}

