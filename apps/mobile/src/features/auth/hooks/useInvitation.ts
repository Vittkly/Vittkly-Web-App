import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { formatInvitationCode, tenantService } from '../services/tenant.service';
import type { InvitationValidationResult } from '../types/auth.types';

export interface UseInvitationReturn {
  code: string;
  validationResult: InvitationValidationResult | null;
  isValidating: boolean;
  isRedeeming: boolean;
  error: string | null;
  handleCodeChange: (rawCode: string) => void;
  validateCode: (codeOverride?: string) => Promise<InvitationValidationResult>;
  redeemCode: (codeOverride?: string) => Promise<InvitationValidationResult>;
  resetInvitation: () => void;
}

/**
 * Hook de estado y mutaciones (`@tanstack/react-query`) para validar y canjear códigos de invitación `VK-XXXX`.
 */
export function useInvitation(initialCode = ''): UseInvitationReturn {
  const [code, setCode] = useState<string>(() =>
    initialCode ? formatInvitationCode(initialCode) : '',
  );
  const [validationResult, setValidationResult] = useState<InvitationValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateMutation = useMutation({
    mutationFn: async (targetCode: string) => {
      return tenantService.validateInvitationCode(targetCode);
    },
    onSuccess: result => {
      setValidationResult(result);
      if (!result.isValid) {
        setError(result.errorMessage ?? 'Código de invitación inválido.');
      } else {
        setError(null);
      }
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : 'No se pudo validar el código de invitación.';
      setError(msg);
      setValidationResult(null);
    },
  });

  const redeemMutation = useMutation({
    mutationFn: async (targetCode: string) => {
      return tenantService.redeemInvitationCode(targetCode);
    },
    onSuccess: result => {
      setValidationResult(result);
      if (!result.isValid) {
        setError(result.errorMessage ?? 'No se pudo canjear el código de invitación.');
      } else {
        setError(null);
      }
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : 'No se pudo canjear el código de invitación.';
      setError(msg);
    },
  });

  const handleCodeChange = useCallback((rawCode: string) => {
    setError(null);
    setValidationResult(null);
    setCode(formatInvitationCode(rawCode));
  }, []);

  const validateCode = useCallback(
    async (codeOverride?: string): Promise<InvitationValidationResult> => {
      const target = formatInvitationCode(codeOverride ?? code);
      setCode(target);
      return validateMutation.mutateAsync(target);
    },
    [code, validateMutation],
  );

  const redeemCode = useCallback(
    async (codeOverride?: string): Promise<InvitationValidationResult> => {
      const target = formatInvitationCode(codeOverride ?? code);
      setCode(target);
      return redeemMutation.mutateAsync(target);
    },
    [code, redeemMutation],
  );

  const resetInvitation = useCallback(() => {
    setCode('');
    setValidationResult(null);
    setError(null);
    validateMutation.reset();
    redeemMutation.reset();
  }, [redeemMutation, validateMutation]);

  return {
    code,
    validationResult,
    isValidating: validateMutation.isPending,
    isRedeeming: redeemMutation.isPending,
    error,
    handleCodeChange,
    validateCode,
    redeemCode,
    resetInvitation,
  };
}
