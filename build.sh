#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

SIZES=("300x250" "728x90" "160x600")

mkdir -p zips

echo "Copying shared JS into dist..."
for s in "${SIZES[@]}"; do
  cp src/core.js "dist/$s/core.js"
  cp src/creative.js "dist/$s/creative.js"
  cp src/gsap.min.js "dist/$s/gsap.min.js"
  if [ -d "src/assets" ]; then
    rm -rf "dist/$s/assets"
    cp -R src/assets "dist/$s/assets"
  fi
done

echo "Creating ZIPs..."
for s in "${SIZES[@]}"; do
  (cd "dist/$s" && zip -qr "../../zips/nbdev_${s}.zip" index.html style.css config.js core.js creative.js gsap.min.js assets 2>/dev/null || \
   zip -qr "../../zips/nbdev_${s}.zip" index.html style.css config.js core.js creative.js gsap.min.js)
  echo " - zips/nbdev_${s}.zip"
done

echo "Done."
