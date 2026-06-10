CODM Tournament OS - Map Veto Pre-Lobby + Coin Toss Update

New SQL:
- supabase_veto_prelobby_flow.sql

Updated:
- admin_veto.html
- veto.html
- assets/css/veto-module.css
- assets/css/premium-polish.css
- assets/css/style.css

New veto flow:
1. Admin launches the veto lobby.
2. Captains open the captain/public veto room and confirm attendance.
3. Once both teams confirm, admin chooses which captain calls the coin toss.
4. Chosen captain selects Heads or Tails.
5. Coin toss result is animated and shown to both captains.
6. Coin toss winner chooses Team 1 or Team 2.
7. Admin clicks Begin Map Veto Selection.
8. Normal map veto selection begins.

Summary:
- Final veto summary now uses a spreadsheet-style layout similar to the provided reference.
- It shows Team 1 and Team 2, bans, selected maps, and side choices grouped by mode.

Setup:
1. Upload this package.
2. Run supabase_veto_prelobby_flow.sql in Supabase SQL Editor.
3. Hard refresh admin_veto.html and veto.html.
