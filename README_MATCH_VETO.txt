CODM Match Veto Module

Add these files to your existing CODM Tournament OS project:

Files:
- supabase_match_veto.sql
- admin_veto.html
- veto.html
- assets/js/veto-engine.js
- assets/css/veto-module.css

Setup:
1. Run supabase_match_veto.sql in Supabase SQL Editor.
2. Copy admin_veto.html and veto.html to your project root.
3. Copy assets/js/veto-engine.js to assets/js/.
4. Merge assets/css/veto-module.css into assets/css/style.css,
   or add this line to the pages:
   <link rel="stylesheet" href="assets/css/veto-module.css" />

5. Open admin_veto.html directly as admin.

Admin flow:
1. Login as admin.
2. Select a match with Team A and Team B already assigned.
3. Select format:
   - BO3
   - BO5
   - GF_BO7_ADV
4. Select Team 1 based on coin toss/admin decision.
5. Load default steps or edit the JSON sequence.
6. Start/replace veto.
7. Share the Captain/Public Veto Room link.
8. Admin can:
   - Randomize current action
   - Step back
   - Reset veto
   - Apply veto to match_games

Captain flow:
1. Open veto.html?match_id=<MATCH_ID>
2. Login with captain account.
3. If it is their team's turn, they can ban map, pick map, or pick side.
4. Selections lock into the database.

Database tables added:
- codm_map_pools
- match_vetos
- match_veto_steps
- match_veto_actions

Existing table extended:
- match_games
  - side_picker_team_id
  - team_a_side
  - team_b_side
  - veto_locked

Default seeded map pools:
Hardpoint:
- Summit
- Hacienda
- Apocalypse
- Slums
- Firing Range
- Raid

Search and Destroy:
- Raid
- Standoff
- Firing Range
- Coastal
- Tunisia
- Hacienda

Control:
- Raid
- Takeoff
- Arsenal

Important:
- The admin page has the dynamic step-order JSON editor.
- This lets you change veto order per event without changing the code.
- Public pages do not need to show admin links.
