export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          barbershop_id: string
          cancellation_reason: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          date: string
          end_time: string
          id: string
          notes: string | null
          price: number | null
          professional_id: string
          service_id: string
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          barbershop_id: string
          cancellation_reason?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          date: string
          end_time: string
          id?: string
          notes?: string | null
          price?: number | null
          professional_id: string
          service_id: string
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          barbershop_id?: string
          cancellation_reason?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          notes?: string | null
          price?: number | null
          professional_id?: string
          service_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: false
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          barbershop_id: string
          config: Json
          created_at: string
          enabled: boolean
          id: string
          type: string
          updated_at: string
        }
        Insert: {
          barbershop_id: string
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          type: string
          updated_at?: string
        }
        Update: {
          barbershop_id?: string
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automations_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: false
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
        ]
      }
      barbershops: {
        Row: {
          address: string | null
          address_complement: string | null
          allow_online_cancellation: boolean
          allow_online_reschedule: boolean
          auto_confirm: boolean
          buffer_minutes: number
          cancellation_limit_hours: number
          closed_days: number[] | null
          closing_time: string
          created_at: string
          description: string | null
          id: string
          instagram: string | null
          logo_url: string | null
          min_advance_hours: number
          name: string
          opening_time: string
          owner_id: string
          phone: string | null
          referral_enabled: boolean | null
          referral_goal: number | null
          referral_reward: string | null
          slot_interval_minutes: number
          slug: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          allow_online_cancellation?: boolean
          allow_online_reschedule?: boolean
          auto_confirm?: boolean
          buffer_minutes?: number
          cancellation_limit_hours?: number
          closed_days?: number[] | null
          closing_time?: string
          created_at?: string
          description?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          min_advance_hours?: number
          name: string
          opening_time?: string
          owner_id: string
          phone?: string | null
          referral_enabled?: boolean | null
          referral_goal?: number | null
          referral_reward?: string | null
          slot_interval_minutes?: number
          slug: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          allow_online_cancellation?: boolean
          allow_online_reschedule?: boolean
          auto_confirm?: boolean
          buffer_minutes?: number
          cancellation_limit_hours?: number
          closed_days?: number[] | null
          closing_time?: string
          created_at?: string
          description?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          min_advance_hours?: number
          name?: string
          opening_time?: string
          owner_id?: string
          phone?: string | null
          referral_enabled?: boolean | null
          referral_goal?: number | null
          referral_reward?: string | null
          slot_interval_minutes?: number
          slug?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      blocked_times: {
        Row: {
          all_day: boolean
          barbershop_id: string
          created_at: string
          date: string
          end_time: string | null
          id: string
          professional_id: string | null
          reason: string | null
          recurring: boolean
          recurring_days: number[] | null
          start_time: string | null
        }
        Insert: {
          all_day?: boolean
          barbershop_id: string
          created_at?: string
          date: string
          end_time?: string | null
          id?: string
          professional_id?: string | null
          reason?: string | null
          recurring?: boolean
          recurring_days?: number[] | null
          start_time?: string | null
        }
        Update: {
          all_day?: boolean
          barbershop_id?: string
          created_at?: string
          date?: string
          end_time?: string | null
          id?: string
          professional_id?: string | null
          reason?: string | null
          recurring?: boolean
          recurring_days?: number[] | null
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_times_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: false
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_times_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_recipients: {
        Row: {
          campaign_id: string
          client_id: string
          created_at: string
          error_message: string | null
          id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          campaign_id: string
          client_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          campaign_id?: string
          client_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          audience: string
          barbershop_id: string
          channel: string
          created_at: string
          id: string
          message: string
          recipient_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          barbershop_id: string
          channel?: string
          created_at?: string
          id?: string
          message: string
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          barbershop_id?: string
          channel?: string
          created_at?: string
          id?: string
          message?: string
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: false
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          barbershop_id: string
          birth_date: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          barbershop_id: string
          birth_date?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          barbershop_id?: string
          birth_date?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: false
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          appointment_id: string | null
          barbershop_id: string
          body: string | null
          channel: string
          created_at: string
          error_message: string | null
          id: string
          recipient_email: string | null
          recipient_name: string | null
          recipient_phone: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: string
          subject: string | null
          type: string
        }
        Insert: {
          appointment_id?: string | null
          barbershop_id: string
          body?: string | null
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          type: string
        }
        Update: {
          appointment_id?: string | null
          barbershop_id?: string
          body?: string | null
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: false
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          features: string[]
          id: string
          label: string
          max_professionals: number
          price: number
          slug: Database["public"]["Enums"]["subscription_plan"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: string[]
          id?: string
          label: string
          max_professionals?: number
          price?: number
          slug: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: string[]
          id?: string
          label?: string
          max_professionals?: number
          price?: number
          slug?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
        }
        Relationships: []
      }
      professional_availability: {
        Row: {
          created_at: string
          end_time: string
          id: string
          professional_id: string
          start_time: string
          weekday: number
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          professional_id: string
          start_time: string
          weekday: number
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          professional_id?: string
          start_time?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "professional_availability_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          active: boolean
          avatar_url: string | null
          barbershop_id: string
          created_at: string
          id: string
          name: string
          role: string | null
          specialties: string[] | null
          updated_at: string
          user_id: string | null
          work_days: number[] | null
          work_end: string | null
          work_start: string | null
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          barbershop_id: string
          created_at?: string
          id?: string
          name: string
          role?: string | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string | null
          work_days?: number[] | null
          work_end?: string | null
          work_start?: string | null
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          barbershop_id?: string
          created_at?: string
          id?: string
          name?: string
          role?: string | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string | null
          work_days?: number[] | null
          work_end?: string | null
          work_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: false
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          barbershop_id: string
          created_at: string
          id: string
          referred_client_id: string | null
          referrer_client_id: string
          status: string
        }
        Insert: {
          barbershop_id: string
          created_at?: string
          id?: string
          referred_client_id?: string | null
          referrer_client_id: string
          status?: string
        }
        Update: {
          barbershop_id?: string
          created_at?: string
          id?: string
          referred_client_id?: string | null
          referrer_client_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: false
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_client_id_fkey"
            columns: ["referred_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_client_id_fkey"
            columns: ["referrer_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          barbershop_id: string
          category: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          name: string
          price: number
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          barbershop_id: string
          category?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          name: string
          price?: number
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          barbershop_id?: string
          category?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          name?: string
          price?: number
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: false
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          barbershop_id: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string
          updated_at: string
        }
        Insert: {
          barbershop_id: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string
          updated_at?: string
        }
        Update: {
          barbershop_id?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: true
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invites: {
        Row: {
          accepted_at: string | null
          barbershop_id: string
          created_at: string
          email: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
        }
        Insert: {
          accepted_at?: string | null
          barbershop_id: string
          created_at?: string
          email: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
        }
        Update: {
          accepted_at?: string | null
          barbershop_id?: string
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_barbershop_id_fkey"
            columns: ["barbershop_id"]
            isOneToOne: false
            referencedRelation: "barbershops"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_barbershop_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "owner" | "professional" | "receptionist"
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "rescheduled"
      subscription_plan: "starter" | "pro" | "premium"
      subscription_status:
        | "trial"
        | "active"
        | "past_due"
        | "cancelled"
        | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "owner", "professional", "receptionist"],
      appointment_status: [
        "scheduled",
        "confirmed",
        "cancelled",
        "completed",
        "rescheduled",
      ],
      subscription_plan: ["starter", "pro", "premium"],
      subscription_status: [
        "trial",
        "active",
        "past_due",
        "cancelled",
        "expired",
      ],
    },
  },
} as const
