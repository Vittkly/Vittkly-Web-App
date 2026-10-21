import type { InvitationValidationResult, Tenant } from '../types/auth.types';
import { formatInvitationCode, invitationService } from './invitation.service';
import { sanitizeNetworkError } from './network-error';
import { tenantRepository } from './tenant.repository';

export { formatInvitationCode, sanitizeNetworkError, tenantRepository, invitationService };

/**
 * Servicio de Organizaciones y Permisos Multi-Tenant (Fachada unificada).
 */
export const tenantService = {
  fetchUserTenants(userId?: string): Promise<Tenant[]> {
    return tenantRepository.fetchUserTenants(userId);
  },

  validateInvitationCode(rawCode: string): Promise<InvitationValidationResult> {
    return invitationService.validateInvitationCode(rawCode);
  },

  redeemInvitationCode(rawCode: string): Promise<InvitationValidationResult> {
    return invitationService.redeemInvitationCode(rawCode);
  },
};
