const fs = require("fs");
const path = require("path");

const roots = ["app", "lib", "scripts", "docs"];
const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".md"]);
const suspicious = [String.fromCharCode(0xfffd)];

const results = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (full === path.join("scripts", "check-mojibake.js")) continue;
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
      walk(full);
      continue;
    }
    if (!exts.has(path.extname(entry.name))) continue;
    const text = fs.readFileSync(full, "utf8");
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (suspicious.some((token) => line.includes(token))) {
        results.push(`${full}:${index + 1}: ${line.trim()}`);
      }
    });
  }
}

roots.forEach(walk);

if (results.length) {
  console.error("Mojibake detected:");
  for (const line of results) console.error(line);
  process.exit(1);
}

console.log("No mojibake markers detected.");
