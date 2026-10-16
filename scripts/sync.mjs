// Copies only the managed web bundle; native project files are untouched.
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = join(root, "00-shared-web");
const targets = ["pwa", "android/app/www", "ios/app/www", "windows/www"];
const files = [
  "index.html",
  "style.css",
  "script.js",
  "config.js",
  "manifest.json",
  "service-worker.js",
  "room.html",
  "bioscopebd.apk",
  "_headers",
  "_redirects"
];

for (const target of targets) {
  const destination = join(root, target);
  mkdirSync(join(destination, "icons"), { recursive: true });
  mkdirSync(join(destination, "room"), { recursive: true });
  for (const file of files) {
    const srcFile = join(source, file);
    if (existsSync(srcFile)) {
      cpSync(srcFile, join(destination, file), { force: true });
    }
  }
  if (existsSync(join(source, "icons"))) {
    for (const icon of readdirSync(join(source, "icons"))) {
      cpSync(join(source, "icons", icon), join(destination, "icons", icon), { force: true });
    }
  }
  if (existsSync(join(source, "room"))) {
    cpSync(join(source, "room"), join(destination, "room"), { recursive: true, force: true });
  }
  console.log(`Synced ${target}`);
}

// Also sync to root for GitHub Pages deployment
for (const file of files) {
  const srcFile = join(source, file);
  if (existsSync(srcFile)) {
    cpSync(srcFile, join(root, file), { force: true });
  }
}
if (existsSync(join(source, "icons"))) {
  mkdirSync(join(root, "icons"), { recursive: true });
  for (const icon of readdirSync(join(source, "icons"))) {
    cpSync(join(source, "icons", icon), join(root, "icons", icon), { force: true });
  }
}
if (existsSync(join(source, "room"))) {
  mkdirSync(join(root, "room"), { recursive: true });
  cpSync(join(source, "room"), join(root, "room"), { recursive: true, force: true });
}
console.log("Synced root (GitHub Pages)");
