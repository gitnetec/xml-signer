FROM node:18-bullseye as base

WORKDIR /app

# Install necessary system dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    xmlsec1=1.2.39-1 \
    bash

# Copy dependency files and install
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN yarn build

# Verify content after build
RUN echo "Content of /app after build:" && \
    ls -la /app && \
    echo "Content of /app/dist:" && \
    ls -la /app/dist

EXPOSE 3771

# Use node to run the built application
CMD ["yarn", "start"]
