import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { AppState } from 'react-native';

import { isNetworkOffline } from '@/features/auth/context/auth-state';
import { queryClient } from '@/services/queryClient';

import { notifyOutboxChanged } from './offline-outbox.store';
import { syncOutboxService } from './sync-outbox.service';

export interface NetworkSyncStartOptions {
  getEmpresaId: () => string | null;
  hasSession: () => boolean;
}

const RETRY_INTERVAL_MS = 30_000;

let isStarted = false;
let wasOffline = false;

async function invalidateFieldQueries(empresaId: string | null): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['work-orders'] }),
    queryClient.invalidateQueries({ queryKey: ['time-entries'] }),
    queryClient.invalidateQueries({ queryKey: ['clients'] }),
    queryClient.invalidateQueries({ queryKey: ['form-templates'] }),
    ...(empresaId
      ? [queryClient.invalidateQueries({ queryKey: ['work-orders', 'today', empresaId] })]
      : []),
  ]);
}

async function runSyncCycle(options: NetworkSyncStartOptions): Promise<void> {
  if (!options.hasSession()) return;
  const empresaId = options.getEmpresaId();
  const flushed = await syncOutboxService.flushOutbox(empresaId);
  if (flushed > 0) {
    await invalidateFieldQueries(empresaId);
  }
}

/**
 * Inicia la orquestación global de conectividad (`NetInfo`), primer plano (`AppState`)
 * y reintento periódico de la cola transaccional `sync_outbox`.
 */
export function startNetworkSyncOrchestrator(options: NetworkSyncStartOptions): () => void {
  if (isStarted) {
    return () => {};
  }
  isStarted = true;

  void NetInfo.fetch().then((initialState) => {
    wasOffline = isNetworkOffline(initialState);
    if (!wasOffline) {
      void runSyncCycle(options);
    }
    notifyOutboxChanged();
  });

  const unsubscribeNetInfo = NetInfo.addEventListener((netState: NetInfoState) => {
    const offline = isNetworkOffline(netState);
    const reconnected = wasOffline && !offline;
    wasOffline = offline;
    notifyOutboxChanged();

    if (reconnected || !offline) {
      void runSyncCycle(options);
    }
  });

  let previousAppState: string | null | undefined = AppState.currentState;
  const appStateSub = AppState.addEventListener('change', (nextState) => {
    const resumed = previousAppState !== 'active' && nextState === 'active';
    previousAppState = nextState;
    if (resumed) {
      void runSyncCycle(options);
    }
  });

  const retryTimer = setInterval(() => {
    if (!wasOffline) {
      void runSyncCycle(options);
    }
  }, RETRY_INTERVAL_MS);

  return () => {
    isStarted = false;
    unsubscribeNetInfo();
    appStateSub.remove();
    clearInterval(retryTimer);
  };
}
