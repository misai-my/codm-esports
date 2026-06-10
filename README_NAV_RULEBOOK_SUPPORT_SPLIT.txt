CODM Tournament OS - Navigation + Rulebook/Support Split Update

Updated:
- rules.html
- support.html
- assets/js/nav-visibility.js
- all HTML page navigation blocks
- assets/css/style.css
- assets/css/premium-polish.css

What changed:
1. Non-logged-in users only see:
   - Home
   - Tournament
   - Rulebook

2. Logged-in users see additional user links:
   - Register
   - Bracket
   - My Matches
   - FAQ & Support

3. Admin users also see:
   - Team Admin
   - Bracket Admin
   - Map Veto Admin
   - Ticket Admin

4. Rulebook now has its own dedicated page:
   - rules.html
   - Contains rulebook only

5. FAQ and ticketing are now on a separate page:
   - support.html
   - Contains Discord operations, FAQ, and Ask Admin ticketing

Ticketing reminder:
- support.html uses the existing support_tickets tables.
- If you have not run it yet, run:
  supabase_support_tickets.sql

No new SQL is required for the navigation/rulebook split itself.
