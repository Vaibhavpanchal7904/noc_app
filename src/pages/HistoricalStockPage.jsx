import React, { useState } from 'react';
import { Database, AlertCircle, Plus, Edit2, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const HistoricalStockPage = () => {
  const { stockNotes, addStockNote, updateStockNote, deleteStockNote } = useData();
  const { permissions } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    college_code: '',
    college_name: '',
    stock_count: '',
    note_details: ''
  });

  const handleOpenAdd = () => {
    setEditingNote(null);
    setFormData({
      college_code: '',
      college_name: '',
      stock_count: '',
      note_details: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingNote(item);
    setFormData({
      college_code: item.college_code || '',
      college_name: item.college_name || '',
      stock_count: item.stock_count || '',
      note_details: item.note_details || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id, code) => {
    if (window.confirm(`Are you sure you want to delete archival stock note for ${code || 'this entry'}?`)) {
      deleteStockNote(id);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.college_code.trim() || !formData.college_name.trim()) {
      alert('Please fill college code and name.');
      return;
    }

    if (editingNote) {
      updateStockNote(editingNote.id, formData);
    } else {
      addStockNote(formData);
    }
    setShowModal(false);
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Historical Stock & Distribution Reference Notes</h1>
          <div className="page-subheading">
            Archival reference figures from legacy NOC ledgers (Section 15 specification).
          </div>
        </div>
        {permissions.canManageMasterData && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Archival Stock Note
          </button>
        )}
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
              <th style={{ width: '35%' }}>College / Department Name</th>
              <th style={{ width: '15%' }}>Archival Stock Count</th>
              <th style={{ width: '23%' }}>Historical Ledger Notes</th>
              <th style={{ width: '12%' }}>Actions</th>
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
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      title="Edit Stock Note"
                      onClick={() => handleOpenEdit(item)}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    {permissions.canManageMasterData && (
                      <button
                        className="btn btn-danger btn-sm"
                        title="Delete Stock Note"
                        onClick={() => handleDelete(item.id, item.college_code)}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Stock Note Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title">
                {editingNote ? 'Edit Archival Stock Note' : 'Add Archival Stock Note'}
              </div>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">College Code <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. BVAL"
                      value={formData.college_code}
                      onChange={e => setFormData({ ...formData, college_code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Count (Units) <span className="required">*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 52"
                      value={formData.stock_count}
                      onChange={e => setFormData({ ...formData, stock_count: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">College / Institute Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bhikhabhai Patel Institute"
                    value={formData.college_name}
                    onChange={e => setFormData({ ...formData, college_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Historical Ledger Notes</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="e.g. Recorded in physical ledger volume 2023-2024"
                    value={formData.note_details}
                    onChange={e => setFormData({ ...formData, note_details: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingNote ? 'Update Stock Note' : 'Save Stock Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
