FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=http://localhost:5000/api/v1
ARG VITE_SOCKET_URL=http://localhost:5000
ARG VITE_GIPHY_API_KEY=

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_GIPHY_API_KEY=$VITE_GIPHY_API_KEY

COPY package*.json ./
COPY apps/web/package*.json apps/web/
COPY apps/api/package*.json apps/api/
COPY packages/shared/package*.json packages/shared/

RUN npm ci

COPY . .

RUN npm run build -w @chat-app/shared && npm run build -w @chat-app/web

FROM nginx:1.27-alpine AS runner

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80
