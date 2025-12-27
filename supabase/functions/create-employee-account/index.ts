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
  resetPassword?: boolean; // If true, just reset password for existing account
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create admin client with service role key for privileged operations
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get the requesting user from the auth header using proper JWT validation
    const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Nedostaje autorizacija");
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      throw new Error("Neautoriziran pristup");
    }

    // Use Supabase's built-in JWT validation to get the authenticated user
    // This cryptographically verifies the token signature
    const { data: { user: authenticatedUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authenticatedUser) {
      console.error("Auth error:", authError?.message || "No user found");
      throw new Error("Neautoriziran pristup");
    }

    const requestingUserId = authenticatedUser.id;
    console.log(`Request from authenticated user: ${requestingUserId}`);

    const { email, password, employeeId, firstName, lastName, resetPassword }: CreateAccountRequest = await req.json();

    // Server-side password validation - critical security control
    if (!password || typeof password !== 'string') {
      throw new Error("Lozinka je obavezna");
    }
    if (password.length < 10) {
      throw new Error("Lozinka mora imati najmanje 10 znakova");
    }
    if (password.length > 128) {
      throw new Error("Lozinka ne smije imati više od 128 znakova");
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error("Lozinka mora sadržavati barem jedno veliko slovo");
    }
    if (!/[a-z]/.test(password)) {
      throw new Error("Lozinka mora sadržavati barem jedno malo slovo");
    }
    if (!/[0-9]/.test(password)) {
      throw new Error("Lozinka mora sadržavati barem jedan broj");
    }

    // Email validation
    if (!email || typeof email !== 'string') {
      throw new Error("Email je obavezan");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Neispravna email adresa");
    }

    console.log(`${resetPassword ? 'Resetting password' : 'Creating account'} for employee ${employeeId}`);

    // Verify the requesting user owns this employee
    const { data: employee, error: employeeError } = await supabaseAdmin
      .from("employees")
      .select("id, user_id, auth_user_id")
      .eq("id", employeeId)
      .single();

    if (employeeError || !employee) {
      throw new Error("Zaposlenik nije pronađen");
    }

    if (employee.user_id !== requestingUserId) {
      console.error(`Authorization failed: employee.user_id (${employee.user_id}) !== requestingUserId (${requestingUserId})`);
      throw new Error("Nemate ovlasti za ovog zaposlenika");
    }

    // Handle password reset for existing accounts
    if (employee.auth_user_id && resetPassword) {
      console.log(`Resetting password for existing account ${employee.auth_user_id}`);
      
      const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(employee.auth_user_id, {
        password: password,
      });

      if (resetError) {
        console.error("Error resetting password:", resetError);
        throw new Error("Greška pri resetiranju lozinke");
      }

      console.log(`Password reset complete for employee ${employeeId}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Lozinka uspješno resetirana",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (employee.auth_user_id) {
      throw new Error("Zaposlenik već ima korisnički račun");
    }

    // Check if user already exists with this email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      // User exists - update password and link to this employee
      console.log(`User with email ${email} already exists, updating password and linking to employee ${employeeId}`);
      
      // Update user password and metadata
      const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          is_employee: true,
          employee_id: employeeId,
        },
      });

      if (updateUserError) {
        console.error("Error updating existing user:", updateUserError);
        throw new Error("Greška pri ažuriranju postojećeg računa");
      }

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
