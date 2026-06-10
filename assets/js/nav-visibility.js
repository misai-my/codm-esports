// CODM Tournament OS - smart navigation
// Public/captain pages stay as user-facing views even when an admin is logged in.
// Admin links are only shown on admin pages.
(function () {
  "use strict";

  const PUBLIC_LINKS = [
    ["index.html", "Home"],
    ["index.html#tournaments", "Tournament"],
    ["rules.html", "Rulebook"]
  ];

  const USER_LINKS = [
    ["register.html", "Register"],
    ["bracket.html", "Bracket"],
    ["matches.html", "My Matches"],
    ["support.html", "FAQ & Support"]
  ];

  const ADMIN_LINKS = [
    ["admin.html", "Admin Hub"],
    ["admin_teams.html", "Registration Admin"],
    ["admin_bracket.html", "Bracket Admin"],
    ["admin_veto.html", "Map Veto Admin"],
    ["admin_tickets.html", "Ticket Admin"]
  ];

  function currentPage() {
    return String(window.location.pathname || "").split("/").pop() || "index.html";
  }

  function isAdminPage() {
    return currentPage().startsWith("admin");
  }

  function makeLink(href, text) {
    const a = document.createElement("a");
    a.className = "nav-link";
    a.href = href;
    a.textContent = text;
    return a;
  }

  function makeSignOutButton() {
    const btn = document.createElement("button");
    btn.id = "signOutBtn";
    btn.className = "nav-button hidden";
    btn.type = "button";
    btn.textContent = "Sign Out";
    btn.onclick = () => {
      if (typeof window.signOut === "function") window.signOut();
    };
    return btn;
  }

  async function getSessionSafe() {
    try {
      if (typeof window.getSession === "function") return await window.getSession();
      if (window.sb?.auth) {
        const { data } = await window.sb.auth.getSession();
        return data?.session || null;
      }
    } catch (err) {
      console.warn("Navigation session check failed:", err);
    }
    return null;
  }

  async function getProfileSafe() {
    try {
      if (typeof window.getCurrentProfile === "function") return await window.getCurrentProfile();
    } catch (err) {
      console.warn("Navigation profile check failed:", err);
    }
    return null;
  }

  async function renderSmartNav() {
    const nav = document.querySelector(".nav-links");
    if (!nav) return;

    const session = await getSessionSafe();
    const adminPage = isAdminPage();
    let profile = null;

    if (session) profile = await getProfileSafe();

    nav.innerHTML = "";

    if (adminPage) {
      if (session && profile?.role === "admin") {
        ADMIN_LINKS.forEach(([href, text]) => nav.appendChild(makeLink(href, text)));
      } else {
        nav.appendChild(makeLink("admin.html", "Admin Login"));
      }
    } else {
      PUBLIC_LINKS.forEach(([href, text]) => nav.appendChild(makeLink(href, text)));

      if (session) {
        USER_LINKS.forEach(([href, text]) => nav.appendChild(makeLink(href, text)));
      }
    }

    if (session) {
      const signOut = makeSignOutButton();
      signOut.classList.remove("hidden");
      nav.appendChild(signOut);
    }
  }

  window.renderSmartNav = renderSmartNav;

  document.addEventListener("DOMContentLoaded", renderSmartNav);
  setTimeout(renderSmartNav, 300);

  if (window.sb?.auth) {
    window.sb.auth.onAuthStateChange(() => setTimeout(renderSmartNav, 50));
  }
})();
