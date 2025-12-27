import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateAccountRequest {
  email: string;
  password: string;
  employeeId: string;
  firstName: string;
  lastName: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get the requesting user from the auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Nedostaje autorizacija");
    }

    // Verify the requesting user is an admin (owns employees)
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !requestingUser) {
      throw new Error("Neautoriziran pristup");
    }

    const { email, password, employeeId, firstName, lastName }: CreateAccountRequest = await req.json();

    console.log(`Creating account for employee ${employeeId} with email ${email}`);

    // Verify the requesting user owns this employee
    const { data: employee, error: employeeError } = await supabaseAdmin
      .from("employees")
      .select("id, user_id, auth_user_id")
      .eq("id", employeeId)
      .single();

    if (employeeError || !employee) {
      throw new Error("Zaposlenik nije pronađen");
    }

    if (employee.user_id !== requestingUser.id) {
      throw new Error("Nemate ovlasti za ovog zaposlenika");
    }

    if (employee.auth_user_id) {
      throw new Error("Zaposlenik već ima korisnički račun");
    }

    // Check if user already exists with this email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      // User exists - link to this employee
      console.log(`User with email ${email} already exists, linking to employee ${employeeId}`);
      userId = existingUser.id;
    } else {
      // Create new user account
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          is_employee: true,
          employee_id: employeeId,
        },
      });

      if (createError) {
        console.error("Error creating user:", createError);
        throw new Error(createError.message);
      }

      console.log(`User created with ID: ${newUser.user.id}`);
      userId = newUser.user.id;
    }

    // Update employee with auth_user_id
    const { error: updateError } = await supabaseAdmin
      .from("employees")
      .update({ auth_user_id: userId })
      .eq("id", employeeId);

    if (updateError) {
      console.error("Error updating employee:", updateError);
      // Only try to delete if we created a new user
      if (!existingUser) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      }
      throw new Error("Greška pri povezivanju računa sa zaposlenikom");
    }

    // Add employee role (upsert to avoid duplicates)
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({
        user_id: userId,
        role: "employee",
      }, { onConflict: 'user_id,role' });

    if (roleError) {
      console.error("Error adding role:", roleError);
      // Non-critical, continue
    }

    // Create default permissions (upsert to avoid duplicates)
    const { error: permError } = await supabaseAdmin
      .from("employee_permissions")
      .upsert({
        employee_id: employeeId,
        can_view_documents: false,
        can_create_documents: false,
        can_edit_documents: false,
        can_manage_employees: false,
        can_request_leave: true,
        can_approve_leave: false,
        can_request_sick_leave: true,
        can_view_work_clothing: true,
        can_view_articles: false,
        can_edit_articles: false,
        can_view_clients: false,
        can_edit_clients: false,
        can_view_settings: false,
        can_edit_settings: false,
      }, { onConflict: 'employee_id' });

    if (permError) {
      console.error("Error creating permissions:", permError);
      // Non-critical, continue
    }

    console.log(`Account setup complete for employee ${employeeId}`);

    return new Response(
      JSON.stringify({
        success: true,
        userId: userId,
        message: existingUser 
          ? "Postojeći račun uspješno povezan sa zaposlenikom" 
          : "Račun uspješno kreiran",
        linkedExisting: !!existingUser,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in create-employee-account:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
