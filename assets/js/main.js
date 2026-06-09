// ============================================================
// CODM Tournament OS V1 Modern - Shared Helpers
// ============================================================

const cfg = window.TOURNAMENT_OS_CONFIG;

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function normalizeText(value) {
  return String(value || "").trim();
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setText(selector, text) {
  const el = qs(selector);
  if (el) el.textContent = text;
}

function showToast(message, type = "info") {
  const toast = qs("#toast");
  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;
  toast.className = `toast toast-${type} is-visible`;

  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.className = "toast";
  }, 4200);
}

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

// Discord User IDs are numeric snowflakes.
// This validates format only. True account ownership needs Discord OAuth later.
function isDiscordIdValid(discordId) {
  return /^\d{17,20}$/.test(String(discordId || "").trim());
}

function isImageUrlMaybe(url) {
  if (!url) return true;
  return /^https?:\/\/.+/i.test(url);
}

async function getSession() {
  const { data, error } = await window.sb.auth.getSession();
  if (error) throw error;
  return data.session;
}

async function getCurrentUser() {
  const { data, error } = await window.sb.auth.getUser();
  if (error) throw error;
  return data.user;
}

async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await window.sb
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}

async function signOut() {
  await window.sb.auth.signOut();
  window.location.reload();
}

async function loadDefaultTournament() {
  const { data, error } = await window.sb
    .from("tournaments")
    .select("*")
    .eq("slug", cfg.DEFAULT_TOURNAMENT_SLUG)
    .single();

  if (error) throw error;
  return data;
}

function statusBadge(status) {
  return `<span class="badge badge-${escapeHtml(status)}">${escapeHtml(status)}</span>`;
}

function teamLogoHtml(team, size = "md") {
  const tag = normalizeText(team.team_tag || team.tag || "?").slice(0, 3).toUpperCase();

  if (team.logo_url) {
    return `<img class="team-logo team-logo-${size}" src="${escapeHtml(team.logo_url)}" alt="${escapeHtml(team.team_name)} logo" loading="lazy" />`;
  }

  return `<div class="team-logo team-logo-${size} team-logo-fallback">${escapeHtml(tag)}</div>`;
}

function applyAssetBackgrounds() {
  const hero = qs("[data-hero-bg]");
  if (hero) {
    hero.style.setProperty("--hero-bg", `url('${cfg.ASSETS.heroBg}')`);
  }

  qsa("[data-asset]").forEach(el => {
    const key = el.dataset.asset;
    if (!cfg.ASSETS[key]) return;
    el.src = cfg.ASSETS[key];
    el.onerror = () => el.classList.add("asset-missing");
  });
}

function compactDate(value) {
  if (!value) return "TBA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBA";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("DOMContentLoaded", applyAssetBackgrounds);
