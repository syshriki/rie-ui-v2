# Rie.recipes

A recipe collection built with [Next.js](https://nextjs.org).

## Getting Started

```bash
npm install     # installs deps + wires git hooks
npm run dev     # start dev server at http://localhost:3000
```

### Mock Mode

Run without a backend using MSW in-browser mocks:

```bash
npm run mock          # mock mode
npm run mock:slow     # mock mode with 500ms simulated latency
```

Mock data is in `src/mocks/`. Only active when `NEXT_PUBLIC_MOCK_MODE=true`.

## Testing

```bash
npm test              # run Playwright tests (headless)
npm run test:headed   # run with browser visible
npm run test:ui       # interactive Playwright UI
```

Tests live in `tests/`. API calls are intercepted via `page.route()` (see `tests/helpers.ts`) — no backend required.

## Screenshots

Capture every page at every responsive breakpoint:

```bash
npm run screenshots
```

Saves to `screenshots/<commit-hash>/` — 600px, 900px, 1440px, and print layouts.
