// CODM Tournament OS - Admin Hamburger Sidebar
(function () {
  "use strict";

  function forceFixedDrawer() {
    const drawer = document.querySelector(".admin-sidebar.simple-drawer");
    if (!drawer) return;

    drawer.style.position = "fixed";
    drawer.style.top = "0";
    drawer.style.left = "0";
    drawer.style.bottom = "0";
    drawer.style.height = "100dvh";
    drawer.style.maxHeight = "100dvh";
    drawer.style.overflowY = "auto";
    drawer.style.overflowX = "hidden";
    drawer.style.zIndex = "9999";
    drawer.style.willChange = "transform";
  }

  function setPageScrollLock(locked) {
    document.documentElement.classList.toggle("sidebar-scroll-locked", locked);
    document.body.classList.toggle("sidebar-scroll-locked", locked);
  }


  const ADMIN_LINKS = [
    ["admin.html", "Admin Hub"],
    ["admin_teams.html", "Registration Admin"],
    ["admin_bracket.html", "Bracket Admin"],
    ["admin_veto.html", "Map Veto Admin"],
    ["admin_tickets.html", "Ticket Admin"]
  ];

  function currentPage() {
    return String(window.location.pathname || "").split("/").pop() || "admin.html";
  }

  function isAdminPage() {
    return currentPage().startsWith("admin");
  }

  function closeSidebar() {
    document.body.classList.remove("admin-sidebar-open");
    setPageScrollLock(false);
    forceFixedDrawer();
  }

  function createToggleButton() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sidebar-toggle-btn";
    btn.setAttribute("aria-label", "Open menu");
    btn.innerHTML = "<span></span><span></span><span></span>";
    btn.addEventListener("click", () => document.body.classList.add("admin-sidebar-open"); setPageScrollLock(true); forceFixedDrawer());
    return btn;
  }

  function createBackdrop() {
    const backdrop = document.createElement("div");
    backdrop.className = "sidebar-backdrop admin-sidebar-backdrop";
    backdrop.addEventListener("click", closeSidebar);
    return backdrop;
  }

  function makeLink(href, label) {
    const a = document.createElement("a");
    a.className = "admin-sidebar-link";
    if (currentPage() === href) a.classList.add("active");
    a.href = href;
    a.textContent = label;
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
    forceFixedDrawer();

    if (!document.querySelector(".admin-sidebar-backdrop")) {
      document.body.appendChild(createBackdrop());
    }

    if (!document.querySelector(".admin-sidebar")) {
      const aside = document.createElement("aside");
      aside.className = "admin-sidebar simple-drawer";
      aside.innerHTML = `
        <div class="simple-sidebar-top">
          <a class="simple-sidebar-brand" href="admin.html">
            <img class="simple-sidebar-logo" src="assets/img/codm-logo.png" alt="CODM Tournament OS" />
            <div class="simple-brand-text">
              <strong>CODM Tournament OS</strong>
              <small>Admin Console</small>
            </div>
          </a>
          <button class="simple-close-btn" type="button" aria-label="Close menu">×</button>
        </div>
        <nav class="simple-sidebar-nav"></nav>
        <div class="simple-sidebar-footer">
          <a class="simple-side-action" href="index.html">View Public Site</a>
          <button class="simple-side-action" type="button" data-admin-signout>Sign Out</button>
        </div>
      `;

      const nav = aside.querySelector(".simple-sidebar-nav");
      ADMIN_LINKS.forEach(([href, label]) => nav.appendChild(makeLink(href, label)));

      aside.querySelector(".simple-close-btn")?.addEventListener("click", closeSidebar);
      aside.querySelector("[data-admin-signout]")?.addEventListener("click", () => {
        if (typeof window.signOut === "function") window.signOut();
      });

      document.body.appendChild(aside);
      forceFixedDrawer();
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSidebar();
    });
  }

  window.renderAdminSidebar = renderAdminSidebar;

  window.addEventListener("scroll", forceFixedDrawer, { passive: true });
  window.addEventListener("resize", forceFixedDrawer);
  document.addEventListener("DOMContentLoaded", renderAdminSidebar);
  setTimeout(renderAdminSidebar, 100);
})();
