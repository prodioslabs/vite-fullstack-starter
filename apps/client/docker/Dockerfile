FROM node:20.14.0-alpine3.20 as base
RUN corepack enable

WORKDIR /app

#------------------#

FROM base as prune

RUN apk add --no-cache libc6-compat

COPY . .

# Use turbo to prune and remove unnecessary packages and files
RUN pnpx turbo prune --scope @repo/client --docker

#------------------#

FROM base as build

COPY --from=prune /app/out/json/ ./

RUN pnpm install --frozen-lockfile

COPY --from=prune /app/out/full/ ./

# Set build environment variables
ENV VITE_API_BASE_URL /api

RUN pnpm build --filter @repo/client

#------------------#

FROM joseluisq/static-web-server:2.30-alpine as release

RUN apk add --no-cache curl

WORKDIR /app

COPY --from=build /app/apps/client/dist/ ./

EXPOSE 80

HEALTHCHECK --interval=5s --timeout=5s --retries=3 \
  CMD curl -f http://127.0.0.1/health || exit 1

CMD [ "static-web-server", "--health", "--port", "80", "--page-fallback", "index.html", "--root", "." ]
