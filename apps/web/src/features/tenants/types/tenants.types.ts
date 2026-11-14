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
  totalActiveCount: number;
  lastOrganizationId: string | null;
}

export interface SolicitudSalidaInfo {
  id: string;
  estado: string;
  motivo: string | null;
  soporte_desde: string;
  puede_pedir_soporte: boolean;
  creado_en: string;
}

export interface MisAccesosEmpresa {
  membresia_id: string;
  empresa_id: string;
  nombre: string;
  rubro: string;
  ciudad: string;
  perfil_id: string;
  perfil_nombre: string;
  perfil_codigo: string;
  es_propietario: boolean;
  acceso_web: boolean;
  acceso_app: boolean;
  solicitud_salida?: SolicitudSalidaInfo | null;
}

export interface MisAccesosInvitacion {
  id: string;
  empresa_id: string;
  empresa_nombre: string;
  perfil_id: string;
  perfil_nombre: string;
  invitador_nombre: string;
  acceso_web: boolean;
  acceso_app: boolean;
  vence_en: string;
  creado_en: string;
}

export interface CuentaActualInfo {
  cuenta_id: string;
  cuenta_nombre: string;
  plan_codigo: string;
  plan_nombre: string;
  precio_mensual_centimos: number;
  empresa_actual_nombre: string | null;
}

export interface MisAccesosUsuario {
  id: string;
  nombre: string;
  correo: string | null;
  ultima_empresa_id: string | null;
  prueba_usada_en: string | null;
}

export interface MisAccesosData {
  usuario: MisAccesosUsuario;
  cuenta_actual: CuentaActualInfo | null;
  empresas_propias: MisAccesosEmpresa[];
  empresas_miembro: MisAccesosEmpresa[];
  invitaciones: MisAccesosInvitacion[];
}
