import { useEffect, useRef } from 'react';

import { useAuth } from '@/features/auth';

import { startNetworkSyncOrchestrator } from './network-sync.service';
import { syncOutboxService } from './sync-outbox.service';

/**
 * Componente sin UI montado en el layout raíz para activar el motor de sincronización
 * cuando hay sesión autenticada y una empresa activa seleccionada.
 */
export function OfflineSyncGate(): null {
  const { activeOrganizationId, sessionToken, isOffline } = useAuth();
  const orgRef = useRef<string | null>(activeOrganizationId);
  const sessionRef = useRef<boolean>(Boolean(sessionToken));

  useEffect(() => {
    orgRef.current = activeOrganizationId;
    sessionRef.current = Boolean(sessionToken);

    if (sessionToken && !isOffline && activeOrganizationId) {
      void syncOutboxService.flushOutbox(activeOrganizationId);
    }
  }, [activeOrganizationId, sessionToken, isOffline]);

  useEffect(() => {
    return startNetworkSyncOrchestrator({
      getEmpresaId: () => orgRef.current,
      hasSession: () => sessionRef.current,
    });
  }, []);

  return null;
}
