#!/bin/bash
# Oyunu (App.js) tarayicida denemek icin paketler. Kullanim: bash araclar/web-deneme/yap.sh <cikis-klasoru>
# React /opt/npm-tools/node_modules altindan alinir (bu ortamda npm erisimi yok). Animasyonlar aninda biter.
set -e
KOK="$(cd "$(dirname "$0")/../.." && pwd)"
CIKIS="${1:-/tmp/meyve-web}"
mkdir -p "$CIKIS"
T="$KOK/araclar/web-deneme"
NODE_PATH=/opt/npm-tools/node_modules /opt/npm-tools/node_modules/.bin/esbuild "$T/giris.js" \
  --bundle --outfile="$CIKIS/paket.js" --format=iife --jsx=transform \
  --define:process.env.NODE_ENV='"development"' \
  --alias:react-native="$T/rn-taklit.js" \
  --alias:expo-audio="$T/expo-taklit.js" \
  --alias:expo-haptics="$T/expo-taklit.js" \
  --alias:expo-status-bar="$T/expo-taklit.js" \
  --alias:react-native-safe-area-context="$T/expo-taklit.js" \
  --alias:@react-native-async-storage/async-storage="$T/expo-taklit.js" \
  --loader:.js=jsx --loader:.wav=file --loader:.png=file --asset-names=[name] --log-level=warning
cat > "$CIKIS/index.html" <<'H'
<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=390">
<style>html,body,#kok{margin:0;height:100%;font-family:-apple-system,Helvetica,Arial,sans-serif}</style></head>
<body><div id="kok"></div><script src="paket.js"></script></body></html>
H
echo "$CIKIS/index.html"
