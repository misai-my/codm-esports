CODM Tournament OS - Advanced Brackets Package
Project: codm-esports

This package adds:
- Public pages with NO admin button/access in the general/public navigation
- Direct admin pages only: admin.html and admin_bracket.html
- Single elimination
- Dynamic double elimination
- Swiss pairing logic
- Swiss standings and Buchholz field
- Captain match reports
- Admin official score entry

Files:
- index.html
- register.html
- bracket.html
- matches.html
- admin.html
- admin_bracket.html
- assets/css/style.css
- assets/js/config.js
- assets/js/main.js
- assets/js/bracket-engine.js
- supabase_advanced_brackets.sql

Setup:
1. Run your original V1 table scripts first if not done yet:
   profiles, tournaments, teams, team_players, registrations.
2. Run supabase_advanced_brackets.sql in Supabase SQL Editor.
3. Update assets/js/config.js with your Supabase URL and anon key.
4. Upload/deploy the files.
5. Public users should use:
   - index.html
   - register.html
   - bracket.html
   - matches.html
6. Admins should open these URLs directly:
   - admin.html
   - admin_bracket.html

Admin flow:
1. Approve teams in admin.html.
2. Open admin_bracket.html directly.
3. Choose bracket type: single_elimination, double_elimination, or swiss.
4. Set seeds.
5. Generate Initial Round.
6. Enter official scores.
7. Generate Next Round.

Double elimination notes:
This is a dynamic double-elimination engine. It tracks losses and generates winners, losers, and grand-final rounds after each scored round. A team is eliminated after 2 losses. If the undefeated team loses in the Grand Final, the system can generate a Final Reset because both teams still have fewer than 2 losses.

Swiss notes:
Swiss standings use points, wins, map differential, seed, and Buchholz. Pairing avoids rematches where possible and assigns byes to the lowest-ranked team without a previous bye when the team count is odd.

Next optional modules:
- Map veto per match
- Google/iOS calendar export
- Discord OAuth verification
- Supabase Storage logo upload
- OBS bracket overlay
