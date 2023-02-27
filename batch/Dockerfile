# hadolint global ignore=DL3008
# hadolint global ignore=DL3018
# hadolint global ignore=DL3016

FROM node:18-alpine as builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat && apk update && npm install -g turbo
WORKDIR /app

COPY . .
RUN turbo prune --scope=batch --docker

#---

FROM ghcr.io/puppeteer/puppeteer:19.6.3

ENV NODE_ENV production

WORKDIR /app

USER root

RUN apt-get update && \
    apt-get install --no-install-recommends -y cron \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && ln -s /dev/stdout /var/log/cron.log

ARG DATABASE_URL
ENV DATABASE_URL $DATABASE_URL

ENV NODE_ENV development

USER pptruser

COPY --from=builder --chown=pptruser:pptruser /app/out/json/ .
COPY --from=builder --chown=pptruser:pptruser /app/out/package-lock.json ./package-lock.json
COPY --from=builder --chown=pptruser:pptruser /app/out/full/ .
COPY --chown=pptruser:pptruser prisma prisma
COPY --chown=pptruser:pptruser turbo.json turbo.json
COPY --chown=pptruser:pptruser batch/crontab crontab

RUN npm ci \
  && npm run db:migrate:dev \
  && crontab ./crontab

USER root
CMD ["cron", "-f", "-L", "/var/log/cron.log"]
