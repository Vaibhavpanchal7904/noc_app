import React, { useState } from 'react';
import { Menu, Search, RefreshCw, Shield, Check, Database, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { DEFAULT_USERS } from '../data/initialData';
import { useNavigate } from 'react-router-dom';

export const Header = ({ onToggleSidebar }) => {
  const { currentUser, switchDemoUser, isConfigured } = useAuth();
  const { resetToFactoryData, requests, syncStatus, refetchData } = useData();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length > 1) {
      const qLower = q.toLowerCase();
      const res = requests.filter(r => 
        r.request_no.toLowerCase().includes(qLower) ||
        r.title.toLowerCase().includes(qLower) ||
        (r.clg_out_no && r.clg_out_no.toLowerCase().includes(qLower)) ||
        (r.clg_in_no && r.clg_in_no.toLowerCase().includes(qLower))
      );
      setSearchResults(res.slice(0, 6));
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectResult = (reqId) => {
    setShowSearchModal(false);
    setSearchQuery('');
    navigate(`/requests/${reqId}`);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all operational data back to the clean initial master data and Section 8 historical examples?')) {
      resetToFactoryData();
      alert('Data reset to factory state successfully.');
    }
  };

  const handleSyncClick = () => {
    if (isConfigured) {
      refetchData();
    } else {
      // Local sync
      const saved = localStorage.getItem('noc_requests');
      if (saved) {
        alert(`Local state active: ${requests.length} total requests in storage.`);
      }
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          <button 
            className="btn-icon header-menu-toggle" 
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            title="Toggle Menu"
          >
            <Menu size={20} />
          </button>
          
          {/* Desktop Search Input Box */}
          <div 
            className="search-input-wrapper header-search-desktop"
            style={{ maxWidth: 280, cursor: 'pointer' }}
            onClick={() => setShowSearchModal(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setShowSearchModal(true)}
            aria-label="Open search dialog"
          >
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="form-control search-input"
              placeholder="Quick search cases..."
              readOnly
              tabIndex={-1}
            />
          </div>

          {/* Mobile Search Icon Button */}
          <button
            className="btn-icon header-search-mobile"
            onClick={() => setShowSearchModal(true)}
            aria-label="Search requests and cases"
            title="Search"
          >
            <Search size={18} />
          </button>
        </div>

        <div className="header-right">
          {/* Connection & Sync Status Badge */}
          <button 
            className="badge header-status-badge"
            onClick={handleSyncClick}
            style={{ 
              backgroundColor: isConfigured ? (syncStatus === 'synced' ? '#dcfce7' : syncStatus === 'syncing' ? '#e0f2fe' : '#fee2e2') : '#f1f5f9',
              color: isConfigured ? (syncStatus === 'synced' ? '#166534' : syncStatus === 'syncing' ? '#0369a1' : '#991b1b') : '#475569',
              border: '1px solid ' + (isConfigured ? (syncStatus === 'synced' ? '#bbf7d0' : syncStatus === 'syncing' ? '#bae6fd' : '#fecaca') : '#cbd5e1'),
              fontSize: '11px',
              padding: '5px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
            title={isConfigured ? `Cloud Database: ${syncStatus}. Click to refresh.` : 'Running in local state mode with full offline persistence.'}
          >
            {isConfigured ? (
              syncStatus === 'syncing' ? (
                <RefreshCw size={12} className="spin-animation" style={{ marginRight: 2 }} />
              ) : syncStatus === 'error' ? (
                <AlertTriangle size={12} style={{ marginRight: 2 }} />
              ) : (
                <Database size={12} style={{ marginRight: 2 }} />
              )
            ) : (
              <Database size={12} style={{ marginRight: 2 }} />
            )}
            <span className="header-badge-text">
              {isConfigured 
                ? (syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'error' ? 'Sync Error' : 'Cloud Synced') 
                : 'Local Engine'}
            </span>
          </button>

          {/* Force Sync / Refetch Button */}
          <button 
            className="btn btn-secondary btn-sm header-reset-btn"
            onClick={() => refetchData()}
            aria-label="Sync and refresh data"
            title="Force refresh data from database"
          >
            <RefreshCw size={14} className={syncStatus === 'syncing' ? 'spin-animation' : ''} />
            <span className="header-btn-text">Sync Data</span>
          </button>

          {/* Quick Reset Button for testing */}
          <button 
            className="btn btn-secondary btn-sm header-reset-btn"
            onClick={handleResetData}
            aria-label="Reset demo and sample data"
            title="Reset master & sample demo data"
          >
            <span className="header-btn-text">Reset Demo</span>
          </button>

          {/* Role & User Switcher */}
          <div style={{ position: 'relative' }}>
            <button 
              className="btn btn-secondary btn-sm header-user-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="Switch user role"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Shield size={14} color="#2563eb" />
              <span className="header-user-name" style={{ fontWeight: 600 }}>{currentUser?.full_name?.split(' ')[0]}</span>
              <span className="header-user-role" style={{ fontSize: 11, color: '#64748b' }}>({currentUser?.role?.replace('_', ' ')})</span>
            </button>

            {showUserMenu && (
              <div 
                className="user-menu-popover"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: 6,
                  width: 'min(280px, calc(100vw - 32px))',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  padding: 8
                }}
              >
                <div style={{ padding: '6px 10px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Switch Test Role / Identity
                </div>
                {DEFAULT_USERS.map(u => (
                  <div
                    key={u.id}
                    onClick={() => {
                      switchDemoUser(u);
                      setShowUserMenu(false);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: currentUser?.id === u.id ? '#eff6ff' : 'transparent',
                      color: currentUser?.id === u.id ? '#2563eb' : '#0f172a'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{u.full_name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{u.email} ({u.role})</div>
                    </div>
                    {currentUser?.id === u.id && <Check size={16} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      {showSearchModal && (
        <div className="modal-backdrop" onClick={() => setShowSearchModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 550 }}>
            <div className="modal-header">
              <div className="modal-title">Global Quick Search</div>
              <button className="btn-icon" onClick={() => setShowSearchModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="search-input-wrapper" style={{ marginBottom: 16 }}>
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  autoFocus
                  className="form-control search-input"
                  placeholder="Type request number, subject, inward/outward no..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

              <div>
                {searchResults.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {searchResults.map(r => (
                      <div
                        key={r.id}
                        onClick={() => handleSelectResult(r.id)}
                        style={{
                          padding: '10px 12px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 6,
                          cursor: 'pointer',
                          background: '#ffffff'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, color: '#2563eb' }}>{r.request_no}</span>
                          <span style={{ fontSize: 12, color: '#64748b' }}>{r.request_date}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{r.title}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  searchQuery.length > 1 && (
                    <div className="empty-state" style={{ padding: '20px 0' }}>
                      No matching requests found for "{searchQuery}".
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
