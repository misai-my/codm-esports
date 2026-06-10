/* ============================================================
   CODM Tournament OS - Visible Veto Countdown Timer
   Drop into: assets/js/veto-timer.js
   Load after veto-engine.js and before inline page scripts.
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

  function escape(value) {
    if (typeof window.escapeHtml === "function") return window.escapeHtml(value);
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function actionLabel(actionType) {
    if (window.CODMVeto && typeof window.CODMVeto.actionLabel === "function") {
      return window.CODMVeto.actionLabel(actionType);
    }

    const labels = {
      ban: "Ban Map",
      pick: "Pick Map",
      auto_remaining: "Assign Remaining Map",
      side: "Pick Starting Side"
    };

    return labels[actionType] || actionType || "Current Action";
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
      previous && previous.completed_at,
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
           data-start="${escape(startIso)}"
           data-seconds="${seconds}">
        <div class="veto-countdown-head">
          <div>
            <div class="eyebrow">${escape(title)}</div>
            <strong class="veto-countdown-step">Step ${Number(current.step_no || 0)} · ${escape(actionLabel(current.action_type))}</strong>
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
