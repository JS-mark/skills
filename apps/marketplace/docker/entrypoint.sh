#!/bin/sh
set -e

# Initialize content directory if mounted empty
if [ ! -f /app/content/sources.json ]; then
  echo "Initializing default content..."
  cp -r /app/content.default/* /app/content/ 2>/dev/null || true
fi

# Start cron daemon for periodic sync
crond -b -l 2

# Start Nitro server
exec node /app/.output/server/index.mjs
