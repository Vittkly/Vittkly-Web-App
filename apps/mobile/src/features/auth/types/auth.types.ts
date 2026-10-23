/**
 * Tipos de dominio para el módulo de Autenticación y Acceso (Entregable 1).
 * Alineados con la arquitectura Multi-Tenant de Vittkly SaaS.
 */

export type MembershipRole = 'owner' | 'admin' | 'member';

export type AccessScope = 'app' | 'web' | 'both';

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled';

export type BiometricType = 'none' | 'fingerprint' | 'facial' | 'iris';

export type AuthStatus =
  'loading' | 'unauthenticated' | 'offline_locked' | 'offline_authenticated' | 'logged_in';

/**
 * Perfil del usuario autenticado (mapeado de public.profiles).
 */
export interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  avatarUrl?: string | null;
  updatedAt?: string;
}

/**
 * Organización / Tenant al que pertenece el usuario (public.organizations + public.memberships + mi_contexto()).
 */
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  role: MembershipRole;
  jobTitle?: string | null;
  accessScope: AccessScope;
  subscriptionStatus?: SubscriptionStatus;
  stdKey?: string | null;
  canViewPrices?: boolean;
  validaServicios?: boolean;
  activeModules?: string[];
}

/**
 * Estado del PIN de seguridad local para operación en campo y modo offline.
 */
export interface PinState {
  isConfigured: boolean;
  isLocked: boolean;
  failedAttempts: number;
  lockedUntil: number | null;
}

/**
 * Estado global de autenticación y conectividad provisto por AuthContext.
 */
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

/**
 * Payload para hidratar o establecer una nueva sesión autenticada.
 */
export interface SetSessionPayload {
  token: string;
  user: UserProfile;
  tenants?: Tenant[];
  activeOrganizationId?: string | null;
}

/**
 * Datos iniciales recuperados desde el almacenamiento seguro durante el arranque.
 */
export interface AuthBootstrapData {
  sessionToken: string | null;
  pinHash: string | null;
  activeOrganizationId: string | null;
  lastActiveTenantId?: string | null;
  user: UserProfile | null;
  tenants: Tenant[];
  isBiometricEnabled: boolean;
  pinFailedAttempts: number;
  pinLockedUntil: number | null;
}

/**
 * Credenciales de inicio de sesión con correo y contraseña.
 */
export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

/**
 * Datos para registro de nueva cuenta de usuario (Flujo de 2 pasos).
 */
export interface SignUpParams {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  companyName?: string;
  businessActivity?: string;
  city?: string;
  whatsapp?: string;
}

/**
 * Parámetros para verificación de código OTP por SMS o WhatsApp.
 */
export interface VerifyOtpParams {
  phone: string;
  token: string;
}

export type OtpFlowType = 'phone' | 'signup' | 'recovery';

export interface SignUpWithEmailResult {
  requiresEmailConfirmation: boolean;
  email: string;
  session: AuthSessionResult | null;
}

/**
 * Resultado de sesión autenticada devuelto por authService.
 */
export interface AuthSessionResult {
  accessToken: string;
  refreshToken?: string;
  user: UserProfile;
  /** Hash del PIN recuperado de `user_metadata.pin_hash` (nube), si existe. */
  pinHash?: string | null;
  /** Indica si el usuario tiene el acceso rápido por PIN habilitado en la nube. */
  pinEnabled?: boolean;
}

/**
 * Información de una invitación corporativa validada mediante código VK-XXXX.
 */
export interface InvitationValidationResult {
  isValid: boolean;
  code: string;
  organizationId: string | null;
  organizationName: string | null;
  organizationSlug: string | null;
  role: MembershipRole;
  jobTitle: string | null;
  invitedName?: string | null;
  invitedEmail: string | null;
  invitedPhone: string | null;
  expiresAt: string | null;
  errorMessage?: string | null;
}
