export type AuthStatus =
  'loading' | 'unauthenticated' | 'logged_in' | 'offline_locked' | 'offline_authenticated';

export type MembershipRole = 'owner' | 'admin' | 'member';

export type AccessScope = 'web' | 'app' | 'both';

export type OtpFlowType = 'phone' | 'recovery';

export type BiometricType = 'facial' | 'fingerprint' | 'iris' | 'none';

/**
 * Perfil del usuario autenticado mapeado desde `public.usuarios` y metadatos de Supabase Auth.
 */
export interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  avatarUrl?: string | null;
  ultimaEmpresaId?: string | null;
}

/**
 * Empresa / Membresía móvil activa mapeada desde `mis_accesos()`,
 * `public.membresias`, `public.empresas`, `public.perfiles` y `public.perfil_permisos`.
 */
export interface Tenant {
  id: string;
  membresiaId?: string;
  name: string;
  razonSocial?: string;
  slug: string;
  rubro?: string | null;
  ciudad?: string | null;
  logoUrl?: string | null;
  menuIconUrl?: string | null;
  brandColor?: string | null;
  modeloOperacion?: string | null;
  role: MembershipRole;
  esPropietario?: boolean;
  perfilId?: string | null;
  perfilCodigo?: string | null;
  perfilNombre?: string | null;
  jobTitle?: string | null;
  accessScope: AccessScope;
  accesoWeb?: boolean;
  accesoApp?: boolean;
  canViewPrices?: boolean;
  validaServicios?: boolean;
  canRegisterPayments?: boolean;
  permisos?: string[];
  activeModules?: string[];
  stdKey?: string | null;
}

export type EmpresaAcceso = Tenant;

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface SignInWithOtpParams {
  phone: string;
}

export interface VerifyOtpParams {
  phone: string;
  token: string;
}

export interface AuthSessionResult {
  token: string;
  user: UserProfile;
  tenants: Tenant[];
  hasCloudPin?: boolean;
  cloudPinHash?: string | null;
}

export interface LoginResult {
  user: UserProfile;
  tenants: Tenant[];
  hasPin: boolean;
  activeOrganizationId: string | null;
  needsTenantSelection: boolean;
}

export interface SetSessionPayload {
  token: string;
  user: UserProfile;
  tenants?: Tenant[];
  activeOrganizationId?: string | null;
}

export type SetSessionParams = SetSessionPayload;

export interface PinState {
  isConfigured: boolean;
  isLocked: boolean;
  failedAttempts: number;
  lockedUntil: number | null;
}

export interface AuthState {
  status: AuthStatus;
  isLoading: boolean;
  isOffline: boolean;
  isLoggedIn: boolean;
  sessionToken: string | null;
  user: UserProfile | null;
  tenants: Tenant[];
  activeOrganizationId: string | null;
  activeTenant: Tenant | null;
  lastActiveTenantId: string | null;
  pin: PinState;
  biometricType: BiometricType;
  isBiometricEnabled: boolean;
}

export interface PinAttemptsRecord {
  failedAttempts: number;
  lockedUntil: number | null;
}

export interface AuthBootstrapData {
  sessionToken: string | null;
  pinHash: string | null;
  activeOrganizationId: string | null;
  lastActiveTenantId: string | null;
  user: UserProfile | null;
  tenants: Tenant[];
  isBiometricEnabled: boolean;
  pinFailedAttempts: number;
  pinLockedUntil: number | null;
}
