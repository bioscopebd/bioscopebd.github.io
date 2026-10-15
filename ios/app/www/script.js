"use strict";

// Shared status feedback for preview-only actions.
const toast = document.querySelector("#toast");
let toastTimer;
function notify(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3600);
}

// 1. Theme and mobile navigation.
const themeButton = document.querySelector("#theme-toggle");
const savedTheme = localStorage.getItem("bioscope-theme");
if (savedTheme === "light" || savedTheme === "dark") document.body.dataset.theme = savedTheme;
function updateThemeButton() {
  const next = document.body.dataset.theme === "dark" ? "light" : "dark";
  themeButton.setAttribute("aria-label", `Switch to ${next} theme`);
  document.querySelector('meta[name="theme-color"]').content = document.body.dataset.theme === "dark" ? "#0b0b0f" : "#f6f5f1";
}
updateThemeButton();
themeButton.addEventListener("click", () => {
  document.body.dataset.theme = document.body.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("bioscope-theme", document.body.dataset.theme);
  updateThemeButton();
});
const menuButton = document.querySelector("#menu-toggle");
const menu = document.querySelector("#nav-menu");
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

// 2. Watchlist is stored locally until accounts are available.
const watchlistButton = document.querySelector("#hero-watchlist");
function updateWatchlist() {
  const saved = localStorage.getItem("bioscope-watchlist-horizon") === "true";
  watchlistButton.setAttribute("aria-pressed", String(saved));
  watchlistButton.innerHTML = `<span aria-hidden="true">${saved ? "✓" : "＋"}</span> ${saved ? "In Watchlist" : "Watchlist"}`;
}
updateWatchlist();
watchlistButton.addEventListener("click", () => {
  const next = watchlistButton.getAttribute("aria-pressed") !== "true";
  localStorage.setItem("bioscope-watchlist-horizon", String(next));
  updateWatchlist();
  notify(next ? "Added to your watchlist on this device." : "Removed from your watchlist.");
});

// 3. Carousel controls and image loading states.
const carousel = document.querySelector("#trending-carousel");
document.querySelector("#trending-prev").addEventListener("click", () => carousel.scrollBy({ left: -carousel.clientWidth * .8, behavior: "smooth" }));
document.querySelector("#trending-next").addEventListener("click", () => carousel.scrollBy({ left: carousel.clientWidth * .8, behavior: "smooth" }));
document.querySelectorAll(".image-shell img").forEach(img => {
  const loaded = () => img.parentElement.classList.add("is-loaded");
  if (img.complete && img.naturalWidth) loaded();
  else img.addEventListener("load", loaded, { once: true });
  img.addEventListener("error", () => img.parentElement.classList.add("is-loaded"), { once: true });
});

// 4. Search and genre chips filter the sample movie cards.
const movieCards = [...document.querySelectorAll(".movie-card")];
const searchInput = document.querySelector("#site-search");
let activeGenre = "";
function filterMovies() {
  const query = searchInput.value.trim().toLowerCase();
  let matches = 0;
  movieCards.forEach(card => {
    const found = (!query || card.dataset.title.toLowerCase().includes(query)) && (!activeGenre || card.dataset.genre === activeGenre);
    card.hidden = !found;
    if (found) matches++;
  });
  if (!matches && (query || activeGenre)) notify("No matching sample films. Try another title or genre.");
}
document.querySelector("#search-form").addEventListener("submit", event => {
  event.preventDefault();
  filterMovies();
  document.querySelector("#trending").scrollIntoView({ behavior: "smooth" });
});
searchInput.addEventListener("input", filterMovies);
document.querySelectorAll("[data-genre-filter]").forEach(chip => chip.addEventListener("click", () => {
  activeGenre = activeGenre === chip.dataset.genreFilter ? "" : chip.dataset.genreFilter;
  document.querySelectorAll("[data-genre-filter]").forEach(item => item.classList.toggle("is-active", item.dataset.genreFilter === activeGenre));
  filterMovies();
  document.querySelector("#top-rated").scrollIntoView({ behavior: "smooth" });
}));

// 5. Video Player Streaming Dialog and Quick-view
const videoDialog = document.querySelector("#video-dialog");
const videoFrame = document.querySelector("#video-player-frame");
const videoTitle = document.querySelector("#video-dialog-title");
let activeStream = null;
let currentServer = "1";

function openStream(title, tmdbId, type = "movie", trailerId = "") {
  activeStream = { title, tmdbId, type, trailerId };
  videoTitle.textContent = `Streaming: ${title}`;
  setServer(tmdbId ? "1" : "trailer");
  videoDialog.showModal();
}

function setServer(srv) {
  currentServer = srv;
  document.querySelectorAll(".video-dialog__server-btn").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.server === srv);
  });
  if (!activeStream) return;
  if (srv === "1") {
    videoFrame.src = activeStream.type === "tv"
      ? `https://vidsrc.cc/v2/embed/tv/${activeStream.tmdbId}/1/1`
      : `https://vidsrc.cc/v2/embed/movie/${activeStream.tmdbId}`;
  } else if (srv === "2") {
    videoFrame.src = activeStream.type === "tv"
      ? `https://multiembed.mov/?video_id=${activeStream.tmdbId}&tmdb=1&s=1&e=1`
      : `https://multiembed.mov/?video_id=${activeStream.tmdbId}&tmdb=1`;
  } else if (srv === "trailer") {
    if (activeStream.trailerId) {
      videoFrame.src = `https://www.youtube.com/embed/${activeStream.trailerId}?autoplay=1`;
    } else {
      videoFrame.src = `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(activeStream.title + " official trailer")}`;
    }
  }
}

document.querySelectorAll(".video-dialog__server-btn").forEach(btn => {
  btn.addEventListener("click", () => setServer(btn.dataset.server));
});

document.querySelector("#video-dialog-close").addEventListener("click", () => {
  videoFrame.src = "";
  videoDialog.close();
});
videoDialog.addEventListener("click", event => {
  if (event.target === videoDialog) {
    videoFrame.src = "";
    videoDialog.close();
  }
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
    videoTitle.textContent = `Official Trailer: ${heroTrailerBtn.dataset.title}`;
    setServer("trailer");
    videoDialog.showModal();
  });
}

// Quick-view dialog and Stream integration
const dialog = document.querySelector("#quick-dialog");
let selectedMovie = null;

document.querySelectorAll(".quick-view").forEach(button => button.addEventListener("click", (e) => {
  e.stopPropagation();
  const card = button.closest(".movie-card");
  selectedMovie = {
    title: card.dataset.title,
    genre: card.dataset.genre,
    tmdb: card.dataset.tmdb || "",
    trailer: card.dataset.trailer || "",
    type: card.dataset.type || "movie"
  };
  document.querySelector("#quick-dialog-title").textContent = selectedMovie.title;
  document.querySelector("#quick-dialog-copy").textContent = `${selectedMovie.genre} · Rated highly by viewers and critics. Available in HD.`;
  dialog.showModal();
}));

// Clicking a movie card directly opens streaming
document.querySelectorAll(".movie-card").forEach(card => card.addEventListener("click", () => {
  if (card.dataset.tmdb || card.dataset.trailer) {
    openStream(card.dataset.title, card.dataset.tmdb, card.dataset.type || "movie", card.dataset.trailer);
  }
}));

document.querySelector("#dialog-play-btn").addEventListener("click", () => {
  dialog.close();
  if (selectedMovie) {
    openStream(selectedMovie.title, selectedMovie.tmdb, selectedMovie.type, selectedMovie.trailer);
  }
});

document.querySelector("#dialog-trailer-btn").addEventListener("click", () => {
  dialog.close();
  if (selectedMovie) {
    activeStream = { title: selectedMovie.title, tmdbId: selectedMovie.tmdb, type: selectedMovie.type, trailerId: selectedMovie.trailer };
    videoTitle.textContent = `Trailer: ${selectedMovie.title}`;
    setServer("trailer");
    videoDialog.showModal();
  }
});

document.querySelector("#dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });

// Language Switcher (EN / BN)
const translations = {
  en: {
    movies: "Movies",
    tvShows: "TV Shows",
    topRated: "Top Rated",
    upcoming: "Upcoming",
    news: "News",
    trendingNow: "Trending Now",
    findGenre: "Find your genre.",
    topRatedMovies: "Top Rated Movies",
    comingSoon: "Coming Soon",
    watchTrailer: "Watch Trailer",
    watchMovie: "Watch Movie",
    searchPlaceholder: "Search movies...",
    streamNow: "▶ Watch Movie"
  },
  bn: {
    movies: "সিনেমা",
    tvShows: "সিরিজ",
    topRated: "সেরা রেটেড",
    upcoming: "আসছে",
    news: "খবর",
    trendingNow: "এখন ট্রেন্ডিং",
    findGenre: "পছন্দের জঁরা খুঁজুন।",
    topRatedMovies: "টপ রেটেড সিনেমা",
    comingSoon: "শীঘ্রই আসছে",
    watchTrailer: "ট্রেইলার দেখুন",
    watchMovie: "মুভি দেখুন",
    searchPlaceholder: "মুভি বা সিরিজ খুঁজুন...",
    streamNow: "▶ মুভি প্লে করুন"
  }
};

function setLanguage(lang) {
  const t = translations[lang] || translations.en;
  const navLinks = document.querySelectorAll("#nav-menu a");
  if (navLinks.length >= 5) {
    navLinks[0].textContent = t.movies;
    navLinks[1].textContent = t.tvShows;
    navLinks[2].textContent = t.topRated;
    navLinks[3].textContent = t.upcoming;
    navLinks[4].textContent = t.news;
  }
  document.querySelector("#trending-title").textContent = t.trendingNow;
  document.querySelector("#genres-title").innerHTML = `${t.findGenre.slice(0, -1)}<span class="text-accent">.</span>`;
  document.querySelector("#top-rated-title").textContent = t.topRatedMovies;
  document.querySelector("#upcoming-title").textContent = t.comingSoon;
  document.querySelector("#site-search").placeholder = t.searchPlaceholder;
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
    document.querySelector("#language").value = e.target.value;
    document.querySelector("#footer-language").value = e.target.value;
    setLanguage(e.target.value);
  });
});

const savedLang = localStorage.getItem("bioscope-lang");
if (savedLang) {
  document.querySelector("#language").value = savedLang;
  document.querySelector("#footer-language").value = savedLang;
  setLanguage(savedLang);
}

// 8. Reveal sections, with reduced-motion support.
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
  }), { threshold: .08, rootMargin: "0px 0px 80px 0px" });
  document.querySelectorAll(".reveal").forEach(section => observer.observe(section));
} else document.querySelectorAll(".reveal").forEach(section => section.classList.add("is-visible"));
document.querySelector("#copyright-year").textContent = new Date().getFullYear();

// PWA caching runs only in browsers; native Capacitor plugins need an unblocked WebView.
if ("serviceWorker" in navigator && !(window.Capacitor?.isNativePlatform?.())) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
}

// Android back closes temporary UI before leaving the app.
window.Capacitor?.Plugins?.App?.addListener("backButton", ({ canGoBack }) => {
  if (dialog.open) { dialog.close(); return; }
  if (menu.classList.contains("is-open")) {
    menu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
    return;
  }
  if (canGoBack) { history.back(); return; }
  window.Capacitor.Plugins.App.exitApp();
});
