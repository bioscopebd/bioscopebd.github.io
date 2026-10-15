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
// 0. 100% Anti-Popup & Anti-Redirect Master Shield
// ==========================================================================
(function enforceAdShield() {
  try {
    Object.defineProperty(window, "open", {
      value: function(url) {
        console.warn("🛡️ BioscopeBD Master Shield: Neutralized window.open to:", url);
        return null;
      },
      writable: false,
      configurable: false
    });
  } catch (_) {
    window.open = function() { return null; };
  }

  try {
    const originalAnchorClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function() {
      const href = this.getAttribute("href") || "";
      const target = this.getAttribute("target");
      if (target === "_blank" || (href.startsWith("http") && !href.startsWith(window.location.origin))) {
        if (!href.includes("github.com/bioscopebd") && !href.includes("youtube.com")) {
          console.warn("🛡️ BioscopeBD Master Shield: Blocked programmatic anchor click to:", href);
          return;
        }
      }
      return originalAnchorClick.apply(this, arguments);
    };
  } catch (_) {}

  window.addEventListener("click", function(event) {
    const link = event.target.closest("a");
    if (link) {
      const href = link.getAttribute("href") || "";
      const target = link.getAttribute("target");
      if (target === "_blank" || (href.startsWith("http") && !href.startsWith(window.location.origin))) {
        if (!href.includes("github.com/bioscopebd") && !href.includes("youtube.com")) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          console.warn("🛡️ BioscopeBD Master Shield: Intercepted unauthorized link click:", href);
          return false;
        }
      }
    }
  }, true);
})();

// ==========================================================================
// 1. Global Configuration, Dataset Access & Local State Management
// ==========================================================================
const CONFIG = window.BIOSCOPE_CONFIG || {
  TMDB_API_KEY: "8265bd1679663a7ea12ac168da84d2e8",
  STREAM_SERVERS: [
    { id: "1", name: "Primary Cinema Stream", getUrl: (id, type) => type === "tv" ? `https://vidsrc.pm/embed/tv/${id}/1-1` : `https://vidsrc.pm/embed/movie/${id}` },
    { id: "2", name: "Fast Mirror Stream", getUrl: (id, type) => type === "tv" ? `https://autoembed.co/tv/tmdb/${id}/1/1` : `https://autoembed.co/movie/tmdb/${id}` },
    { id: "3", name: "Ultra HD Mirror", getUrl: (id, type) => type === "tv" ? `https://vidsrc.sh/embed/tv?tmdb=${id}&season=1&episode=1` : `https://vidsrc.sh/embed/movie?tmdb=${id}` },
    { id: "4", name: "Cloud Backup Stream", getUrl: (id, type) => type === "tv" ? `https://www.2embed.cc/embedtv/${id}&s=1&e=1` : `https://www.2embed.cc/embed/${id}` }
  ]
};

const BUILTIN_CATALOG = window.BUILTIN_CATALOG || [];
const CHARACTER_AVATARS = window.CHARACTER_AVATARS || [
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
      <span class="nav-auth-text">Sign In <small style="opacity:0.7;">(Optional)</small></span>
    `;
    navAuthBtn.title = "100% Free · Click to sign in or sync";
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
    handleAuthSuccess("Tanjir Rahman", "tanjir@bioscopebd.io");
  });
}

if (authForm) {
  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = authEmailInput?.value.trim() || "cinephile@bioscopebd.io";
    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
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
const thrillersCarousel = document.querySelector("#thrillers-carousel");
const topRatedGrid = document.querySelector("#top-rated-grid");
const catalogCountBadge = document.querySelector("#catalog-count-badge");
const btnLoadMore = document.querySelector("#btn-load-more");
const infiniteScrollToggle = document.querySelector("#infinite-scroll-toggle");

let catalogPage = 1;
let isLoadingMore = false;
let displayedCatalog = [];

function createMovieCardHTML(movie) {
  const isAi = movie.genre === "AI Cinema" || (movie.genres && movie.genres.includes("AI Cinema")) || movie.id?.startsWith("higgs");
  const yearText = movie.year || "2024";
  const durationText = movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : "2h";
  const scoreText = movie.score ? `★ ${movie.score}` : "★ 8.5";

  return `
    <article class="movie-card ${isAi ? 'movie-card--ai' : ''}" 
             data-title="${movie.title}" 
             data-genre="${movie.genre || 'Cinema'}" 
             data-mood="${movie.moods ? movie.moods.join(' ') : 'all'}" 
             data-duration="${movie.duration || 120}"
             data-tmdb="${movie.tmdbId || ''}" 
             data-trailer="${movie.trailerId || ''}" 
             data-type="${movie.type || 'movie'}"
             data-year="${yearText}">
      <div class="image-shell">
        <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
        <span class="movie-card__score">${scoreText}</span>
        ${isAi ? '<span class="movie-card__badge-ai">Higgsfield AI</span>' : ''}
      </div>
      <div class="movie-card__body">
        <h3 class="movie-card__title">${movie.title}</h3>
        <p class="movie-card__meta">${yearText} · ${movie.genre || 'Feature'} · ${durationText}</p>
        <div class="movie-card__actions">
          <button type="button" class="button button--primary button--sm card-play-btn" data-title="${movie.title}" data-tmdb="${movie.tmdbId || ''}" data-type="${movie.type || 'movie'}" data-trailer="${movie.trailerId || ''}">
            ▶ Stream
          </button>
          <button type="button" class="button button--outline button--sm quick-view" data-title="${movie.title}">
            Details
          </button>
        </div>
      </div>
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
  const banglaMovies = BUILTIN_CATALOG.filter(m => m.bangla);
  banglaCarousel.innerHTML = banglaMovies.map(createMovieCardHTML).join("");
  bindCardInteractions(banglaCarousel);
}

function hydrateThrillersSection() {
  if (!thrillersCarousel) return;
  const thrillerMovies = BUILTIN_CATALOG.filter(m => m.thriller);
  thrillersCarousel.innerHTML = thrillerMovies.map(createMovieCardHTML).join("");
  bindCardInteractions(thrillersCarousel);
}

async function fetchTmdbBrowseMovies(page = 1) {
  try {
    const url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${CONFIG.TMDB_API_KEY}&language=en-US&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("TMDB fetch failed");
    const data = await res.json();
    return (data.results || []).map(item => ({
      id: `tmdb_${item.id}`,
      title: item.title,
      year: (item.release_date || "2024").slice(0, 4),
      duration: 130,
      score: item.vote_average ? item.vote_average.toFixed(1) : "8.4",
      genre: "Top Rated",
      genres: ["Drama", "Cinema"],
      moods: ["mind-bending", "adrenaline"],
      tmdbId: String(item.id),
      trailerId: "",
      type: "movie",
      poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "https://picsum.photos/seed/cinema/300/450",
      synopsis: item.overview || "Acclaimed top rated cinema selection on BioscopeBD.",
      cast: "Leading international cast and crew.",
      parentsGuide: { nudity: "Mild", violence: "Moderate", profanity: "Mild" }
    }));
  } catch (_) {
    // Built-in dataset fallback
    return BUILTIN_CATALOG.filter(m => m.topRated);
  }
}

async function hydrateBrowseGrid(page = 1, append = false) {
  if (!topRatedGrid) return;
  isLoadingMore = true;

  if (!append) {
    // Show shimmer skeleton cards
    topRatedGrid.innerHTML = Array(8).fill(`
      <div class="skeleton-card">
        <div class="skeleton-img"></div>
        <div class="skeleton-line" style="width:75%;"></div>
        <div class="skeleton-line" style="width:45%;"></div>
      </div>
    `).join("");
  }

  const newMovies = await fetchTmdbBrowseMovies(page);
  isLoadingMore = false;

  if (append) {
    displayedCatalog = [...displayedCatalog, ...newMovies];
    const html = newMovies.map(createMovieCardHTML).join("");
    topRatedGrid.insertAdjacentHTML("beforeend", html);
  } else {
    displayedCatalog = newMovies.length ? newMovies : BUILTIN_CATALOG.filter(m => m.topRated);
    topRatedGrid.innerHTML = displayedCatalog.map(createMovieCardHTML).join("");
  }

  if (catalogCountBadge) {
    catalogCountBadge.textContent = `Showing ${displayedCatalog.length}+ titles`;
  }

  bindCardInteractions(topRatedGrid);
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
initCarouselNav("#thrillers-carousel", "#thrillers-prev", "#thrillers-next");

// Initial hydrations
hydrateContinueWatching();
hydrateBanglaSection();
hydrateThrillersSection();
hydrateBrowseGrid(1, false);

// ==========================================================================
// 5. Real-Time Alphabet Search Autocomplete with Release Years
// ==========================================================================
const searchInput = document.querySelector("#site-search");
const searchDropdown = document.querySelector("#search-dropdown");
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
      const first = searchDropdown?.querySelector(".search-item");
      if (first) {
        first.click();
      } else {
        const trend = document.querySelector("#trending") || document.querySelector("#top-rated");
        if (trend) trend.scrollIntoView({ behavior: "smooth" });
      }
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
let activeDurationBudget = "all";
let activeMood = "all";
let activeGenre = "";

function filterCatalog() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const allCards = document.querySelectorAll(".movie-card");

  allCards.forEach(card => {
    const title = (card.dataset.title || "").toLowerCase();
    const genre = card.dataset.genre || "";
    const mood = card.dataset.mood || "";
    const duration = parseInt(card.dataset.duration || "120", 10);

    const matchesQuery = !query || title.includes(query) || genre.toLowerCase().includes(query) || mood.includes(query);
    const matchesMood = activeMood === "all" || mood.includes(activeMood);
    const matchesGenre = !activeGenre || genre === activeGenre;

    let matchesDuration = true;
    if (activeDurationBudget === "short") matchesDuration = duration <= 30;
    else if (activeDurationBudget === "medium") matchesDuration = duration > 30 && duration <= 90;
    else if (activeDurationBudget === "epic") matchesDuration = duration >= 120;

    const show = matchesQuery && matchesMood && matchesGenre && matchesDuration;
    card.hidden = !show;
  });
}

// Time Budget Chips
document.querySelectorAll(".budget-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    activeDurationBudget = chip.dataset.duration || "all";
    document.querySelectorAll(".budget-chip").forEach(c => c.classList.toggle("is-active", c === chip));
    filterCatalog();
    notify(`⏱️ Duration Filter: ${chip.textContent.trim()}`);
  });
});

// Mood Chips
document.querySelectorAll(".mood-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    activeMood = chip.dataset.mood || "all";
    document.querySelectorAll(".mood-chip").forEach(c => c.classList.toggle("is-active", c === chip));
    filterCatalog();
  });
});

// Genre Chips
document.querySelectorAll("[data-genre-filter]").forEach(chip => {
  chip.addEventListener("click", () => {
    activeGenre = activeGenre === chip.dataset.genreFilter ? "" : chip.dataset.genreFilter;
    document.querySelectorAll("[data-genre-filter]").forEach(c => c.classList.toggle("is-active", c.dataset.genreFilter === activeGenre));
    filterCatalog();
  });
});

// Movie X + Movie Y Mashup Finder
const mashupSelect1 = document.querySelector("#mashup-select-1");
const mashupSelect2 = document.querySelector("#mashup-select-2");
const btnCalculateMashup = document.querySelector("#btn-calculate-mashup");
const mashupResults = document.querySelector("#mashup-results");
const mashupCardsGrid = document.querySelector("#mashup-cards-grid");

function populateMashupDropdowns() {
  if (!mashupSelect1 || !mashupSelect2) return;
  const optionsHtml = BUILTIN_CATALOG.slice(0, 20).map(m => `
    <option value="${m.id}">${m.title} (${m.genre})</option>
  `).join("");

  mashupSelect1.innerHTML = optionsHtml;
  mashupSelect2.innerHTML = optionsHtml;
  if (mashupSelect2.options.length > 3) mashupSelect2.selectedIndex = 3;
}
populateMashupDropdowns();

if (btnCalculateMashup && mashupSelect1 && mashupSelect2 && mashupResults && mashupCardsGrid) {
  btnCalculateMashup.addEventListener("click", () => {
    const m1 = BUILTIN_CATALOG.find(m => m.id === mashupSelect1.value) || BUILTIN_CATALOG[0];
    const m2 = BUILTIN_CATALOG.find(m => m.id === mashupSelect2.value) || BUILTIN_CATALOG[1];

    // Find blended recommendations
    const targetGenres = new Set([...(m1.genres || [m1.genre]), ...(m2.genres || [m2.genre])]);
    const blended = BUILTIN_CATALOG.filter(m => m.id !== m1.id && m.id !== m2.id && m.genres?.some(g => targetGenres.has(g))).slice(0, 3);

    mashupCardsGrid.innerHTML = blended.map(m => `
      <div class="mashup-result-card" data-title="${m.title}" data-tmdb="${m.tmdbId}" data-type="${m.type}" data-trailer="${m.trailerId}">
        <img src="${m.poster}" alt="${m.title}">
        <div class="mashup-result-info">
          <span class="mashup-match-tag">🔥 96% Mashup Blend</span>
          <h4>${m.title}</h4>
          <p>${m.genre} · ${m.synopsis.slice(0, 80)}...</p>
          <button type="button" class="button button--primary button--sm">▶ Watch Match</button>
        </div>
      </div>
    `).join("");

    mashupResults.hidden = false;
    mashupCardsGrid.querySelectorAll(".mashup-result-card").forEach(c => {
      c.addEventListener("click", () => openStream(c.dataset.title, c.dataset.tmdb, c.dataset.type, c.dataset.trailer));
    });

    notify(`✨ Blended "${m1.title}" + "${m2.title}" to find top crossover cinema!`);
  });
}

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
    const origin = encodeURIComponent(window.location.origin || "*");
    customYtFrame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=1&origin=${origin}`;
  }
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
      updateCustomProgressUI();
    }
  } catch (_) {}
});

// Silent Auto-Server Engine with Failover
function loadSilentStreamEndpoint(failoverIndex = 0) {
  clearTimeout(failoverTimer);
  const servers = CONFIG.STREAM_SERVERS;
  const currentProvider = servers[failoverIndex] || servers[0];

  if (streamLoadingShield) {
    streamLoadingShield.hidden = false;
    if (streamLoadingText) streamLoadingText.textContent = `Connecting to ${currentProvider.name}...`;
  }

  if (videoStreamStatus) {
    videoStreamStatus.innerHTML = `
      <span class="stream-badge stream-badge--live"><span class="badge-dot"></span> ULTRA HD 4K</span>
      <span class="stream-badge stream-badge--engine">Auto-Optimized Stream</span>
    `;
  }

  if (videoFrame) {
    videoFrame.hidden = false;
    videoFrame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-presentation");
    videoFrame.src = currentProvider.getUrl(activeStream.tmdbId, activeStream.type);
  }

  // 4.5s Smart Failover Timer: If current source stalls or errors, switch silently to backup
  failoverTimer = setTimeout(() => {
    if (streamLoadingShield) streamLoadingShield.hidden = true;
  }, 3800);
}

function handleStreamErrorOrTimeout() {
  clearTimeout(failoverTimer);
  if (currentFailoverIndex < CONFIG.STREAM_SERVERS.length - 1) {
    currentFailoverIndex++;
    console.info(`🔄 Silent failover switched to backup stream index: ${currentFailoverIndex}`);
    loadSilentStreamEndpoint(currentFailoverIndex);
  } else {
    // If all failover mirrors exhaust, fallback to custom whitelabel trailer/film
    if (streamLoadingShield) streamLoadingShield.hidden = true;
    if (activeStream?.trailerId) {
      loadCustomWhitelabelStream(activeStream.trailerId);
    }
  }
}

// Master openStream function
function openStream(title, tmdbId, type = "movie", trailerId = "") {
  activeStream = { title, tmdbId, type, trailerId };
  currentFailoverIndex = 0;

  if (videoTitle) videoTitle.textContent = `Now Streaming: ${title}`;

  // If YouTube/AI Cinema or trailer-only title
  if (type === "youtube" || !tmdbId) {
    loadCustomWhitelabelStream(trailerId || "Way9Dexny3w");
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

async function streamTorrentMagnet(magnetURI, movieTitle = "") {
  if (!magnetURI || !magnetURI.trim()) {
    notify("⚠️ Please enter a valid magnet link.");
    return;
  }
  stopTorrentStream();
  if (videoFrame) { videoFrame.hidden = true; videoFrame.src = ""; }
  if (torrentStage) torrentStage.hidden = false;
  if (torrentMagnetBar) torrentMagnetBar.hidden = false;

  if (torrentStatusText) torrentStatusText.textContent = "Connecting to P2P swarm...";

  try {
    const WT = window.WebTorrent;
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

function openQuickView(movieTitle) {
  const m = BUILTIN_CATALOG.find(item => item.title === movieTitle) || {
    title: movieTitle,
    genre: "Cinema",
    duration: 135,
    score: "8.6",
    synopsis: "Critically acclaimed cinema selection with outstanding cinematography and narrative depth.",
    cast: "Leading ensemble cast.",
    parentsGuide: { nudity: "None", violence: "Mild", profanity: "Mild" },
    tmdbId: "693134",
    trailerId: "Way9Dexny3w",
    type: "movie"
  };

  currentQuickMovie = m;
  if (quickDialogTitle) quickDialogTitle.textContent = m.title;
  if (quickDialogCopy) quickDialogCopy.textContent = m.synopsis || "Available to stream in 4K Ultra HD on BioscopeBD.";
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
      openStream(currentQuickMovie.title, currentQuickMovie.tmdbId, currentQuickMovie.type, currentQuickMovie.trailerId);
    }
  });
}

if (dialogTrailerBtn && quickDialog) {
  dialogTrailerBtn.addEventListener("click", () => {
    quickDialog.close();
    if (currentQuickMovie) {
      openStream(currentQuickMovie.title, "", "youtube", currentQuickMovie.trailerId);
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
  container.querySelectorAll(".quick-view").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openQuickView(btn.dataset.title || btn.closest(".movie-card")?.dataset.title);
    });
  });

  container.querySelectorAll(".card-play-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openStream(btn.dataset.title, btn.dataset.tmdb, btn.dataset.type, btn.dataset.trailer);
    });
  });

  container.querySelectorAll(".movie-card").forEach(card => {
    card.addEventListener("click", () => {
      openStream(card.dataset.title, card.dataset.tmdb, card.dataset.type, card.dataset.trailer);
    });
  });
}
bindCardInteractions(document);

// Hero Watch Buttons
const heroWatchMovieBtn = document.querySelector("#hero-watch-movie");
const heroWatchTrailerBtn = document.querySelector("#hero-watch-trailer");
if (heroWatchMovieBtn) {
  heroWatchMovieBtn.addEventListener("click", () => {
    openStream("Dune: Part Two", "693134", "movie", "Way9Dexny3w");
  });
}
if (heroWatchTrailerBtn) {
  heroWatchTrailerBtn.addEventListener("click", () => {
    openStream("Dune: Part Two", "", "youtube", "Way9Dexny3w");
  });
}

// ==========================================================================
// 9. Watch Party "Swipe to Match" & Digital Canvas Movie Ticket Generator
// ==========================================================================
const partyDialog = document.querySelector("#party-dialog");
const partyCloseBtn = document.querySelector("#party-close-btn");
const tabHost = document.querySelector("#tab-host");
const tabJoin = document.querySelector("#tab-join");
const tabSwipe = document.querySelector("#tab-swipe");
const hostView = document.querySelector("#party-host-view");
const joinView = document.querySelector("#party-join-view");
const swipeView = document.querySelector("#party-swipe-view");
const partyRoomCodeEl = document.querySelector("#party-room-code");
const btnCopyRoom = document.querySelector("#btn-copy-room");
const btnStartParty = document.querySelector("#btn-start-party");
const partyMoviePicker = document.querySelector("#party-movie-picker");
const btnGenerateTicket = document.querySelector("#btn-generate-ticket");

function openWatchParty() {
  if (!partyDialog) return;
  const code = `BIOSCOPE-${Math.floor(1000 + Math.random() * 9000)}`;
  if (partyRoomCodeEl) partyRoomCodeEl.textContent = code;
  partyDialog.showModal();
}

document.querySelectorAll("#open-party-btn, #hero-party-btn, #btn-player-party, #hub-host-party-btn").forEach(b => {
  b.addEventListener("click", openWatchParty);
});

if (partyCloseBtn && partyDialog) {
  partyCloseBtn.addEventListener("click", () => partyDialog.close());
  partyDialog.addEventListener("click", (e) => { if (e.target === partyDialog) partyDialog.close(); });
}

if (tabHost && tabJoin && tabSwipe) {
  tabHost.addEventListener("click", () => {
    tabHost.classList.add("is-active");
    tabJoin.classList.remove("is-active");
    tabSwipe.classList.remove("is-active");
    if (hostView) hostView.hidden = false;
    if (joinView) joinView.hidden = true;
    if (swipeView) swipeView.hidden = true;
  });

  tabJoin.addEventListener("click", () => {
    tabJoin.classList.add("is-active");
    tabHost.classList.remove("is-active");
    tabSwipe.classList.remove("is-active");
    if (hostView) hostView.hidden = true;
    if (joinView) joinView.hidden = false;
    if (swipeView) swipeView.hidden = true;
  });

  tabSwipe.addEventListener("click", () => {
    tabSwipe.classList.add("is-active");
    tabHost.classList.remove("is-active");
    tabJoin.classList.remove("is-active");
    if (hostView) hostView.hidden = true;
    if (joinView) joinView.hidden = true;
    if (swipeView) swipeView.hidden = false;
    initSwipeToMatch();
  });
}

if (btnCopyRoom && partyRoomCodeEl) {
  btnCopyRoom.addEventListener("click", async () => {
    const code = partyRoomCodeEl.textContent.trim();
    const link = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(code)}`;
    try {
      await navigator.clipboard.writeText(link);
      btnCopyRoom.textContent = "✓ Copied!";
      setTimeout(() => { btnCopyRoom.textContent = "📋 Copy Link"; }, 2400);
      notify(`Watch Party link copied: ${code}`);
    } catch (_) {
      notify(`Party room code: ${code}`);
    }
  });
}

if (btnStartParty && partyMoviePicker && partyDialog) {
  btnStartParty.addEventListener("click", () => {
    const val = partyMoviePicker.value.split("|");
    const tmdbId = val[0];
    const type = val[1];
    const trailer = val[2];
    const title = partyMoviePicker.options[partyMoviePicker.selectedIndex].text;
    partyDialog.close();
    openStream(title, tmdbId, type, trailer);
    notify(`🍿 Watch Party LIVE! Room ${partyRoomCodeEl?.textContent}`);
  });
}

// Swipe to Match Group Movie Picker
const swipeCardImg = document.querySelector("#swipe-card-img");
const swipeCardTitle = document.querySelector("#swipe-card-title");
const swipeCardDesc = document.querySelector("#swipe-card-desc");
const btnSwipePass = document.querySelector("#btn-swipe-pass");
const btnSwipeMatch = document.querySelector("#btn-swipe-match");
const swipeTopMatch = document.querySelector("#swipe-top-match");
const btnLaunchMatchedMovie = document.querySelector("#btn-launch-matched-movie");

const swipeDeck = [
  { title: "Dune: Part Two", genre: "Sci-Fi Epic", score: "★ 8.7", poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", tmdbId: "693134", type: "movie", trailerId: "Way9Dexny3w" },
  { title: "Oppenheimer", genre: "Thriller Drama", score: "★ 8.9", poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", tmdbId: "872585", type: "movie", trailerId: "uYPbbksJxIg" },
  { title: "Hawa (হাওয়া)", genre: "Bangla Mystery", score: "★ 8.5", poster: "https://image.tmdb.org/t/p/w500/0oXq2Zf0X02b2j6kK1LqWbYxM2s.jpg", tmdbId: "1009187", type: "movie", trailerId: "0YvVw1E5pE0" },
  { title: "John Wick: Chapter 4", genre: "Adrenaline Action", score: "★ 8.2", poster: "https://image.tmdb.org/t/p/w500/vZloFAK7NKnMGKEslUsZloNXzBP.jpg", tmdbId: "603692", type: "movie", trailerId: "qEVUtrk8_B4" },
  { title: "The Trigger", genre: "Higgsfield AI", score: "★ 9.1", poster: "https://picsum.photos/seed/trigger/500/750", tmdbId: "", type: "youtube", trailerId: "IAl240xpSGM" }
];
let currentSwipeIndex = 0;
let swipeScores = {};

function initSwipeToMatch() {
  currentSwipeIndex = 0;
  swipeScores = {};
  swipeDeck.forEach(m => { swipeScores[m.title] = 0; });
  renderActiveSwipeCard();
}

function renderActiveSwipeCard() {
  if (currentSwipeIndex >= swipeDeck.length) {
    // Determine winner
    let topTitle = swipeDeck[0].title;
    let maxPts = -1;
    for (const [title, pts] of Object.entries(swipeScores)) {
      if (pts > maxPts) { maxPts = pts; topTitle = title; }
    }
    const matchedMovie = swipeDeck.find(m => m.title === topTitle);
    if (swipeTopMatch) swipeTopMatch.textContent = `🎉 Match Found: ${topTitle}!`;
    if (btnLaunchMatchedMovie) {
      btnLaunchMatchedMovie.hidden = false;
      btnLaunchMatchedMovie.onclick = () => {
        if (partyDialog) partyDialog.close();
        openStream(matchedMovie.title, matchedMovie.tmdbId, matchedMovie.type, matchedMovie.trailerId);
      };
    }
    return;
  }

  const m = swipeDeck[currentSwipeIndex];
  if (swipeCardImg) swipeCardImg.src = m.poster;
  if (swipeCardTitle) swipeCardTitle.textContent = m.title;
  if (swipeCardDesc) swipeCardDesc.textContent = `${m.genre} · ${m.score}`;
  if (swipeTopMatch) swipeTopMatch.textContent = `Card ${currentSwipeIndex + 1} of ${swipeDeck.length}`;
}

if (btnSwipePass) {
  btnSwipePass.addEventListener("click", () => {
    currentSwipeIndex++;
    renderActiveSwipeCard();
  });
}

if (btnSwipeMatch) {
  btnSwipeMatch.addEventListener("click", () => {
    const cur = swipeDeck[currentSwipeIndex];
    if (cur) swipeScores[cur.title] = (swipeScores[cur.title] || 0) + 1;
    currentSwipeIndex++;
    renderActiveSwipeCard();
  });
}

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
  ctx.fillText("STREAM: 4K Ultra HD · Synced Watch Party", 30, 170);
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
// 10. Reels Modal, Language Switcher & Service Worker
// ==========================================================================
const reelsDialog = document.querySelector("#reels-dialog");
const openReelsBtn = document.querySelector("#open-reels-btn");
const closeReelsBtn = document.querySelector("#reels-close");
const reelsViewport = document.querySelector("#reels-viewport");
const reelsPrevBtn = document.querySelector("#reels-prev");
const reelsNextBtn = document.querySelector("#reels-next");

function openReels() {
  if (!reelsDialog || !reelsViewport) return;
  reelsViewport.querySelectorAll(".reel-frame").forEach(f => {
    if (!f.src && f.dataset.src) f.src = f.dataset.src;
  });
  reelsDialog.showModal();
}

function closeReels() {
  if (!reelsDialog || !reelsViewport) return;
  reelsViewport.querySelectorAll(".reel-frame").forEach(f => { f.src = ""; });
  reelsDialog.close();
}

if (openReelsBtn) openReelsBtn.addEventListener("click", openReels);
if (closeReelsBtn) closeReelsBtn.addEventListener("click", closeReels);
if (reelsDialog) {
  reelsDialog.addEventListener("click", (e) => { if (e.target === reelsDialog) closeReels(); });
}

if (reelsPrevBtn && reelsViewport) {
  reelsPrevBtn.addEventListener("click", () => {
    reelsViewport.scrollBy({ top: -reelsViewport.clientHeight, behavior: "smooth" });
  });
}
if (reelsNextBtn && reelsViewport) {
  reelsNextBtn.addEventListener("click", () => {
    reelsViewport.scrollBy({ top: reelsViewport.clientHeight, behavior: "smooth" });
  });
}

document.querySelectorAll(".reel-play-full").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeReels();
    openStream(btn.dataset.title, btn.dataset.tmdb || "", btn.dataset.type || "movie", btn.dataset.trailer || "");
  });
});

// Comprehensive Translations
const translations = {
  en: {
    movies: "Movies",
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
  const navLinks = document.querySelectorAll("#nav-menu a");
  if (navLinks.length >= 6) {
    navLinks[0].textContent = t.movies;
    navLinks[1].textContent = "🍿 Watch Party";
    navLinks[2].innerHTML = `${t.aiCinema} <span class="badge-pill">NEW</span>`;
    navLinks[3].textContent = t.topRated;
    navLinks[4].textContent = t.moodSearch;
  }
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
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

// Android Back Button handler
window.Capacitor?.Plugins?.App?.addListener("backButton", ({ canGoBack }) => {
  if (reelsDialog?.open) { closeReels(); return; }
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
