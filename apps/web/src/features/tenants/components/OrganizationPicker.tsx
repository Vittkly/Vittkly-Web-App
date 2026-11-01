import React from "react";
import { ChevronRight } from "lucide-react";
import { selectOrganizationAction } from "../actions/tenants.actions";
import type { UserOrganization } from "../types/tenants.types";
import { getOrganizationInitials } from "../utils/initials";

export interface OrganizationPickerProps {
  organizations: UserOrganization[];
  lastOrganizationId: string | null;
}

export function OrganizationPicker({
  organizations,
  lastOrganizationId,
}: OrganizationPickerProps) {
  return (
    <ul className="flex flex-col gap-3" aria-label="Tus empresas">
      {organizations.map((org) => {
        const isLast = org.id === lastOrganizationId;
        return (
          <li key={org.id}>
            <form action={selectOrganizationAction}>
              <input type="hidden" name="organizationId" value={org.id} />
              <button
                type="submit"
                className={`group bg-surface-raised hover:bg-surface-sunken/60 focus-visible:outline-focus flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 ${
                  isLast ? "border-primary" : "border-line"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="bg-primary-soft text-primary-ink flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold"
                >
                  {getOrganizationInitials(org.name)}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-ink truncate text-sm font-bold">
                    {org.name}
                  </span>
                  <span className="text-ink-muted truncate text-xs">
                    {org.roleName}
                  </span>
                </span>
                {isLast && (
                  <span className="bg-primary/10 text-primary border-primary/20 shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold">
                    Última usada
                  </span>
                )}
                <ChevronRight
                  className="text-ink-muted h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
              </button>
            </form>
          </li>
        );
      })}
    </ul>
  );
}
