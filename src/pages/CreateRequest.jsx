import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save, FileText, Camera, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ScannerModal } from '../components/ScannerModal';

export const CreateRequest = () => {
  const { organizations, institutes, createRequest, addDocument, getNextRequestNo } = useData();
  const { permissions } = useAuth();
  const navigate = useNavigate();

  const [orgId, setOrgId] = useState(() => organizations[0]?.id || 'org-cvm');
  const [instituteId, setInstituteId] = useState('');
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [clgOutNo, setClgOutNo] = useState('');
  const [clgInNo, setClgInNo] = useState('');
  const [requestType, setRequestType] = useState('New Purchase');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // Keep orgId in sync with loaded organizations
  useEffect(() => {
    if (organizations.length > 0) {
      const match = organizations.find(o => o.id === orgId || o.code === (orgId === 'org-cvmu' ? 'CVMU' : 'CVM'));
      if (match && orgId !== match.id) {
        setOrgId(match.id);
      } else if (!match) {
        setOrgId(organizations[0].id);
      }
    }
  }, [organizations]);

  // Multi-Item list
  const [items, setItems] = useState([
    { item_name: '', category: 'IT Hardware', quantity: 1, unit: 'Nos', specifications: '', estimated_unit_price: '' }
  ]);

  // Scanned documents during creation
  const [attachedDocs, setAttachedDocs] = useState([]);
  const [showScanner, setShowScanner] = useState(false);

  // Filter institutes based on chosen organization (supports UUID and local codes)
  const selectedOrg = organizations.find(o => o.id === orgId || o.code === orgId);
  const isSelectedCvmu = selectedOrg?.code === 'CVMU' || orgId === 'org-cvmu' || orgId === 'CVMU' || orgId === '22222222-2222-2222-2222-222222222222';

  const filteredInstitutes = institutes.filter(inst => {
    if (!inst.is_active) return false;
    const instOrg = organizations.find(o => o.id === inst.org_id);
    const isInstCvmu = instOrg?.code === 'CVMU' || inst.org_id === 'org-cvmu' || inst.org_id === 'CVMU' || inst.org_id === '22222222-2222-2222-2222-222222222222';
    return isSelectedCvmu ? isInstCvmu : !isInstCvmu;
  });

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { item_name: '', category: 'IT Hardware', quantity: 1, unit: 'Nos', specifications: '', estimated_unit_price: '' }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems(prev => prev.map((it, idx) => {
      if (idx === index) {
        return { ...it, [field]: value };
      }
      return it;
    }));
  };

  const calculateAutoBudget = () => {
    const total = items.reduce((sum, it) => {
      const q = parseFloat(it.quantity) || 0;
      const p = parseFloat(it.estimated_unit_price) || 0;
      return sum + (q * p);
    }, 0);
    if (total > 0) {
      setEstimatedBudget(String(total));
    }
  };

  const handleSaveDocFromScanner = (scannedDoc) => {
    setAttachedDocs(prev => [...prev, scannedDoc]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!permissions.canCreateRequest) {
      alert('Read-only users cannot create requests.');
      return;
    }
    if (!instituteId) {
      alert('Please select a college/institute.');
      return;
    }
    if (!title.trim()) {
      alert('Please enter a request title / subject.');
      return;
    }
    if (items.some(it => !it.item_name.trim())) {
      alert('Please specify the item name for all item rows.');
      return;
    }

    const newReq = createRequest({
      org_id: orgId,
      institute_id: instituteId,
      request_date: requestDate,
      clg_out_no: clgOutNo,
      clg_in_no: clgInNo,
      request_type: requestType,
      title,
      description,
      estimated_budget: estimatedBudget,
      internal_notes: internalNotes,
      items
    });

    // Attach any scanned documents
    attachedDocs.forEach(doc => {
      addDocument(newReq.id, doc);
    });

    navigate(`/requests/${newReq.id}`);
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <Link to="/requests" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 8, color: '#64748b' }}>
            <ArrowLeft size={14} /> Back to Requests List
          </Link>
          <h1 className="page-title">Register New College Requirement / NOC Request</h1>
          <div className="page-subheading">
            Stage 1: Record requirement letter, item specifications, and reference numbers
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section 1: Basic Details */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <FileText size={18} color="#2563eb" />
              <span>1. College & Inward/Outward Details</span>
            </div>
          </div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Managing Organization <span className="required">*</span></label>
                <select
                  className="form-control"
                  value={orgId}
                  onChange={e => {
                    setOrgId(e.target.value);
                    setInstituteId('');
                  }}
                  required
                >
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name} ({org.code})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">College / Institute <span className="required">*</span></label>
                <select
                  className="form-control"
                  value={instituteId}
                  onChange={e => setInstituteId(e.target.value)}
                  required
                >
                  <option value="">-- Select College ({filteredInstitutes.length} Available) --</option>
                  {filteredInstitutes.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Requirement Date <span className="required">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  value={requestDate}
                  onChange={e => setRequestDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">College Outgoing Letter No (Outward)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. BVM/IT/2026/142"
                  value={clgOutNo}
                  onChange={e => setClgOutNo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">NOC Incoming Register No (Inward)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. NOC/IN/2026/890"
                  value={clgInNo}
                  onChange={e => setClgInNo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Request Type <span className="required">*</span></label>
                <select
                  className="form-control"
                  value={requestType}
                  onChange={e => setRequestType(e.target.value)}
                  required
                >
                  <option value="New Purchase">New Purchase</option>
                  <option value="Repair">Repair</option>
                  <option value="Service">Service</option>
                  <option value="Replacement">Replacement</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Requirement Title / Subject <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Purchase of 50 Desktop Computers for AI/ML Department"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Requirement Description / Notes</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Specify justification, department location, room number, or special requirements..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Requirement Items */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span>2. Item Specifications & Quantities</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={calculateAutoBudget}>
                Calculate Approx Total
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleAddItem}>
                <Plus size={14} /> Add Item Row
              </button>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>Item / Equipment Name *</th>
                    <th style={{ width: '18%' }}>Category</th>
                    <th style={{ width: '12%' }}>Quantity *</th>
                    <th style={{ width: '12%' }}>Unit</th>
                    <th style={{ width: '20%' }}>Est. Unit Price (₹)</th>
                    <th style={{ width: '8%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <tr>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Desktop Computer Core i7"
                            value={item.item_name}
                            onChange={e => handleItemChange(idx, 'item_name', e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <select
                            className="form-control"
                            value={item.category}
                            onChange={e => handleItemChange(idx, 'category', e.target.value)}
                          >
                            <option value="IT Hardware">IT Hardware</option>
                            <option value="Audio-Visual">Audio-Visual (Projector/Screen)</option>
                            <option value="Networking">Networking / Cables</option>
                            <option value="Software">Software License</option>
                            <option value="Lab Equipment">Lab Equipment</option>
                            <option value="Repair / Service">Repair / Service</option>
                            <option value="General">General</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            className="form-control"
                            value={item.quantity}
                            onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nos / Sets / Units"
                            value={item.unit}
                            onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="form-control"
                            placeholder="e.g. 50000"
                            value={item.estimated_unit_price}
                            onChange={e => handleItemChange(idx, 'estimated_unit_price', e.target.value)}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn-icon"
                            disabled={items.length === 1}
                            onClick={() => handleRemoveItem(idx)}
                            title="Remove item"
                          >
                            <Trash2 size={16} color="#ef4444" />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={6} style={{ background: '#f8fafc', padding: '6px 14px 12px 14px' }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Detailed technical specifications (Processor, RAM, Storage, Model, Warranty requirements)..."
                            value={item.specifications}
                            onChange={e => handleItemChange(idx, 'specifications', e.target.value)}
                          />
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card-footer" style={{ justifyContent: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Approximate Total Budget (INR):</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                style={{ width: 'min(220px, 100%)', fontWeight: 600 }}
                placeholder="Optional budget"
                value={estimatedBudget}
                onChange={e => setEstimatedBudget(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Document Attachments & Camera Scanning */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span>3. Supporting Documents & Letter Scans</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowScanner(true)}
            >
              <Camera size={14} /> Scan / Attach Requirement Letter
            </button>
          </div>
          <div className="card-body">
            {attachedDocs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {attachedDocs.map((doc, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <FileText size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, overflowWrap: 'anywhere' }}>{doc.file_name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Category: {doc.category}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => setAttachedDocs(prev => prev.filter((_, i) => i !== idx))}
                      title="Remove attachment"
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#64748b' }}>
                No documents attached yet. You can attach scanned requirement letters or upload PDFs now or at any stage later.
              </div>
            )}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="page-header-actions" style={{ justifyContent: 'flex-end', gap: 12, marginBottom: 40 }}>
          <Link to="/requests" className="btn btn-secondary btn-lg">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary btn-lg">
            <Save size={16} /> Register Requirement & Proceed
          </button>
        </div>
      </form>

      {/* Camera Scanner Modal */}
      <ScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onSaveScan={handleSaveDocFromScanner}
      />
    </div>
  );
};
