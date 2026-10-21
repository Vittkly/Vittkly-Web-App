import { z } from 'zod';

/**
 * Esquemas de validación Zod compartidos entre Central Web y App Móvil.
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'El correo electrónico es requerido')
  .email('Ingresa un correo electrónico válido');

export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe incluir al menos una letra mayúscula')
  .regex(/[0-9]/, 'Debe incluir al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe incluir al menos un carácter especial');

export const pinSchema = z
  .string()
  .regex(/^\d{4}$/, 'El PIN debe ser exactamente de 4 dígitos numéricos');

export const internationalPhoneSchema = z
  .string()
  .trim()
  .min(8, 'Número telefónico inválido')
  .regex(/^\+?[1-9]\d{7,14}$/, 'Formato telefónico internacional requerido');

/**
 * Constantes y utilitarios agnósticos de la plataforma.
 */
export const VITTKLY_ROLES = ['owner', 'admin', 'member'] as const;
export type VittklyRole = (typeof VITTKLY_ROLES)[number];

export const WORK_ORDER_STATUSES = [
  'programada',
  'en-ruta',
  'en-curso',
  'completada',
  'pagada',
  'pendiente',
  'atrasada',
  'por-vencer',
  'cancelada',
] as const;
export type WorkOrderStatusType = (typeof WORK_ORDER_STATUSES)[number];
