import React from 'react';

export const StatusBadge = ({ status, type = 'status' }) => {
  if (!status) return null;

  if (type === 'org') {
    const isCvmu = status === 'CVMU' || status === 'org-cvmu';
    return (
      <span className={`badge ${isCvmu ? 'badge-cvmu' : 'badge-cvm'}`}>
        {isCvmu ? 'CVMU' : 'CVM'}
      </span>
    );
  }

  let badgeClass = 'badge-pending';
  const s = String(status).toLowerCase();

  if (s.includes('approved') || s.includes('completed') || s.includes('done') || s.includes('signed') || s.includes('dispatched')) {
    badgeClass = 'badge-approved';
  } else if (s.includes('reject') || s.includes('cancelled')) {
    badgeClass = 'badge-rejected';
  } else if (s.includes('progress') || s.includes('quotation') || s.includes('submitted')) {
    badgeClass = 'badge-info';
  } else if (s.includes('awaiting') || s.includes('pending') || s.includes('clarification') || s.includes('hold')) {
    badgeClass = 'badge-warning';
  } else if (s.includes('closed')) {
    badgeClass = 'badge-closed';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {status}
    </span>
  );
};
