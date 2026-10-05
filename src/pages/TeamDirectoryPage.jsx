import React, { useState } from 'react';
import { Users, UserPlus, Shield, Phone, Mail, CheckCircle2, Search, Filter, Briefcase, Wrench, Edit3, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export const TeamDirectoryPage = () => {
  const { teamMembers = [], addTeamMember, updateTeamMember, deleteTeamMember } = useData();
  const { permissions, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'NOC Team' | 'Elecon Engineers'
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    team: 'NOC Team',
    role: '',
    email: '',
    phone: '',
    is_active: true
  });

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData({
      full_name: '',
      team: activeTab === 'Elecon Engineers' ? 'Elecon Engineers' : 'NOC Team',
      role: '',
      email: '',
      phone: '',
      is_active: true
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (member) => {
    setEditingMember(member);
    setFormData({
      full_name: member.full_name,
      team: member.team || 'NOC Team',
      role: member.role || '',
      email: member.email || '',
      phone: member.phone || '',
      is_active: member.is_active !== false
    });
    setShowModal(true);
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      alert('Please provide the member full name.');
      return;
    }

    if (editingMember) {
      if (updateTeamMember) {
        await updateTeamMember(editingMember.id, {
          full_name: formData.full_name.trim(),
          team: formData.team,
          role: formData.role.trim() || null,
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          is_active: formData.is_active
        });
      }
    } else {
      if (addTeamMember) {
        await addTeamMember({
          full_name: formData.full_name.trim(),
          team: formData.team,
          role: formData.role.trim() || null,
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          is_active: formData.is_active
        });
      }
    }

    setShowModal(false);
  };

  const handleDeleteMember = async (memberId, memberName) => {
    if (window.confirm(`Are you sure you want to remove "${memberName}" from the team directory?`)) {
      if (deleteTeamMember) {
        await deleteTeamMember(memberId);
      }
    }
  };

  // Filtered members list
  const filteredMembers = teamMembers.filter(m => {
    const matchesTab = activeTab === 'ALL' || m.team === activeTab;
    const matchesSearch = !searchQuery.trim() ||
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.role && m.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.team && m.team.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const nocMembers = filteredMembers.filter(m => m.team === 'NOC Team');
  const eleconMembers = filteredMembers.filter(m => m.team === 'Elecon Engineers');
  const otherMembers = filteredMembers.filter(m => m.team !== 'NOC Team' && m.team !== 'Elecon Engineers');

  const totalNocCount = teamMembers.filter(m => m.team === 'NOC Team').length;
  const totalEleconCount = teamMembers.filter(m => m.team === 'Elecon Engineers').length;
  const totalActiveCount = teamMembers.filter(m => m.is_active !== false).length;

  return (
    <div className="team-directory-page">
      {/* Page Header */}
      <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={26} color="#2563eb" />
            <span>Team Directory & Engineering Roster</span>
          </h1>
          <div className="page-subheading" style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Official personnel directory for Central NOC Department and Elecon Project Engineers.
          </div>
        </div>

        {permissions.canManageTeam && (
          <button className="btn btn-primary" onClick={handleOpenAddModal} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={16} />
            <span>Add Team Member</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="stat-card" style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>Total Directory Personnel</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{teamMembers.length}</div>
          <div style={{ fontSize: 12, color: '#10b981', marginTop: 4, fontWeight: 600 }}>{totalActiveCount} Active in Service</div>
        </div>

        <div className="stat-card" style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: '4px solid #2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#2563eb', marginBottom: 6 }}>NOC Team Members</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#2563eb' }}>{totalNocCount}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Network & Hardware Management</div>
        </div>

        <div className="stat-card" style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: '4px solid #7c3aed', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#7c3aed', marginBottom: 6 }}>Elecon Engineers</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>{totalEleconCount}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Technical Execution & Integration</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 22, background: '#ffffff', padding: '12px 16px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('ALL')}
            style={{ borderRadius: 20, padding: '6px 14px' }}
          >
            All Personnel ({teamMembers.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'NOC Team' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('NOC Team')}
            style={{ borderRadius: 20, padding: '6px 14px', backgroundColor: activeTab === 'NOC Team' ? '#2563eb' : '' }}
          >
            NOC Team ({totalNocCount})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'Elecon Engineers' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('Elecon Engineers')}
            style={{ borderRadius: 20, padding: '6px 14px', backgroundColor: activeTab === 'Elecon Engineers' ? '#7c3aed' : '', borderColor: activeTab === 'Elecon Engineers' ? '#7c3aed' : '' }}
          >
            Elecon Engineers ({totalEleconCount})
          </button>
        </div>

        <div className="search-input-wrapper" style={{ maxWidth: 300, width: '100%' }}>
          <Search size={16} className="search-icon" color="#94a3b8" />
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search member name or title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Section 1: NOC Team */}
      {(activeTab === 'ALL' || activeTab === 'NOC Team') && nocMembers.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563eb' }} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              NOC Team ({nocMembers.length})
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {nocMembers.map(member => {
              const initials = member.full_name
                ? member.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                : 'TM';

              return (
                <div
                  key={member.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 16,
                          flexShrink: 0,
                          boxShadow: '0 2px 6px rgba(37,99,235,0.25)'
                        }}
                      >
                        {initials}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {member.full_name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              background: '#eff6ff',
                              color: '#2563eb',
                              padding: '2px 8px',
                              borderRadius: 12,
                              border: '1px solid #dbeafe'
                            }}
                          >
                            NOC Team
                          </span>
                          {member.role && (
                            <span style={{ fontSize: 12, color: '#64748b' }}>• {member.role}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact details rendered ONLY when provided */}
                    {(member.email || member.phone) && (
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {member.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#475569' }}>
                            <Mail size={14} color="#64748b" />
                            <span style={{ wordBreak: 'break-all' }}>{member.email}</span>
                          </div>
                        )}
                        {member.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#475569' }}>
                            <Phone size={14} color="#64748b" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 14 }}>
                    <span className={`badge ${member.is_active !== false ? 'badge-approved' : 'badge-rejected'}`} style={{ fontSize: 11 }}>
                      {member.is_active !== false ? 'Active' : 'Inactive'}
                    </span>

                    {permissions.canManageTeam && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn-icon"
                          style={{ padding: 5 }}
                          title="Edit member details"
                          onClick={() => handleOpenEditModal(member)}
                        >
                          <Edit3 size={14} color="#64748b" />
                        </button>
                        <button
                          className="btn-icon"
                          style={{ padding: 5 }}
                          title="Remove member"
                          onClick={() => handleDeleteMember(member.id, member.full_name)}
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 2: Elecon Engineers */}
      {(activeTab === 'ALL' || activeTab === 'Elecon Engineers') && eleconMembers.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7c3aed' }} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Elecon Engineers ({eleconMembers.length})
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {eleconMembers.map(member => {
              const initials = member.full_name
                ? member.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                : 'EE';

              return (
                <div
                  key={member.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(124,58,237,0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 16,
                          flexShrink: 0,
                          boxShadow: '0 2px 6px rgba(124,58,237,0.25)'
                        }}
                      >
                        {initials}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {member.full_name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              background: '#f5f3ff',
                              color: '#7c3aed',
                              padding: '2px 8px',
                              borderRadius: 12,
                              border: '1px solid #ede9fe'
                            }}
                          >
                            Elecon Engineers
                          </span>
                          {member.role && (
                            <span style={{ fontSize: 12, color: '#64748b' }}>• {member.role}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact details rendered ONLY when provided */}
                    {(member.email || member.phone) && (
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {member.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#475569' }}>
                            <Mail size={14} color="#64748b" />
                            <span style={{ wordBreak: 'break-all' }}>{member.email}</span>
                          </div>
                        )}
                        {member.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#475569' }}>
                            <Phone size={14} color="#64748b" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 14 }}>
                    <span className={`badge ${member.is_active !== false ? 'badge-approved' : 'badge-rejected'}`} style={{ fontSize: 11 }}>
                      {member.is_active !== false ? 'Active' : 'Inactive'}
                    </span>

                    {permissions.canManageTeam && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn-icon"
                          style={{ padding: 5 }}
                          title="Edit member details"
                          onClick={() => handleOpenEditModal(member)}
                        >
                          <Edit3 size={14} color="#64748b" />
                        </button>
                        <button
                          className="btn-icon"
                          style={{ padding: 5 }}
                          title="Remove member"
                          onClick={() => handleDeleteMember(member.id, member.full_name)}
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="empty-state" style={{ background: '#ffffff', padding: 48, borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Users size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>No matching team members found</h3>
          <p style={{ color: '#64748b', fontSize: 13 }}>Try adjusting your search criteria or filter tab.</p>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div className="modal-title">{editingMember ? 'Edit Team Member Details' : 'Add New Team Member'}</div>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveMember}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bharat Chauhan"
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Team / Group <span className="required">*</span></label>
                  <select
                    className="form-control"
                    value={formData.team}
                    onChange={e => setFormData({ ...formData, team: e.target.value })}
                    required
                  >
                    <option value="NOC Team">NOC Team</option>
                    <option value="Elecon Engineers">Elecon Engineers</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Role / Designation (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Senior Network Engineer"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Official Email (Optional)</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. bharat@cvm.gov.in"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="e.g. +91 98980 12345"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <input
                    type="checkbox"
                    id="member_active_toggle"
                    checked={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <label htmlFor="member_active_toggle" style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                    Active Team Member
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMember ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
