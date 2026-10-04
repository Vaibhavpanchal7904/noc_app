import React, { useState } from 'react';
import { History, Search, Shield, Filter, Download } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDate } from '../utils/pdfGenerator';
import Papa from 'papaparse';

export const AuditLogsPage = () => {
  const { auditLogs } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('ALL');

  const filtered = auditLogs.filter(log => {
    if (selectedEntity !== 'ALL' && log.entity_type !== selectedEntity) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchAct = log.action.toLowerCase().includes(term);
      const matchActor = log.actor_name?.toLowerCase().includes(term);
      const matchEntity = log.entity_id?.toLowerCase().includes(term);
      if (!matchAct && !matchActor && !matchEntity) return false;
    }
    return true;
  });

  const handleExportCsv = () => {
    const csvData = filtered.map(l => ({
      'Timestamp': l.created_at,
      'Actor Name': l.actor_name,
      'Actor Email': l.actor_email,
      'Action': l.action,
      'Entity Type': l.entity_type,
      'Entity Ref': l.entity_id,
      'Change Details': JSON.stringify(l.changes || {})
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NOC_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Immutable Audit Trail & Compliance Logs</h1>
          <div className="page-subheading">
            Chronological record of every requirement creation, quotation evaluation, sanction decision, and master change.
          </div>
        </div>
        <button className="btn btn-secondary" onClick={handleExportCsv}>
          <Download size={16} /> Export Audit Log (CSV)
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search action, actor, or case number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: 'auto' }}
          value={selectedEntity}
          onChange={e => setSelectedEntity(e.target.value)}
        >
          <option value="ALL">All Entity Types</option>
          <option value="request">NOC Requests</option>
          <option value="quotation">Quotations</option>
          <option value="approval">Approvals & Decisions</option>
          <option value="approval_letter">Approval Letters</option>
          <option value="work_record">Work Progress</option>
          <option value="bill">Bills & Payments</option>
          <option value="document">Documents & Scans</option>
          <option value="institute">Institutes</option>
          <option value="agency">Agencies</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '18%' }}>Timestamp</th>
              <th style={{ width: '20%' }}>Actor / User</th>
              <th style={{ width: '22%' }}>Action Performed</th>
              <th style={{ width: '15%' }}>Entity Type & ID</th>
              <th style={{ width: '25%' }}>Change Summary / Payload</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id}>
                <td style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                  {formatDate(log.created_at)} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{log.actor_name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{log.actor_email}</div>
                </td>
                <td>
                  <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                    {log.action}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{log.entity_id}</div>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>{log.entity_type}</div>
                </td>
                <td>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', background: '#f8fafc', padding: '6px 8px', borderRadius: 4, maxHeight: 60, overflowY: 'auto' }}>
                    {JSON.stringify(log.changes)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
