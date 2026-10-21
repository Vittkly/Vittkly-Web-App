/**
 * Obtiene las iniciales de 1 o 2 letras para nombres de usuario u organizaciones.
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
  if (lower.includes('tech') || lower.includes('tecnic')) return 'Técnico de campo';
  if (lower.includes('coord')) return 'Coordinador';
  return roleName;
}

/**
 * Formatea el subtítulo corporativo (Rol · Organización).
 */
export function formatTenantSubtitle(roleName?: string | null, tenantName?: string | null): string {
  const role = getRoleLabel(roleName);
  if (!tenantName) return role;
  return `${role} · ${tenantName}`;
}
