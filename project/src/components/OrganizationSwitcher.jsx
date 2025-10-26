import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const OrganizationSwitcher = () => {
  const { currentOrganization, setOrganization } = useAuth();

  const handleSwitch = () => {
    const newOrg = currentOrganization?.id === 'org1'
      ? { id: 'org2', name: 'Organization 2' }
      : { id: 'org1', name: 'Organization 1' };
    setOrganization(newOrg);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Current Organization</h3>
      <p>ID: {currentOrganization?.id || 'None'}</p>
      <p>Name: {currentOrganization?.name || 'None'}</p>
      <button onClick={handleSwitch}>Switch Organization</button>
    </div>
  );
};

export default OrganizationSwitcher;