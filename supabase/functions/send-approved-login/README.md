# send-approved-login

Deploy after running `supabase_registration_modes_login_invites.sql`.

Required secret:
- SITE_LOGIN_URL, for example: https://misai-my.github.io/codm-esports/login.html

Supabase already provides:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

Deploy:
```bash
supabase functions deploy send-approved-login
supabase secrets set SITE_LOGIN_URL="https://misai-my.github.io/codm-esports/login.html"
```

This function uses Supabase Auth invite email for new approved captains.
