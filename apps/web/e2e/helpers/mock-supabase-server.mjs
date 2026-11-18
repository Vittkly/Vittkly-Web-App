import http from "node:http";
import { randomUUID } from "node:crypto";
import { buildDefaultSeed, TEST_IDS } from "./seed-data.mjs";

const MOCK_ANON_KEY = "mock-anon-key-vittkly-e2e";

const RELATIONS = {
  membresias: {
    empresas: { table: "empresas", localKey: "empresa_id", foreignKey: "id" },
    perfiles: { table: "perfiles", localKey: "perfil_id", foreignKey: "id" },
    usuarios: { table: "usuarios", localKey: "usuario_id", foreignKey: "id" },
  },
  cuentas: {
    suscripciones: {
      table: "suscripciones",
      localKey: "id",
      foreignKey: "cuenta_id",
    },
  },
  suscripciones: {
    planes: { table: "planes", localKey: "plan_id", foreignKey: "id" },
  },
  perfil_permisos: {
    permisos: {
      table: "permisos",
      localKey: "permiso_codigo",
      foreignKey: "codigo",
    },
    perfiles: { table: "perfiles", localKey: "perfil_id", foreignKey: "id" },
  },
  solicitudes_salida: {
    usuarios: { table: "usuarios", localKey: "usuario_id", foreignKey: "id" },
    membresias: {
      table: "membresias",
      localKey: "membresia_id",
      foreignKey: "id",
    },
  },
  invitaciones: {
    perfiles: { table: "perfiles", localKey: "perfil_id", foreignKey: "id" },
    empresas: { table: "empresas", localKey: "empresa_id", foreignKey: "id" },
  },
  auditoria: {
    usuarios: { table: "usuarios", localKey: "usuario_id", foreignKey: "id" },
  },
};

function base64UrlEncode(input) {
  return Buffer.from(
    typeof input === "string" ? input : JSON.stringify(input),
  )
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, "base64").toString("utf8");
}

function createMockJwt(user) {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode({ alg: "HS256", typ: "JWT" });
  const payload = base64UrlEncode({
    aud: "authenticated",
    exp: nowSec + 7200,
    iat: nowSec,
    sub: user.id,
    email: user.email,
    role: "authenticated",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: user.user_metadata ?? {},
  });
  const sig = base64UrlEncode("vittkly-mock-signature");
  return `${header}.${payload}.${sig}`;
}

function toAuthUserObject(user) {
  const nowIso = new Date().toISOString();
  return {
    id: user.id,
    aud: "authenticated",
    role: "authenticated",
    email: user.email,
    email_confirmed_at: nowIso,
    phone: "",
    confirmed_at: nowIso,
    last_sign_in_at: nowIso,
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: user.user_metadata ?? {},
    identities: [],
    created_at: nowIso,
    updated_at: nowIso,
  };
}

function splitTopLevel(input, sep = ",") {
  const parts = [];
  let depth = 0;
  let inQuote = false;
  let quoteChar = "";
  let current = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inQuote) {
      current += ch;
      if (ch === quoteChar && input[i - 1] !== "\\") {
        inQuote = false;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inQuote = true;
      quoteChar = ch;
      current += ch;
      continue;
    }
    if (ch === "(" || ch === "{" || ch === "[") {
      depth++;
      current += ch;
      continue;
    }
    if (ch === ")" || ch === "}" || ch === "]") {
      depth = Math.max(0, depth - 1);
      current += ch;
      continue;
    }
    if (ch === sep && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function parseSelectSpec(selectStr) {
  if (!selectStr || selectStr.trim() === "*") {
    return { includeAll: true, columns: [], relations: [] };
  }
  const tokens = splitTopLevel(selectStr.replace(/\s+/g, " ").trim());
  let includeAll = false;
  const columns = [];
  const relations = [];

  for (const token of tokens) {
    const parenIdx = token.indexOf("(");
    if (parenIdx === -1) {
      if (token === "*") {
        includeAll = true;
      } else {
        const cleanCol = token.includes(":") ? token.split(":")[1] : token;
        columns.push({ raw: token, col: cleanCol.trim(), alias: token.includes(":") ? token.split(":")[0].trim() : cleanCol.trim() });
      }
      continue;
    }

    const head = token.slice(0, parenIdx).trim();
    const lastParen = token.lastIndexOf(")");
    const inner = token.slice(parenIdx + 1, lastParen > parenIdx ? lastParen : undefined).trim();
    const isInner = head.includes("!inner");
    const headNoHint = head.replace(/!(inner|left)/g, "").trim();
    let outputKey = headNoHint;
    let relationName = headNoHint;
    if (headNoHint.includes(":")) {
      const [alias, fkOrTable] = headNoHint.split(":");
      outputKey = alias.trim();
      const target = fkOrTable.trim();
      if (target.endsWith("_id")) {
        relationName = target === "usuario_id" ? "usuarios" : target === "perfil_id" ? "perfiles" : target === "empresa_id" ? "empresas" : target === "membresia_id" ? "membresias" : target;
      } else {
        relationName = target;
      }
    }
    relations.push({
      outputKey,
      relationName,
      isInner,
      nested: parseSelectSpec(inner),
    });
  }

  return { includeAll, columns, relations };
}

function projectRow(row, tableName, spec, dbState) {
  if (!row) return null;
  let result = {};
  if (spec.includeAll) {
    result = { ...row };
  } else {
    for (const c of spec.columns) {
      result[c.alias] = row[c.col] !== undefined ? row[c.col] : null;
    }
  }

  const tableRels = RELATIONS[tableName] || {};
  for (const rel of spec.relations) {
    const relMeta = tableRels[rel.relationName] || tableRels[rel.outputKey];
    if (!relMeta) {
      result[rel.outputKey] = null;
      continue;
    }
    const targetRows = dbState[relMeta.table] || [];
    const localVal = row[relMeta.localKey];
    const matched = localVal == null
      ? null
      : targetRows.find((r) => String(r[relMeta.foreignKey]) === String(localVal)) || null;

    if (!matched) {
      if (rel.isInner) return null;
      result[rel.outputKey] = null;
    } else {
      const projectedChild = projectRow(matched, relMeta.table, rel.nested, dbState);
      if (rel.isInner && projectedChild === null) return null;
      result[rel.outputKey] = projectedChild;
    }
  }

  return result;
}

function coerceComparable(a, b) {
  if (a === b) return true;
  if (a === null || a === undefined) return false;
  if (typeof a === "boolean") {
    if (b === "true") return a === true;
    if (b === "false") return a === false;
  }
  if (typeof a === "number" && typeof b === "string" && b !== "" && !Number.isNaN(Number(b))) {
    return a === Number(b);
  }
  return String(a) === String(b);
}

function matchLikePattern(value, pattern, caseInsensitive) {
  if (value === null || value === undefined) return false;
  const normalizedPattern = pattern.replace(/\*/g, "%");
  const escaped = normalizedPattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/%/g, ".*")
    .replace(/_/g, ".");
  const regex = new RegExp(`^${escaped}$`, caseInsensitive ? "is" : "s");
  return regex.test(String(value));
}

function evaluateOp(rowVal, rawOpExpr) {
  let expr = rawOpExpr;
  let negated = false;
  if (expr.startsWith("not.")) {
    negated = true;
    expr = expr.slice(4);
  }

  const dotIdx = expr.indexOf(".");
  if (dotIdx === -1) return true;
  const op = expr.slice(0, dotIdx);
  const val = expr.slice(dotIdx + 1);

  let matched = false;
  switch (op) {
    case "eq":
      matched = coerceComparable(rowVal, val);
      break;
    case "neq":
      matched = !coerceComparable(rowVal, val);
      break;
    case "gt":
      matched = rowVal != null && String(rowVal) > val;
      break;
    case "gte":
      matched = rowVal != null && (typeof rowVal === "number" ? rowVal >= Number(val) : String(rowVal) >= val);
      break;
    case "lt":
      matched = rowVal != null && String(rowVal) < val;
      break;
    case "lte":
      matched = rowVal != null && (typeof rowVal === "number" ? rowVal <= Number(val) : String(rowVal) <= val);
      break;
    case "like":
      matched = matchLikePattern(rowVal, val, false);
      break;
    case "ilike":
      matched = matchLikePattern(rowVal, val, true);
      break;
    case "is":
      if (val === "null") matched = rowVal === null || rowVal === undefined;
      else if (val === "true") matched = rowVal === true;
      else if (val === "false") matched = rowVal === false;
      break;
    case "in": {
      const inner = val.replace(/^\(/, "").replace(/\)$/, "");
      const items = splitTopLevel(inner).map((item) =>
        item.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1"),
      );
      matched = items.some((item) => coerceComparable(rowVal, item));
      break;
    }
    case "cs": {
      const inner = val.replace(/^\{/, "").replace(/\}$/, "").replace(/^\[/, "").replace(/\]$/, "");
      const needles = splitTopLevel(inner).map((s) => s.replace(/^"(.*)"$/, "$1"));
      if (Array.isArray(rowVal)) {
        matched = needles.every((n) => rowVal.some((v) => coerceComparable(v, n)));
      }
      break;
    }
    default:
      matched = true;
  }

  return negated ? !matched : matched;
}

function evaluateLogicalExpr(row, exprStr) {
  const trimmed = exprStr.trim();
  if (trimmed.startsWith("or(") && trimmed.endsWith(")")) {
    const inner = trimmed.slice(3, -1);
    const parts = splitTopLevel(inner);
    return parts.some((p) => evaluateLogicalExpr(row, p));
  }
  if (trimmed.startsWith("and(") && trimmed.endsWith(")")) {
    const inner = trimmed.slice(4, -1);
    const parts = splitTopLevel(inner);
    return parts.every((p) => evaluateLogicalExpr(row, p));
  }
  const firstDot = trimmed.indexOf(".");
  if (firstDot === -1) return true;
  const col = trimmed.slice(0, firstDot);
  const rest = trimmed.slice(firstDot + 1);
  return evaluateOp(row[col], rest);
}

function applyFilters(rows, searchParams) {
  const filters = [];
  for (const [key, value] of searchParams.entries()) {
    if (["select", "order", "limit", "offset", "on_conflict", "columns"].includes(key)) {
      continue;
    }
    if (key === "or" || key === "and") {
      const inner = value.replace(/^\(/, "").replace(/\)$/, "");
      filters.push({ type: key, exprs: splitTopLevel(inner) });
    } else {
      filters.push({ type: "col", col: key, opExpr: value });
    }
  }

  return rows.filter((row) =>
    filters.every((f) => {
      if (f.type === "or") {
        return f.exprs.some((expr) => evaluateLogicalExpr(row, expr));
      }
      if (f.type === "and") {
        return f.exprs.every((expr) => evaluateLogicalExpr(row, expr));
      }
      return evaluateOp(row[f.col], f.opExpr);
    }),
  );
}

function applyOrdering(rows, orderParam) {
  if (!orderParam) return rows;
  const specs = orderParam.split(",").map((part) => {
    const tokens = part.trim().split(".");
    return {
      col: tokens[0],
      desc: tokens.includes("desc"),
    };
  });

  return [...rows].sort((a, b) => {
    for (const s of specs) {
      const va = a[s.col];
      const vb = b[s.col];
      if (va === vb) continue;
      if (va == null) return 1;
      if (vb == null) return -1;
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb));
      if (cmp !== 0) return s.desc ? -cmp : cmp;
    }
    return 0;
  });
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function sendJson(res, status, data, extraHeaders = {}) {
  const body = status === 204 ? "" : JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Expose-Headers": "Content-Range",
    ...extraHeaders,
  });
  res.end(body);
}

export function createMockSupabaseServer() {
  let dbState = buildDefaultSeed();
  const activeSessions = new Map();

  function resolveUserFromAuthHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.slice(7).trim();
    if (!token || token === MOCK_ANON_KEY) return null;

    if (activeSessions.has(token)) {
      return activeSessions.get(token);
    }

    const parts = token.split(".");
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(base64UrlDecode(parts[1]));
        if (payload?.sub) {
          const found = dbState.authUsers.find((u) => u.id === payload.sub);
          if (found) return found;
        }
      } catch {
        return null;
      }
    }
    return null;
  }

  function buildMisAccesos(userId) {
    const usuarioRow = dbState.usuarios.find((u) => u.id === userId);
    const activeMemberships = dbState.membresias.filter(
      (m) => m.usuario_id === userId && m.estado === "activa" && m.activo,
    );

    const toEmpresaEntry = (m) => {
      const emp = dbState.empresas.find((e) => e.id === m.empresa_id);
      const perf = dbState.perfiles.find((p) => p.id === m.perfil_id);
      return {
        membresia_id: m.id,
        empresa_id: m.empresa_id,
        nombre: emp?.nombre_comercial || emp?.razon_social || "Empresa",
        rubro: "Servicios",
        ciudad: "Lima",
        perfil_id: m.perfil_id,
        perfil_nombre: perf?.nombre || "Miembro",
        perfil_codigo: perf?.codigo || "miembro",
        es_propietario: Boolean(m.es_propietario),
        acceso_web: Boolean(m.acceso_web),
        acceso_app: Boolean(m.acceso_app),
        solicitud_salida: null,
      };
    };

    const pendingInvs = dbState.invitaciones
      .filter((inv) => inv.usuario_id === userId && inv.estado === "pendiente")
      .map((inv) => {
        const emp = dbState.empresas.find((e) => e.id === inv.empresa_id);
        const perf = dbState.perfiles.find((p) => p.id === inv.perfil_id);
        return {
          id: inv.id,
          empresa_id: inv.empresa_id,
          empresa_nombre: emp?.nombre_comercial || emp?.razon_social || "Empresa",
          perfil_id: inv.perfil_id,
          perfil_nombre: perf?.nombre || "Colaborador",
          invitador_nombre: "Administrador",
          acceso_web: Boolean(inv.acceso_web),
          acceso_app: Boolean(inv.acceso_app),
          vence_en: inv.vence_en,
          creado_en: inv.creado_en,
        };
      });

    return {
      usuario: {
        id: userId,
        nombre: usuarioRow?.nombre || "Usuario Vittkly",
        correo: usuarioRow?.correo || null,
        ultima_empresa_id: usuarioRow?.ultima_empresa_id || null,
        prueba_usada_en: usuarioRow?.prueba_usada_en || null,
      },
      cuenta_actual: {
        cuenta_id: TEST_IDS.CUENTA_PRIMARY,
        cuenta_nombre: "Cuenta Vitta Kleanly",
        plan_codigo: "empresa",
        plan_nombre: "Empresa",
        precio_mensual_centimos: 29900,
        empresa_actual_nombre: "Vitta Kleanly",
      },
      empresas_propias: activeMemberships
        .filter((m) => m.es_propietario)
        .map(toEmpresaEntry),
      empresas_miembro: activeMemberships
        .filter((m) => !m.es_propietario)
        .map(toEmpresaEntry),
      invitaciones: pendingInvs,
    };
  }

  const server = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,HEAD,OPTIONS",
        "Access-Control-Allow-Headers": "*",
      });
      res.end();
      return;
    }

    const reqUrl = new URL(req.url || "/", "http://127.0.0.1");
    const pathname = reqUrl.pathname;

    try {
      // 1. Control endpoints
      if (pathname === "/__test__/health") {
        sendJson(res, 200, { ok: true });
        return;
      }

      if (pathname === "/__test__/reset" && req.method === "POST") {
        const body = await readBody(req);
        const refMs =
          body && typeof body.referenceNowMs === "number"
            ? body.referenceNowMs
            : Date.now();
        dbState = buildDefaultSeed(refMs);
        activeSessions.clear();
        sendJson(res, 200, { ok: true, auditoriaCount: dbState.auditoria.length });
        return;
      }

      if (pathname === "/__test__/seed" && req.method === "POST") {
        const body = await readBody(req);
        if (body && typeof body === "object") {
          if (body.replace && typeof body.replace === "object") {
            for (const [tbl, rows] of Object.entries(body.replace)) {
              dbState[tbl] = rows;
            }
          }
          if (body.append && typeof body.append === "object") {
            for (const [tbl, rows] of Object.entries(body.append)) {
              if (!Array.isArray(dbState[tbl])) dbState[tbl] = [];
              dbState[tbl].push(...rows);
            }
          }
        }
        sendJson(res, 200, { ok: true });
        return;
      }

      // 2. Auth endpoints
      if (pathname === "/auth/v1/token" && req.method === "POST") {
        const grantType = reqUrl.searchParams.get("grant_type") || "password";
        const body = (await readBody(req)) || {};

        let authUser = null;
        if (grantType === "password") {
          const email = String(body.email || "").trim().toLowerCase();
          const password = String(body.password || "");
          authUser = dbState.authUsers.find(
            (u) => u.email.toLowerCase() === email && u.password === password,
          );
          if (!authUser) {
            sendJson(res, 400, {
              error: "invalid_grant",
              error_description: "Invalid login credentials",
            });
            return;
          }
        } else if (grantType === "refresh_token") {
          const userId = String(body.refresh_token || "").replace("refresh-", "");
          authUser =
            dbState.authUsers.find((u) => u.id === userId) ||
            dbState.authUsers[0];
        }

        if (!authUser) {
          sendJson(res, 400, { error: "invalid_grant" });
          return;
        }

        const accessToken = createMockJwt(authUser);
        const refreshToken = `refresh-${authUser.id}`;
        activeSessions.set(accessToken, authUser);

        sendJson(res, 200, {
          access_token: accessToken,
          token_type: "bearer",
          expires_in: 7200,
          expires_at: Math.floor(Date.now() / 1000) + 7200,
          refresh_token: refreshToken,
          user: toAuthUserObject(authUser),
        });
        return;
      }

      if (pathname === "/auth/v1/user" && req.method === "GET") {
        const authUser = resolveUserFromAuthHeader(req.headers.authorization);
        if (!authUser) {
          sendJson(res, 401, {
            code: 401,
            error_code: "bad_jwt",
            msg: "Invalid JWT",
          });
          return;
        }
        sendJson(res, 200, toAuthUserObject(authUser));
        return;
      }

      if (pathname === "/auth/v1/logout" && req.method === "POST") {
        const authHeader = req.headers.authorization || "";
        if (authHeader.startsWith("Bearer ")) {
          activeSessions.delete(authHeader.slice(7).trim());
        }
        sendJson(res, 204, null);
        return;
      }

      if (pathname === "/auth/v1/recover" && req.method === "POST") {
        sendJson(res, 200, {});
        return;
      }

      // 3. RPC endpoints
      if (pathname.startsWith("/rest/v1/rpc/") && req.method === "POST") {
        const rpcName = pathname.slice("/rest/v1/rpc/".length);
        const body = (await readBody(req)) || {};
        const authUser = resolveUserFromAuthHeader(req.headers.authorization);

        switch (rpcName) {
          case "ingreso_bloqueado_hasta":
            sendJson(res, 200, null);
            return;
          case "registrar_intento":
            sendJson(res, 200, null);
            return;
          case "es_staff":
            sendJson(
              res,
              200,
              Boolean(
                authUser &&
                  dbState.staff_plataforma.some(
                    (s) => s.usuario_id === authUser.id && s.activo,
                  ),
              ),
            );
            return;
          case "mis_accesos":
            if (!authUser) {
              sendJson(res, 401, { message: "Unauthorized" });
              return;
            }
            sendJson(res, 200, buildMisAccesos(authUser.id));
            return;
          case "guardar_perfil_empresa": {
            const profileId = body.p_profile_id || randomUUID();
            const existing = dbState.perfiles.find((p) => p.id === profileId);
            if (existing) {
              existing.nombre = body.p_nombre;
              existing.descripcion = body.p_descripcion;
              existing.recomendado_para = body.p_recomendado_para;
              existing.configuracion = body.p_configuracion;
            } else {
              dbState.perfiles.push({
                id: profileId,
                empresa_id: body.p_empresa_id,
                codigo: null,
                nombre: body.p_nombre,
                descripcion: body.p_descripcion,
                recomendado_para: body.p_recomendado_para,
                configuracion: body.p_configuracion,
                es_base: false,
              });
            }
            sendJson(res, 200, profileId);
            return;
          }
          case "buscar_persona_por_documento":
            sendJson(res, 200, {
              estado: "no_encontrado",
              tipo_documento: body.p_tipo_documento || "DNI",
              documento_normalizado: body.p_numero_documento || "",
            });
            return;
          case "responder_invitacion":
            sendJson(res, 200, {
              aceptada: Boolean(body.p_acepta),
              empresa_id: TEST_IDS.ORG_INVITING,
              acceso_web: true,
            });
            return;
          default:
            sendJson(res, 404, {
              code: "PGRST202",
              message: `Could not find the function public.${rpcName}`,
            });
            return;
        }
      }

      // 4. PostgREST table endpoints
      if (pathname.startsWith("/rest/v1/")) {
        const tableName = pathname.slice("/rest/v1/".length).split("/")[0];
        if (!Array.isArray(dbState[tableName])) {
          sendJson(res, 404, {
            code: "42P01",
            message: `relation "public.${tableName}" does not exist`,
          });
          return;
        }

        const prefer = String(req.headers.prefer || "");
        const accept = String(req.headers.accept || "");
        const wantsObject = accept.includes("application/vnd.pgrst.object+json");
        const wantsExactCount = prefer.includes("count=exact");

        if (req.method === "GET" || req.method === "HEAD") {
          const filtered = applyFilters(dbState[tableName], reqUrl.searchParams);
          const ordered = applyOrdering(
            filtered,
            reqUrl.searchParams.get("order"),
          );
          const selectSpec = parseSelectSpec(
            reqUrl.searchParams.get("select") || "*",
          );
          const projected = ordered
            .map((r) => projectRow(r, tableName, selectSpec, dbState))
            .filter((r) => r !== null);

          const totalCount = projected.length;
          let offset = Number(reqUrl.searchParams.get("offset") || "0");
          let limit = reqUrl.searchParams.get("limit")
            ? Number(reqUrl.searchParams.get("limit"))
            : null;

          if (req.headers.range) {
            const rangeMatch = String(req.headers.range).match(/(\d+)-(\d+)/);
            if (rangeMatch) {
              offset = Number(rangeMatch[1]);
              limit = Number(rangeMatch[2]) - offset + 1;
            }
          }

          const sliced =
            limit !== null
              ? projected.slice(offset, offset + limit)
              : projected.slice(offset);

          const extraHeaders = {};
          if (wantsExactCount) {
            const rangeSpan =
              sliced.length > 0
                ? `${offset}-${offset + sliced.length - 1}`
                : "*";
            extraHeaders["Content-Range"] = `${rangeSpan}/${totalCount}`;
          }

          if (req.method === "HEAD") {
            res.writeHead(200, {
              "Access-Control-Expose-Headers": "Content-Range",
              ...extraHeaders,
            });
            res.end();
            return;
          }

          if (wantsObject) {
            if (sliced.length !== 1) {
              sendJson(res, 406, {
                code: "PGRST116",
                details: `The result contains ${sliced.length} rows`,
                hint: null,
                message: "JSON object requested, multiple (or no) rows returned",
              });
              return;
            }
            sendJson(res, 200, sliced[0], extraHeaders);
            return;
          }

          sendJson(res, 200, sliced, extraHeaders);
          return;
        }

        if (req.method === "PATCH") {
          const body = (await readBody(req)) || {};
          const matched = applyFilters(dbState[tableName], reqUrl.searchParams);
          for (const row of matched) {
            Object.assign(row, body);
          }
          if (prefer.includes("return=representation")) {
            sendJson(res, 200, matched);
          } else {
            sendJson(res, 204, null);
          }
          return;
        }

        if (req.method === "POST") {
          const body = await readBody(req);
          const items = Array.isArray(body) ? body : [body];
          const inserted = items.map((item) => {
            const rec = { id: randomUUID(), ...item };
            if (prefer.includes("resolution=merge-duplicates") && rec.id) {
              const idx = dbState[tableName].findIndex((r) => r.id === rec.id);
              if (idx >= 0) {
                dbState[tableName][idx] = { ...dbState[tableName][idx], ...rec };
                return dbState[tableName][idx];
              }
            }
            dbState[tableName].push(rec);
            return rec;
          });
          if (prefer.includes("return=representation")) {
            sendJson(res, 201, wantsObject ? inserted[0] : inserted);
          } else {
            sendJson(res, 201, null);
          }
          return;
        }

        if (req.method === "DELETE") {
          const matched = new Set(
            applyFilters(dbState[tableName], reqUrl.searchParams),
          );
          dbState[tableName] = dbState[tableName].filter((r) => !matched.has(r));
          sendJson(res, 204, null);
          return;
        }
      }

      sendJson(res, 404, { error: `Unhandled route: ${req.method} ${pathname}` });
    } catch (err) {
      sendJson(res, 500, {
        error: err instanceof Error ? err.message : "Internal mock error",
      });
    }
  });

  return server;
}

if (
  process.argv[1] &&
  import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))
) {
  const port = Number(process.env.MOCK_SUPABASE_PORT || "54329");
  const server = createMockSupabaseServer();
  server.listen(port, "127.0.0.1", () => {
    console.log(`[mock-supabase] listening on http://127.0.0.1:${port}`);
  });
}
