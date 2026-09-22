# ─────────────────────────────────────────────
# Stage 1: Build the React application
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

# Copy source files
COPY . .

# Build production bundle
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Serve with Nginx
# ─────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Remove default Nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx config
COPY nginx.conf /etc/nginx/nginx.conf
COPY security-headers.conf /etc/nginx/security-headers.conf

# The config directory is empty in the image — it will be mounted at runtime
# This directory acts as a placeholder that the volume mount replaces
RUN mkdir -p /usr/share/nginx/html/config

EXPOSE 80

# Docker health check using the /health endpoint
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
