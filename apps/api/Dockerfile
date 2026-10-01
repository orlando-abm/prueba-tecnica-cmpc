FROM ghcr.io/pnpm/pnpm:12 AS base
RUN pnpm runtime set node 26 -g
COPY . /app
WORKDIR /app

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    pnpm install --store-dir /var/cache/pnpm --frozen-lockfile --filter api...
RUN pnpm --filter @repo/shared run build
RUN pnpm --filter api run build
RUN pnpm deploy --filter api --prod --legacy /deploy

FROM ghcr.io/pnpm/pnpm:12 AS runner
RUN pnpm runtime set node 26 -g
COPY --from=build /deploy /app
WORKDIR /app
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main.js"]
