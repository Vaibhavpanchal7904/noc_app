import React, { useState } from 'react';
import { Users, Search, Plus, Edit2, Phone, Mail, MapPin } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const AgenciesPage = () => {
  const { agencies, addAgency, updateAgency } = useData();
  const { permissions } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAgency, setEditingAgency] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    gstin: ''
  });

  const filtered = agencies.filter(a => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      if (!a.name.toLowerCase().includes(term) && !a.contact_person?.toLowerCase().includes(term) && !a.email?.toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingAgency(null);
    setFormData({
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      gstin: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (agency) => {
    setEditingAgency(agency);
    setFormData({
      name: agency.name,
      contact_person: agency.contact_person || '',
      phone: agency.phone || '',
      email: agency.email || '',
      address: agency.address || '',
      gstin: agency.gstin || ''
    });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter agency name.');
      return;
    }
    if (editingAgency) {
      updateAgency(editingAgency.id, formData);
    } else {
      addAgency(formData);
    }
    setShowModal(false);
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Agencies & Vendor Directory</h1>
          <div className="page-subheading">
            Official list of registered suppliers, hardware vendors, service contractors, and audio-visual agencies.
          </div>
        </div>
        {permissions.canManageMasterData && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Register New Agency / Vendor
          </button>
        )}
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search agency name, contact person, or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '22%' }}>Agency / Vendor Name</th>
              <th style={{ width: '18%' }}>Contact Person</th>
              <th style={{ width: '15%' }}>Phone Number</th>
              <th style={{ width: '18%' }}>Email Address</th>
              <th style={{ width: '17%' }}>Address / Location</th>
              <th style={{ width: '10%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(ag => (
              <tr key={ag.id}>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>{ag.name}</td>
                <td style={{ fontWeight: 500 }}>{ag.contact_person || '-'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <Phone size={13} color="#64748b" />
                    <span>{ag.phone || '-'}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <Mail size={13} color="#64748b" />
                    <span>{ag.email || '-'}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                    <MapPin size={13} color="#64748b" />
                    <span>{ag.address || '-'}</span>
                  </div>
                </td>
                <td>
                  {permissions.canManageMasterData && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenEdit(ag)}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title">
                {editingAgency ? 'Edit Agency Details' : 'Register New Agency / Vendor'}
              </div>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Agency / Firm Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Yash Computers, Rise Techno Solutions"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Key Contact Person</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contact_person}
                      onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone / Mobile</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GSTIN / Tax Registration No</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 24AAACY9012N1Z8"
                      value={formData.gstin}
                      onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Office Address / Location</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="e.g. Anand, Gujarat"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Agency Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
