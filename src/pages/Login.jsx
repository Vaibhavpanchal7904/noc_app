import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Shield, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_USERS } from '../data/initialData';

export const Login = () => {
  const { login, switchDemoUser, isAuthenticated, isConfigured, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to target page
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please enter your university email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectRole = (user) => {
    switchDemoUser(user);
    navigate(from, { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at top, #1e293b, #0f172a)', padding: 20 }}>
      <div style={{ maxWidth: 460, width: '100%', background: '#ffffff', borderRadius: 16, padding: '36px 32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', border: '1px solid #e2e8f0' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 22, margin: '0 auto 14px auto', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
            NOC
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>Charutar Vidya Mandal (CVM & CVMU)</h2>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 }}>
            NOC Approval & Quotation Management System
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, borderRadius: 8 }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Internal University Email</label>
            <div className="search-input-wrapper">
              <Mail size={16} className="search-icon" color="#94a3b8" />
              <input
                type="email"
                className="form-control search-input"
                placeholder="e.g. admin@cvm.gov.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Password</label>
            <div className="search-input-wrapper">
              <Lock size={16} className="search-icon" color="#94a3b8" />
              <input
                type="password"
                className="form-control search-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600, borderRadius: 8, padding: '12px' }}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <RefreshCw size={16} className="spin-animation" />
                <span>Authenticating with Cloud...</span>
              </>
            ) : (
              <span>Sign In to NOC Portal</span>
            )}
          </button>
        </form>

        {/* Quick Demo Access Roles for offline / development testing */}
        {!isConfigured && (
          <div style={{ marginTop: 26, borderTop: '1px solid #f1f5f9', paddingTop: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 10, textAlign: 'center', letterSpacing: '0.5px' }}>
              Instant Demo Access Roles
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {DEFAULT_USERS.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectRole(u)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    fontSize: 12,
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.full_name}</div>
                    <div style={{ color: '#64748b', fontSize: 11 }}>{u.email} ({u.role.replace('_', ' ').toUpperCase()})</div>
                  </div>
                  <ArrowRight size={14} color="#2563eb" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

