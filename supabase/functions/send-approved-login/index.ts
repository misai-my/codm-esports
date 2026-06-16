import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ ok: false, error: "Method not allowed." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const siteLoginUrl = Deno.env.get("SITE_LOGIN_URL") || "https://misai-my.github.io/codm-esports/login.html";

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ ok: false, error: "Missing Supabase function secrets." }, 500);
  }

  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace("Bearer ", "").trim();

  if (!jwt) return jsonResponse({ ok: false, error: "Missing admin authorization." }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const { data: callerData, error: callerError } = await admin.auth.getUser(jwt);

  if (callerError || !callerData?.user) {
    return jsonResponse({ ok: false, error: "Invalid admin session." }, 401);
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id,email,role")
    .eq("id", callerData.user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return jsonResponse({ ok: false, error: "Admin access required." }, 403);
  }

  const body = await req.json().catch(() => ({}));
  const teamId = body.team_id;

  if (!teamId) return jsonResponse({ ok: false, error: "team_id is required." }, 400);

  const { data: team, error: teamError } = await admin
    .from("teams")
    .select("id,tournament_id,team_name,team_tag,captain_email,captain_name,captain_user_id,status,registration_mode")
    .eq("id", teamId)
    .single();

  if (teamError || !team) {
    return jsonResponse({ ok: false, error: "Team not found." }, 404);
  }

  if (team.status !== "approved") {
    return jsonResponse({ ok: false, error: "Only approved registrations can receive login invites." }, 400);
  }

  let invitedUserId = team.captain_user_id;
  let inviteStatus = "sent";
  let message = "Login invite sent to approved registrant.";

  if (!invitedUserId) {
    const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
      team.captain_email,
      {
        data: {
          full_name: team.captain_name,
          role: "captain",
          team_id: team.id,
          registration_mode: team.registration_mode
        },
        redirectTo: siteLoginUrl
      }
    );

    if (inviteError) {
      const { data: existingProfile } = await admin
        .from("profiles")
        .select("id,email")
        .ilike("email", team.captain_email)
        .maybeSingle();

      if (!existingProfile?.id) {
        return jsonResponse({ ok: false, error: inviteError.message }, 400);
      }

      invitedUserId = existingProfile.id;
      inviteStatus = "linked_existing_account";
      message = "Existing captain account linked. Ask the captain to use Forgot Password if they need access.";
    } else {
      invitedUserId = inviteData.user?.id || null;
    }
  } else {
    inviteStatus = "already_linked";
    message = "Team already has a linked captain account.";
  }

  const updatePayload = {
    captain_user_id: invitedUserId,
    login_invite_status: inviteStatus,
    login_invite_sent_at: new Date().toISOString(),
    login_invite_sent_by: profile.id
  };

  const { error: updateTeamError } = await admin
    .from("teams")
    .update(updatePayload)
    .eq("id", team.id);

  if (updateTeamError) {
    return jsonResponse({ ok: false, error: updateTeamError.message }, 500);
  }

  const { error: registrationError } = await admin
    .from("registrations")
    .update({
      captain_user_id: invitedUserId,
      registration_mode: team.registration_mode
    })
    .eq("team_id", team.id);

  if (registrationError) {
    return jsonResponse({ ok: false, error: registrationError.message }, 500);
  }

  return jsonResponse({
    ok: true,
    message,
    status: inviteStatus,
    team_id: team.id,
    captain_user_id: invitedUserId
  });
});
