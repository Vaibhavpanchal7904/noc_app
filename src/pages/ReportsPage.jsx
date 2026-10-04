import React, { useState, useMemo } from 'react';
import { BarChart3, Download, Building2, Users, Calendar, TrendingUp, Filter } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatCurrency, formatDate } from '../utils/pdfGenerator';
import Papa from 'papaparse';

export const ReportsPage = () => {
  const { requests, institutes, agencies, organizations } = useData();
  const [reportType, setReportType] = useState('college_wise'); // 'college_wise', 'agency_wise', 'monthly_approvals', 'pending_status'

  // 1. College-wise breakdown
  const collegeReportData = useMemo(() => {
    return institutes.map(inst => {
      const org = organizations.find(o => o.id === inst.org_id);
      const collegeReqs = requests.filter(r => r.institute_id === inst.id);
      const approvedAmt = collegeReqs.reduce((sum, r) => {
        const a = r.approvals?.find(appr => appr.decision === 'Approved');
        return sum + (a?.approved_amount || 0);
      }, 0);

      return {
        id: inst.id,
        name: inst.name,
        org: org?.code || 'CVM',
        total_requests: collegeReqs.length,
        approved_count: collegeReqs.filter(r => r.approvals?.some(a => a.decision === 'Approved')).length,
        pending_count: collegeReqs.filter(r => r.overall_status === 'Awaiting Approval' || r.overall_status === 'Pending Quotations').length,
        total_sanctioned: approvedAmt
      };
    }).filter(c => c.total_requests > 0 || c.total_sanctioned > 0);
  }, [institutes, requests, organizations]);

  // 2. Agency-wise breakdown
  const agencyReportData = useMemo(() => {
    return agencies.map(ag => {
      const agencyReqs = requests.filter(r => {
        const approvedVendor = r.approvals?.find(a => a.decision === 'Approved')?.selected_agency_id;
        const selectedQuot = r.quotations?.find(q => q.is_selected)?.agency_id;
        return approvedVendor === ag.id || selectedQuot === ag.id;
      });

      const totalBusiness = requests.reduce((sum, r) => {
        const a = r.approvals?.find(appr => appr.decision === 'Approved' && appr.selected_agency_id === ag.id);
        return sum + (a?.approved_amount || 0);
      }, 0);

      const totalBilled = requests.reduce((sum, r) => {
        const bills = r.bills?.filter(b => b.agency_id === ag.id && b.bill_status === 'Approved') || [];
        return sum + bills.reduce((bSum, b) => bSum + (b.approved_amount || b.submitted_amount || 0), 0);
      }, 0);

      return {
        id: ag.id,
        name: ag.name,
        contact: ag.contact_person,
        total_awarded_cases: agencyReqs.length,
        sanctioned_amount: totalBusiness,
        cleared_bill_amount: totalBilled
      };
    }).filter(a => a.total_awarded_cases > 0 || a.sanctioned_amount > 0);
  }, [agencies, requests]);

  // 3. Month-wise Sanctions
  const monthlyData = useMemo(() => {
    const map = {};
    requests.forEach(r => {
      const appr = r.approvals?.find(a => a.decision === 'Approved');
      if (appr && appr.decision_date) {
        const monthKey = appr.decision_date.substring(0, 7); // YYYY-MM
        if (!map[monthKey]) {
          map[monthKey] = { month: monthKey, count: 0, total_amount: 0 };
        }
        map[monthKey].count += 1;
        map[monthKey].total_amount += (appr.approved_amount || 0);
      }
    });
    return Object.values(map).sort((a, b) => b.month.localeCompare(a.month));
  }, [requests]);

  const handleExportCsv = () => {
    let exportRows = [];
    let fileName = `NOC_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;

    if (reportType === 'college_wise') {
      exportRows = collegeReportData.map(c => ({
        'College / Institute': c.name,
        'Organization': c.org,
        'Total Requests': c.total_requests,
        'Approved Sanctions': c.approved_count,
        'Pending Requests': c.pending_count,
        'Total Sanctioned Amount (INR)': c.total_sanctioned
      }));
    } else if (reportType === 'agency_wise') {
      exportRows = agencyReportData.map(a => ({
        'Agency / Vendor': a.name,
        'Contact Person': a.contact,
        'Total Awarded Cases': a.total_awarded_cases,
        'Total Sanctioned Amount (INR)': a.sanctioned_amount,
        'Cleared Bill Amount (INR)': a.cleared_bill_amount
      }));
    } else if (reportType === 'monthly_approvals') {
      exportRows = monthlyData.map(m => ({
        'Month (YYYY-MM)': m.month,
        'Sanctioned Approvals Count': m.count,
        'Sanctioned Volume (INR)': m.total_amount
      }));
    }

    const csv = Papa.unparse(exportRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Executive Reports & Procurement Analytics</h1>
          <div className="page-subheading">
            Consolidated university summaries for colleges, vendor business volumes, and monthly sanctions.
          </div>
        </div>
        <button className="btn btn-secondary" onClick={handleExportCsv}>
          <Download size={16} /> Export Current Report (CSV)
        </button>
      </div>

      <div className="filter-bar">
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${reportType === 'college_wise' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setReportType('college_wise')}
          >
            <Building2 size={14} /> College-Wise Requests & Sanctions
          </button>
          <button
            className={`btn btn-sm ${reportType === 'agency_wise' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setReportType('agency_wise')}
          >
            <Users size={14} /> Agency-Wise Business Distribution
          </button>
          <button
            className={`btn btn-sm ${reportType === 'monthly_approvals' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setReportType('monthly_approvals')}
          >
            <Calendar size={14} /> Month-Wise Approvals Volume
          </button>
        </div>
      </div>

      {/* 1. College-wise Table */}
      {reportType === 'college_wise' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>College / Institute Name</th>
                <th>Org</th>
                <th>Total Requests</th>
                <th>Sanctioned Cases</th>
                <th>Pending Cases</th>
                <th>Total Sanctioned Volume (INR)</th>
              </tr>
            </thead>
            <tbody>
              {collegeReportData.length > 0 ? (
                collegeReportData.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td><span className={`badge ${c.org === 'CVMU' ? 'badge-cvmu' : 'badge-cvm'}`}>{c.org}</span></td>
                    <td style={{ fontWeight: 700 }}>{c.total_requests}</td>
                    <td style={{ color: '#166534', fontWeight: 600 }}>{c.approved_count}</td>
                    <td style={{ color: '#d97706', fontWeight: 600 }}>{c.pending_count}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a' }}>
                      {formatCurrency(c.total_sanctioned)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>No activity data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. Agency-wise Table */}
      {reportType === 'agency_wise' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Agency / Vendor Name</th>
                <th>Key Contact Person</th>
                <th>Awarded Sanction Cases</th>
                <th>Total Sanctioned Amount (INR)</th>
                <th>Cleared & Paid Bills (INR)</th>
              </tr>
            </thead>
            <tbody>
              {agencyReportData.length > 0 ? (
                agencyReportData.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{a.name}</td>
                    <td>{a.contact || '-'}</td>
                    <td style={{ fontWeight: 700 }}>{a.total_awarded_cases}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#166534' }}>
                      {formatCurrency(a.sanctioned_amount)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {formatCurrency(a.cleared_bill_amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>No agency distribution data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Monthly Table */}
      {reportType === 'monthly_approvals' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sanction Period (YYYY-MM)</th>
                <th>Sanctioned Orders Count</th>
                <th>Total Sanctioned Value (INR)</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.length > 0 ? (
                monthlyData.map(m => (
                  <tr key={m.month}>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{m.month}</td>
                    <td style={{ fontWeight: 700 }}>{m.count}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#166534' }}>
                      {formatCurrency(m.total_amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: 20 }}>No monthly sanction records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
