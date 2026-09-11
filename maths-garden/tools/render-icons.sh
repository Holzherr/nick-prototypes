#!/bin/bash
# Renders tools/icon-square.svg to the PNG app icons with headless Chrome (no image tools needed).
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TMP=$(mktemp -d)
for size in 512 192 180; do
  cat > "$TMP/icon.html" <<HTML
<html><body style="margin:0"><img src="file://$PWD/tools/icon-square.svg" width="$size" height="$size" style="display:block"></body></html>
HTML
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size="$size,$size" --screenshot="$TMP/icon-$size.png" "file://$TMP/icon.html" >/dev/null 2>&1
done
cp "$TMP/icon-512.png" public/icons/icon-512.png
cp "$TMP/icon-192.png" public/icons/icon-192.png
cp "$TMP/icon-180.png" public/icons/apple-touch-icon.png
rm -rf "$TMP"
echo "wrote public/icons/{icon-512,icon-192,apple-touch-icon}.png"
