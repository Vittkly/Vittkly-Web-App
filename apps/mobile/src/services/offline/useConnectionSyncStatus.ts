import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useState } from 'react';

import type { ConnectionStatus } from '@/components/ConnectionBanner';
import { useAuth } from '@/features/auth';
import { isNetworkOffline } from '@/features/auth/context/auth-state';

import { syncOutboxService } from './sync-outbox.service';
import type { SyncEngineSnapshot } from './offline.types';

export interface ConnectionSyncStatusResult extends SyncEngineSnapshot {
  bannerStatus: ConnectionStatus | null;
  retryNow: () => Promise<number>;
}

/**
 * Conecta el estado real de conectividad (`NetInfo`) y el conteo real de `sync_outbox`
 * para la empresa activa con `ConnectionBanner`.
 */
export function useConnectionSyncStatus(): ConnectionSyncStatusResult {
  const { activeOrganizationId, isOffline: authOffline } = useAuth();
  const [netOffline, setNetOffline] = useState(false);
  const [counts, setCounts] = useState({
    pendingCount: 0,
    failedCount: 0,
    totalUnsyncedCount: 0,
  });
  const [isSyncing, setIsSyncing] = useState(() => syncOutboxService.isSyncing());
  const [lastSyncedAt, setLastSyncedAt] = useState(() => syncOutboxService.getLastSyncedAt());

  useEffect(() => {
    let mounted = true;

    const applySnapshot = (next: {
      pendingCount: number;
      failedCount: number;
      totalUnsyncedCount: number;
    }) => {
      if (!mounted) return;
      setCounts(next);
      setIsSyncing(syncOutboxService.isSyncing());
      setLastSyncedAt(syncOutboxService.getLastSyncedAt());
    };

    void NetInfo.fetch().then((state) => {
      if (mounted) {
        setNetOffline(isNetworkOffline(state));
      }
    });

    const unsubNet = NetInfo.addEventListener((state) => {
      if (mounted) {
        setNetOffline(isNetworkOffline(state));
      }
    });

    void syncOutboxService.getCounts(activeOrganizationId).then(applySnapshot);

    const unsubOutbox = syncOutboxService.subscribe(() => {
      void syncOutboxService.getCounts(activeOrganizationId).then(applySnapshot);
    });

    return () => {
      mounted = false;
      unsubNet();
      unsubOutbox();
    };
  }, [activeOrganizationId]);

  const isOffline = authOffline || netOffline;

  const bannerStatus: ConnectionStatus | null = isOffline
    ? 'offline'
    : counts.totalUnsyncedCount > 0 || isSyncing
      ? 'syncing'
      : null;

  const retryNow = useCallback(async () => {
    await syncOutboxService.retryFailed(activeOrganizationId);
    return syncOutboxService.flushOutbox(activeOrganizationId);
  }, [activeOrganizationId]);

  return {
    isOffline,
    isSyncing,
    pendingCount: counts.pendingCount,
    failedCount: counts.failedCount,
    totalUnsyncedCount: counts.totalUnsyncedCount,
    lastSyncedAt,
    bannerStatus,
    retryNow,
  };
}
