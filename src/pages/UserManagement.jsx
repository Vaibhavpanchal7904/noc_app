import React, { useState } from 'react';
import { UserCheck, Plus, Edit2, Shield, Check, Mail, Lock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const UserManagement = () => {
  const { users, logAudit } = useData();
  const { currentUser, permissions } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'noc_staff',
    is_active: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.full_name.trim()) {
      alert('Please fill email and full name.');
      return;
    }
    const newUser = {
      id: 'usr-' + Date.now(),
      ...formData
    };
    logAudit('PROVISION_USER', 'user', newUser.email, formData);
    alert(`User ${formData.full_name} (${formData.role}) provisioned successfully.`);
    setShowModal(false);
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">User Roles & Access Governance</h1>
          <div className="page-subheading">
            Internal administrative access control for university NOC department staff and sanction authorities.
          </div>
        </div>
        {permissions.canManageUsers && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Provision New Internal User
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Full Name</th>
              <th style={{ width: '25%' }}>Official University Email</th>
              <th style={{ width: '20%' }}>Assigned Role</th>
              <th style={{ width: '15%' }}>Access Level</th>
              <th style={{ width: '15%' }}>Account Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>
                      {u.full_name.charAt(0)}
                    </div>
                    <span>{u.full_name}</span>
                    {currentUser?.id === u.id && (
                      <span className="badge badge-info" style={{ fontSize: 10 }}>Current</span>
                    )}
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className="badge badge-pending" style={{ textTransform: 'capitalize' }}>
                    <Shield size={11} style={{ marginRight: 2 }} /> {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: 12, color: '#475569' }}>
                    {u.role === 'administrator' ? 'Full System & Security Access' :
                     u.role === 'approver' ? 'Sanctions & Sanction Order Signing' :
                     u.role === 'noc_staff' ? 'Operational & Procurement Execution' : 'Read-only Inspection'}
                  </span>
                </td>
                <td>
                  <span className="badge badge-approved">Active User</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Provision Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title">Provision New Internal Staff User</div>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Dr. J. D. Patel"
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Official Email <span className="required">*</span></label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. jdpatel@cvmu.edu.in"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Security Role <span className="required">*</span></label>
                  <select
                    className="form-control"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    required
                  >
                    <option value="administrator">Administrator (Full Master Data & Users)</option>
                    <option value="noc_staff">NOC Staff (Requirement, Quotations, Letters, Bills)</option>
                    <option value="approver">Approver (Sanction Decisions & Letters)</option>
                    <option value="auditor">Read-only Auditor (Inspect & Export)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Provision User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
