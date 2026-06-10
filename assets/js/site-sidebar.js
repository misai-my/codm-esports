// CODM Tournament OS - Public/Captain Sidebar
// Clean collapsible sidebar for public and captain pages.
(function () {
  "use strict";

  const STORAGE_KEY = "codm:site_sidebar_collapsed";

  const PUBLIC_LINKS = [
    ["index.html", "H", "Home", "Landing page"],
    ["index.html#tournaments", "T", "Tournament", "Event selection"],
    ["rules.html", "R", "Rulebook", "Rules and formats"]
  ];

  const CAPTAIN_LINKS = [
    ["register.html", "G", "Register", "Team registration"],
    ["bracket.html", "B", "Bracket", "Tournament bracket"],
    ["matches.html", "M", "My Matches", "Match center"],
    ["support.html", "S", "FAQ & Support", "Tickets and Discord"]
  ];

  function currentPage() {
    return String(window.location.pathname || "").split("/").pop() || "index.html";
  }

  function isAdminPage() {
    return currentPage().startsWith("admin");
  }

  function isCollapsed() {
    return localStorage.getItem(STORAGE_KEY) === "1";
  }

  function applyCollapsedState(collapsed) {
    document.body.classList.toggle("site-sidebar-collapsed", collapsed);
    localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");

    const btn = document.querySelector("[data-site-sidebar-toggle]");
    if (btn) {
      btn.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
      btn.title = collapsed ? "Expand sidebar" : "Collapse sidebar";
      btn.textContent = collapsed ? "›" : "‹";
    }
  }

  function makeLink(href, icon, label, desc) {
    const a = document.createElement("a");
    a.className = "site-sidebar-link";

    const page = currentPage();
    const hrefPage = String(href).split("#")[0];

    if (page === hrefPage || (page === "index.html" && href.startsWith("index.html"))) {
      a.classList.add("active");
    }

    a.href = href;
    a.innerHTML = `
      <span class="side-icon">${icon}</span>
      <span class="side-text">
        <strong>${label}</strong>
        <small>${desc}</small>
      </span>
    `;
    return a;
  }

  async function getSessionSafe() {
    try {
      if (typeof window.getSession === "function") return await window.getSession();
      if (window.sb?.auth) {
        const { data } = await window.sb.auth.getSession();
        return data?.session || null;
      }
    } catch (err) {
      console.warn("Sidebar session check failed:", err);
    }
    return null;
  }

  async function renderSiteSidebar() {
    if (isAdminPage()) return;

    const session = await getSessionSafe();

    document.body.classList.add("site-sidebar-enabled");

    let sidebar = document.querySelector(".site-sidebar");
    if (!sidebar) {
      sidebar = document.createElement("aside");
      sidebar.className = "site-sidebar";
      sidebar.innerHTML = `
        <div class="site-sidebar-head">
          <div class="site-sidebar-brand">
            <div class="site-sidebar-mark">M</div>
            <div class="side-text">
              <strong>CODM OS</strong>
              <small data-site-sidebar-subtitle>Tournament Portal</small>
            </div>
          </div>
          <button class="sidebar-toggle" type="button" data-site-sidebar-toggle aria-label="Collapse sidebar">‹</button>
        </div>
        <nav class="site-sidebar-nav"></nav>
        <div class="site-sidebar-footer"></div>
      `;
      document.body.prepend(sidebar);

      sidebar.querySelector("[data-site-sidebar-toggle]")?.addEventListener("click", () => {
        applyCollapsedState(!document.body.classList.contains("site-sidebar-collapsed"));
      });
    }

    const nav = sidebar.querySelector(".site-sidebar-nav");
    const footer = sidebar.querySelector(".site-sidebar-footer");
    const subtitle = sidebar.querySelector("[data-site-sidebar-subtitle]");

    if (subtitle) subtitle.textContent = session ? "Captain Console" : "Tournament Portal";

    nav.innerHTML = "";
    PUBLIC_LINKS.forEach(([href, icon, label, desc]) => nav.appendChild(makeLink(href, icon, label, desc)));

    if (session) {
      const divider = document.createElement("div");
      divider.className = "site-sidebar-divider side-text";
      divider.textContent = "Captain";
      nav.appendChild(divider);
      CAPTAIN_LINKS.forEach(([href, icon, label, desc]) => nav.appendChild(makeLink(href, icon, label, desc)));
    }

    footer.innerHTML = session
      ? `<button class="site-sidebar-mini" type="button" data-site-sidebar-signout><span class="side-icon">S</span><span class="side-text">Sign Out</span></button>`
      : `<a class="site-sidebar-mini" href="register.html"><span class="side-icon">L</span><span class="side-text">Captain Login</span></a>`;

    footer.querySelector("[data-site-sidebar-signout]")?.addEventListener("click", () => {
      if (typeof window.signOut === "function") window.signOut();
    });

    const headerNav = document.querySelector(".nav .nav-links");
    if (headerNav) headerNav.classList.add("sidebar-nav-hidden");

    applyCollapsedState(isCollapsed());
  }

  window.renderSiteSidebar = renderSiteSidebar;

  document.addEventListener("DOMContentLoaded", renderSiteSidebar);
  setTimeout(renderSiteSidebar, 100);
  setTimeout(renderSiteSidebar, 500);

  if (window.sb?.auth) {
    window.sb.auth.onAuthStateChange(() => setTimeout(renderSiteSidebar, 50));
  }
})();
