/* ============================================================
   CODM Tournament OS - veto-engine.js
   Drop into: assets/js/veto-engine.js

   Requires:
   - assets/js/config.js
   - assets/js/main.js
   - Supabase client window.sb

   Provides:
   - Default BO3 / BO5 / GF BO7 veto templates
   - Map availability helpers
   - Render helpers
   - Random selection helpers
   ============================================================ */

(function () {
  "use strict";

  const SIDES = [
    { value: "blue", label: "Blue Side" },
    { value: "red", label: "Red Side" }
  ];

  function oppositeSide(side) {
    return side === "blue" ? "red" : "blue";
  }

  function slotLabel(slot) {
    if (slot === "team1") return "Team 1";
    if (slot === "team2") return "Team 2";
    return "Admin";
  }

  function actionLabel(actionType) {
    const labels = {
      ban: "Ban Map",
      pick: "Pick Map",
      auto_remaining: "Assign Remaining Map",
      side: "Pick Starting Side"
    };
    return labels[actionType] || actionType;
  }

  function stepDescription(step, teams = {}) {
    const actor = step.acting_slot === "team1"
      ? teams.team1?.team_name || "Team 1"
      : step.acting_slot === "team2"
        ? teams.team2?.team_name || "Team 2"
        : "Admin";

    let game = step.target_game_no ? ` for Map ${step.target_game_no}` : "";

    if (step.action_type === "auto_remaining") {
      return `Admin assigns the remaining ${step.phase_mode} map${game}.`;
    }

    if (step.action_type === "side") {
      return `${actor} picks starting side${game}.`;
    }

    return `${actor} ${step.action_type === "ban" ? "bans" : "picks"} a ${step.phase_mode} map${game}.`;
  }

  function buildDefaultVetoTemplate(formatType) {
    const format = String(formatType || "BO5").toUpperCase();

    if (format === "BO3") return buildBO3Template();
    if (format === "GF_BO7_ADV") return buildGFBO7AdvTemplate();
    return buildBO5Template();
  }

  function withStepNos(items) {
    return items.map((item, idx) => ({ step_no: idx + 1, ...item }));
  }

  function buildBO3Template() {
    return withStepNos([
      // Hardpoint
      { phase_mode: "Hardpoint", action_type: "ban", acting_slot: "team1" },
      { phase_mode: "Hardpoint", action_type: "ban", acting_slot: "team2" },
      { phase_mode: "Hardpoint", action_type: "ban", acting_slot: "team1" },
      { phase_mode: "Hardpoint", action_type: "ban", acting_slot: "team2" },
      { phase_mode: "Hardpoint", action_type: "auto_remaining", acting_slot: "admin", target_game_no: 1 },
      { phase_mode: "Hardpoint", action_type: "side", acting_slot: "team1", target_game_no: 1 },

      // Search and Destroy
      { phase_mode: "Search and Destroy", action_type: "ban", acting_slot: "team2" },
      { phase_mode: "Search and Destroy", action_type: "ban", acting_slot: "team1" },
      { phase_mode: "Search and Destroy", action_type: "ban", acting_slot: "team2" },
      { phase_mode: "Search and Destroy", action_type: "ban", acting_slot: "team1" },
      { phase_mode: "Search and Destroy", action_type: "auto_remaining", acting_slot: "admin", target_game_no: 2 },
      { phase_mode: "Search and Destroy", action_type: "side", acting_slot: "team2", target_game_no: 2 },

      // Control
      { phase_mode: "Control", action_type: "ban", acting_slot: "team1" },
      { phase_mode: "Control", action_type: "ban", acting_slot: "team2" },
      { phase_mode: "Control", action_type: "auto_remaining", acting_slot: "admin", target_game_no: 3 },
      { phase_mode: "Control", action_type: "side", acting_slot: "team1", target_game_no: 3 }
    ]);
  }

  function buildBO5Template() {
    return withStepNos([
      // Hardpoint
      { phase_mode: "Hardpoint", action_type: "ban", acting_slot: "team1" },
      { phase_mode: "Hardpoint", action_type: "ban", acting_slot: "team2" },
      { phase_mode: "Hardpoint", action_type: "pick", acting_slot: "team1", target_game_no: 1 },
      { phase_mode: "Hardpoint", action_type: "side", acting_slot: "team2", target_game_no: 1 },
      { phase_mode: "Hardpoint", action_type: "pick", acting_slot: "team2", target_game_no: 4 },
      { phase_mode: "Hardpoint", action_type: "side", acting_slot: "team1", target_game_no: 4 },

      // Search and Destroy
      { phase_mode: "Search and Destroy", action_type: "ban", acting_slot: "team2" },
      { phase_mode: "Search and Destroy", action_type: "ban", acting_slot: "team1" },
      { phase_mode: "Search and Destroy", action_type: "pick", acting_slot: "team2", target_game_no: 2 },
      { phase_mode: "Search and Destroy", action_type: "side", acting_slot: "team1", target_game_no: 2 },
      { phase_mode: "Search and Destroy", action_type: "pick", acting_slot: "team1", target_game_no: 5 },
      { phase_mode: "Search and Destroy", action_type: "side", acting_slot: "team2", target_game_no: 5 },

      // Control
      { phase_mode: "Control", action_type: "ban", acting_slot: "team1" },
      { phase_mode: "Control", action_type: "ban", acting_slot: "team2" },
      { phase_mode: "Control", action_type: "auto_remaining", acting_slot: "admin", target_game_no: 3 },
      { phase_mode: "Control", action_type: "side", acting_slot: "team1", target_game_no: 3 }
    ]);
  }

  function buildGFBO7AdvTemplate() {
    return withStepNos([
      // Hardpoint
      { phase_mode: "Hardpoint", action_type: "ban", acting_slot: "team1" },
      { phase_mode: "Hardpoint", action_type: "ban", acting_slot: "team2" },
      { phase_mode: "Hardpoint", action_type: "pick", acting_slot: "team1", target_game_no: 1 },
      { phase_mode: "Hardpoint", action_type: "side", acting_slot: "team2", target_game_no: 1 },
      { phase_mode: "Hardpoint", action_type: "pick", acting_slot: "team2", target_game_no: 4 },
      { phase_mode: "Hardpoint", action_type: "side", acting_slot: "team1", target_game_no: 4 },

      // Search and Destroy
      { phase_mode: "Search and Destroy", action_type: "ban", acting_slot: "team2" },
      { phase_mode: "Search and Destroy", action_type: "ban", acting_slot: "team1" },
      { phase_mode: "Search and Destroy", action_type: "pick", acting_slot: "team2", target_game_no: 2 },
      { phase_mode: "Search and Destroy", action_type: "side", acting_slot: "team1", target_game_no: 2 },
      { phase_mode: "Search and Destroy", action_type: "pick", acting_slot: "team1", target_game_no: 6 },
      { phase_mode: "Search and Destroy", action_type: "side", acting_slot: "team2", target_game_no: 6 },

      // Control
      { phase_mode: "Control", action_type: "pick", acting_slot: "team1", target_game_no: 3 },
      { phase_mode: "Control", action_type: "side", acting_slot: "team2", target_game_no: 3 },
      { phase_mode: "Control", action_type: "pick", acting_slot: "team2", target_game_no: 5 },
      { phase_mode: "Control", action_type: "side", acting_slot: "team1", target_game_no: 5 }
    ]);
  }

  function mapPoolForMode(mapPools, mode) {
    return (mapPools || [])
      .filter(m => m.mode === mode && m.is_active !== false)
      .sort((a, b) => Number(a.display_order || 999) - Number(b.display_order || 999) || a.map_name.localeCompare(b.map_name));
  }

  function usedMapsForMode(steps, mode) {
    return new Set(
      (steps || [])
        .filter(s =>
          s.phase_mode === mode &&
          ["ban", "pick", "auto_remaining"].includes(s.action_type) &&
          ["completed", "randomized"].includes(s.status) &&
          s.selected_map_name
        )
        .map(s => s.selected_map_name)
    );
  }

  function availableMapsForStep(step, steps, mapPools) {
    const pool = mapPoolForMode(mapPools, step.phase_mode);
    const used = usedMapsForMode(steps, step.phase_mode);

    return pool.filter(m => !used.has(m.map_name));
  }

  function remainingMapName(step, steps, mapPools) {
    const available = availableMapsForStep(step, steps, mapPools);
    if (!available.length) return null;
    return available[0].map_name;
  }

  function randomMapName(step, steps, mapPools) {
    const available = availableMapsForStep(step, steps, mapPools);
    if (!available.length) return null;
    const idx = Math.floor(Math.random() * available.length);
    return available[idx].map_name;
  }

  function randomSide() {
    return Math.random() > 0.5 ? "blue" : "red";
  }

  function isStepActionableByUser(step, veto, userProfile, teams) {
    if (!step || !veto || !userProfile) return false;
    if (userProfile.role === "admin") return true;
    if (veto.status !== "active") return false;
    if (step.status !== "pending") return false;
    if (Number(veto.current_step_no) !== Number(step.step_no)) return false;

    if (step.acting_slot === "team1") return teams.team1?.captain_user_id === userProfile.id;
    if (step.acting_slot === "team2") return teams.team2?.captain_user_id === userProfile.id;

    return false;
  }

  function formatSide(side) {
    if (side === "blue") return "Blue Side";
    if (side === "red") return "Red Side";
    return "TBD";
  }

  function formatActionResult(step) {
    if (!step) return "";
    if (step.action_type === "side") return formatSide(step.selected_side);
    if (step.selected_map_name) return step.selected_map_name;
    return "Pending";
  }

  window.CODMVeto = {
    SIDES,
    oppositeSide,
    slotLabel,
    actionLabel,
    stepDescription,
    buildDefaultVetoTemplate,
    buildBO3Template,
    buildBO5Template,
    buildGFBO7AdvTemplate,
    mapPoolForMode,
    usedMapsForMode,
    availableMapsForStep,
    remainingMapName,
    randomMapName,
    randomSide,
    isStepActionableByUser,
    formatSide,
    formatActionResult
  };
})();


/* ============================================================
   CODM Veto Visible Countdown Timer
   - No database changes required.
   - Uses current step start time from:
     previous completed step completed_at,
     reset_at,
     started_at,
     created_at,
     updated_at,
     or current browser time fallback.
   ============================================================ */
(function () {
  "use strict";

  function parseDateMs(value) {
    if (!value) return null;
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : null;
  }

  function doneStatus(status) {
    return ["completed", "randomized", "skipped"].includes(String(status || "").toLowerCase());
  }

  function getCurrentStep(veto, steps) {
    if (!veto || !Array.isArray(steps)) return null;
    return steps.find(s =>
      Number(s.step_no) === Number(veto.current_step_no) &&
      String(s.status || "").toLowerCase() === "pending"
    ) || null;
  }

  function getStepStartIso(veto, steps) {
    if (!veto) return new Date().toISOString();

    const currentStepNo = Number(veto.current_step_no || 1);
    const previous = (Array.isArray(steps) ? steps : [])
      .filter(s => Number(s.step_no) < currentStepNo && doneStatus(s.status) && s.completed_at)
      .sort((a, b) => Number(b.step_no) - Number(a.step_no))[0];

    const possible = [
      previous?.completed_at,
      veto.reset_at,
      veto.started_at,
      veto.created_at,
      veto.updated_at
    ];

    const valid = possible.find(v => parseDateMs(v));
    return valid || new Date().toISOString();
  }

  function formatClock(totalSeconds) {
    const sign = totalSeconds < 0 ? "+" : "";
    const abs = Math.abs(totalSeconds);
    const mins = Math.floor(abs / 60);
    const secs = abs % 60;
    return `${sign}${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function render(veto, steps, options = {}) {
    const current = getCurrentStep(veto, steps);
    if (!veto || !current || String(veto.status || "").toLowerCase() !== "active") return "";

    const seconds = Math.max(1, Number(veto.timer_seconds || 60));
    const startIso = getStepStartIso(veto, steps);
    const title = options.title || "Decision Timer";

    return `
      <div class="veto-countdown-panel"
           data-veto-countdown
           data-start="${String(startIso)}"
           data-seconds="${seconds}">
        <div class="veto-countdown-head">
          <div>
            <div class="eyebrow">${title}</div>
            <strong class="veto-countdown-step">Step ${Number(current.step_no || 0)} · ${escapeHtml(window.CODMVeto?.actionLabel ? window.CODMVeto.actionLabel(current.action_type) : current.action_type)}</strong>
          </div>
          <div class="veto-countdown-clock" data-veto-clock>--:--</div>
        </div>
        <div class="veto-countdown-bar">
          <span data-veto-bar style="width:100%"></span>
        </div>
        <div class="veto-countdown-foot">
          <span data-veto-label>Waiting for current action...</span>
          <span>${seconds}s official decision window</span>
        </div>
      </div>
    `;
  }

  function updateOne(el) {
    const start = parseDateMs(el.dataset.start);
    const seconds = Math.max(1, Number(el.dataset.seconds || 60));
    if (!start) return;

    const elapsed = Math.floor((Date.now() - start) / 1000);
    const remaining = seconds - elapsed;
    const pct = Math.max(0, Math.min(100, (remaining / seconds) * 100));

    const clock = el.querySelector("[data-veto-clock]");
    const bar = el.querySelector("[data-veto-bar]");
    const label = el.querySelector("[data-veto-label]");

    el.classList.toggle("is-warning", remaining <= 15 && remaining > 0);
    el.classList.toggle("is-overtime", remaining <= 0);

    if (clock) clock.textContent = remaining > 0 ? formatClock(remaining) : `OT ${formatClock(remaining)}`;
    if (bar) bar.style.width = `${pct}%`;
    if (label) {
      label.textContent = remaining > 0
        ? "On the clock — lock the selection before time expires."
        : "Timer expired — admin may randomize this action.";
    }
  }

  function start() {
    if (window.__codmVetoCountdownInterval) {
      clearInterval(window.__codmVetoCountdownInterval);
    }

    const tick = () => document.querySelectorAll("[data-veto-countdown]").forEach(updateOne);
    tick();
    window.__codmVetoCountdownInterval = setInterval(tick, 1000);
  }

  window.CODMVetoTimer = {
    render,
    start,
    getStepStartIso,
    formatClock
  };
})();
