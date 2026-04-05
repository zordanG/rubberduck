# ─── Stage 1: prune o monorepo ───────────────────────────────────────────────
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

# DATABASE_URL fake para satisfazer o prisma.config.ts durante o generate
ENV DATABASE_URL=postgresql://fake:fake@localhost:5432/fake

RUN npm run generate -w @repo/database
RUN node_modules/.bin/esbuild packages/database/src/client.ts --bundle=false --format=esm --outfile=packages/database/dist/client.js
RUN npm run build -w api

# ─── Stage 4: imagem final ────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/config-env ./packages/config-env
COPY --from=builder /app/packages/database/generated ./packages/database/generated
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/database/dist ./node_modules/@repo/database/dist
COPY --from=builder /app/packages/database/package.json ./node_modules/@repo/database/package.json

# Aponta exports do database para o dist compilado
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('node_modules/@repo/database/package.json'));p.exports={'.':'./dist/client.js'};fs.writeFileSync('node_modules/@repo/database/package.json',JSON.stringify(p,null,2));"

# Cria prisma.config.ts mínimo para produção
RUN echo "import { defineConfig } from 'prisma/config'; export default defineConfig({ schema: 'prisma/schema.prisma', migrations: { path: 'prisma/migrations' }, datasource: { url: process.env.DATABASE_URL } });" > packages/database/prisma.config.ts

EXPOSE 3001

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy --config=packages/database/prisma.config.ts && node apps/api/dist/server.js"]