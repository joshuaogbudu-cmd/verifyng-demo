#!/bin/sh
# Assemble the single-file demo page from src/
cd "$(dirname "$0")"
{
  cat src/head.html
  echo '<div id="app"></div>'
  echo '<script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js"></script>'
  echo '<script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js"></script>'
  echo '<script>'; cat src/engine.js; echo '</script>'
  echo '<script>'; cat src/ui.js; echo '</script>'
} > index.html
