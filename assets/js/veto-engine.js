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
