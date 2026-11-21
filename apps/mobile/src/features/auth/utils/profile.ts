import type { MembershipRole } from '../types/auth.types';

/**
 * Obtiene las iniciales de 1 o 2 letras para nombres de usuario o empresas.
 */
export function getInitials(name?: string | null): string {
  const cleaned = (name ?? '').trim();
  if (!cleaned) {
    return 'VK';
  }
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}

/**
 * Normaliza etiquetas de roles de usuario para visualización amigable.
 */
export function getRoleLabel(roleName?: string | null): string {
  if (!roleName) return 'Usuario';
  const lower = roleName.toLowerCase();
  if (lower.includes('admin')) return 'Administrador';
  if (lower.includes('tech') || lower.includes('tecnic') || lower.includes('técnic')) {
    return 'Técnico de campo';
  }
  if (lower.includes('coord')) return 'Coordinador';
  return roleName;
}

/**
 * Formatea el rol visible para una empresa/membresía usando `cargo`, `perfilNombre`, `esPropietario` o `role`.
 */
export function formatMembershipRoleLabel(options: {
  role?: MembershipRole | string;
  jobTitle?: string | null;
  perfilNombre?: string | null;
  esPropietario?: boolean;
}): string {
  const { role, jobTitle, perfilNombre, esPropietario } = options;
  if (jobTitle && jobTitle.trim().length > 0) return jobTitle.trim();
  if (perfilNombre && perfilNombre.trim().length > 0) return perfilNombre.trim();
  if (esPropietario || role === 'owner') return 'Titular de Empresa';
  if (role === 'admin') return 'Supervisor';
  return 'Técnico de campo';
}

/**
 * Formatea el subtítulo corporativo (`Rol · Empresa`).
 */
export function formatTenantSubtitle(roleName?: string | null, tenantName?: string | null): string {
  const role = getRoleLabel(roleName);
  if (!tenantName) return role;
  return `${role} · ${tenantName}`;
}
