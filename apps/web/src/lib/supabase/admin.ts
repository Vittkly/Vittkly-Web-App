import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Cliente administrativo de Supabase con privilegios `service_role`.
 *
 * BLINDAJE DE SEGURIDAD (AppSec):
 * - Protegido por `server-only`: Este módulo NUNCA puede ser importado en componentes del cliente.
 * - Consume `SUPABASE_SERVICE_ROLE_KEY` (sin prefijo NEXT_PUBLIC_).
 * - Se utiliza de manera estrictamente aislada en Server Actions para invocar las funciones
 *   RPC de protección contra ataques de fuerza bruta (`ingreso_bloqueado_hasta` y `registrar_intento`).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      '[Vittkly AppSec] Variable de entorno NEXT_PUBLIC_SUPABASE_URL no configurada.'
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      '[Vittkly AppSec] Variable de entorno SUPABASE_SERVICE_ROLE_KEY no configurada. Este valor es obligatorio para operaciones administrativas del servidor.'
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
