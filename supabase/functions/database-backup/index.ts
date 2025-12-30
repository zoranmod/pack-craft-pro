import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TABLES_TO_BACKUP = [
  'articles',
  'clients',
  'company_settings',
  'contract_article_templates',
  'document_contract_articles',
  'document_items',
  'document_templates',
  'documents',
  'employee_documents',
  'employee_leave_entitlements',
  'employee_leave_requests',
  'employee_permissions',
  'employee_sick_leaves',
  'employee_work_clothing',
  'employees',
  'notifications',
  'user_profiles',
  'user_roles',
  'activity_logs'
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client for full access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ========== AUTHENTICATION CHECK ==========
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Invalid token or user not found:', authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    console.log(`Backup requested by user: ${user.id}`);

    // ========== ADMIN ROLE CHECK ==========
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to verify permissions' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    const isAdmin = roles?.some(r => r.role === 'admin');
    if (!isAdmin) {
      console.error(`User ${user.id} attempted backup without admin role`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      );
    }

    console.log(`Admin access verified for user: ${user.id}. Starting database backup...`);
    
    const backupData: Record<string, unknown[]> = {};
    const errors: string[] = [];
    
    // Backup each table - filtered to only the authenticated user's data
    for (const table of TABLES_TO_BACKUP) {
      try {
        console.log(`Backing up table: ${table}`);
        
        // Filter by user_id where applicable for data isolation
        let query = supabase.from(table).select('*');
        
        // Tables that have user_id column - filter to only this user's data
        const userOwnedTables = [
          'articles', 'clients', 'company_settings', 'contract_article_templates',
          'document_templates', 'documents', 'employees', 'notifications',
          'user_profiles', 'activity_logs'
        ];
        
        if (userOwnedTables.includes(table)) {
          query = query.eq('user_id', user.id);
        }
        
        // user_roles table uses user_id but we want the admin's roles
        if (table === 'user_roles') {
          query = supabase.from(table).select('*').eq('user_id', user.id);
        }
        
        // Employee-related tables need to filter by employee_id of employees owned by this user
        const employeeRelatedTables = [
          'employee_documents', 'employee_leave_entitlements', 'employee_leave_requests',
          'employee_permissions', 'employee_sick_leaves', 'employee_work_clothing'
        ];
        
        if (employeeRelatedTables.includes(table)) {
          // First get all employee IDs for this user
          const { data: employeeIds } = await supabase
            .from('employees')
            .select('id')
            .eq('user_id', user.id);
          
          if (employeeIds && employeeIds.length > 0) {
            const ids = employeeIds.map(e => e.id);
            query = supabase.from(table).select('*').in('employee_id', ids);
          } else {
            // No employees, skip this table
            backupData[table] = [];
            console.log(`Skipped ${table} - no employees found for user`);
            continue;
          }
        }
        
        // document_items and document_contract_articles need to filter by document_id
        if (table === 'document_items' || table === 'document_contract_articles') {
          const { data: documentIds } = await supabase
            .from('documents')
            .select('id')
            .eq('user_id', user.id);
          
          if (documentIds && documentIds.length > 0) {
            const ids = documentIds.map(d => d.id);
            query = supabase.from(table).select('*').in('document_id', ids);
          } else {
            backupData[table] = [];
            console.log(`Skipped ${table} - no documents found for user`);
            continue;
          }
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error(`Error backing up ${table}:`, error.message);
          errors.push(`${table}: ${error.message}`);
        } else {
          backupData[table] = data || [];
          console.log(`Backed up ${data?.length || 0} rows from ${table}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Exception backing up ${table}:`, errorMessage);
        errors.push(`${table}: ${errorMessage}`);
      }
    }
    
    // Create backup metadata
    const backup = {
      created_at: new Date().toISOString(),
      created_by: user.id,
      tables: Object.keys(backupData),
      row_counts: Object.fromEntries(
        Object.entries(backupData).map(([table, rows]) => [table, rows.length])
      ),
      data: backupData,
      errors: errors.length > 0 ? errors : undefined
    };
    
    // Generate filename with timestamp and user identifier
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${user.id.slice(0, 8)}-${timestamp}.json`;
    
    // Upload to storage
    const backupJson = JSON.stringify(backup, null, 2);
    const { error: uploadError } = await supabase.storage
      .from('database-backups')
      .upload(filename, backupJson, {
        contentType: 'application/json',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Error uploading backup:', uploadError);
      throw new Error(`Failed to upload backup: ${uploadError.message}`);
    }
    
    console.log(`Backup completed by admin ${user.id}: ${filename}`);
    
    // Clean up old backups for this user (keep last 30)
    const { data: existingBackups } = await supabase.storage
      .from('database-backups')
      .list('', { sortBy: { column: 'created_at', order: 'desc' } });
    
    // Filter to only this user's backups
    const userBackups = existingBackups?.filter(f => f.name.startsWith(`backup-${user.id.slice(0, 8)}`)) || [];
    
    if (userBackups.length > 30) {
      const toDelete = userBackups.slice(30).map(f => f.name);
      if (toDelete.length > 0) {
        await supabase.storage
          .from('database-backups')
          .remove(toDelete);
        console.log(`Cleaned up ${toDelete.length} old backups for user ${user.id}`);
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        filename,
        tables_backed_up: Object.keys(backupData).length,
        total_rows: Object.values(backupData).reduce((sum, rows) => sum + rows.length, 0),
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Backup error:', errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
