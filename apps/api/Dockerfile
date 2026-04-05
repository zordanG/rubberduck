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

# DATABASE_URL fake apenas para o prisma generate (não conecta ao banco)
ARG DATABASE_URL=postgresql://fake:fake@localhost:5432/fake
ENV DATABASE_URL=$DATABASE_URL

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

# Schema e config do Prisma — necessários para o migrate deploy em runtime
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/database/prisma.config.ts ./packages/database/prisma.config.ts

# Client gerado pelo Prisma
COPY --from=builder /app/packages/database/generated ./packages/database/generated

EXPOSE 3001

# Roda migrations antes de subir o servidor
CMD ["sh", "-c", "cd packages/database && npx prisma migrate deploy && cd /app && node apps/api/dist/server.js"]