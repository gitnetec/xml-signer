# Build stage
FROM node:18 AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN yarn build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3772

CMD ["yarn", "start"]
