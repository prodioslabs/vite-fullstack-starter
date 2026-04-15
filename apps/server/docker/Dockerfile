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

WORKDIR /app

RUN bun run build --filter @repo/server

FROM oven/bun:1.3.12-alpine AS release

USER root
RUN apk add --no-cache jq

WORKDIR /app

# create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=base /app/apps/server/package.json /app/package.json
RUN export SHARP_VERSION=$(cat package.json | jq ".dependencies.sharp" | xargs)
RUN rm /app/package.json

COPY --from=build /app/apps/server/dist /app/dist

# install sharp module as it has been defined as an external dependency for bun bundler
# it cannot be copied directly from the previous build step as it depends on some other
# package which in turn depends on some other package, so it is easier to install it again here
RUN bun install sharp@${SHARP_VERSION}

# change the ownership of the /app directory to the non-root user
RUN chown -R appuser:appgroup /app


# switch to the non-root user
USER appuser

ENV PORT=3000
EXPOSE $PORT

CMD ["bun", "run", "dist/index.js"]