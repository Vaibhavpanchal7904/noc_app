import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_USERS } from '../data/initialData';

export const Login = () => {
  const { login, switchDemoUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@cvm.gov.in');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (user) => {
    switchDemoUser(user);
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: 20 }}>
      <div style={{ maxWidth: 460, width: '100%', background: '#ffffff', borderRadius: 12, padding: 36, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, background: '#2563eb', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 20, margin: '0 auto 12px auto' }}>
            NOC
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Charutar Vidya Mandal (CVM & CVMU)</h2>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            NOC Approval & Quotation Management System
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Internal University Email</label>
            <div className="search-input-wrapper">
              <Mail size={16} className="search-icon" />
              <input
                type="email"
                className="form-control search-input"
                placeholder="e.g. staff@cvm.gov.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="search-input-wrapper">
              <Lock size={16} className="search-icon" />
              <input
                type="password"
                className="form-control search-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Internal System'}
          </button>
        </form>

        {/* Quick Demo Access Roles */}
        <div style={{ marginTop: 28, borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 10, textAlign: 'center' }}>
            Instant Testing & Evaluation Access
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
                  textAlign: 'left'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.full_name}</div>
                  <div style={{ color: '#64748b', fontSize: 11 }}>{u.role.replace('_', ' ').toUpperCase()}</div>
                </div>
                <ArrowRight size={14} color="#2563eb" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
