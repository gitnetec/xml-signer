FROM node:18.20.4-slim

WORKDIR /app

# Install necessary system dependencies and download xmlsec1 deb package
RUN apt-get update && apt-get install -y \
    curl \
    openssl \
    wget && \
    wget http://archive.ubuntu.com/ubuntu/pool/universe/x/xmlsec1/xmlsec1_1.2.39-5build2_amd64.deb && \
    dpkg -i xmlsec1_1.2.39-5build2_amd64.deb

# Verify xmlsec1 and Node.js versions
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
