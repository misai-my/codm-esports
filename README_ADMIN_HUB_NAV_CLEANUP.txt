CODM Tournament OS - Admin Hub + Navigation Cleanup

Updated:
- admin.html
- admin_teams.html
- assets/js/nav-visibility.js
- assets/js/admin-veto-nav.js
- assets/css/style.css
- assets/css/premium-polish.css

What changed:
1. admin.html is now a clean Admin Hub with admin buttons only.
2. The old Team Registration Review page has been moved to:
   admin_teams.html
3. Admin Hub buttons:
   - Registration Admin
   - Bracket Admin
   - Map Veto Admin
   - Ticket Admin
4. Public/captain pages stay as user-facing pages even when an admin is logged in.
5. Admin links are only shown on admin pages.

No SQL change required.
