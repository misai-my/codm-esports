CODM Tournament OS - Forgot Password Update

This package adds the password recovery flow.

New files:
- forgot-password.html
- reset-password.html

Updated login pages:
- register.html
- matches.html
- veto.html
- admin.html
- admin_bracket.html
- admin_veto.html

What changed:
- Added Forgot Password? action to every login form
- forgot-password.html sends the Supabase password reset email
- reset-password.html accepts the Supabase recovery session and lets users set a new password
- Premium styling/copy is included on both new pages

Supabase Auth setting required:
Add this URL to Authentication > URL Configuration > Redirect URLs:

https://misai-my.github.io/codm-esports/reset-password.html

Keep your Reset Password email template using:

{{ .ConfirmationURL }}

Supabase will replace that token with the secure reset link and redirect users to reset-password.html.
