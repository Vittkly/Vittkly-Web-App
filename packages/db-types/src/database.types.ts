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
          nombres: string | null;
          apellidos: string | null;
          tipo_documento: string | null;
          numero_documento: string | null;
          correo: string | null;
          celular: string | null;
          avatar_ruta: string | null;
          correo_verificado_en: string | null;
          celular_verificado_en: string | null;
          prueba_usada_en: string | null;
          ultima_empresa_id: string | null;
          ultimo_ingreso_en: string | null;
          creado_en: string;
          actualizado_en: string;
          actualizado_por: string | null;
        };
        Insert: {
          id: string;
          nombre?: string;
          nombres?: string | null;
          apellidos?: string | null;
          tipo_documento?: string | null;
          numero_documento?: string | null;
          correo?: string | null;
          celular?: string | null;
          avatar_ruta?: string | null;
          correo_verificado_en?: string | null;
          celular_verificado_en?: string | null;
          prueba_usada_en?: string | null;
          ultima_empresa_id?: string | null;
          ultimo_ingreso_en?: string | null;
          creado_en?: string;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Update: {
          id?: string;
          nombre?: string;
          nombres?: string | null;
          apellidos?: string | null;
          tipo_documento?: string | null;
          numero_documento?: string | null;
          correo?: string | null;
          celular?: string | null;
          avatar_ruta?: string | null;
          correo_verificado_en?: string | null;
          celular_verificado_en?: string | null;
          prueba_usada_en?: string | null;
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
          icono_menu_ruta: string | null;
          color_marca: string | null;
          modelo_operacion: string;
          rubro: string | null;
          ciudad: string | null;
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
          icono_menu_ruta?: string | null;
          color_marca?: string | null;
          modelo_operacion?: string;
          rubro?: string | null;
          ciudad?: string | null;
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
          icono_menu_ruta?: string | null;
          color_marca?: string | null;
          modelo_operacion?: string;
          rubro?: string | null;
          ciudad?: string | null;
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
          acceso_app: boolean;
          cargo: string | null;
          estado: string;
          activo: boolean;
          desde: string | null;
          invitacion_id: string | null;
          invitado_por: string | null;
          desvinculada_en: string | null;
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
          acceso_app?: boolean;
          cargo?: string | null;
          estado?: string;
          activo?: boolean;
          desde?: string | null;
          invitacion_id?: string | null;
          invitado_por?: string | null;
          desvinculada_en?: string | null;
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
          acceso_app?: boolean;
          cargo?: string | null;
          estado?: string;
          activo?: boolean;
          desde?: string | null;
          invitacion_id?: string | null;
          invitado_por?: string | null;
          desvinculada_en?: string | null;
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
          recomendado_para: string | null;
          configuracion: Json;
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
          recomendado_para?: string | null;
          configuracion?: Json;
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
          recomendado_para?: string | null;
          configuracion?: Json;
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
          activo: boolean;
          creado_en: string;
          creado_por: string | null;
          actualizado_en: string;
          actualizado_por: string | null;
        };
        Insert: {
          usuario_id: string;
          rol: string;
          activo?: boolean;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Update: {
          usuario_id?: string;
          rol?: string;
          activo?: boolean;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Relationships: [];
      };
      invitaciones: {
        Row: {
          id: string;
          empresa_id: string;
          tipo: string;
          usuario_id: string | null;
          nombres: string | null;
          apellidos: string | null;
          tipo_documento: string | null;
          numero_documento: string | null;
          correo: string | null;
          celular: string | null;
          datos_enmascarados: Json | null;
          perfil_id: string;
          cargo: string | null;
          acceso_web: boolean;
          acceso_app: boolean;
          codigo_hash: string;
          token_hash: string | null;
          vence_en: string;
          estado: string;
          motivo_rechazo: string | null;
          respondida_en: string | null;
          usada_en: string | null;
          usada_por: string | null;
          creado_en: string;
          creado_por: string | null;
          actualizado_en: string;
          actualizado_por: string | null;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          tipo?: string;
          usuario_id?: string | null;
          nombres?: string | null;
          apellidos?: string | null;
          tipo_documento?: string | null;
          numero_documento?: string | null;
          correo?: string | null;
          celular?: string | null;
          datos_enmascarados?: Json | null;
          perfil_id: string;
          cargo?: string | null;
          acceso_web?: boolean;
          acceso_app?: boolean;
          codigo_hash: string;
          token_hash?: string | null;
          vence_en?: string;
          estado?: string;
          motivo_rechazo?: string | null;
          respondida_en?: string | null;
          usada_en?: string | null;
          usada_por?: string | null;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Update: {
          id?: string;
          empresa_id?: string;
          tipo?: string;
          usuario_id?: string | null;
          nombres?: string | null;
          apellidos?: string | null;
          tipo_documento?: string | null;
          numero_documento?: string | null;
          correo?: string | null;
          celular?: string | null;
          datos_enmascarados?: Json | null;
          perfil_id?: string;
          cargo?: string | null;
          acceso_web?: boolean;
          acceso_app?: boolean;
          codigo_hash?: string;
          token_hash?: string | null;
          vence_en?: string;
          estado?: string;
          motivo_rechazo?: string | null;
          respondida_en?: string | null;
          usada_en?: string | null;
          usada_por?: string | null;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Relationships: [];
      };
      verificaciones: {
        Row: {
          id: string;
          usuario_id: string | null;
          canal: string;
          destino: string;
          codigo_hash: string;
          intentos: number;
          vence_en: string;
          verificado_en: string | null;
          creado_en: string;
        };
        Insert: {
          id?: string;
          usuario_id?: string | null;
          canal: string;
          destino: string;
          codigo_hash: string;
          intentos?: number;
          vence_en?: string;
          verificado_en?: string | null;
          creado_en?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string | null;
          canal?: string;
          destino?: string;
          codigo_hash?: string;
          intentos?: number;
          vence_en?: string;
          verificado_en?: string | null;
          creado_en?: string;
        };
        Relationships: [];
      };
      solicitudes_salida: {
        Row: {
          id: string;
          empresa_id: string;
          membresia_id: string;
          usuario_id: string;
          motivo: string | null;
          estado: string;
          comentario_resolucion: string | null;
          servicios_futuros: number;
          soporte_desde: string;
          resuelto_por: string | null;
          resuelto_en: string | null;
          creado_en: string;
          actualizado_en: string;
          actualizado_por: string | null;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          membresia_id: string;
          usuario_id: string;
          motivo?: string | null;
          estado?: string;
          comentario_resolucion?: string | null;
          servicios_futuros?: number;
          soporte_desde?: string;
          resuelto_por?: string | null;
          resuelto_en?: string | null;
          creado_en?: string;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Update: {
          id?: string;
          empresa_id?: string;
          membresia_id?: string;
          usuario_id?: string;
          motivo?: string | null;
          estado?: string;
          comentario_resolucion?: string | null;
          servicios_futuros?: number;
          soporte_desde?: string;
          resuelto_por?: string | null;
          resuelto_en?: string | null;
          creado_en?: string;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Relationships: [];
      };
      casos_soporte: {
        Row: {
          id: string;
          empresa_id: string | null;
          usuario_id: string | null;
          tipo_documento: string | null;
          numero_documento: string | null;
          correo_contacto: string | null;
          celular_contacto: string | null;
          motivo: string;
          estado: string;
          resolucion: string | null;
          creado_en: string;
          actualizado_en: string;
          actualizado_por: string | null;
        };
        Insert: {
          id?: string;
          empresa_id?: string | null;
          usuario_id?: string | null;
          tipo_documento?: string | null;
          numero_documento?: string | null;
          correo_contacto?: string | null;
          celular_contacto?: string | null;
          motivo: string;
          estado?: string;
          resolucion?: string | null;
          creado_en?: string;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Update: {
          id?: string;
          empresa_id?: string | null;
          usuario_id?: string | null;
          tipo_documento?: string | null;
          numero_documento?: string | null;
          correo_contacto?: string | null;
          celular_contacto?: string | null;
          motivo?: string;
          estado?: string;
          resolucion?: string | null;
          creado_en?: string;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Relationships: [];
      };
      auditoria: {
        Row: {
          id: number;
          empresa_id: string | null;
          usuario_id: string | null;
          accion: string;
          tabla: string;
          registro_id: string | null;
          antes: Json | null;
          despues: Json | null;
          creado_en: string;
        };
        Insert: {
          id?: never;
          empresa_id?: string | null;
          usuario_id?: string | null;
          accion: string;
          tabla: string;
          registro_id?: string | null;
          antes?: Json | null;
          despues?: Json | null;
          creado_en?: string;
        };
        Update: {
          id?: never;
          empresa_id?: string | null;
          usuario_id?: string | null;
          accion?: string;
          tabla?: string;
          registro_id?: string | null;
          antes?: Json | null;
          despues?: Json | null;
          creado_en?: string;
        };
        Relationships: [];
      };
      clientes: {
        Row: {
          id: string;
          empresa_id: string;
          nombre_completo: string;
          tipo_persona: 'particular' | 'empresa';
          documento_tipo: 'DNI' | 'RUC' | 'CE' | 'PASAPORTE' | 'OTRO' | null;
          documento_numero: string | null;
          telefono: string | null;
          correo: string | null;
          direccion: string | null;
          distrito: string | null;
          referencia: string | null;
          latitud: number | null;
          longitud: number | null;
          notas: string | null;
          activo: boolean;
          creado_en: string;
          creado_por: string | null;
          actualizado_en: string;
          actualizado_por: string | null;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          nombre_completo: string;
          tipo_persona?: 'particular' | 'empresa';
          documento_tipo?: 'DNI' | 'RUC' | 'CE' | 'PASAPORTE' | 'OTRO' | null;
          documento_numero?: string | null;
          telefono?: string | null;
          correo?: string | null;
          direccion?: string | null;
          distrito?: string | null;
          referencia?: string | null;
          latitud?: number | null;
          longitud?: number | null;
          notas?: string | null;
          activo?: boolean;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Update: {
          id?: string;
          empresa_id?: string;
          nombre_completo?: string;
          tipo_persona?: 'particular' | 'empresa';
          documento_tipo?: 'DNI' | 'RUC' | 'CE' | 'PASAPORTE' | 'OTRO' | null;
          documento_numero?: string | null;
          telefono?: string | null;
          correo?: string | null;
          direccion?: string | null;
          distrito?: string | null;
          referencia?: string | null;
          latitud?: number | null;
          longitud?: number | null;
          notas?: string | null;
          activo?: boolean;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'clientes_empresa_id_fkey';
            columns: ['empresa_id'];
            isOneToOne: false;
            referencedRelation: 'empresas';
            referencedColumns: ['id'];
          },
        ];
      };
      ordenes_trabajo: {
        Row: {
          id: string;
          empresa_id: string;
          codigo: string;
          cliente_id: string;
          tecnico_id: string | null;
          tipo: 'servicio' | 'visita';
          titulo: string;
          descripcion: string | null;
          instrucciones: string | null;
          estado: 'programada' | 'en_ruta' | 'en_curso' | 'completada' | 'pagada' | 'cancelada';
          fecha_programada: string;
          hora_inicio_estimada: string | null;
          duracion_estimada_min: number;
          direccion_servicio: string | null;
          distrito: string | null;
          latitud: number | null;
          longitud: number | null;
          en_ruta_eta_min: number | null;
          frecuencia_recurrencia: string | null;
          monto_total: number;
          moneda: string;
          metodo_pago: 'efectivo' | 'yape_plin' | 'transferencia' | 'tarjeta' | 'pendiente';
          pagado_en: string | null;
          iniciado_en: string | null;
          completado_en: string | null;
          estado_validacion: 'pendiente' | 'aprobado' | 'observado';
          validado_por: string | null;
          validado_en: string | null;
          observacion_validacion: string | null;
          creado_en: string;
          creado_por: string | null;
          actualizado_en: string;
          actualizado_por: string | null;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          codigo: string;
          cliente_id: string;
          tecnico_id?: string | null;
          tipo?: 'servicio' | 'visita';
          titulo: string;
          descripcion?: string | null;
          instrucciones?: string | null;
          estado?: 'programada' | 'en_ruta' | 'en_curso' | 'completada' | 'pagada' | 'cancelada';
          fecha_programada: string;
          hora_inicio_estimada?: string | null;
          duracion_estimada_min?: number;
          direccion_servicio?: string | null;
          distrito?: string | null;
          latitud?: number | null;
          longitud?: number | null;
          en_ruta_eta_min?: number | null;
          frecuencia_recurrencia?: string | null;
          monto_total?: number;
          moneda?: string;
          metodo_pago?: 'efectivo' | 'yape_plin' | 'transferencia' | 'tarjeta' | 'pendiente';
          pagado_en?: string | null;
          iniciado_en?: string | null;
          completado_en?: string | null;
          estado_validacion?: 'pendiente' | 'aprobado' | 'observado';
          validado_por?: string | null;
          validado_en?: string | null;
          observacion_validacion?: string | null;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Update: {
          id?: string;
          empresa_id?: string;
          codigo?: string;
          cliente_id?: string;
          tecnico_id?: string | null;
          tipo?: 'servicio' | 'visita';
          titulo?: string;
          descripcion?: string | null;
          instrucciones?: string | null;
          estado?: 'programada' | 'en_ruta' | 'en_curso' | 'completada' | 'pagada' | 'cancelada';
          fecha_programada?: string;
          hora_inicio_estimada?: string | null;
          duracion_estimada_min?: number;
          direccion_servicio?: string | null;
          distrito?: string | null;
          latitud?: number | null;
          longitud?: number | null;
          en_ruta_eta_min?: number | null;
          frecuencia_recurrencia?: string | null;
          monto_total?: number;
          moneda?: string;
          metodo_pago?: 'efectivo' | 'yape_plin' | 'transferencia' | 'tarjeta' | 'pendiente';
          pagado_en?: string | null;
          iniciado_en?: string | null;
          completado_en?: string | null;
          estado_validacion?: 'pendiente' | 'aprobado' | 'observado';
          validado_por?: string | null;
          validado_en?: string | null;
          observacion_validacion?: string | null;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'ordenes_trabajo_empresa_id_fkey';
            columns: ['empresa_id'];
            isOneToOne: false;
            referencedRelation: 'empresas';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ordenes_trabajo_cliente_id_fkey';
            columns: ['cliente_id'];
            isOneToOne: false;
            referencedRelation: 'clientes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ordenes_trabajo_tecnico_id_fkey';
            columns: ['tecnico_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      plantillas_formulario: {
        Row: {
          id: string;
          empresa_id: string;
          codigo: string;
          nombre: string;
          descripcion: string | null;
          tipo: 'cierre_orden' | 'pre_check' | 'procedimiento';
          version: number;
          esquema_campos: Json;
          activa: boolean;
          es_predeterminada: boolean;
          creado_en: string;
          creado_por: string | null;
          actualizado_en: string;
          actualizado_por: string | null;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          codigo?: string;
          nombre?: string;
          descripcion?: string | null;
          tipo?: 'cierre_orden' | 'pre_check' | 'procedimiento';
          version?: number;
          esquema_campos?: Json;
          activa?: boolean;
          es_predeterminada?: boolean;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Update: {
          id?: string;
          empresa_id?: string;
          codigo?: string;
          nombre?: string;
          descripcion?: string | null;
          tipo?: 'cierre_orden' | 'pre_check' | 'procedimiento';
          version?: number;
          esquema_campos?: Json;
          activa?: boolean;
          es_predeterminada?: boolean;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'plantillas_formulario_empresa_id_fkey';
            columns: ['empresa_id'];
            isOneToOne: false;
            referencedRelation: 'empresas';
            referencedColumns: ['id'];
          },
        ];
      };
      respuestas_formulario: {
        Row: {
          id: string;
          empresa_id: string;
          orden_trabajo_id: string;
          plantilla_id: string | null;
          usuario_id: string;
          estado: 'borrador' | 'completado';
          paso_actual: number;
          respuestas: Json;
          firma_inicio_path: string | null;
          firma_inicio_en: string | null;
          firma_conformidad_path: string | null;
          firma_conformidad_en: string | null;
          nombre_firmante: string | null;
          calificacion_csat: number | null;
          nps_score: number | null;
          encuesta_omitida: boolean;
          completado_en: string | null;
          creado_en: string;
          creado_por: string | null;
          actualizado_en: string;
          actualizado_por: string | null;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          orden_trabajo_id: string;
          plantilla_id?: string | null;
          usuario_id: string;
          estado?: 'borrador' | 'completado';
          paso_actual?: number;
          respuestas?: Json;
          firma_inicio_path?: string | null;
          firma_inicio_en?: string | null;
          firma_conformidad_path?: string | null;
          firma_conformidad_en?: string | null;
          nombre_firmante?: string | null;
          calificacion_csat?: number | null;
          nps_score?: number | null;
          encuesta_omitida?: boolean;
          completado_en?: string | null;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Update: {
          id?: string;
          empresa_id?: string;
          orden_trabajo_id?: string;
          plantilla_id?: string | null;
          usuario_id?: string;
          estado?: 'borrador' | 'completado';
          paso_actual?: number;
          respuestas?: Json;
          firma_inicio_path?: string | null;
          firma_inicio_en?: string | null;
          firma_conformidad_path?: string | null;
          firma_conformidad_en?: string | null;
          nombre_firmante?: string | null;
          calificacion_csat?: number | null;
          nps_score?: number | null;
          encuesta_omitida?: boolean;
          completado_en?: string | null;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'respuestas_formulario_empresa_id_fkey';
            columns: ['empresa_id'];
            isOneToOne: false;
            referencedRelation: 'empresas';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'respuestas_formulario_orden_trabajo_id_fkey';
            columns: ['orden_trabajo_id'];
            isOneToOne: true;
            referencedRelation: 'ordenes_trabajo';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'respuestas_formulario_plantilla_id_fkey';
            columns: ['plantilla_id'];
            isOneToOne: false;
            referencedRelation: 'plantillas_formulario';
            referencedColumns: ['id'];
          },
        ];
      };
      evidencias_orden: {
        Row: {
          id: string;
          empresa_id: string;
          orden_trabajo_id: string;
          usuario_id: string;
          tipo:
            'antes' | 'despues' | 'firma_inicio' | 'firma_cliente' | 'comprobante_pago' | 'general';
          item_codigo: string | null;
          storage_path: string;
          nota: string | null;
          creado_en: string;
          creado_por: string | null;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          orden_trabajo_id: string;
          usuario_id: string;
          tipo:
            'antes' | 'despues' | 'firma_inicio' | 'firma_cliente' | 'comprobante_pago' | 'general';
          item_codigo?: string | null;
          storage_path: string;
          nota?: string | null;
          creado_en?: string;
          creado_por?: string | null;
        };
        Update: {
          id?: string;
          empresa_id?: string;
          orden_trabajo_id?: string;
          usuario_id?: string;
          tipo?:
            'antes' | 'despues' | 'firma_inicio' | 'firma_cliente' | 'comprobante_pago' | 'general';
          item_codigo?: string | null;
          storage_path?: string;
          nota?: string | null;
          creado_en?: string;
          creado_por?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'evidencias_orden_empresa_id_fkey';
            columns: ['empresa_id'];
            isOneToOne: false;
            referencedRelation: 'empresas';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'evidencias_orden_orden_trabajo_id_fkey';
            columns: ['orden_trabajo_id'];
            isOneToOne: false;
            referencedRelation: 'ordenes_trabajo';
            referencedColumns: ['id'];
          },
        ];
      };
      registros_tiempo: {
        Row: {
          id: string;
          empresa_id: string;
          usuario_id: string;
          orden_trabajo_id: string | null;
          tipo: 'jornada' | 'visita' | 'traslado' | 'oficina' | 'compra' | 'descanso' | 'general';
          iniciado_en: string;
          finalizado_en: string | null;
          duracion_segundos: number | null;
          nota: string | null;
          creado_en: string;
          creado_por: string | null;
          actualizado_en: string;
          actualizado_por: string | null;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          usuario_id: string;
          orden_trabajo_id?: string | null;
          tipo: 'jornada' | 'visita' | 'traslado' | 'oficina' | 'compra' | 'descanso' | 'general';
          iniciado_en: string;
          finalizado_en?: string | null;
          duracion_segundos?: number | null;
          nota?: string | null;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Update: {
          id?: string;
          empresa_id?: string;
          usuario_id?: string;
          orden_trabajo_id?: string | null;
          tipo?: 'jornada' | 'visita' | 'traslado' | 'oficina' | 'compra' | 'descanso' | 'general';
          iniciado_en?: string;
          finalizado_en?: string | null;
          duracion_segundos?: number | null;
          nota?: string | null;
          creado_en?: string;
          creado_por?: string | null;
          actualizado_en?: string;
          actualizado_por?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'registros_tiempo_empresa_id_fkey';
            columns: ['empresa_id'];
            isOneToOne: false;
            referencedRelation: 'empresas';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'registros_tiempo_orden_trabajo_id_fkey';
            columns: ['orden_trabajo_id'];
            isOneToOne: false;
            referencedRelation: 'ordenes_trabajo';
            referencedColumns: ['id'];
          },
        ];
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
        Args: {
          p_nombre_empresa: string;
          p_ruc?: string | null;
          p_plan_codigo?: string;
          p_rubro?: string | null;
          p_ciudad?: string | null;
          p_modo?: string;
          p_periodo?: string;
        };
        Returns: string;
      };
      mis_accesos: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      responder_invitacion: {
        Args: {
          p_invitacion_id: string;
          p_acepta: boolean;
          p_motivo?: string | null;
        };
        Returns: Json;
      };
      solicitar_salida: {
        Args: {
          p_membresia_id: string;
          p_motivo?: string | null;
        };
        Returns: string;
      };
      pedir_soporte_salida: {
        Args: {
          p_solicitud_id: string;
        };
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
      canjear_invitacion: {
        Args: { p_codigo: string };
        Returns: string;
      };
      unir_invitaciones_pendientes: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      puede_gestionar_personas_empresa: {
        Args: {
          p_empresa_id: string;
        };
        Returns: boolean;
      };
      normalizar_tipo_documento: {
        Args: {
          p_raw: string;
        };
        Returns: string;
      };
      buscar_persona_por_documento: {
        Args: {
          p_empresa_id: string;
          p_tipo_documento: string;
          p_numero_documento: string;
        };
        Returns: Json;
      };
      crear_invitacion_empresa: {
        Args: {
          p_empresa_id: string;
          p_tipo_documento: string;
          p_numero_documento: string;
          p_perfil_id: string;
          p_acceso_web: boolean;
          p_acceso_app: boolean;
          p_cargo?: string | null;
          p_nombres?: string | null;
          p_apellidos?: string | null;
          p_correo?: string | null;
          p_celular?: string | null;
          p_token_hash?: string | null;
        };
        Returns: Json;
      };
      reenviar_invitacion_empresa: {
        Args: {
          p_invitacion_id: string;
          p_token_hash: string;
        };
        Returns: Json;
      };
      guardar_perfil_empresa: {
        Args: {
          p_empresa_id: string;
          p_profile_id?: string | null;
          p_nombre?: string | null;
          p_descripcion?: string | null;
          p_recomendado_para?: string | null;
          p_configuracion?: Json;
        };
        Returns: string;
      };
      puede_editar_configuracion_empresa: {
        Args: {
          p_empresa_id: string;
        };
        Returns: boolean;
      };
      actualizar_configuracion_empresa: {
        Args: {
          p_empresa_id: string;
          p_razon_social: string;
          p_nombre_comercial: string;
          p_ruc?: string | null;
          p_direccion?: string | null;
          p_rubro?: string | null;
          p_ciudad?: string | null;
          p_whatsapp_telefono?: string | null;
          p_encabezado_documento?: string | null;
          p_pie_pagina_documento?: string | null;
          p_logo_ruta?: string | null;
          p_icono_menu_ruta?: string | null;
          p_color_marca?: string;
          p_modelo_operacion?: string;
          p_menu_acordeon?: boolean;
        };
        Returns: Json;
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
