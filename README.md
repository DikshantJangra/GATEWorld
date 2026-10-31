# GATEWorld

A hosted web app for GATE prep. Open it and start; no signup. Log in only to sync across devices. Organized by exam year: each year's syllabus and content is versioned data, and each student works in their own cycle.

## Principles

- **Anyone can use it.** Hosted Next.js app. No install, no server of your own.
- **Local-first, login optional.** An anonymous user's data lives in their browser. Logging in syncs it to the server and across devices.
- **Every year is a fresh cycle.** The syllabus changes yearly, so a student's data belongs to a cycle (exam year), never to the account alone.
- **The student owns their plan.** Each cycle holds the student's own copy of the syllabus, which they can edit.
- **Derived, never stored.** Days left, coverage %, hours, averages and heatmaps are always computed from the raw records.
- **Shared content is ingested once.** A PDF that is already in the bank is reused, not re-parsed.

## Core model

- **Syllabus version** (shared, immutable). One per exam year, e.g. `gate-cs-2027`: sections and topics with stable ids. A new year adds a new version, and old ones are never edited. Loaded from `data/<year>/syllabus.json`.
- **Cycle** (per student). A student's attempt at one exam year: exam date, goals, and a personal copy of the syllabus version that is theirs to customize. Rename, add, remove or re-prioritize topics, and nothing leaks to other students. Stable topic ids let a new cycle carry progress forward by choice, for example confidence and notes on unchanged topics.
- **Per-cycle records.** Topic progress (status, confidence, PYQ state, revision dates, notes), study log, mock tests.
- **Shared bank.** Papers and questions, keyed by exam, year, subject and slot, mapped to topic ids. Per-student attempts reference it and are never shared.

## Repository layout

```
data/
  2027/                 current exam year; the only year present today
    syllabus.json       11 sections, 107 topics
apps/web/               Next.js 16 frontend (TypeScript, Tailwind)
  src/domain/           types and pure derived calculations (tested)
  src/data/             year registry; loads data/<year>/syllabus.json
  src/store/            client state (Zustand), persisted to the browser
  src/components/       shared UI and the store provider
  src/app/              routes: dashboard, syllabus
services/ingest/        Python PDF ingestion (to be created)
```

- Year-specific data lives in `data/<year>/`. A new exam year is a new folder; existing years are never modified once published.
- Topic ids are stable across years so progress can map between cycles. Within a year, ids never change.
- Later additions per year: `data/<year>/papers/` for paper metadata and answer keys. PDFs and databases are not committed.

## Architecture

- `apps/web` Next.js frontend, hosted. Data flow: `data/<year>/syllabus.json` -> `src/data` registry -> a new cycle in the store (deep copy) -> pages read the cycle and compute stats in `src/domain`. The store persists to browser storage; the sync layer later swaps that storage for the server.
- Sync and accounts: Postgres with an auth provider, added after the tracker works. Records merge per record, last write wins.
- PDF ingestion: a separate Python service that hashes the file, detects year and subject, parses into a review queue, then publishes to the shared bank. Built once real PDFs arrive.

## Roadmap

1. **Tracker.** Cycles, syllabus, topic progress, daily log, mock tests, dashboard, xlsx import. Browser storage only.
2. **Accounts and sync.** Optional login, Postgres, cross-device sync.
3. **Ingestion.** PDFs to the shared question bank, with duplicate reuse.
4. **Practice.** Solve questions, record attempts, spaced revision.
5. **Analytics.** PYQ frequency by topic, weak-topic heatmaps, mock trends.
6. **Yearly rollover.** Publish each new syllabus version and let students start a new cycle from their last one.
