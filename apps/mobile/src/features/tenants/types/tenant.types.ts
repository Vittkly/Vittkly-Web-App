import type {
  AccessScope,
  MembershipRole,
  SubscriptionStatus,
} from '@/features/auth/types/auth.types';

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  logoUrl?: string | null;
  role?: MembershipRole | string;
  roleName?: string | null;
  jobTitle?: string | null;
  accessScope?: AccessScope;
  subscriptionStatus?: SubscriptionStatus;
  canViewPrices?: boolean;
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
