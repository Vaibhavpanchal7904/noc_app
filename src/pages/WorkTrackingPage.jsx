import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Search, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/pdfGenerator';
import { StatusBadge } from '../components/StatusBadge';

export const WorkTrackingPage = () => {
  const { requests, institutes, agencies, updateWorkStatus } = useData();
  const { permissions } = useAuth();
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Update modal
  const [selectedReq, setSelectedReq] = useState(null);
  const [workForm, setWorkForm] = useState({
    status: 'In Progress',
    start_date: new Date().toISOString().split('T')[0],
    completion_date: '',
    engineer_name: '',
    remarks: ''
  });

  const workRequests = requests.filter(r => Boolean(r.work_record) || r.overall_status === 'Approved' || r.overall_status === 'Work In Progress' || r.overall_status === 'Work Completed');

  const filtered = workRequests.filter(r => {
    const status = r.work_record?.status || 'Not Started';
    if (filterStatus !== 'ALL' && status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const inst = institutes.find(i => i.id === r.institute_id);
      if (!r.request_no.toLowerCase().includes(term) && !r.title.toLowerCase().includes(term) && !inst?.name.toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });

  const handleOpenUpdate = (req) => {
    setSelectedReq(req);
    setWorkForm({
      status: req.work_record?.status || 'In Progress',
      start_date: req.work_record?.start_date || new Date().toISOString().split('T')[0],
      completion_date: req.work_record?.completion_date || '',
      engineer_name: req.work_record?.engineer_name || '',
      remarks: req.work_record?.remarks || ''
    });
  };

  const handleSaveUpdate = (e) => {
    e.preventDefault();
    updateWorkStatus(selectedReq.id, workForm);
    setSelectedReq(null);
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">On-Site Work & Installation Progress Tracker</h1>
          <div className="page-subheading">
            Track hardware installations, projector repairs, lab setup progress, and field engineer assignments.
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div style={{ display: 'flex', gap: 8 }}>
          {['ALL', 'Not Started', 'In Progress', 'Completed', 'On Hold'].map(st => (
            <button
              key={st}
              className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterStatus(st)}
            >
              {st === 'ALL' ? 'All Work Records' : st}
            </button>
          ))}
        </div>

        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by Request No, College, Engineer..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Request No</th>
              <th>College / Institute</th>
              <th>Requirement Description</th>
              <th>Assigned Vendor</th>
              <th>Execution Status</th>
              <th>Start Date</th>
              <th>Completion Date</th>
              <th>Field Engineer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(req => {
                const inst = institutes.find(i => i.id === req.institute_id);
                const agency = agencies.find(a => a.id === (req.work_record?.agency_id || req.approvals?.[0]?.selected_agency_id));
                const status = req.work_record?.status || 'Not Started';

                return (
                  <tr key={req.id}>
                    <td>
                      <Link to={`/requests/${req.id}`} style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {req.request_no}
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {inst?.name}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {req.title}
                      </div>
                    </td>
                    <td>{agency?.name || '-'}</td>
                    <td><StatusBadge status={status} /></td>
                    <td>{formatDate(req.work_record?.start_date)}</td>
                    <td>{formatDate(req.work_record?.completion_date)}</td>
                    <td style={{ fontWeight: 600 }}>{req.work_record?.engineer_name || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {permissions.canUpdateWork && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenUpdate(req)}
                          >
                            Update
                          </button>
                        )}
                        <Link to={`/requests/${req.id}`} className="btn btn-secondary btn-sm">
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">
                    <Wrench className="empty-state-icon" />
                    <div className="empty-state-title">No work records match the filter</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Update Work Modal */}
      {selectedReq && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title">Update Execution Progress for {selectedReq.request_no}</div>
              <button className="btn-icon" onClick={() => setSelectedReq(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Work Status <span className="required">*</span></label>
                  <select
                    className="form-control"
                    value={workForm.status}
                    onChange={e => setWorkForm({ ...workForm, status: e.target.value })}
                    required
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={workForm.start_date}
                      onChange={e => setWorkForm({ ...workForm, start_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Completion Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={workForm.completion_date}
                      onChange={e => setWorkForm({ ...workForm, completion_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Field Engineer / Technician Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Nitin Solanki"
                    value={workForm.engineer_name}
                    onChange={e => setWorkForm({ ...workForm, engineer_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Inspection & Progress Notes</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Provide details about testing or completion verification..."
                    value={workForm.remarks}
                    onChange={e => setWorkForm({ ...workForm, remarks: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedReq(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Work Progress</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
