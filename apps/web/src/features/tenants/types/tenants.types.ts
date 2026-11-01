/** Cookie httpOnly con la empresa de trabajo actual (se valida siempre contra las membresías). */
export const ACTIVE_ORG_COOKIE = "vittkly_active_org_id";
/** Cookie con la última empresa usada; sobrevive al cierre de sesión para recordar la preferencia. */
export const LAST_ORG_COOKIE = "vittkly_last_org_id";

export interface UserOrganization {
  id: string;
  name: string;
  roleName: string;
  isOwner: boolean;
}

export interface OrganizationOptions {
  userId: string | null;
  organizations: UserOrganization[];
  lastOrganizationId: string | null;
}
