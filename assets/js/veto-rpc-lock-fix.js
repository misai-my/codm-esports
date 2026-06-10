/* ============================================================
   CODM Tournament OS - veto-rpc-lock-fix.js

   Purpose:
   - Forces captain/admin step completion through secure RPC:
     public.complete_veto_step()
   - Prevents captains from directly updating match_veto_steps.
   - Works as a drop-in patch for admin_veto.html and veto.html.

   Setup:
   Add AFTER the existing inline page script in admin_veto.html and veto.html:

   <script src="assets/js/veto-rpc-lock-fix.js"></script>

   If you already have veto-realtime.js, load this after it.
   ============================================================ */

(function () {
  "use strict";

  async function completeVetoStepViaRpc(stepId, mapName, side, isRandom) {
    if (!window.sb) {
      throw new Error("Supabase client is not loaded.");
    }

    const { data, error } = await window.sb.rpc("complete_veto_step", {
      p_step_id: stepId,
      p_selected_map_name: mapName || null,
      p_selected_side: side || null,
      p_is_random: !!isRandom
    });

    if (error) throw error;
    return data;
  }

  window.completeVetoStepViaRpc = completeVetoStepViaRpc;

  // Override the original global completeStep() from admin_veto.html / veto.html.
  window.completeStep = async function secureCompleteStep(stepId, mapName, side, isRandom = false) {
    try {
      await completeVetoStepViaRpc(stepId, mapName, side, isRandom);

      if (typeof window.showToast === "function") {
        window.showToast("Selection locked.", "success");
      }

      // Admin veto page refresh function
      if (typeof window.loadActiveVetoForMatch === "function") {
        // activeVeto is a global lexical variable in admin_veto.html
        await window.loadActiveVetoForMatch();
      }

      // Captain/public veto room refresh function
      if (typeof window.loadVeto === "function") {
        await window.loadVeto();

        // If veto is complete, apply selections to match_games.
        // Admin can also do this manually in admin_veto.html.
        try {
          if (typeof activeVeto !== "undefined" && activeVeto?.status === "completed") {
            await window.sb.rpc("apply_completed_veto", {
              p_veto_id: activeVeto.id
            });
          }
        } catch (applyErr) {
          console.warn("[Veto RPC Patch] Apply completed veto skipped:", applyErr);
        }
      }
    } catch (err) {
      console.error(err);
      if (typeof window.showToast === "function") {
        window.showToast(err.message || "Failed to lock selection.", "error");
      } else {
        alert(err.message || "Failed to lock selection.");
      }
    }
  };
})();
