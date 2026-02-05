# Multi-stage Dockerfile para AgroGest
# Stage 1: Build do Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte do frontend
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY eslint.config.js ./

# Build do frontend
ARG VITE_API_URL=http://localhost:3002
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

# Stage 2: Preparar Backend
FROM node:18-alpine AS backend-builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar apenas dependências de produção
RUN pnpm install --frozen-lockfile --prod

# Stage 3: Imagem Final
FROM node:18-alpine AS production

# Instalar dumb-init para gerenciamento de processos
RUN apk add --no-cache dumb-init

WORKDIR /app

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S agrogest -u 1001 -G nodejs

# Instalar pnpm
RUN npm install -g pnpm

# Copiar dependências do backend
COPY --from=backend-builder --chown=agrogest:nodejs /app/node_modules ./node_modules
COPY --from=backend-builder --chown=agrogest:nodejs /app/package.json ./package.json

# Copiar código do backend
COPY --chown=agrogest:nodejs api/ ./api/

# Copiar build do frontend
COPY --from=frontend-builder /app/dist ./dist

# Copiar arquivos de configuração
COPY scripts/ ./scripts/

# Criar diretório para uploads (se necessário)
RUN mkdir -p /app/uploads && chown -R agrogest:nodejs /app/uploads

# Mudar para usuário não-root
USER agrogest

# Expor porta
EXPOSE 3002

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/api', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando para iniciar a aplicação
CMD ["sh", "-c", "node scripts/create-test-user.js && node api/server.js"]