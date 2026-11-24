# Stage 1: Build React Application
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy project source code
COPY . .

# Build production bundle with Vite
RUN npm run build

# Stage 2: Serve via Nginx
FROM nginx:1.25-alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built artifacts from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose standard HTTP port
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
