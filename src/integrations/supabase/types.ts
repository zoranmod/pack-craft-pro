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
      activity_logs: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          employee_id: string | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          employee_id?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          employee_id?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          barcode: string | null
          code: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          pdv: number
          price: number
          purchase_price: number
          stock: number
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          barcode?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          pdv?: number
          price?: number
          purchase_price?: number
          stock?: number
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          barcode?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          pdv?: number
          price?: number
          purchase_price?: number
          stock?: number
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          oib: string | null
          phone: string | null
          postal_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          oib?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          oib?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string
          iban: string | null
          id: string
          logo_url: string | null
          oib: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          iban?: string | null
          id?: string
          logo_url?: string | null
          oib?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          iban?: string | null
          id?: string
          logo_url?: string | null
          oib?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contract_article_templates: {
        Row: {
          article_number: number
          content: string
          created_at: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          article_number: number
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          article_number?: number
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      document_contract_articles: {
        Row: {
          article_number: number
          content: string
          created_at: string
          document_id: string
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          article_number: number
          content: string
          created_at?: string
          document_id: string
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          article_number?: number
          content?: string
          created_at?: string
          document_id?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_contract_articles_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_items: {
        Row: {
          created_at: string
          discount: number
          document_id: string
          id: string
          name: string
          pdv: number
          price: number
          quantity: number
          subtotal: number
          total: number
          unit: string
        }
        Insert: {
          created_at?: string
          discount?: number
          document_id: string
          id?: string
          name: string
          pdv?: number
          price?: number
          quantity?: number
          subtotal?: number
          total?: number
          unit?: string
        }
        Update: {
          created_at?: string
          discount?: number
          document_id?: string
          id?: string
          name?: string
          pdv?: number
          price?: number
          quantity?: number
          subtotal?: number
          total?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_items_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          client_address: string
          client_email: string | null
          client_name: string
          client_oib: string | null
          client_phone: string | null
          created_at: string
          date: string
          id: string
          notes: string | null
          number: string
          status: string
          total_amount: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_address: string
          client_email?: string | null
          client_name: string
          client_oib?: string | null
          client_phone?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          number: string
          status?: string
          total_amount?: number
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_address?: string
          client_email?: string | null
          client_name?: string
          client_oib?: string | null
          client_phone?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          number?: string
          status?: string
          total_amount?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      employee_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string
          employee_id: string
          expiry_date: string | null
          file_url: string | null
          id: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: string
          employee_id: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string
          employee_id?: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_leave_entitlements: {
        Row: {
          carried_over_days: number | null
          created_at: string
          employee_id: string
          id: string
          total_days: number
          updated_at: string
          used_days: number
          year: number
        }
        Insert: {
          carried_over_days?: number | null
          created_at?: string
          employee_id: string
          id?: string
          total_days?: number
          updated_at?: string
          used_days?: number
          year: number
        }
        Update: {
          carried_over_days?: number | null
          created_at?: string
          employee_id?: string
          id?: string
          total_days?: number
          updated_at?: string
          used_days?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_leave_entitlements_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          days_requested: number
          employee_id: string
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          days_requested: number
          employee_id: string
          end_date: string
          id?: string
          leave_type?: string
          reason?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          days_requested?: number
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_permissions: {
        Row: {
          can_approve_leave: boolean | null
          can_create_documents: boolean | null
          can_edit_articles: boolean | null
          can_edit_clients: boolean | null
          can_edit_documents: boolean | null
          can_edit_settings: boolean | null
          can_manage_employees: boolean | null
          can_request_leave: boolean | null
          can_request_sick_leave: boolean | null
          can_view_articles: boolean | null
          can_view_clients: boolean | null
          can_view_documents: boolean | null
          can_view_settings: boolean | null
          can_view_work_clothing: boolean | null
          created_at: string | null
          employee_id: string
          id: string
          updated_at: string | null
        }
        Insert: {
          can_approve_leave?: boolean | null
          can_create_documents?: boolean | null
          can_edit_articles?: boolean | null
          can_edit_clients?: boolean | null
          can_edit_documents?: boolean | null
          can_edit_settings?: boolean | null
          can_manage_employees?: boolean | null
          can_request_leave?: boolean | null
          can_request_sick_leave?: boolean | null
          can_view_articles?: boolean | null
          can_view_clients?: boolean | null
          can_view_documents?: boolean | null
          can_view_settings?: boolean | null
          can_view_work_clothing?: boolean | null
          created_at?: string | null
          employee_id: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          can_approve_leave?: boolean | null
          can_create_documents?: boolean | null
          can_edit_articles?: boolean | null
          can_edit_clients?: boolean | null
          can_edit_documents?: boolean | null
          can_edit_settings?: boolean | null
          can_manage_employees?: boolean | null
          can_request_leave?: boolean | null
          can_request_sick_leave?: boolean | null
          can_view_articles?: boolean | null
          can_view_clients?: boolean | null
          can_view_documents?: boolean | null
          can_view_settings?: boolean | null
          can_view_work_clothing?: boolean | null
          created_at?: string | null
          employee_id?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_permissions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_sick_leaves: {
        Row: {
          created_at: string
          days_count: number | null
          document_number: string | null
          employee_id: string
          end_date: string | null
          id: string
          notes: string | null
          sick_leave_type: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          days_count?: number | null
          document_number?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
          notes?: string | null
          sick_leave_type?: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          days_count?: number | null
          document_number?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          sick_leave_type?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_sick_leaves_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_work_clothing: {
        Row: {
          assigned_date: string
          condition: string
          created_at: string
          employee_id: string
          id: string
          item_name: string
          notes: string | null
          quantity: number
          return_date: string | null
          size: string | null
          updated_at: string
        }
        Insert: {
          assigned_date?: string
          condition?: string
          created_at?: string
          employee_id: string
          id?: string
          item_name: string
          notes?: string | null
          quantity?: number
          return_date?: string | null
          size?: string | null
          updated_at?: string
        }
        Update: {
          assigned_date?: string
          condition?: string
          created_at?: string
          employee_id?: string
          id?: string
          item_name?: string
          notes?: string | null
          quantity?: number
          return_date?: string | null
          size?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_work_clothing_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          auth_user_id: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          department: string | null
          email: string | null
          employment_end_date: string | null
          employment_start_date: string
          employment_type: string
          first_name: string
          id: string
          last_name: string
          notes: string | null
          oib: string | null
          phone: string | null
          position: string | null
          postal_code: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          auth_user_id?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          employment_end_date?: string | null
          employment_start_date: string
          employment_type?: string
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          oib?: string | null
          phone?: string | null
          position?: string | null
          postal_code?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          auth_user_id?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          employment_end_date?: string | null
          employment_start_date?: string
          employment_type?: string
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          oib?: string | null
          phone?: string | null
          position?: string | null
          postal_code?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          document_id: string | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: string | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      get_employee_admin: { Args: { _user_id: string }; Returns: string }
      get_employee_id: { Args: { _user_id: string }; Returns: string }
      get_employee_owner: { Args: { _user_id: string }; Returns: string }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_employee_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "employee"
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
      app_role: ["admin", "employee"],
    },
  },
} as const
