# Exhibition calendar

Manufacturing trade fairs across India, Oct 2026 to Dec 2027, so the team can plan outreach around them.

- **Month / Year / List views** with search and sector, state and date-status filters
- Every event links to the page its dates were checked on
  - **Confirmed**: dates on the organiser's or venue's official site
  - **Listed**: dates from a directory only
- **Reach out from**: 6 weeks before opening day (`OUTREACH_LEAD_WEEKS` in `src/lib/dates.ts`)

## Run

```bash
npm install
npm run dev
```

## Updating the data

Research files live in `data/research/*.json`. Fixes from source checks go in `data/research/_corrections.json` as `{ "<event id>": { field: value } }`.

```bash
python3 scripts/merge-events.py data/research
```

The script validates dates, sources and sectors, drops duplicates and anything outside the window, and writes `src/data/events.json`.
