# ==========================================
# STAGE 1: Build static assets
# ==========================================
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install packages
RUN npm ci

# Copy source
COPY . .

# Set Vite build environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build assets
RUN npm run build

# ==========================================
# STAGE 2: Nginx Web Server runtime
# ==========================================
FROM nginx:1.25-alpine

# Copy built assets from build stage to nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration to support SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
