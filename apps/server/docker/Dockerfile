FROM oven/bun:1.3.11-alpine AS base

RUN apk add --no-cache curl

WORKDIR /app

COPY package.json .
COPY apps/server/package.json apps/server/package.json
COPY apps/client/package.json apps/client/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY bun.lock bun.lock

RUN bun install --frozen-lockfile

COPY . .

#------------------#

FROM base AS build

RUN bun run --cwd apps/server build

FROM base AS release

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/apps/server/dist ./apps/server/dist
COPY --from=build /app/apps/server/package.json ./apps/server/package.json
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/server/node_modules ./apps/server/node_modules

EXPOSE 3000

HEALTHCHECK --interval=10s --start-period=10s --retries=3 \
  CMD curl -f http://127.0.0.1:$PORT/health || exit 1

CMD ["bun", "run", "apps/server/dist/src/main"]