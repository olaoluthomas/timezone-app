#!/usr/bin/env bash
# Downloads high-quality Earth textures into src/public/textures/.
# The textures/ directory is gitignored — run this script after cloning or
# if the textures directory is missing.
#
# Sources: NASA Visible Earth (public domain)
#   Satellite: Blue Marble Next Generation, August 2004 (5400×2700)
#   Terrain:   Land Shallow Topo (2048×1024) — natural colour with elevation
#   Night:     Black Marble / Earth at Night 2012 (3600×1800)

set -euo pipefail

DEST="$(cd "$(dirname "$0")/.." && pwd)/src/public/textures"
mkdir -p "$DEST"

echo "Downloading Earth textures to $DEST …"

curl -L --progress-bar --max-time 120 \
  -o "$DEST/earth-satellite.jpg" \
  "https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74117/world.200408.3x5400x2700.jpg"

curl -L --progress-bar --max-time 60 \
  -o "$DEST/earth-terrain.jpg" \
  "https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57752/land_shallow_topo_2048.jpg"

curl -L --progress-bar --max-time 60 \
  -o "$DEST/earth-night.jpg" \
  "https://eoimages.gsfc.nasa.gov/images/imagerecords/79000/79765/dnb_land_ocean_ice.2012.3600x1800.jpg"

echo "Done."
ls -lh "$DEST"
