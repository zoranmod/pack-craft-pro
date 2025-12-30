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

    console.log('Starting database backup...');
    
    const backupData: Record<string, unknown[]> = {};
    const errors: string[] = [];
    
    // Backup each table
    for (const table of TABLES_TO_BACKUP) {
      try {
        console.log(`Backing up table: ${table}`);
        const { data, error } = await supabase
          .from(table)
          .select('*');
        
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
      tables: Object.keys(backupData),
      row_counts: Object.fromEntries(
        Object.entries(backupData).map(([table, rows]) => [table, rows.length])
      ),
      data: backupData,
      errors: errors.length > 0 ? errors : undefined
    };
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    
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
    
    console.log(`Backup completed: ${filename}`);
    
    // Clean up old backups (keep last 30)
    const { data: existingBackups } = await supabase.storage
      .from('database-backups')
      .list('', { sortBy: { column: 'created_at', order: 'desc' } });
    
    if (existingBackups && existingBackups.length > 30) {
      const toDelete = existingBackups.slice(30).map(f => f.name);
      if (toDelete.length > 0) {
        await supabase.storage
          .from('database-backups')
          .remove(toDelete);
        console.log(`Cleaned up ${toDelete.length} old backups`);
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
