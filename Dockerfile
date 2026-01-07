# Use Node image
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

RUN sed -i 's/export default defineConfig({/export default defineConfig({\n  server: { allowedHosts: true },/' vite.config.*

# Expose the Vite port
EXPOSE 5173

# Run in dev mode and force it to accept outside connections
# The "--" passes the argument to the underlying script
CMD ["npm", "run", "dev", "--", "--host", "--allowed-hosts", "all"]