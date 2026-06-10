// CODM Tournament OS - Admin Sidebar
// Converts admin control buttons into a persistent sidebar on admin pages only.
(function () {
  "use strict";

  const ADMIN_LINKS = [
    ["admin.html", "Admin Hub", "Command overview"],
    ["admin_teams.html", "Registration Admin", "Teams, approvals, stages"],
    ["admin_bracket.html", "Bracket Admin", "Seeds, matches, scores"],
    ["admin_veto.html", "Map Veto Admin", "Veto rooms and control"],
    ["admin_tickets.html", "Ticket Admin", "Support queue"]
  ];

  function currentPage() {
    return String(window.location.pathname || "").split("/").pop() || "admin.html";
  }

  function isAdminPage() {
    return currentPage().startsWith("admin");
  }

  function makeButton(href, label, desc) {
    const a = document.createElement("a");
    a.className = "admin-sidebar-link";
    if (currentPage() === href) a.classList.add("active");
    a.href = href;
    a.innerHTML = `<span>${label}</span><small>${desc}</small>`;
    return a;
  }

  function renderAdminSidebar() {
    if (!isAdminPage()) return;
    if (document.querySelector(".admin-sidebar")) return;

    document.body.classList.add("admin-sidebar-enabled");

    const aside = document.createElement("aside");
    aside.className = "admin-sidebar";
    aside.innerHTML = `
      <div class="admin-sidebar-brand">
        <div class="admin-sidebar-mark">M</div>
        <div>
          <strong>CODM OS</strong>
          <small>Admin Console</small>
        </div>
      </div>
      <nav class="admin-sidebar-nav"></nav>
      <div class="admin-sidebar-footer">
        <a class="admin-sidebar-mini" href="index.html">View Public Site</a>
        <button class="admin-sidebar-mini" type="button" data-admin-sidebar-signout>Sign Out</button>
      </div>
    `;

    const nav = aside.querySelector(".admin-sidebar-nav");
    ADMIN_LINKS.forEach(([href, label, desc]) => nav.appendChild(makeButton(href, label, desc)));

    document.body.prepend(aside);

    aside.querySelector("[data-admin-sidebar-signout]")?.addEventListener("click", () => {
      if (typeof window.signOut === "function") window.signOut();
    });
  }

  document.addEventListener("DOMContentLoaded", renderAdminSidebar);
  setTimeout(renderAdminSidebar, 100);
})();
