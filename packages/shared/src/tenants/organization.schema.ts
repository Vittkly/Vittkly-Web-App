import { z } from 'zod';

/** Identificador de empresa (`public.empresas.id`) recibido desde cliente: siempre UUID. */
export const organizationIdSchema = z.uuid('Identificador de empresa inválido');
