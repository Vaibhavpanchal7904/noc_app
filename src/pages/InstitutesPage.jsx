import React, { useState } from 'react';
import { Building2, Search, Plus, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';

export const InstitutesPage = () => {
  const { institutes, organizations, addInstitute, updateInstitute } = useData();
  const { permissions } = useAuth();

  const [selectedOrg, setSelectedOrg] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInst, setEditingInst] = useState(null);

  const [formData, setFormData] = useState({
    org_id: 'org-cvm',
    name: '',
    code: '',
    contact_person: '',
    contact_email: '',
    contact_phone: ''
  });

  const isInstCvmu = (inst) => {
    return inst.org_id === 'org-cvmu' || inst.org_id === '22222222-2222-2222-2222-222222222222' || inst.org_code === 'CVMU';
  };

  const filtered = institutes.filter(inst => {
    if (selectedOrg === 'org-cvm' && isInstCvmu(inst)) return false;
    if (selectedOrg === 'org-cvmu' && !isInstCvmu(inst)) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      if (!inst.name.toLowerCase().includes(term) && !inst.code?.toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingInst(null);
    setFormData({
      org_id: 'org-cvm',
      name: '',
      code: '',
      contact_person: '',
      contact_email: '',
      contact_phone: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (inst) => {
    setEditingInst(inst);
    setFormData({
      org_id: inst.org_id,
      name: inst.name,
      code: inst.code || '',
      contact_person: inst.contact_person || '',
      contact_email: inst.contact_email || '',
      contact_phone: inst.contact_phone || ''
    });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter institute name.');
      return;
    }
    if (editingInst) {
      updateInstitute(editingInst.id, formData);
    } else {
      addInstitute(formData);
    }
    setShowModal(false);
  };

  const cvmCount = institutes.filter(i => !isInstCvmu(i)).length;
  const cvmuCount = institutes.filter(i => isInstCvmu(i)).length;

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Colleges & Institutes Master Directory</h1>
          <div className="page-subheading">
            Official master registry of Charutar Vidya Mandal (CVM: {cvmCount} institutes) and CVM University (CVMU: {cvmuCount} institutes).
          </div>
        </div>
        {permissions.canManageMasterData && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add New College / Institute
          </button>
        )}
      </div>

      <div className="filter-bar">
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${selectedOrg === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedOrg('ALL')}
          >
            All Institutes ({institutes.length})
          </button>
          <button
            className={`btn btn-sm ${selectedOrg === 'org-cvm' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedOrg('org-cvm')}
          >
            CVM Colleges ({cvmCount})
          </button>
          <button
            className={`btn btn-sm ${selectedOrg === 'org-cvmu' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedOrg('org-cvmu')}
          >
            CVMU Colleges ({cvmuCount})
          </button>
        </div>

        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search college by full name or short code..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>#</th>
              <th style={{ width: '45%' }}>College / Institute Name</th>
              <th style={{ width: '12%' }}>Organization</th>
              <th style={{ width: '12%' }}>Code</th>
              <th style={{ width: '16%' }}>Contact Details</th>
              <th style={{ width: '10%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inst, idx) => {
              const org = organizations.find(o => o.id === inst.org_id);
              return (
                <tr key={inst.id}>
                  <td style={{ fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>{inst.name}</td>
                  <td>
                    <StatusBadge status={org?.code || 'CVM'} type="org" />
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: '#475569' }}>
                      {inst.code || '-'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: 12 }}>{inst.contact_person || '-'}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{inst.contact_phone}</div>
                  </td>
                  <td>
                    {permissions.canManageMasterData && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenEdit(inst)}
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

      {/* Add / Edit Institute Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title">
                {editingInst ? 'Edit College / Institute' : 'Add New College / Institute'}
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
                  <label className="form-label">Institute / College Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Exact official name of institute"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Short Acronym / Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. BVM, GCET, ADIT"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Principal / Contact Person</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contact_person}
                      onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contact_phone}
                      onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save College Master Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
