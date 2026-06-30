# Gold Ledger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and push a Vue 3 + Element Plus personal gold ledger that records gold buy and sell transactions and shows holdings, realized P/L, unrealized P/L, and total P/L.

**Architecture:** Use a pure frontend Vite app. Keep ledger calculation in a pure TypeScript module, browser persistence in a separate storage module, and Vue components focused on interaction and display.

**Tech Stack:** Vue 3, TypeScript, Vite, Element Plus, Vitest, vue-tsc.

---

## File Structure

- Create `package.json`: project scripts and dependencies.
- Create `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`: Vite and TypeScript setup.
- Create `src/main.ts`: Vue app bootstrap and Element Plus registration.
- Create `src/App.vue`: app shell, state coordination, add/edit/delete handlers.
- Create `src/types.ts`: shared transaction, form, and summary types.
- Create `src/lib/goldLedger.ts`: pure FIFO calculation and validation logic.
- Create `src/lib/goldLedger.test.ts`: Vitest coverage for calculation rules.
- Create `src/lib/storage.ts`: localStorage read/write helpers with parse fallback.
- Create `src/components/SummaryCards.vue`: summary metrics display.
- Create `src/components/GoldPriceInput.vue`: current gold price editor.
- Create `src/components/TransactionForm.vue`: add/edit transaction form.
- Create `src/components/TransactionTable.vue`: filterable transaction table with actions.
- Create `src/components/EmptyLedger.vue`: empty state.
- Create `src/styles.css`: app-level responsive styling and Element Plus polish.
- Create `.gitignore`, `README.md`: repository hygiene and usage notes.

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `src/main.ts`
- Create: `src/App.vue`
- Create: `src/styles.css`
- Create: `.gitignore`

- [ ] **Step 1: Create Vite Vue project files**

Use Vue 3, TypeScript, Element Plus, Vitest, and vue-tsc scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 3: Verify scaffold build**

Run: `npm run build`

Expected: build exits with status 0 after the initial app compiles.

- [ ] **Step 4: Commit scaffold**

```bash
git add .
git commit -m "chore: scaffold vue gold ledger app"
```

## Task 2: Ledger Calculation With TDD

**Files:**
- Create: `src/types.ts`
- Create: `src/lib/goldLedger.test.ts`
- Create: `src/lib/goldLedger.ts`

- [ ] **Step 1: Write failing tests**

Cover:

```ts
it("calculates buy-only holdings with fees", () => {});
it("matches sells against oldest buy lots first", () => {});
it("applies sell fees to realized profit", () => {});
it("keeps remaining cost after partial sells", () => {});
it("calculates unrealized and total profit from current price", () => {});
it("reports oversell validation errors", () => {});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `npm run test -- src/lib/goldLedger.test.ts`

Expected: FAIL because `goldLedger` implementation does not exist yet.

- [ ] **Step 3: Implement minimal ledger module**

Implement:

```ts
export function calculateLedger(transactions: GoldTransaction[], currentGoldPrice: number): LedgerSummary;
export function validateTransactionDraft(draft: TransactionDraft, existing: GoldTransaction[], editingId?: string): string[];
export function sortTransactionsForDisplay(transactions: GoldTransaction[]): GoldTransaction[];
```

Use FIFO buy lots where each lot tracks remaining grams and remaining cost.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `npm run test -- src/lib/goldLedger.test.ts`

Expected: all ledger tests pass.

- [ ] **Step 5: Commit ledger logic**

```bash
git add src/types.ts src/lib/goldLedger.ts src/lib/goldLedger.test.ts
git commit -m "feat: add gold ledger calculations"
```

## Task 3: Local Storage Module

**Files:**
- Create: `src/lib/storage.ts`

- [ ] **Step 1: Add storage helpers**

Implement read/write helpers for transactions, current gold price, and transaction filter. Invalid JSON returns defaults.

- [ ] **Step 2: Run type/build check**

Run: `npm run build`

Expected: TypeScript and Vite build pass.

- [ ] **Step 3: Commit storage module**

```bash
git add src/lib/storage.ts
git commit -m "feat: add local ledger persistence"
```

## Task 4: Vue Components

**Files:**
- Create: `src/components/SummaryCards.vue`
- Create: `src/components/GoldPriceInput.vue`
- Create: `src/components/TransactionForm.vue`
- Create: `src/components/TransactionTable.vue`
- Create: `src/components/EmptyLedger.vue`
- Modify: `src/App.vue`

- [ ] **Step 1: Build display components**

Create summary cards, gold price input, empty state, and table components using Element Plus components such as `el-card`, `el-statistic`, `el-input-number`, `el-table`, `el-segmented`, `el-button`, and `el-popconfirm`.

- [ ] **Step 2: Build transaction form**

Use `el-form`, `el-date-picker`, `el-radio-group`, `el-input-number`, and `el-input`. Validate required date, type, grams greater than 0, unit price greater than 0, and fee at least 0.

- [ ] **Step 3: Wire app state**

`App.vue` loads persisted data, calculates summary through `calculateLedger`, blocks oversells with `validateTransactionDraft`, and persists changes.

- [ ] **Step 4: Run build**

Run: `npm run build`

Expected: app compiles with all components.

- [ ] **Step 5: Commit UI**

```bash
git add src
git commit -m "feat: build gold ledger interface"
```

## Task 5: Styling, Docs, Verification, Push

**Files:**
- Modify: `src/styles.css`
- Modify: `README.md`

- [ ] **Step 1: Style responsive layout**

Make the first screen the ledger itself, with a compact finance-tool layout, responsive stacking, stable card sizing, and no marketing hero.

- [ ] **Step 2: Document usage**

Add README instructions for install, dev, test, build, data storage, and calculation rules.

- [ ] **Step 3: Run final verification**

Run:

```bash
npm run test
npm run build
```

Expected: tests pass and production build exits 0.

- [ ] **Step 4: Add GitHub remote and push**

Run:

```bash
git remote add origin git@github.com:wangyaruo/gold-count-web.git
git branch -M main
git push -u origin main
```

Expected: branch `main` is pushed to `wangyaruo/gold-count-web`.
