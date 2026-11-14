"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Mail, X } from "lucide-react";

interface PendingInvitationsBannerProps {
  count: number;
}

const SESSION_KEY = "vittkly_inv_banner_dismissed";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function PendingInvitationsBanner({
  count,
}: PendingInvitationsBannerProps) {
  const isDismissed = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return window.sessionStorage.getItem(SESSION_KEY) === String(count);
      } catch {
        return false;
      }
    },
    () => true,
  );

  if (count <= 0 || isDismissed) return null;

  const handleDismiss = () => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, String(count));
    } catch {
      // Ignorar si sessionStorage no está disponible
    }
    emitChange();
  };

  const label =
    count === 1
      ? "Tienes 1 invitación pendiente de otra empresa"
      : `Tienes ${count} invitaciones pendientes de otra empresa`;

  return (
    <div className="border-primary/20 bg-primary/5 text-ink border-b px-4 py-2.5 text-xs sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Mail className="text-primary h-4 w-4 shrink-0" />
          <span className="truncate font-medium">{label}</span>
          <Link
            href="/accesos"
            className="text-primary shrink-0 font-semibold hover:underline"
          >
            Ver en Accesos a empresa →
          </Link>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Ocultar aviso por esta sesión"
          className="text-ink-muted hover:bg-surface-alt hover:text-ink shrink-0 rounded-md p-1"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
