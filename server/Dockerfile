# syntax = docker/dockerfile:1.2

# NodeJS Dockerfile that uses updated Chromium drivers and dependencies from zenika/alpine-chrome
# Renders neat-looking PDF files
#
# NOTE:
#
# This Docker file is intended to use for Render.com "Blueprints" only.
# - We need updated Chromium drivers for puppeteer, which is not installed
#   in Render.com's default NodeJS Web Services nor does Render.com provide
#   means of installing OS-level dependencies atm
# - Run and install the server app directly on the OS level if possible

# BASE PROFILE
FROM zenika/alpine-chrome:89-with-node-16 AS base
USER root
RUN adduser -D node
RUN addgroup node node
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./

# BUILD API DOCUMENTATION
FROM base as build
RUN npm install && npm cache clean --force
COPY --chown=node:node . .

# Note: Render "Environment Variables" are not accessible during Docker build time.
# Initialize Render "Secrets" here as needed by the "gen:docs" NPM script, if you don't want to use Docker ARGs
RUN --mount=type=secret,id=REGION_NAME,dst=/etc/secrets/REGION_NAME \
  --mount=type=secret,id=LIVE_ORIGIN,dst=/etc/secrets/LIVE_ORIGIN \
  --mount=type=secret,id=ROOT_API_URL,dst=/etc/secrets/ROOT_API_URL \
  --mount=type=secret,id=ROOT_API_URL_VERCEL,dst=/etc/secrets/ROOT_API_URL_VERCEL \
  --mount=type=secret,id=IS_RMCAS_API_ACTIVE,dst=/etc/secrets/IS_RMCAS_API_ACTIVE \
  --mount=type=secret,id=DEPLOYMENT_PLATFORM,dst=/etc/secrets/DEPLOYMENT_PLATFORM \
  export REGION_NAME=$(cat /etc/secrets/REGION_NAME 2>/dev/null || echo "sample_region") && \
  export LIVE_ORIGIN=$(cat /etc/secrets/LIVE_ORIGIN 2>/dev/null || echo "http://localhost:3000") && \
  export ROOT_API_URL=$(cat /etc/secrets/ROOT_API_URL 2>/dev/null || echo "http://localhost:3001") && \
  export ROOT_API_URL_VERCEL=$(cat /etc/secrets/ROOT_API_URL_VERCEL 2>/dev/null || echo "http://localhost:3001") && \
  export IS_RMCAS_API_ACTIVE=$(cat /etc/secrets/IS_RMCAS_API_ACTIVE 2>/dev/null || echo "0") && \
  export DEPLOYMENT_PLATFORM=$(cat /etc/secrets/DEPLOYMENT_PLATFORM 2>/dev/null || echo "default") && \
  npm run gen:docs

# PRODUCTION PROFILE TARGET
FROM base as production
ENV NODE_ENV production
RUN npm ci --only=production && npm cache clean --force
COPY --chown=node:node . .
COPY --from=build /home/node/app/src/public/docs ./src/public/docs
ENV PUPPETEER_EXECUTABLE_PATH='/usr/bin/chromium-browser'

USER node
EXPOSE 3001
CMD [ "node", "src/index.js" ]
