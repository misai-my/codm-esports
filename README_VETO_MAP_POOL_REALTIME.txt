CODM Veto Map Pool + Realtime Update

Files included:
- supabase_veto_map_pool_realtime_update.sql
- assets/js/veto-realtime.js

Step 1:
Run this SQL in Supabase SQL Editor:

supabase_veto_map_pool_realtime_update.sql

This will replace the map pool with:

Hardpoint:
- Summit
- Apocalypse
- Hacienda
- Slums
- Combine

Search and Destroy:
- Tunisia
- Firing Range
- Kurohana Metropolis
- Standoff
- Coastal

Control:
- Raid
- Takeoff
- Crossfire

It also enables Supabase Realtime publication for:
- codm_map_pools
- match_vetos
- match_veto_steps
- match_veto_actions
- match_games
- matches

Step 2:
Copy veto-realtime.js into:

assets/js/veto-realtime.js

Step 3:
Add this script tag to BOTH admin_veto.html and veto.html,
right after veto-engine.js:

<script src="assets/js/veto-realtime.js"></script>

Example:

<script src="assets/js/config.js"></script>
<script src="assets/js/main.js"></script>
<script src="assets/js/veto-engine.js"></script>
<script src="assets/js/veto-realtime.js"></script>

Step 4:
Remove or keep the old 10-second interval refresh in veto.html.

If you want to remove it, find:

setInterval(loadVeto, 10000);

and delete it.

Realtime will now refresh the veto room when:
- Admin starts/restarts veto
- Captain picks/bans/chooses side
- Admin randomizes current action
- Admin steps back
- Admin resets veto
- Match games are updated
- Map pool changes
