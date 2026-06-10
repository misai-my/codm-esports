CODM Tournament OS - Automatic Email Receipt + Registration Change Log Update

Updated:
- register.html
- admin.html
- assets/js/main.js
- assets/css/style.css
- assets/css/premium-polish.css

New:
- supabase_registration_email_change_log.sql
- supabase/functions/send-registration-copy/index.ts
- supabase/functions/send-registration-copy/README.md

What changed:
1. Removed the on-page Registration Copy copy/download/email-draft section.
2. Registration copies are now sent automatically by email after:
   - New registration submission
   - Registration update
3. Added change tracking:
   - Initial submission is logged
   - Captain updates are logged
   - Automatic email sends are logged
   - Captain-requested email copies are logged
4. Captains can see their registration change history on register.html.
5. Admins can see registration change history on admin.html.

Required setup:
1. Run this SQL in Supabase SQL Editor:
   supabase_registration_email_change_log.sql

2. Deploy the Edge Function:
   supabase functions deploy send-registration-copy

3. Set function secrets:
   supabase secrets set RESEND_API_KEY=your_resend_api_key
   supabase secrets set FROM_EMAIL="CODM Tournament OS <noreply@yourdomain.com>"

Notes:
- This package uses Resend for automatic email delivery.
- You can change the email provider later by editing supabase/functions/send-registration-copy/index.ts.
- The registration itself still saves even if email sending fails, but the site will show an email setup warning.
