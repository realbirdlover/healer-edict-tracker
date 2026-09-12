# Healer Edict Tracker

A single-page PWA for tracking Rogue Lineage Healer Edict progress across wipes: Gaia and Khei
checklists, wipe history with frozen snapshots, multiple accounts, and an editable checklist
template and tier thresholds.

All data is stored locally in the browser (IndexedDB) — there is no server and no account system.
Each machine/browser you run this on keeps its own separate data.

## Running it

Requires [Node.js](https://nodejs.org) 20+ (which includes npm).

```bash
npm install
npm run dev
```

Then open the URL it prints (usually `http://localhost:5173`).

## Installing it as a desktop app

For offline use / a standalone window instead of a browser tab:

```bash
npm run build
npm run preview
```

Open the printed URL in Chrome or Edge, then click the install icon in the address bar (or the
browser's menu → "Install Healer Edict Tracker"). This installs a real desktop app backed by the
same local IndexedDB storage — it keeps working without the terminal open, but it's still local
to that machine.

## Testing

```bash
npx vitest run
```

Covers the data layer: wipe archiving, counter math, template reset, and that editing the
template after a wipe never rewrites an already-archived history snapshot.
