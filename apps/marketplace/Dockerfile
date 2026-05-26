# --- Base ---
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.6.5 --activate
WORKDIR /app

# --- Dependencies ---
FROM base AS deps
RUN apk add --no-cache python3 make g++

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
FROM node:22-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache curl cronie

COPY --from=build /app/apps/marketplace/.output .output/
COPY --from=build /app/apps/marketplace/content content.default/
COPY apps/marketplace/docker/entrypoint.sh /entrypoint.sh
COPY apps/marketplace/docker/crontab /etc/crontabs/root

RUN chmod +x /entrypoint.sh

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
