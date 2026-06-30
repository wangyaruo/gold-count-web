# Mock File Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Store user ledger data in `mock/ledger-data.json` instead of browser `localStorage`.

**Architecture:** Add a small local file data store used by a Vite dev-server API. The Vue app loads and saves ledger state through `/api/ledger-data`, while pure ledger calculations remain unchanged.

**Tech Stack:** Vue 3, TypeScript, Vite dev server middleware, Vitest, Node `fs/promises`.

---

## File Structure

- Create `mock/ledger-data.json`: persisted ledger data file.
- Create `server/mockDataStore.ts`: read/write and validation helpers for the JSON file.
- Create `server/mockApiPlugin.ts`: Vite middleware exposing `GET /api/ledger-data` and `POST /api/ledger-data`.
- Create `server/mockDataStore.test.ts`: tests for file read/write defaults.
- Modify `src/types.ts`: add `LedgerData`.
- Modify `src/lib/storage.ts`: replace localStorage helpers with async API client helpers.
- Modify `src/lib/storage.test.ts`: test API client load/save behavior with mocked `fetch`.
- Modify `src/App.vue`: load ledger data asynchronously and save full data to the API after user edits.
- Modify `vite.config.ts`: install mock API plugin.
- Modify `README.md`: document `mock/ledger-data.json` persistence and GitHub Pages limitation.

## Tasks

- [ ] Write failing tests for `server/mockDataStore.ts` reading defaults and writing JSON.
- [ ] Implement `mock/ledger-data.json`, `server/mockDataStore.ts`, and `server/mockApiPlugin.ts`.
- [ ] Write failing tests for async `src/lib/storage.ts` API helpers using mocked `fetch`.
- [ ] Implement async frontend storage helpers.
- [ ] Update `src/App.vue` to load and save `LedgerData`.
- [ ] Update README.
- [ ] Run `npm run test` and `npm run build`.
- [ ] Commit and push to `origin/main`.
