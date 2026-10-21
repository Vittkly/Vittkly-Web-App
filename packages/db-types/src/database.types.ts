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
    };
  };
}
