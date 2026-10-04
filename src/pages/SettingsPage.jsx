import React, { useState } from 'react';
import { Sliders, Save, RefreshCw, Database, Award, Shield, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const SettingsPage = () => {
  const { letterSettings, setLetterSettings, resetToFactoryData } = useData();
  const { isConfigured } = useAuth();
  const [form, setForm] = useState(letterSettings);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setLetterSettings(form);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all operational data back to the clean initial master data and Section 8 historical examples?')) {
      resetToFactoryData();
      alert('Data reset to factory state successfully.');
    }
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">System Settings & Letterhead Configuration</h1>
          <div className="page-subheading">
            Manage university letterhead branding, signatories, and database deployment state.
          </div>
        </div>
      </div>

      {savedNotice && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} />
          <span>Letterhead settings updated and saved successfully.</span>
        </div>
      )}

      {/* Cloud / Local Status */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Database size={18} color="#2563eb" />
            <span>Database & Cloud Deployment Status</span>
          </div>
          <span className={`badge ${isConfigured ? 'badge-approved' : 'badge-info'}`}>
            {isConfigured ? 'Supabase Live Connected' : 'Local State Engine Active'}
          </span>
        </div>
        <div className="card-body">
          <p style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>
            The application operates with full offline and local mock persistence out-of-the-box, allowing immediate development, demonstration, and end-to-end testing without external dependency barriers.
          </p>
          <div style={{ background: '#f8fafc', padding: 14, borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12 }}>
            <div><strong>Environment Variables:</strong> VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</div>
            <div style={{ marginTop: 4 }}><strong>Storage Bucket:</strong> <code>noc-documents</code> (Private access with RLS)</div>
            <div style={{ marginTop: 4 }}><strong>Free-Tier Target:</strong> Cloudflare Pages + Supabase PostgreSQL</div>
          </div>
        </div>
      </div>

      {/* Letterhead Configuration */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Award size={18} color="#2563eb" />
            <span>Configurable Approval Letterhead & Signatories</span>
          </div>
        </div>
        <form onSubmit={handleSave}>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">CVM Header Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.headerCvmTitle}
                  onChange={e => setForm({ ...form, headerCvmTitle: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">CVM Subtitle / Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.headerCvmSubtitle}
                  onChange={e => setForm({ ...form, headerCvmSubtitle: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">CVMU Header Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.headerCvmuTitle}
                  onChange={e => setForm({ ...form, headerCvmuTitle: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">CVMU Subtitle / Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.headerCvmuSubtitle}
                  onChange={e => setForm({ ...form, headerCvmuSubtitle: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Department Cell Name</label>
              <input
                type="text"
                className="form-control"
                value={form.nocDeptTitle}
                onChange={e => setForm({ ...form, nocDeptTitle: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Default CVM Signatory Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.signatoryNameCvm}
                  onChange={e => setForm({ ...form, signatoryNameCvm: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Default CVM Signatory Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.signatoryTitleCvm}
                  onChange={e => setForm({ ...form, signatoryTitleCvm: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Default CVMU Signatory Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.signatoryNameCvmu}
                  onChange={e => setForm({ ...form, signatoryNameCvmu: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Default CVMU Signatory Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.signatoryTitleCvmu}
                  onChange={e => setForm({ ...form, signatoryTitleCvmu: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Footer Sanction Note</label>
              <input
                type="text"
                className="form-control"
                value={form.footerNote}
                onChange={e => setForm({ ...form, footerNote: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="card-footer">
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Letterhead Template
            </button>
          </div>
        </form>
      </div>

      {/* Demo Reset Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <RefreshCw size={18} color="#ef4444" />
            <span>Reset Demo & Master Data</span>
          </div>
        </div>
        <div className="card-body">
          <p style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>
            Restore the system back to clean factory state with the 48 CVM/CVMU colleges, 9 agencies, authorities, and Section 8 historical records (Examples A, B, and C).
          </p>
          <button className="btn btn-danger" onClick={handleReset}>
            <RefreshCw size={14} /> Reset to Factory Master State
          </button>
        </div>
      </div>
    </div>
  );
};
