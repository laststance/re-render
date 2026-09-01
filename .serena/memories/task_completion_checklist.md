# Task Completion Checklist

When a task is completed, run these checks in this order:

## 1. Parallel Quality Checks
Run together (no dependencies):
```bash
pnpm lint
pnpm typecheck
```

## 2. Build Verification
```bash
pnpm build
```

## 3. E2E Tests
```bash
pnpm test:e2e
```

## Important Notes
- Port 3219 must be free before starting dev server
- Playwright auto-starts dev server for E2E tests
- All checks must pass before considering task complete
