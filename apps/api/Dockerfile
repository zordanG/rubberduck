# ─── Stage 1: prune o monorepo para extrair apenas o que a API precisa ───────
FROM node:22-alpine AS pruner
RUN npm install -g turbo@2
WORKDIR /app
COPY . .
RUN turbo prune api --docker

# ─── Stage 2: instalar dependências ──────────────────────────────────────────
FROM node:22-alpine AS installer
WORKDIR /app

# Copia apenas os package.json isolados (cache-friendly)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

RUN npm ci

# ─── Stage 3: build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
RUN npm install -g turbo@2
WORKDIR /app

COPY --from=installer /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ .

# Gera o Prisma Client a partir do schema
RUN npm run generate -w @repo/database

# Compila a API
RUN npm run build -w api

# ─── Stage 4: imagem final ────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copia apenas o necessário para rodar
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/node_modules ./node_modules

# Schema do Prisma — necessário para o migrate deploy em runtime
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma

# Client gerado pelo Prisma
COPY --from=builder /app/packages/database/generated ./packages/database/generated

EXPOSE 3001

# Roda migrations antes de subir o servidor
CMD ["sh", "-c", "DATABASE_URL=$DATABASE_URL node_modules/.bin/prisma migrate deploy --schema=packages/database/prisma/schema.prisma && node apps/api/dist/server.js"]