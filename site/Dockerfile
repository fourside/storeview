# hadolint global ignore=DL3018
# hadolint global ignore=DL3016

FROM node:18-alpine as builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat && apk update && npm install -g turbo
WORKDIR /app

COPY . .
RUN turbo prune --scope=site --docker

#---

FROM node:18-alpine as installer
WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL $DATABASE_URL

ARG NEXT_PUBLIC_CLOUDFLARE_PUBLIC_BUCKET_URL
ENV NEXT_PUBLIC_CLOUDFLARE_PUBLIC_BUCKET_URL $NEXT_PUBLIC_CLOUDFLARE_PUBLIC_BUCKET_URL

RUN apk add --no-cache libc6-compat && apk update

COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

COPY --from=builder /app/out/full/ .
COPY prisma prisma
COPY turbo.json turbo.json
RUN npm run db:migrate:dev && npm run build

#---

FROM node:18-alpine AS runner
WORKDIR /app

USER node

COPY --from=installer --chown=node:node /app/site/next.config.js .
COPY --from=installer --chown=node:node /app/site/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=node:node /app/site/.next/standalone ./
COPY --from=installer --chown=node:node /app/site/.next/static ./site/.next/static
COPY --from=installer --chown=node:node /app/site/public ./site/public

CMD ["node", "site/server.js"]
