# --- Base ---
FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@10.6.5 --activate
WORKDIR /app

# --- Dependencies ---
FROM base AS deps
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/marketplace/package.json apps/marketplace/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile --filter @aspect-mark/marketplace...

# --- Build ---
FROM deps AS build
COPY apps/marketplace/ apps/marketplace/
COPY packages/shared/ packages/shared/

WORKDIR /app/apps/marketplace
RUN pnpm build

# --- Runtime ---
FROM node:22-slim AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl cron && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/apps/marketplace/.output .output/
COPY --from=build /app/apps/marketplace/content content.default/
COPY apps/marketplace/docker/entrypoint.sh /entrypoint.sh
COPY apps/marketplace/docker/crontab /etc/cron.d/skillforge-sync

RUN chmod +x /entrypoint.sh && \
    chmod 0644 /etc/cron.d/skillforge-sync && \
    crontab /etc/cron.d/skillforge-sync

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
