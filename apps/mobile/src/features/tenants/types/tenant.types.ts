import type { AccessScope, MembershipRole } from '@/features/auth/types/auth.types';

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  rubro?: string | null;
  ciudad?: string | null;
  logoUrl?: string | null;
  menuIconUrl?: string | null;
  brandColor?: string | null;
  role?: MembershipRole | string;
  roleName?: string | null;
  perfilNombre?: string | null;
  esPropietario?: boolean;
  jobTitle?: string | null;
  accessScope?: AccessScope;
  canViewPrices?: boolean;
  validaServicios?: boolean;
  canRegisterPayments?: boolean;
  permisos?: string[];
  activeModules?: string[];
}

export interface OrgStoreState {
  activeOrg: Organization | null;
  organizations: Organization[];
  lastOrgId: string | null;
  setActiveOrg: (org: Organization | null) => void;
  setOrganizations: (organizations: Organization[]) => void;
  setLastOrgId: (id: string | null) => void;
  switchOrg: (orgId: string) => Promise<void>;
  reset: () => void;
}
