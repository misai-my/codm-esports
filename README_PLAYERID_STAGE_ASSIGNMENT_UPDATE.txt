CODM Tournament OS - Player ID + Role Validation + Stage Assignment Update

Updated:
- register.html
- admin_teams.html
- assets/css/style.css
- assets/css/premium-polish.css
- supabase/functions/send-registration-copy/index.ts

New SQL:
- supabase_playerid_stage_assignment.sql

Registration changes:
- Added Player ID field per member.
- UID validation: exactly 19 digits.
- Player ID validation: exactly 20 digits.
- Members 1 to 5 are required.
- Main members require IGN, UID, Player ID, and Role.
- Substitutes are optional, but if entered they must also be complete.
- Role is now a dropdown with:
  - AR + MM
  - AR + SMG
  - AR + Heavy
  - MM + SMG
  - MM + Heavy
  - SMG + Heavy

Admin stage assignment:
- Added tournament stage assignment to Registration Admin.
- Default stages:
  - Qualifiers
  - Group Stage
  - Playoffs
  - Finals
- Admin can assign a team to a specific stage.
- Admin can promote a qualified team to the next stage.
- Stage assignment is tracked in the registration change log.

Required setup:
1. Run this SQL in Supabase SQL Editor:
   supabase_playerid_stage_assignment.sql

2. If using automatic email copy, redeploy the Edge Function:
   supabase functions deploy send-registration-copy

No other setup required.
