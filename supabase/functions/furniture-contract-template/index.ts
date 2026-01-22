import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-owner-user-id",
};

type Slot = "p1" | "p2" | "p3";

const BUCKET = "contract-templates";

const settingKeys: Record<Slot, string> = {
  p1: "furniture_contract_bg_p1_path",
  p2: "furniture_contract_bg_p2_path",
  p3: "furniture_contract_bg_p3_path",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization");
    if (!authHeader) return json({ error: "Nedostaje autorizacija" }, 401);
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) return json({ error: "Neautoriziran pristup" }, 401);

    const { data: userRes, error: userErr } = await supabaseAdmin.auth.getUser(token);
    const user = userRes?.user;
    if (userErr || !user) return json({ error: "Neautoriziran pristup" }, 401);

    // Determine owner (admin account) for current user (employees map to owner)
    const { data: ownerId, error: ownerErr } = await supabaseAdmin.rpc("get_employee_owner", {
      _user_id: user.id,
    });
    if (ownerErr) throw ownerErr;
    const effectiveOwnerId = ownerId || user.id;

    // Extra safety: allow frontend to pass expected owner id and verify it matches.
    const ownerHeader = req.headers.get("x-owner-user-id");
    if (ownerHeader && ownerHeader !== effectiveOwnerId) {
      return json({ error: "Nedozvoljen ownerUserId." }, 403);
    }

    if (req.method === "GET") {
      const keys = Object.values(settingKeys);
      const { data, error } = await supabaseAdmin
        .from("document_settings")
        .select("setting_key, setting_value")
        .eq("user_id", effectiveOwnerId)
        .in("setting_key", keys);
      if (error) throw error;

      const paths: Record<Slot, string | null> = { p1: null, p2: null, p3: null };
      for (const row of data || []) {
        const slot = (Object.entries(settingKeys).find(([, k]) => k === row.setting_key)?.[0] || null) as
          | Slot
          | null;
        if (!slot) continue;
        paths[slot] = typeof row.setting_value === "string" ? row.setting_value : null;
      }

      const signedUrls: Record<Slot, string | null> = { p1: null, p2: null, p3: null };
      for (const slot of ["p1", "p2", "p3"] as const) {
        const path = paths[slot];
        if (!path) continue;
        const { data: urlData, error: urlError } = await supabaseAdmin.storage
          .from(BUCKET)
          .createSignedUrl(path, 60 * 60 * 24 * 365);
        if (urlError) throw urlError;
        signedUrls[slot] = urlData.signedUrl;
      }

      return json({ paths, signedUrls });
    }

    if (req.method === "POST") {
      const url = new URL(req.url);
      const slot = (url.searchParams.get("slot") || "") as Slot;
      if (!slot || !["p1", "p2", "p3"].includes(slot)) {
        return json({ error: "Nedostaje ili je neispravan slot (p1/p2/p3)." }, 400);
      }

      const contentType = req.headers.get("content-type") || "image/png";
      if (!contentType.includes("image/png")) {
        return json({ error: "Molim učitajte PNG datoteku." }, 400);
      }

      const bytes = new Uint8Array(await req.arrayBuffer());
      if (!bytes.length) return json({ error: "Prazan upload." }, 400);

      const path = `${effectiveOwnerId}/furniture-contract/${slot}.png`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, bytes, { upsert: true, contentType });
      if (uploadError) throw uploadError;

      const settingKey = settingKeys[slot];

      const { data: existing, error: findError } = await supabaseAdmin
        .from("document_settings")
        .select("id")
        .eq("user_id", effectiveOwnerId)
        .eq("setting_key", settingKey)
        .maybeSingle();
      if (findError) throw findError;

      if (existing?.id) {
        const { error: updateError } = await supabaseAdmin
          .from("document_settings")
          .update({
            setting_value: path as any,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq("id", existing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabaseAdmin.from("document_settings").insert({
          user_id: effectiveOwnerId,
          setting_key: settingKey,
          setting_value: path as any,
          updated_by: user.id,
        });
        if (insertError) throw insertError;
      }

      return json({ slot, path });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (e: any) {
    console.error("furniture-contract-template error:", e);
    return json({ error: e?.message || "Greška" }, 400);
  }
});
