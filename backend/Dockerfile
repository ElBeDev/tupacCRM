FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "dev"]
