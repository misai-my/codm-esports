CODM Tournament OS - Visible Map Veto Timer Update

Added:
- Visible countdown timer on admin_veto.html
- Visible countdown timer on veto.html captain/public room
- Timer warning state when 15 seconds remain
- Overtime state after timer expires
- Admin note: the timer does not auto-randomize; it shows overtime so the admin can use Randomize Current Action.

Updated files:
- admin_veto.html
- veto.html
- assets/js/veto-engine.js
- assets/css/veto-module.css
- assets/css/premium-polish.css

No Supabase SQL change required.

How the timer works:
- Uses activeVeto.timer_seconds.
- Step 1 starts from match_vetos.created_at / started_at / reset_at when available.
- Later steps start from the previous completed step's completed_at.
- If no timestamp is available, the timer starts from the browser's current time.
