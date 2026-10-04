import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Trash2, Check, AlertCircle, Upload, Plus, FileText } from 'lucide-react';
import { combineImagesToPdf } from '../utils/pdfGenerator';

export const ScannerModal = ({ isOpen, onClose, onSaveScan, requestId }) => {
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [capturedPages, setCapturedPages] = useState([]);
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'upload'
  const [category, setCategory] = useState('Requirement Letter');
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize Camera
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this browser or device.');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Rear camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError(err.message || 'Camera permission denied or camera unavailable.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPages(prev => [...prev, dataUrl]);
  };

  const removePage = (index) => {
    setCapturedPages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedPages(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    if (capturedPages.length === 0) {
      alert('Please capture or select at least one page.');
      return;
    }

    setIsProcessing(true);
    try {
      const defaultName = `${category.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      const targetName = fileName.trim() || defaultName;

      // Generate Combined Multi-Page PDF
      const pdfDoc = await combineImagesToPdf(capturedPages, targetName);
      const pdfDataUrl = pdfDoc.output('datauristring');

      onSaveScan({
        request_id: requestId,
        category,
        file_name: targetName,
        file_path: pdfDataUrl,
        file_size: Math.round(pdfDataUrl.length * 0.75),
        mime_type: 'application/pdf',
        is_scanned: true
      });

      stopCamera();
      onClose();
    } catch (err) {
      console.error('Failed to generate scanned PDF:', err);
      alert('Failed to save document PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-lg">
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Camera size={20} color="#2563eb" />
            <span>Document Camera Scanner & Inward Digitizer</span>
          </div>
          <button className="btn-icon" onClick={onClose} disabled={isProcessing}>✕</button>
        </div>

        <div className="modal-body">
          {/* Top Options Bar */}
          <div className="form-row" style={{ marginBottom: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Document Category</label>
              <select 
                className="form-control" 
                value={category} 
                onChange={e => setCategory(e.target.value)}
              >
                <option value="Requirement Letter">Requirement Letter</option>
                <option value="Quotation">Quotation</option>
                <option value="Quotation Comparison">Quotation Comparison</option>
                <option value="Approval Submission">Approval Submission</option>
                <option value="Chairman/Authority Approval">Chairman/Authority Approval</option>
                <option value="Final Approval Letter">Final Approval Letter</option>
                <option value="Work Completion Proof">Work Completion Proof</option>
                <option value="Bill">Bill / Invoice</option>
                <option value="Other">Other Supporting Document</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Custom File Name (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Requirement_AR_Pharmacy.pdf"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
              />
            </div>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button
              className={`btn btn-sm ${activeTab === 'camera' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('camera')}
            >
              <Camera size={14} /> Live Camera Scanner
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('upload')}
            >
              <Upload size={14} /> File Drop / Upload Fallback
            </button>
          </div>

          {/* Camera Viewport */}
          {activeTab === 'camera' ? (
            cameraError ? (
              <div className="alert alert-warning">
                <AlertCircle size={18} />
                <div>
                  <strong>Camera Notice:</strong> {cameraError}
                  <div style={{ marginTop: 6 }}>
                    You can switch to the <strong>File Drop / Upload Fallback</strong> tab to select images/scans from your computer or phone.
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="scanner-viewport">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="scanner-video"
                  />
                  <div className="scanner-guide-overlay" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={captureFrame}
                    style={{ borderRadius: 9999, padding: '12px 24px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
                  >
                    <Camera size={18} /> Capture Page ({capturedPages.length + 1})
                  </button>
                </div>
              </div>
            )
          ) : (
            <div 
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: 8,
                padding: '36px 20px',
                textAlign: 'center',
                background: '#f8fafc',
                cursor: 'pointer'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={36} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
              <div style={{ fontWeight: 600, fontSize: 14 }}>Click or drag images to add pages</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Supports JPG, PNG photos</div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png, image/jpeg, image/jpg"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Captured Pages Strip */}
          {capturedPages.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Captured Document Pages ({capturedPages.length})</span>
                <span style={{ fontSize: 11, color: '#64748b' }}>Will be merged into a single multi-page PDF</span>
              </div>
              <div className="scanned-pages-strip">
                {capturedPages.map((pageData, index) => (
                  <div key={index} className="scanned-page-thumb">
                    <img src={pageData} alt={`Page ${index + 1}`} />
                    <button
                      className="scanned-thumb-delete"
                      title="Remove page"
                      onClick={() => removePage(index)}
                    >
                      ✕
                    </button>
                    <div style={{ position: 'absolute', bottom: 2, left: 2, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 9, padding: '1px 4px', borderRadius: 2 }}>
                      p.{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isProcessing}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={capturedPages.length === 0 || isProcessing}
          >
            {isProcessing ? 'Merging into PDF...' : `Save & Attach Document (${capturedPages.length} Pages)`}
          </button>
        </div>
      </div>
    </div>
  );
};
