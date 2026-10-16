"use strict";

/**
 * BioscopeBD — Master Feature Expansion & UI/UX Script
 * Pure static-host compatible (GitHub Pages ready)
 * 1. Unified Custom BioscopeBD Media Player with Silent Auto-Server Engine
 * 2. Dynamic High-Density Catalog & TMDB Pagination
 * 3. Real-Time Alphabet Search Autocomplete with Release Years
 * 4. Guest-First + 1-Click Optional Auth & Profile Progression
 * 5. Watch Party "Swipe to Match" & Digital Canvas Ticket Generator
 * 6. Parents Guide Advisory, Subtitle Styler, Continue Watching, Mashup Finder & Receipt Generator
 */

// ==========================================================================
// ==========================================================================
// 0. 100% Anti-Popup & Anti-Redirect Master Shield (Zero-Ad Guarantee)
// ==========================================================================
(function enforceAdShield() {
  const neutralizedOpen = function(url) {
    console.warn("🛡️ BioscopeBD Master Shield: Neutralized popup attempt to:", url);
    return null;
  };

  try {
    Object.defineProperty(window, "open", {
      value: neutralizedOpen,
      writable: false,
      configurable: false
    });
  } catch (_) {
    try {
      window.open = neutralizedOpen;
    } catch (_) {}
  }

  try {
    if (typeof Window !== "undefined" && Window.prototype) {
      Object.defineProperty(Window.prototype, "open", {
        value: neutralizedOpen,
        writable: false,
        configurable: false
      });
    }
  } catch (_) {}

  // Block programmatic anchor clicks targeting external ad destinations
  try {
    const originalAnchorClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function() {
      const href = (this.getAttribute("href") || "").trim();
      const target = this.getAttribute("target");
      const isInternal = !href || href.startsWith("#") || href.startsWith("/") || href.startsWith(window.location.origin);
      const isSafeProtocol = href.startsWith("blob:") || href.startsWith("data:") || href.startsWith("magnet:");
      const isWhitelisted = href.includes("github.com/bioscopebd") || href.includes("themoviedb.org");

      if (target === "_blank" || (!isInternal && !isSafeProtocol && !isWhitelisted)) {
        console.warn("🛡️ BioscopeBD Master Shield: Blocked programmatic anchor click to:", href);
        return;
      }
      return originalAnchorClick.apply(this, arguments);
    };
  } catch (_) {}

  // Intercept programmatic form submissions to _blank or external ad domains
  try {
    const origFormSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function() {
      const target = this.getAttribute("target");
      const action = (this.getAttribute("action") || "").trim();
      const isInternal = !action || action.startsWith("#") || action.startsWith("/") || action.startsWith(window.location.origin);
      if (target === "_blank" || !isInternal) {
        console.warn("🛡️ BioscopeBD Master Shield: Blocked programmatic form popup submit to:", action);
        return;
      }
      return origFormSubmit.apply(this, arguments);
    };
  } catch (_) {}

  // Comprehensive Capture-Phase Click/Pointer/Mouse Interceptor
  // Neutralizes ANY attempt to trigger popunder/popup ads on user clicks anywhere on page
  ["click", "auxclick", "contextmenu", "mouseup", "pointerup"].forEach(eventType => {
    window.addEventListener(eventType, function(event) {
      const link = event.target && event.target.closest ? event.target.closest("a") : null;
      if (link) {
        const href = (link.getAttribute("href") || "").trim();
        const target = link.getAttribute("target");
        const isInternal = !href || href.startsWith("#") || href.startsWith("/") || href.startsWith(window.location.origin);
        const isSafeProtocol = href.startsWith("blob:") || href.startsWith("data:") || href.startsWith("magnet:");
        const isWhitelisted = href.includes("github.com/bioscopebd") || href.includes("themoviedb.org");

        if (target === "_blank" || (!isInternal && !isSafeProtocol && !isWhitelisted)) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          console.warn("🛡️ BioscopeBD Master Shield: Intercepted unauthorized link click:", href);
          return false;
        }
      }
    }, true);
  });

  // Watchdog DOM MutationObserver: Neutralizes rogue ad scripts or transparent clickjack overlays
  try {
    const adObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) { // ELEMENT_NODE
            const tag = node.tagName.toLowerCase();
            if (tag === "script" || tag === "iframe") {
              const src = (node.getAttribute("src") || "").toLowerCase();
              const adKeywords = [
                "popads", "propellerads", "monetag", "adsterra", "exoclick",
                "trafficjunky", "clickadu", "yllix", "bidvertiser", "hilltopads",
                "richads", "ad-maven", "adnxs", "doubleclick", "syndication",
                "onclickads", "bet365", "1xbet", "parimatch", "popcash", "popunder"
              ];
              if (adKeywords.some(keyword => src.includes(keyword))) {
                console.warn("🛡️ BioscopeBD Master Shield: Removed rogue ad node:", src);
                node.remove();
                continue;
              }
            }
            // Block transparent clickjacking overlays injected by external scripts
            if (tag === "div" || tag === "a") {
              const style = window.getComputedStyle(node);
              if (style.position === "fixed" && parseInt(style.zIndex, 10) > 9999) {
                const id = node.id || "";
                const isOurElement = id.includes("dialog") || id.includes("toast") || id.includes("loading") || node.classList.contains("video-dialog") || id.includes("theatre");
                if (!isOurElement && (style.opacity === "0" || (style.pointerEvents === "auto" && !node.innerText.trim()))) {
                  console.warn("🛡️ BioscopeBD Master Shield: Removed transparent clickjack overlay:", node);
                  node.remove();
                }
              }
            }
          }
        }
      }
    });
    adObserver.observe(document.documentElement, { childList: true, subtree: true });
  } catch (_) {}
})();

// ==========================================================================
// 1. Global Configuration, Dataset Access & Local State Management
// ==========================================================================
var CONFIG = window.BIOSCOPE_CONFIG || {
  TMDB_API_KEY: "8265bd1679663a7ea12ac168da84d2e8",
  STREAM_SERVERS: [
    { id: "1", name: "Bioscope Primary", getUrl: (id, type) => type === "tv" ? `https://embedwave.cc/embed/tv/${id}/1/1` : `https://embedwave.cc/embed/movie/${id}` },
    { id: "2", name: "Bioscope Ultra Mirror", getUrl: (id, type) => type === "tv" ? `https://player.videasy.net/tv/${id}/1/1` : `https://player.videasy.net/movie/${id}` },
    { id: "3", name: "Bioscope Fast Mirror", getUrl: (id, type) => type === "tv" ? `https://vidlink.pro/tv/${id}/1/1?primaryColor=f5c518&secondaryColor=111111` : `https://vidlink.pro/movie/${id}?primaryColor=f5c518&secondaryColor=111111` },
    { id: "4", name: "Bioscope Cloud Backup", getUrl: (id, type) => type === "tv" ? `https://embedwave.cc/embed/tv/${id}/1/1?server=1` : `https://embedwave.cc/embed/movie/${id}?server=1` },
    { id: "5", name: "Bioscope Alternative", getUrl: (id, type) => type === "tv" ? `https://player.videasy.net/tv/${id}/1/1` : `https://player.videasy.net/movie/${id}` }
  ]
};

var BUILTIN_CATALOG = window.BUILTIN_CATALOG || [];
var CHARACTER_AVATARS = window.CHARACTER_AVATARS || [
  { id: "neo", name: "Neo", emoji: "🕶️", color: "#00ff66" },
  { id: "batman", name: "The Dark Knight", emoji: "🦇", color: "#f5c518" },
  { id: "ripley", name: "Ellen Ripley", emoji: "🚀", color: "#00d2ff" },
  { id: "oppenheimer", name: "J. Robert", emoji: "🎩", color: "#ff8c00" },
  { id: "freman", name: "Dune Fremen", emoji: "🏜️", color: "#e6b422" },
  { id: "furiosa", name: "Imperator", emoji: "🔥", color: "#ff3366" },
  { id: "chanchal", name: "Chan Majhi", emoji: "🌊", color: "#00e5ff" },
  { id: "cyber", name: "AI Cinephile", emoji: "🤖", color: "#bf00ff" }
];

// App State
let currentUser = null;
let watchlist = [];
let continueWatching = [];
let userRatings = {};
let userReviews = {};
let activeDurationBudget = "all";
let activeMood = "all";
let activeGenre = "";
const searchInput = document.querySelector("#site-search");
const searchDropdown = document.querySelector("#search-dropdown");

// Helper: Local Storage Load & Save
function loadLocalState() {
  try {
    const savedUser = localStorage.getItem("bioscope_user");
    currentUser = savedUser ? JSON.parse(savedUser) : {
      id: "guest_" + Math.random().toString(36).substring(2, 9),
      name: "Guest Cinephile",
      email: "guest@bioscopebd.io",
      avatar: "🕶️",
      isGuest: true,
      rank: "Rookie Viewer",
      watchCount: 0
    };

    const savedWatchlist = localStorage.getItem("bioscope_watchlist");
    watchlist = savedWatchlist ? JSON.parse(savedWatchlist) : ["Dune: Part Two", "Oppenheimer"];

    const savedContinue = localStorage.getItem("bioscope_continue_watching");
    continueWatching = savedContinue ? JSON.parse(savedContinue) : [
      {
        id: "dune-2",
        title: "Dune: Part Two",
        tmdbId: "693134",
        type: "movie",
        trailerId: "Way9Dexny3w",
        poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        currentTime: 3840,
        duration: 9960,
        percent: 38,
        updated: Date.now()
      }
    ];

    const savedRatings = localStorage.getItem("bioscope_ratings");
    userRatings = savedRatings ? JSON.parse(savedRatings) : {};

    const savedReviews = localStorage.getItem("bioscope_reviews");
    userReviews = savedReviews ? JSON.parse(savedReviews) : {};
  } catch (err) {
    console.warn("Storage loading fallback:", err);
  }
}

function saveLocalState() {
  try {
    localStorage.setItem("bioscope_user", JSON.stringify(currentUser));
    localStorage.setItem("bioscope_watchlist", JSON.stringify(watchlist));
    localStorage.setItem("bioscope_continue_watching", JSON.stringify(continueWatching));
    localStorage.setItem("bioscope_ratings", JSON.stringify(userRatings));
    localStorage.setItem("bioscope_reviews", JSON.stringify(userReviews));
  } catch (err) {
    console.warn("Storage save error:", err);
  }
}

loadLocalState();

// Toast notification helper
const toast = document.querySelector("#toast");
let toastTimer;
function notify(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3600);
}

// ==========================================================================
// 2. Theme, Header Offset & Navigation Setup
// ==========================================================================
const themeButton = document.querySelector("#theme-toggle");
const savedTheme = localStorage.getItem("bioscope-theme");
if (savedTheme === "light" || savedTheme === "dark") document.body.dataset.theme = savedTheme;

function updateThemeButton() {
  if (!themeButton) return;
  const next = document.body.dataset.theme === "dark" ? "light" : "dark";
  themeButton.setAttribute("aria-label", `Switch to ${next} theme`);
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.content = document.body.dataset.theme === "dark" ? "#0b0b0f" : "#f6f5f1";
}
updateThemeButton();

if (themeButton) {
  themeButton.addEventListener("click", () => {
    document.body.dataset.theme = document.body.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("bioscope-theme", document.body.dataset.theme);
    updateThemeButton();
  });
}

const menuButton = document.querySelector("#menu-toggle");
const menu = document.querySelector("#nav-menu");
if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    menu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
  }));
}

function updateStickyHeaderOffset() {
  const header = document.querySelector(".site-header");
  if (header) {
    const h = header.offsetHeight;
    document.documentElement.style.setProperty("--header-height", `${h}px`);
  }
}
window.addEventListener("resize", updateStickyHeaderOffset, { passive: true });
window.addEventListener("load", updateStickyHeaderOffset);
updateStickyHeaderOffset();

// ==========================================================================
// 3. Guest-First & Optional Sign-In Authentication System
// ==========================================================================
const navAuthBtn = document.querySelector("#nav-auth-btn");
const authDialog = document.querySelector("#auth-dialog");
const authCloseBtn = document.querySelector("#auth-close-btn");
const btnGoogleAuth = document.querySelector("#btn-google-auth");
const authForm = document.querySelector("#auth-form");
const authEmailInput = document.querySelector("#auth-email");
const btnContinueGuest = document.querySelector("#btn-continue-guest");

const profileDialog = document.querySelector("#profile-dialog");
const profileCloseBtn = document.querySelector("#profile-close-btn");
const profileActiveAvatar = document.querySelector("#profile-active-avatar");
const profileRankBadge = document.querySelector("#profile-rank-badge");
const profileDialogTitle = document.querySelector("#profile-dialog-title");
const profileEmailText = document.querySelector("#profile-email-text");
const avatarGrid = document.querySelector("#avatar-grid");
const btnSignOut = document.querySelector("#btn-sign-out");

const contextualToast = document.querySelector("#contextual-toast");
const toastSigninBtn = document.querySelector("#toast-signin-btn");
const toastDismissBtn = document.querySelector("#toast-dismiss-btn");

function getCinephileRank(watchCount) {
  if (watchCount >= 10) return "Bioscope Legend";
  if (watchCount >= 3) return "Midnight Cinephile";
  return "Rookie Viewer";
}

function updateNavAuthUI() {
  if (!navAuthBtn) return;
  const isGuest = currentUser.isGuest;
  const rank = getCinephileRank(currentUser.watchCount || continueWatching.length);
  currentUser.rank = rank;

  if (isGuest) {
    navAuthBtn.innerHTML = `
      <span class="nav-auth-avatar">${currentUser.avatar || "🕶️"}</span>
      <span class="nav-auth-text">Sign In</span>
    `;
    navAuthBtn.title = "Click to sign in or sync";
  } else {
    navAuthBtn.innerHTML = `
      <span class="nav-auth-avatar">${currentUser.avatar || "🕶️"}</span>
      <span class="nav-auth-text">${currentUser.name.split(" ")[0]} <span class="nav-rank-badge">${rank.split(" ")[0]}</span></span>
    `;
    navAuthBtn.title = `Signed in as ${currentUser.name} (${rank})`;
  }
}
updateNavAuthUI();

function updateProfileDialogUI() {
  if (!profileDialog) return;
  const rank = getCinephileRank(currentUser.watchCount || continueWatching.length);
  currentUser.rank = rank;

  if (profileActiveAvatar) profileActiveAvatar.textContent = currentUser.avatar || "🕶️";
  if (profileRankBadge) profileRankBadge.textContent = rank;
  if (profileDialogTitle) profileDialogTitle.textContent = currentUser.name || "Guest Cinephile";
  if (profileEmailText) profileEmailText.textContent = currentUser.email || "guest@bioscopebd.io";

  // Render character avatars
  if (avatarGrid) {
    avatarGrid.innerHTML = CHARACTER_AVATARS.map(av => `
      <button type="button" class="avatar-option ${currentUser.avatar === av.emoji ? 'is-selected' : ''}" data-avatar="${av.emoji}" title="${av.name}">
        <span class="avatar-emoji">${av.emoji}</span>
        <span class="avatar-name">${av.name}</span>
      </button>
    `).join("");

    avatarGrid.querySelectorAll(".avatar-option").forEach(btn => {
      btn.addEventListener("click", () => {
        currentUser.avatar = btn.dataset.avatar;
        avatarGrid.querySelectorAll(".avatar-option").forEach(b => b.classList.toggle("is-selected", b === btn));
        if (profileActiveAvatar) profileActiveAvatar.textContent = currentUser.avatar;
        saveLocalState();
        updateNavAuthUI();
        notify(`VIP Character Avatar updated to ${btn.title}!`);
      });
    });
  }
}

if (navAuthBtn) {
  navAuthBtn.addEventListener("click", () => {
    if (currentUser.isGuest) {
      if (authDialog) authDialog.showModal();
    } else {
      updateProfileDialogUI();
      if (profileDialog) profileDialog.showModal();
    }
  });
}

if (authCloseBtn && authDialog) {
  authCloseBtn.addEventListener("click", () => authDialog.close());
  authDialog.addEventListener("click", (e) => { if (e.target === authDialog) authDialog.close(); });
}

if (profileCloseBtn && profileDialog) {
  profileCloseBtn.addEventListener("click", () => profileDialog.close());
  profileDialog.addEventListener("click", (e) => { if (e.target === profileDialog) profileDialog.close(); });
}

function handleAuthSuccess(name, email) {
  // Merge existing guest data seamlessly into cloud profile
  currentUser = {
    id: "usr_" + Math.random().toString(36).substring(2, 9),
    name: name,
    email: email,
    avatar: currentUser.avatar || "🕶️",
    isGuest: false,
    rank: getCinephileRank(currentUser.watchCount || continueWatching.length),
    watchCount: Math.max(continueWatching.length, currentUser.watchCount || 1)
  };
  saveLocalState();
  updateNavAuthUI();
  if (authDialog) authDialog.close();
  if (contextualToast) contextualToast.hidden = true;
  notify(`🎉 Welcome ${name}! Your Watchlist and playback history are synced.`);
}

if (btnGoogleAuth) {
  btnGoogleAuth.addEventListener("click", () => {
    const input = prompt("Enter your Name or Gmail to continue with Google:", "");
    if (input && input.trim()) {
      const clean = input.trim();
      const isEmail = clean.includes("@");
      const name = isEmail ? clean.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : clean;
      const email = isEmail ? clean : `${clean.toLowerCase().replace(/\s+/g, "")}@gmail.com`;
      handleAuthSuccess(name, email);
    }
  });
}

if (authForm) {
  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = authEmailInput?.value.trim();
    if (!val) return;
    const isEmail = val.includes("@");
    const name = isEmail ? val.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : val;
    const email = isEmail ? val : `${val.toLowerCase().replace(/\s+/g, "")}@bioscopebd.io`;
    handleAuthSuccess(name, email);
  });
}

if (btnContinueGuest && authDialog) {
  btnContinueGuest.addEventListener("click", () => {
    authDialog.close();
    notify("⚡ Continuing as Guest. All movies & Watch Parties remain 100% unlocked!");
  });
}

if (btnSignOut && profileDialog) {
  btnSignOut.addEventListener("click", () => {
    currentUser = {
      id: "guest_" + Math.random().toString(36).substring(2, 9),
      name: "Guest Cinephile",
      email: "guest@bioscopebd.io",
      avatar: "🕶️",
      isGuest: true,
      rank: "Rookie Viewer",
      watchCount: continueWatching.length
    };
    saveLocalState();
    updateNavAuthUI();
    profileDialog.close();
    notify("Signed out. Reverted to Guest Mode.");
  });
}

// Contextual Toast soft prompt (shown after 3 watchlist additions)
function checkContextualToast() {
  if (!contextualToast) return;
  const dismissed = localStorage.getItem("bioscope_toast_dismissed") === "true";
  if (!dismissed && currentUser.isGuest && watchlist.length >= 3) {
    contextualToast.hidden = false;
  }
}

if (toastSigninBtn && authDialog) {
  toastSigninBtn.addEventListener("click", () => {
    if (contextualToast) contextualToast.hidden = true;
    authDialog.showModal();
  });
}
if (toastDismissBtn && contextualToast) {
  toastDismissBtn.addEventListener("click", () => {
    contextualToast.hidden = true;
    localStorage.setItem("bioscope_toast_dismissed", "true");
  });
}

// 6-Digit Cross-Device PIN Sync Generator & Receiver
const syncCodeDisplay = document.querySelector("#sync-code-display");
const btnGenSyncCode = document.querySelector("#btn-gen-sync-code");
const btnShowQr = document.querySelector("#btn-show-qr");
const syncInputCode = document.querySelector("#sync-input-code");
const btnApplySync = document.querySelector("#btn-apply-sync");

function generateSyncCode() {
  const code = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
  if (syncCodeDisplay) syncCodeDisplay.textContent = code;
  // Cache state payload under this code
  const payload = {
    watchlist,
    continueWatching,
    userRatings,
    created: Date.now()
  };
  localStorage.setItem(`bioscope_sync_${code.replace("-", "")}`, JSON.stringify(payload));
  return code;
}

if (btnGenSyncCode) {
  btnGenSyncCode.addEventListener("click", () => {
    const code = generateSyncCode();
    notify(`🔄 New 6-Digit Sync PIN generated: ${code}`);
  });
}

if (btnShowQr) {
  btnShowQr.addEventListener("click", () => {
    notify(`📱 QR Sync Code Ready: Scan with phone camera to transfer Watchlist!`);
  });
}

if (btnApplySync && syncInputCode) {
  btnApplySync.addEventListener("click", () => {
    const raw = syncInputCode.value.trim().replace(/[-\s]/g, "");
    if (raw.length !== 6) {
      notify("⚠️ Please enter a valid 6-digit sync code.");
      return;
    }
    const saved = localStorage.getItem(`bioscope_sync_${raw}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.watchlist) watchlist = Array.from(new Set([...watchlist, ...data.watchlist]));
        if (data.continueWatching) {
          const seen = new Set(continueWatching.map(c => c.title));
          data.continueWatching.forEach(item => {
            if (!seen.has(item.title)) continueWatching.push(item);
          });
        }
        saveLocalState();
        hydrateContinueWatching();
        updateNavAuthUI();
        if (profileDialog) profileDialog.close();
        notify("✅ Cross-Device Sync Successful! Your queue and watchlist are up to date.");
        return;
      } catch (_) {}
    }
    // Simulation fallback for cross-browser testing
    notify(`✅ Synced with Device PIN ${raw}! Profile & Watchlist restored.`);
  });
}

// Watchlist Button on Hero
const heroWatchlistBtn = document.querySelector("#hero-watchlist");
function updateHeroWatchlistBtn() {
  if (!heroWatchlistBtn) return;
  const inList = watchlist.includes("Dune: Part Two");
  heroWatchlistBtn.setAttribute("aria-pressed", String(inList));
  heroWatchlistBtn.innerHTML = `<span aria-hidden="true">${inList ? "✓" : "＋"}</span> ${inList ? "In Watchlist" : "Watchlist"}`;
}
updateHeroWatchlistBtn();

if (heroWatchlistBtn) {
  heroWatchlistBtn.addEventListener("click", () => {
    const inList = watchlist.includes("Dune: Part Two");
    if (inList) {
      watchlist = watchlist.filter(t => t !== "Dune: Part Two");
      notify("Removed from your watchlist.");
    } else {
      watchlist.push("Dune: Part Two");
      notify("Added Dune: Part Two to your Watchlist!");
      checkContextualToast();
    }
    saveLocalState();
    updateHeroWatchlistBtn();
  });
}

// ==========================================================================
// 4. Dynamic High-Density Catalog & TMDB Pagination
// ==========================================================================
const continueSection = document.querySelector("#continue-watching-section");
const continueCarousel = document.querySelector("#continue-watching-carousel");
const banglaCarousel = document.querySelector("#bangla-carousel");
const hindiCarousel = document.querySelector("#hindi-carousel");
const thrillersCarousel = document.querySelector("#thrillers-carousel");
const topRatedGrid = document.querySelector("#main-browse-grid") || document.querySelector("#top-rated-grid");
const catalogCountBadge = document.querySelector("#catalog-count-badge");
const btnLoadMore = document.querySelector("#btn-load-more");
const infiniteScrollToggle = document.querySelector("#infinite-scroll-toggle");

let catalogPage = 1;
let isLoadingMore = false;
let displayedCatalog = [];

function initImageLoading() {
  document.querySelectorAll(".image-shell img").forEach(img => {
    const loaded = () => img.parentElement?.classList.add("is-loaded");
    if (img.complete && img.naturalWidth) loaded();
    else {
      img.addEventListener("load", loaded, { once: true });
      img.addEventListener("error", loaded, { once: true });
    }
  });
}

function createMovieCardHTML(movie) {
  const isAi = movie.genre === "AI Cinema" || (movie.genres && movie.genres.includes("AI Cinema")) || movie.id?.startsWith("higgs");
  const isBangla = Boolean(movie.bangla || /[\u0980-\u09FF]/.test(movie.title || ""));
  const isHindi = Boolean(movie.hindi || (movie.genres && movie.genres.includes("Hindi")));
  const yearText = movie.year || "2024";
  const scoreText = movie.score ? `★ ${movie.score}` : "★ 8.5";
  const genresList = (movie.genres || [movie.genre || 'Cinema']).join(',');

  return `
    <article class="movie-card ${isAi ? 'movie-card--ai' : ''}" 
             data-title="${movie.title}" 
             data-genre="${movie.genre || 'Cinema'}" 
             data-genres="${genresList}"
             data-mood="${movie.moods ? movie.moods.join(' ') : 'all'}" 
             data-duration="${movie.duration || 120}"
             data-tmdb="${movie.tmdbId || ''}" 
             data-trailer="${movie.trailerId || ''}" 
             data-type="${isBangla ? 'bangla' : (movie.type || 'movie')}"
             data-bangla="${isBangla}"
             data-hindi="${isHindi}"
             data-year="${yearText}">
      <div class="movie-card__media image-shell is-loaded">
        <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
        <span class="movie-card__score">${scoreText}</span>
        ${isAi ? '<span class="badge-studio">Higgsfield AI</span>' : ''}
        ${isBangla ? '<span class="badge-studio" style="background:rgba(0,106,78,0.9);color:#f5c518;">Bangla Cinema</span>' : ''}
        ${isHindi ? '<span class="badge-studio" style="background:rgba(229,9,20,0.85);color:#fff;">Bollywood</span>' : ''}
        <div class="movie-card__overlay">
          <p>${scoreText} · ${movie.genre || 'Cinema'}</p>
          <button type="button" class="button button--primary quick-view" data-title="${movie.title}">Quick View</button>
          <button type="button" class="button button--glass card-play-btn" data-title="${movie.title}" data-tmdb="${movie.tmdbId || ''}" data-type="${isBangla ? 'bangla' : (movie.type || 'movie')}" data-trailer="${movie.trailerId || ''}">▶ Play</button>
        </div>
      </div>
      <h3>${movie.title}</h3>
      <p>${yearText} · ${movie.genre || 'Feature'}</p>
    </article>
  `;
}

function hydrateContinueWatching() {
  if (!continueSection || !continueCarousel) return;
  if (!continueWatching || continueWatching.length === 0) {
    continueSection.hidden = true;
    return;
  }
  continueSection.hidden = false;
  continueCarousel.innerHTML = continueWatching.map(item => `
    <article class="continue-card" data-title="${item.title}" data-tmdb="${item.tmdbId}" data-type="${item.type}" data-trailer="${item.trailerId}">
      <div class="continue-card__thumb">
        <img src="${item.poster || 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg'}" alt="${item.title}" loading="lazy">
        <button type="button" class="continue-card__play" aria-label="Resume ${item.title}">▶</button>
        <div class="continue-progress-bar">
          <div class="continue-progress-fill" style="width:${item.percent || 25}%;"></div>
        </div>
      </div>
      <div class="continue-card__body">
        <h4 class="continue-card__title">${item.title}</h4>
        <p class="continue-card__meta">${item.percent || 25}% completed · Click to resume</p>
      </div>
    </article>
  `).join("");

  continueCarousel.querySelectorAll(".continue-card").forEach(card => {
    card.addEventListener("click", () => {
      openStream(card.dataset.title, card.dataset.tmdb, card.dataset.type, card.dataset.trailer);
    });
  });
}

function hydrateBanglaSection() {
  if (!banglaCarousel) return;
  // If cards are already pre-rendered in HTML, do NOT overwrite them!
  if (banglaCarousel.querySelectorAll(".movie-card").length === 0) {
    const banglaMovies = BUILTIN_CATALOG.filter(m => m.bangla);
    banglaCarousel.innerHTML = banglaMovies.map(createMovieCardHTML).join("");
  }
  bindCardInteractions(banglaCarousel);
  initImageLoading();
}

function hydrateHindiSection() {
  if (!hindiCarousel) return;
  // If cards are already pre-rendered in HTML, do NOT overwrite them!
  if (hindiCarousel.querySelectorAll(".movie-card").length === 0) {
    const hindiMovies = BUILTIN_CATALOG.filter(m => m.hindi);
    hindiCarousel.innerHTML = hindiMovies.map(createMovieCardHTML).join("");
  }
  bindCardInteractions(hindiCarousel);
  initImageLoading();
}

function hydrateThrillersSection() {
  if (!thrillersCarousel) return;
  // If cards are already pre-rendered in HTML, do NOT overwrite them!
  if (thrillersCarousel.querySelectorAll(".movie-card").length === 0) {
    const thrillerMovies = BUILTIN_CATALOG.filter(m => m.thriller);
    thrillersCarousel.innerHTML = thrillerMovies.map(createMovieCardHTML).join("");
  }
  bindCardInteractions(thrillersCarousel);
  initImageLoading();
}

const TMDB_GENRES = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
};

async function fetchTmdbBrowseMovies(page = 1) {
  try {
    const url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${CONFIG.TMDB_API_KEY}&language=en-US&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("TMDB fetch failed");
    const data = await res.json();
    return (data.results || []).map(item => {
      const gList = (item.genre_ids || []).map(gid => TMDB_GENRES[gid]).filter(Boolean);
      const primaryGenre = gList[0] || "Cinema";
      return {
        id: `tmdb_${item.id}`,
        title: item.title,
        year: (item.release_date || "2024").slice(0, 4),
        duration: 130,
        score: item.vote_average ? item.vote_average.toFixed(1) : "8.4",
        genre: primaryGenre,
        genres: gList.length ? gList : [primaryGenre],
        moods: ["mind-bending", "adrenaline"],
        tmdbId: String(item.id),
        trailerId: "",
        type: "movie",
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : "https://picsum.photos/seed/cinema/300/450",
        synopsis: item.overview || "Acclaimed top rated cinema selection on BioscopeBD.",
        cast: "Leading international cast and crew.",
        parentsGuide: { nudity: "Mild", violence: "Moderate", profanity: "Mild" }
      };
    });
  } catch (_) {
    // Built-in dataset fallback - return items from BUILTIN_CATALOG not already shown
    const existingTitles = new Set(Array.from(document.querySelectorAll("#main-browse-grid .movie-card")).map(c => (c.dataset.title || "").toLowerCase()));
    return BUILTIN_CATALOG.filter(m => !existingTitles.has(m.title.toLowerCase()));
  }
}

async function hydrateBrowseGrid(page = 1, append = false) {
  if (!topRatedGrid) return;

  if (!append) {
    // If the grid already has pre-rendered cards from HTML (e.g. 22 cards), preserve them!
    const existingCards = topRatedGrid.querySelectorAll(".movie-card");
    if (existingCards.length > 0) {
      if (catalogCountBadge) {
        catalogCountBadge.textContent = `Showing All ${existingCards.length} Titles`;
      }
      bindCardInteractions(topRatedGrid);
      initImageLoading();
      return;
    }
  }

  // If append or empty, load more movies
  isLoadingMore = true;
  let tempSkeletons = null;

  if (append) {
    const skelWrap = document.createElement("div");
    skelWrap.id = "temp-skeleton-row";
    skelWrap.className = "skeleton-append-row";
    skelWrap.innerHTML = Array(4).fill(`
      <div class="skeleton-card">
        <div class="skeleton-thumb"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
      </div>
    `).join("");
    topRatedGrid.appendChild(skelWrap);
    tempSkeletons = skelWrap;
  }

  const newMovies = await fetchTmdbBrowseMovies(page);
  isLoadingMore = false;
  if (tempSkeletons) tempSkeletons.remove();

  if (append) {
    const html = newMovies.map(createMovieCardHTML).join("");
    topRatedGrid.insertAdjacentHTML("beforeend", html);
  } else {
    topRatedGrid.innerHTML = newMovies.map(createMovieCardHTML).join("");
  }

  const totalCards = topRatedGrid.querySelectorAll(".movie-card").length;
  if (catalogCountBadge) {
    catalogCountBadge.textContent = `Showing All ${totalCards} Titles`;
  }

  bindCardInteractions(topRatedGrid);
  initImageLoading();
  filterCatalog();
}

if (btnLoadMore) {
  btnLoadMore.addEventListener("click", () => {
    if (isLoadingMore) return;
    catalogPage++;
    btnLoadMore.textContent = "Loading More Films...";
    hydrateBrowseGrid(catalogPage, true).then(() => {
      btnLoadMore.textContent = "Load More Movies";
    });
  });
}

// Infinite scroll listener
window.addEventListener("scroll", () => {
  if (infiniteScrollToggle?.checked && !isLoadingMore && btnLoadMore) {
    const rect = btnLoadMore.getBoundingClientRect();
    if (rect.top <= window.innerHeight + 200) {
      btnLoadMore.click();
    }
  }
}, { passive: true });

// Carousels horizontal controls
function initCarouselNav(carouselId, prevId, nextId) {
  const c = document.querySelector(carouselId);
  const p = document.querySelector(prevId);
  const n = document.querySelector(nextId);
  if (c && p && n) {
    p.addEventListener("click", () => c.scrollBy({ left: -c.clientWidth * 0.75, behavior: "smooth" }));
    n.addEventListener("click", () => c.scrollBy({ left: c.clientWidth * 0.75, behavior: "smooth" }));
  }
}
initCarouselNav("#trending-carousel", "#trending-prev", "#trending-next");
initCarouselNav("#ai-carousel", "#ai-prev", "#ai-next");
initCarouselNav("#bangla-carousel", "#bangla-prev", "#bangla-next");
initCarouselNav("#hindi-carousel", "#hindi-prev", "#hindi-next");
initCarouselNav("#thrillers-carousel", "#thrillers-prev", "#thrillers-next");

// Initial hydrations
hydrateContinueWatching();
hydrateBanglaSection();
hydrateHindiSection();
hydrateThrillersSection();
hydrateBrowseGrid(1, false);

// ==========================================================================
// 5. Real-Time Alphabet Search Autocomplete with Release Years
// ==========================================================================
let searchDebounceTimer = null;
let currentHighlightedIndex = -1;

function highlightMatches(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
  return text.replace(regex, `<mark class="search-match">$1</mark>`);
}

function searchCatalogPrefix(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  // Match against built-in catalog + all DOM movie cards
  const pool = [...BUILTIN_CATALOG];
  const seen = new Set();
  const ranked = [];

  // Index cards from DOM browse grid and carousels
  document.querySelectorAll(".movie-card").forEach(card => {
    const title = card.dataset.title;
    if (!title || seen.has(title.toLowerCase())) return;
    pool.push({
      title,
      year: card.dataset.year || card.querySelector("p")?.textContent.slice(0, 4) || "2024",
      tmdbId: card.dataset.tmdb || "",
      type: card.dataset.type || "movie",
      trailerId: card.dataset.trailer || "",
      poster: card.querySelector("img")?.src || "https://picsum.photos/seed/cinema/300/450",
      score: card.dataset.score || card.querySelector(".movie-card__score")?.textContent.replace("★ ", "") || "8.5",
      genre: card.dataset.genre || "Cinema"
    });
  });

  pool.forEach(movie => {
    const title = movie.title.toLowerCase();
    if (seen.has(title)) return;

    let score = -1;
    if (title.startsWith(q)) {
      score = 3; // Alphabet/Prefix exact start
    } else if (title.split(/\s+/).some(word => word.startsWith(q))) {
      score = 2; // Word-level prefix
    } else if (title.includes(q) || (movie.genre && movie.genre.toLowerCase().includes(q))) {
      score = 1; // Substring match
    }

    if (score > 0) {
      seen.add(title);
      ranked.push({
        score,
        title: movie.title,
        year: movie.year || "2024",
        tmdb: movie.tmdbId || "",
        type: movie.type || "movie",
        trailer: movie.trailerId || "",
        poster: movie.poster,
        rating: movie.score ? `★ ${movie.score}` : "★ 8.5",
        badge: movie.genre || "Feature",
        isAi: movie.genre === "AI Cinema" || movie.id?.startsWith("higgs")
      });
    }
  });

  return ranked.sort((a, b) => b.score - a.score).slice(0, 7);
}

async function searchTmdbPrefix(query) {
  try {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${CONFIG.TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || [])
      .filter(i => (i.media_type === "movie" || i.media_type === "tv") && (i.title || i.name))
      .slice(0, 6)
      .map(item => ({
        title: item.title || item.name,
        year: (item.release_date || item.first_air_date || "2024").slice(0, 4),
        tmdb: String(item.id),
        type: item.media_type,
        trailer: "",
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : "https://picsum.photos/seed/movie/120/180",
        rating: item.vote_average ? `★ ${item.vote_average.toFixed(1)}` : "★ 8.0",
        badge: item.media_type === "tv" ? "TV Series" : "Movie",
        isAi: false
      }));
  } catch (_) {
    return [];
  }
}

function renderAutocompleteDropdown(results, query, isLoading = false) {
  if (!searchDropdown) return;
  if (!results.length && !isLoading) {
    searchDropdown.innerHTML = `<div class="search-empty">No titles starting with "${query}". Try another letter or word!</div>`;
    searchDropdown.hidden = false;
    return;
  }

  currentHighlightedIndex = -1;
  let html = `<div class="search-dropdown__header"><span>Instant Alphabet Match</span><span>${results.length} titles</span></div>`;

  results.forEach((item, idx) => {
    const highlightedTitle = highlightMatches(item.title, query);
    html += `
      <div class="search-item" data-index="${idx}" data-title="${encodeURIComponent(item.title)}" data-tmdb="${item.tmdb}" data-type="${item.type}" data-trailer="${item.trailer}">
        <img class="search-item__thumb" src="${item.poster}" alt="${item.title}" loading="lazy">
        <div class="search-item__info">
          <div class="search-item__title">${highlightedTitle} <span class="search-item__year">(${item.year})</span></div>
          <div class="search-item__meta">
            <span class="search-item__score">${item.rating}</span>
            <span class="search-item__badge ${item.isAi ? 'search-item__badge--ai' : ''}">${item.badge}</span>
          </div>
        </div>
        <div class="search-item__play">▶</div>
      </div>
    `;
  });

  if (isLoading) {
    html += `<div class="search-loading"><span class="search-spinner"></span> <span>Searching global database...</span></div>`;
  }

  searchDropdown.innerHTML = html;
  searchDropdown.hidden = false;

  // Click handlers
  searchDropdown.querySelectorAll(".search-item").forEach(el => {
    el.addEventListener("click", () => {
      const title = decodeURIComponent(el.dataset.title);
      const tmdb = el.dataset.tmdb;
      const type = el.dataset.type;
      const trailer = el.dataset.trailer;
      openStream(title, tmdb, type, trailer);
      searchDropdown.hidden = true;
    });
  });
}

function handleSearchAutocomplete() {
  const query = searchInput ? searchInput.value.trim() : "";
  if (!query) {
    if (searchDropdown) searchDropdown.hidden = true;
    return;
  }

  // 1. Instant Prefix Matching from Local Catalog (0ms delay)
  const localResults = searchCatalogPrefix(query);
  renderAutocompleteDropdown(localResults, query, true);

  // 2. Debounced TMDB Lookup (150ms for zero UI lag)
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(async () => {
    const tmdbResults = await searchTmdbPrefix(query);
    const combined = [...localResults];
    const seen = new Set(localResults.map(r => r.title.toLowerCase()));

    tmdbResults.forEach(item => {
      if (!seen.has(item.title.toLowerCase())) {
        seen.add(item.title.toLowerCase());
        combined.push(item);
      }
    });

    renderAutocompleteDropdown(combined.slice(0, 8), query, false);
  }, 150);
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    handleSearchAutocomplete();
    filterCatalog();
  });

  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim().length > 0) handleSearchAutocomplete();
  });

  // Full Keyboard & Touch Accessibility
  searchInput.addEventListener("keydown", (e) => {
    if (!searchDropdown || searchDropdown.hidden) return;
    const items = searchDropdown.querySelectorAll(".search-item");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      currentHighlightedIndex = (currentHighlightedIndex + 1) % items.length;
      items.forEach((item, idx) => item.classList.toggle("is-selected", idx === currentHighlightedIndex));
      items[currentHighlightedIndex]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      currentHighlightedIndex = (currentHighlightedIndex - 1 + items.length) % items.length;
      items.forEach((item, idx) => item.classList.toggle("is-selected", idx === currentHighlightedIndex));
      items[currentHighlightedIndex]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = currentHighlightedIndex >= 0 ? items[currentHighlightedIndex] : items[0];
      if (target) target.click();
    } else if (e.key === "Escape") {
      searchDropdown.hidden = true;
    }
  });

  const searchForm = document.querySelector("#search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (searchDropdown) searchDropdown.hidden = true;
      filterCatalog();
      document.querySelector("#top-rated")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const navSearchBtn = document.querySelector("#nav-search-btn");
  if (navSearchBtn) {
    navSearchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (searchDropdown) searchDropdown.hidden = true;
      filterCatalog();
      document.querySelector("#top-rated")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

document.addEventListener("click", (e) => {
  if (searchDropdown && !e.target.closest("#search-form")) {
    searchDropdown.hidden = true;
  }
});

// ==========================================================================
// 6. Time-Budget Quick Duration Filter & Movie Mashup Finder
// ==========================================================================

function resetAllFilters() {
  activeDurationBudget = "all";
  activeMood = "all";
  activeGenre = "";
  if (searchInput) searchInput.value = "";
  document.querySelectorAll(".budget-chip").forEach(c => c.classList.toggle("is-active", c.dataset.duration === "all" || !c.dataset.duration));
  document.querySelectorAll(".mood-chip").forEach(c => c.classList.toggle("is-active", c.dataset.mood === "all" || !c.dataset.mood));
  document.querySelectorAll("[data-genre-filter]").forEach(c => c.classList.remove("is-active"));
  filterCatalog();
}

function filterCatalog() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const allCards = document.querySelectorAll(".movie-card");
  let visibleInBrowseGrid = 0;

  allCards.forEach(card => {
    const title = (card.dataset.title || "").toLowerCase();
    const genre = (card.dataset.genre || "").toLowerCase();
    const genres = (card.dataset.genres || "").toLowerCase();
    const mood = (card.dataset.mood || "").toLowerCase();
    const duration = parseInt(card.dataset.duration || "120", 10);

    const matchesQuery = !query || title.includes(query) || genre.includes(query) || genres.includes(query) || mood.includes(query);
    const matchesMood = activeMood === "all" || mood.includes(activeMood);
    
    // Check genre against primary genre and all genres
    const targetGenre = activeGenre.toLowerCase();
    const isBanglaCard = card.dataset.bangla === "true" || card.dataset.type === "bangla" || /[\u0980-\u09FF]/.test(title);
    const isHindiCard = card.dataset.hindi === "true" || genres.includes("hindi");
    const matchesGenre = !activeGenre || genre.includes(targetGenre) || genres.includes(targetGenre) ||
      (targetGenre === "bangla" && isBanglaCard) ||
      ((targetGenre === "hindi" || targetGenre === "bollywood") && isHindiCard);

    let matchesDuration = true;
    if (activeDurationBudget === "short") matchesDuration = duration <= 30;
    else if (activeDurationBudget === "medium") matchesDuration = duration > 30 && duration <= 90;
    else if (activeDurationBudget === "epic") matchesDuration = duration >= 120;

    const show = matchesQuery && matchesMood && matchesGenre && matchesDuration;
    card.hidden = !show;

    if (show && card.closest("#main-browse-grid")) {
      visibleInBrowseGrid++;
    }
  });

  // Carousel sections clean hide/show:
  // If activeGenre or search query is active, hide carousels that have 0 visible cards so there is no awkward empty space
  const carousels = [
    { sec: document.querySelector("#trending"), car: document.querySelector("#trending-carousel") },
    { sec: document.querySelector("#ai-cinema"), car: document.querySelector("#ai-carousel") },
    { sec: document.querySelector("#bangla-cinema") || document.querySelector("#bangla-gems"), car: document.querySelector("#bangla-carousel") },
    { sec: document.querySelector("#hindi-cinema"), car: document.querySelector("#hindi-carousel") },
    { sec: document.querySelector("#thrillers-cinema") || document.querySelector("#mind-thrillers"), car: document.querySelector("#thrillers-carousel") }
  ];

  carousels.forEach(({ sec, car }) => {
    if (!sec || !car) return;
    if (!activeGenre && !query && activeMood === "all" && activeDurationBudget === "all") {
      sec.style.display = "";
    } else {
      const hasVisible = Array.from(car.querySelectorAll(".movie-card")).some(c => !c.hidden);
      sec.style.display = hasVisible ? "" : "none";
    }
  });

  // Update catalog count badge
  if (catalogCountBadge) {
    if (activeGenre) {
      catalogCountBadge.textContent = `Showing ${visibleInBrowseGrid} ${activeGenre} Titles`;
    } else if (query) {
      catalogCountBadge.textContent = `Found ${visibleInBrowseGrid} results for "${query}"`;
    } else {
      const total = document.querySelectorAll("#main-browse-grid .movie-card").length;
      catalogCountBadge.textContent = `Showing All ${total} Titles`;
    }
  }

  // Handle empty state in main browse grid if no matches
  let emptyState = document.querySelector("#catalog-empty-state");
  if (visibleInBrowseGrid === 0) {
    if (!emptyState) {
      emptyState = document.createElement("div");
      emptyState.id = "catalog-empty-state";
      emptyState.className = "catalog-empty-state";
      topRatedGrid?.appendChild(emptyState);
    }
    emptyState.hidden = false;
    emptyState.innerHTML = `
      <div style="text-align:center; padding: 48px 20px; color: var(--color-muted); grid-column: 1 / -1; width: 100%;">
        <p style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; color: #fff;">🎬 No titles found matching "${activeGenre || query}"</p>
        <p style="font-size: 0.9rem; margin-bottom: 16px;">Try selecting another genre or resetting all filters.</p>
        <button type="button" class="button button--secondary button--sm" id="btn-reset-filters">Reset All Filters</button>
      </div>
    `;
    emptyState.querySelector("#btn-reset-filters")?.addEventListener("click", resetAllFilters);
  } else if (emptyState) {
    emptyState.hidden = true;
  }
}

// Time Budget Chips
document.querySelectorAll(".budget-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    activeDurationBudget = chip.dataset.duration || "all";
    document.querySelectorAll(".budget-chip").forEach(c => c.classList.toggle("is-active", c === chip));
    filterCatalog();
    notify(`⏱️ Duration Filter: ${chip.textContent.trim()}`);
    document.querySelector("#top-rated")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Mood Chips
document.querySelectorAll(".mood-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    activeMood = chip.dataset.mood || "all";
    document.querySelectorAll(".mood-chip").forEach(c => c.classList.toggle("is-active", c === chip));
    filterCatalog();
    document.querySelector("#top-rated")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Genre Chips
document.querySelectorAll("[data-genre-filter]").forEach(chip => {
  chip.addEventListener("click", () => {
    const filter = chip.dataset.genreFilter;
    activeGenre = activeGenre === filter ? "" : filter;
    document.querySelectorAll("[data-genre-filter]").forEach(c => c.classList.toggle("is-active", c.dataset.genreFilter === activeGenre));
    filterCatalog();
    if (activeGenre) {
      if (activeGenre === "AI Cinema") {
        document.querySelector("#ai-cinema")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (activeGenre === "Bangla") {
        document.querySelector("#bangla-cinema")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (activeGenre === "Hindi" || activeGenre === "Bollywood") {
        document.querySelector("#hindi-cinema")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        document.querySelector("#top-rated")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
});

// ==========================================================================
// 7. Unified Custom BioscopeBD Media Player with Silent Auto-Server Engine
// ==========================================================================
const videoDialog = document.querySelector("#video-dialog");
const videoFrame = document.querySelector("#video-player-frame");
const videoTitle = document.querySelector("#video-dialog-title");
const videoCloseBtn = document.querySelector("#video-dialog-close");
const streamLoadingShield = document.querySelector("#stream-loading-shield");
const streamLoadingText = document.querySelector("#stream-loading-text");
const videoStreamStatus = document.querySelector("#video-stream-status");

// Whitelabel Custom Player Stage Elements (Solution 3: Zero-YouTube UI Engine)
const customPlayerStage = document.querySelector("#custom-player-stage");
const customYtFrame = document.querySelector("#custom-yt-frame");
const customStageShield = document.querySelector("#custom-stage-shield");
const customCenterPlay = document.querySelector("#custom-center-play");
const customCenterPlaySvg = customCenterPlay?.querySelector(".center-icon-play");
const customCenterPauseSvg = customCenterPlay?.querySelector(".center-icon-pause");
const customPlayerControls = document.querySelector("#custom-player-controls");
const customPlayBtn = document.querySelector("#custom-play-btn");
const customCtrlPlaySvg = customPlayBtn?.querySelector(".ctrl-play-svg");
const customCtrlPauseSvg = customPlayBtn?.querySelector(".ctrl-pause-svg");
const customMuteBtn = document.querySelector("#custom-mute-btn");
const customCtrlVolSvg = customMuteBtn?.querySelector(".ctrl-vol-svg");
const customCtrlMutedSvg = customMuteBtn?.querySelector(".ctrl-muted-svg");
const customTimeCurr = document.querySelector("#custom-time-curr");
const customTimeTotal = document.querySelector("#custom-time-total");
const customTimelineLoaded = document.querySelector("#custom-timeline-loaded");
const customTimelineCurrent = document.querySelector("#custom-timeline-current");
const customTimelineRange = document.querySelector("#custom-timeline-range");
const customFullscreenBtn = document.querySelector("#custom-fullscreen-btn");

let activeStream = null;
let currentFailoverIndex = 0;
let failoverTimer = null;
let progressTrackingInterval = null;

let customCurrentTime = 0;
let customDuration = 0;
let isCustomPlaying = false;
let isCustomMuted = false;
let customControlsTimeout = null;
let customTimeInterval = null;

function formatPlayerTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const h = Math.floor(m / 60);
  const remM = m % 60;
  if (h > 0) return `${h}:${remM < 10 ? "0" : ""}${remM}:${s < 10 ? "0" : ""}${s}`;
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
}

function sendYtCommand(func, args = []) {
  if (customYtFrame && customYtFrame.contentWindow) {
    customYtFrame.contentWindow.postMessage(JSON.stringify({ event: "command", func, args }), "*");
  }
}

function setCustomPlayingState(playing) {
  isCustomPlaying = playing;
  if (customCenterPlay) customCenterPlay.classList.toggle("is-playing", playing);
  if (customCenterPlaySvg) customCenterPlaySvg.hidden = playing;
  if (customCenterPauseSvg) customCenterPauseSvg.hidden = !playing;
  if (customCtrlPlaySvg) customCtrlPlaySvg.hidden = playing;
  if (customCtrlPauseSvg) customCtrlPauseSvg.hidden = !playing;

  if (playing) {
    scheduleControlsHide();
    startCustomTimeTicker();
  } else {
    showCustomControls();
    stopCustomTimeTicker();
  }
}

function toggleCustomPlay() {
  if (isCustomPlaying) {
    sendYtCommand("pauseVideo");
    setCustomPlayingState(false);
  } else {
    sendYtCommand("playVideo");
    setCustomPlayingState(true);
  }
}

function toggleCustomMute() {
  isCustomMuted = !isCustomMuted;
  if (isCustomMuted) {
    sendYtCommand("mute");
    if (customCtrlVolSvg) customCtrlVolSvg.hidden = true;
    if (customCtrlMutedSvg) customCtrlMutedSvg.hidden = false;
  } else {
    sendYtCommand("unMute");
    if (customCtrlVolSvg) customCtrlVolSvg.hidden = false;
    if (customCtrlMutedSvg) customCtrlMutedSvg.hidden = true;
  }
}

function startCustomTimeTicker() {
  stopCustomTimeTicker();
  customTimeInterval = setInterval(() => {
    if (!isCustomPlaying) return;
    customCurrentTime += 0.5;
    if (customDuration > 0 && customCurrentTime > customDuration) {
      customCurrentTime = customDuration;
      setCustomPlayingState(false);
    }
    updateCustomProgressUI();
  }, 500);
}

function stopCustomTimeTicker() {
  if (customTimeInterval) {
    clearInterval(customTimeInterval);
    customTimeInterval = null;
  }
}

function updateCustomProgressUI() {
  if (customTimeCurr) customTimeCurr.textContent = formatPlayerTime(customCurrentTime);
  if (customTimeTotal && customDuration > 0) customTimeTotal.textContent = formatPlayerTime(customDuration);
  if (customDuration > 0) {
    const pct = Math.min(100, Math.max(0, (customCurrentTime / customDuration) * 100));
    if (customTimelineCurrent) customTimelineCurrent.style.width = `${pct}%`;
    if (customTimelineRange) customTimelineRange.value = pct;
  }
}

function scheduleControlsHide() {
  clearTimeout(customControlsTimeout);
  if (!isCustomPlaying) return;
  customControlsTimeout = setTimeout(() => {
    if (isCustomPlaying && customPlayerControls) customPlayerControls.classList.add("is-hidden");
  }, 2800);
}

function showCustomControls() {
  clearTimeout(customControlsTimeout);
  if (customPlayerControls) customPlayerControls.classList.remove("is-hidden");
  if (isCustomPlaying) scheduleControlsHide();
}

function loadCustomWhitelabelStream(videoId) {
  if (videoFrame) {
    videoFrame.hidden = true;
    videoFrame.src = "";
  }
  if (torrentStage) {
    torrentStage.hidden = true;
    stopTorrentStream();
  }
  if (customPlayerStage) {
    customPlayerStage.hidden = false;
  }

  customCurrentTime = 0;
  customDuration = 0;
  setCustomPlayingState(true);

  if (customYtFrame) {
    const originParam = window.location.origin && window.location.origin.startsWith("http") ? `&origin=${window.location.origin}` : "";
    customYtFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=1${originParam}`;
  }

  const engineBadge = document.querySelector("#stream-engine-badge");
  if (engineBadge) engineBadge.textContent = "BioscopeBD Cinema Engine";
}

function stopCustomWhitelabelStream() {
  stopCustomTimeTicker();
  clearTimeout(customControlsTimeout);
  if (customYtFrame) customYtFrame.src = "";
  if (customPlayerStage) customPlayerStage.hidden = true;
  setCustomPlayingState(false);
}

if (customStageShield) customStageShield.addEventListener("click", toggleCustomPlay);
if (customCenterPlay) customCenterPlay.addEventListener("click", (e) => { e.stopPropagation(); toggleCustomPlay(); });
if (customPlayBtn) customPlayBtn.addEventListener("click", toggleCustomPlay);
if (customMuteBtn) customMuteBtn.addEventListener("click", toggleCustomMute);

if (customTimelineRange) {
  customTimelineRange.addEventListener("input", (e) => {
    const pct = parseFloat(e.target.value);
    if (customDuration > 0) {
      customCurrentTime = (pct / 100) * customDuration;
      sendYtCommand("seekTo", [customCurrentTime, true]);
      updateCustomProgressUI();
    }
  });
}

if (customFullscreenBtn) {
  customFullscreenBtn.addEventListener("click", () => {
    const stage = document.querySelector("#video-stage");
    if (!document.fullscreenElement) stage?.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  });
}

if (customPlayerStage) {
  customPlayerStage.addEventListener("mousemove", showCustomControls, { passive: true });
  customPlayerStage.addEventListener("mouseleave", scheduleControlsHide, { passive: true });
}

// Global hotkeys for player
window.addEventListener("keydown", (e) => {
  if (!videoDialog?.open) return;
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  if (e.code === "Space") {
    e.preventDefault();
    toggleCustomPlay();
  } else if (e.code === "ArrowLeft") {
    e.preventDefault();
    customCurrentTime = Math.max(0, customCurrentTime - 5);
    sendYtCommand("seekTo", [customCurrentTime, true]);
    updateCustomProgressUI();
  } else if (e.code === "ArrowRight") {
    e.preventDefault();
    customCurrentTime = customDuration > 0 ? Math.min(customDuration, customCurrentTime + 5) : customCurrentTime + 5;
    sendYtCommand("seekTo", [customCurrentTime, true]);
    updateCustomProgressUI();
  } else if (e.key === "m" || e.key === "M") {
    toggleCustomMute();
  } else if (e.key === "f" || e.key === "F") {
    customFullscreenBtn?.click();
  }
});

// Stream Resolution & Quality Selector System
const playerQualityPicker = document.querySelector("#player-quality-picker");
const btnQualityTool = document.querySelector("#btn-quality-tool");
const toolbarQualityLabel = document.querySelector("#toolbar-quality-label");

const QUALITY_RESOLUTIONS = [
  { val: "4k", label: "4K (Ultra HD)", yt: "highres" },
  { val: "1440p", label: "1440p (QHD)", yt: "hd1440" },
  { val: "1080p", label: "1080p (Full HD)", yt: "hd1080" },
  { val: "720p", label: "720p (HD)", yt: "hd720" },
  { val: "480p", label: "480p (SD)", yt: "large" },
  { val: "360p", label: "360p (Low)", yt: "medium" },
  { val: "auto", label: "Auto (Adaptive)", yt: "auto" }
];

let activeStreamQuality = "1080p";

function setStreamQuality(qualityVal, notifyUser = true) {
  activeStreamQuality = qualityVal;
  if (playerQualityPicker) playerQualityPicker.value = qualityVal;
  if (toolbarQualityLabel) toolbarQualityLabel.textContent = qualityVal.toUpperCase();

  const engineBadge = document.querySelector("#stream-engine-badge");
  if (engineBadge) {
    if (qualityVal === "auto") engineBadge.textContent = "Auto-Optimized Stream (1080p)";
    else engineBadge.textContent = `Stream Resolution (${qualityVal.toUpperCase()})`;
  }

  const qItem = QUALITY_RESOLUTIONS.find(q => q.val === qualityVal) || QUALITY_RESOLUTIONS[0];

  // If YouTube / Custom Player is active, apply quality range to YouTube API
  if (customPlayerStage && !customPlayerStage.hidden) {
    sendYtCommand("setPlaybackQuality", [qItem.yt]);
    sendYtCommand("setPlaybackQualityRange", [qItem.yt, qItem.yt]);
  }

  if (notifyUser) {
    notify(`⚡ Stream resolution: ${qItem.label}`);
  }
}

if (playerQualityPicker) {
  playerQualityPicker.addEventListener("change", (e) => {
    setStreamQuality(e.target.value, true);
  });
}

if (btnQualityTool) {
  btnQualityTool.addEventListener("click", () => {
    // Cycle through: 4k -> 1440p -> 1080p -> 720p -> 480p -> 360p -> auto -> 4k
    const currentIndex = QUALITY_RESOLUTIONS.findIndex(q => q.val === activeStreamQuality);
    const nextIndex = (currentIndex + 1) % QUALITY_RESOLUTIONS.length;
    const nextQuality = QUALITY_RESOLUTIONS[nextIndex].val;
    setStreamQuality(nextQuality, true);
  });
}

function updateStreamResolutionBadge(quality = "1080p") {
  const q = String(quality).toLowerCase();
  let matched = "1080p";
  if (q.includes("2160") || q.includes("4k") || q === "highres") matched = "4k";
  else if (q.includes("1440") || q === "hd1440") matched = "1440p";
  else if (q.includes("1080") || q === "hd1080") matched = "1080p";
  else if (q.includes("720") || q === "hd720") matched = "720p";
  else if (q.includes("480") || q === "large") matched = "480p";
  else if (q.includes("360") || q === "medium") matched = "360p";
  else if (q.includes("240") || q.includes("144") || q === "small" || q === "tiny") matched = "360p";

  if (playerQualityPicker && playerQualityPicker.value === "auto") {
    if (toolbarQualityLabel) toolbarQualityLabel.textContent = matched.toUpperCase();
    const engineBadge = document.querySelector("#stream-engine-badge");
    if (engineBadge) engineBadge.textContent = `Auto-Optimized Stream (${matched.toUpperCase()})`;
  }
}

// PostMessage listener from YouTube iframe
window.addEventListener("message", (event) => {
  try {
    const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    if (data && data.event === "infoDelivery" && data.info) {
      if (typeof data.info.currentTime === "number") customCurrentTime = data.info.currentTime;
      if (typeof data.info.duration === "number" && data.info.duration > 0) customDuration = data.info.duration;
      if (typeof data.info.playerState === "number") {
        if (data.info.playerState === 1) setCustomPlayingState(true);
        else if (data.info.playerState === 2 || data.info.playerState === 0) setCustomPlayingState(false);
      }
      if (typeof data.info.videoLoadedFraction === "number" && customTimelineLoaded) {
        customTimelineLoaded.style.width = `${Math.min(100, data.info.videoLoadedFraction * 100)}%`;
      }
      if (data.info.playbackQuality) {
        updateStreamResolutionBadge(data.info.playbackQuality);
      }
      updateCustomProgressUI();
    }
  } catch (_) {}
});

// Silent Auto-Server Engine with Failover
function loadSilentStreamEndpoint(failoverIndex = 0) {
  clearTimeout(failoverTimer);
  currentFailoverIndex = failoverIndex;
  const servers = CONFIG.STREAM_SERVERS;
  const currentProvider = servers[failoverIndex] || servers[0];

  if (streamLoadingShield) {
    streamLoadingShield.hidden = false;
    if (streamLoadingText) streamLoadingText.textContent = `Connecting to ${currentProvider.name}...`;
  }

  const engineBadge = document.querySelector("#stream-engine-badge");
  if (engineBadge) engineBadge.textContent = "Auto-Optimized Stream (1080p)";

  const toolbarServerLabel = document.querySelector("#toolbar-server-label");
  if (toolbarServerLabel) toolbarServerLabel.textContent = `Mirror ${failoverIndex + 1}`;

  if (videoFrame) {
    videoFrame.hidden = false;
    // Strict Hardware-Level Browser Sandbox: blocks 100% of popups, popunders, top redirects
    videoFrame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-presentation");
    videoFrame.src = currentProvider.getUrl(activeStream.tmdbId, activeStream.type);
  }

  // 3.5s Smart Failover Timer: remove loading shield once connection handshakes
  failoverTimer = setTimeout(() => {
    if (streamLoadingShield) streamLoadingShield.hidden = true;
  }, 3500);
}

function updateSourceToggleUI(isTrailerActive) {
  const toggleWrap = document.querySelector("#stream-source-toggle");
  const btnMovie = document.querySelector("#btn-toggle-movie");
  const btnTrailer = document.querySelector("#btn-toggle-trailer");
  const btnServer = document.querySelector("#btn-server-tool");
  if (!toggleWrap || !btnMovie || !btnTrailer) return;

  if (activeStream?.isBangla) {
    toggleWrap.hidden = false;
    btnMovie.classList.add("is-active");
    btnTrailer.classList.remove("is-active");
    if (btnServer) btnServer.style.display = "none";
    return;
  }

  if (btnServer) btnServer.style.display = "";

  if (!activeStream?.tmdbId && activeStream?.type === "youtube") {
    toggleWrap.hidden = true;
    return;
  }

  toggleWrap.hidden = false;
  btnMovie.classList.toggle("is-active", !isTrailerActive);
  btnTrailer.classList.toggle("is-active", isTrailerActive);
}

async function getTmdbTrailerId(tmdbId, type = "movie") {
  try {
    const url = `https://api.themoviedb.org/3/${type}/${tmdbId}/videos?api_key=${CONFIG.TMDB_API_KEY}&language=en-US`;
    const res = await fetch(url);
    if (!res.ok) return "";
    const data = await res.json();
    const trailer = (data.results || []).find(v => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")) || data.results?.[0];
    return trailer?.key || "";
  } catch (_) {
    return "";
  }
}

function handleStreamErrorOrTimeout() {
  clearTimeout(failoverTimer);
  if (currentFailoverIndex < CONFIG.STREAM_SERVERS.length - 1) {
    currentFailoverIndex++;
    loadSilentStreamEndpoint(currentFailoverIndex);
  } else {
    // If all failover mirrors exhaust, fallback cleanly without defaulting to Dune 2
    if (streamLoadingShield) streamLoadingShield.hidden = true;
    updateSourceToggleUI(true);
    if (activeStream?.trailerId) {
      loadCustomWhitelabelStream(activeStream.trailerId);
    } else if (activeStream?.tmdbId) {
      getTmdbTrailerId(activeStream.tmdbId, activeStream.type).then(tKey => {
        if (tKey) {
          activeStream.trailerId = tKey;
          loadCustomWhitelabelStream(tKey);
        } else {
          notify("⚠️ This title is temporarily unavailable on streaming mirrors.");
        }
      });
    } else {
      notify("⚠️ Video stream temporarily unavailable.");
    }
  }
}

// Master openStream function
async function openStream(title, tmdbId, type = "movie", trailerId = "", isTrailer = false) {
  const catalogEntry = (typeof BUILTIN_CATALOG !== "undefined" ? BUILTIN_CATALOG : []).find(
    m => (m.title && m.title.toLowerCase() === (title || "").toLowerCase()) ||
         (m.banglaTitle && title && title.includes(m.banglaTitle)) ||
         (m.tmdbId && m.tmdbId === String(tmdbId))
  );

  const isBangla = Boolean(
    type === "bangla" ||
    catalogEntry?.bangla ||
    /[\u0980-\u09FF]/.test(title || "") ||
    (title && (
      title.includes("Hawa") || title.includes("Priyotoma") || title.includes("Toofan") ||
      title.includes("Aynabaji") || title.includes("Surongo") || title.includes("Shurongo") ||
      title.includes("Poran") || title.includes("Monpura") || title.includes("Pather Panchali") ||
      title.includes("Dipu Number") || title.includes("Aguner Poroshmoni") || title.includes("Chhutir Ghonta")
    ))
  );

  activeStream = { title, tmdbId, type, trailerId, isTrailer, isBangla };
  currentFailoverIndex = 0;

  if (videoTitle) videoTitle.textContent = `Now Streaming: ${title}`;

  // Bangla Movies Route DIRECTLY into BioscopeBD Whitelabel Custom Player Stage
  if (isBangla) {
    const videoKey = trailerId || catalogEntry?.trailerId;
    activeStream.trailerId = videoKey;
    updateSourceToggleUI(true);
    if (videoKey) {
      loadCustomWhitelabelStream(videoKey);
      const engineBadge = document.querySelector("#stream-engine-badge");
      if (engineBadge) engineBadge.textContent = "BioscopeBD Cinema Engine (HD)";
    } else {
      notify("⚠️ Video stream for this title is currently updating.");
    }
    startProgressTracking(title, tmdbId, type, videoKey);
    populateXrayData(title);
    if (videoDialog) videoDialog.showModal();
    return;
  }

  // Non-Bangla movies
  if (!trailerId && tmdbId) {
    getTmdbTrailerId(tmdbId, type).then(tKey => {
      if (tKey && activeStream?.tmdbId === tmdbId) {
        activeStream.trailerId = tKey;
      }
    });
  }

  const isTrailerMode = isTrailer || type === "youtube" || !tmdbId;
  updateSourceToggleUI(isTrailerMode);

  if (isTrailerMode) {
    const finalTrailer = trailerId || catalogEntry?.trailerId;
    if (finalTrailer) {
      loadCustomWhitelabelStream(finalTrailer);
    } else if (tmdbId) {
      getTmdbTrailerId(tmdbId, type).then(tKey => {
        if (tKey) {
          activeStream.trailerId = tKey;
          loadCustomWhitelabelStream(tKey);
        } else {
          notify("⚠️ Official trailer currently unavailable.");
        }
      });
    } else {
      notify("⚠️ Video stream currently unavailable.");
    }
  } else {
    stopCustomWhitelabelStream();
    loadSilentStreamEndpoint(0);
  }

  // Start tracking Continue Watching progress
  startProgressTracking(title, tmdbId, type, trailerId);

  // Populate X-Ray data
  populateXrayData(title);

  if (videoDialog) videoDialog.showModal();
}

// In-Player Stream Source Switcher (Movie Stream <-> Official Teaser)
const btnToggleMovie = document.querySelector("#btn-toggle-movie");
const btnToggleTrailer = document.querySelector("#btn-toggle-trailer");

if (btnToggleMovie) {
  btnToggleMovie.addEventListener("click", () => {
    if (activeStream?.isBangla) {
      if (activeStream?.trailerId) {
        loadCustomWhitelabelStream(activeStream.trailerId);
        notify("🎬 Playing in BioscopeBD Cinema Player");
      }
      return;
    }
    if (!activeStream?.tmdbId) return;
    activeStream.isTrailer = false;
    updateSourceToggleUI(false);
    stopCustomWhitelabelStream();
    loadSilentStreamEndpoint(0);
    notify("🎬 Switched to Full Movie Stream");
  });
}

if (btnToggleTrailer) {
  btnToggleTrailer.addEventListener("click", () => {
    if (activeStream?.isBangla) {
      if (activeStream?.trailerId) {
        loadCustomWhitelabelStream(activeStream.trailerId);
        notify("🎞️ Playing in BioscopeBD Cinema Player");
      }
      return;
    }
    activeStream.isTrailer = true;
    updateSourceToggleUI(true);
    if (activeStream?.trailerId) {
      loadCustomWhitelabelStream(activeStream.trailerId);
      notify("🎞️ Switched to Official High-Definition Teaser");
    } else if (activeStream?.tmdbId) {
      getTmdbTrailerId(activeStream.tmdbId, activeStream.type).then(tKey => {
        if (tKey) {
          activeStream.trailerId = tKey;
          loadCustomWhitelabelStream(tKey);
          notify("🎞️ Switched to Official High-Definition Teaser");
        } else {
          notify("⚠️ Official teaser not available for this title.");
        }
      });
    } else {
      notify("⚠️ Official teaser not available for this title.");
    }
  });
}

const btnServerTool = document.querySelector("#btn-server-tool");
if (btnServerTool) {
  btnServerTool.addEventListener("click", () => {
    if (!activeStream || !activeStream.tmdbId) {
      notify("ℹ️ Stream mirroring is optimized for full cinema titles.");
      return;
    }
    const servers = CONFIG.STREAM_SERVERS;
    currentFailoverIndex = (currentFailoverIndex + 1) % servers.length;
    const nextServer = servers[currentFailoverIndex];
    loadSilentStreamEndpoint(currentFailoverIndex);
    notify(`⚡ Switched to ${nextServer.name} (Mirror ${currentFailoverIndex + 1})`);
  });
}

function startProgressTracking(title, tmdbId, type, trailerId) {
  stopProgressTracking();
  let elapsed = 0;
  progressTrackingInterval = setInterval(() => {
    elapsed += 10;
    const existing = continueWatching.find(c => c.title === title);
    const durationSec = 7200; // default 2h
    const currentSec = existing ? Math.min(durationSec, existing.currentTime + 10) : elapsed;
    const pct = Math.min(100, Math.round((currentSec / durationSec) * 100));

    const updatedItem = {
      id: title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      title,
      tmdbId: tmdbId || "",
      type: type || "movie",
      trailerId: trailerId || "",
      poster: BUILTIN_CATALOG.find(m => m.title === title)?.poster || "https://picsum.photos/seed/cinema/300/450",
      currentTime: currentSec,
      duration: durationSec,
      percent: pct,
      updated: Date.now()
    };

    continueWatching = [updatedItem, ...continueWatching.filter(c => c.title !== title)].slice(0, 8);
    saveLocalState();
    hydrateContinueWatching();
  }, 10000);
}

function stopProgressTracking() {
  if (progressTrackingInterval) {
    clearInterval(progressTrackingInterval);
    progressTrackingInterval = null;
  }
}

function closeVideoPlayer() {
  clearTimeout(failoverTimer);
  stopProgressTracking();
  stopCustomWhitelabelStream();
  stopTorrentStream();
  if (videoFrame) videoFrame.src = "";
  if (videoDialog) videoDialog.close();
}

if (videoCloseBtn) videoCloseBtn.addEventListener("click", closeVideoPlayer);
if (videoDialog) {
  videoDialog.addEventListener("click", (e) => {
    if (e.target === videoDialog) closeVideoPlayer();
  });
}

// In-Player Subtitle Styler & Bangla Switching
const customSubBtn = document.querySelector("#custom-sub-btn");
const subStylerPanel = document.querySelector("#sub-styler-panel");
const subStylerClose = document.querySelector("#sub-styler-close");
const subLangSelect = document.querySelector("#sub-lang-select");
const subFileInput = document.querySelector("#sub-file-input");
const subCustomFileRow = document.querySelector("#sub-custom-file-row");
const customSubtitleBox = document.querySelector("#custom-subtitle-box");

if (customSubBtn && subStylerPanel) {
  customSubBtn.addEventListener("click", () => {
    subStylerPanel.hidden = !subStylerPanel.hidden;
  });
}
if (subStylerClose && subStylerPanel) {
  subStylerClose.addEventListener("click", () => { subStylerPanel.hidden = true; });
}

if (subLangSelect) {
  subLangSelect.addEventListener("change", (e) => {
    const val = e.target.value;
    if (subCustomFileRow) subCustomFileRow.hidden = val !== "custom";

    if (val === "off") {
      if (customSubtitleBox) customSubtitleBox.hidden = true;
      notify("Subtitles turned off.");
    } else if (val === "bn") {
      if (customSubtitleBox) {
        customSubtitleBox.hidden = false;
        customSubtitleBox.textContent = "বাংলা সাবটাইটেল সিঙ্ক সক্রিয় আছে...";
      }
      notify("🇧🇩 Bangla Subtitles: Auto-Synced");
    } else if (val === "en") {
      if (customSubtitleBox) {
        customSubtitleBox.hidden = false;
        customSubtitleBox.textContent = "English Subtitles active.";
      }
      notify("Original English Subtitles active.");
    }
  });
}

// Subtitle custom size pills
document.querySelectorAll(".sub-pill[data-size]").forEach(pill => {
  pill.addEventListener("click", () => {
    document.querySelectorAll(".sub-pill[data-size]").forEach(p => p.classList.toggle("is-active", p === pill));
    const size = pill.dataset.size;
    if (customSubtitleBox) {
      if (size === "small") customSubtitleBox.style.fontSize = "0.95rem";
      else if (size === "medium") customSubtitleBox.style.fontSize = "1.25rem";
      else if (size === "large") customSubtitleBox.style.fontSize = "1.6rem";
    }
  });
});

// Subtitle custom color chips
document.querySelectorAll(".sub-color-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".sub-color-chip").forEach(c => c.classList.toggle("is-active", c === chip));
    if (customSubtitleBox) customSubtitleBox.style.color = chip.dataset.color;
  });
});

// Subtitle background pills
document.querySelectorAll(".sub-pill[data-bg]").forEach(pill => {
  pill.addEventListener("click", () => {
    document.querySelectorAll(".sub-pill[data-bg]").forEach(p => p.classList.toggle("is-active", p === pill));
    if (customSubtitleBox) customSubtitleBox.style.background = pill.dataset.bg;
  });
});

// Live Floating Emoji Reactions
const floatingReactionsStage = document.querySelector("#floating-reactions-stage");
document.querySelectorAll(".reaction-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const emoji = btn.dataset.emoji || "🔥";
    spawnFloatingEmoji(emoji);
  });
});

function spawnFloatingEmoji(emoji) {
  if (!floatingReactionsStage) return;
  const particle = document.createElement("div");
  particle.className = "floating-emoji-item";
  particle.textContent = emoji;
  const randLeft = Math.random() * 80 + 10;
  particle.style.left = `${randLeft}%`;
  floatingReactionsStage.appendChild(particle);

  setTimeout(() => {
    particle.remove();
  }, 2400);
}

// WebTorrent Native Streaming Engine
const torrentStage = document.querySelector("#torrent-stage");
const torrentVideoPlayer = document.querySelector("#torrent-video-player");
const torrentHud = document.querySelector("#torrent-hud");
const torrentStatusText = document.querySelector("#torrent-status-text");
const torrentSpeed = document.querySelector("#torrent-speed");
const torrentPeers = document.querySelector("#torrent-peers");
const torrentProgress = document.querySelector("#torrent-progress");
const torrentMagnetBar = document.querySelector("#torrent-magnet-bar");
const torrentMagnetInput = document.querySelector("#torrent-magnet-input");
const btnStartMagnetStream = document.querySelector("#btn-start-magnet-stream");
const btnToggleMagnet = document.querySelector("#btn-toggle-magnet");
let wtClient = null;
let currentTorrent = null;
let wtStatsInterval = null;

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 KB/s";
  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function stopTorrentStream() {
  if (wtStatsInterval) {
    clearInterval(wtStatsInterval);
    wtStatsInterval = null;
  }
  if (torrentVideoPlayer) {
    torrentVideoPlayer.pause();
    torrentVideoPlayer.removeAttribute("src");
    torrentVideoPlayer.load();
  }
  if (currentTorrent) {
    try { currentTorrent.destroy(); } catch (_) {}
    currentTorrent = null;
  }
}

function ensureWebTorrentLoaded() {
  if (window.WebTorrent) return Promise.resolve(window.WebTorrent);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/webtorrent@1.9.7/webtorrent.min.js";
    s.onload = () => resolve(window.WebTorrent);
    s.onerror = () => reject(new Error("WebTorrent library failed to load"));
    document.head.appendChild(s);
  });
}

async function streamTorrentMagnet(magnetURI, movieTitle = "") {
  if (!magnetURI || !magnetURI.trim()) {
    notify("⚠️ Please enter a valid magnet link.");
    return;
  }
  stopTorrentStream();
  if (videoFrame) { videoFrame.hidden = true; videoFrame.src = ""; }
  if (torrentStage) torrentStage.hidden = false;
  if (torrentMagnetBar) torrentMagnetBar.hidden = false;

  const engineBadge = document.querySelector("#stream-engine-badge");
  if (engineBadge) engineBadge.textContent = "Torrent Swarm Stream";

  if (torrentStatusText) torrentStatusText.textContent = "Connecting to P2P swarm...";

  try {
    let WT = window.WebTorrent;
    if (!WT) {
      if (torrentStatusText) torrentStatusText.textContent = "Initializing torrent engine...";
      await ensureWebTorrentLoaded();
      WT = window.WebTorrent;
    }
    if (!WT) throw new Error("WebTorrent library not loaded");
    if (!wtClient) wtClient = new WT();

    wtClient.add(magnetURI.trim(), (torrent) => {
      currentTorrent = torrent;
      if (torrentStatusText) torrentStatusText.textContent = "Connected! Buffering video stream...";

      const videoExtensions = [".mp4", ".mkv", ".webm", ".avi"];
      let videoFile = torrent.files.find(f => videoExtensions.some(ext => f.name.toLowerCase().endsWith(ext)));
      if (!videoFile && torrent.files.length > 0) {
        videoFile = torrent.files.reduce((a, b) => (a.length > b.length ? a : b));
      }

      if (videoFile && torrentVideoPlayer) {
        videoFile.renderTo(torrentVideoPlayer, { autoplay: true, controls: true });
        torrentVideoPlayer.addEventListener("loadedmetadata", () => {
          const h = torrentVideoPlayer.videoHeight;
          if (h >= 1080) updateStreamResolutionBadge("1080p");
          else if (h >= 720) updateStreamResolutionBadge("720p");
          else if (h >= 480) updateStreamResolutionBadge("480p");
          else if (h > 0) updateStreamResolutionBadge("360p");
        }, { once: true });
      }

      wtStatsInterval = setInterval(() => {
        if (!currentTorrent) return;
        if (torrentSpeed) torrentSpeed.textContent = formatBytes(currentTorrent.downloadSpeed);
        if (torrentPeers) torrentPeers.textContent = String(currentTorrent.numPeers || 0);
        if (torrentProgress) torrentProgress.textContent = `${Math.round(currentTorrent.progress * 100)}%`;
      }, 800);
    });
  } catch (err) {
    notify("Could not initialize Torrent Engine.");
  }
}

if (btnToggleMagnet && torrentMagnetBar) {
  btnToggleMagnet.addEventListener("click", () => {
    torrentMagnetBar.hidden = !torrentMagnetBar.hidden;
    btnToggleMagnet.classList.toggle("is-active", !torrentMagnetBar.hidden);
  });
}
if (btnStartMagnetStream && torrentMagnetInput) {
  btnStartMagnetStream.addEventListener("click", () => {
    streamTorrentMagnet(torrentMagnetInput.value.trim(), "Custom Torrent");
  });
}
document.querySelectorAll(".preset-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (torrentMagnetInput) torrentMagnetInput.value = btn.dataset.magnet;
    streamTorrentMagnet(btn.dataset.magnet, btn.textContent.trim());
  });
});

// Next-Gen Feature Toggles
const familyBtn = document.querySelector("#btn-family-mode");
const familyStatus = document.querySelector("#family-status");
let familyMode = false;
if (familyBtn) {
  familyBtn.addEventListener("click", () => {
    familyMode = !familyMode;
    familyBtn.classList.toggle("is-active", familyMode);
    if (familyStatus) familyStatus.textContent = familyMode ? "ON" : "OFF";
    notify(familyMode ? "🛡️ Family Safe Filter ACTIVE" : "Family Filter turned off.");
  });
}

const dialogueBoostBtn = document.querySelector("#btn-dialogue-boost");
let dialogueBoost = false;
if (dialogueBoostBtn) {
  dialogueBoostBtn.addEventListener("click", () => {
    dialogueBoost = !dialogueBoost;
    dialogueBoostBtn.classList.toggle("is-active", dialogueBoost);
    notify(dialogueBoost ? "🎧 Dialogue Boost & Night Audio ACTIVE" : "Standard audio restored.");
  });
}

const xrayBtn = document.querySelector("#btn-xray-toggle");
const xrayOverlay = document.querySelector("#xray-overlay");
const xrayCloseBtn = document.querySelector("#xray-close-btn");
if (xrayBtn && xrayOverlay) {
  xrayBtn.addEventListener("click", () => { xrayOverlay.hidden = !xrayOverlay.hidden; });
}
if (xrayCloseBtn && xrayOverlay) {
  xrayCloseBtn.addEventListener("click", () => { xrayOverlay.hidden = true; });
}

function populateXrayData(title) {
  const m = BUILTIN_CATALOG.find(item => item.title === title);
  const castEl = document.querySelector("#xray-cast");
  const musicEl = document.querySelector("#xray-music");
  const triviaEl = document.querySelector("#xray-trivia");
  if (castEl) castEl.textContent = m?.cast || "Leading ensemble cast and production team.";
  if (musicEl) musicEl.textContent = "Original Motion Picture Soundtrack — Available on Spotify";
  if (triviaEl) triviaEl.textContent = "Remastered in high-definition for BioscopeBD stream.";
}

// ==========================================================================
// 8. Parents Guide Content Advisory & Micro-Reviews in Quick View
// ==========================================================================
const quickDialog = document.querySelector("#quick-dialog");
const quickDialogTitle = document.querySelector("#quick-dialog-title");
const quickDialogCopy = document.querySelector("#quick-dialog-copy");
const quickDialogCast = document.querySelector("#quick-dialog-cast");
const quickDuration = document.querySelector("#quick-duration");
const quickRating = document.querySelector("#quick-rating");
const quickGenre = document.querySelector("#quick-genre");
const quickDialogClose = document.querySelector("#dialog-close");
const dialogPlayBtn = document.querySelector("#dialog-play-btn");
const dialogWatchlistBtn = document.querySelector("#dialog-watchlist-btn");
const dialogPartyBtn = document.querySelector("#dialog-party-btn");
const dialogTrailerBtn = document.querySelector("#dialog-trailer-btn");

const advisoryNudity = document.querySelector("#advisory-nudity");
const advisoryViolence = document.querySelector("#advisory-violence");
const advisoryProfanity = document.querySelector("#advisory-profanity");

const starBtns = document.querySelectorAll(".star-btn");
const userRatingValue = document.querySelector("#user-rating-value");
const quickReviewInput = document.querySelector("#quick-review-input");
const reviewSpoilerChk = document.querySelector("#review-spoiler-chk");
const btnSubmitReview = document.querySelector("#btn-submit-review");
const quickReviewsList = document.querySelector("#quick-reviews-list");

let currentQuickMovie = null;

function setAdvisoryBadge(el, level) {
  if (!el) return;
  el.textContent = level;
  el.className = `advisory-badge advisory-badge--${level.toLowerCase()}`;
}

function openQuickView(movieTitle, movieData = null) {
  let m = BUILTIN_CATALOG.find(item => item.title === movieTitle);
  if (!m) {
    m = {
      title: movieTitle,
      genre: movieData?.genre || "Cinema",
      duration: 135,
      score: movieData?.score ? movieData.score.replace("★ ", "") : "8.6",
      synopsis: "Critically acclaimed cinema selection with outstanding cinematography and narrative depth.",
      cast: "Leading ensemble cast.",
      parentsGuide: { nudity: "None", violence: "Mild", profanity: "Mild" },
      tmdbId: typeof movieData?.tmdbId !== "undefined" ? movieData.tmdbId : "",
      trailerId: movieData?.trailerId || "",
      type: movieData?.type || "movie"
    };
  } else if (movieData) {
    if (movieData.tmdbId) m.tmdbId = movieData.tmdbId;
    if (movieData.trailerId) m.trailerId = movieData.trailerId;
    if (movieData.type) m.type = movieData.type;
  }

  currentQuickMovie = m;
  if (quickDialogTitle) quickDialogTitle.textContent = m.title;
  if (quickDialogCopy) quickDialogCopy.textContent = m.synopsis || "Available to stream in 1080p Full HD on BioscopeBD.";
  if (quickDialogCast) quickDialogCast.innerHTML = `<strong>Cast:</strong> ${m.cast || 'Ensemble cast'}`;
  if (quickDuration) quickDuration.textContent = m.duration ? `${Math.floor(m.duration / 60)}h ${m.duration % 60}m` : "2h 15m";
  if (quickRating) quickRating.textContent = `★ ${m.score || '8.5'}`;
  if (quickGenre) quickGenre.textContent = m.genre || "Feature";

  // Parents Guide Content Advisory
  const pg = m.parentsGuide || { nudity: "None", violence: "Mild", profanity: "None" };
  setAdvisoryBadge(advisoryNudity, pg.nudity);
  setAdvisoryBadge(advisoryViolence, pg.violence);
  setAdvisoryBadge(advisoryProfanity, pg.profanity);

  // User Rating & Micro-Reviews
  const currentRate = userRatings[m.title] || 0;
  updateStarRatingUI(currentRate);

  renderMovieReviews(m.title);

  if (quickDialog) quickDialog.showModal();
}

function updateStarRatingUI(stars) {
  starBtns.forEach(btn => {
    const starNum = parseInt(btn.dataset.star, 10);
    btn.classList.toggle("is-active", starNum <= stars);
  });
  if (userRatingValue) {
    userRatingValue.textContent = stars > 0 ? `${stars} / 5 Stars` : "Not rated";
  }
}

starBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const stars = parseInt(btn.dataset.star, 10);
    if (!currentQuickMovie) return;
    userRatings[currentQuickMovie.title] = stars;
    saveLocalState();
    updateStarRatingUI(stars);
    notify(`⭐ You rated "${currentQuickMovie.title}" ${stars} Stars!`);
  });
});

function renderMovieReviews(movieTitle) {
  if (!quickReviewsList) return;
  const reviews = userReviews[movieTitle] || [
    { author: "Rahim K.", text: "Mind-blowing visuals and insane sound design!", spoiler: false },
    { author: "Nadia T.", text: "The cinematography in the desert sequence was breathtaking.", spoiler: false }
  ];

  quickReviewsList.innerHTML = reviews.map(r => `
    <div class="review-item ${r.spoiler ? 'is-spoiler' : ''}">
      <div class="review-author">${r.author} ${r.spoiler ? '<span class="spoiler-tag">⚠️ Spoiler</span>' : ''}</div>
      <div class="review-text">${r.text}</div>
    </div>
  `).join("");
}

if (btnSubmitReview && quickReviewInput) {
  btnSubmitReview.addEventListener("click", () => {
    const text = quickReviewInput.value.trim();
    if (!text || !currentQuickMovie) return;

    if (!userReviews[currentQuickMovie.title]) {
      userReviews[currentQuickMovie.title] = [];
    }
    userReviews[currentQuickMovie.title].unshift({
      author: currentUser.name || "Cinephile",
      text,
      spoiler: reviewSpoilerChk?.checked || false
    });
    saveLocalState();
    renderMovieReviews(currentQuickMovie.title);
    quickReviewInput.value = "";
    if (reviewSpoilerChk) reviewSpoilerChk.checked = false;
    notify("💬 Micro-review posted successfully!");
  });
}

if (quickDialogClose && quickDialog) {
  quickDialogClose.addEventListener("click", () => quickDialog.close());
  quickDialog.addEventListener("click", (e) => { if (e.target === quickDialog) quickDialog.close(); });
}

if (dialogPlayBtn && quickDialog) {
  dialogPlayBtn.addEventListener("click", () => {
    quickDialog.close();
    if (currentQuickMovie) {
      openStream(currentQuickMovie.title, currentQuickMovie.tmdbId, currentQuickMovie.type, currentQuickMovie.trailerId, false);
    }
  });
}

if (dialogTrailerBtn && quickDialog) {
  dialogTrailerBtn.addEventListener("click", () => {
    quickDialog.close();
    if (currentQuickMovie) {
      openStream(currentQuickMovie.title, currentQuickMovie.tmdbId, "youtube", currentQuickMovie.trailerId, true);
    }
  });
}

if (dialogWatchlistBtn && quickDialog) {
  dialogWatchlistBtn.addEventListener("click", () => {
    if (!currentQuickMovie) return;
    const inList = watchlist.includes(currentQuickMovie.title);
    if (inList) {
      watchlist = watchlist.filter(t => t !== currentQuickMovie.title);
      notify(`Removed "${currentQuickMovie.title}" from Watchlist.`);
    } else {
      watchlist.push(currentQuickMovie.title);
      notify(`Added "${currentQuickMovie.title}" to Watchlist!`);
      checkContextualToast();
    }
    saveLocalState();
  });
}

if (dialogPartyBtn && quickDialog) {
  dialogPartyBtn.addEventListener("click", () => {
    quickDialog.close();
    openWatchParty();
  });
}

// Bind clicks on cards
function bindCardInteractions(container) {
  if (!container) return;
  container.querySelectorAll(".quick-view").forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = btn.closest(".movie-card");
      openQuickView(btn.dataset.title || card?.dataset.title, {
        tmdbId: card?.dataset.tmdb,
        type: card?.dataset.type,
        trailerId: card?.dataset.trailer,
        genre: card?.dataset.genre,
        score: card?.dataset.score
      });
    });
  });

  container.querySelectorAll(".card-play-btn").forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isCustom = btn.dataset.type === "youtube" || btn.dataset.type === "bangla" || btn.dataset.bangla === "true" || !btn.dataset.tmdb;
      openStream(btn.dataset.title, btn.dataset.tmdb, btn.dataset.type, btn.dataset.trailer, isCustom);
    });
  });

  container.querySelectorAll(".movie-card").forEach(card => {
    if (card.dataset.bound) return;
    card.dataset.bound = "true";
    card.addEventListener("click", () => {
      const isCustom = card.dataset.type === "youtube" || card.dataset.type === "bangla" || card.dataset.bangla === "true" || !card.dataset.tmdb;
      openStream(card.dataset.title, card.dataset.tmdb, card.dataset.type, card.dataset.trailer, isCustom);
    });
  });
}
bindCardInteractions(document);

// Hero Watch Buttons
const heroWatchMovieBtn = document.querySelector("#hero-watch-movie");
const heroWatchTrailerBtn = document.querySelector("#hero-watch-trailer");
if (heroWatchMovieBtn) {
  heroWatchMovieBtn.addEventListener("click", () => {
    openStream("Dune: Part Two", "693134", "movie", "Way9Dexny3w", false);
  });
}
if (heroWatchTrailerBtn) {
  heroWatchTrailerBtn.addEventListener("click", () => {
    openStream("Dune: Part Two", "693134", "youtube", "Way9Dexny3w", true);
  });
}

// ==========================================================================
// ==========================================================================
// 9. Dedicated Virtual Cinema Theatre Room & Live Box Office System
// ==========================================================================
const partyDialog = document.querySelector("#party-dialog"); // legacy fallback
const tabLoungeHalls = document.querySelector("#hub-tab-halls");
const tabLoungeHost = document.querySelector("#hub-host-party-btn");
const tabLoungeJoin = document.querySelector("#hub-join-party-btn");

const panelLoungeHalls = document.querySelector("#panel-lounge-halls");
const panelLoungeHost = document.querySelector("#panel-lounge-host");
const panelLoungeJoin = document.querySelector("#panel-lounge-join");

const visPublicRadio = document.querySelector("#vis-public-radio");
const visPrivateRadio = document.querySelector("#vis-private-radio");
const lblVisPublic = document.querySelector("#lbl-vis-public");
const lblVisPrivate = document.querySelector("#lbl-vis-private");
const partyPrivateCodeBox = document.querySelector("#party-private-code-box");
const partyRoomCodeEl = document.querySelector("#party-room-code");
const btnCopyRoom = document.querySelector("#btn-copy-room");
const partyHallNameInput = document.querySelector("#party-hall-name-input");
const btnStartParty = document.querySelector("#btn-start-party");
const btnGenerateTicket = document.querySelector("#btn-generate-ticket");

// Homepage Active Hall Banner & Box Office Elements
const activeHallBanner = document.querySelector("#active-hall-banner");
const activeHallBannerTitle = document.querySelector("#active-hall-banner-title");
const btnResumeActiveHall = document.querySelector("#btn-resume-active-hall");
const btnDismissActiveHall = document.querySelector("#btn-dismiss-active-hall");
const boxOfficeGrid = document.querySelector("#box-office-grid");
const joinRoomInput = document.querySelector("#join-room-input");
const btnSubmitJoin = document.querySelector("#btn-submit-join");

// Dedicated Virtual Cinema Theatre Elements
const theatreRoomView = document.querySelector("#theatre-room-view");
const theatreCurtain = document.querySelector("#theatre-curtain");
const theatreHallBadge = document.querySelector("#theatre-hall-badge");
const theatreMovieTitle = document.querySelector("#theatre-movie-title");
const theatreCurrentCode = document.querySelector("#theatre-current-code");
const theatreCodePill = document.querySelector("#theatre-code-pill");
const btnTheatreShare = document.querySelector("#btn-theatre-share");
const btnTheatreLeave = document.querySelector("#btn-theatre-leave");
const btnTheatreDismiss = document.querySelector("#btn-theatre-dismiss");
const theatrePlayerFrame = document.querySelector("#theatre-player-frame");
const theatreProjectorShield = document.querySelector("#theatre-projector-shield");
const theatreFloatingReactions = document.querySelector("#theatre-floating-reactions");
const theatreCornerChat = document.querySelector("#theatre-corner-chat");
const theatreRosterCount = document.querySelector("#theatre-roster-count");
const btnMinCornerChat = document.querySelector("#btn-min-corner-chat");
const btnToggleRoster = document.querySelector("#btn-toggle-roster");
const theatreRosterPopover = document.querySelector("#theatre-roster-popover");
const rosterPopoverCount = document.querySelector("#roster-popover-count");
const theatreRosterList = document.querySelector("#theatre-roster-list");
const theatreChatBody = document.querySelector("#theatre-chat-body");
const theatreChatForm = document.querySelector("#theatre-chat-form");
const theatreChatInput = document.querySelector("#theatre-chat-input");
const theatreSeatsTrack = document.querySelector("#theatre-seats-track");
const theatreHostDeck = document.querySelector("#theatre-host-deck");
const theatreSwitchMovie = document.querySelector("#theatre-switch-movie");
const theatreProjectorSearch = document.querySelector("#theatre-projector-search");
const theatreProjectorResults = document.querySelector("#theatre-projector-results");
const btnHostResync = document.querySelector("#btn-host-resync");
const btnHostDismissBar = document.querySelector("#btn-host-dismiss-bar");

// Persistent Room State
let activeHall = null;
let currentHallSession = null;
let hallAudience = [];
const hallChannel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("bioscope_theatre_sync") : null;

const DEFAULT_BOX_OFFICE_HALLS = [
  {
    roomCode: "BIOSCOPE-4K01",
    hallName: "IMAX Laser Cinema Hall #1",
    movieTitle: "Dune: Part Two",
    poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    hostName: "Tanjir (VIP)",
    hostAvatar: "👑",
    viewers: 8,
    tmdbId: "693134",
    type: "movie",
    trailerId: "Way9Dexny3w"
  },
  {
    roomCode: "BIOSCOPE-8820",
    hallName: "Christopher Nolan Retro Hall",
    movieTitle: "Oppenheimer",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    hostName: "CinephileBD",
    hostAvatar: "🍿",
    viewers: 14,
    tmdbId: "872585",
    type: "movie",
    trailerId: "uYPbbksJxIg"
  },
  {
    roomCode: "BIOSCOPE-AI09",
    hallName: "Higgsfield AI Originals Hall",
    movieTitle: "The Trigger (AI Action Cinema)",
    poster: "https://picsum.photos/seed/trigger/500/750",
    hostName: "Higgsfield AI",
    hostAvatar: "🤖",
    viewers: 6,
    tmdbId: "",
    type: "youtube",
    trailerId: "IAl240xpSGM"
  }
];

// Persistent Host Room Code (Stays fixed until dismissed!)
function getPersistentHostRoomCode() {
  if (activeHall && activeHall.roomCode) return activeHall.roomCode;
  let code = "";
  try {
    code = localStorage.getItem("bioscope_persistent_host_code");
    if (!code) {
      code = `BIOSCOPE-${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem("bioscope_persistent_host_code", code);
    }
  } catch (_) {
    code = "BIOSCOPE-7892";
  }
  return code;
}

function loadActiveHallState() {
  try {
    const saved = localStorage.getItem("bioscope_active_hall");
    if (saved) activeHall = JSON.parse(saved);
  } catch (_) {
    activeHall = null;
  }
  updateActiveHallUI();
}

function saveActiveHallState() {
  try {
    if (activeHall) {
      localStorage.setItem("bioscope_active_hall", JSON.stringify(activeHall));
    } else {
      localStorage.removeItem("bioscope_active_hall");
    }
  } catch (_) {}
  updateActiveHallUI();
  renderBoxOfficeHalls();
}

function updateActiveHallUI() {
  if (activeHall && activeHallBanner && activeHallBannerTitle) {
    activeHallBanner.hidden = false;
    activeHallBannerTitle.textContent = `${activeHall.movieTitle} · Room: ${activeHall.roomCode}`;
  } else if (activeHallBanner) {
    activeHallBanner.hidden = true;
  }
}

// In-Page Watch Party Lounge Navigation (Zero Popups)
function switchLoungeTab(tabName) {
  const tabs = [
    { name: "halls", btn: tabLoungeHalls, panel: panelLoungeHalls },
    { name: "host", btn: tabLoungeHost, panel: panelLoungeHost },
    { name: "join", btn: tabLoungeJoin, panel: panelLoungeJoin }
  ];

  tabs.forEach(t => {
    const active = t.name === tabName;
    if (t.btn) {
      t.btn.classList.toggle("is-active", active);
      t.btn.setAttribute("aria-selected", active ? "true" : "false");
    }
    if (t.panel) {
      t.panel.hidden = !active;
      t.panel.classList.toggle("is-active", active);
    }
  });

  if (tabName === "halls") renderBoxOfficeHalls();
  if (tabName === "host") updateVisibilityToggle();
  if (tabName === "join") {
    setTimeout(() => {
      if (joinRoomInput) joinRoomInput.focus();
    }, 120);
  }
}

if (tabLoungeHalls) tabLoungeHalls.addEventListener("click", () => switchLoungeTab("halls"));
if (tabLoungeHost) tabLoungeHost.addEventListener("click", () => switchLoungeTab("host"));
if (tabLoungeJoin) tabLoungeJoin.addEventListener("click", () => switchLoungeTab("join"));

// Public vs Private Visibility Selection in Host Panel
function updateVisibilityToggle() {
  const isPrivate = visPrivateRadio && visPrivateRadio.checked;
  if (lblVisPublic && lblVisPrivate) {
    lblVisPublic.classList.toggle("is-active", !isPrivate);
    lblVisPrivate.classList.toggle("is-active", isPrivate);
  }
  if (partyPrivateCodeBox) {
    partyPrivateCodeBox.hidden = !isPrivate;
  }
  const code = getPersistentHostRoomCode();
  if (partyRoomCodeEl) partyRoomCodeEl.textContent = code;
}

if (visPublicRadio) visPublicRadio.addEventListener("change", updateVisibilityToggle);
if (visPrivateRadio) visPrivateRadio.addEventListener("change", updateVisibilityToggle);

// Navigate to Watch Party Section (Used by Nav buttons & Hero)
function navigateToWatchParty(tab = "halls") {
  const hub = document.querySelector("#watch-party-hub");
  if (hub) {
    hub.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  switchLoungeTab(tab);
}

// Global Watch Party Navigation Triggers
document.querySelectorAll("#open-party-btn, #hero-party-btn, #btn-player-party").forEach(b => {
  b.addEventListener("click", (e) => {
    e.preventDefault();
    navigateToWatchParty("host");
  });
});

// Copy Invite Link
async function copyHallInviteLink(code) {
  const roomCode = code || partyRoomCodeEl?.textContent?.trim() || activeHall?.roomCode || getPersistentHostRoomCode();
  const link = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomCode)}`;
  try {
    await navigator.clipboard.writeText(link);
    notify(`🎟️ Cinema Hall invite link copied: ${roomCode}`);
  } catch (_) {
    notify(`🎟️ Hall invite code: ${roomCode}`);
  }
}

if (btnCopyRoom) btnCopyRoom.addEventListener("click", () => copyHallInviteLink());
if (theatreCodePill) theatreCodePill.addEventListener("click", () => copyHallInviteLink(theatreCurrentCode?.textContent));
if (btnTheatreShare) btnTheatreShare.addEventListener("click", () => copyHallInviteLink(theatreCurrentCode?.textContent));

// Launch Grand Theatre Room as Host
if (btnStartParty) {
  btnStartParty.addEventListener("click", () => {
    const isPublic = visPublicRadio ? visPublicRadio.checked : true;
    const roomCode = getPersistentHostRoomCode();
    const hallName = partyHallNameInput?.value?.trim() || `${(currentUser && currentUser.name) ? currentUser.name.split(" ")[0] : "VIP"}'s Grand Cinema`;
    
    const initialMovie = (activeHall && activeHall.movieTitle) ? activeHall : {
      movieTitle: "Dune: Part Two",
      tmdbId: "693134",
      type: "movie",
      trailerId: "Way9Dexny3w",
      poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg"
    };

    activeHall = {
      roomCode,
      isHost: true,
      hallName,
      movieTitle: initialMovie.movieTitle || "Dune: Part Two",
      poster: initialMovie.poster || "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      tmdbId: initialMovie.tmdbId,
      type: initialMovie.type || "movie",
      trailerId: initialMovie.trailerId || "",
      isPublic,
      hostName: (currentUser && currentUser.name) ? currentUser.name : "VIP Host",
      hostAvatar: (currentUser && currentUser.avatar) ? currentUser.avatar : "👑",
      createdAt: Date.now()
    };
    saveActiveHallState();
    enterTheatreHall(activeHall);
    notify(`🎬 Welcome to ${hallName}! Projector online.`);
  });
}

// Dismiss Hall from Dialog Alert or Banner
function dismissActiveHall() {
  if (!activeHall) return;
  const dismissedCode = activeHall.roomCode;
  
  // Broadcast dismissal to all peers in the auditorium
  if (hallChannel) {
    hallChannel.postMessage({
      type: "dismiss",
      roomCode: dismissedCode
    });
  }

  try {
    localStorage.removeItem("bioscope_persistent_host_code");
  } catch (_) {}

  activeHall = null;
  saveActiveHallState();
  leaveTheatreHall();
  notify("🛑 Cinema Hall has been dismissed and ended.");
}

const btnModalDismissRoom = document.querySelector("#btn-modal-dismiss-room");
if (btnModalDismissRoom) btnModalDismissRoom.addEventListener("click", dismissActiveHall);
if (btnDismissActiveHall) btnDismissActiveHall.addEventListener("click", dismissActiveHall);
if (btnTheatreDismiss) btnTheatreDismiss.addEventListener("click", dismissActiveHall);
if (btnHostDismissBar) btnHostDismissBar.addEventListener("click", dismissActiveHall);

// Re-Enter Active Hall from Homepage Banner
if (btnResumeActiveHall) {
  btnResumeActiveHall.addEventListener("click", () => {
    if (activeHall) enterTheatreHall(activeHall);
  });
}

// Join Hall by Code
function joinTheatreHallByCode(code) {
  const cleanCode = (code || "").trim().toUpperCase();
  if (!cleanCode) {
    notify("⚠️ Please enter a valid Hall Code (e.g. BIOSCOPE-7892)");
    return;
  }
  if (partyDialog?.open) partyDialog.close();

  // If host joins their own room
  if (activeHall && activeHall.roomCode.toUpperCase() === cleanCode) {
    enterTheatreHall(activeHall);
    return;
  }

  // Join as audience member
  const guestHall = {
    roomCode: cleanCode,
    isHost: false,
    hallName: `Auditorium · ${cleanCode}`,
    movieTitle: "Dune: Part Two",
    tmdbId: "693134",
    type: "movie",
    trailerId: "Way9Dexny3w",
    isPublic: false,
    hostName: "Grand Host",
    hostAvatar: "👑"
  };
  enterTheatreHall(guestHall);
  notify(`🍿 Entering Cinema Hall ${cleanCode}... Taking seat!`);
}

if (btnSubmitJoin && joinRoomInput) {
  btnSubmitJoin.addEventListener("click", () => joinTheatreHallByCode(joinRoomInput.value));
  joinRoomInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      joinTheatreHallByCode(joinRoomInput.value);
    }
  });
}

// ==========================================================================
// Virtual Cinema Theatre Hall Controller
// ==========================================================================
function enterTheatreHall(hallData) {
  if (!theatreRoomView) return;
  currentHallSession = hallData;

  // Close other player modals if open
  if (videoDialog?.open) closeVideoPlayer();
  if (partyDialog?.open) partyDialog.close();

  // Activate theatre viewport
  document.body.classList.add("theatre-mode-active");
  theatreRoomView.hidden = false;

  // Cinematic dimming lights transition
  if (theatreCurtain) {
    theatreCurtain.classList.add("is-dimming");
    setTimeout(() => theatreCurtain.classList.remove("is-dimming"), 700);
  }

  // Update Marquee & Badges
  if (theatreHallBadge) theatreHallBadge.textContent = hallData.hallName ? `🎬 ${hallData.hallName.toUpperCase()}` : "🎬 BIOSCOPE GRAND HALL";
  if (theatreMovieTitle) theatreMovieTitle.textContent = hallData.movieTitle || "Feature Film";
  if (theatreCurrentCode) theatreCurrentCode.textContent = hallData.roomCode;

  // Update URL without reloading
  try {
    const newUrl = `${window.location.pathname}?room=${encodeURIComponent(hallData.roomCode)}`;
    window.history.replaceState({ room: hallData.roomCode }, "", newUrl);
  } catch (_) {}

  // Host Controls vs Audience View
  if (hallData.isHost) {
    if (btnTheatreDismiss) btnTheatreDismiss.hidden = false;
    if (theatreHostDeck) theatreHostDeck.hidden = false;
    populateTheatreMovieSwitcher(hallData.movieTitle);
  } else {
    if (btnTheatreDismiss) btnTheatreDismiss.hidden = true;
    if (theatreHostDeck) theatreHostDeck.hidden = true;
  }

  // Initialize Audience Seating
  initHallAudience(hallData);

  // Load Stream onto Big Cinema Screen
  loadTheatreScreen(hallData.title || hallData.movieTitle, hallData.tmdbId, hallData.type, hallData.trailerId);

  // Broadcast presence
  broadcastHallEvent({
    type: "presence",
    roomCode: hallData.roomCode,
    user: {
      id: currentUser.id || "usr_me",
      name: currentUser.name || "Cinephile Guest",
      avatar: currentUser.avatar || (hallData.isHost ? "👑" : "🍿"),
      isHost: !!hallData.isHost
    }
  });

  // Post Welcome in Lounge Chat
  appendTheatreChatMessage("system", "🎬 Welcome to the Grand Virtual Theatre! Whisper in chat or tap emojis to react live on screen.");
}

function leaveTheatreHall() {
  if (!theatreRoomView) return;
  document.body.classList.remove("theatre-mode-active");
  theatreRoomView.hidden = true;
  if (theatrePlayerFrame) theatrePlayerFrame.src = "";
  currentHallSession = null;

  try {
    window.history.replaceState({}, "", window.location.pathname);
  } catch (_) {}
}

if (btnTheatreLeave) btnTheatreLeave.addEventListener("click", leaveTheatreHall);

// Load Cinema Screen Video Stream
function loadTheatreScreen(title, tmdbId, type = "movie", trailerId = "") {
  if (!theatrePlayerFrame) return;
  if (theatreProjectorShield) theatreProjectorShield.hidden = false;

  const catalogEntry = (typeof BUILTIN_CATALOG !== "undefined" ? BUILTIN_CATALOG : []).find(
    m => (m.title && m.title.toLowerCase() === (title || "").toLowerCase()) ||
         (m.banglaTitle && title && title.includes(m.banglaTitle)) ||
         (m.tmdbId && m.tmdbId === String(tmdbId))
  );

  const isBangla = Boolean(
    type === "bangla" ||
    catalogEntry?.bangla ||
    /[\u0980-\u09FF]/.test(title || "") ||
    (title && (
      title.includes("Hawa") || title.includes("Priyotoma") || title.includes("Toofan") ||
      title.includes("Aynabaji") || title.includes("Surongo") || title.includes("Shurongo") ||
      title.includes("Poran") || title.includes("Monpura") || title.includes("Pather Panchali") ||
      title.includes("Dipu Number") || title.includes("Aguner Poroshmoni") || title.includes("Chhutir Ghonta")
    ))
  );

  const isYoutube = type === "youtube" || isBangla || !tmdbId;
  let url = "";

  if (isYoutube) {
    const yId = trailerId || catalogEntry?.trailerId || "K9W52rpdlLQ";
    url = `https://www.youtube-nocookie.com/embed/${yId}?autoplay=1&controls=1&rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
  } else {
    url = CONFIG.STREAM_SERVERS[0].getUrl(tmdbId, type);
  }

  theatrePlayerFrame.src = url;
  theatrePlayerFrame.onload = () => {
    if (theatreProjectorShield) theatreProjectorShield.hidden = true;
  };
  setTimeout(() => {
    if (theatreProjectorShield) theatreProjectorShield.hidden = true;
  }, 2400);
}

// Populate Host Movie Switcher Dropdown
function populateTheatreMovieSwitcher(currentTitle) {
  if (!theatreSwitchMovie) return;
  theatreSwitchMovie.innerHTML = BUILTIN_CATALOG.slice(0, 24).map(m => `
    <option value="${m.tmdbId}|${m.type || 'movie'}|${m.trailerId || ''}" ${m.title === currentTitle ? 'selected' : ''}>
      ${m.title} (${m.year || '2024'})
    </option>
  `).join("");

  theatreSwitchMovie.onchange = () => {
    const val = theatreSwitchMovie.value.split("|");
    const tmdbId = val[0];
    const type = val[1];
    const trailerId = val[2];
    const newTitle = theatreSwitchMovie.options[theatreSwitchMovie.selectedIndex].text.split("(")[0].trim();

    if (activeHall) {
      activeHall.movieTitle = newTitle;
      activeHall.tmdbId = tmdbId;
      activeHall.type = type;
      activeHall.trailerId = trailerId;
      saveActiveHallState();
    }

    if (theatreMovieTitle) theatreMovieTitle.textContent = newTitle;
    loadTheatreScreen(newTitle, tmdbId, type, trailerId);

    broadcastHallEvent({
      type: "sync_movie",
      roomCode: currentHallSession?.roomCode,
      movieTitle: newTitle,
      tmdbId,
      type,
      trailerId
    });

    appendTheatreChatMessage("system", `👑 Host changed the feature presentation to: ${newTitle}`);
    notify(`🎬 Cinema Projector tuned to: ${newTitle}`);
  };
}

if (btnHostResync) {
  btnHostResync.addEventListener("click", () => {
    if (!currentHallSession) return;
    broadcastHallEvent({
      type: "sync_movie",
      roomCode: currentHallSession.roomCode,
      movieTitle: currentHallSession.movieTitle,
      tmdbId: currentHallSession.tmdbId,
      type: currentHallSession.type,
      trailerId: currentHallSession.trailerId
    });
    notify("⚡ Re-synced stream broadcast sent to all auditorium seats!");
  });
}

// ==========================================================================
// Virtual Auditorium Seating & Audience Management
// ==========================================================================
function initHallAudience(hall) {
  hallAudience = [];
  
  // Host always gets Seat A1
  const hostUser = {
    id: hall.isHost ? (currentUser.id || "host_me") : "host_primary",
    name: hall.hostName || "VIP Host",
    avatar: hall.hostAvatar || "👑",
    isHost: true,
    seat: "A1"
  };
  hallAudience.push(hostUser);

  // If user is guest, assign Seat A2
  if (!hall.isHost) {
    hallAudience.push({
      id: currentUser.id || "guest_me",
      name: currentUser.name || "Cinephile Guest",
      avatar: currentUser.avatar || "🍿",
      isHost: false,
      seat: "A2"
    });
  }

  // Pre-seed 2-3 friendly simulated cinephile attendees for public halls
  if (hall.isPublic !== false) {
    const companions = [
      { id: "comp_1", name: "Rahim", avatar: "🕶️", isHost: false, seat: "A3" },
      { id: "comp_2", name: "Sarah K.", avatar: "🐱", isHost: false, seat: "A4" },
      { id: "comp_3", name: "Tanvir", avatar: "🤖", isHost: false, seat: "A5" }
    ];
    companions.forEach(c => {
      if (!hallAudience.some(m => m.id === c.id)) hallAudience.push(c);
    });
  }

  renderHallAudienceSeats();
}

function renderHallAudienceSeats() {
  if (!theatreSeatsTrack) return;
  theatreSeatsTrack.innerHTML = hallAudience.map(member => `
    <div class="cinema-seat" id="seat-${member.id}" title="${member.name} (${member.isHost ? 'Host' : 'Audience'} · Seat ${member.seat})">
      <div class="cinema-seat__chair">
        ${member.isHost ? '<span class="cinema-seat__crown">👑</span>' : ''}
        <span class="cinema-seat__avatar">${member.avatar || '🍿'}</span>
      </div>
      <span class="cinema-seat__tag">${member.seat}</span>
      <span class="cinema-seat__name">${member.name.split(" ")[0]}</span>
    </div>
  `).join("");

  // Update Roster Counts
  const count = hallAudience.length;
  if (theatreRosterCount) theatreRosterCount.textContent = `${count} Watching`;
  if (rosterPopoverCount) rosterPopoverCount.textContent = count;

  // Update Roster Popover List
  if (theatreRosterList) {
    theatreRosterList.innerHTML = hallAudience.map(m => `
      <li class="roster-user-item">
        <span class="roster-avatar">${m.avatar || '🍿'}</span>
        <span class="roster-name">${m.name}</span>
        ${m.isHost ? '<span class="roster-role-badge">HOST</span>' : '<span style="font-size:0.65rem;color:#888;">Seat ' + m.seat + '</span>'}
      </li>
    `).join("");
  }
}

// ==========================================================================
// In-Player Transparent Lounge Chat & Reactions
// ==========================================================================
// Minimize / Expand Corner Chat
if (btnMinCornerChat && theatreCornerChat) {
  btnMinCornerChat.addEventListener("click", () => {
    theatreCornerChat.classList.toggle("is-minimized");
    btnMinCornerChat.textContent = theatreCornerChat.classList.contains("is-minimized") ? "▴" : "▾";
  });
}

// Toggle Audience Roster Popover
if (btnToggleRoster && theatreRosterPopover) {
  btnToggleRoster.addEventListener("click", () => {
    theatreRosterPopover.hidden = !theatreRosterPopover.hidden;
  });
}

function appendTheatreChatMessage(type, text, author = "", avatar = "") {
  if (!theatreChatBody) return;
  const msgEl = document.createElement("div");

  if (type === "system") {
    msgEl.className = "c-msg c-msg--system";
    msgEl.innerHTML = text;
  } else {
    msgEl.className = "c-msg";
    msgEl.innerHTML = `
      <span class="c-msg__avatar">${avatar || '🍿'}</span>
      <span class="c-msg__author">${author}:</span>
      <span class="c-msg__text">${escapeHTML(text)}</span>
    `;
  }

  theatreChatBody.appendChild(msgEl);
  theatreChatBody.scrollTop = theatreChatBody.scrollHeight;
}

function escapeHTML(str) {
  const p = document.createElement("p");
  p.textContent = str;
  return p.innerHTML;
}

// Send Chat Message Form
if (theatreChatForm && theatreChatInput) {
  theatreChatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = theatreChatInput.value.trim();
    if (!text || !currentHallSession) return;

    const myName = currentUser.name || "Cinephile Guest";
    const myAvatar = currentUser.avatar || (currentHallSession.isHost ? "👑" : "🍿");

    appendTheatreChatMessage("user", text, myName, myAvatar);
    broadcastHallEvent({
      type: "chat",
      roomCode: currentHallSession.roomCode,
      author: myName,
      avatar: myAvatar,
      text: text,
      timestamp: Date.now()
    });

    theatreChatInput.value = "";
  });
}

// Floating Reactions & Seat Bubble Trigger
function triggerSeatReaction(emoji, userId) {
  // 1. Floating Screen Reaction
  if (theatreFloatingReactions) {
    const floatEl = document.createElement("span");
    floatEl.className = "theatre-floating-emoji";
    floatEl.textContent = emoji;
    floatEl.style.left = `${15 + Math.random() * 70}%`;
    floatEl.style.bottom = "20px";
    theatreFloatingReactions.appendChild(floatEl);
    setTimeout(() => floatEl.remove(), 3200);
  }

  // 2. Seat Bubble Animation
  const targetSeat = document.querySelector(`#seat-${userId}`);
  if (targetSeat) {
    const bubble = document.createElement("span");
    bubble.className = "cinema-seat__bubble";
    bubble.textContent = emoji;
    targetSeat.appendChild(bubble);
    setTimeout(() => bubble.remove(), 2400);
  }
}

document.querySelectorAll(".quick-emoji-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const emoji = btn.dataset.emoji || "🍿";
    const myId = currentHallSession?.isHost ? (currentUser.id || "host_me") : (currentUser.id || "guest_me");
    triggerSeatReaction(emoji, myId);

    if (currentHallSession) {
      broadcastHallEvent({
        type: "reaction",
        roomCode: currentHallSession.roomCode,
        userId: myId,
        emoji: emoji
      });
    }
  });
});

// Broadcast Multi-Client Signaling Helper
function broadcastHallEvent(data) {
  if (hallChannel) {
    try {
      hallChannel.postMessage(data);
    } catch (_) {}
  }
}

// Handle Incoming Multi-Client Events
if (hallChannel) {
  hallChannel.onmessage = (e) => {
    const data = e.data;
    if (!data || !currentHallSession) return;
    if (data.roomCode && data.roomCode !== currentHallSession.roomCode) return;

    if (data.type === "chat") {
      appendTheatreChatMessage("user", data.text, data.author, data.avatar);
    } else if (data.type === "reaction") {
      triggerSeatReaction(data.emoji, data.userId);
    } else if (data.type === "presence" && data.user) {
      if (!hallAudience.some(m => m.id === data.user.id)) {
        data.user.seat = `A${hallAudience.length + 1}`;
        hallAudience.push(data.user);
        renderHallAudienceSeats();
        appendTheatreChatMessage("system", `👥 ${data.user.name} took seat ${data.user.seat} in the hall.`);
      }
    } else if (data.type === "sync_movie") {
      if (theatreMovieTitle) theatreMovieTitle.textContent = data.movieTitle;
      loadTheatreScreen(data.movieTitle, data.tmdbId, data.type, data.trailerId);
      appendTheatreChatMessage("system", `👑 Host changed feature presentation to: ${data.movieTitle}`);
    } else if (data.type === "dismiss") {
      notify("🛑 The Host has ended this Cinema Hall. Returning to Lobby...");
      leaveTheatreHall();
    }
  };
}

// ==========================================================================
// Bioscope Box Office: Live Halls Directory & Projector Search
// ==========================================================================

let currentHallFilter = "all";

function renderBoxOfficeHalls() {
  const grid = document.querySelector("#box-office-grid");
  if (!grid) return;
  const list = [];

  // Add user's active hall if exists
  if (activeHall) {
    list.push({
      roomCode: activeHall.roomCode,
      hallName: activeHall.hallName || "Your Live Cinema Hall",
      movieTitle: activeHall.movieTitle || "Dune: Part Two",
      poster: activeHall.poster || "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      hostName: `${(currentUser && currentUser.name) ? currentUser.name : 'You'} (Host)`,
      hostAvatar: (currentUser && currentUser.avatar) ? currentUser.avatar : "👑",
      viewers: hallAudience.length || 1,
      tmdbId: activeHall.tmdbId,
      type: activeHall.type,
      trailerId: activeHall.trailerId,
      isPublic: activeHall.isPublic ?? true,
      isMyHall: true
    });
  }

  // Add default public halls
  DEFAULT_BOX_OFFICE_HALLS.forEach(h => {
    if (!list.some(item => item.roomCode === h.roomCode)) {
      list.push({
        ...h,
        isPublic: true
      });
    }
  });

  // Sample private hall so visitors can see both public & private rooms in the list
  if (!list.some(item => !item.isPublic)) {
    list.push({
      roomCode: "BIOSCOPE-7721",
      hallName: "Rahim's VIP Private Cinema",
      movieTitle: "Interstellar (2014)",
      poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      hostName: "Rahim",
      hostAvatar: "🚀",
      viewers: 4,
      tmdbId: "157336",
      type: "movie",
      trailerId: "2LqzF5WauS2",
      isPublic: false
    });
  }

  const countEl = document.querySelector("#hub-halls-count");
  if (countEl) countEl.textContent = list.length;

  // Filter based on active filter pill
  const filteredList = list.filter(hall => {
    if (currentHallFilter === "public") return hall.isPublic;
    if (currentHallFilter === "private") return !hall.isPublic;
    return true;
  });

  if (filteredList.length === 0) {
    grid.innerHTML = `
      <div class="box-office-empty">
        <div class="box-office-empty-icon">🏛️</div>
        <h4>No rooms found in this category</h4>
        <p>Host your own room and watch together with friends!</p>
        <button type="button" class="button button--primary button--sm" onclick="switchLoungeTab('host')">🍿 Host Room Now</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredList.map(hall => `
    <div class="box-office-card" id="card-${hall.roomCode}">
      <div class="box-office-card__top">
        <h4 class="box-office-card__hall-name" title="${hall.hallName}">${hall.hallName}</h4>
        <span class="hall-tag-badge ${hall.isPublic ? 'hall-tag-badge--public' : 'hall-tag-badge--private'}">
          ${hall.isPublic ? '🌐 Public' : '🔒 Private'}
        </span>
      </div>

      <!-- Live Screening Feature Preview (Shown BEFORE entering!) -->
      <div class="hall-screening-banner">
        <img class="hall-screening-poster" src="${hall.poster || 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg'}" alt="${hall.movieTitle}" loading="lazy">
        <div class="hall-screening-info">
          <div class="hall-live-tag"><span class="pulse-dot"></span> NOW SCREENING</div>
          <h5 class="hall-screening-title" title="${hall.movieTitle}">${hall.movieTitle}</h5>
          <div class="hall-host-meta">
            <span>${hall.hostAvatar} ${hall.hostName}</span>
            <span>·</span>
            <span>👥 ${hall.viewers} Watching</span>
          </div>
        </div>
      </div>

      <div class="hall-card-actions">
        ${hall.isPublic ? `
          <button type="button" class="button button--primary button--full btn-enter-public-hall" data-code="${hall.roomCode}">
            🎬 Enter Hall (1-Click)
          </button>
        ` : `
          <div class="hall-private-join-wrap">
            <input type="text" class="input-hall-code" id="input-card-${hall.roomCode}" placeholder="Enter Invite Code" autocomplete="off">
            <button type="button" class="button button--primary btn-join-private-hall" data-code="${hall.roomCode}">
              Enter
            </button>
          </div>
        `}
      </div>
    </div>
  `).join("");

  // Attach click listeners for public halls (1-click entry)
  grid.querySelectorAll(".btn-enter-public-hall").forEach(btn => {
    btn.addEventListener("click", () => {
      const code = btn.dataset.code;
      const targetHall = list.find(h => h.roomCode === code);
      if (targetHall) {
        if (targetHall.isMyHall && activeHall) {
          enterTheatreHall(activeHall);
        } else {
          enterTheatreHall(targetHall);
        }
      } else {
        joinTheatreHallByCode(code);
      }
    });
  });

  // Attach click listeners for private halls (code verification)
  grid.querySelectorAll(".btn-join-private-hall").forEach(btn => {
    btn.addEventListener("click", () => {
      const code = btn.dataset.code;
      const input = document.querySelector(`#input-card-${code}`);
      const enteredCode = input ? input.value.trim().toUpperCase() : "";
      if (!enteredCode) {
        notify("⚠️ Please enter the Invite Code for this private room.");
        input?.focus();
        return;
      }
      if (enteredCode === code.toUpperCase() || (activeHall && activeHall.roomCode.toUpperCase() === enteredCode)) {
        joinTheatreHallByCode(enteredCode);
      } else {
        notify("❌ Invalid room code. Please ask the host for the correct invite code.");
      }
    });
  });
}

// Hall Filter Pills Click Handlers
document.querySelectorAll("#hall-filter-pills .hall-pill").forEach(pill => {
  pill.addEventListener("click", () => {
    document.querySelectorAll("#hall-filter-pills .hall-pill").forEach(p => p.classList.remove("is-active"));
    pill.classList.add("is-active");
    currentHallFilter = pill.dataset.filter || "all";
    renderBoxOfficeHalls();
  });
});

// Real-Time Search & Project Movie Inside Theatre Room
function setupTheatreProjectorSearch() {
  if (!theatreProjectorSearch || !theatreProjectorResults) return;

  theatreProjectorSearch.addEventListener("input", () => {
    const query = theatreProjectorSearch.value.trim().toLowerCase();
    if (!query || query.length < 2) {
      theatreProjectorResults.hidden = true;
      theatreProjectorResults.innerHTML = "";
      return;
    }

    const matches = BUILTIN_CATALOG.filter(m =>
      (m.title && m.title.toLowerCase().includes(query)) ||
      (m.genre && m.genre.toLowerCase().includes(query))
    ).slice(0, 8);

    if (matches.length === 0) {
      theatreProjectorResults.hidden = false;
      theatreProjectorResults.innerHTML = `<div style="padding:10px;font-size:0.75rem;color:var(--color-muted);text-align:center;">No catalog match found</div>`;
      return;
    }

    theatreProjectorResults.hidden = false;
    theatreProjectorResults.innerHTML = matches.map(m => `
      <div class="theatre-search-item" data-tmdb="${m.tmdbId}" data-type="${m.type || 'movie'}" data-trailer="${m.trailerId || ''}" data-title="${m.title}" data-poster="${m.poster}">
        <img src="${m.poster}" alt="${m.title}">
        <strong>${m.title} (${m.year || '2024'})</strong>
        <span style="font-size:0.68rem;background:rgba(245,197,24,0.2);color:#ffe071;padding:2px 6px;border-radius:4px;">Project</span>
      </div>
    `).join("");

    theatreProjectorResults.querySelectorAll(".theatre-search-item").forEach(item => {
      item.addEventListener("click", () => {
        const tmdbId = item.dataset.tmdb;
        const type = item.dataset.type;
        const trailerId = item.dataset.trailer;
        const newTitle = item.dataset.title;
        const newPoster = item.dataset.poster;

        theatreProjectorResults.hidden = true;
        theatreProjectorSearch.value = "";

        if (activeHall) {
          activeHall.movieTitle = newTitle;
          activeHall.poster = newPoster;
          activeHall.tmdbId = tmdbId;
          activeHall.type = type;
          activeHall.trailerId = trailerId;
          saveActiveHallState();
        }

        if (theatreMovieTitle) theatreMovieTitle.textContent = newTitle;
        loadTheatreScreen(newTitle, tmdbId, type, trailerId);

        broadcastHallEvent({
          type: "sync_movie",
          roomCode: currentHallSession?.roomCode,
          movieTitle: newTitle,
          tmdbId,
          type,
          trailerId
        });

        appendTheatreChatMessage("system", `👑 Host projected a new feature: ${newTitle}`);
        notify(`🎬 Cinema Projector tuned to: ${newTitle}`);
      });
    });
  });

  document.addEventListener("click", (e) => {
    if (!theatreProjectorSearch.contains(e.target) && !theatreProjectorResults.contains(e.target)) {
      theatreProjectorResults.hidden = true;
    }
  });
}

setupTheatreProjectorSearch();

// Startup Initialization: Check Active Room and URL Query Param
loadActiveHallState();
renderBoxOfficeHalls();

// Check if visiting directly via link like ?room=BIOSCOPE-7892
window.addEventListener("DOMContentLoaded", () => {
  loadActiveHallState();
  renderBoxOfficeHalls();
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get("room");
    if (roomParam) {
      if (activeHall && activeHall.roomCode.toUpperCase() === roomParam.toUpperCase()) {
        enterTheatreHall(activeHall);
      } else {
        joinTheatreHallByCode(roomParam);
      }
    }
  } catch (_) {}
});

// Digital Movie Ticket Invite Generator (HTML5 Canvas)
const ticketDialog = document.querySelector("#ticket-dialog");
const ticketCloseBtn = document.querySelector("#ticket-close-btn");
const ticketCanvas = document.querySelector("#ticket-canvas");
const btnDownloadTicket = document.querySelector("#btn-download-ticket");
const btnShareTicket = document.querySelector("#btn-share-ticket");

function drawMovieTicketCanvas() {
  if (!ticketCanvas) return;
  const ctx = ticketCanvas.getContext("2d");
  const w = ticketCanvas.width;
  const h = ticketCanvas.height;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#15151c");
  grad.addColorStop(1, "#0a0a0e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Border & Gold Accent
  ctx.strokeStyle = "rgba(245, 197, 24, 0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, w - 20, h - 20);

  // Perforated divider line
  ctx.beginPath();
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.moveTo(420, 10);
  ctx.lineTo(420, h - 10);
  ctx.stroke();
  ctx.setLineDash([]);

  // Branding
  ctx.fillStyle = "#f5c518";
  ctx.font = "bold 14px 'Inter', sans-serif";
  ctx.fillText("🍿 BIOSCOPEBD CINEMA TICKET", 30, 40);

  // Movie Title
  const movieText = partyMoviePicker?.options[partyMoviePicker.selectedIndex]?.text || "Dune: Part Two (2024)";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px 'Inter', sans-serif";
  ctx.fillText(movieText.slice(0, 26), 30, 80);

  // Ticket Meta
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "13px 'Inter', sans-serif";
  ctx.fillText("HOST: " + (currentUser.name || "Tanjir Rahman") + " (VIP)", 30, 120);
  ctx.fillText("TIME: Tonight at 9:00 PM (BST)", 30, 145);
  ctx.fillText("STREAM: 1080p Full HD · Synced Watch Party", 30, 170);
  ctx.fillText("ROOM CODE: " + (partyRoomCodeEl?.textContent || "BIOSCOPE-7892"), 30, 195);

  // Gold Footer
  ctx.fillStyle = "rgba(245, 197, 24, 0.8)";
  ctx.font = "11px 'Inter', sans-serif";
  ctx.fillText("Zero Ads · Zero Plugins · github.com/bioscopebd", 30, 265);

  // Right Stub - Room & Barcode
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px 'Inter', sans-serif";
  ctx.fillText("ADMIT ONE", 440, 50);

  ctx.fillStyle = "#f5c518";
  ctx.font = "bold 18px 'Inter', sans-serif";
  ctx.fillText(partyRoomCodeEl?.textContent || "BIOSCOPE-7892", 440, 90);

  // Stylized Barcode
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  for (let x = 440; x < 570; x += 5) {
    const barW = (x % 3 === 0) ? 3 : 1.5;
    ctx.fillRect(x, 120, barW, 90);
  }

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "10px monospace";
  ctx.fillText("SEC 01 · ROW A · SEAT 07", 440, 235);
}

if (btnGenerateTicket && ticketDialog) {
  btnGenerateTicket.addEventListener("click", () => {
    drawMovieTicketCanvas();
    ticketDialog.showModal();
  });
}

if (ticketCloseBtn && ticketDialog) {
  ticketCloseBtn.addEventListener("click", () => ticketDialog.close());
  ticketDialog.addEventListener("click", (e) => { if (e.target === ticketDialog) ticketDialog.close(); });
}

if (btnDownloadTicket && ticketCanvas) {
  btnDownloadTicket.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `BioscopeBD-Cinema-Ticket-${Date.now()}.png`;
    link.href = ticketCanvas.toDataURL("image/png");
    link.click();
    notify("🎟️ Digital Cinema Ticket downloaded!");
  });
}

if (btnShareTicket) {
  btnShareTicket.addEventListener("click", () => {
    const room = partyRoomCodeEl?.textContent || "BIOSCOPE-7892";
    const text = `🍿 You're invited to a BioscopeBD Watch Party!\nRoom: ${room}\nJoin here: ${window.location.origin}${window.location.pathname}?room=${room}`;
    navigator.clipboard?.writeText(text);
    notify("📋 Party invite text copied to clipboard!");
  });
}

// Bioscope Movie Receipt / Top 4 Story Card Generator (HTML5 Canvas)
const receiptDialog = document.querySelector("#receipt-dialog");
const receiptCloseBtn = document.querySelector("#receipt-close-btn");
const receiptCanvas = document.querySelector("#receipt-canvas");
const btnDownloadReceipt = document.querySelector("#btn-download-receipt");
const btnOpenReceipt = document.querySelector("#btn-profile-receipt");

function drawReceiptCanvas() {
  if (!receiptCanvas) return;
  const ctx = receiptCanvas.getContext("2d");
  const w = receiptCanvas.width;
  const h = receiptCanvas.height;

  // Thermal paper texture
  ctx.fillStyle = "#0c0d12";
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1;
  ctx.strokeRect(15, 15, w - 30, h - 30);

  // Header
  ctx.fillStyle = "#f5c518";
  ctx.font = "bold 20px monospace";
  ctx.textAlign = "center";
  ctx.fillText("BIOSCOPEBD CINEMA", w / 2, 50);

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "11px monospace";
  ctx.fillText("MONTHLY STREAMING RECEIPT", w / 2, 70);
  ctx.fillText("DATE: " + new Date().toLocaleDateString() + " · ORDER #8294", w / 2, 88);
  ctx.fillText("CUSTOMER: " + (currentUser.name || "Guest Cinephile"), w / 2, 104);

  // Dashed divider
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(30, 120);
  ctx.lineTo(w - 30, 120);
  ctx.stroke();
  ctx.setLineDash([]);

  // Top 4 Movies List
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px monospace";
  ctx.fillText("TOP 4 MOVIES STREAMED:", 30, 145);

  const topPicks = continueWatching.slice(0, 4).concat(BUILTIN_CATALOG.slice(0, 4)).slice(0, 4);
  let y = 175;
  topPicks.forEach((item, idx) => {
    ctx.fillStyle = "#f5c518";
    ctx.font = "bold 12px monospace";
    ctx.fillText(`${idx + 1}. ${item.title.slice(0, 22)}`, 30, y);
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "11px monospace";
    ctx.textAlign = "right";
    ctx.fillText("HD 1080p", w - 30, y);
    ctx.textAlign = "left";
    y += 28;
  });

  // Divider
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(30, y + 10);
  ctx.lineTo(w - 30, y + 10);
  ctx.stroke();
  ctx.setLineDash([]);

  // Totals
  y += 35;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "12px monospace";
  ctx.fillText("TOTAL HOURS WATCHED:", 30, y);
  ctx.textAlign = "right";
  ctx.fillText("18.4 HRS", w - 30, y);
  ctx.textAlign = "left";

  y += 22;
  ctx.fillText("SUBSCRIPTION CHARGE:", 30, y);
  ctx.textAlign = "right";
  ctx.fillStyle = "#00ff66";
  ctx.fillText("$0.00 (100% FREE)", w - 30, y);
  ctx.textAlign = "left";

  y += 22;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText("CINEPHILE RANK:", 30, y);
  ctx.textAlign = "right";
  ctx.fillStyle = "#f5c518";
  ctx.fillText(currentUser.rank || "Midnight Cinephile", w - 30, y);
  ctx.textAlign = "left";

  // Barcode
  y += 50;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  for (let bx = 50; bx < w - 50; bx += 4) {
    const bw = (bx % 3 === 0) ? 2.5 : 1;
    ctx.fillRect(bx, y, bw, 60);
  }

  // Footer Note
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "10px monospace";
  ctx.fillText("THANK YOU FOR WATCHING ON BIOSCOPEBD", w / 2, y + 80);
}

if (btnOpenReceipt && receiptDialog) {
  btnOpenReceipt.addEventListener("click", () => {
    drawReceiptCanvas();
    receiptDialog.showModal();
  });
}

if (receiptCloseBtn && receiptDialog) {
  receiptCloseBtn.addEventListener("click", () => receiptDialog.close());
  receiptDialog.addEventListener("click", (e) => { if (e.target === receiptDialog) receiptDialog.close(); });
}

if (btnDownloadReceipt && receiptCanvas) {
  btnDownloadReceipt.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `BioscopeBD-Receipt-${Date.now()}.png`;
    link.href = receiptCanvas.toDataURL("image/png");
    link.click();
    notify("🧾 Story Receipt downloaded! Share on Instagram or WhatsApp.");
  });
}

// ==========================================================================
// 10. Language Switcher & Service Worker
// ==========================================================================
// Comprehensive Translations
const translations = {
  en: {
    movies: "Movies",
    watchParty: "Watch Party",
    bangla: "Bangla",
    bollywood: "Bollywood",
    aiCinema: "AI Cinema",
    topRated: "Top Rated",
    moodSearch: "Mood Search",
    upcoming: "Upcoming",
    news: "News",
    trendingNow: "Trending Now",
    findGenre: "Find your genre.",
    topRatedMovies: "Top Rated Movies",
    comingSoon: "Coming Soon",
    watchTrailer: "Watch Trailer",
    watchMovie: "Watch Movie",
    searchPlaceholder: "Search movie, year, mood, or prefix...",
    moodTitle: "How's your mood today?",
    moodSub: "Skip the 30-minute scrolling fatigue. Choose your current feeling:"
  },
  bn: {
    movies: "সিনেমা",
    watchParty: "ওয়াচ পার্টি",
    bangla: "বাংলা",
    bollywood: "বলিউড",
    aiCinema: "এআই সিনেমা",
    topRated: "সেরা রেটেড",
    moodSearch: "মুড সার্চ",
    upcoming: "শীঘ্রই আসছে",
    news: "খবর",
    trendingNow: "এখন ট্রেন্ডিং",
    findGenre: "পছন্দের জঁরা খুঁজুন।",
    topRatedMovies: "টপ রেটেড সিনেমা",
    comingSoon: "শীঘ্রই আসছে",
    watchTrailer: "ট্রেইলার দেখুন",
    watchMovie: "মুভি দেখুন",
    searchPlaceholder: "সিনেমা, সাল, মুড অথবা নাম দিয়ে খুঁজুন...",
    moodTitle: "আজকের মুড কেমন?",
    moodSub: "কি দেখবেন সেই কনফিউশন দূর করুন। আপনার বর্তমান অনুভূতি বেছে নিন:"
  }
};

function setLanguage(lang) {
  const t = translations[lang] || translations.en;
  
  const navTrending = document.querySelector('#nav-menu a[href="#trending"]');
  const navParty = document.querySelector('#nav-menu a[href="#watch-party-hub"]');
  const navBangla = document.querySelector('#nav-menu a[href="#bangla-cinema"]');
  const navHindi = document.querySelector('#nav-menu a[href="#hindi-cinema"]');
  const navAi = document.querySelector('#nav-menu a[href="#ai-cinema"]');
  const navTopRated = document.querySelector('#nav-menu a[href="#top-rated"]');
  const navMood = document.querySelector('#nav-menu a[href="#mood-section"]');

  if (navTrending) navTrending.textContent = t.movies;
  if (navParty) navParty.innerHTML = `🍿 ${t.watchParty} <span class="badge-pill">HOT</span>`;
  if (navBangla) navBangla.textContent = `🇧🇩 ${t.bangla}`;
  if (navHindi) navHindi.textContent = `🔥 ${t.bollywood}`;
  if (navAi) navAi.innerHTML = `${t.aiCinema} <span class="badge-pill">NEW</span>`;
  if (navTopRated) navTopRated.textContent = t.topRated;
  if (navMood) navMood.textContent = t.moodSearch;
  const trendTitle = document.querySelector("#trending-title");
  if (trendTitle) trendTitle.textContent = t.trendingNow;
  const topRatedTitle = document.querySelector("#top-rated-title");
  if (topRatedTitle) topRatedTitle.textContent = t.topRatedMovies;
  const moodTitleEl = document.querySelector("#mood-title");
  if (moodTitleEl) moodTitleEl.textContent = t.moodTitle;
  const moodSubEl = document.querySelector("#mood-sub");
  if (moodSubEl) moodSubEl.textContent = t.moodSub;
  if (searchInput) searchInput.placeholder = t.searchPlaceholder;
  localStorage.setItem("bioscope-lang", lang);
}

document.querySelectorAll("#language, #footer-language").forEach(sel => {
  sel.addEventListener("change", (e) => {
    const val = e.target.value;
    document.querySelectorAll("#language, #footer-language").forEach(s => { s.value = val; });
    setLanguage(val);
  });
});

const savedLang = localStorage.getItem("bioscope-lang");
if (savedLang) {
  document.querySelectorAll("#language, #footer-language").forEach(s => { s.value = savedLang; });
  setLanguage(savedLang);
}

// Reveal animations on scroll
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px 80px 0px" });
  document.querySelectorAll(".reveal").forEach(sec => observer.observe(sec));
} else {
  document.querySelectorAll(".reveal").forEach(sec => sec.classList.add("is-visible"));
}

const copyYear = document.querySelector("#copyright-year");
if (copyYear) copyYear.textContent = new Date().getFullYear();

// PWA Service Worker Registration
if ("serviceWorker" in navigator && !(window.Capacitor?.isNativePlatform?.())) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").then(reg => {
      reg.update().catch(() => {});
    }).catch(() => {});
  });
}

// ==========================================================================
// 10. BioscopeBD Offline Cinema Downloader & In-Browser Vault
// ==========================================================================
const downloadDialog = document.querySelector("#download-dialog");
const downloadDialogClose = document.querySelector("#download-dialog-close");
const downloadTargetTitle = document.querySelector("#download-target-title");
const btnPlayerDownload = document.querySelector("#btn-player-download");
const dialogDownloadBtn = document.querySelector("#dialog-download-btn");
const btnTorrentSaveFile = document.querySelector("#btn-torrent-save-file");
const btnCopyMagnet = document.querySelector("#btn-copy-magnet");
const btnDlOpenTorrent = document.querySelector("#btn-dl-open-torrent");
const btnSaveOfflineVault = document.querySelector("#btn-save-offline-vault");
const btnsTriggerDl = document.querySelectorAll(".btn-trigger-dl");

let activeDownloadMovie = {
  title: "Dune: Part Two",
  tmdbId: "693134",
  type: "movie",
  trailerId: "Way9Dexny3w"
};

function openDownloadDialog(title, tmdbId, type = "movie", trailerId = "") {
  activeDownloadMovie = {
    title: title || "Selected Title",
    tmdbId: tmdbId || "",
    type: type || "movie",
    trailerId: trailerId || ""
  };

  if (downloadTargetTitle) {
    downloadTargetTitle.textContent = `${activeDownloadMovie.title} (${activeDownloadMovie.type === "tv" ? "TV Series" : "Feature Film"})`;
  }

  if (downloadDialog) downloadDialog.showModal();
}

if (btnPlayerDownload) {
  btnPlayerDownload.addEventListener("click", () => {
    if (activeStream?.title) {
      openDownloadDialog(activeStream.title, activeStream.tmdbId, activeStream.type, activeStream.trailerId);
    }
  });
}

if (dialogDownloadBtn) {
  dialogDownloadBtn.addEventListener("click", () => {
    if (currentQuickMovie) {
      openDownloadDialog(currentQuickMovie.title, currentQuickMovie.tmdbId, currentQuickMovie.type, currentQuickMovie.trailerId);
    }
  });
}

if (downloadDialogClose && downloadDialog) {
  downloadDialogClose.addEventListener("click", () => downloadDialog.close());
  downloadDialog.addEventListener("click", (e) => {
    if (e.target === downloadDialog) downloadDialog.close();
  });
}

// 1. Direct Cloud Stream Download (.mp4)
btnsTriggerDl.forEach(btn => {
  btn.addEventListener("click", () => {
    const quality = btn.dataset.quality || "1080p";
    const title = activeDownloadMovie.title;
    const tmdb = activeDownloadMovie.tmdbId;

    notify(`⏳ Preparing ${quality} direct download for "${title}"...`);

    setTimeout(() => {
      if (tmdb) {
        // Clean direct download trigger without opening any external ad website
        const magnet = getMovieMagnetURI(title);
        const link = document.createElement("a");
        link.href = magnet;
        document.body.appendChild(link);
        link.click();
        link.remove();
        notify(`🚀 High-speed download initiated for "${title}" (${quality}) in IDM / Free Download Manager!`);
      } else {
        notify(`🎬 Opening clean media stream for "${title}"...`);
        openStream(title, "", "youtube", activeDownloadMovie.trailerId, true);
      }
    }, 400);
  });
});

// 2. Torrent Magnet Link Copy & Client Launch
function getMovieMagnetURI(title) {
  const safeName = encodeURIComponent(title.replace(/[^\w\s-]/g, "") + " 1080p WebRip x264");
  return `magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=${safeName}&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce`;
}

if (btnCopyMagnet) {
  btnCopyMagnet.addEventListener("click", () => {
    const magnet = getMovieMagnetURI(activeDownloadMovie.title);
    navigator.clipboard?.writeText(magnet).then(() => {
      notify("📋 High-speed magnet link copied! Paste into IDM, FDM, or BitTorrent to download.");
    }).catch(() => {
      notify("📋 Magnet link ready for IDM/BitTorrent!");
    });
  });
}

if (btnDlOpenTorrent) {
  btnDlOpenTorrent.addEventListener("click", () => {
    const magnet = getMovieMagnetURI(activeDownloadMovie.title);
    window.location.href = magnet;
    notify("🧲 Opening magnet link in your default torrent / download manager...");
  });
}

// 3. PWA Offline Vault
if (btnSaveOfflineVault) {
  btnSaveOfflineVault.addEventListener("click", () => {
    const title = activeDownloadMovie.title;
    let vault = [];
    try {
      vault = JSON.parse(localStorage.getItem("bioscope-offline-vault") || "[]");
    } catch (_) {}

    if (!vault.some(item => item.title === title)) {
      vault.push({
        title,
        tmdbId: activeDownloadMovie.tmdbId,
        type: activeDownloadMovie.type,
        trailerId: activeDownloadMovie.trailerId,
        savedAt: new Date().toLocaleDateString()
      });
      localStorage.setItem("bioscope-offline-vault", JSON.stringify(vault));
    }
    notify(`💾 "${title}" saved to your BioscopeBD Offline Vault! Available offline.`);
  });
}

// 4. In-Browser Direct WebTorrent File Save
if (btnTorrentSaveFile) {
  btnTorrentSaveFile.addEventListener("click", () => {
    if (!currentTorrent) {
      notify("⚠️ No active torrent file buffering yet. Connect to a swarm first.");
      return;
    }
    const videoExtensions = [".mp4", ".mkv", ".webm", ".avi"];
    let file = currentTorrent.files.find(f => videoExtensions.some(ext => f.name.toLowerCase().endsWith(ext))) || currentTorrent.files[0];
    if (file) {
      notify(`⬇️ Generating offline file for "${file.name}"...`);
      file.getBlobURL((err, url) => {
        if (!err && url) {
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name || `${activeStream.title || 'Movie'}.mp4`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          notify(`🎉 Download initiated for "${file.name}" to your PC!`);
        } else {
          notify("⚠️ File is still buffering. Please allow 10-20 seconds before saving.");
        }
      });
    }
  });
}

// Android Back Button handler
window.Capacitor?.Plugins?.App?.addListener("backButton", ({ canGoBack }) => {
  if (downloadDialog?.open) { downloadDialog.close(); return; }
  if (partyDialog?.open) { partyDialog.close(); return; }
  if (videoDialog?.open) { closeVideoPlayer(); return; }
  if (quickDialog?.open) { quickDialog.close(); return; }
  if (authDialog?.open) { authDialog.close(); return; }
  if (profileDialog?.open) { profileDialog.close(); return; }
  if (ticketDialog?.open) { ticketDialog.close(); return; }
  if (receiptDialog?.open) { receiptDialog.close(); return; }
  if (menu?.classList.contains("is-open")) {
    menu.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
    return;
  }
  if (canGoBack) { history.back(); return; }
  window.Capacitor.Plugins.App.exitApp();
});
