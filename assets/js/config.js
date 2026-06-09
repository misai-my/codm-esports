// ============================================================
// CODM Tournament OS V1 Modern - Config
// Supabase project: codm-esports
//
// Replace these two values with your Supabase project URL and anon key.
// Never use the service_role key in frontend code.
// ============================================================

const SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const DEFAULT_TOURNAMENT_SLUG = "codm-v1";

const ASSETS = {
  // Recommended filenames for your Google Drive assets.
  // Put files inside: /assets/img/
  logo: "assets/img/codm-logo.png",
  heroBg: "assets/img/kv-bg.jpg",
  heroCharacterLeft: "assets/img/kv-character-left.png",
  heroCharacterRight: "assets/img/kv-character-right.png",
  pattern: "assets/img/pattern.png",

  // Fallback team logo is generated with text if no logo_url is submitted.
};

window.TOURNAMENT_OS_CONFIG = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  DEFAULT_TOURNAMENT_SLUG,
  ASSETS
};

window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
