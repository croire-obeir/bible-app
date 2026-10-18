# Stage 1: Base & Development
FROM node:24-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the source
COPY . .

EXPOSE 3000

# Run migrations then start dev mode
# We use --env-file here so Knex can see your DB credentials
CMD npx knex migrate:latest --knexfile ./src/config/knexfile.js --env-file=.env && npm run dev

# Stage 2: Production
FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node . .

USER node

EXPOSE 3000

CMD ["npm", "start"]