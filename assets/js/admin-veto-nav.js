/* ============================================================
   CODM Tournament OS - admin-veto-nav.js

   Purpose:
   - Adds a "Map Veto Admin" link only on admin pages.
   - Keeps public pages clean.
   - Drop into admin.html and admin_bracket.html only.

   Setup:
   Add before </body> on admin.html and admin_bracket.html:

   <script src="assets/js/admin-veto-nav.js"></script>
   ============================================================ */

(function () {
  "use strict";

  const allowedAdminPages = [
    "admin.html",
    "admin_bracket.html",
    "admin_veto.html"
  ];

  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  if (!allowedAdminPages.includes(currentPage)) return;

  const nav = document.querySelector(".nav-links");
  if (!nav) return;

  if (nav.querySelector('[href="admin_veto.html"]')) return;

  const link = document.createElement("a");
  link.className = "nav-link";
  link.href = "admin_veto.html";
  link.textContent = "Map Veto Admin";

  // Place before sign-out button if available.
  const signOut = nav.querySelector("#signOutBtn");
  if (signOut) {
    nav.insertBefore(link, signOut);
  } else {
    nav.appendChild(link);
  }
})();
