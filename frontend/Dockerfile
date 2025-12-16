FROM node:20-alpine AS builder

WORKDIR /app

# Install ALL dependencies (dev included for build process)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .

ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built app and dependencies
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

EXPOSE 3000

CMD ["npm", "run", "start"]
