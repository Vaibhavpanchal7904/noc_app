import React, { useState } from 'react';
import { ShieldCheck, Plus, Edit2, Building2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';

export const AuthoritiesPage = () => {
  const { authorities, organizations, addAuthority, updateAuthority } = useData();
  const { permissions } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [editingAuth, setEditingAuth] = useState(null);

  const [formData, setFormData] = useState({
    org_id: 'org-cvm',
    title: '',
    officer_name: '',
    sort_order: 1
  });

  const handleOpenAdd = () => {
    setEditingAuth(null);
    setFormData({
      org_id: 'org-cvm',
      title: '',
      officer_name: '',
      sort_order: authorities.length + 1
    });
    setShowModal(true);
  };

  const handleOpenEdit = (auth) => {
    setEditingAuth(auth);
    setFormData({
      org_id: auth.org_id,
      title: auth.title,
      officer_name: auth.officer_name || '',
      sort_order: auth.sort_order || 1
    });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter authority designation title.');
      return;
    }
    if (editingAuth) {
      updateAuthority(editingAuth.id, formData);
    } else {
      addAuthority(formData);
    }
    setShowModal(false);
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Approval Authorities Directory</h1>
          <div className="page-subheading">
            Configurable hierarchy of sanctioning officers for CVM (Chairman, Hon. Joint Secretary) and CVMU (President, Provost, Registrar, etc.).
          </div>
        </div>
        {permissions.canManageMasterData && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Approval Authority
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Sort Order</th>
              <th style={{ width: '25%' }}>Designation Title</th>
              <th style={{ width: '20%' }}>Organization</th>
              <th style={{ width: '30%' }}>Current Incumbent Officer</th>
              <th style={{ width: '15%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {authorities.map(auth => {
              const org = organizations.find(o => o.id === auth.org_id);
              return (
                <tr key={auth.id}>
                  <td style={{ fontWeight: 700, color: '#64748b' }}>#{auth.sort_order}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{auth.title}</td>
                  <td><StatusBadge status={org?.code || 'CVM'} type="org" /></td>
                  <td style={{ fontWeight: 500 }}>{auth.officer_name || '-'}</td>
                  <td>
                    {permissions.canManageMasterData && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenEdit(auth)}
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title">
                {editingAuth ? 'Edit Approval Authority' : 'Add Approval Authority'}
              </div>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Managing Organization <span className="required">*</span></label>
                  <select
                    className="form-control"
                    value={formData.org_id}
                    onChange={e => setFormData({ ...formData, org_id: e.target.value })}
                    required
                  >
                    {organizations.map(o => (
                      <option key={o.id} value={o.id}>{o.name} ({o.code})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Authority Designation Title <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Chairman, Hon. Joint Secretary, Provost, Registrar"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Incumbent Officer Name (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Shri Prayasvin Patel, Dr. J. D. Patel"
                    value={formData.officer_name}
                    onChange={e => setFormData({ ...formData, officer_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sort Display Order</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.sort_order}
                    onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Authority</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
