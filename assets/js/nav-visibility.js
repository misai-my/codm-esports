// CODM Tournament OS - smart navigation
// nav-visibility.js exclusively controls creation and visibility of Login and Sign Out controls.

// Navigation owns creation/removal of the Sign Out button.
// Individual pages must not assume #signOutBtn always exists.

// Public/captain pages remain user-facing even when an admin is logged in.
// Admin links are only shown on admin pages.
(function () {
  "use strict";

  const PUBLIC_LINKS = [
    ["index.html", "Home"],
    ["index.html#tournaments", "Tournament"],
    ["rules.html", "Rulebook"]
  ];

  const USER_LINKS = [
    ["captain.html", "Captain Portal"],
    ["support.html", "Support"]
  ];

  const ADMIN_LINKS = [
    ["admin.html", "Admin Hub"],
    ["admin_teams.html", "Registration Admin"],
    ["admin_bracket.html", "Bracket Admin"],
    ["admin_veto.html", "Map Veto Admin"],
    ["admin_tickets.html", "Ticket Admin"]
  ];

  let renderVersion = 0;
  let authListenerBound = false;

  function currentPage() {
    return String(window.location.pathname || "").split("/").pop() || "index.html";
  }

  function isAdminPage() {
    return currentPage().startsWith("admin");
  }

  function makeLink(href, text, options = {}) {
    const link = document.createElement("a");
    link.className = options.className || "nav-link";
    link.href = href;
    link.textContent = text;

    if (options.id) link.id = options.id;
    if (options.ariaLabel) link.setAttribute("aria-label", options.ariaLabel);

    return link;
  }

  function makeSignOutButton() {
    const button = document.createElement("button");
    button.id = "signOutBtn";
    button.className = "nav-button";
    button.type = "button";
    button.textContent = "Sign Out";

    button.addEventListener("click", async () => {
      if (typeof window.signOut === "function") {
        await window.signOut();
      } else if (window.sb?.auth) {
        await window.sb.auth.signOut();
        window.location.href = "index.html";
      }
    });

    return button;
  }

  function renderLoggedOutFallback(nav) {
    nav.innerHTML = "";

    if (isAdminPage()) {
      nav.appendChild(makeLink("admin.html", "Admin Login"));
      return;
    }

    PUBLIC_LINKS.forEach(([href, text]) => {
      nav.appendChild(makeLink(href, text));
    });

    nav.appendChild(
      makeLink("login.html", "Login", {
        id: "loginNavBtn",
        className: "nav-link nav-login-visible",
        ariaLabel: "Captain Login"
      })
    );
  }

  async function getValidatedAuthState() {
    try {
      if (!window.sb?.auth) {
        return { user: null, session: null };
      }

      // getUser() validates the user with Supabase and avoids treating a stale
      // local session as an active login.
      const { data: userData, error: userError } = await window.sb.auth.getUser();

      if (userError || !userData?.user) {
        return { user: null, session: null };
      }

      const { data: sessionData } = await window.sb.auth.getSession();

      return {
        user: userData.user,
        session: sessionData?.session || null
      };
    } catch (error) {
      console.warn("Navigation authentication check failed:", error);
      return { user: null, session: null };
    }
  }

  async function getProfileSafe() {
    try {
      if (typeof window.getCurrentProfile === "function") {
        return await window.getCurrentProfile();
      }
    } catch (error) {
      console.warn("Navigation profile check failed:", error);
    }

    return null;
  }

  async function renderSmartNav() {
    const nav = document.querySelector(".nav-links[data-smart-nav], .nav-links");
    if (!nav) return;

    const thisRender = ++renderVersion;

    // Always show public navigation and Login immediately while auth is checked.
    // This prevents Login from disappearing during page load.
    renderLoggedOutFallback(nav);

    const authState = await getValidatedAuthState();

    // Ignore an older async render if a newer auth event has already started.
    if (thisRender !== renderVersion) return;

    if (!authState.user) {
      renderLoggedOutFallback(nav);
      return;
    }

    const adminPage = isAdminPage();
    const profile = await getProfileSafe();

    if (thisRender !== renderVersion) return;

    nav.innerHTML = "";

    if (adminPage) {
      if (profile?.role === "admin") {
        ADMIN_LINKS.forEach(([href, text]) => {
          nav.appendChild(makeLink(href, text));
        });
      } else {
        nav.appendChild(makeLink("admin.html", "Admin Login"));
      }
    } else {
      PUBLIC_LINKS.forEach(([href, text]) => {
        nav.appendChild(makeLink(href, text));
      });

      USER_LINKS.forEach(([href, text]) => {
        nav.appendChild(makeLink(href, text));
      });
    }

    nav.appendChild(makeSignOutButton());
  }

  function bindAuthListener() {
    if (authListenerBound || !window.sb?.auth) return;

    authListenerBound = true;
    window.sb.auth.onAuthStateChange(() => {
      window.setTimeout(renderSmartNav, 0);
    });
  }

  function initializeNavigation() {
    renderSmartNav();
    bindAuthListener();

    // Supabase may initialize a fraction later on slower connections.
    window.setTimeout(() => {
      bindAuthListener();
      renderSmartNav();
    }, 250);

    window.setTimeout(renderSmartNav, 800);
  }

  window.renderSmartNav = renderSmartNav;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeNavigation, { once: true });
  } else {
    initializeNavigation();
  }
})();
