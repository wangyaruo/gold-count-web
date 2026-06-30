import type { GoldTransaction, TransactionFilter } from "../types";

const TRANSACTIONS_KEY = "gold-ledger:transactions";
const CURRENT_PRICE_KEY = "gold-ledger:current-price";
const FILTER_KEY = "gold-ledger:filter";

function getStorage(): Storage | null {
  return typeof localStorage === "undefined" ? null : localStorage;
}

function readJson<T>(key: string, fallback: T): T {
  const storage = getStorage();
  if (!storage) {
    return fallback;
  }

  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(key, JSON.stringify(value));
}

function isTransaction(value: unknown): value is GoldTransaction {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GoldTransaction>;
  return (
    typeof candidate.id === "string" &&
    (candidate.type === "buy" || candidate.type === "sell") &&
    typeof candidate.date === "string" &&
    typeof candidate.grams === "number" &&
    typeof candidate.unitPrice === "number" &&
    typeof candidate.fee === "number" &&
    typeof candidate.note === "string"
  );
}

export function loadTransactions(): GoldTransaction[] {
  const transactions = readJson<unknown>(TRANSACTIONS_KEY, []);
  return Array.isArray(transactions) && transactions.every(isTransaction)
    ? transactions
    : [];
}

export function saveTransactions(transactions: GoldTransaction[]): void {
  writeJson(TRANSACTIONS_KEY, transactions);
}

export function loadCurrentGoldPrice(): number {
  const value = readJson<unknown>(CURRENT_PRICE_KEY, 0);
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}

export function saveCurrentGoldPrice(price: number): void {
  writeJson(CURRENT_PRICE_KEY, Number.isFinite(price) && price >= 0 ? price : 0);
}

export function loadTransactionFilter(): TransactionFilter {
  const value = readJson<unknown>(FILTER_KEY, "all");
  return value === "all" || value === "buy" || value === "sell"
    ? value
    : "all";
}

export function saveTransactionFilter(filter: TransactionFilter): void {
  writeJson(FILTER_KEY, filter);
}
