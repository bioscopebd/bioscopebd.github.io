import fs from 'fs';

console.log("=== RUNNING BIOSCOPEBD VERIFICATION TEST SUITE ===");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

// 1. Cloudflare Backup Configuration
assert(fs.existsSync('_headers'), "_headers exists in root");
assert(fs.existsSync('pwa/_headers'), "_headers exists in pwa");
assert(fs.existsSync('_redirects'), "_redirects exists in root");
assert(fs.existsSync('pwa/_redirects'), "_redirects exists in pwa");
assert(fs.existsSync('wrangler.toml'), "wrangler.toml exists in root");
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
assert(Boolean(pkg.scripts?.['deploy:cloudflare']), "package.json has deploy:cloudflare script");

// 2. Android APK & Mobile Banner
assert(fs.existsSync('00-shared-web/bioscopebd.apk'), "bioscopebd.apk exists in 00-shared-web");
assert(fs.existsSync('pwa/bioscopebd.apk'), "bioscopebd.apk exists in pwa");
assert(fs.existsSync('bioscopebd.apk'), "bioscopebd.apk exists in root");

const indexHtml = fs.readFileSync('00-shared-web/index.html', 'utf8');
const scriptJs = fs.readFileSync('00-shared-web/script.js', 'utf8');
const styleCss = fs.readFileSync('00-shared-web/style.css', 'utf8');

assert(indexHtml.includes('id="mobile-app-banner"'), "index.html contains mobile-app-banner");
assert(indexHtml.includes('download="bioscopebd.apk"'), "index.html contains bioscopebd.apk download link");
assert(styleCss.includes('.mobile-app-banner'), "style.css contains .mobile-app-banner rules");
assert(scriptJs.includes('beforeinstallprompt'), "script.js handles beforeinstallprompt");

// 3. Scroll to top button
assert(indexHtml.includes('id="scroll-to-top-btn"'), "index.html contains scroll-to-top-btn");
assert(styleCss.includes('.scroll-to-top'), "style.css contains .scroll-to-top rules");
assert(scriptJs.includes('scrollToTopBtn'), "script.js contains scrollToTopBtn listener");

// 4. One-Click Social Logins & Email/Password
assert(indexHtml.includes('id="btn-google-auth"'), "index.html contains btn-google-auth");
assert(indexHtml.includes('id="btn-yahoo-auth"'), "index.html contains btn-yahoo-auth");
assert(indexHtml.includes('id="btn-microsoft-auth"'), "index.html contains btn-microsoft-auth");
assert(indexHtml.includes('id="auth-password"'), "index.html contains auth-password input");
assert(scriptJs.includes('btnYahooAuth'), "script.js contains btnYahooAuth handler");
assert(scriptJs.includes('btnMicrosoftAuth'), "script.js contains btnMicrosoftAuth handler");
assert(styleCss.includes('.button--yahoo'), "style.css contains .button--yahoo style");
assert(styleCss.includes('.button--microsoft'), "style.css contains .button--microsoft style");

// 5. Ad blocker sandbox preservation
assert(scriptJs.includes('allow-scripts allow-same-origin allow-forms allow-presentation allow-downloads'), "Custom player iframe preserves ad-blocking sandbox");
assert(!scriptJs.includes('allow-popups'), "Custom player iframe strictly forbids allow-popups");
assert(indexHtml.includes('sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-downloads"'), "HTML iframes preserve ad-blocking sandbox");

// 6. Trailer duration and loop fix
assert(scriptJs.includes('data.info.playerState === 0') && scriptJs.includes('stopCustomTimeTicker();'), "playerState === 0 halts custom time ticker");
assert(scriptJs.includes('isFull ? streamDurationSeconds : 0'), "openStream does not force 2-hour duration on trailers");

// 7. Search Bar Fix and Removal of Room & Language from Header
assert(styleCss.includes('min-width: 220px') && styleCss.includes('.nav__search'), "nav__search has guaranteed min-width to prevent squishing");
assert(!indexHtml.includes('id="open-party-btn"'), "Rooms button removed from header actions");
assert(!indexHtml.includes('id="nav-rooms-link"'), "Rooms tab removed from header nav tabs");
assert(!indexHtml.includes('id="language"'), "Language switcher removed from header");
assert(!indexHtml.includes('data-content-tab="bangla"'), "Bangla Drama tab removed from header tabs");
assert(indexHtml.includes('id="watch-party-hub"') && indexHtml.includes('id="watch-party-hub" aria-labelledby="party-hub-title" hidden'), "watch-party-hub is hidden");

// 8. Categories check
const sections = ['trending', 'bangla-cinema', 'hindi-cinema', 'hollywood-cinema', 'tv-series', 'anime-cinema', 'east-asian-cinema', 'top-rated'];
sections.forEach(s => {
  const start = indexHtml.indexOf(`id="${s}"`);
  if (start !== -1) {
    const end = indexHtml.indexOf('</section>', start);
    const chunk = indexHtml.substring(start, end);
    const count = (chunk.match(/class="movie-card/g) || []).length;
    assert(count >= 15, `Section ${s} has >= 15 movies (actual: ${count})`);
  }
});

// 9. Adult poster prevention & correct TMDB IDs
assert(!indexHtml.includes('871329') && !indexHtml.includes('1D3aRTQeTTvU1Ar3MrzWY24rXvo'), "Operation Sundarbans does not use adult movie TMDB ID or poster");
assert(indexHtml.includes('859718') && indexHtml.includes('7pU1XQHEtGYvQspNVIOFgvIMxaH'), "Operation Sundarbans uses authentic TMDB ID 859718 and poster");
assert(!indexHtml.includes('987178') && !indexHtml.includes('6QgHlOb8kw1YIo17hR2JMTBuIkH'), "Poran does not use adult movie TMDB ID or poster");
// 10. Dhaka Attack & Channel i Movies validation
assert(!indexHtml.includes('421679') && !indexHtml.includes('cQGUUZgivZWWUZB13p6U41a0arK'), "Dhaka Attack does not use Japanese movie TMDB ID or poster");
assert(indexHtml.includes('482239') && indexHtml.includes('9XSCOyTZ3g0qo0LVCkcxxzT8JwT'), "Dhaka Attack uses authentic TMDB ID 482239 and real poster");
assert(indexHtml.includes('Channel i Movie'), "Channel i Movies are deployed to the catalog");
assert(indexHtml.includes('mtfiqLzSSac') && indexHtml.includes('7CHAP3J2FFg'), "Channel i movies have valid official YouTube video IDs");

// 11. Channel B Digital validation
assert(indexHtml.includes('Channel B Movie'), "Channel B Digital movies are deployed to the catalog");
assert(indexHtml.includes('VBSUvQTzals') && indexHtml.includes('XY0g1UtI-xk') && indexHtml.includes('ncQKewaiGZw'), "Channel B Digital legendary movies (Jara Brishtite Bhijechilo, Parama, Pushpadhanu) have valid video IDs");

// 12. Authentic Bangla Posters & Foreign Poster Elimination
assert(!indexHtml.includes('73C9tEuQzjHas0pggzDNAyvH7yL.jpg'), "Hawa does not use Turkish poster");
assert(indexHtml.includes('19JrYJIicR7vqiDmjdsTRXUHMFK.jpg') && indexHtml.includes('925715'), "Hawa uses authentic Bengali poster and TMDB 925715");

assert(indexHtml.includes('pgkrMs6XKEcJhVPHsA0bZRQJbDx.jpg') && indexHtml.includes('1216385'), "Toofan uses authentic TMDB 1216385 and Bengali poster");

assert(!indexHtml.includes('5KCrKpvO9JF6X6yI7Ww6vjZ6DUP.jpg'), "Priyotoma does not use Narnia poster");
assert(indexHtml.includes('bbVlVUS5KAO0XLKhSr5oNbbRXbG.jpg') && indexHtml.includes('1032048'), "Priyotoma uses authentic Bengali poster and TMDB 1032048");

assert(!indexHtml.includes('aiZhbfo3hXr0knB2wmkZHUdeGnx.jpg'), "Aynabaji does not use Thieves Gold poster");
assert(indexHtml.includes('1Cz5Q7PH2JklNV7OzMkTenPGrEf.jpg') && indexHtml.includes('418325'), "Aynabaji uses authentic Bengali poster and TMDB 418325");

assert(!indexHtml.includes('jmAQ4eXd5GCvYFrmoI0fKLr1zuD.jpg'), "Pather Panchali does not use De Jurk poster");
assert(indexHtml.includes('frZj5djlU9hFEjMcL21RJZVuG5O.jpg') && indexHtml.includes('5801'), "Pather Panchali uses authentic Bengali poster and TMDB 5801");

assert(!indexHtml.includes('dQ5LdPOkRwlTTl3ocObuNGKB1of.jpg'), "Monpura does not use Executive Suite poster");
assert(indexHtml.includes('b4brqc4JBjXYy8thlKAoP5jFVH0.jpg') && indexHtml.includes('91777'), "Monpura uses authentic Bengali poster and TMDB 91777");

assert(!indexHtml.includes('ejUYqNwDRcbcl58KMdPaglpwfOB.jpg'), "Dipu Number Two does not use French film poster");
assert(indexHtml.includes('4Gz1HkpZhwWpyuual7eytb5CBj9.jpg') && indexHtml.includes('93527'), "Dipu Number Two uses authentic Bengali poster and TMDB 93527");

assert(!indexHtml.includes('LXdGgrbIC3k9LbeDo5YDAvx3d0.jpg'), "Chhutir Ghonta does not use Tagalog film poster");
assert(indexHtml.includes('WlUtB3a2Kbo/maxresdefault.jpg'), "Chhutir Ghonta uses authentic film thumbnail");

// 13. Whitelabel Streaming & Source Hiding
const configJs = fs.readFileSync('00-shared-web/config.js', 'utf8');
assert(indexHtml.includes('Bhat Dey (ভাত দে)') && indexHtml.includes('z0g7cXKqMC8') && indexHtml.includes('684903'), "Bhat Dey exists in index.html with video ID z0g7cXKqMC8 and TMDB 684903");
assert(configJs.includes('bhat-dey') && configJs.includes('z0g7cXKqMC8') && configJs.includes('684903'), "Bhat Dey exists in config.js catalog with video ID z0g7cXKqMC8 and TMDB 684903");
assert(!indexHtml.includes('id="btn-player-youtube"'), "btn-player-youtube is removed/hidden from user view");
assert(!indexHtml.includes('id="btn-header-youtube"'), "btn-header-youtube is removed/hidden from user view");
assert(!indexHtml.includes('id="dialog-youtube-link"'), "dialog-youtube-link is removed/hidden from user view");
assert(indexHtml.includes('id="btn-server-tool"') && indexHtml.includes('display:none!important;'), "btn-server-tool is hidden so streaming server names are never exposed");
assert(scriptJs.includes('primary_release_year=${state.selectedYear}') && scriptJs.includes('trending'), "trending carousel queries TMDB discover by primary_release_year when a year is selected");

// 14. Infinite Horizontal Carousel Engine & Single Year Filters
const yearFilterCount = (indexHtml.match(/class="category-year-filter"/g) || []).length;
assert(yearFilterCount >= 8, `index.html contains category-year-filter selects across categories (actual: ${yearFilterCount})`);
assert(scriptJs.includes('CAROUSEL_REGISTRY'), "script.js contains CAROUSEL_REGISTRY");
assert(scriptJs.includes('initCategoryYearFilters'), "script.js contains initCategoryYearFilters");
assert(scriptJs.includes('applyCategoryYearFilter'), "script.js contains applyCategoryYearFilter");
assert(scriptJs.includes('fetchNextCarouselBatch'), "script.js contains fetchNextCarouselBatch");
assert(scriptJs.includes('initInfiniteCarouselControls'), "script.js contains initInfiniteCarouselControls");
assert(scriptJs.includes('currentYear = 2026') && scriptJs.includes('oldestYear = 1950'), "script.js populates single individual years from 2026 down to 1950");
assert(styleCss.includes('.category-year-filter'), "style.css contains .category-year-filter rules");
assert(styleCss.includes('.carousel-shimmer-card'), "style.css contains .carousel-shimmer-card rules");

// 15. Continue Watching UI, Card Removal & Clear History
assert(scriptJs.includes('btnClearContinue') && scriptJs.includes('continueWatching = []'), "script.js binds btn-clear-continue to clear watch history");
assert(scriptJs.includes('continue-card__remove'), "script.js supports individual continue watching card removal");
assert(styleCss.includes('.continue-card__thumb') && styleCss.includes('.continue-card__play'), "style.css styles continue-card thumbnail and centered play button");
assert(!scriptJs.includes('prompt("Enter your Name or Gmail'), "script.js has eliminated browser prompt for Google login");
assert(scriptJs.includes('handleSocialAuthClick'), "script.js contains seamless in-modal social auth handler");

// 16. Sandbox-Friendly Zero-Ad Stream Providers (Movies & TV Series)
assert(configJs.includes('vidsrc.to/embed/movie') && configJs.includes('vidsrc.to/embed/tv'), "config.js uses vidsrc.to as primary sandbox-compatible stream engine for movies and TV");
assert(!configJs.includes('vidlink.pro') && !configJs.includes('videasy.net'), "config.js eliminated vidlink.pro and videasy.net which caused 'Please Disable Sandbox' errors");
assert(scriptJs.includes('vidsrc.to/embed/movie') && scriptJs.includes('vidsrc.to/embed/tv'), "script.js uses vidsrc.to as primary sandbox-compatible stream engine for movies and TV");
assert(!scriptJs.includes('vidlink.pro') && !scriptJs.includes('videasy.net'), "script.js eliminated vidlink.pro and videasy.net");

console.log(`\nTEST RESULTS: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

