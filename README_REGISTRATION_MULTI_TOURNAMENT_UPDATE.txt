CODM Tournament OS - Registration Update + Multi-Tournament Landing

Updated:
- index.html
- register.html
- admin.html
- assets/js/main.js
- assets/css/style.css
- assets/css/premium-polish.css

New SQL:
- supabase_registration_update_flow.sql

What changed:
1. Discord field
   - Registration now asks for a Discord Handle, not numeric Discord Account/User ID.
   - Allowed format: letters, numbers, dot, underscore. Example: SimonRiley, Simon_Riley, Simon.Riley.

2. Registration copy
   - After registration/update, captains get a copy of entered details on-screen.
   - They can copy details, download a .txt copy, or open an email draft addressed to themselves.
   - Fully automated email receipt still requires an email service or Supabase Edge Function.

3. Captain registration updates
   - Captains can update their registration while registration is open.
   - Updates return the team to pending review.
   - Run supabase_registration_update_flow.sql to enable the secure update RPC.

4. Admin registration control
   - admin.html now has Open Registration and Close Registration controls.
   - This updates tournaments.registration_open for the selected tournament.

5. Generic landing page
   - index.html is now a generic tournament selection landing page.
   - Users choose which tournament they are participating in.
   - The selected tournament is saved locally and used by register/bracket/matches/rules flows through loadDefaultTournament().

Setup:
1. Upload this package.
2. Run supabase_registration_update_flow.sql in Supabase SQL Editor.
3. Hard refresh the site.
4. Add more tournament records in the tournaments table when reusing the site for future events.
