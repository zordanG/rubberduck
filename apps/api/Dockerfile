# ─── Stage 1: prune o monorepo para extrair apenas o que a API precisa ───────
FROM node:22-alpine AS pruner
RUN npm install -g turbo@2
WORKDIR /app
COPY . .
RUN turbo prune api --docker

# ─── Stage 2: instalar dependências ──────────────────────────────────────────
FROM node:22-alpine AS installer
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

RUN npm ci

# ─── Stage 3: build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
RUN npm install -g turbo@2
WORKDIR /app

COPY --from=installer /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ .

# DATABASE_URL fake apenas para satisfazer o prisma.config.ts durante o generate
ENV DATABASE_URL=postgresql://fake:fake@localhost:5432/fake

# Gera o Prisma Client a partir do schema
RUN npm run generate -w @repo/database

# Compila a API
RUN npm run build -w api

# ─── Stage 4: imagem final ────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/node_modules ./
COPY --from=builder /app/packages/config-env ./packages/config-env
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/database/generated ./packages/database/generated

# Cria prisma.config.ts mínimo para produção, sem dependências do monorepo
RUN echo "import { defineConfig } from 'prisma/config'; export default defineConfig({ schema: 'prisma/schema.prisma', migrations: { path: 'prisma/migrations' }, datasource: { url: process.env.DATABASE_URL } });" > packages/database/prisma.config.ts

EXPOSE 3001

# Roda migrate a partir da raiz usando --config para apontar para o config correto
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy --config=packages/database/prisma.config.ts && node apps/api/dist/server.js"]
