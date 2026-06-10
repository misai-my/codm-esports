// CODM Tournament OS - Admin Hamburger Sidebar
(function () {
  "use strict";

  const ADMIN_LINKS = [
    ["admin.html", "⌂", "Admin Hub"],
    ["admin_teams.html", "T", "Registration Admin"],
    ["admin_bracket.html", "B", "Bracket Admin"],
    ["admin_veto.html", "V", "Map Veto Admin"],
    ["admin_tickets.html", "Q", "Ticket Admin"]
  ];

  function currentPage() {
    return String(window.location.pathname || "").split("/").pop() || "admin.html";
  }

  function isAdminPage() {
    return currentPage().startsWith("admin");
  }

  function createToggleButton() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sidebar-toggle-btn";
    btn.setAttribute("aria-label", "Open menu");
    btn.innerHTML = '<span></span><span></span><span></span>';
    btn.addEventListener("click", () => {
      document.body.classList.add("admin-sidebar-open");
    });
    return btn;
  }

  function createBackdrop() {
    const backdrop = document.createElement("div");
    backdrop.className = "sidebar-backdrop admin-sidebar-backdrop";
    backdrop.addEventListener("click", closeSidebar);
    return backdrop;
  }

  function closeSidebar() {
    document.body.classList.remove("admin-sidebar-open");
  }

  function makeLink(href, icon, label) {
    const a = document.createElement("a");
    a.className = "admin-sidebar-link";
    if (currentPage() === href) a.classList.add("active");
    a.href = href;
    a.innerHTML = `
      <span class="simple-icon">${icon}</span>
      <span class="simple-label">${label}</span>
    `;
    return a;
  }

  function ensureHeaderToggle() {
    const navInner = document.querySelector(".nav .nav-inner");
    if (!navInner) return;

    navInner.classList.add("drawer-nav-ready");

    if (!navInner.querySelector(".sidebar-toggle-btn")) {
      navInner.insertBefore(createToggleButton(), navInner.firstChild);
    }

    const navLinks = navInner.querySelector(".nav-links");
    if (navLinks) navLinks.classList.add("drawer-nav-hidden");
  }

  function renderAdminSidebar() {
    if (!isAdminPage()) return;

    ensureHeaderToggle();

    if (!document.querySelector(".admin-sidebar-backdrop")) {
      document.body.appendChild(createBackdrop());
    }

    if (!document.querySelector(".admin-sidebar")) {
      const aside = document.createElement("aside");
      aside.className = "admin-sidebar simple-drawer";
      aside.innerHTML = `
        <div class="simple-sidebar-top">
          <div class="simple-sidebar-brand">
            <div class="simple-brand-mark">M</div>
            <div>
              <strong>CODM Tournament OS</strong>
              <small>Admin Console</small>
            </div>
          </div>
          <button class="simple-close-btn" type="button" aria-label="Close menu">×</button>
        </div>
        <nav class="simple-sidebar-nav"></nav>
        <div class="simple-sidebar-footer">
          <a class="simple-side-action" href="index.html">
            <span class="simple-icon">⌂</span>
            <span class="simple-label">Public Site</span>
          </a>
          <button class="simple-side-action" type="button" data-admin-signout>
            <span class="simple-icon">↦</span>
            <span class="simple-label">Sign Out</span>
          </button>
        </div>
      `;

      const nav = aside.querySelector(".simple-sidebar-nav");
      ADMIN_LINKS.forEach(([href, icon, label]) => nav.appendChild(makeLink(href, icon, label)));

      aside.querySelector(".simple-close-btn")?.addEventListener("click", closeSidebar);
      aside.querySelector("[data-admin-signout]")?.addEventListener("click", () => {
        if (typeof window.signOut === "function") window.signOut();
      });

      document.body.appendChild(aside);
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSidebar();
    });
  }

  window.renderAdminSidebar = renderAdminSidebar;

  document.addEventListener("DOMContentLoaded", renderAdminSidebar);
  setTimeout(renderAdminSidebar, 100);
})();
