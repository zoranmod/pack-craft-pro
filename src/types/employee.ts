export interface Employee {
  id: string;
  user_id: string;
  auth_user_id?: string;
  first_name: string;
  last_name: string;
  oib?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  employment_start_date: string;
  employment_end_date?: string;
  position?: string;
  department?: string;
  employment_type: string;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeLeaveEntitlement {
  id: string;
  employee_id: string;
  year: number;
  total_days: number;
  used_days: number;
  carried_over_days: number;
  created_at: string;
  updated_at: string;
}

export interface EmployeePermissions {
  id: string;
  employee_id: string;
  can_view_documents: boolean;
  can_create_documents: boolean;
  can_edit_documents: boolean;
  can_manage_employees: boolean;
  can_request_leave: boolean;
  can_approve_leave: boolean;
  can_request_sick_leave: boolean;
  can_view_work_clothing: boolean;
  can_view_articles: boolean;
  can_edit_articles: boolean;
  can_view_clients: boolean;
  can_edit_clients: boolean;
  can_view_settings: boolean;
  can_edit_settings: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeLeaveRequest {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  leave_type: string;
  status: string;
  reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeSickLeave {
  id: string;
  employee_id: string;
  start_date: string;
  end_date?: string;
  days_count?: number;
  sick_leave_type: string;
  document_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeWorkClothing {
  id: string;
  employee_id: string;
  item_name: string;
  size?: string;
  quantity: number;
  assigned_date: string;
  return_date?: string;
  condition: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_type: string;
  document_name: string;
  expiry_date?: string;
  file_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
