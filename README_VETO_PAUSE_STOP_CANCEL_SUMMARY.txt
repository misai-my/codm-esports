CODM Tournament OS - Veto Pause / Stop / Cancel + Final Summary Update

Added on admin_veto.html:
- Pause Veto
- Resume Veto
- Stop Veto
- Cancel & Delete Veto

Behavior:
- Pause keeps the veto record but blocks captain actions and hides the running timer.
- Resume reopens the current step and restarts the visible timer window.
- Stop keeps the current veto record for review, marks the veto concluded, and prevents further captain actions.
- Cancel & Delete removes the match_vetos record. Existing database cascade should remove the veto steps/actions as used by the original Start/Replace Veto flow.

Added on admin_veto.html and veto.html:
- Final Veto Summary after the veto concludes.
- Summary shows selected maps, modes, starting sides, pick source, and ban timeline.
- Stopped veto sessions show a clear stopped notice instead of allowing more actions.

Updated files:
- admin_veto.html
- veto.html
- assets/css/veto-module.css
- assets/css/premium-polish.css

No required SQL change for pause/resume/stop because these states are stored inside match_vetos.config.
