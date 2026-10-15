// Copies only the managed web bundle; native project files are untouched.
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = join(root, "00-shared-web");
const targets = ["pwa", "android/app/www", "ios/app/www", "windows/www"];
const files = ["index.html", "style.css", "script.js", "config.js", "manifest.json", "service-worker.js"];

for (const file of files) {
  if (!existsSync(join(source, file))) throw new Error(`Missing shared file: ${file}`);
}
for (const target of targets) {
  const destination = join(root, target);
  mkdirSync(join(destination, "icons"), { recursive: true });
  for (const file of files) cpSync(join(source, file), join(destination, file), { force: true });
  for (const icon of readdirSync(join(source, "icons"))) {
    cpSync(join(source, "icons", icon), join(destination, "icons", icon), { force: true });
  }
  console.log(`Synced ${target}`);
}

// Also sync to root for GitHub Pages deployment
for (const file of files) {
  cpSync(join(source, file), join(root, file), { force: true });
}
if (existsSync(join(source, "icons"))) {
  mkdirSync(join(root, "icons"), { recursive: true });
  for (const icon of readdirSync(join(source, "icons"))) {
    cpSync(join(source, "icons", icon), join(root, "icons", icon), { force: true });
  }
}
console.log("Synced root (GitHub Pages)");
