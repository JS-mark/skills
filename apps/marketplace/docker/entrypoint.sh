#!/bin/sh
set -e

# Initialize content directory if mounted empty
if [ ! -f /app/content/sources.json ]; then
  echo "Initializing default content..."
  mkdir -p /app/content/skills /app/content/mcps
  cp -r /app/content.default/* /app/content/ 2>/dev/null || true
fi

# Start cron daemon in background
cron

# Start Nitro server
exec node /app/.output/server/index.mjs
