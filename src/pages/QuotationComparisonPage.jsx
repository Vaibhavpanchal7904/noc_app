import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GitCompare, FileSpreadsheet, Building2, ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { QuotationComparisonMatrix } from '../components/QuotationComparisonMatrix';

export const QuotationComparisonPage = () => {
  const { requests, institutes, agencies, selectQuotation } = useData();

  // Requests that have at least one quotation
  const eligibleRequests = requests.filter(r => (r.quotations || []).length > 0);
  const [selectedReqId, setSelectedReqId] = useState(eligibleRequests[0]?.id || '');

  const activeRequest = requests.find(r => r.id === selectedReqId);

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Quotation Comparison Matrix & Analysis</h1>
          <div className="page-subheading">
            Side-by-side technical and financial comparison of received vendor quotations
          </div>
        </div>
        <Link to="/quotations" className="btn btn-secondary">
          <ArrowLeft size={16} /> All Quotations List
        </Link>
      </div>

      {eligibleRequests.length > 0 ? (
        <div>
          {/* Request Selector Card */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-body">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 13 }}>
                  Select NOC Request for Comparative Statement:
                </label>
                <select
                  className="form-control"
                  value={selectedReqId}
                  onChange={e => setSelectedReqId(e.target.value)}
                  style={{ maxWidth: 600, fontWeight: 600 }}
                >
                  {eligibleRequests.map(r => {
                    const inst = institutes.find(i => i.id === r.institute_id);
                    return (
                      <option key={r.id} value={r.id}>
                        {r.request_no} - {inst?.name} ({r.quotations?.length} quotations) - {r.title}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {activeRequest && (
            <div className="card">
              <div className="card-body">
                <QuotationComparisonMatrix
                  request={activeRequest}
                  agencies={agencies}
                  institutes={institutes}
                  onSelectQuotation={selectQuotation}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <GitCompare className="empty-state-icon" />
              <div className="empty-state-title">No requests with submitted quotations yet</div>
              <div className="empty-state-desc">
                Record quotations against a college requirement to view side-by-side comparative statements.
              </div>
              <Link to="/requests" className="btn btn-primary" style={{ marginTop: 12 }}>
                Browse Requests
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
