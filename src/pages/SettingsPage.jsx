import React, { useState, useEffect } from 'react';
import { Sliders, Save, RefreshCw, Database, Award, Shield, CheckCircle2, AlertTriangle, Cloud, ArrowUpRight, Copy, Check } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { getActiveSupabaseUrl, getActiveSupabaseAnonKey, setRuntimeSupabaseConfig, testSupabaseConnection } from '../supabaseClient';

export const SettingsPage = () => {
  const { letterSettings, setLetterSettings, resetToFactoryData, syncStatus, lastSyncTime, syncError, isConfigured, syncLocalToCloud, migrationStatus, requests } = useData();
  const [form, setForm] = useState(letterSettings);
  const [savedNotice, setSavedNotice] = useState(false);

  // Supabase Settings Form State
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [sqlCopied, setSqlCopied] = useState(false);

  useEffect(() => {
    setSupabaseUrl(getActiveSupabaseUrl() || '');
    setSupabaseKey(getActiveSupabaseAnonKey() || '');
  }, []);

  const handleSaveLetterhead = (e) => {
    e.preventDefault();
    setLetterSettings(form);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    const res = await testSupabaseConnection(supabaseUrl, supabaseKey);
    setTestResult(res);
    setTestingConnection(false);
  };

  const handleSaveSupabaseConfig = (e) => {
    e.preventDefault();
    const configured = setRuntimeSupabaseConfig(supabaseUrl, supabaseKey);
    if (configured) {
      alert('Supabase project configuration saved and active! Real-time cloud sync enabled.');
    } else {
      alert('Supabase settings updated. Operating in Local State mode.');
    }
  };

  const handleMigrate = async () => {
    const res = await syncLocalToCloud();
    if (res.ok) {
      alert(`Success! ${res.migratedCount} local requests uploaded to Supabase. Cross-device sync is now active.`);
    } else {
      alert(`Migration error: ${res.message}`);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all operational data back to the clean initial master data and Section 8 historical examples?')) {
      resetToFactoryData();
      alert('Data reset to factory state successfully.');
    }
  };

  const SQL_MIGRATION_SNIPPET = `-- Run this in Supabase SQL Editor -> New Query
-- Full Migration File: supabase/migrations/20261005000001_complete_auth_rls_and_team.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure Realtime Publications
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests, public.request_items, public.quotations, public.quotation_items, public.approvals, public.approval_letters, public.work_records, public.bills, public.documents, public.institutes, public.agencies, public.approval_authorities, public.team_members, public.audit_logs;`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SQL_MIGRATION_SNIPPET);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 3000);
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">System Settings & Cloud Sync Configuration</h1>
          <div className="page-subheading">
            Manage Supabase shared cloud database credentials, cross-device sync, and university letterhead branding.
          </div>
        </div>
      </div>

      {savedNotice && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} />
          <span>Letterhead settings updated and saved successfully.</span>
        </div>
      )}

      {/* Cloud Sync & Supabase Configuration Card */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-title">
            <Cloud size={18} color="#2563eb" />
            <span>Shared Cloud Database (Supabase PostgreSQL)</span>
          </div>
          <span className={`badge ${isConfigured ? (syncStatus === 'synced' ? 'badge-approved' : syncStatus === 'error' ? 'badge-rejected' : 'badge-warning') : 'badge-info'}`}>
            {isConfigured ? (syncStatus === 'synced' ? '● Cloud Synced' : syncStatus === 'error' ? '● Sync Error' : '● Syncing...') : '○ Local Storage Engine Active'}
          </span>
        </div>
        <div className="card-body">
          <p style={{ fontSize: 13, color: '#475569', marginBottom: 14 }}>
            To synchronize requests, approvals, and quotations across laptops, mobile phones, and tablets in real-time, connect your production Supabase database below.
          </p>

          <form onSubmit={handleSaveSupabaseConfig}>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">
                Supabase Project URL <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="url"
                className="form-control"
                placeholder="https://your-project-id.supabase.co"
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <span className="form-hint">Obtain from your Supabase Dashboard -&gt; Project Settings -&gt; API -&gt; Project URL</span>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">
                Supabase Anon / Public Key <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseKey}
                onChange={e => setSupabaseKey(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <span className="form-hint">Obtain from Supabase Dashboard -&gt; Project Settings -&gt; API -&gt; Project API keys -&gt; anon public</span>
            </div>

            {testResult && (
              <div className={`alert ${testResult.ok ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: 14 }}>
                {testResult.ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <span>{testResult.message}</span>
              </div>
            )}

            {syncError && (
              <div className="alert alert-danger" style={{ marginBottom: 14 }}>
                <AlertTriangle size={16} />
                <span>Sync Error: {syncError}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-secondary" onClick={handleTestConnection} disabled={testingConnection}>
                <RefreshCw size={14} className={testingConnection ? 'spin-animation' : ''} />
                <span>{testingConnection ? 'Testing...' : 'Test Connection'}</span>
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={14} />
                <span>Save & Connect Database</span>
              </button>
            </div>
          </form>

          {/* Local-to-Cloud Migration Section */}
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Database size={16} color="#2563eb" />
              <span>Safe Migration of Local Laptop Requests</span>
            </h4>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
              If you created requests on your laptop before connecting Supabase, click below to safely upload them to the shared cloud database so they appear on mobile and all other devices.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleMigrate}
                disabled={!isConfigured || migrationStatus.migrating}
                style={{ borderColor: '#2563eb', color: '#2563eb' }}
              >
                <ArrowUpRight size={14} />
                <span>{migrationStatus.migrating ? 'Uploading...' : `Migrate ${requests.length} Requests to Cloud`}</span>
              </button>
              {migrationStatus.message && (
                <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                  {migrationStatus.message}
                </span>
              )}
            </div>
          </div>

          {/* Realtime SQL Configuration Guide */}
          <div style={{ marginTop: 20, padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: '#334155' }}>
                Required Supabase Realtime & RLS SQL Query:
              </span>
              <button className="btn btn-secondary btn-sm" onClick={copySqlToClipboard}>
                {sqlCopied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                <span>{sqlCopied ? 'Copied!' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre style={{ margin: 0, fontSize: 11, background: '#0f172a', color: '#f8fafc', padding: 10, borderRadius: 6, overflowX: 'auto' }}>
              {SQL_MIGRATION_SNIPPET}
            </pre>
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
        <form onSubmit={handleSaveLetterhead}>
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
