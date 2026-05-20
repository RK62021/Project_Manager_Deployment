# Use official lightweight Node.js 18 image on Alpine Linux
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY src/ ./src/

# Expose server port (default 5000)
EXPOSE 5000

# Set environment variables defaults
ENV NODE_ENV=production
ENV PORT=5000

# Run the application
CMD ["node", "src/index.js"]
