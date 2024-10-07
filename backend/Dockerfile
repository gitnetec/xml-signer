FROM ubuntu:24.04

WORKDIR /app

# Install Node.js (use the version from WSL if needed)
RUN apt-get update && apt-get install -y \
    curl \
    openssl \
    xmlsec1=1.2.39-5build2 \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Verify Node.js and xmlsec1 installation
RUN node -v && npm -v && xmlsec1 --version

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
