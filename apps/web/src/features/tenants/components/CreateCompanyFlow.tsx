"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";

export interface NuevaEmpresaDraft {
  nombreEmpresa: string;
  rubro: string;
  ciudad: string;
}

interface CreateCompanyFlowProps {
  initialDraft?: NuevaEmpresaDraft;
  defaultExpanded?: boolean;
  onContinueToPlan: (draft: NuevaEmpresaDraft) => void;
  onCancel?: () => void;
}

const labelClass =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-muted";
const inputClass =
  "w-full rounded-lg border border-line bg-surface-sunken px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-primary focus:outline-none";

export function CreateCompanyFlow({
  initialDraft,
  defaultExpanded = false,
  onContinueToPlan,
  onCancel,
}: CreateCompanyFlowProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const [nombreEmpresa, setNombreEmpresa] = useState(
    initialDraft?.nombreEmpresa ?? "",
  );
  const [rubro, setRubro] = useState(initialDraft?.rubro ?? "");
  const [ciudad, setCiudad] = useState(initialDraft?.ciudad ?? "");

  const handleCancel = () => {
    setIsOpen(false);
    onCancel?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreEmpresa.trim()) return;
    onContinueToPlan({
      nombreEmpresa: nombreEmpresa.trim(),
      rubro: rubro.trim(),
      ciudad: ciudad.trim(),
    });
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="border-line bg-surface-raised text-ink hover:border-primary hover:text-primary flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3.5 text-sm font-semibold transition-colors"
      >
        <Plus className="h-4 w-4" />
        Crear una empresa nueva
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-raised border-line space-y-5 rounded-xl border p-6"
    >
      <div className="space-y-1">
        <h3 className="text-ink text-lg font-bold">Nueva empresa</h3>
        <p className="text-ink-muted text-sm">
          Quedarás como propietario: tú defines la marca, las plantillas, los
          servicios y tu equipo. En el siguiente paso eliges tu plan.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="nueva-empresa-nombre" className={labelClass}>
            NOMBRE DE LA EMPRESA
          </label>
          <input
            id="nueva-empresa-nombre"
            type="text"
            value={nombreEmpresa}
            onChange={(e) => setNombreEmpresa(e.target.value)}
            placeholder="Ej. Tienda SAC"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="nueva-empresa-rubro" className={labelClass}>
            A QUÉ SE DEDICA (OPCIONAL)
          </label>
          <input
            id="nueva-empresa-rubro"
            type="text"
            value={rubro}
            onChange={(e) => setRubro(e.target.value)}
            placeholder="Ej. Limpieza, mantenimiento, ventas..."
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="nueva-empresa-ciudad" className={labelClass}>
            CIUDAD
          </label>
          <input
            id="nueva-empresa-ciudad"
            type="text"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Ej. Lima, Perú"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex items-center justify-start gap-2 pt-1">
        <button
          type="submit"
          disabled={!nombreEmpresa.trim()}
          className="bg-primary text-surface-sunken cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continuar: elegir plan
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="text-ink-muted hover:text-ink cursor-pointer px-3 py-2.5 text-sm"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
