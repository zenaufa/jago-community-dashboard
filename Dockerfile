# --- STAGE 1: BUILD THE APP ---
FROM oven/bun:1 AS builder
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN bun install

# Copy source code
COPY . .

# Fix the Base URL: Change '/jago-community-dashboard/' to just '/'
RUN find . -maxdepth 1 -name "vite.config.*" -exec sed -i 's|/jago-community-dashboard/|/|g' {} +

# Build the production files
RUN bun run build

# --- STAGE 2: SERVE WITH NGINX ---
FROM nginx:alpine

# Copy the built files from the previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# --- THE MAGIC TRICK ---
# We create the nginx configuration file right here using echo.
# No need for an external file.
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]