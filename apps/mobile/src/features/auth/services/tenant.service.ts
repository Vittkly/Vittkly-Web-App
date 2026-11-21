import type { Tenant } from '../types/auth.types';
import { sanitizeNetworkError } from './network-error';
import { tenantRepository } from './tenant.repository';

export { sanitizeNetworkError, tenantRepository };

/**
 * Servicio de acceso multi-empresa para la app móvil.
 * Opera sobre el esquema canónico Etapa 0 (`mis_accesos`, `membresias`, `empresas`, `perfiles`).
 */
export const tenantService = {
  async fetchUserTenants(userId: string): Promise<Tenant[]> {
    return tenantRepository.fetchUserTenants(userId);
  },
};
