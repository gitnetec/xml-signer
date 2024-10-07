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
    libltdl-dev \
    && rm -rf /var/lib/apt/lists/*

# Baixar e descompactar o xmlsec1 versão correta
RUN wget http://archive.ubuntu.com/ubuntu/pool/main/x/xmlsec1/xmlsec1_1.2.39.orig.tar.gz \
    && tar -xvzf xmlsec1_1.2.39.orig.tar.gz

# Mude para o diretório do xmlsec1, compile e instale
RUN cd xmlsec1-1.2.39 && ./configure --prefix=/usr/local && make && make install

# Atualize o LD_LIBRARY_PATH para incluir as bibliotecas instaladas
ENV LD_LIBRARY_PATH="/usr/local/lib:$LD_LIBRARY_PATH"

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
