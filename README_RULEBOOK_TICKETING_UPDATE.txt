CODM Tournament OS - Rulebook + Discord + Ticketing Update

New pages:
- rules.html
- admin_tickets.html

New SQL:
- supabase_support_tickets.sql

What rules.html includes:
- Rulebook hub
- Match formats
- Map pool
- Map veto rules
- Lobby settings
- Discord operations section
- FAQ section
- Ask Admin ticket chat box for captains/users

What admin_tickets.html includes:
- Admin-only ticket queue
- Status/category filters
- Chat-style ticket detail view
- Admin replies
- Ticket status updates

Setup:
1. Upload the full package to GitHub Pages.
2. In Supabase SQL Editor, run:
   supabase_support_tickets.sql
3. Hard refresh the site.

Discord button:
- In rules.html, replace href="#" on id="discordInviteBtn" with your final Discord invite link.

Reference note:
- The user-provided Google Doc is titled "Call of Duty: Mobile Garena Masters IX Rulebook" but the browser-accessible view only exposed title-level metadata.
- The included rules page is an operational draft aligned with your existing CODM veto flow and known Garena Masters IX-style map pool.
- Review and edit the final rule text before publishing as official tournament policy.
