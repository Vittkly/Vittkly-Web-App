import 'server-only';

import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

export type PlanCodigo = 'inicia' | 'crece' | 'empresa';

export interface ModulePermissionDetail {
  code: string;
  description: string;
  scope: string | null;
}

export interface EnrichedModule {
  codigo: string;
  nombre: string;
  grupo: string;
  modelo: string;
  etapa: number;
  disponible: boolean;
  orden: number;
  permissions: ModulePermissionDetail[];
  permissionSummary: string; // ej. "Lectura y Edición", "Solo Lectura", "Acceso Total"
}

export interface DashboardContextResult {
  user: {
    id: string;
    nombre: string;
    correo: string;
    avatarRuta: string | null;
  };
  activeOrganization: {
    id: string;
    razonSocial: string;
    nombreComercial: string | null;
    ruc: string | null;
    modeloOperacion: string;
    moneda: string;
    pais: string;
    activa: boolean;
  };
  activePlan: {
    id: string;
    codigo: PlanCodigo;
    nombre: string;
    usuariosIncluidos: number;
    estadoSuscripcion: string;
    pruebaHasta: string | null;
  };
  activeProfile: {
    id: string;
    codigo: string;
    nombre: string;
    descripcion: string | null;
    esPropietario: boolean;
    accesoWeb: boolean;
    isSimulated?: boolean;
  };
  globalCapabilities: {
    canViewPrices: boolean;
    canValidateServices: boolean;
    canEditConfig: boolean;
    canManageUsers: boolean;
  };
  enabledModules: EnrichedModule[];
  planLockedModules: Array<{ codigo: string; nombre: string; grupo: string; requiredPlan: string }>;
  roleRestrictedModules: Array<{ codigo: string; nombre: string; grupo: string }>;
  availableOrganizations: Array<{
    id: string;
    nombre: string;
    rol: string;
  }>;
  availableProfilesForPreview: Array<{
    id: string;
    codigo: string;
    nombre: string;
    descripcion: string | null;
  }>;
}

const MASTER_MODULES_FALLBACK: Database['public']['Tables']['modulos']['Row'][] = [
  // Comunes (20)
  { codigo: 'empresa_usuarios', nombre: 'Empresa, usuarios y perfiles', grupo: 'configuracion', modelo: 'comun', etapa: 0, disponible: true, orden: 1, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'clientes', nombre: 'Clientes y CRM', grupo: 'ventas', modelo: 'comun', etapa: 1, disponible: false, orden: 1, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'tarifario', nombre: 'Tarifario y servicios', grupo: 'configuracion', modelo: 'comun', etapa: 1, disponible: false, orden: 2, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'calendario_trabajos', nombre: 'Calendario y Trabajos', grupo: 'operacion', modelo: 'comun', etapa: 1, disponible: false, orden: 1, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'app_campo', nombre: 'App de campo', grupo: 'operacion', modelo: 'comun', etapa: 1, disponible: false, orden: 1, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'ocurrencias', nombre: 'Ocurrencias e incidencias', grupo: 'operacion', modelo: 'comun', etapa: 1, disponible: false, orden: 2, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'personal', nombre: 'Personal y habilidades', grupo: 'equipo', modelo: 'comun', etapa: 1, disponible: false, orden: 1, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'tiempo', nombre: 'Tiempo y asistencia', grupo: 'operacion', modelo: 'comun', etapa: 2, disponible: false, orden: 3, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'inventario', nombre: 'Inventario y repuestos', grupo: 'operacion', modelo: 'comun', etapa: 2, disponible: false, orden: 4, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'equipos_cliente', nombre: 'Equipos del cliente', grupo: 'operacion', modelo: 'comun', etapa: 2, disponible: false, orden: 5, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'biblioteca', nombre: 'Biblioteca', grupo: 'equipo', modelo: 'comun', etapa: 2, disponible: false, orden: 3, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'academia', nombre: 'Academia', grupo: 'equipo', modelo: 'comun', etapa: 2, disponible: false, orden: 4, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'cobranzas_comprobantes', nombre: 'Cobranzas y comprobantes', grupo: 'finanzas', modelo: 'comun', etapa: 1, disponible: false, orden: 1, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'convenios', nombre: 'Convenios y liquidaciones', grupo: 'finanzas', modelo: 'comun', etapa: 1, disponible: false, orden: 2, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'caja_bancos', nombre: 'Caja y bancos', grupo: 'finanzas', modelo: 'comun', etapa: 2, disponible: false, orden: 3, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'reportes', nombre: 'Reportes y Dashboard', grupo: 'reportes', modelo: 'comun', etapa: 2, disponible: false, orden: 1, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'configuraciones', nombre: 'Configuraciones', grupo: 'configuracion', modelo: 'comun', etapa: 0, disponible: true, orden: 3, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'cuenta_vittkly', nombre: 'Cuenta Vittkly', grupo: 'configuracion', modelo: 'comun', etapa: 2, disponible: false, orden: 4, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'panel_plataforma', nombre: 'Panel de la plataforma', grupo: 'plataforma', modelo: 'comun', etapa: 0, disponible: true, orden: 1, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'soporte_comunidad', nombre: 'Soporte, Comunidad y Centro de ayuda', grupo: 'plataforma', modelo: 'comun', etapa: 2, disponible: false, orden: 2, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  // Por visita (4)
  { codigo: 'cotizaciones', nombre: 'Cotizaciones', grupo: 'ventas', modelo: 'visita', etapa: 1, disponible: false, orden: 2, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'post_venta', nombre: 'Post venta', grupo: 'operacion', modelo: 'visita', etapa: 2, disponible: false, orden: 6, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'sitio_web', nombre: 'Sitio web y reservas', grupo: 'crecimiento', modelo: 'visita', etapa: 3, disponible: false, orden: 1, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'marketing', nombre: 'Marketing', grupo: 'crecimiento', modelo: 'visita', etapa: 3, disponible: false, orden: 2, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  // Por contrato (11)
  { codigo: 'sedes_areas', nombre: 'Sedes y áreas', grupo: 'ventas', modelo: 'contrato', etapa: 4, disponible: false, orden: 3, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'contratos', nombre: 'Contratos y adendas', grupo: 'ventas', modelo: 'contrato', etapa: 4, disponible: false, orden: 4, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'puestos_turnos', nombre: 'Puestos y turnos', grupo: 'operacion', modelo: 'contrato', etapa: 4, disponible: false, orden: 7, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'asistencia_sede', nombre: 'Asistencia en sede', grupo: 'operacion', modelo: 'contrato', etapa: 4, disponible: false, orden: 8, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'rutinas', nombre: 'Rutinas y planes de trabajo', grupo: 'operacion', modelo: 'contrato', etapa: 5, disponible: false, orden: 9, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'inspecciones', nombre: 'Inspecciones y calidad', grupo: 'operacion', modelo: 'contrato', etapa: 5, disponible: false, orden: 10, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'pedidos_adicionales', nombre: 'Pedidos y adicionales', grupo: 'operacion', modelo: 'contrato', etapa: 5, disponible: false, orden: 11, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'aprobaciones', nombre: 'Aprobaciones', grupo: 'operacion', modelo: 'contrato', etapa: 5, disponible: false, orden: 12, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'portal_b2b', nombre: 'Portal del cliente B2B', grupo: 'configuracion', modelo: 'contrato', etapa: 5, disponible: false, orden: 5, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'valorizaciones', nombre: 'Valorización y conformidad', grupo: 'finanzas', modelo: 'contrato', etapa: 4, disponible: false, orden: 4, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'inventario_sede_sst', nombre: 'Inventario por sede y SST', grupo: 'operacion', modelo: 'contrato', etapa: 5, disponible: false, orden: 13, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  // Sector público (2)
  { codigo: 'licitaciones', nombre: 'Licitaciones', grupo: 'ventas', modelo: 'publico', etapa: 6, disponible: false, orden: 5, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'contratos_estado', nombre: 'Contratos con el Estado', grupo: 'ventas', modelo: 'publico', etapa: 6, disponible: false, orden: 6, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  // Crecimiento (2)
  { codigo: 'api_integraciones', nombre: 'API e integraciones', grupo: 'configuracion', modelo: 'crecimiento', etapa: 7, disponible: false, orden: 6, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
  { codigo: 'multi_pais', nombre: 'Multi país', grupo: 'configuracion', modelo: 'crecimiento', etapa: 7, disponible: false, orden: 7, creado_en: '', creado_por: null, actualizado_en: '', actualizado_por: null },
];

export async function getDashboardContext(
  selectedEmpresaId?: string,
  previewPerfilCodigo?: string
): Promise<DashboardContextResult | null> {
  const supabase = await createServerClient();

  // 1. Obtener usuario autenticado
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  // 2. Obtener datos de la persona en public.usuarios
  const { data: usuarioRow } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  // 3. Consultar membresías activas del usuario
  let { data: rawMemberships } = await supabase
    .from('membresias')
    .select(`
      id,
      empresa_id,
      perfil_id,
      es_propietario,
      acceso_web,
      activo,
      empresas (*),
      perfiles (*)
    `)
    .eq('usuario_id', authUser.id)
    .eq('activo', true);

  // Auto-provisión si el usuario acaba de registrarse y no tiene empresa
  if (!rawMemberships || rawMemberships.length === 0) {
    const meta = authUser.user_metadata || {};
    if (meta.company_name) {
      try {
        await supabase.rpc('crear_cuenta_y_empresa', {
          p_nombre_empresa: meta.company_name,
          p_ruc: meta.ruc || null,
          p_plan_codigo: meta.plan_code || 'empresa',
        });

        // Re-consultar membresías
        const recheck = await supabase
          .from('membresias')
          .select(`
            id,
            empresa_id,
            perfil_id,
            es_propietario,
            acceso_web,
            activo,
            empresas (*),
            perfiles (*)
          `)
          .eq('usuario_id', authUser.id)
          .eq('activo', true);

        rawMemberships = recheck.data;
      } catch (err) {
        console.warn('[Vittkly Dashboard] Error auto-aprovisionando empresa:', err);
      }
    }
  }

  if (!rawMemberships || rawMemberships.length === 0) {
    return null;
  }

  // Filtrar las membresías con acceso web (o todas si es admin)
  const webMemberships = rawMemberships.filter((m) => m.acceso_web);
  const activeMembershipsList = webMemberships.length > 0 ? webMemberships : rawMemberships;

  // 4. Resolver la Empresa Activa
  let activeMembership = activeMembershipsList[0];
  if (selectedEmpresaId) {
    const found = activeMembershipsList.find((m) => m.empresa_id === selectedEmpresaId);
    if (found) activeMembership = found;
  } else if (usuarioRow?.ultima_empresa_id) {
    const found = activeMembershipsList.find((m) => m.empresa_id === usuarioRow.ultima_empresa_id);
    if (found) activeMembership = found;
  }

  const activeEmpresa = (activeMembership.empresas as unknown as Database['public']['Tables']['empresas']['Row']) || {
    id: activeMembership.empresa_id,
    razon_social: 'Mi Empresa',
    nombre_comercial: null,
    ruc: null,
    modelo_operacion: 'ambos',
    moneda: 'PEN',
    pais: 'PE',
    activa: true,
  };

  // 5. Consultar la Suscripción y el Plan Activo de la Empresa
  let activePlanCodigo: PlanCodigo = 'empresa';
  let planNombre = 'Empresa';
  let planUsuarios = 15;
  let subEstado = 'prueba';
  let subPruebaHasta: string | null = null;
  let planId = '';

  try {
    const { data: cuentaData } = await supabase
      .from('cuentas')
      .select('*, suscripciones(*, planes(*))')
      .eq('id', activeEmpresa.cuenta_id)
      .maybeSingle();

    const suscripcion = cuentaData?.suscripciones as unknown as Database['public']['Tables']['suscripciones']['Row'] & {
      planes?: Database['public']['Tables']['planes']['Row'];
    };

    if (suscripcion) {
      subEstado = suscripcion.estado || 'prueba';
      subPruebaHasta = suscripcion.prueba_hasta || null;
      if (suscripcion.planes) {
        planId = suscripcion.planes.id;
        activePlanCodigo = (suscripcion.planes.codigo as PlanCodigo) || 'empresa';
        planNombre = suscripcion.planes.nombre || 'Empresa';
        planUsuarios = suscripcion.planes.usuarios_incluidos || 15;
      }
    }
  } catch (err) {
    console.warn('[Vittkly Dashboard] Error obteniendo cuenta/plan:', err);
  }

  // 6. Consultar los Módulos Permitidos por el Plan (public.plan_modulos)
  let allowedByPlanCodes = new Set<string>();

  if (planId) {
    const { data: planModulosRows } = await supabase
      .from('plan_modulos')
      .select('modulo_codigo')
      .eq('plan_id', planId);

    if (planModulosRows && planModulosRows.length > 0) {
      allowedByPlanCodes = new Set(planModulosRows.map((r) => r.modulo_codigo));
    }
  }

  // Fallback si la tabla no devolvió registros (según seed.sql)
  if (allowedByPlanCodes.size === 0) {
    const iniciaExcluidos = new Set(['inventario', 'equipos_cliente', 'biblioteca', 'academia', 'convenios']);
    MASTER_MODULES_FALLBACK.forEach((m) => {
      if (m.modelo === 'comun' || m.modelo === 'visita') {
        if (activePlanCodigo === 'inicia') {
          if (!iniciaExcluidos.has(m.codigo)) allowedByPlanCodes.add(m.codigo);
        } else {
          allowedByPlanCodes.add(m.codigo);
        }
      }
      if (activePlanCodigo === 'empresa' && (m.modelo === 'publico' || m.modelo === 'crecimiento')) {
        allowedByPlanCodes.add(m.codigo);
      }
    });
  }

  // 7. Consultar Perfiles de la Empresa (para asignación o previsualización)
  const { data: empresaPerfiles } = await supabase
    .from('perfiles')
    .select('*')
    .or(`empresa_id.eq.${activeEmpresa.id},empresa_id.is.null`);

  const assignedPerfilRow = activeMembership.perfiles as unknown as Database['public']['Tables']['perfiles']['Row'];

  let activePerfilRow = assignedPerfilRow;
  let isSimulated = false;

  if (previewPerfilCodigo) {
    const simulated = (empresaPerfiles || []).find((p) => p.codigo === previewPerfilCodigo);
    if (simulated) {
      activePerfilRow = simulated;
      isSimulated = true;
    }
  }

  const activePerfilCodigo = activePerfilRow?.codigo || 'admin';
  const isAdmin = activePerfilCodigo === 'admin';

  // 8. Consultar Permisos del Perfil Activo (public.perfil_permisos + public.permisos)
  let userPermisosRows: Array<{
    permiso_codigo: string;
    alcance: string | null;
    permisos?: Database['public']['Tables']['permisos']['Row'];
  }> = [];

  if (activePerfilRow?.id) {
    const { data: ppRows } = await supabase
      .from('perfil_permisos')
      .select('permiso_codigo, alcance, permisos (*)')
      .eq('perfil_id', activePerfilRow.id);

    if (ppRows) {
      userPermisosRows = ppRows as unknown as typeof userPermisosRows;
    }
  }

  const userPermissionsMap = new Map<string, { alcance: string | null; desc?: string }>();
  userPermisosRows.forEach((p) => {
    userPermissionsMap.set(p.permiso_codigo, {
      alcance: p.alcance,
      desc: p.permisos?.descripcion,
    });
  });

  // Capacidades globales del perfil
  const canViewPrices = isAdmin || userPermissionsMap.has('precios.ver');
  const canValidateServices = isAdmin || userPermissionsMap.has('servicios.validar');
  const canEditConfig = isAdmin || userPermissionsMap.has('configuracion.editar');
  const canManageUsers = isAdmin || userPermissionsMap.has('usuarios.editar');

  // 9. Consultar Catálogo Completo de Módulos (public.modulos)
  let allModules: Database['public']['Tables']['modulos']['Row'][] = [];
  const { data: dbModulos } = await supabase
    .from('modulos')
    .select('*')
    .order('orden', { ascending: true });

  if (dbModulos && dbModulos.length > 0) {
    allModules = dbModulos;
  } else {
    allModules = MASTER_MODULES_FALLBACK;
  }

  // 10. FILTRADO TRIPLE (Plan + Área/Perfil + Permisos)
  const enabledModules: EnrichedModule[] = [];
  const planLockedModules: Array<{ codigo: string; nombre: string; grupo: string; requiredPlan: string }> = [];
  const roleRestrictedModules: Array<{ codigo: string; nombre: string; grupo: string }> = [];

  for (const m of allModules) {
    const isAllowedByPlan = allowedByPlanCodes.has(m.codigo);
    const hasViewPermission = isAdmin || userPermissionsMap.has(`${m.codigo}.ver`);

    if (isAllowedByPlan && hasViewPermission) {
      // Recolectar permisos granulares de este módulo para el perfil
      const modulePermissions: ModulePermissionDetail[] = [];

      // Permiso de acceso base
      modulePermissions.push({
        code: `${m.codigo}.ver`,
        description: 'Entrar y ver módulo',
        scope: isAdmin ? 'todas' : null,
      });

      // Permisos específicos asociados
      if (m.codigo === 'cotizaciones') {
        if (isAdmin || userPermissionsMap.has('cotizaciones.editar')) {
          modulePermissions.push({ code: 'cotizaciones.editar', description: 'Editar cotizaciones', scope: userPermissionsMap.get('cotizaciones.editar')?.alcance || (isAdmin ? 'todas' : 'propias') });
        }
        if (isAdmin || userPermissionsMap.has('cotizaciones.ver_montos')) {
          modulePermissions.push({ code: 'cotizaciones.ver_montos', description: 'Ver montos y totales', scope: userPermissionsMap.get('cotizaciones.ver_montos')?.alcance || null });
        }
      }

      if (m.codigo === 'calendario_trabajos') {
        if (canValidateServices) {
          modulePermissions.push({ code: 'servicios.validar', description: 'Validar servicios cerrados', scope: null });
        }
        if (isAdmin || userPermissionsMap.has('programacion.editar')) {
          modulePermissions.push({ code: 'programacion.editar', description: 'Programar y reprogramar', scope: userPermissionsMap.get('programacion.editar')?.alcance || 'todas' });
        }
      }

      if (m.codigo === 'cobranzas_comprobantes' && (isAdmin || userPermissionsMap.has('pagos.registrar'))) {
        modulePermissions.push({ code: 'pagos.registrar', description: 'Registrar cobros y pagos', scope: 'todas' });
      }

      if (m.codigo === 'configuraciones' && canEditConfig) {
        modulePermissions.push({ code: 'configuracion.editar', description: 'Editar datos de empresa', scope: null });
      }

      if (m.codigo === 'empresa_usuarios' && canManageUsers) {
        modulePermissions.push({ code: 'usuarios.editar', description: 'Invitar y gestionar personas', scope: null });
      }

      if (m.codigo === 'reportes') {
        if (isAdmin || userPermissionsMap.has('datos.exportar')) {
          modulePermissions.push({ code: 'datos.exportar', description: 'Exportar reportes a Excel', scope: null });
        }
        if (isAdmin || userPermissionsMap.has('costeo.ver')) {
          modulePermissions.push({ code: 'costeo.ver', description: 'Ver márgenes y rentabilidad', scope: null });
        }
      }

      // Resumen amigable de permisos
      let summary = 'Solo Lectura';
      if (isAdmin) {
        summary = 'Control Total (Administrador)';
      } else if (modulePermissions.some((p) => p.code.includes('editar') || p.code.includes('registrar'))) {
        summary = 'Lectura y Edición';
      } else if (modulePermissions.some((p) => p.code.includes('validar'))) {
        summary = 'Lectura y Validación';
      }

      enabledModules.push({
        codigo: m.codigo,
        nombre: m.nombre,
        grupo: m.grupo,
        modelo: m.modelo,
        etapa: m.etapa,
        disponible: m.disponible,
        orden: m.orden,
        permissions: modulePermissions,
        permissionSummary: summary,
      });
    } else if (!isAllowedByPlan) {
      const req = m.modelo === 'contrato' ? 'Complemento Contratos' : (m.modelo === 'publico' || m.modelo === 'crecimiento' ? 'Plan Empresa' : 'Plan Crece');
      planLockedModules.push({
        codigo: m.codigo,
        nombre: m.nombre,
        grupo: m.grupo,
        requiredPlan: req,
      });
    } else if (!hasViewPermission) {
      roleRestrictedModules.push({
        codigo: m.codigo,
        nombre: m.nombre,
        grupo: m.grupo,
      });
    }
  }

  // Lista de organizaciones para el selector
  const availableOrganizations = activeMembershipsList.map((m) => {
    const emp = m.empresas as unknown as Database['public']['Tables']['empresas']['Row'];
    return {
      id: m.empresa_id,
      nombre: emp?.nombre_comercial || emp?.razon_social || 'Mi Empresa',
      rol: m.es_propietario ? 'Propietario' : 'Miembro',
    };
  });

  // Lista de perfiles para la simulación
  const availableProfilesForPreview = (empresaPerfiles || [])
    .filter((p, index, self) => index === self.findIndex((t) => t.codigo === p.codigo))
    .map((p) => ({
      id: p.id,
      codigo: p.codigo || 'miembro',
      nombre: p.nombre,
      descripcion: p.descripcion,
    }));

  return {
    user: {
      id: authUser.id,
      nombre: usuarioRow?.nombre || (authUser.user_metadata?.full_name as string) || 'Usuario Vittkly',
      correo: authUser.email || '',
      avatarRuta: usuarioRow?.avatar_ruta || null,
    },
    activeOrganization: {
      id: activeEmpresa.id,
      razonSocial: activeEmpresa.razon_social,
      nombreComercial: activeEmpresa.nombre_comercial,
      ruc: activeEmpresa.ruc,
      modeloOperacion: activeEmpresa.modelo_operacion,
      moneda: activeEmpresa.moneda,
      pais: activeEmpresa.pais,
      activa: activeEmpresa.activa,
    },
    activePlan: {
      id: planId,
      codigo: activePlanCodigo,
      nombre: planNombre,
      usuariosIncluidos: planUsuarios,
      estadoSuscripcion: subEstado,
      pruebaHasta: subPruebaHasta,
    },
    activeProfile: {
      id: activePerfilRow?.id || 'admin',
      codigo: activePerfilCodigo,
      nombre: activePerfilRow?.nombre || 'Administrador',
      descripcion: activePerfilRow?.descripcion || null,
      esPropietario: activeMembership.es_propietario,
      accesoWeb: activeMembership.acceso_web,
      isSimulated,
    },
    globalCapabilities: {
      canViewPrices,
      canValidateServices,
      canEditConfig,
      canManageUsers,
    },
    enabledModules,
    planLockedModules,
    roleRestrictedModules,
    availableOrganizations,
    availableProfilesForPreview,
  };
}
