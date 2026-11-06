"use client";

import React, { useState } from "react";
import { X, UserPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  addTeamMemberAction,
  type NewMemberInput,
} from "../actions/users-profiles.actions";
import type { TeamMember } from "../types/settings.types";

export interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded: (member: TeamMember) => void;
  companyName: string;
}

export function AddMemberModal({
  isOpen,
  onClose,
  onMemberAdded,
  companyName,
}: AddMemberModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<
    "Administrador" | "Ventas" | "Técnico" | "Supervisor"
  >("Técnico");
  const [accessScope, setAccessScope] = useState<"web" | "mobile" | "both">(
    "both",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: NewMemberInput = {
      fullName,
      email,
      phone,
      role,
      accessScope,
    };

    const res = await addTeamMemberAction(payload);
    setIsSubmitting(false);

    if (res.success && res.data) {
      onMemberAdded({
        id: res.data.id,
        userId: `usr-${Date.now()}`,
        fullName: res.data.fullName,
        email: res.data.email,
        phone: res.data.phone,
        avatarUrl: null,
        role: res.data.role,
        isOwner: false,
        isCurrentUser: false,
        accessScope: res.data.accessScope,
        accessMethods: ["whatsapp", "pin"],
        status: "pending",
        statusLabel: "Aún no ingresa",
        createdAt: new Date().toISOString(),
      });
      onClose();
    } else {
      setError(res.error || "Ocurrió un error al registrar al colaborador");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-member-title"
      className="bg-ink/60 animate-sc-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
    >
      <div className="border-line bg-surface-raised flex w-full max-w-lg flex-col gap-5 rounded-2xl border p-6 shadow-2xl">
        <div className="border-line flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-soft text-primary-ink border-primary/20 flex h-10 w-10 items-center justify-center rounded-xl border">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="add-member-title"
                className="text-ink font-sans text-lg font-bold"
              >
                Agregar colaborador
              </h3>
              <p className="text-ink-muted text-xs">
                Vincular persona a {companyName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:text-ink hover:bg-surface-sunken rounded-pill cursor-pointer p-1.5 transition-colors"
            title="Cerrar ventana"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="border-danger/30 bg-danger-soft text-danger-ink rounded-xl border p-3 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="text-ink font-semibold">Nombre y Apellidos</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Carlos Zambrano"
              className="border-line bg-surface-sunken text-ink placeholder:text-ink-muted focus:border-primary focus:bg-surface-raised rounded-xl border px-3.5 py-2.5 text-xs transition-colors outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-ink font-semibold">
                Correo Corporativo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colaborador@empresa.pe"
                className="border-line bg-surface-sunken text-ink placeholder:text-ink-muted focus:border-primary focus:bg-surface-raised rounded-xl border px-3.5 py-2.5 text-xs transition-colors outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-ink font-semibold">
                Celular (WhatsApp)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+51 987 654 321"
                className="border-line bg-surface-sunken text-ink placeholder:text-ink-muted focus:border-primary focus:bg-surface-raised rounded-xl border px-3.5 py-2.5 font-mono text-xs transition-colors outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-ink font-semibold">Perfil Asignado</label>
              <select
                value={role}
                onChange={(e) =>
                  setRole(
                    e.target.value as
                      "Administrador" | "Ventas" | "Técnico" | "Supervisor",
                  )
                }
                className="border-line bg-surface-sunken text-ink focus:border-primary focus:bg-surface-raised cursor-pointer rounded-xl border px-3 py-2.5 text-xs transition-colors outline-none"
              >
                <option value="Administrador">Administrador</option>
                <option value="Ventas">Ventas</option>
                <option value="Técnico">Técnico de campo</option>
                <option value="Supervisor">Supervisor de cuadrilla</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-ink font-semibold">
                Alcance de Acceso
              </label>
              <select
                value={accessScope}
                onChange={(e) =>
                  setAccessScope(e.target.value as "web" | "mobile" | "both")
                }
                className="border-line bg-surface-sunken text-ink focus:border-primary focus:bg-surface-raised cursor-pointer rounded-xl border px-3 py-2.5 text-xs transition-colors outline-none"
              >
                <option value="both">Panel web y app móvil</option>
                <option value="web">Solo panel web</option>
                <option value="mobile">Solo app móvil</option>
              </select>
            </div>
          </div>

          <div className="border-line bg-surface-sunken/60 text-ink-muted rounded-xl border p-3 text-[11px]">
            Al registrar, el colaborador recibirá su invitación y código para
            acceder desde la app móvil o el portal web con las políticas de su
            perfil.
          </div>

          <div className="border-line mt-1 flex items-center justify-end gap-2.5 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSubmitting}
            >
              <Check className="h-4 w-4" />
              <span>Registrar persona</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
