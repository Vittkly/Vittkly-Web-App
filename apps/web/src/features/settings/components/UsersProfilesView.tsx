"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import type { GeneratedInvitationPayload } from "../actions/users-profiles.actions";
import type { UsersProfilesBundle } from "../types/settings.types";
import {
  UsersProfilesHeader,
  USERS_PROFILES_TABS,
  type UsersProfilesTabId,
} from "./UsersProfilesHeader";
import { UsersProfilesTable } from "./UsersProfilesTable";
import { AddMemberModal } from "./AddMemberModal";
import { InvitationDetailsModal } from "./InvitationDetailsModal";
import { InvitationsExitsTab } from "./InvitationsExitsTab";
import { ProfilesPermissionsTab } from "./ProfilesPermissionsTab";
import { ActivityAuditTab } from "./ActivityAuditTab";

export interface UsersProfilesViewProps {
  bundle: UsersProfilesBundle;
  companyName: string;
}

export function UsersProfilesView({
  bundle,
  companyName,
}: UsersProfilesViewProps) {
  const [activeTab, setActiveTab] = useState<UsersProfilesTabId>("personas");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeInvitationModal, setActiveInvitationModal] =
    useState<GeneratedInvitationPayload | null>(null);

  const activeTabMeta = USERS_PROFILES_TABS.find((t) => t.id === activeTab);

  return (
    <div className="flex flex-1 flex-col gap-6 p-5 sm:p-7">
      {/* Cabecera del Módulo con las 6 Píldoras de Navegación */}
      <UsersProfilesHeader
        companyName={companyName}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Contenido según pestaña seleccionada */}
      {activeTab === "personas" && (
        <UsersProfilesTable
          members={bundle.members}
          profiles={bundle.profiles}
          companyName={companyName}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenInvitationModal={(payload) => setActiveInvitationModal(payload)}
        />
      )}

      {activeTab === "invitaciones-salidas" && (
        <InvitationsExitsTab
          invitations={bundle.invitations}
          exitRequests={bundle.exitRequests}
          onOpenInvitationModal={(payload) => setActiveInvitationModal(payload)}
        />
      )}

      {activeTab === "perfiles" && (
        <ProfilesPermissionsTab profiles={bundle.profiles} />
      )}

      {activeTab === "actividad" && (
        <ActivityAuditTab auditLogs={bundle.auditLogs} />
      )}

      {(activeTab === "equipos" || activeTab === "aprobaciones") && (
        <div className="border-line bg-surface-raised flex flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-xs">
          <div className="bg-surface-sunken border-line mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border">
            <Sparkles className="text-primary-ink h-6 w-6" />
          </div>
          <h3 className="text-ink font-sans text-lg font-bold">
            {activeTabMeta?.label || activeTab}
          </h3>
          <p className="text-ink-muted mt-1 max-w-md text-xs leading-relaxed">
            Módulo en preparación • Próximamente disponible
          </p>
        </div>
      )}

      {/* Modal "+ Agregar persona" */}
      {isAddModalOpen && (
        <AddMemberModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          profiles={bundle.profiles}
          companyName={companyName}
          onInvitationCreated={(invPayload) =>
            setActiveInvitationModal(invPayload)
          }
        />
      )}

      {/* Modal de Invitación (Enlace de un solo uso · 7 días) */}
      <InvitationDetailsModal
        isOpen={Boolean(activeInvitationModal)}
        onClose={() => setActiveInvitationModal(null)}
        companyName={companyName}
        invitation={activeInvitationModal}
        onInvitationUpdated={(nextPayload) =>
          setActiveInvitationModal(nextPayload)
        }
      />
    </div>
  );
}
