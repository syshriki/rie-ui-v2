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

Three views per page, in `screenshots/`:

| file | view |
| --- | --- |
| `<page>-900px.png` | tablet, 900×900 |
| `<page>-1440px.png` | desktop, 1440×900 |
| `<page>-iphone12.png` | mobile, Playwright's iPhone 12 descriptor (390×664 CSS, DPR 3, touch, iPhone UA → 1170px wide) |
| `<page>-print.png` | print media layout |
| `<page>-iphone12-menu.png` | mobile dropdown open — only for pages opting in via `captureMenu` |

Mobile has no breakpoint entry: it comes from the device descriptor, which needs
its own browser context (DPR/touch/UA are context-level).

Mobile captures are several screens tall, so they carry a dashed red line
labelled `▲ end of first screen (664px)` at the fold — everything below it is
what you'd only see after scrolling. It is injected as a manual popover so it
stays visible on top of the open dropdown.
