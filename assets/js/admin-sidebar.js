// CODM Tournament OS - Admin Sidebar
// Clean collapsible sidebar for admin pages only.
(function () {
  "use strict";

  const STORAGE_KEY = "codm:admin_sidebar_collapsed";

  const ADMIN_LINKS = [
    ["admin.html", "Hub", "Admin Hub", "Overview"],
    ["admin_teams.html", "Teams", "Registration Admin", "Teams, approvals, stages"],
    ["admin_bracket.html", "Bracket", "Bracket Admin", "Seeds, schedules, scores"],
    ["admin_veto.html", "Veto", "Map Veto Admin", "Veto rooms and control"],
    ["admin_tickets.html", "Tickets", "Ticket Admin", "Support queue"]
  ];

  function currentPage() {
    return String(window.location.pathname || "").split("/").pop() || "admin.html";
  }

  function isAdminPage() {
    return currentPage().startsWith("admin");
  }

  function isCollapsed() {
    return localStorage.getItem(STORAGE_KEY) === "1";
  }

  function applyCollapsedState(collapsed) {
    document.body.classList.toggle("admin-sidebar-collapsed", collapsed);
    localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");

    const btn = document.querySelector("[data-admin-sidebar-toggle]");
    if (btn) {
      btn.setAttribute("aria-label", collapsed ? "Expand admin sidebar" : "Collapse admin sidebar");
      btn.title = collapsed ? "Expand sidebar" : "Collapse sidebar";
      btn.textContent = collapsed ? "›" : "‹";
    }
  }

  function makeButton(href, shortLabel, label, desc) {
    const a = document.createElement("a");
    a.className = "admin-sidebar-link";
    if (currentPage() === href) a.classList.add("active");
    a.href = href;
    a.innerHTML = `
      <span class="side-icon">${shortLabel.slice(0, 1)}</span>
      <span class="side-text">
        <strong>${label}</strong>
        <small>${desc}</small>
      </span>
    `;
    return a;
  }

  function renderAdminSidebar() {
    if (!isAdminPage()) return;

    document.body.classList.add("admin-sidebar-enabled");

    let aside = document.querySelector(".admin-sidebar");
    if (!aside) {
      aside = document.createElement("aside");
      aside.className = "admin-sidebar";
      aside.innerHTML = `
        <div class="admin-sidebar-head">
          <div class="admin-sidebar-brand">
            <div class="admin-sidebar-mark">M</div>
            <div class="side-text">
              <strong>CODM OS</strong>
              <small>Admin Console</small>
            </div>
          </div>
          <button class="sidebar-toggle" type="button" data-admin-sidebar-toggle aria-label="Collapse admin sidebar">‹</button>
        </div>
        <nav class="admin-sidebar-nav"></nav>
        <div class="admin-sidebar-footer">
          <a class="admin-sidebar-mini" href="index.html"><span class="side-icon">P</span><span class="side-text">Public Site</span></a>
          <button class="admin-sidebar-mini" type="button" data-admin-sidebar-signout><span class="side-icon">S</span><span class="side-text">Sign Out</span></button>
        </div>
      `;

      const nav = aside.querySelector(".admin-sidebar-nav");
      ADMIN_LINKS.forEach(([href, shortLabel, label, desc]) => nav.appendChild(makeButton(href, shortLabel, label, desc)));
      document.body.prepend(aside);

      aside.querySelector("[data-admin-sidebar-toggle]")?.addEventListener("click", () => {
        applyCollapsedState(!document.body.classList.contains("admin-sidebar-collapsed"));
      });

      aside.querySelector("[data-admin-sidebar-signout]")?.addEventListener("click", () => {
        if (typeof window.signOut === "function") window.signOut();
      });
    }

    applyCollapsedState(isCollapsed());
  }

  window.renderAdminSidebar = renderAdminSidebar;

  document.addEventListener("DOMContentLoaded", renderAdminSidebar);
  setTimeout(renderAdminSidebar, 100);
})();
