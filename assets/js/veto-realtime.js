/* ============================================================
   CODM Tournament OS - veto-realtime.js

   Drop into:
   assets/js/veto-realtime.js

   Add this after veto-engine.js on admin_veto.html and veto.html:

   <script src="assets/js/veto-realtime.js"></script>

   This listens to Supabase Realtime updates for:
   - match_vetos
   - match_veto_steps
   - match_veto_actions
   - match_games
   - matches
   - codm_map_pools

   It auto-refreshes the veto room when another captain/admin acts.
   ============================================================ */

(function () {
  "use strict";

  let activeChannel = null;
  let refreshTimer = null;
  let currentKey = null;

  function debounceRefresh(callback, delay = 350) {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      if (typeof callback === "function") {
        callback();
      }
    }, delay);
  }

  function unsubscribe() {
    if (activeChannel && window.sb) {
      window.sb.removeChannel(activeChannel);
    }

    activeChannel = null;
    currentKey = null;
  }

  function getMatchIdFromUrl() {
    return new URLSearchParams(window.location.search).get("match_id");
  }

  function getSelectedAdminMatchId() {
    const select = document.querySelector("#matchSelect");
    return select ? select.value : null;
  }

  function resolveReloadFunction() {
    // Captain/public veto room
    if (typeof window.loadVeto === "function") {
      return () => window.loadVeto();
    }

    // Admin veto room
    if (typeof window.loadActiveVetoForMatch === "function") {
      return () => window.loadActiveVetoForMatch();
    }

    return null;
  }

  function subscribeForMatch(matchId, reloadFn) {
    if (!window.sb || !matchId || typeof reloadFn !== "function") return;

    const key = `veto-realtime:${matchId}`;
    if (currentKey === key && activeChannel) return;

    unsubscribe();

    currentKey = key;

    activeChannel = window.sb
      .channel(key)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_vetos",
          filter: `match_id=eq.${matchId}`
        },
        () => debounceRefresh(reloadFn)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_games",
          filter: `match_id=eq.${matchId}`
        },
        () => debounceRefresh(reloadFn)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `id=eq.${matchId}`
        },
        () => debounceRefresh(reloadFn)
      )
      // These are not filtered because veto_id is not always known at bootstrap.
      // The debounce keeps reloads light.
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_veto_steps"
        },
        () => debounceRefresh(reloadFn)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_veto_actions"
        },
        () => debounceRefresh(reloadFn)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "codm_map_pools"
        },
        () => debounceRefresh(reloadFn)
      )
      .subscribe((status) => {
        if (window.console) {
          console.log("[CODM Veto Realtime]", key, status);
        }
      });
  }

  function bootstrap() {
    const reloadFn = resolveReloadFunction();
    if (!reloadFn) return;

    const matchId = getMatchIdFromUrl() || getSelectedAdminMatchId();
    if (!matchId) return;

    subscribeForMatch(matchId, reloadFn);

    const matchSelect = document.querySelector("#matchSelect");
    if (matchSelect && !matchSelect.dataset.realtimeBound) {
      matchSelect.dataset.realtimeBound = "1";
      matchSelect.addEventListener("change", () => {
        const newMatchId = getSelectedAdminMatchId();
        subscribeForMatch(newMatchId, reloadFn);
      });
    }
  }

  window.CODMVetoRealtime = {
    bootstrap,
    subscribeForMatch,
    unsubscribe
  };

  window.addEventListener("load", () => {
    setTimeout(bootstrap, 500);
  });
})();
