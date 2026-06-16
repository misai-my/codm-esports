// ============================================================
// CODM Tournament OS V1 Modern - Config
// Supabase project: codm-esports
//
// Replace these two values with your Supabase project URL and anon key.
// Never use the service_role key in frontend code.
// ============================================================

const SUPABASE_URL = "https://dznlooryvfudljyxjhbu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmxvb3J5dmZ1ZGxqeXhqaGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDc4NDQsImV4cCI6MjA5NjU4Mzg0NH0.Q4iLAWXo-EEL-g4s1sz9sQiGJn4gsrl5PVEs7hy5R1E";

const DEFAULT_TOURNAMENT_SLUG = "codm-v1";

// Registration is now handled outside the site through Google Forms.
// Paste the public Google Form URL here once final.
const REGISTRATION_FORM_URL = "https://forms.gle/HQjA95BXGNANQSz8A";

// Used by login-invite emails and admin instructions.
const SITE_LOGIN_URL = "https://misai-my.github.io/codm-esports/login.html";

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
  REGISTRATION_FORM_URL,
  SITE_LOGIN_URL,
  ASSETS
};

window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
