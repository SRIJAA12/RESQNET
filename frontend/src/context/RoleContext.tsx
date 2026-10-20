import React, { createContext, useContext, useState, useEffect } from 'react';
import { DemoUserRole, PartnerOrganization } from '../types';
import { api } from '../services/api';

interface RoleContextType {
  role: DemoUserRole;
  setRole: (role: DemoUserRole) => void;
  partnerOrg: string;
  setPartnerOrg: (org: string) => void;
  responderResourceId: string;
  setResponderResourceId: (id: string) => void;
  partnerOrgs: PartnerOrganization[];
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<DemoUserRole>(() => {
    return (localStorage.getItem('resqnet_demo_role') as DemoUserRole) || 'dispatcher';
  });

  const [partnerOrg, setPartnerOrgState] = useState<string>(() => {
    return localStorage.getItem('resqnet_demo_partner_org') || 'Red Cross Disaster Fleet & Supplies';
  });

  const [responderResourceId, setResponderResourceIdState] = useState<string>(() => {
    return localStorage.getItem('resqnet_demo_responder_res_id') || 'res-001';
  });

  const [partnerOrgs, setPartnerOrgs] = useState<PartnerOrganization[]>([]);

  useEffect(() => {
    api.getPartnerOrganizations().then(setPartnerOrgs).catch(console.error);
  }, []);

  const setRole = (newRole: DemoUserRole) => {
    setRoleState(newRole);
    localStorage.setItem('resqnet_demo_role', newRole);
  };

  const setPartnerOrg = (org: string) => {
    setPartnerOrgState(org);
    localStorage.setItem('resqnet_demo_partner_org', org);
  };

  const setResponderResourceId = (id: string) => {
    setResponderResourceIdState(id);
    localStorage.setItem('resqnet_demo_responder_res_id', id);
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        partnerOrg,
        setPartnerOrg,
        responderResourceId,
        setResponderResourceId,
        partnerOrgs,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return ctx;
};
