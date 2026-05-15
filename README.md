# GoTogether

GoTogether is a digital platform that connects older adults and people with disabilities with verified companions for everyday activities.

## Monorepo structure

- `apps/web` Next.js frontend (App Router)
- `apps/api` NestJS backend with Prisma
- `packages/ui` shared UI components
- `packages/shared` shared types and constants
- `infra/docker` local dev services
- `docs` architecture and product notes

## Quickstart

1. Install dependencies

```bash
pnpm install
```

2. Set up environment variables

```bash
cp .env.example .env
```

3. Run web + api

```bash
pnpm dev
```

If pnpm is missing:

```bash
npm install -g pnpm
```

## Vercel deployment

- Set the project root to `apps/web`.
- Build command: `pnpm install --frozen-lockfile && pnpm build`.
- Output directory: `.next`.
- Add `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_API_URL` in Vercel env.

## Local services

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```
