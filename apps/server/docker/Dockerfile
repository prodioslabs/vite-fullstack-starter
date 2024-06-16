FROM node:20.14.0-alpine3.20 as base
RUN corepack enable

WORKDIR /app

#------------------#

FROM base as prune

RUN apk add --no-cache libc6-compat

COPY . .

# Use turbo to prune and remove unnecessary packages and files
RUN pnpx turbo prune --scope @repo/server --docker

#------------------#

FROM base as development

COPY --from=prune /app/out/json/ ./
# Manually copy the prisma folder as it is not included in pruned files
COPY --from=prune /app/apps/server/prisma/ ./apps/server/prisma/

RUN pnpm install --frozen-lockfile

#------------------#

FROM development as build

COPY --from=prune /app/out/full/ ./

RUN pnpm build --filter @repo/server

# Ignore postinstall scripts afte pruning for production
RUN pnpm config set ignore-scripts true
# Remove development dependencies to reduce release image size 
# Set CI=true to skip confirmation prompt, see: https://github.com/pnpm/pnpm/issues/6615#issuecomment-1656945689
RUN CI=true pnpm prune --prod

#------------------#

FROM base as release

USER node

COPY --from=build --chown=node /app/ ./

EXPOSE 3000

# Run the server with server app directory as working directory
WORKDIR /app/apps/server

CMD [ "node", "./dist/main.js" ]