import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  SYSTEM_AUDIT_ACTOR_ID,
  type AuditActorOption,
  type AuditLogEntry,
  type AuditOriginOption,
} from "../types/settings.types";

const mockQueryAuditLogsAction = vi.fn();

vi.mock("../actions/users-profiles.actions", () => ({
  queryAuditLogsAction: (...args: unknown[]) =>
    mockQueryAuditLogsAction(...args),
  createInvitationAction: vi.fn(),
  lookupPersonByDocumentAction: vi.fn(),
  resendInvitationAction: vi.fn(),
  cancelInvitationAction: vi.fn(),
  resolveExitRequestAction: vi.fn(),
  updateMemberInlineAction: vi.fn(),
  updateMemberDetailsAction: vi.fn(),
  toggleMemberStatusAction: vi.fn(),
  unlinkMemberAction: vi.fn(),
  saveCompanyProfileAction: vi.fn(),
  deleteCompanyProfileAction: vi.fn(),
}));

import { ActivityAuditTab } from "../components/ActivityAuditTab";
import { UsersProfilesView } from "../components/UsersProfilesView";

const SAMPLE_ACTORS: AuditActorOption[] = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    nombre: "Ana Lucía Paredes",
    correo: "ana@vittkly.com",
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    nombre: "Carlos Mendoza",
    correo: "carlos@vittkly.com",
  },
  {
    id: SYSTEM_AUDIT_ACTOR_ID,
    nombre: "Sistema",
    correo: null,
  },
];

const SAMPLE_ORIGINS: AuditOriginOption[] = [
  { value: "equipo_accesos", label: "Equipo y accesos" },
  { value: "operaciones_ordenes", label: "Órdenes de trabajo" },
  { value: "perfiles_permisos", label: "Perfiles y permisos" },
];

const SAMPLE_LOGS: AuditLogEntry[] = [
  {
    id: 101,
    accion: "crear",
    tipoEvento: "crear",
    tabla: "ordenes_trabajo",
    origen: "operaciones_ordenes",
    origenLabel: "Órdenes de trabajo",
    registroId: "ot-101",
    entidadNombre: "OT-0042",
    actorId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    actorNombre: "Ana Lucía Paredes",
    actorCorreo: "ana@vittkly.com",
    resumen: "Creó la orden de trabajo OT-0042 para Clínica San Pablo.",
    cambios: ["Estado: pendiente", "Prioridad: alta"],
    creadoEn: "2026-11-18T14:30:00.000Z",
  },
  {
    id: 102,
    accion: "editar",
    tipoEvento: "suspender",
    tabla: "membresias",
    origen: "equipo_accesos",
    origenLabel: "Equipo y accesos",
    registroId: "mem-22",
    entidadNombre: "Jorge Quispe",
    actorId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    actorNombre: "Carlos Mendoza",
    actorCorreo: "carlos@vittkly.com",
    resumen: "Suspendió el acceso de Jorge Quispe en la empresa.",
    cambios: ["Estado: activa → suspendida"],
    creadoEn: "2026-11-16T09:15:00.000Z",
  },
  {
    id: 103,
    accion: "borrar",
    tipoEvento: "borrar",
    tabla: "perfiles",
    origen: "perfiles_permisos",
    origenLabel: "Perfiles y permisos",
    registroId: "perf-9",
    entidadNombre: "Perfil Temporal",
    actorId: null,
    actorNombre: "Sistema",
    actorCorreo: null,
    resumen: "Eliminó el perfil obsoleto.",
    cambios: ["Nombre: Perfil Temporal → (eliminado)"],
    creadoEn: "2026-10-28T11:00:00.000Z",
  },
];

describe("ActivityAuditTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryAuditLogsAction.mockResolvedValue({
      success: true,
      data: {
        entries: SAMPLE_LOGS,
        totalCount: SAMPLE_LOGS.length,
        hasMore: false,
        actors: SAMPLE_ACTORS,
        origins: SAMPLE_ORIGINS,
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renderiza badges diferenciados sin clases HEX/text-kleanly/text-white, muestra entidad y chips de cambios", () => {
    const { container } = render(
      <ActivityAuditTab
        auditLogs={SAMPLE_LOGS}
        initialTotal={SAMPLE_LOGS.length}
        actorOptions={SAMPLE_ACTORS}
        originOptions={SAMPLE_ORIGINS}
      />,
    );

    const creacionBadges = screen.getAllByText("Creación");
    const suspensionBadges = screen.getAllByText("Suspensión");
    const eliminacionBadges = screen.getAllByText("Eliminación");

    expect(creacionBadges.length).toBeGreaterThan(0);
    expect(suspensionBadges.length).toBeGreaterThan(0);
    expect(eliminacionBadges.length).toBeGreaterThan(0);

    const creacionBadgeClass =
      creacionBadges[0]!.parentElement?.className ?? "";
    const suspensionBadgeClass =
      suspensionBadges[0]!.parentElement?.className ?? "";
    const eliminacionBadgeClass =
      eliminacionBadges[0]!.parentElement?.className ?? "";

    expect(creacionBadgeClass).toContain("bg-success-soft");
    expect(creacionBadgeClass).toContain("text-success-ink");
    expect(suspensionBadgeClass).toContain("bg-warning-soft");
    expect(suspensionBadgeClass).toContain("text-warning-ink");
    expect(eliminacionBadgeClass).toContain("bg-danger");
    expect(eliminacionBadgeClass).toContain("text-on-danger");

    expect(
      screen.getAllByText("Estado: activa → suspendida").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Entidad: Perfil Temporal").length,
    ).toBeGreaterThan(0);

    const html = container.innerHTML;
    expect(html).not.toMatch(
      /text-kleanly|text-white|bg-white|#[0-9a-fA-F]{3,8}/,
    );
  });

  it("combina filtros por persona, módulo legible, rango de tiempo (1d/7d/15d/30d/all) y búsqueda, y limpia todo al pulsar Limpiar filtros", async () => {
    mockQueryAuditLogsAction.mockImplementation(
      async (params: {
        actorId?: string;
        origen?: string;
        timeRange?: string;
        search?: string;
      }) => {
        const filtered = SAMPLE_LOGS.filter((entry) => {
          if (params.actorId && entry.actorId !== params.actorId) return false;
          if (params.origen && entry.origen !== params.origen) return false;
          if (
            params.search &&
            !`${entry.resumen} ${entry.entidadNombre ?? ""}`
              .toLowerCase()
              .includes(params.search.toLowerCase())
          ) {
            return false;
          }
          return true;
        });
        return {
          success: true,
          data: {
            entries: filtered,
            totalCount: filtered.length,
            hasMore: false,
            actors: SAMPLE_ACTORS,
            origins: SAMPLE_ORIGINS,
          },
        };
      },
    );

    render(
      <ActivityAuditTab
        auditLogs={SAMPLE_LOGS}
        initialTotal={SAMPLE_LOGS.length}
        actorOptions={SAMPLE_ACTORS}
        originOptions={SAMPLE_ORIGINS}
      />,
    );

    const actorSelect = screen.getByLabelText("Filtrar por persona");
    const originSelect = screen.getByLabelText("Filtrar por módulo o entidad");
    const searchInput = screen.getByLabelText("Buscar en actividad");

    expect(
      screen.getByRole("option", { name: "Órdenes de trabajo" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1 día" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "7 días" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "15 días" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "30 días" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sin límite" }),
    ).toBeInTheDocument();

    fireEvent.change(actorSelect, {
      target: { value: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" },
    });
    await waitFor(() => {
      expect(mockQueryAuditLogsAction).toHaveBeenLastCalledWith({
        actorId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        origen: undefined,
        timeRange: "all",
        search: undefined,
        limit: 25,
        offset: 0,
      });
    });

    fireEvent.change(originSelect, {
      target: { value: "operaciones_ordenes" },
    });
    await waitFor(() => {
      expect(mockQueryAuditLogsAction).toHaveBeenLastCalledWith({
        actorId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        origen: "operaciones_ordenes",
        timeRange: "all",
        search: undefined,
        limit: 25,
        offset: 0,
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "7 días" }));
    await waitFor(() => {
      expect(mockQueryAuditLogsAction).toHaveBeenLastCalledWith({
        actorId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        origen: "operaciones_ordenes",
        timeRange: "7d",
        search: undefined,
        limit: 25,
        offset: 0,
      });
    });

    fireEvent.change(searchInput, { target: { value: "OT-0042" } });
    fireEvent.submit(searchInput.closest("form")!);

    await waitFor(() => {
      expect(mockQueryAuditLogsAction).toHaveBeenLastCalledWith({
        actorId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        origen: "operaciones_ordenes",
        timeRange: "7d",
        search: "OT-0042",
        limit: 25,
        offset: 0,
      });
    });

    expect(screen.getByText("Mostrando 1 de 1 registro")).toBeInTheDocument();

    const clearBtn = screen.getByRole("button", { name: /Limpiar filtros/i });
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(mockQueryAuditLogsAction).toHaveBeenLastCalledWith({
        actorId: undefined,
        origen: undefined,
        timeRange: "all",
        search: undefined,
        limit: 25,
        offset: 0,
      });
    });

    expect((actorSelect as HTMLSelectElement).value).toBe("");
    expect((originSelect as HTMLSelectElement).value).toBe("");
    expect((searchInput as HTMLInputElement).value).toBe("");
    expect(screen.getByText("Mostrando 3 de 3 registros")).toBeInTheDocument();
  });

  it("aplica debounce en búsqueda y soporta paginación con Ver más sin duplicados", async () => {
    vi.useFakeTimers();

    const extraEntry: AuditLogEntry = {
      id: 104,
      accion: "editar",
      tipoEvento: "reactivar",
      tabla: "membresias",
      origen: "equipo_accesos",
      origenLabel: "Equipo y accesos",
      registroId: "mem-99",
      entidadNombre: "Lucía Vega",
      actorId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      actorNombre: "Carlos Mendoza",
      actorCorreo: "carlos@vittkly.com",
      resumen: "Reactivó el acceso de Lucía Vega.",
      cambios: ["Estado: suspendida → activa"],
      creadoEn: "2026-11-15T08:00:00.000Z",
    };

    mockQueryAuditLogsAction.mockResolvedValue({
      success: true,
      data: {
        entries: [SAMPLE_LOGS[0]!, extraEntry],
        totalCount: 4,
        hasMore: false,
        actors: SAMPLE_ACTORS,
        origins: SAMPLE_ORIGINS,
      },
    });

    render(
      <ActivityAuditTab
        auditLogs={SAMPLE_LOGS}
        initialTotal={4}
        initialHasMore
        actorOptions={SAMPLE_ACTORS}
        originOptions={SAMPLE_ORIGINS}
      />,
    );

    const loadMoreBtn = screen.getByRole("button", { name: "Ver más" });
    await act(async () => {
      fireEvent.click(loadMoreBtn);
    });

    expect(mockQueryAuditLogsAction).toHaveBeenCalledWith({
      actorId: undefined,
      origen: undefined,
      timeRange: "all",
      search: undefined,
      limit: 25,
      offset: 3,
    });
    expect(
      screen.getAllByText("Reactivó el acceso de Lucía Vega.").length,
    ).toBeGreaterThan(0);

    const searchInput = screen.getByLabelText("Buscar en actividad");
    fireEvent.change(searchInput, { target: { value: "Lucía" } });
    expect(mockQueryAuditLogsAction).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(260);
    });

    expect(mockQueryAuditLogsAction).toHaveBeenCalledTimes(2);
    expect(mockQueryAuditLogsAction).toHaveBeenLastCalledWith({
      actorId: undefined,
      origen: undefined,
      timeRange: "all",
      search: "Lucía",
      limit: 25,
      offset: 0,
    });
  });

  it("muestra alerta y permite Reintentar ante error del servidor, y neutraliza inyección de fórmulas en CSV", async () => {
    mockQueryAuditLogsAction
      .mockResolvedValueOnce({
        success: false,
        error: "Fallo temporal al consultar auditoría.",
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          entries: [SAMPLE_LOGS[0]!],
          totalCount: 1,
          hasMore: false,
          actors: SAMPLE_ACTORS,
          origins: SAMPLE_ORIGINS,
        },
      });

    const dangerousLogs: AuditLogEntry[] = [
      {
        ...SAMPLE_LOGS[0]!,
        resumen: "=CMD('calc')",
        entidadNombre: "@SUM(A1:A2)",
        cambios: ["+1+1"],
      },
      {
        ...SAMPLE_LOGS[1]!,
        id: 202,
        resumen: "-2+3",
        entidadNombre: null,
        cambios: [],
      },
    ];

    let capturedCsv = "";
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    const originalBlob = globalThis.Blob;

    class MockBlob extends originalBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        capturedCsv = parts?.map((p) => String(p)).join("") ?? "";
      }
    }
    globalThis.Blob = MockBlob as typeof Blob;
    URL.createObjectURL = vi.fn(() => "blob:mock-csv");
    URL.revokeObjectURL = vi.fn();
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    try {
      render(
        <ActivityAuditTab
          auditLogs={dangerousLogs}
          initialTotal={1}
          actorOptions={SAMPLE_ACTORS}
          originOptions={SAMPLE_ORIGINS}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Exportar CSV" }));
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(capturedCsv).toContain("\"'=CMD('calc')\"");
      expect(capturedCsv).toContain('"\'+1+1"');
      expect(capturedCsv).toContain('"\'-2+3"');
      expect(capturedCsv).toContain('"\'@SUM(A1:A2)"');

      fireEvent.click(screen.getByRole("button", { name: "1 día" }));

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent("Fallo temporal al consultar auditoría.");

      fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    } finally {
      globalThis.Blob = originalBlob;
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    }
  });

  it("UsersProfilesView abre directamente la pestaña Actividad cuando initialTab='actividad' y sincroniza ?tab=", () => {
    const replaceStateSpy = vi.spyOn(window.history, "replaceState");

    render(
      <UsersProfilesView
        companyName="Vitta Kleanly"
        initialTab="actividad"
        bundle={{
          members: [],
          profiles: [],
          invitations: [],
          exitRequests: [],
          auditLogs: SAMPLE_LOGS,
          auditTotalCount: SAMPLE_LOGS.length,
          auditHasMore: false,
          auditActors: SAMPLE_ACTORS,
          auditOrigins: SAMPLE_ORIGINS,
          activePlanCode: "empresa",
          allowedPlanModules: [],
        }}
      />,
    );

    expect(screen.getByRole("tab", { name: "Actividad" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByLabelText("Registro detallado de actividad y auditoría"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Personas" }));
    expect(replaceStateSpy).toHaveBeenCalled();
  });
});
