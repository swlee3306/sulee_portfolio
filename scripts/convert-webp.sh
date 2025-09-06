#!/usr/bin/env bash
set -euo pipefail

# Batch-convert raster images (jpg/jpeg/png) under static/ to WebP next to originals.
# Requirements: cwebp (preferred) or ImageMagick's `magick` command.
# Usage:
#   scripts/convert-webp.sh [quality]
#     quality: 0-100 (default: 82)
#
# Behavior:
# - Creates <name>.webp alongside <name>.(jpg|jpeg|png)
# - Skips if .webp exists and is newer than the source
# - Preserves folder structure under static/
# - Prints a summary at the end

QUALITY=${1:-82}
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STATIC_DIR="$ROOT_DIR/static"

if ! command -v cwebp >/dev/null 2>&1 && ! command -v magick >/dev/null 2>&1; then
  echo "[ERROR] Neither 'cwebp' nor 'magick' (ImageMagick) is available. Please install one of them." >&2
  echo "  - macOS (Homebrew): brew install webp  # for cwebp" >&2
  echo "  - Or: brew install imagemagick         # for magick" >&2
  exit 1
fi

converter=""
if command -v cwebp >/dev/null 2>&1; then
  converter="cwebp"
else
  converter="magick"
fi

echo "[INFO] Using converter: $converter (quality=$QUALITY)"

count_total=0
count_converted=0
count_skipped=0

# Use POSIX find to locate raster images (case-insensitive)
find "$STATIC_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0 |
while IFS= read -r -d '' src; do
  count_total=$((count_total+1))
  base_noext="${src%.*}"
  dst="$base_noext.webp"

  if [ -f "$dst" ] && [ "$dst" -nt "$src" ]; then
    echo "[SKIP] ${dst#$STATIC_DIR/} up-to-date"
    count_skipped=$((count_skipped+1))
    continue
  fi

  if [ "$converter" = "cwebp" ]; then
    cwebp -quiet -q "$QUALITY" "$src" -o "$dst"
  else
    magick convert "$src" -quality "$QUALITY" "$dst"
  fi
  echo "[OK]   ${dst#$STATIC_DIR/}"
  count_converted=$((count_converted+1))
  chmod 644 "$dst" || true
done

echo "[DONE] scanned=$count_total converted=$count_converted skipped=$count_skipped"
