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

COPY . .
RUN yarn build

# Verify content after build
RUN echo "Content of /usr/src/app after build:" && \
    ls -la /usr/src/app

EXPOSE 3771

CMD ["yarn", "start"]
