CODM Tournament OS - Collapsible Clean Sidebar Update

Updated:
- assets/js/admin-sidebar.js
- assets/js/site-sidebar.js
- assets/js/admin-veto-nav.js
- assets/css/style.css
- assets/css/premium-polish.css
- admin_teams.html

What changed:
1. Admin, public, and captain sidebars are now collapsible.
2. Sidebar state is remembered locally.
3. Top navigation buttons are hidden when sidebar is active.
4. Sidebar layout is cleaner and more compact.
5. admin_teams.html runtime issue was patched by replacing the .catch() call on the Supabase RPC with a safer try/catch.

No SQL change required.
