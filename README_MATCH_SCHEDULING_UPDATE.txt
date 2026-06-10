CODM Tournament OS - Match Scheduling Update

Updated:
- admin_bracket.html
- bracket.html
- matches.html
- assets/css/style.css
- assets/css/premium-polish.css

New SQL:
- supabase_match_scheduling.sql

What changed:
1. Admins can now set a scheduled date/time per match from Bracket Admin.
2. Admins can choose:
   - Date and time
   - Time zone
   - Estimated duration
3. Public bracket now displays scheduled match time.
4. Captain My Matches page now displays scheduled match time.
5. Schedule records are calendar-ready for the future calendar integration.

Calendar-ready fields added to matches:
- match_start_at
- match_timezone
- match_duration_minutes
- calendar_event_id
- calendar_sync_status
- calendar_last_synced_at

Setup:
1. Upload the package.
2. Run supabase_match_scheduling.sql in Supabase SQL Editor.
3. Hard refresh admin_bracket.html, bracket.html, and matches.html.

Note:
- This update does not yet create calendar events.
- It stores the schedule in a calendar-ready format so the calendar function can be added next.
