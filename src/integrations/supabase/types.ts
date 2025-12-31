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
          is_template: boolean
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
          is_template?: boolean
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
          is_template?: boolean
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
          client_type: string
          created_at: string
          default_pdv: number
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
          client_type?: string
          created_at?: string
          default_pdv?: number
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
          client_type?: string
          created_at?: string
          default_pdv?: number
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
          bank_name_1: string | null
          bank_name_2: string | null
          capital_amount: string | null
          company_name: string | null
          created_at: string
          director_name: string | null
          email_info: string | null
          iban: string | null
          iban_2: string | null
          id: string
          logo_url: string | null
          oib: string | null
          pdv_id: string | null
          phone_accounting: string | null
          phone_main: string | null
          phone_sales: string | null
          print_content_bottom_padding_mm: number | null
          print_footer_bottom_mm: number | null
          print_footer_max_height_mm: number | null
          registration_court: string | null
          registration_number: string | null
          swift_1: string | null
          swift_2: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          bank_name_1?: string | null
          bank_name_2?: string | null
          capital_amount?: string | null
          company_name?: string | null
          created_at?: string
          director_name?: string | null
          email_info?: string | null
          iban?: string | null
          iban_2?: string | null
          id?: string
          logo_url?: string | null
          oib?: string | null
          pdv_id?: string | null
          phone_accounting?: string | null
          phone_main?: string | null
          phone_sales?: string | null
          print_content_bottom_padding_mm?: number | null
          print_footer_bottom_mm?: number | null
          print_footer_max_height_mm?: number | null
          registration_court?: string | null
          registration_number?: string | null
          swift_1?: string | null
          swift_2?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          bank_name_1?: string | null
          bank_name_2?: string | null
          capital_amount?: string | null
          company_name?: string | null
          created_at?: string
          director_name?: string | null
          email_info?: string | null
          iban?: string | null
          iban_2?: string | null
          id?: string
          logo_url?: string | null
          oib?: string | null
          pdv_id?: string | null
          phone_accounting?: string | null
          phone_main?: string | null
          phone_sales?: string | null
          print_content_bottom_padding_mm?: number | null
          print_footer_bottom_mm?: number | null
          print_footer_max_height_mm?: number | null
          registration_court?: string | null
          registration_number?: string | null
          swift_1?: string | null
          swift_2?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
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
      dobavljaci: {
        Row: {
          address: string | null
          city: string | null
          contact_person: string | null
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
          contact_person?: string | null
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
          contact_person?: string | null
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
          code: string | null
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
          code?: string | null
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
          code?: string | null
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
      document_templates: {
        Row: {
          body_font_size: number | null
          certificate_images: Json | null
          created_at: string | null
          default_delivery_days: number | null
          default_payment_method: string | null
          default_validity_days: number | null
          document_type: string
          font_family: string | null
          footer_note: string | null
          header_font_size: number | null
          header_layout: string | null
          id: string
          is_default: boolean | null
          name: string
          prepared_by_label: string | null
          primary_color: string | null
          secondary_color: string | null
          show_certificates: boolean | null
          show_company_info: boolean | null
          show_delivery_days: boolean | null
          show_director_signature: boolean | null
          show_discount_column: boolean | null
          show_footer_contacts: boolean | null
          show_iban_in_header: boolean | null
          show_logo: boolean | null
          show_payment_method: boolean | null
          show_pdv_breakdown: boolean | null
          show_prepared_by: boolean | null
          show_registration_info: boolean | null
          show_second_iban: boolean | null
          show_signature_line: boolean | null
          show_stamp_placeholder: boolean | null
          show_validity_days: boolean | null
          table_columns: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body_font_size?: number | null
          certificate_images?: Json | null
          created_at?: string | null
          default_delivery_days?: number | null
          default_payment_method?: string | null
          default_validity_days?: number | null
          document_type: string
          font_family?: string | null
          footer_note?: string | null
          header_font_size?: number | null
          header_layout?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          prepared_by_label?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          show_certificates?: boolean | null
          show_company_info?: boolean | null
          show_delivery_days?: boolean | null
          show_director_signature?: boolean | null
          show_discount_column?: boolean | null
          show_footer_contacts?: boolean | null
          show_iban_in_header?: boolean | null
          show_logo?: boolean | null
          show_payment_method?: boolean | null
          show_pdv_breakdown?: boolean | null
          show_prepared_by?: boolean | null
          show_registration_info?: boolean | null
          show_second_iban?: boolean | null
          show_signature_line?: boolean | null
          show_stamp_placeholder?: boolean | null
          show_validity_days?: boolean | null
          table_columns?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body_font_size?: number | null
          certificate_images?: Json | null
          created_at?: string | null
          default_delivery_days?: number | null
          default_payment_method?: string | null
          default_validity_days?: number | null
          document_type?: string
          font_family?: string | null
          footer_note?: string | null
          header_font_size?: number | null
          header_layout?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          prepared_by_label?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          show_certificates?: boolean | null
          show_company_info?: boolean | null
          show_delivery_days?: boolean | null
          show_director_signature?: boolean | null
          show_discount_column?: boolean | null
          show_footer_contacts?: boolean | null
          show_iban_in_header?: boolean | null
          show_logo?: boolean | null
          show_payment_method?: boolean | null
          show_pdv_breakdown?: boolean | null
          show_prepared_by?: boolean | null
          show_registration_info?: boolean | null
          show_second_iban?: boolean | null
          show_signature_line?: boolean | null
          show_stamp_placeholder?: boolean | null
          show_validity_days?: boolean | null
          table_columns?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          client_address: string
          client_email: string | null
          client_name: string
          client_oib: string | null
          client_phone: string | null
          contact_person: string | null
          created_at: string
          date: string
          delivery_address: string | null
          delivery_days: number | null
          id: string
          notes: string | null
          number: string
          payment_method: string | null
          prepared_by: string | null
          source_document_id: string | null
          status: string
          template_id: string | null
          total_amount: number
          type: string
          updated_at: string
          user_id: string
          validity_days: number | null
        }
        Insert: {
          client_address: string
          client_email?: string | null
          client_name: string
          client_oib?: string | null
          client_phone?: string | null
          contact_person?: string | null
          created_at?: string
          date?: string
          delivery_address?: string | null
          delivery_days?: number | null
          id?: string
          notes?: string | null
          number: string
          payment_method?: string | null
          prepared_by?: string | null
          source_document_id?: string | null
          status?: string
          template_id?: string | null
          total_amount?: number
          type: string
          updated_at?: string
          user_id: string
          validity_days?: number | null
        }
        Update: {
          client_address?: string
          client_email?: string | null
          client_name?: string
          client_oib?: string | null
          client_phone?: string | null
          contact_person?: string | null
          created_at?: string
          date?: string
          delivery_address?: string | null
          delivery_days?: number | null
          id?: string
          notes?: string | null
          number?: string
          payment_method?: string | null
          prepared_by?: string | null
          source_document_id?: string | null
          status?: string
          template_id?: string | null
          total_amount?: number
          type?: string
          updated_at?: string
          user_id?: string
          validity_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
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
