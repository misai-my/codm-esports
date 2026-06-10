CODM Tournament OS - Fixed Drawer Sidebar Scroll Update

Updated:
- assets/js/admin-sidebar.js
- assets/js/site-sidebar.js
- assets/css/style.css
- assets/css/premium-polish.css

What changed:
1. Sidebar drawer is forced to position: fixed.
2. Sidebar height is locked to the viewport using 100dvh.
3. Background page scroll is locked while the sidebar is open.
4. Sidebar has its own internal scroll.
5. This prevents the sidebar from moving with the page when you scroll.

No SQL change required.
