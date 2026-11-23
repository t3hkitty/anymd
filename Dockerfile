# AnyMD (t3hkitty/anymd) — Standalone Local-First & OOB Docker Setup

# Multi-stage production build for AnyMD
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci || npm install

# Copy source code and build production assets
COPY . .
RUN npm run build || npx vite build

# Nginx production runtime
FROM nginx:alpine

# Clean default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy built dist assets to root web directory and anymd subpath
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/dist /usr/share/nginx/html/anymd
COPY --from=build /app/meow_root_index.html /usr/share/nginx/html/index.html

# Expose standard web port
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
