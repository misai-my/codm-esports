// CODM Tournament OS - Public/Captain Sidebar
// Converts public and captain navigation into a persistent sidebar.
// Admin pages keep using assets/js/admin-sidebar.js.
(function () {
  "use strict";

  const PUBLIC_LINKS = [
    ["index.html", "Home", "Landing page"],
    ["index.html#tournaments", "Tournament", "Event selection"],
    ["rules.html", "Rulebook", "Rules and formats"]
  ];

  const CAPTAIN_LINKS = [
    ["register.html", "Register", "Team registration"],
    ["bracket.html", "Bracket", "Tournament bracket"],
    ["matches.html", "My Matches", "Captain match center"],
    ["support.html", "FAQ & Support", "Tickets and Discord"]
  ];

  function currentPage() {
    return String(window.location.pathname || "").split("/").pop() || "index.html";
  }

  function isAdminPage() {
    return currentPage().startsWith("admin");
  }

  function makeLink(href, label, desc) {
    const a = document.createElement("a");
    a.className = "site-sidebar-link";

    const page = currentPage();
    const hrefPage = String(href).split("#")[0];

    if (page === hrefPage || (page === "index.html" && href.startsWith("index.html"))) {
      a.classList.add("active");
    }

    a.href = href;
    a.innerHTML = `<span>${label}</span><small>${desc}</small>`;
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

    let sidebar = document.querySelector(".site-sidebar");
    const session = await getSessionSafe();

    document.body.classList.add("site-sidebar-enabled");

    if (!sidebar) {
      sidebar = document.createElement("aside");
      sidebar.className = "site-sidebar";
      sidebar.innerHTML = `
        <div class="site-sidebar-brand">
          <div class="site-sidebar-mark">M</div>
          <div>
            <strong>CODM OS</strong>
            <small>${session ? "Captain Console" : "Tournament Portal"}</small>
          </div>
        </div>
        <nav class="site-sidebar-nav"></nav>
        <div class="site-sidebar-footer"></div>
      `;
      document.body.prepend(sidebar);
    }

    const nav = sidebar.querySelector(".site-sidebar-nav");
    const footer = sidebar.querySelector(".site-sidebar-footer");
    const brandSmall = sidebar.querySelector(".site-sidebar-brand small");

    if (brandSmall) brandSmall.textContent = session ? "Captain Console" : "Tournament Portal";

    nav.innerHTML = "";
    PUBLIC_LINKS.forEach(([href, label, desc]) => nav.appendChild(makeLink(href, label, desc)));

    if (session) {
      const divider = document.createElement("div");
      divider.className = "site-sidebar-divider";
      divider.textContent = "Captain";
      nav.appendChild(divider);
      CAPTAIN_LINKS.forEach(([href, label, desc]) => nav.appendChild(makeLink(href, label, desc)));
    }

    footer.innerHTML = session
      ? `<button class="site-sidebar-mini" type="button" data-site-sidebar-signout>Sign Out</button>`
      : `<a class="site-sidebar-mini" href="register.html">Captain Login / Register</a>`;

    footer.querySelector("[data-site-sidebar-signout]")?.addEventListener("click", () => {
      if (typeof window.signOut === "function") window.signOut();
    });

    // Keep the header clean: brand only, no duplicate top navigation buttons.
    const headerNav = document.querySelector(".nav .nav-links");
    if (headerNav) headerNav.classList.add("sidebar-nav-hidden");
  }

  window.renderSiteSidebar = renderSiteSidebar;

  document.addEventListener("DOMContentLoaded", renderSiteSidebar);
  setTimeout(renderSiteSidebar, 100);
  setTimeout(renderSiteSidebar, 500);

  if (window.sb?.auth) {
    window.sb.auth.onAuthStateChange(() => setTimeout(renderSiteSidebar, 50));
  }
})();
