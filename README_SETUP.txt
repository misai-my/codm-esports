CODM Tournament OS V1 Modern Starter
Project: codm-esports

Included:
- index.html
- register.html
- admin.html
- assets/css/style.css
- assets/js/config.js
- assets/js/main.js
- assets/img/README_ASSETS.txt

What this V1 does:
- Stylish public landing page
- Approved team list
- Captain sign-up / login
- Team registration
- Email format validation
- Captain email must match logged-in Supabase account
- Discord User ID format validation
- 5 required CODM players + 2 optional substitutes
- Duplicate team name / tag check
- Duplicate CODM UID check
- Admin approve / reject / waitlist dashboard

Required Supabase tables:
- profiles
- tournaments
- teams
- team_players
- registrations

Setup:
1. Run your Supabase table scripts.
2. Create your first account from register.html.
3. Make yourself admin:

update public.profiles
set role = 'admin'
where email = 'your-email@example.com';

4. Open assets/js/config.js.
5. Replace:

const SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

6. Put your Google Drive assets into assets/img/.

Recommended asset filenames:
- codm-logo.png
- kv-bg.jpg
- kv-character-left.png
- kv-character-right.png
- pattern.png

If your files have different names, update the ASSETS block in assets/js/config.js.

Notes:
- V1 uses logo_url for team logos instead of Supabase Storage upload.
- Discord validation is format-only. OAuth ownership verification comes later.
- Google/iOS calendar integration, brackets, scoring, and map veto are next modules.
