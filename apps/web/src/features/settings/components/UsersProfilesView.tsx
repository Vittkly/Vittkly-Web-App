"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import type { TeamMember } from "../types/settings.types";
import {
  UsersProfilesHeader,
  USERS_PROFILES_TABS,
} from "./UsersProfilesHeader";
import { UsersProfilesTable } from "./UsersProfilesTable";
import { AddMemberModal } from "./AddMemberModal";

export interface UsersProfilesViewProps {
  initialMembers: TeamMember[];
  companyName: string;
}

export function UsersProfilesView({
  initialMembers,
  companyName,
}: UsersProfilesViewProps) {
  const [activeTab, setActiveTab] = useState("personas");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);

  const activeTabMeta = USERS_PROFILES_TABS.find((t) => t.id === activeTab);

  const handleMemberAdded = (newMember: TeamMember) => {
    setMembers((prev) => [newMember, ...prev]);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-5 sm:p-7">
      {/* Cabecera del Módulo con Píldoras de Navegación */}
      <UsersProfilesHeader
        companyName={companyName}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Contenido según pestaña seleccionada */}
      {activeTab === "personas" ? (
        <UsersProfilesTable
          initialMembers={members}
          companyName={companyName}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      ) : (
        /* Estado Próximamente para pestañas secundarias inactivas */
        <div className="border-line bg-surface-raised flex flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-xs">
          <div className="bg-surface-sunken border-line mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border">
            <Sparkles className="text-primary-ink h-6 w-6" />
          </div>
          <h3 className="text-ink font-sans text-lg font-bold">
            Pestaña: {activeTabMeta?.label || activeTab}
          </h3>
          <p className="text-ink-muted mt-1 max-w-md text-xs leading-relaxed">
            Esta sección de configuración estará disponible próximamente en las
            siguientes fases de desarrollo de Vittkly.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab("personas")}
            className="text-primary hover:text-primary-hover mt-4 cursor-pointer text-xs font-bold hover:underline"
          >
            ← Volver a Personas de tu equipo
          </button>
        </div>
      )}

      {/* Modal para agregar colaborador */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onMemberAdded={handleMemberAdded}
        companyName={companyName}
      />
    </div>
  );
}
