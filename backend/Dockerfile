FROM node:18.20.4-slim

WORKDIR /app

# Instale dependências de compilação
RUN apt-get update && apt-get install -y \
    curl \
    openssl \
    build-essential \
    wget \
    libxml2-dev \
    libssl-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Verificar se o wget e o diretório de download estão funcionando corretamente
RUN wget http://archive.ubuntu.com/ubuntu/pool/main/x/xmlsec1/xmlsec1_1.2.39.orig.tar.gz && ls -l && tar -xvzf xmlsec1_1.2.39.orig.tar.gz

# Mude para o diretório do xmlsec1 e compile
RUN cd xmlsec1-1.2.39 && ./configure --prefix=/usr/local && make && make install

# Verifique a versão correta do xmlsec1
RUN xmlsec1 --version

# Copie os arquivos de dependências e instale
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copie o restante dos arquivos da aplicação e faça a build
COPY . .
RUN yarn build

# Verifique os arquivos após a build
RUN ls -la /app && ls -la /app/dist

EXPOSE 3771

# Comando para rodar a aplicação
CMD ["yarn", "start"]
