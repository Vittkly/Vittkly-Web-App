export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type MembershipRole = 'owner' | 'admin' | 'member';
export type MembershipStatus = 'active' | 'suspended' | 'invited';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
export type AccessScope = 'app' | 'web' | 'both';
export type WorkOrderStatus =
  | 'programada'
  | 'en-ruta'
  | 'en-curso'
  | 'completada'
  | 'pagada'
  | 'pendiente'
  | 'atrasada'
  | 'por-vencer'
  | 'cancelada';

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          ruc: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          logo_url: string | null;
          mark_url: string | null;
          brand_color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          ruc?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          logo_url?: string | null;
          mark_url?: string | null;
          brand_color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          ruc?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          logo_url?: string | null;
          mark_url?: string | null;
          brand_color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      access_profiles: {
        Row: {
          id: string;
          org_id: string | null;
          name: string;
          std_key: string | null;
          description: string | null;
          recommended_for: string | null;
          config_sections: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id?: string | null;
          name: string;
          std_key?: string | null;
          description?: string | null;
          recommended_for?: string | null;
          config_sections?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string | null;
          name?: string;
          std_key?: string | null;
          description?: string | null;
          recommended_for?: string | null;
          config_sections?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      memberships: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: MembershipRole;
          status: MembershipStatus;
          access_profile_id: string | null;
          job_title: string | null;
          access_scope: AccessScope;
          agenda_name: string | null;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role?: MembershipRole;
          status?: MembershipStatus;
          access_profile_id?: string | null;
          job_title?: string | null;
          access_scope?: AccessScope;
          agenda_name?: string | null;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          role?: MembershipRole;
          status?: MembershipStatus;
          access_profile_id?: string | null;
          job_title?: string | null;
          access_scope?: AccessScope;
          agenda_name?: string | null;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invitations: {
        Row: {
          id: string;
          org_id: string;
          email: string | null;
          phone: string | null;
          role: MembershipRole;
          access_profile_id: string | null;
          invitation_code: string;
          status: InvitationStatus;
          expires_at: string;
          accepted_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          email?: string | null;
          phone?: string | null;
          role?: MembershipRole;
          access_profile_id?: string | null;
          invitation_code: string;
          status?: InvitationStatus;
          expires_at: string;
          accepted_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          email?: string | null;
          phone?: string | null;
          role?: MembershipRole;
          access_profile_id?: string | null;
          invitation_code?: string;
          status?: InvitationStatus;
          expires_at?: string;
          accepted_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          org_id: string;
          full_name: string;
          company_name: string | null;
          doc_type: string | null;
          doc_number: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          full_name: string;
          company_name?: string | null;
          doc_type?: string | null;
          doc_number?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          full_name?: string;
          company_name?: string | null;
          doc_type?: string | null;
          doc_number?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      work_orders: {
        Row: {
          id: string;
          org_id: string;
          code: string;
          customer_id: string | null;
          technician_id: string | null;
          title: string;
          description: string | null;
          status: WorkOrderStatus;
          scheduled_date: string | null;
          start_time: string | null;
          end_time: string | null;
          address: string | null;
          total_amount: number | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          code: string;
          customer_id?: string | null;
          technician_id?: string | null;
          title: string;
          description?: string | null;
          status?: WorkOrderStatus;
          scheduled_date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          address?: string | null;
          total_amount?: number | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          code?: string;
          customer_id?: string | null;
          technician_id?: string | null;
          title?: string;
          description?: string | null;
          status?: WorkOrderStatus;
          scheduled_date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          address?: string | null;
          total_amount?: number | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      time_entries: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          work_order_id: string | null;
          started_at: string;
          ended_at: string | null;
          duration_seconds: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          work_order_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          work_order_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      usuarios: {
        Row: {
          id: string;
          nombre: string;
          correo: string | null;
          celular: string | null;
          avatar_ruta: string | null;
          ultima_empresa_id: string | null;
          ultimo_ingreso_en: string | null;
          creado_en: string;
          actualizado_en: string;
          actualizado_por: string | null;
        };
        Insert: {
          id: string;
          nombre: string;
          correo?: string | null;
          celular?: string | null;
          avatar_ruta?: string | null;
          ultima_empresa_id?: string | null;
          ultimo_ingreso_en?: string | null;
          creado_en?: string;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Update: {
          id?: string;
          nombre?: string;
          correo?: string | null;
          celular?: string | null;
          avatar_ruta?: string | null;
          ultima_empresa_id?: string | null;
          ultimo_ingreso_en?: string | null;
          creado_en?: string;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Relationships: [];
      };
      intentos_ingreso: {
        Row: {
          id: string;
          identificador: string;
          fallos_consecutivos: number;
          bloqueado_hasta: string | null;
          ultimo_intento_en: string;
          creado_en: string;
        };
        Insert: {
          id?: string;
          identificador: string;
          fallos_consecutivos?: number;
          bloqueado_hasta?: string | null;
          ultimo_intento_en?: string;
          creado_en?: string;
        };
        Update: {
          id?: string;
          identificador?: string;
          fallos_consecutivos?: number;
          bloqueado_hasta?: string | null;
          ultimo_intento_en?: string;
          creado_en?: string;
        };
        Relationships: [];
      };
      empresas: {
        Row: {
          id: string;
          cuenta_id: string;
          razon_social: string;
          nombre_comercial: string | null;
          ruc: string | null;
          direccion: string | null;
          logo_ruta: string | null;
          color_marca: string | null;
          modelo_operacion: string;
          zona_horaria: string;
          pais: string;
          moneda: string;
          activa: boolean;
          creado_en: string;
          creado_por: string | null;
          actualizado_en: string;
          actualizado_por: string | null;
          eliminado_en: string | null;
        };
        Insert: {
          id?: string;
          cuenta_id: string;
          razon_social: string;
          nombre_comercial?: string | null;
          ruc?: string | null;
          direccion?: string | null;
          logo_ruta?: string | null;
          color_marca?: string | null;
          modelo_operacion?: string;
          zona_horaria?: string;
          pais?: string;
          moneda?: string;
          activa?: boolean;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
          eliminado_en?: string | null;
        };
        Update: {
          id?: string;
          cuenta_id?: string;
          razon_social?: string;
          nombre_comercial?: string | null;
          ruc?: string | null;
          direccion?: string | null;
          logo_ruta?: string | null;
          color_marca?: string | null;
          modelo_operacion?: string;
          zona_horaria?: string;
          pais?: string;
          moneda?: string;
          activa?: boolean;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
          eliminado_en?: string | null;
        };
        Relationships: [];
      };
      membresias: {
        Row: {
          id: string;
          empresa_id: string;
          usuario_id: string;
          perfil_id: string;
          es_propietario: boolean;
          acceso_web: boolean;
          activo: boolean;
          invitado_por: string | null;
          creado_en: string;
          creado_por: string | null;
          actualizado_en: string;
          actualizado_por: string | null;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          usuario_id: string;
          perfil_id: string;
          es_propietario?: boolean;
          acceso_web?: boolean;
          activo?: boolean;
          invitado_por?: string | null;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Update: {
          id?: string;
          empresa_id?: string;
          usuario_id?: string;
          perfil_id?: string;
          es_propietario?: boolean;
          acceso_web?: boolean;
          activo?: boolean;
          invitado_por?: string | null;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Relationships: [];
      };
      planes: {
        Row: {
          id: string;
          codigo: string;
          nombre: string;
          precio_mensual_centimos: number | null;
          precio_anual_centimos: number | null;
          moneda: string;
          usuarios_incluidos: number;
          orden: number;
          activo: boolean;
          creado_en: string;
          creado_por: string | null;
          actualizado_en: string;
          actualizado_por: string | null;
        };
        Insert: {
          id?: string;
          codigo: string;
          nombre: string;
          precio_mensual_centimos?: number | null;
          precio_anual_centimos?: number | null;
          moneda?: string;
          usuarios_incluidos: number;
          orden: number;
          activo?: boolean;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Update: {
          id?: string;
          codigo?: string;
          nombre?: string;
          precio_mensual_centimos?: number | null;
          precio_anual_centimos?: number | null;
          moneda?: string;
          usuarios_incluidos?: number;
          orden?: number;
          activo?: boolean;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Relationships: [];
      };
      modulos: {
        Row: {
          codigo: string;
          nombre: string;
          grupo: string;
          modelo: string;
          etapa: number;
          disponible: boolean;
          orden: number;
          creado_en: string;
          creado_por: string | null;
          actualizado_en: string;
          actualizado_por: string | null;
        };
        Insert: {
          codigo: string;
          nombre: string;
          grupo: string;
          modelo: string;
          etapa: number;
          disponible?: boolean;
          orden: number;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Update: {
          codigo?: string;
          nombre?: string;
          grupo?: string;
          modelo?: string;
          etapa?: number;
          disponible?: boolean;
          orden?: number;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Relationships: [];
      };
      plan_modulos: {
        Row: {
          plan_id: string;
          modulo_codigo: string;
          creado_en: string;
          creado_por: string | null;
        };
        Insert: {
          plan_id: string;
          modulo_codigo: string;
          creado_en?: string;
          creado_por?: string | null;
        };
        Update: {
          plan_id?: string;
          modulo_codigo?: string;
          creado_en?: string;
          creado_por?: string | null;
        };
        Relationships: [];
      };
      permisos: {
        Row: {
          codigo: string;
          modulo_codigo: string;
          descripcion: string;
          con_alcance: boolean;
          creado_en: string;
          creado_por: string | null;
          actualizado_en: string;
          actualizado_por: string | null;
        };
        Insert: {
          codigo: string;
          modulo_codigo: string;
          descripcion: string;
          con_alcance?: boolean;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Update: {
          codigo?: string;
          modulo_codigo?: string;
          descripcion?: string;
          con_alcance?: boolean;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Relationships: [];
      };
      perfiles: {
        Row: {
          id: string;
          empresa_id: string | null;
          codigo: string | null;
          nombre: string;
          descripcion: string | null;
          es_base: boolean;
          creado_en: string;
          creado_por: string | null;
          actualizado_en: string;
          actualizado_por: string | null;
        };
        Insert: {
          id?: string;
          empresa_id?: string | null;
          codigo?: string | null;
          nombre: string;
          descripcion?: string | null;
          es_base?: boolean;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Update: {
          id?: string;
          empresa_id?: string | null;
          codigo?: string | null;
          nombre?: string;
          descripcion?: string | null;
          es_base?: boolean;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Relationships: [];
      };
      perfil_permisos: {
        Row: {
          perfil_id: string;
          permiso_codigo: string;
          alcance: string | null;
          creado_en: string;
          creado_por: string | null;
        };
        Insert: {
          perfil_id: string;
          permiso_codigo: string;
          alcance?: string | null;
          creado_en?: string;
          creado_por?: string | null;
        };
        Update: {
          perfil_id?: string;
          permiso_codigo?: string;
          alcance?: string | null;
          creado_en?: string;
          creado_por?: string | null;
        };
        Relationships: [];
      };
      cuentas: {
        Row: {
          id: string;
          nombre: string;
          propietario_id: string;
          correo_facturacion: string | null;
          creado_en: string;
          creado_por: string | null;
          actualizado_en: string;
          actualizado_por: string | null;
          eliminado_en: string | null;
        };
        Insert: {
          id?: string;
          nombre: string;
          propietario_id: string;
          correo_facturacion?: string | null;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
          eliminado_en?: string | null;
        };
        Update: {
          id?: string;
          nombre?: string;
          propietario_id?: string;
          correo_facturacion?: string | null;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
          eliminado_en?: string | null;
        };
        Relationships: [];
      };
      suscripciones: {
        Row: {
          id: string;
          cuenta_id: string;
          plan_id: string;
          estado: string;
          periodo: string;
          prueba_hasta: string | null;
          inicio_en: string;
          renueva_en: string | null;
          cancelada_en: string | null;
          creado_en: string;
          creado_por: string | null;
          actualizado_en: string;
          actualizado_por: string | null;
        };
        Insert: {
          id?: string;
          cuenta_id: string;
          plan_id: string;
          estado: string;
          periodo: string;
          prueba_hasta?: string | null;
          inicio_en: string;
          renueva_en?: string | null;
          cancelada_en?: string | null;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Update: {
          id?: string;
          cuenta_id?: string;
          plan_id?: string;
          estado?: string;
          periodo?: string;
          prueba_hasta?: string | null;
          inicio_en?: string;
          renueva_en?: string | null;
          cancelada_en?: string | null;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Relationships: [];
      };
      empresa_configuracion: {
        Row: {
          empresa_id: string;
          menu_acordeon: boolean;
          ajustes: Json;
          version: number;
          creado_en: string;
          creado_por: string | null;
          actualizado_en: string;
          actualizado_por: string | null;
        };
        Insert: {
          empresa_id: string;
          menu_acordeon?: boolean;
          ajustes?: Json;
          version?: number;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Update: {
          empresa_id?: string;
          menu_acordeon?: boolean;
          ajustes?: Json;
          version?: number;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Relationships: [];
      };
      staff_plataforma: {
        Row: {
          usuario_id: string;
          rol: string;
          creado_en: string;
          creado_por: string | null;
        };
        Insert: {
          usuario_id: string;
          rol: string;
          creado_en?: string;
          creado_por?: string | null;
        };
        Update: {
          usuario_id?: string;
          rol?: string;
          creado_en?: string;
          creado_por?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      team_people_v: {
        Row: {
          org_id: string;
          user_id: string | null;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          role: MembershipRole;
          status: string;
          job_title: string | null;
          access_scope: AccessScope;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_org_member: {
        Args: { _org_id: string };
        Returns: boolean;
      };
      is_org_admin: {
        Args: { _org_id: string };
        Returns: boolean;
      };
      mi_contexto: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      redeem_invitation_code: {
        Args: { _code: string };
        Returns: Json;
      };
      ingreso_bloqueado_hasta: {
        Args: { identificador: string };
        Returns: string | null;
      };
      registrar_intento: {
        Args: { identificador: string; exito: boolean };
        Returns: string | null;
      };
      crear_cuenta_y_empresa: {
        Args: { p_nombre_empresa: string; p_ruc?: string | null; p_plan_codigo?: string };
        Returns: string;
      };
      es_miembro: {
        Args: { p_empresa_id: string };
        Returns: boolean;
      };
      es_staff: {
        Args: { p_rol?: string | null };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
