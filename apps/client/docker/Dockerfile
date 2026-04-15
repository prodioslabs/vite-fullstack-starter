FROM oven/bun:1.3.12-alpine AS base

WORKDIR /app

COPY package.json .
COPY apps/server/package.json apps/server/package.json
COPY apps/client/package.json apps/client/package.json
COPY packages/config/package.json packages/config/package.json
COPY bun.lock bun.lock

RUN bun install --frozen-lockfile

COPY . .

FROM base AS build

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN bun run build --filter @repo/client

FROM joseluisq/static-web-server:2.42.0-alpine AS release

USER root
RUN apk add --no-cache curl

# create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=build /app/apps/client/dist ./dist

# change the ownership of the /app directory to the non-root user
RUN chown -R appuser:appgroup /app

# switch to the non-root user
USER appuser

EXPOSE 80

HEALTHCHECK --interval=5s --timeout=5s --retries=3 \
  CMD curl -f http://127.0.0.1/health || exit 1

CMD [ "static-web-server", "--health", "--port", "80", "--page-fallback", "index.html", "--page404", "index.html", "--root", "dist", "--log-level", "info" ]