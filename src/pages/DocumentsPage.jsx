import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Search, Camera, FileText, Download, Eye, Upload } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDate } from '../utils/pdfGenerator';
import { ScannerModal } from '../components/ScannerModal';
import { DocumentViewerModal } from '../components/DocumentViewerModal';

export const DocumentsPage = () => {
  const { documents, requests, addDocument } = useData();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState(null);

  const categories = [
    'ALL',
    'Requirement Letter',
    'Quotation',
    'Quotation Comparison',
    'Approval Submission',
    'Chairman/Authority Approval',
    'Final Approval Letter',
    'Work Completion Proof',
    'Bill',
    'Other'
  ];

  const filtered = documents.filter(doc => {
    if (selectedCategory !== 'ALL' && doc.category !== selectedCategory) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const req = requests.find(r => r.id === doc.request_id);
      const matchName = doc.file_name?.toLowerCase().includes(term);
      const matchReq = req?.request_no?.toLowerCase().includes(term);
      if (!matchName && !matchReq) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Digital Document Repository & Inward Archive</h1>
          <div className="page-subheading">
            Digitized official letters, scanned requirement notes, quotation sheets, and bills.
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowScanner(true)}>
          <Camera size={16} /> Scan / Upload Document
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search document name or request number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: 'auto' }}
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          {categories.map(c => (
            <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>File / Document Name</th>
              <th>Category</th>
              <th>Associated Case Ref</th>
              <th>File Size</th>
              <th>Upload Date</th>
              <th>Digitization Mode</th>
              <th>Uploaded By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(doc => {
                const req = requests.find(r => r.id === doc.request_id);
                return (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={18} color="#2563eb" />
                        <span style={{ fontWeight: 600 }}>{doc.file_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{doc.category}</span>
                    </td>
                    <td>
                      {req ? (
                        <Link to={`/requests/${req.id}`} style={{ fontWeight: 600, color: '#2563eb' }}>
                          {req.request_no}
                        </Link>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>General / Unlinked</span>
                      )}
                    </td>
                    <td>{doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : 'N/A'}</td>
                    <td>{formatDate(doc.created_at)}</td>
                    <td>{doc.is_scanned ? 'Camera Scanner' : 'Direct Upload'}</td>
                    <td>{doc.uploaded_by_name || 'NOC Staff'}</td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedDocForPreview(doc)}
                      >
                        <Eye size={14} /> Preview
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <FolderOpen className="empty-state-icon" />
                    <div className="empty-state-title">No documents match the filter</div>
                    <div className="empty-state-desc">
                      Upload or scan official papers to populate the digital archive.
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Camera Scanner Modal */}
      <ScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onSaveScan={doc => addDocument(requests[0]?.id, doc)}
      />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={Boolean(selectedDocForPreview)}
        onClose={() => setSelectedDocForPreview(null)}
        document={selectedDocForPreview}
      />
    </div>
  );
};
