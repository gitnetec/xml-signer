FROM node:18-alpine as base

WORKDIR /usr/src/app

# Install necessary system dependencies
RUN apk --no-cache add \
    openssl \
    xmlsec \
    bash

# Copy dependency files and install
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN yarn build

# Verify content after build
RUN echo "Content of /usr/src/app after build:" && \
    ls -la /usr/src/app && \
    echo "Content of /usr/src/app/dist:" && \
    ls -la /usr/src/app/dist

EXPOSE 3771

# Use node to run the built application
CMD ["node", "dist/index.js"]
