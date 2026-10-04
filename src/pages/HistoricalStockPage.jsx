import React from 'react';
import { Database, AlertCircle, Building2 } from 'lucide-react';
import { useData } from '../context/DataContext';

export const HistoricalStockPage = () => {
  const { stockNotes } = useData();

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Historical Stock & Distribution Reference Notes</h1>
          <div className="page-subheading">
            Archival reference figures from legacy NOC ledgers (Section 15 specification).
          </div>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 20 }}>
        <AlertCircle size={18} />
        <div>
          <strong>Archival Reference Notice:</strong> These figures represent historical distribution counts recorded in legacy NOC files (such as Total CPU / Screen allotments). They are preserved strictly for historical audit and reference, and are kept cleanly separated from live financial approval totals.
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '15%' }}>College Code</th>
              <th style={{ width: '45%' }}>College / Department Name</th>
              <th style={{ width: '15%' }}>Archival Stock Count</th>
              <th style={{ width: '25%' }}>Historical Ledger Notes</th>
            </tr>
          </thead>
          <tbody>
            {stockNotes.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#2563eb' }}>
                  {item.college_code}
                </td>
                <td style={{ fontWeight: 600 }}>{item.college_name}</td>
                <td style={{ fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                  {item.stock_count} units
                </td>
                <td style={{ fontSize: 12, color: '#64748b' }}>{item.note_details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
