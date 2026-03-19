# Rubberduck

A full-stack monorepo for devs to post and comment on conde, built with Turborepo.

## Packages

| Package             | Description                              |
| ------------------- | ---------------------------------------- |
| `apps/api`          | REST API built with Fastify and Zod      |
| `apps/web`          | Frontend built with Next.js              |
| `packages/database` | Shared Prisma client and database schema |

## Requirements

- Node.js >= 20
- npm >= 10.9.0
- Docker and Docker Compose

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/zordanG/rubberduck.git
cd rubberduck
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the database

```bash
docker compose up -d
```

This starts a PostgreSQL 15 instance with the following defaults:

| Setting  | Value               |
| -------- | ------------------- |
| Host     | `localhost`         |
| Port     | `5433`              |
| Database | `rubberduck`        |
| User     | `rubberduck`        |
| Password | `rubberduck_master` |

### 4. Configure environment variables

Create a `.env` file inside `apps/api/`:

```env
DATABASE_URL=postgresql://rubberduck:rubberduck_master@localhost:5433/rubberduck
```

### 5. Run database migrations

```bash
npm run db:migrate:dev
```

### 6. Generate Prisma client

```bash
npm run generate
```

### 7. Start development servers

```bash
npm run dev
```

This starts all apps in parallel via Turborepo:

| App                | URL                        |
| ------------------ | -------------------------- |
| API                | http://localhost:3001      |
| API Docs (Swagger) | http://localhost:3001/docs |
| Web                | http://localhost:3000      |

## Available Scripts

| Script                      | Description                                       |
| --------------------------- | ------------------------------------------------- |
| `npm run dev`               | Start all apps in development mode                |
| `npm run build`             | Build all apps                                    |
| `npm run lint`              | Lint all packages (untested)                      |
| `npm run format`            | Format all files with Prettier (untested)         |
| `npm run generate`          | Generate Prisma client                            |
| `npm run db:migrate:dev`    | Run database migrations (development)             |
| `npm run db:migrate:deploy` | Run database migrations (production)              |
| `npm run db:push`           | Push schema changes without migrations (untested) |
| `npm run db:seed`           | Seed the database (untested)                      |

## API Routes

Full interactive documentation is available at `http://localhost:3001/docs`.

## Database

The database package lives in `packages/database` and exposes a shared Prisma client used across the monorepo.

To stop and remove the Docker container:

```bash
docker compose down
```

To also remove the persisted data volume:

```bash
docker compose down -v
```
