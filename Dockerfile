# Use a lightweight Node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app (if applicable, otherwise it might just run)
RUN npm run build --if-present

# Expose the port (Check package.json for the actual port, usually 3000 or 8080)
EXPOSE 3000

# Start the application
CMD ["npm", "run", "build"]