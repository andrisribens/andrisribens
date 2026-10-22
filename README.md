# andrisribens

Personal website with a weather forecast app.

Stack: Next.js 16, React 19, TypeScript, pnpm.

Requires Node.js **22.23.4+**, **24.22.1+**, or **26.12.1+** (see `.nvmrc`).

## Setup

```bash
# if using nvm: nvm use
pnpm install
cp .env.example .env.local   # then edit with your API URLs
pnpm dev
```

Open [http://localhost:3000/weather](http://localhost:3000/weather) for the weather app.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |

## Docs

- [AGENTS.md](./AGENTS.md) — project structure, conventions, and Cursor agent guidance
