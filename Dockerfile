FROM node:20-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código-fonte
COPY . .

# Compilar frontend com Vite
RUN npm run build

# Definir variáveis de ambiente
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
