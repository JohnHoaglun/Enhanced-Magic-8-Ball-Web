import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? "dist";
const findings = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else {
      scan(full);
    }
  }
}

function scan(file) {
  const text = readFileSync(file, "utf8");
  const matches = text.match(/https?:\/\/[^\s"'`<)]+/g) ?? [];
  for (const match of matches) {
    if (match.includes("w3.org") || match.includes("schema.org")) continue;
    findings.push(`${file}: ${match}`);
  }
}

if (findings.length > 0) {
  console.error(`External URLs found in built output (${root}):`);
  for (const line of findings) console.error(`  ${line}`);
  process.exit(1);
}
console.log(`check-no-external-urls: clean (${root})`);
