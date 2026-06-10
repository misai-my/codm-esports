Veto timer ReferenceError fix.

Fixes browser error:
CODMVetoTimer is not defined

Updated:
- admin_veto.html
- veto.html
- assets/js/veto-timer.js

The timer now loads as a separate script after veto-engine.js and all references use window.CODMVetoTimer with safe guards.
