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
  return ({ single_elimination:"Single Elimination", double_elimination:"Double Elimination", swiss:"Swiss" })[type] || type || "Single Elimination";
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
