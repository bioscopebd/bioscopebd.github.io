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

// 7. Categories check
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

console.log(`\nTEST RESULTS: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
