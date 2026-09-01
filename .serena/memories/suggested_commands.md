# Suggested Commands

## Development
| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server with Turbopack (port 3219) |
| `pnpm build` | Next.js static export build (output: 'export') |
| `pnpm start` | Serve production build |

## Quality Checks
| Command | Description |
|---------|-------------|
| `pnpm lint` | ESLint (flat config) |
| `pnpm typecheck` | TypeScript strict check (no emit) |
| `pnpm test:e2e` | Playwright E2E tests (Chromium, auto-starts dev server) |
| `pnpm test:e2e:ui` | Playwright interactive UI mode |
| `pnpm test:e2e:headed` | Run E2E tests in headed browser |

## Port
Dev server runs on **port 3219** (non-standard). Kill before starting: `kill-port 3219` or `lsof -ti:3219 | xargs kill -9`

## System Utils (Darwin)
- `git`, `pnpm`, `lsof`, `xargs`, `kill`
