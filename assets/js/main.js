// CODM Tournament OS - Shared helpers
const cfg = window.TOURNAMENT_OS_CONFIG;

function qs(selector, root = document) { return root.querySelector(selector); }
function qsa(selector, root = document) { return Array.from(root.querySelectorAll(selector)); }
function normalizeText(value) { return String(value || "").trim(); }
function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function setText(selector, text) { const el = qs(selector); if (el) el.textContent = text; }
function showToast(message, type = "info") {
  const toast = qs("#toast");
  if (!toast) { alert(message); return; }
  toast.textContent = message;
  toast.className = `toast toast-${type} is-visible`;
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => { toast.className = "toast"; }, 4200);
}
function isEmailValid(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim()); }
function isDiscordIdValid(discordId) { return /^\d{17,20}$/.test(String(discordId || "").trim()); }
function isImageUrlMaybe(url) { if (!url) return true; return /^https?:\/\/.+/i.test(url); }
async function getSession() { const { data, error } = await window.sb.auth.getSession(); if (error) throw error; return data.session; }
async function getCurrentUser() { const { data, error } = await window.sb.auth.getUser(); if (error) throw error; return data.user; }
async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await window.sb.from("profiles").select("*").eq("id", user.id).single();
  if (error) throw error;
  return data;
}
async function signOut() { await window.sb.auth.signOut(); window.location.reload(); }


/* ============================================================
   Rulebook Link Helpers
   ============================================================ */
function googleDocIdFromUrl(url) {
  const text = normalizeText(url);
  const match = text.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  return match?.[1] || "";
}

function rulebookDocUrlForTournament(tournament = null) {
  return normalizeText(tournament?.rulebook_doc_url)
    || cfg?.RULEBOOK_DOC_URL
    || "";
}

function rulebookPreviewUrlFromDocUrl(url) {
  const docId = googleDocIdFromUrl(url);
  if (!docId) return url || cfg?.RULEBOOK_PREVIEW_URL || "";
  return `https://docs.google.com/document/d/${docId}/preview?usp=sharing`;
}

function rulebookPageUrl(tournament = null) {
  const slug = normalizeText(tournament?.slug);
  return slug ? `rules.html?tournament=${encodeURIComponent(slug)}` : "rules.html";
}

window.googleDocIdFromUrl = googleDocIdFromUrl;
window.rulebookDocUrlForTournament = rulebookDocUrlForTournament;
window.rulebookPreviewUrlFromDocUrl = rulebookPreviewUrlFromDocUrl;
window.rulebookPageUrl = rulebookPageUrl;

function discordInviteUrlForTournament(tournament = null) {
  return normalizeText(tournament?.discord_invite_url)
    || normalizeText(tournament?.discord_url)
    || "";
}
window.discordInviteUrlForTournament = discordInviteUrlForTournament;


/* ============================================================
   Registration Mode Helpers
   ============================================================ */
const REGISTRATION_MODE_OPTIONS = [
  { value: "multiplayer_1v1", label: "Multiplayer 1v1", short: "MP 1v1", minPlayers: 1 },
  { value: "multiplayer_5v5", label: "Multiplayer 5v5", short: "MP 5v5", minPlayers: 5 },
  { value: "battle_royale_solo", label: "Battle Royale Solo", short: "BR Solo", minPlayers: 1 },
  { value: "battle_royale_squads", label: "Battle Royale Squads", short: "BR Squads", minPlayers: 5 }
];

const SELECTED_REGISTRATION_MODE_KEY = "codm:selected_registration_mode";

function registrationModeLabel(value) {
  return REGISTRATION_MODE_OPTIONS.find(option => option.value === value)?.label || value || "Unassigned Mode";
}

function registrationModeShortLabel(value) {
  return REGISTRATION_MODE_OPTIONS.find(option => option.value === value)?.short || value || "Mode";
}

function registrationModeOptionsHtml(selected = "") {
  return REGISTRATION_MODE_OPTIONS
    .map(option => `
      <option value="${escapeHtml(option.value)}" ${selected === option.value ? "selected" : ""}>
        ${escapeHtml(option.label)}
      </option>
    `)
    .join("");
}

function getSelectedRegistrationMode() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = normalizeText(params.get("mode") || params.get("registration_mode"));

  if (REGISTRATION_MODE_OPTIONS.some(option => option.value === fromUrl)) {
    localStorage.setItem(SELECTED_REGISTRATION_MODE_KEY, fromUrl);
    return fromUrl;
  }

  const saved = localStorage.getItem(SELECTED_REGISTRATION_MODE_KEY);
  if (REGISTRATION_MODE_OPTIONS.some(option => option.value === saved)) return saved;

  return "multiplayer_5v5";
}

function setSelectedRegistrationMode(mode) {
  if (!REGISTRATION_MODE_OPTIONS.some(option => option.value === mode)) return;
  localStorage.setItem(SELECTED_REGISTRATION_MODE_KEY, mode);
}

function registrationModeChip(mode) {
  return `<span class="mode-chip">${escapeHtml(registrationModeShortLabel(mode))}</span>`;
}

window.CODM_REGISTRATION_MODES = REGISTRATION_MODE_OPTIONS;
window.registrationModeLabel = registrationModeLabel;
window.registrationModeShortLabel = registrationModeShortLabel;
window.registrationModeOptionsHtml = registrationModeOptionsHtml;
window.getSelectedRegistrationMode = getSelectedRegistrationMode;
window.setSelectedRegistrationMode = setSelectedRegistrationMode;
window.registrationModeChip = registrationModeChip;

const SELECTED_TOURNAMENT_KEY = "codm:selected_tournament_slug";

function getSelectedTournamentSlug() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = normalizeText(params.get("tournament") || params.get("slug"));
  if (fromUrl) {
    localStorage.setItem(SELECTED_TOURNAMENT_KEY, fromUrl);
    return fromUrl;
  }
  return localStorage.getItem(SELECTED_TOURNAMENT_KEY) || cfg.DEFAULT_TOURNAMENT_SLUG;
}

function setSelectedTournamentSlug(slug) {
  const clean = normalizeText(slug);
  if (!clean) return;
  localStorage.setItem(SELECTED_TOURNAMENT_KEY, clean);
}

async function loadAllTournaments() {
  const { data, error } = await window.sb
    .from("tournaments")
    .select("*")
    .order("start_at", { ascending: false, nullsFirst: false })
    .order("title", { ascending: true });

  if (error) throw error;
  return data || [];
}

async function loadDefaultTournament() {
  const selectedSlug = getSelectedTournamentSlug();

  let { data, error } = await window.sb
    .from("tournaments")
    .select("*")
    .eq("slug", selectedSlug)
    .maybeSingle();

  if (error) throw error;

  if (!data && selectedSlug !== cfg.DEFAULT_TOURNAMENT_SLUG) {
    const fallback = await window.sb
      .from("tournaments")
      .select("*")
      .eq("slug", cfg.DEFAULT_TOURNAMENT_SLUG)
      .maybeSingle();

    if (fallback.error) throw fallback.error;
    data = fallback.data;
    if (data?.slug) setSelectedTournamentSlug(data.slug);
  }

  if (!data) throw new Error("Tournament not found. Create a tournament record first.");
  return data;
}
function statusBadge(status) { return `<span class="badge badge-${escapeHtml(status)}">${escapeHtml(status)}</span>`; }
function bracketTypeLabel(type) {
  return ({
    single_elimination: "Single Elimination",
    double_elimination: "Double Elimination",
    swiss: "Swiss",
    multiple: "Multiple"
  })[type] || type || "Single Elimination";
}
function teamLogoHtml(team, size = "md") {
  const tag = normalizeText(team?.team_tag || team?.tag || "?").slice(0, 3).toUpperCase();
  if (team?.logo_url) return `<img class="team-logo team-logo-${size}" src="${escapeHtml(team.logo_url)}" alt="${escapeHtml(team.team_name)} logo" loading="lazy" />`;
  return `<div class="team-logo team-logo-${size} team-logo-fallback">${escapeHtml(tag)}</div>`;
}
function applyAssetBackgrounds() {
  const hero = qs("[data-hero-bg]");
  if (hero) hero.style.setProperty("--hero-bg", `url('${cfg.ASSETS.heroBg}')`);
  qsa("[data-asset]").forEach(el => {
    const key = el.dataset.asset;
    if (!cfg.ASSETS[key]) return;
    el.src = cfg.ASSETS[key];
    el.onerror = () => el.classList.add("asset-missing");
  });
}
function scrollToId(id) { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior:"smooth", block:"start" }); }
document.addEventListener("DOMContentLoaded", applyAssetBackgrounds);


function applyBrandLogo() {
  const cfgAssets = window.TOURNAMENT_OS_CONFIG?.ASSETS || {};
  const logo = cfgAssets.logo || "assets/img/codm-logo.png";
  document.querySelectorAll(".brand-emblem").forEach(el => {
    if (el.querySelector("img")) return;
    el.innerHTML = `<img src="${logo}" alt="CODM Tournament OS logo" onerror="this.remove();this.parentElement.textContent='M';" />`;
  });
}

document.addEventListener("DOMContentLoaded", applyBrandLogo);


// Null-safe UI state helper for pages whose navigation/content is rendered dynamically.
window.setElementClass = function setElementClass(selector, className, enabled) {
  const element = typeof selector === "string"
    ? document.querySelector(selector)
    : selector;

  if (!element) return false;

  element.classList.toggle(className, Boolean(enabled));
  return true;
};
