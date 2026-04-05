# ─── Stage 1: prune o monorepo para extrair apenas o que a API precisa ───────
FROM node:22-alpine AS pruner
RUN npm install -g turbo@2
WORKDIR /app
COPY . .
RUN turbo prune api --docker

# ─── Stage 2: instalar dependências ──────────────────────────────────────────
FROM node:22-alpine AS installer
RUN npm install -g pnpm
WORKDIR /app

# Copia apenas os package.json isolados (cache-friendly)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile

# ─── Stage 3: build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
RUN npm install -g pnpm turbo@2
WORKDIR /app

COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=pruner /app/out/full/ .

# Gera o Prisma Client a partir do schema
RUN pnpm --filter @repo/database run generate

# Compila a API (tsc)
RUN pnpm --filter api run build

# ─── Stage 4: imagem final ────────────────────────────────────────────────────
FROM node:22-alpine AS runner
RUN npm install -g pnpm
WORKDIR /app

ENV NODE_ENV=production

# Copia apenas o necessário para rodar
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database/node_modules ./packages/database/node_modules

# Schema do Prisma — necessário para o `migrate deploy` em runtime
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma

# Client gerado pelo Prisma
COPY --from=builder /app/packages/database/generated ./packages/database/generated

EXPOSE 3001

# Roda migrations antes de subir o servidor
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy --schema=packages/database/prisma/schema.prisma && node apps/api/dist/server.js"]
