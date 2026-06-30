# Gold Ledger Design

## Goal

Build a small personal gold ledger web app for recording gold buy and sell transactions, grams, prices, fees, and notes. The app should make it easy to see current holdings, realized profit and loss, unrealized profit and loss, and total profit and loss.

## Product Scope

- The app is a pure frontend single-page app.
- Data is stored locally in the user's browser with `localStorage`.
- There is no login, backend, database, account sync, or automatic gold price feed.
- The current gold price is entered manually by the user and persisted locally.
- The app is suitable for deployment from a GitHub repository, including GitHub Pages.

## Technical Stack

- Vue 3
- TypeScript
- Vite
- Element Plus for UI components
- Vitest for unit tests

## Core Features

1. Add a transaction with type, date, grams, unit price, fee, and note.
2. Edit an existing transaction.
3. Delete an existing transaction.
4. Filter the transaction list by all, buy, or sell.
5. Manually enter and save the current gold price.
6. Show summary metrics:
   - Holding grams
   - Remaining holding cost
   - Current holding value
   - Unrealized profit and loss
   - Realized profit and loss
   - Total profit and loss
7. Keep data after page refresh through local browser storage.
8. Show an empty state when there are no transactions.

## Calculation Rules

- Buy cost equals `grams * unitPrice + fee`.
- Sell income equals `grams * unitPrice - fee`.
- Realized profit and loss uses FIFO: the oldest available buy lots are sold first.
- Remaining holding cost is the cost basis left after FIFO sell matching.
- Current holding value equals `currentGoldPrice * holdingGrams`.
- Unrealized profit and loss equals `currentHoldingValue - remainingHoldingCost`.
- Total profit and loss equals `realizedProfitLoss + unrealizedProfitLoss`.
- A sell transaction is invalid if its grams exceed currently available holdings after previous transactions.

## Component Design

- `SummaryCards`: displays the six key ledger metrics.
- `GoldPriceInput`: handles current gold price entry and save feedback.
- `TransactionForm`: handles add and edit flows for buy and sell records.
- `TransactionTable`: displays transaction rows, filter controls, edit action, and delete action.
- `EmptyLedger`: displays the no-data state.

## Data Modules

- `goldLedger`: pure TypeScript calculation module for FIFO lots, holding state, realized profit and loss, unrealized profit and loss, and validation.
- `storage`: local persistence module for transactions, current gold price, and simple view state.
- Shared types define transaction records and ledger summaries.

## Validation And Error Handling

- Date is required.
- Type is required.
- Grams must be greater than 0.
- Unit price must be greater than 0.
- Fee defaults to 0 and cannot be negative.
- Sell grams cannot exceed available holdings.
- Invalid form submissions show Element Plus validation messages.
- Storage parsing failures fall back to empty data instead of crashing the page.

## UI Direction

The UI should feel like a focused personal finance tool rather than a marketing page. The first screen is the actual ledger. The layout uses restrained colors, clear numbers, and compact controls:

- Header with app name and current gold price input.
- Summary metric area near the top.
- Main work area with transaction form and transaction table.
- Responsive layout that stacks cleanly on mobile.
- Profit values use positive and negative visual treatment, while keeping the overall palette calm.

## Testing Plan

Unit tests cover the ledger calculation module:

- Buy-only holdings.
- FIFO realized profit and loss across multiple buy lots.
- Buy and sell fees.
- Remaining cost after partial sells.
- Unrealized and total profit and loss from manual current price.
- Oversell validation.

Build verification covers:

- TypeScript type check.
- Vitest test run.
- Production build.

## Out Of Scope

- User accounts.
- Cloud sync.
- Backend API.
- Real-time gold price integration.
- Multi-currency support.
- Tax reporting.
