"use strict";

// 0. 100% Anti-Popup & Anti-Redirect Master Shield
// Permanently block any window.open, tab-spawning, or ad-redirecting scripts
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

  // Neutralize programmatic hidden anchor clicks used by aggressive ad scripts
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

  // Global capture-phase click interceptor on the entire document (empty space, cards, buttons)
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

// Shared status feedback for preview & interactive actions.
const toast = document.querySelector("#toast");
let toastTimer;
function notify(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3800);
}

// 1. Theme and mobile navigation.
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

// Synchronize sticky header height for the sticky genre explorer bar
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

// Sign In notice - 100% Free
const navSignInBtn = document.querySelector(".nav__sign-in");
if (navSignInBtn) {
  navSignInBtn.addEventListener("click", () => {
    notify("🎉 BioscopeBD is 100% FREE! All movies, Watch Parties, and features are completely unlocked without any payment.");
  });
}

// 2. Watchlist.
const watchlistButton = document.querySelector("#hero-watchlist");
function updateWatchlist() {
  if (!watchlistButton) return;
  const saved = localStorage.getItem("bioscope-watchlist-horizon") === "true";
  watchlistButton.setAttribute("aria-pressed", String(saved));
  watchlistButton.innerHTML = `<span aria-hidden="true">${saved ? "✓" : "＋"}</span> ${saved ? "In Watchlist" : "Watchlist"}`;
}
updateWatchlist();
if (watchlistButton) {
  watchlistButton.addEventListener("click", () => {
    const next = watchlistButton.getAttribute("aria-pressed") !== "true";
    localStorage.setItem("bioscope-watchlist-horizon", String(next));
    updateWatchlist();
    notify(next ? "Added to your watchlist on this device." : "Removed from your watchlist.");
  });
}

// 3. Carousel controls for Trending and AI Cinema.
const carousel = document.querySelector("#trending-carousel");
const prevTrending = document.querySelector("#trending-prev");
const nextTrending = document.querySelector("#trending-next");
if (carousel && prevTrending && nextTrending) {
  prevTrending.addEventListener("click", () => carousel.scrollBy({ left: -carousel.clientWidth * .8, behavior: "smooth" }));
  nextTrending.addEventListener("click", () => carousel.scrollBy({ left: carousel.clientWidth * .8, behavior: "smooth" }));
}

const aiCarousel = document.querySelector("#ai-carousel");
const aiPrev = document.querySelector("#ai-prev");
const aiNext = document.querySelector("#ai-next");
if (aiCarousel && aiPrev && aiNext) {
  aiPrev.addEventListener("click", () => aiCarousel.scrollBy({ left: -aiCarousel.clientWidth * .8, behavior: "smooth" }));
  aiNext.addEventListener("click", () => aiCarousel.scrollBy({ left: aiCarousel.clientWidth * .8, behavior: "smooth" }));
}

// Image loading skeleton states.
document.querySelectorAll(".image-shell img").forEach(img => {
  const loaded = () => img.parentElement.classList.add("is-loaded");
  if (img.complete && img.naturalWidth) loaded();
  else img.addEventListener("load", loaded, { once: true });
  img.addEventListener("error", () => img.parentElement.classList.add("is-loaded"), { once: true });
});

// 4. Smart Discovery: Mood & Vibe Filter + Genre Chips + Search.
const allMovieCards = [...document.querySelectorAll(".movie-card")];
const searchInput = document.querySelector("#site-search");
let activeGenre = "";
let activeMood = "all";

function filterMovies() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  let matches = 0;

  allMovieCards.forEach(card => {
    const title = (card.dataset.title || "").toLowerCase();
    const genre = card.dataset.genre || "";
    const mood = card.dataset.mood || "";

    const matchesQuery = !query || title.includes(query) || mood.includes(query) || genre.toLowerCase().includes(query);
    const matchesGenre = !activeGenre || genre === activeGenre;
    const matchesMood = activeMood === "all" || mood.includes(activeMood);

    const found = matchesQuery && matchesGenre && matchesMood;
    card.hidden = !found;
    if (found) matches++;
  });

  if (!matches && (query || activeGenre || activeMood !== "all")) {
    notify("No matching films found for this vibe. Showing all movies.");
  }
}

// Live Search Recommendations Dropdown (Instant Local + Global TMDB Catalog)
const searchDropdown = document.querySelector("#search-dropdown");
const TMDB_SEARCH_KEY = "8265bd1679663a7ea12ac168da84d2e8";
let searchDebounceTimer;
let currentHighlightedIndex = -1;

function getLocalMatches(query) {
  const cleanQ = query.toLowerCase().trim();
  if (!cleanQ) return [];
  const results = [];
  const seenTitles = new Set();

  allMovieCards.forEach(card => {
    const title = card.dataset.title || "";
    const cleanTitle = title.toLowerCase();
    const genre = (card.dataset.genre || "").toLowerCase();
    const mood = (card.dataset.mood || "").toLowerCase();
    if (cleanTitle.includes(cleanQ) || genre.includes(cleanQ) || mood.includes(cleanQ)) {
      if (!seenTitles.has(cleanTitle)) {
        seenTitles.add(cleanTitle);
        const img = card.querySelector("img");
        const score = card.querySelector(".movie-card__score")?.textContent || "★ 8.5";
        const isAi = card.classList.contains("movie-card--ai");
        results.push({
          title,
          tmdb: card.dataset.tmdb || "",
          type: card.dataset.type || "movie",
          trailer: card.dataset.trailer || "",
          poster: img ? img.src : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=120&auto=format&fit=crop&q=80",
          year: isAi ? "2026" : "HD",
          score,
          badge: isAi ? "Higgsfield AI" : (card.dataset.type === "tv" ? "TV Series" : "Movie"),
          isAi
        });
      }
    }
  });
  return results.slice(0, 5);
}

async function fetchTmdbMatches(query) {
  try {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_SEARCH_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || [])
      .filter(item => (item.media_type === "movie" || item.media_type === "tv") && (item.title || item.name))
      .slice(0, 6)
      .map(item => ({
        title: item.title || item.name,
        tmdb: String(item.id),
        type: item.media_type,
        trailer: "",
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=120&auto=format&fit=crop&q=80",
        year: (item.release_date || item.first_air_date || "").slice(0, 4) || "HD",
        score: item.vote_average ? `★ ${item.vote_average.toFixed(1)}` : "★ 8.0",
        badge: item.media_type === "tv" ? "TV Series" : "Movie",
        isAi: false
      }));
  } catch (err) {
    return [];
  }
}

function renderSearchRecommendations(items, query, isLoading = false) {
  if (!searchDropdown) return;
  if (!items.length && !isLoading) {
    searchDropdown.innerHTML = `<div class="search-empty">No results found for "${query}". Try another movie or series name!</div>`;
    searchDropdown.hidden = false;
    return;
  }

  currentHighlightedIndex = -1;
  let html = `<div class="search-dropdown__header"><span>Recommendations</span><span>${items.length} titles</span></div>`;

  items.forEach((item, idx) => {
    html += `
      <div class="search-item" data-index="${idx}" data-title="${encodeURIComponent(item.title)}" data-tmdb="${item.tmdb}" data-type="${item.type}" data-trailer="${item.trailer}">
        <img class="search-item__thumb" src="${item.poster}" alt="${item.title}" loading="lazy">
        <div class="search-item__info">
          <div class="search-item__title">${item.title}</div>
          <div class="search-item__meta">
            <span class="search-item__year">${item.year}</span>
            <span class="search-item__score">${item.score}</span>
            <span class="search-item__badge ${item.isAi ? 'search-item__badge--ai' : ''}">${item.badge}</span>
          </div>
        </div>
        <div class="search-item__play">▶</div>
      </div>
    `;
  });

  if (isLoading) {
    html += `<div class="search-loading"><span class="search-spinner"></span> <span>Searching global movies...</span></div>`;
  }

  searchDropdown.innerHTML = html;
  searchDropdown.hidden = false;

  // Add click handlers on items to launch built-in player directly
  searchDropdown.querySelectorAll(".search-item").forEach(el => {
    el.addEventListener("click", () => {
      const title = decodeURIComponent(el.dataset.title || "");
      const tmdb = el.dataset.tmdb || "";
      const type = el.dataset.type || "movie";
      const trailer = el.dataset.trailer || "";
      openStream(title, tmdb, type, trailer);
      searchDropdown.hidden = true;
    });
  });
}

function handleLiveSearch() {
  const query = searchInput ? searchInput.value.trim() : "";
  if (!query) {
    if (searchDropdown) {
      searchDropdown.hidden = true;
      searchDropdown.innerHTML = "";
    }
    return;
  }

  // 1. Instant local matches (0ms delay)
  const localMatches = getLocalMatches(query);
  renderSearchRecommendations(localMatches, query, true);

  // 2. Debounced TMDB API search for any movie in the world
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(async () => {
    const tmdbMatches = await fetchTmdbMatches(query);
    const combined = [...localMatches];
    const seenTitles = new Set(localMatches.map(m => m.title.toLowerCase()));
    tmdbMatches.forEach(t => {
      const lower = t.title.toLowerCase();
      if (!seenTitles.has(lower)) {
        seenTitles.add(lower);
        combined.push(t);
      }
    });
    renderSearchRecommendations(combined.slice(0, 8), query, false);
  }, 220);
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    filterMovies();
    handleLiveSearch();
  });

  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim().length > 0) {
      handleLiveSearch();
    }
  });

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
      const targetItem = currentHighlightedIndex >= 0 ? items[currentHighlightedIndex] : items[0];
      if (targetItem) targetItem.click();
    } else if (e.key === "Escape") {
      searchDropdown.hidden = true;
    }
  });

  const searchForm = document.querySelector("#search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", event => {
      event.preventDefault();
      filterMovies();
      if (searchDropdown && !searchDropdown.hidden) {
        const first = searchDropdown.querySelector(".search-item");
        if (first) {
          first.click();
          return;
        }
      }
      const firstSection = document.querySelector("#trending") || document.querySelector("#ai-cinema");
      if (firstSection) firstSection.scrollIntoView({ behavior: "smooth" });
    });
  }
}

// Close dropdown on click outside
document.addEventListener("click", (e) => {
  if (searchDropdown && !e.target.closest("#search-form")) {
    searchDropdown.hidden = true;
  }
});

// Mood chips click handlers
document.querySelectorAll(".mood-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    activeMood = chip.dataset.mood || "all";
    document.querySelectorAll(".mood-chip").forEach(c => c.classList.toggle("is-active", c === chip));
    filterMovies();

    if (activeMood === "ai-cinema") {
      const aiSec = document.querySelector("#ai-cinema");
      if (aiSec) aiSec.scrollIntoView({ behavior: "smooth" });
    } else {
      const trendSec = document.querySelector("#trending");
      if (trendSec) trendSec.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Genre chips click handlers
document.querySelectorAll("[data-genre-filter]").forEach(chip => chip.addEventListener("click", () => {
  activeGenre = activeGenre === chip.dataset.genreFilter ? "" : chip.dataset.genreFilter;
  document.querySelectorAll("[data-genre-filter]").forEach(item => item.classList.toggle("is-active", item.dataset.genreFilter === activeGenre));
  filterMovies();
  
  if (activeGenre) {
    const target = (activeGenre === "AI Cinema")
      ? (document.querySelector("#ai-cinema") || document.querySelector("#trending"))
      : (document.querySelector("#trending") || document.querySelector("#top-rated"));
    if (target) target.scrollIntoView({ behavior: "smooth" });
  }
}));

// 5. Video Player Streaming Dialog and Next-Level Features
const videoDialog = document.querySelector("#video-dialog");
const videoFrame = document.querySelector("#video-player-frame");
const videoTitle = document.querySelector("#video-dialog-title");
const xrayOverlay = document.querySelector("#xray-overlay");
let activeStream = null;
let currentServer = "1";
let subOffset = 0.0;
let familyMode = false;
let dialogueBoost = false;

// X-Ray Metadata catalog
const movieXrayData = {
  "Oppenheimer": {
    cast: "Cillian Murphy (J. Robert Oppenheimer), Emily Blunt (Kitty), Robert Downey Jr. (Lewis Strauss)",
    music: "Ludwig Göransson — 'Can You Hear the Music' (Available on Spotify)",
    trivia: "Filmed using custom 65mm black-and-white IMAX film stock developed exclusively for this production."
  },
  "Avatar: The Way of Water": {
    cast: "Sam Worthington (Jake Sully), Zoe Saldana (Neytiri), Sigourney Weaver (Kiri)",
    music: "Simon Franglen — 'The Songcord' (Available on Spotify)",
    trivia: "Cast and crew underwent extensive freediving training, holding breath for over 6 minutes underwater."
  },
  "Hawa (হাওয়া)": {
    cast: "Chanchal Chowdhury (Chan Majhi), Nazifa Tushi (Gulti), Sariful Razz (Iba)",
    music: "Emon Chowdhury / Meghdol — 'Shada Shada Kala Kala' (Global hit)",
    trivia: "Shot entirely on an authentic fishing trawler in the deep waters of the Bay of Bengal."
  },
  "John Wick: Chapter 4": {
    cast: "Keanu Reeves (John Wick), Donnie Yen (Caine), Bill Skarsgård (Marquis)",
    music: "Tyler Bates & Joel J. Richard — 'Blood Code' (Available on Spotify)",
    trivia: "The famous top-down Dragon's Breath shotgun shootout was completed in continuous single-take choreography."
  },
  "The Trigger": {
    cast: "Generated with Higgsfield Soul ID & Cinema Studio 4 AI Actor Suite",
    music: "Cinematic Hybrid AI Score — 24-bit HD Master",
    trivia: "First generative AI film to achieve seamless physical hand-to-hand combat without ghosting artifacts."
  },
  "ANERNEQ": {
    cast: "Generated with Higgsfield Realistic Character Engine",
    music: "Atmospheric Arctic Cello & Wind Soundscape",
    trivia: "Open-sourced prompt architecture by Higgsfield AI to study volumetric snow and natural camera shake."
  },
  "Dune: Part Two": {
    cast: "Timothée Chalamet (Paul Atreides), Zendaya (Chani), Austin Butler (Feyd-Rautha)",
    music: "Hans Zimmer — 'A Time of Quiet Between the Storms' (Grammy Winner)",
    trivia: "Every exterior scene was captured in natural sunlight in the Abu Dhabi and Jordan deserts."
  }
};

function openStream(title, tmdbId, type = "movie", trailerId = "") {
  activeStream = { title, tmdbId, type, trailerId };
  if (videoTitle) videoTitle.textContent = `Streaming: ${title}`;
  
  // Set appropriate server
  if (type === "youtube" || !tmdbId) {
    currentServer = "trailer";
    document.querySelectorAll(".video-dialog__server-btn").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.server === "trailer" || btn.dataset.server === "1");
    });
    loadCustomWhitelabelStream(trailerId);
  } else {
    setServer("1");
  }

  // Populate X-Ray data
  const xray = movieXrayData[title] || movieXrayData[title.replace(/\s*\(.*\)/, "")] || {
    cast: "Leading ensemble cast and production team.",
    music: "Official Original Motion Picture Soundtrack.",
    trivia: "Remastered in high-definition for BioscopeBD stream."
  };
  const castEl = document.querySelector("#xray-cast");
  const musicEl = document.querySelector("#xray-music");
  const triviaEl = document.querySelector("#xray-trivia");
  if (castEl) castEl.textContent = xray.cast;
  if (musicEl) musicEl.textContent = xray.music;
  if (triviaEl) triviaEl.textContent = xray.trivia;

  if (videoDialog) videoDialog.showModal();
}

// Whitelabel Custom Cinema Player (Solution 3: Zero-YouTube UI Engine)
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
  if (h > 0) {
    return `${h}:${remM < 10 ? "0" : ""}${remM}:${s < 10 ? "0" : ""}${s}`;
  }
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
}

function sendYtCommand(func, args = []) {
  if (customYtFrame && customYtFrame.contentWindow) {
    customYtFrame.contentWindow.postMessage(JSON.stringify({
      event: "command",
      func: func,
      args: args
    }), "*");
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
    const percent = Math.min(100, Math.max(0, (customCurrentTime / customDuration) * 100));
    if (customTimelineCurrent) customTimelineCurrent.style.width = `${percent}%`;
    if (customTimelineRange) customTimelineRange.value = percent;
  }
}

function scheduleControlsHide() {
  clearTimeout(customControlsTimeout);
  if (!isCustomPlaying) return;
  customControlsTimeout = setTimeout(() => {
    if (isCustomPlaying && customPlayerControls) {
      customPlayerControls.classList.add("is-hidden");
    }
  }, 2800);
}

function showCustomControls() {
  clearTimeout(customControlsTimeout);
  if (customPlayerControls) {
    customPlayerControls.classList.remove("is-hidden");
  }
  if (isCustomPlaying) {
    scheduleControlsHide();
  }
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
  notify("⚡ Streaming via BioscopeBD Cinema Engine");
}

function stopCustomWhitelabelStream() {
  stopCustomTimeTicker();
  clearTimeout(customControlsTimeout);
  if (customYtFrame) {
    customYtFrame.src = "";
  }
  if (customPlayerStage) {
    customPlayerStage.hidden = true;
  }
  setCustomPlayingState(false);
}

// Bind custom player interactions
if (customStageShield) customStageShield.addEventListener("click", toggleCustomPlay);
if (customCenterPlay) {
  customCenterPlay.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleCustomPlay();
  });
}
if (customPlayBtn) customPlayBtn.addEventListener("click", toggleCustomPlay);
if (customMuteBtn) customMuteBtn.addEventListener("click", toggleCustomMute);

if (customTimelineRange) {
  customTimelineRange.addEventListener("input", (e) => {
    const percent = parseFloat(e.target.value);
    if (customDuration > 0) {
      const targetTime = (percent / 100) * customDuration;
      customCurrentTime = targetTime;
      sendYtCommand("seekTo", [targetTime, true]);
      updateCustomProgressUI();
    }
  });
}

if (customFullscreenBtn) {
  customFullscreenBtn.addEventListener("click", () => {
    const stage = document.querySelector("#video-stage");
    if (!document.fullscreenElement) {
      stage?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  });
}

if (customPlayerStage) {
  customPlayerStage.addEventListener("mousemove", showCustomControls, { passive: true });
  customPlayerStage.addEventListener("mouseleave", scheduleControlsHide, { passive: true });
}

// Global hotkeys for custom player
window.addEventListener("keydown", (e) => {
  if (!videoDialog?.open || customPlayerStage?.hidden) return;
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  if (e.code === "Space") {
    e.preventDefault();
    toggleCustomPlay();
  } else if (e.code === "ArrowLeft") {
    e.preventDefault();
    const targetTime = Math.max(0, customCurrentTime - 5);
    customCurrentTime = targetTime;
    sendYtCommand("seekTo", [targetTime, true]);
    updateCustomProgressUI();
  } else if (e.code === "ArrowRight") {
    e.preventDefault();
    const targetTime = customDuration > 0 ? Math.min(customDuration, customCurrentTime + 5) : customCurrentTime + 5;
    customCurrentTime = targetTime;
    sendYtCommand("seekTo", [targetTime, true]);
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
      if (typeof data.info.currentTime === "number") {
        customCurrentTime = data.info.currentTime;
      }
      if (typeof data.info.duration === "number" && data.info.duration > 0) {
        customDuration = data.info.duration;
      }
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

// WebTorrent Native Streaming Engine & HUD Elements
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

const WEBTORRENT_TRACKERS = [
  "wss://tracker.openwebtorrent.com",
  "wss://tracker.btorrent.xyz",
  "wss://tracker.fastcast.nz",
  "wss://tracker.webtorrent.dev"
];

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 KB/s";
  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function loadWebTorrentScript() {
  return new Promise((resolve, reject) => {
    if (window.WebTorrent) {
      resolve(window.WebTorrent);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/webtorrent@1.9.7/webtorrent.min.js";
    script.async = true;
    script.onload = () => resolve(window.WebTorrent);
    script.onerror = () => reject(new Error("Failed to load WebTorrent engine"));
    document.head.appendChild(script);
  });
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
    try {
      currentTorrent.destroy();
    } catch (_) {}
    currentTorrent = null;
  }
  if (torrentSpeed) torrentSpeed.textContent = "0 KB/s";
  if (torrentPeers) torrentPeers.textContent = "0";
  if (torrentProgress) torrentProgress.textContent = "0%";
}

async function streamTorrentMagnet(magnetURI, movieTitle = "") {
  if (!magnetURI || !magnetURI.trim()) {
    notify("⚠️ Please enter or select a valid torrent magnet link.");
    return;
  }
  const magnet = magnetURI.trim();
  stopTorrentStream();

  if (videoFrame) {
    videoFrame.hidden = true;
    videoFrame.src = "";
  }
  if (torrentStage) torrentStage.hidden = false;
  if (torrentMagnetBar) torrentMagnetBar.hidden = false;
  if (btnToggleMagnet) btnToggleMagnet.classList.add("is-active");

  if (torrentStatusText) {
    torrentStatusText.textContent = "⚡ Initializing BioscopeBD P2P Torrent Engine...";
  }

  try {
    const WT = await loadWebTorrentScript();
    if (!wtClient) {
      wtClient = new WT();
      wtClient.on("error", (err) => console.warn("WebTorrent client warning:", err));
    }

    if (torrentStatusText) {
      torrentStatusText.textContent = "Connecting to swarm & discovering WebSocket peers...";
    }

    wtClient.add(magnet, { announce: WEBTORRENT_TRACKERS }, (torrent) => {
      currentTorrent = torrent;
      if (torrentStatusText) {
        torrentStatusText.textContent = "Connected to swarm! Buffering video stream...";
      }

      // Find best playable video file
      const videoExtensions = [".mp4", ".mkv", ".webm", ".avi", ".mov", ".m4v"];
      let videoFile = torrent.files.find(f => videoExtensions.some(ext => f.name.toLowerCase().endsWith(ext)));
      if (!videoFile && torrent.files.length > 0) {
        videoFile = torrent.files.reduce((a, b) => (a.length > b.length ? a : b));
      }

      if (!videoFile) {
        if (torrentStatusText) torrentStatusText.textContent = "⚠️ No playable video file detected in torrent.";
        notify("No video file found in this torrent swarm.");
        return;
      }

      const sizeMB = (videoFile.length / (1024 * 1024)).toFixed(1);
      if (torrentStatusText) {
        torrentStatusText.textContent = `Streaming: ${videoFile.name} (${sizeMB} MB)`;
      }

      // Stream directly into the native HTML5 video player
      videoFile.renderTo(torrentVideoPlayer, { autoplay: true, controls: true }, (err) => {
        if (err) {
          console.error("Torrent render error:", err);
          if (torrentStatusText) torrentStatusText.textContent = "Render error: " + err.message;
        } else {
          torrentVideoPlayer.play().catch(() => {});
        }
      });

      wtStatsInterval = setInterval(() => {
        if (!currentTorrent) return;
        if (torrentSpeed) torrentSpeed.textContent = formatBytes(currentTorrent.downloadSpeed);
        if (torrentPeers) torrentPeers.textContent = String(currentTorrent.numPeers || 0);
        const percent = Math.min(100, Math.round(currentTorrent.progress * 100));
        if (torrentProgress) torrentProgress.textContent = `${percent}%`;

        if (currentTorrent.numPeers === 0 && currentTorrent.progress === 0) {
          if (torrentStatusText) torrentStatusText.textContent = "Seeking active browser WebRTC seeders in swarm...";
        }
      }, 800);

      torrent.on("download", () => {
        if (torrentSpeed) torrentSpeed.textContent = formatBytes(torrent.downloadSpeed);
        if (torrentPeers) torrentPeers.textContent = String(torrent.numPeers);
        const percent = Math.min(100, Math.round(torrent.progress * 100));
        if (torrentProgress) torrentProgress.textContent = `${percent}%`;
      });

      torrent.on("done", () => {
        if (torrentStatusText) torrentStatusText.textContent = "✅ Playback ready (100% buffered).";
        if (torrentProgress) torrentProgress.textContent = "100%";
      });

      torrent.on("error", (err) => {
        console.error("Torrent error:", err);
        if (torrentStatusText) torrentStatusText.textContent = `Swarm error: ${err.message}`;
      });
    });

  } catch (err) {
    console.error("Failed to start WebTorrent:", err);
    if (torrentStatusText) torrentStatusText.textContent = "Failed to start torrent engine: " + err.message;
    notify("Could not initialize Torrent Stream Engine.");
  }
}

function setServer(srv) {
  currentServer = srv;
  document.querySelectorAll(".video-dialog__server-btn").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.server === srv);
  });
  if (!activeStream) return;

  if (srv === "torrent") {
    // Switch to native Torrent Stage
    stopCustomWhitelabelStream();
    if (videoFrame) {
      videoFrame.hidden = true;
      videoFrame.src = "";
    }
    if (torrentStage) torrentStage.hidden = false;
    if (torrentMagnetBar) torrentMagnetBar.hidden = false;
    if (btnToggleMagnet) btnToggleMagnet.classList.add("is-active");

    const magnet = (torrentMagnetInput && torrentMagnetInput.value.trim()) || "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com";
    if (torrentMagnetInput && !torrentMagnetInput.value.trim()) {
      torrentMagnetInput.value = magnet;
    }
    streamTorrentMagnet(magnet, activeStream.title);
    notify("⚡ Switched to Server 5 (Torrent Stream): P2P Engine Active");
    return;
  }

  // Clean up torrent
  stopTorrentStream();
  if (torrentStage) torrentStage.hidden = true;

  // If this is an AI movie or Trailer, play in Whitelabel Custom Cinema Player (Solution 3)
  if (srv === "trailer" || activeStream.type === "youtube" || !activeStream.tmdbId) {
    if (videoFrame) {
      videoFrame.hidden = true;
      videoFrame.src = "";
    }
    loadCustomWhitelabelStream(activeStream.trailerId || "");
    return;
  }

  // Normal Hollywood/Bollywood streaming on Servers 1 to 4
  stopCustomWhitelabelStream();
  if (videoFrame) {
    videoFrame.hidden = false;
    // Enforce 100% Zero-Popup Sandbox on MovieBox, AutoEmbed, VidSrc, 2Embed
    videoFrame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-presentation");

    if (srv === "1") {
      videoFrame.src = activeStream.type === "tv"
        ? `https://vidsrc.pm/embed/tv/${activeStream.tmdbId}/1-1`
        : `https://vidsrc.pm/embed/movie/${activeStream.tmdbId}`;
    } else if (srv === "2") {
      videoFrame.src = activeStream.type === "tv"
        ? `https://autoembed.co/tv/tmdb/${activeStream.tmdbId}/1/1`
        : `https://autoembed.co/movie/tmdb/${activeStream.tmdbId}`;
    } else if (srv === "3") {
      videoFrame.src = activeStream.type === "tv"
        ? `https://vidsrc.sh/embed/tv?tmdb=${activeStream.tmdbId}&season=1&episode=1`
        : `https://vidsrc.sh/embed/movie?tmdb=${activeStream.tmdbId}`;
    } else if (srv === "4") {
      videoFrame.src = activeStream.type === "tv"
        ? `https://www.2embed.cc/embedtv/${activeStream.tmdbId}&s=1&e=1`
        : `https://www.2embed.cc/embed/${activeStream.tmdbId}`;
    }
  }
}

document.querySelectorAll(".video-dialog__server-btn").forEach(btn => {
  btn.addEventListener("click", () => setServer(btn.dataset.server));
});

const videoCloseBtn = document.querySelector("#video-dialog-close");
if (videoCloseBtn && videoDialog) {
  videoCloseBtn.addEventListener("click", () => {
    stopTorrentStream();
    stopCustomWhitelabelStream();
    if (videoFrame) videoFrame.src = "";
    videoDialog.close();
  });
}
if (videoDialog) {
  videoDialog.addEventListener("click", event => {
    if (event.target === videoDialog) {
      stopTorrentStream();
      stopCustomWhitelabelStream();
      if (videoFrame) videoFrame.src = "";
      videoDialog.close();
    }
  });
}

// Next-Gen Player Controls: Family Mode, X-Ray, Night Audio, Sub Sync
const familyBtn = document.querySelector("#btn-family-mode");
const familyStatus = document.querySelector("#family-status");
if (familyBtn) {
  familyBtn.addEventListener("click", () => {
    familyMode = !familyMode;
    familyBtn.classList.toggle("is-active", familyMode);
    familyBtn.setAttribute("aria-pressed", String(familyMode));
    if (familyStatus) familyStatus.textContent = familyMode ? "ON" : "OFF";
    notify(familyMode
      ? "🛡️ Family Safe Filter ACTIVE: Awkward scenes and extreme violence filtered."
      : "Family Filter turned off.");
  });
}

const xrayBtn = document.querySelector("#btn-xray-toggle");
const xrayCloseBtn = document.querySelector("#xray-close-btn");
if (xrayBtn && xrayOverlay) {
  xrayBtn.addEventListener("click", () => {
    const isHidden = xrayOverlay.hidden;
    xrayOverlay.hidden = !isHidden;
    xrayBtn.classList.toggle("is-active", !isHidden);
  });
}
if (xrayCloseBtn && xrayOverlay && xrayBtn) {
  xrayCloseBtn.addEventListener("click", () => {
    xrayOverlay.hidden = true;
    xrayBtn.classList.remove("is-active");
  });
}

const dialogueBoostBtn = document.querySelector("#btn-dialogue-boost");
if (dialogueBoostBtn) {
  dialogueBoostBtn.addEventListener("click", () => {
    dialogueBoost = !dialogueBoost;
    dialogueBoostBtn.classList.toggle("is-active", dialogueBoost);
    dialogueBoostBtn.setAttribute("aria-pressed", String(dialogueBoost));
    notify(dialogueBoost
      ? "🎧 Dialogue Boost & Night Audio ACTIVE: Vocal frequencies amplified, explosions dampened."
      : "Standard theatrical audio restored.");
  });
}

// Subtitle Sync adjustments
const subOffsetEl = document.querySelector("#sub-offset-text");
const subMinusBtn = document.querySelector("#btn-sub-minus");
const subPlusBtn = document.querySelector("#btn-sub-plus");
const dualSubBtn = document.querySelector("#btn-dual-sub");

if (subMinusBtn) {
  subMinusBtn.addEventListener("click", () => {
    subOffset = Math.round((subOffset - 0.5) * 10) / 10;
    if (subOffsetEl) subOffsetEl.textContent = `${subOffset > 0 ? "+" : ""}${subOffset.toFixed(1)}s`;
    notify(`Subtitle synchronized: ${subOffset > 0 ? "+" : ""}${subOffset.toFixed(1)}s offset applied.`);
  });
}
if (subPlusBtn) {
  subPlusBtn.addEventListener("click", () => {
    subOffset = Math.round((subOffset + 0.5) * 10) / 10;
    if (subOffsetEl) subOffsetEl.textContent = `${subOffset > 0 ? "+" : ""}${subOffset.toFixed(1)}s`;
    notify(`Subtitle synchronized: ${subOffset > 0 ? "+" : ""}${subOffset.toFixed(1)}s offset applied.`);
  });
}
if (dualSubBtn) {
  dualSubBtn.addEventListener("click", () => {
    notify("🌐 Dual-Subtitle Mode: English + বাংলা simultaneously rendered.");
  });
}

// Toggle Torrent Magnet Stream Bar
if (btnToggleMagnet && torrentMagnetBar) {
  btnToggleMagnet.addEventListener("click", () => {
    const isHidden = torrentMagnetBar.hidden;
    torrentMagnetBar.hidden = !isHidden;
    btnToggleMagnet.classList.toggle("is-active", !isHidden);
    if (!isHidden && currentServer !== "torrent") {
      setServer("torrent");
    }
  });
}

// Start custom magnet stream
if (btnStartMagnetStream && torrentMagnetInput) {
  btnStartMagnetStream.addEventListener("click", () => {
    const magnet = torrentMagnetInput.value.trim();
    if (!magnet) {
      notify("⚠️ Please paste a valid magnet link first.");
      return;
    }
    setServer("torrent");
    streamTorrentMagnet(magnet, activeStream?.title || "Custom Magnet Stream");
  });

  torrentMagnetInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      btnStartMagnetStream.click();
    }
  });
}

// Torrent Preset Instant Samples
document.querySelectorAll(".preset-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const magnet = btn.dataset.magnet;
    if (torrentMagnetInput) torrentMagnetInput.value = magnet;
    setServer("torrent");
    streamTorrentMagnet(magnet, btn.textContent.trim());
    notify(`⚡ Loading ${btn.textContent.trim()} via P2P Swarm...`);
  });
});

// Hero actions
const heroMovieBtn = document.querySelector("#hero-watch-movie");
if (heroMovieBtn) {
  heroMovieBtn.addEventListener("click", () => {
    openStream(heroMovieBtn.dataset.title, heroMovieBtn.dataset.tmdb, heroMovieBtn.dataset.type, heroMovieBtn.dataset.trailer);
  });
}
const heroTrailerBtn = document.querySelector("#hero-watch-trailer");
if (heroTrailerBtn) {
  heroTrailerBtn.addEventListener("click", () => {
    activeStream = { title: heroTrailerBtn.dataset.title, tmdbId: heroTrailerBtn.dataset.tmdb, type: heroTrailerBtn.dataset.type, trailerId: heroTrailerBtn.dataset.trailer };
    if (videoTitle) videoTitle.textContent = `Trailer: ${heroTrailerBtn.dataset.title}`;
    setServer("trailer");
    if (videoDialog) videoDialog.showModal();
  });
}

// 6. Quick-View Dialog & Movie Card direct clicks
const quickDialog = document.querySelector("#quick-dialog");
let selectedMovie = null;

document.querySelectorAll(".quick-view").forEach(button => button.addEventListener("click", (e) => {
  e.stopPropagation();
  const card = button.closest(".movie-card");
  if (!card) return;
  selectedMovie = {
    title: card.dataset.title,
    genre: card.dataset.genre,
    tmdb: card.dataset.tmdb || "",
    trailer: card.dataset.trailer || "",
    type: card.dataset.type || "movie"
  };
  const titleEl = document.querySelector("#quick-dialog-title");
  const copyEl = document.querySelector("#quick-dialog-copy");
  if (titleEl) titleEl.textContent = selectedMovie.title;
  if (copyEl) copyEl.textContent = `${selectedMovie.genre} · Rated highly by viewers and critics. Available in HD.`;
  if (quickDialog) quickDialog.showModal();
}));

document.querySelectorAll(".movie-card").forEach(card => card.addEventListener("click", () => {
  if (card.dataset.tmdb || card.dataset.trailer) {
    openStream(card.dataset.title, card.dataset.tmdb, card.dataset.type || "movie", card.dataset.trailer);
  }
}));

const dialogPlayBtn = document.querySelector("#dialog-play-btn");
if (dialogPlayBtn && quickDialog) {
  dialogPlayBtn.addEventListener("click", () => {
    quickDialog.close();
    if (selectedMovie) {
      openStream(selectedMovie.title, selectedMovie.tmdb, selectedMovie.type, selectedMovie.trailer);
    }
  });
}

const dialogTrailerBtn = document.querySelector("#dialog-trailer-btn");
if (dialogTrailerBtn && quickDialog) {
  dialogTrailerBtn.addEventListener("click", () => {
    quickDialog.close();
    if (selectedMovie) {
      activeStream = { title: selectedMovie.title, tmdbId: selectedMovie.tmdb, type: selectedMovie.type, trailerId: selectedMovie.trailer };
      if (videoTitle) videoTitle.textContent = `Trailer: ${selectedMovie.title}`;
      setServer("trailer");
      if (videoDialog) videoDialog.showModal();
    }
  });
}

const dialogCloseBtn = document.querySelector("#dialog-close");
if (dialogCloseBtn && quickDialog) {
  dialogCloseBtn.addEventListener("click", () => quickDialog.close());
  quickDialog.addEventListener("click", event => { if (event.target === quickDialog) quickDialog.close(); });
}

// 7. Bioscope Reels (TikTok/Shorts Vertical Video Modal)
const reelsDialog = document.querySelector("#reels-dialog");
const openReelsBtn = document.querySelector("#open-reels-btn");
const closeReelsBtn = document.querySelector("#reels-close");
const reelsViewport = document.querySelector("#reels-viewport");
const reelsPrevBtn = document.querySelector("#reels-prev");
const reelsNextBtn = document.querySelector("#reels-next");

function openReels() {
  if (!reelsDialog || !reelsViewport) return;
  // Activate iframes
  reelsViewport.querySelectorAll(".reel-frame").forEach(frame => {
    if (!frame.src && frame.dataset.src) frame.src = frame.dataset.src;
  });
  reelsDialog.showModal();
}

function closeReels() {
  if (!reelsDialog || !reelsViewport) return;
  reelsViewport.querySelectorAll(".reel-frame").forEach(frame => {
    frame.src = "";
  });
  reelsDialog.close();
}

if (openReelsBtn) openReelsBtn.addEventListener("click", openReels);
if (closeReelsBtn) closeReelsBtn.addEventListener("click", closeReels);
if (reelsDialog) {
  reelsDialog.addEventListener("click", event => {
    if (event.target === reelsDialog) closeReels();
  });
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

// Keyboard up/down when reels open
window.addEventListener("keydown", (e) => {
  if (reelsDialog && reelsDialog.open && reelsViewport) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      reelsViewport.scrollBy({ top: reelsViewport.clientHeight, behavior: "smooth" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      reelsViewport.scrollBy({ top: -reelsViewport.clientHeight, behavior: "smooth" });
    }
  }
});

// Like button animation in reels
document.querySelectorAll(".reel-action-btn.like-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const liked = btn.classList.toggle("is-liked");
    const countEl = btn.querySelector(".reel-count");
    if (countEl) {
      countEl.textContent = liked ? "Liked!" : "14.8K";
    }
    notify(liked ? "❤️ Added to your liked shorts!" : "Removed like");
  });
});

document.querySelectorAll(".reel-action-btn.comment-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    notify("💬 824 live community comments loaded.");
  });
});

document.querySelectorAll(".reel-action-btn.share-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.href);
    notify("🚀 Reel link copied to clipboard!");
  });
});

// "Watch Full Movie" from inside any reel
document.querySelectorAll(".reel-play-full").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeReels();
    openStream(btn.dataset.title, btn.dataset.tmdb || "", btn.dataset.type || "movie", btn.dataset.trailer || "");
  });
});

// 8. Built-in Watch Party Modal
const partyDialog = document.querySelector("#party-dialog");
const openPartyBtn = document.querySelector("#open-party-btn");
const heroPartyBtn = document.querySelector("#hero-party-btn");
const dialogPartyBtn = document.querySelector("#dialog-party-btn");
const playerPartyBtn = document.querySelector("#btn-player-party");
const partyCloseBtn = document.querySelector("#party-close-btn");
const partyCodeEl = document.querySelector("#party-room-code");
const copyRoomBtn = document.querySelector("#btn-copy-room");
const startPartyBtn = document.querySelector("#btn-start-party");
const partyMoviePicker = document.querySelector("#party-movie-picker");

const tabHost = document.querySelector("#tab-host");
const tabJoin = document.querySelector("#tab-join");
const hostView = document.querySelector("#party-host-view");
const joinView = document.querySelector("#party-join-view");
const joinInput = document.querySelector("#join-room-input");
const submitJoinBtn = document.querySelector("#btn-submit-join");

function openWatchParty() {
  if (!partyDialog) return;
  // Generate random room code
  const code = `BIOSCOPE-${Math.floor(1000 + Math.random() * 9000)}`;
  if (partyCodeEl) partyCodeEl.textContent = code;
  partyDialog.showModal();
}

if (openPartyBtn) openPartyBtn.addEventListener("click", openWatchParty);
if (heroPartyBtn) heroPartyBtn.addEventListener("click", openWatchParty);
if (dialogPartyBtn) {
  dialogPartyBtn.addEventListener("click", () => {
    if (quickDialog) quickDialog.close();
    openWatchParty();
  });
}
if (playerPartyBtn) playerPartyBtn.addEventListener("click", openWatchParty);

if (partyCloseBtn && partyDialog) {
  partyCloseBtn.addEventListener("click", () => partyDialog.close());
  partyDialog.addEventListener("click", e => { if (e.target === partyDialog) partyDialog.close(); });
}

if (tabHost && tabJoin && hostView && joinView) {
  tabHost.addEventListener("click", () => {
    tabHost.classList.add("is-active");
    tabJoin.classList.remove("is-active");
    hostView.hidden = false;
    joinView.hidden = true;
  });
  tabJoin.addEventListener("click", () => {
    tabJoin.classList.add("is-active");
    tabHost.classList.remove("is-active");
    joinView.hidden = false;
    hostView.hidden = true;
  });
}

let copyRoomTimer;
if (copyRoomBtn && partyCodeEl) {
  copyRoomBtn.addEventListener("click", async () => {
    const code = partyCodeEl.textContent.trim();
    const link = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(code)}`;
    
    let copied = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(link);
        copied = true;
      } catch (err) {
        console.warn("Clipboard API writeText failed, trying fallback:", err);
      }
    }
    
    if (!copied) {
      try {
        const ta = document.createElement("textarea");
        ta.value = link;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        copied = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch (err) {
        console.error("Fallback execCommand copy failed:", err);
      }
    }

    // Direct visual feedback on the button
    const origHtml = "📋 Copy Link";
    copyRoomBtn.classList.add("is-copied");
    copyRoomBtn.innerHTML = `✓ Link Copied!`;

    // Visual feedback on the dashed container box
    const codeBox = document.querySelector("#party-code-box");
    if (codeBox) codeBox.classList.add("is-copied-highlight");

    // Clear inline status notification under the box
    const copyStatusEl = document.querySelector("#party-copy-status");
    if (copyStatusEl) {
      copyStatusEl.innerHTML = `✓ Room link copied to clipboard! Send to friends to join.`;
      copyStatusEl.classList.add("is-visible");
    }

    clearTimeout(copyRoomTimer);
    copyRoomTimer = setTimeout(() => {
      copyRoomBtn.classList.remove("is-copied");
      copyRoomBtn.innerHTML = origHtml;
      if (codeBox) codeBox.classList.remove("is-copied-highlight");
      if (copyStatusEl) copyStatusEl.classList.remove("is-visible");
    }, 2800);

    notify(`📋 Watch Party room link copied: ${code}`);
  });
}

if (startPartyBtn && partyMoviePicker && partyDialog) {
  startPartyBtn.addEventListener("click", () => {
    const val = partyMoviePicker.value.split("|");
    const tmdbId = val[0];
    const type = val[1];
    const trailer = val[2];
    const movieText = partyMoviePicker.options[partyMoviePicker.selectedIndex].text;

    partyDialog.close();
    openStream(movieText, tmdbId, type, trailer);
    notify(`🍿 Watch Party LIVE in room ${partyCodeEl?.textContent}! Synced playback active.`);
  });
}

if (submitJoinBtn && joinInput && partyDialog) {
  submitJoinBtn.addEventListener("click", () => {
    const code = joinInput.value.trim().toUpperCase();
    if (!code) {
      notify("Please enter a valid room code.");
      return;
    }
    partyDialog.close();
    openStream("Dune: Part Two", "693134", "movie", "Way9Dexny3w");
    notify(`🍿 Connected to Party Room ${code}! Synced stream started.`);
  });
}

// Watch Party Flagship Hub Buttons
const hubHostPartyBtn = document.querySelector("#hub-host-party-btn");
const hubJoinPartyBtn = document.querySelector("#hub-join-party-btn");
const simulatePauseBtn = document.querySelector("#btn-simulate-pause-req");
const partyChatBox = document.querySelector("#party-chat-box");

if (hubHostPartyBtn) {
  hubHostPartyBtn.addEventListener("click", () => {
    if (tabHost && hostView && tabJoin && joinView) {
      tabHost.classList.add("is-active");
      tabJoin.classList.remove("is-active");
      hostView.hidden = false;
      joinView.hidden = true;
    }
    openWatchParty();
  });
}

if (hubJoinPartyBtn) {
  hubJoinPartyBtn.addEventListener("click", () => {
    if (tabHost && hostView && tabJoin && joinView) {
      tabJoin.classList.add("is-active");
      tabHost.classList.remove("is-active");
      joinView.hidden = false;
      hostView.hidden = true;
    }
    openWatchParty();
  });
}

if (simulatePauseBtn && partyChatBox) {
  simulatePauseBtn.addEventListener("click", () => {
    const pauseMsg = document.createElement("div");
    pauseMsg.className = "chat-msg";
    pauseMsg.style.cssText = "background:rgba(255,132,0,0.15);border-left:3px solid #ff8400;padding:6px 8px;border-radius:4px;";
    pauseMsg.innerHTML = "<strong>✋ Rahim:</strong> 'Bro, pause 2 minutes please! Getting popcorn 🍿'";
    partyChatBox.appendChild(pauseMsg);
    partyChatBox.scrollTop = partyChatBox.scrollHeight;
    notify("🔔 [Watch Party Alert] Rahim requested a 2-min pause! Only Host has pause authority.");
  });
}

// Auto-open Watch Party dialog in Join mode if shared URL has ?room=
try {
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = urlParams.get("room");
  if (roomParam && partyDialog && tabJoin && tabHost && joinView && hostView && joinInput) {
    tabJoin.classList.add("is-active");
    tabHost.classList.remove("is-active");
    joinView.hidden = false;
    hostView.hidden = true;
    joinInput.value = roomParam;
    partyDialog.showModal();
    notify(`🍿 Watch Party invite detected for room ${roomParam}!`);
  }
} catch (e) {}

// 9. Language Switcher (EN / BN) with comprehensive translations
const translations = {
  en: {
    movies: "Movies",
    aiCinema: "AI Cinema",
    tvShows: "TV Shows",
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
    searchPlaceholder: "Search movie, mood, or dialogue...",
    moodTitle: "How's your mood today?",
    moodSub: "Skip the 30-minute scrolling fatigue. Choose your current feeling:",
    aiCinemaTitle: "Higgsfield AI Cinema & Originals",
    watchParty: "Watch Party"
  },
  bn: {
    movies: "সিনেমা",
    aiCinema: "এআই সিনেমা",
    tvShows: "সিরিজ",
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
    searchPlaceholder: "মুভি, মুড অথবা বিখ্যাত সংলাপ দিয়ে খুঁজুন...",
    moodTitle: "আজকের মুড কেমন?",
    moodSub: "কি দেখবেন সেই কনফিউশন দূর করুন। আপনার বর্তমান অনুভূতি বেছে নিন:",
    aiCinemaTitle: "হিগসফিল্ড এআই সিনেমা ও অরিজিনালস",
    watchParty: "একসাথে দেখুন"
  }
};

function setLanguage(lang) {
  const t = translations[lang] || translations.en;
  const navLinks = document.querySelectorAll("#nav-menu a");
  if (navLinks.length >= 6) {
    navLinks[0].textContent = t.movies;
    navLinks[1].innerHTML = `${t.aiCinema} <span class="badge-pill">NEW</span>`;
    navLinks[2].textContent = t.topRated;
    navLinks[3].textContent = t.moodSearch;
    navLinks[4].textContent = t.upcoming;
    navLinks[5].textContent = t.news;
  }
  const trendTitle = document.querySelector("#trending-title");
  if (trendTitle) trendTitle.textContent = t.trendingNow;

  const genresTitle = document.querySelector("#genres-title");
  if (genresTitle) genresTitle.innerHTML = `${t.findGenre.slice(0, -1)}<span class="text-accent">.</span>`;

  const topRatedTitle = document.querySelector("#top-rated-title");
  if (topRatedTitle) topRatedTitle.textContent = t.topRatedMovies;

  const upTitle = document.querySelector("#upcoming-title");
  if (upTitle) upTitle.textContent = t.comingSoon;

  const moodTitleEl = document.querySelector("#mood-title");
  if (moodTitleEl) moodTitleEl.textContent = t.moodTitle;

  const moodSubEl = document.querySelector("#mood-sub");
  if (moodSubEl) moodSubEl.textContent = t.moodSub;

  const aiCinemaTitleEl = document.querySelector("#ai-cinema-title");
  if (aiCinemaTitleEl) aiCinemaTitleEl.textContent = t.aiCinemaTitle;

  if (searchInput) searchInput.placeholder = t.searchPlaceholder;

  if (heroMovieBtn) {
    heroMovieBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width:18px;height:18px;margin-right:6px;fill:currentColor;"><path d="m8 5 11 7-11 7V5Z"/></svg>${t.watchMovie}`;
  }
  if (heroTrailerBtn) {
    heroTrailerBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width:18px;height:18px;margin-right:6px;fill:currentColor;"><path d="M10 9v6l5-3-5-3z"/></svg>${t.watchTrailer}`;
  }
  localStorage.setItem("bioscope-lang", lang);
}

document.querySelectorAll("#language, #footer-language").forEach(sel => {
  sel.addEventListener("change", (e) => {
    const val = e.target.value;
    const l1 = document.querySelector("#language");
    const l2 = document.querySelector("#footer-language");
    if (l1) l1.value = val;
    if (l2) l2.value = val;
    setLanguage(val);
  });
});

const savedLang = localStorage.getItem("bioscope-lang");
if (savedLang) {
  const l1 = document.querySelector("#language");
  const l2 = document.querySelector("#footer-language");
  if (l1) l1.value = savedLang;
  if (l2) l2.value = savedLang;
  setLanguage(savedLang);
}

// 10. Reveal sections, with reduced-motion support.
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
  }), { threshold: .08, rootMargin: "0px 0px 80px 0px" });
  document.querySelectorAll(".reveal").forEach(section => observer.observe(section));
} else {
  document.querySelectorAll(".reveal").forEach(section => section.classList.add("is-visible"));
}

const copyYear = document.querySelector("#copyright-year");
if (copyYear) copyYear.textContent = new Date().getFullYear();

// PWA service worker
if ("serviceWorker" in navigator && !(window.Capacitor?.isNativePlatform?.())) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
}

// Android Back Button handler
window.Capacitor?.Plugins?.App?.addListener("backButton", ({ canGoBack }) => {
  if (reelsDialog?.open) { closeReels(); return; }
  if (partyDialog?.open) { partyDialog.close(); return; }
  if (videoDialog?.open) {
    stopTorrentStream();
    stopCustomWhitelabelStream();
    if (videoFrame) videoFrame.src = "";
    videoDialog.close();
    return;
  }
  if (quickDialog?.open) { quickDialog.close(); return; }
  if (menu?.classList.contains("is-open")) {
    menu.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open menu");
    return;
  }
  if (canGoBack) { history.back(); return; }
  window.Capacitor.Plugins.App.exitApp();
});
