import { execSync } from "node:child_process";

const formats = [
  "sitebar-desktop",
  "dynamic-head-desktop",
  "dynamic-head-mobile",
  "halfpage-ad-mobile",
  "wideboard-xl-desktop"
];

for (const f of formats) {
  execSync(`node tools/zip.js ${f}`, { stdio: "inherit" });
}