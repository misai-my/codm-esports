// CODM Tournament OS - Public/Captain Hamburger Sidebar
(function () {
  "use strict";

  const PUBLIC_LINKS = [
    ["index.html", "⌂", "Home"],
    ["index.html#tournaments", "T", "Tournament"],
    ["rules.html", "R", "Rulebook"]
  ];

  const CAPTAIN_LINKS = [
    ["register.html", "G", "Register"],
    ["bracket.html", "B", "Bracket"],
    ["matches.html", "M", "My Matches"],
    ["support.html", "?", "FAQ & Support"]
  ];

  function currentPage() {
    return String(window.location.pathname || "").split("/").pop() || "index.html";
  }

  function isAdminPage() {
    return currentPage().startsWith("admin");
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

  function createToggleButton() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sidebar-toggle-btn";
    btn.setAttribute("aria-label", "Open menu");
    btn.innerHTML = '<span></span><span></span><span></span>';
    btn.addEventListener("click", () => {
      document.body.classList.add("site-sidebar-open");
    });
    return btn;
  }

  function createBackdrop() {
    const backdrop = document.createElement("div");
    backdrop.className = "sidebar-backdrop site-sidebar-backdrop";
    backdrop.addEventListener("click", closeSidebar);
    return backdrop;
  }

  function closeSidebar() {
    document.body.classList.remove("site-sidebar-open");
  }

  function makeLink(href, icon, label) {
    const a = document.createElement("a");
    a.className = "site-sidebar-link";
    const page = currentPage();
    const hrefPage = String(href).split("#")[0];
    if (page === hrefPage || (page === "index.html" && href.startsWith("index.html"))) {
      a.classList.add("active");
    }
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

  async function renderSiteSidebar() {
    if (isAdminPage()) return;

    ensureHeaderToggle();

    if (!document.querySelector(".site-sidebar-backdrop")) {
      document.body.appendChild(createBackdrop());
    }

    const session = await getSessionSafe();

    let aside = document.querySelector(".site-sidebar");
    if (!aside) {
      aside = document.createElement("aside");
      aside.className = "site-sidebar simple-drawer";
      aside.innerHTML = `
        <div class="simple-sidebar-top">
          <div class="simple-sidebar-brand">
            <div class="simple-brand-mark">M</div>
            <div>
              <strong>CODM Tournament OS</strong>
              <small data-site-subtitle>Tournament Portal</small>
            </div>
          </div>
          <button class="simple-close-btn" type="button" aria-label="Close menu">×</button>
        </div>
        <nav class="simple-sidebar-nav"></nav>
        <div class="simple-sidebar-footer"></div>
      `;
      aside.querySelector(".simple-close-btn")?.addEventListener("click", closeSidebar);
      document.body.appendChild(aside);
    }

    const subtitle = aside.querySelector("[data-site-subtitle]");
    if (subtitle) subtitle.textContent = session ? "Captain Console" : "Tournament Portal";

    const nav = aside.querySelector(".simple-sidebar-nav");
    nav.innerHTML = "";

    PUBLIC_LINKS.forEach(([href, icon, label]) => nav.appendChild(makeLink(href, icon, label)));

    if (session) {
      const divider = document.createElement("div");
      divider.className = "simple-side-divider";
      divider.textContent = "Captain";
      nav.appendChild(divider);
      CAPTAIN_LINKS.forEach(([href, icon, label]) => nav.appendChild(makeLink(href, icon, label)));
    }

    const footer = aside.querySelector(".simple-sidebar-footer");
    footer.innerHTML = session
      ? `<button class="simple-side-action" type="button" data-site-signout>
           <span class="simple-icon">↦</span>
           <span class="simple-label">Sign Out</span>
         </button>`
      : `<a class="simple-side-action" href="register.html">
           <span class="simple-icon">↣</span>
           <span class="simple-label">Captain Login</span>
         </a>`;

    footer.querySelector("[data-site-signout]")?.addEventListener("click", () => {
      if (typeof window.signOut === "function") window.signOut();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSidebar();
    });
  }

  window.renderSiteSidebar = renderSiteSidebar;

  document.addEventListener("DOMContentLoaded", renderSiteSidebar);
  setTimeout(renderSiteSidebar, 100);
  setTimeout(renderSiteSidebar, 500);

  if (window.sb?.auth) {
    window.sb.auth.onAuthStateChange(() => setTimeout(renderSiteSidebar, 50));
  }
})();
