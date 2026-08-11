FROM node:22-alpine AS builder

WORKDIR /app
RUN corepack enable

COPY . .

ARG VITE_CDN_PATH=/media
ENV VITE_CDN_PATH=$VITE_CDN_PATH

RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM nginx:alpine

COPY --from=builder /app/apps/travel-map/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
