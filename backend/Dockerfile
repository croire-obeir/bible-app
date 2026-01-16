# Stage 1: Base & Development
FROM node:24-alpine AS base
WORKDIR /app

# Install dependencies only when package.json changes (caching)
COPY package*.json ./
RUN npm ci

# Copy the rest of the source
COPY . .

# Node 24 Feature: Native .env support means we don't need 'dotenv' package
# Use --env-file flag in your start script (see below)
EXPOSE 3000

# Default to development mode
CMD ["npm", "run", "dev"]

# Stage 2: Production (Tiny Image)
FROM node:24-alpine AS production
WORKDIR /app
COPY --from=base /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=base /app .
USER node
CMD ["node", "--env-file=.env", "server.js"]