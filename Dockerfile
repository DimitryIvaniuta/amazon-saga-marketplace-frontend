# syntax=docker/dockerfile:1.7
FROM node:24.17.0-alpine AS build
WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run check

FROM nginxinc/nginx-unprivileged:1.31.2-alpine
LABEL org.opencontainers.image.title="Atlas Marketplace Frontend" \
      org.opencontainers.image.description="React marketplace portal for the Saga commerce platform" \
      org.opencontainers.image.source="https://github.com/dimitryivaniuta/amazon-saga-marketplace-frontend"
ENV API_UPSTREAM=http://api-gateway:8080 \
    APP_NAME="Atlas Marketplace" \
    API_BASE_URL="" \
    ORDER_POLLING_MS=2000 \
    APP_RELEASE=development \
    TELEMETRY_ENDPOINT="" \
    TELEMETRY_SAMPLE_RATE=0

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --chmod=755 docker/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
COPY --from=build /workspace/dist /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
