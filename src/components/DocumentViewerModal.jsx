import React from 'react';
import { Download, ExternalLink, FileText, Image as ImageIcon } from 'lucide-react';

export const DocumentViewerModal = ({ isOpen, onClose, document }) => {
  if (!isOpen || !document) return null;

  const isPdf = document.mime_type === 'application/pdf' || document.file_name?.toLowerCase().endsWith('.pdf') || (typeof document.file_path === 'string' && document.file_path.startsWith('data:application/pdf'));

  const handleDownload = () => {
    const link = window.document.createElement('a');
    link.href = document.file_path;
    link.download = document.file_name || 'noc_document';
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-xl" style={{ height: '85vh' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isPdf ? <FileText size={20} color="#2563eb" /> : <ImageIcon size={20} color="#16a34a" />}
            <div>
              <div>{document.file_name}</div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>
                Category: {document.category} | Size: {document.file_size ? `${Math.round(document.file_size / 1024)} KB` : 'N/A'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={handleDownload}>
              <Download size={14} /> Download File
            </button>
            <button className="btn-icon" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="modal-body" style={{ padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#334155' }}>
          {isPdf ? (
            <iframe
              src={document.file_path}
              title={document.file_name}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <div style={{ padding: 20, maxWidth: '100%', maxHeight: '100%', overflow: 'auto' }}>
              <img
                src={document.file_path}
                alt={document.file_name}
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 4 }}
              />
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Official NOC Department Confidential Document (Protected Access)
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
