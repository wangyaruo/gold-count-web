import { beforeEach, describe, expect, it } from "vitest";
import {
  loadCurrentGoldPrice,
  loadTransactionFilter,
  loadTransactions,
  saveCurrentGoldPrice,
  saveTransactionFilter,
  saveTransactions
} from "./storage";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("storage", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true
    });
  });

  it("saves and loads transactions", () => {
    const transactions = [
      {
        id: "buy-1",
        type: "buy" as const,
        date: "2026-06-01",
        grams: 1,
        unitPrice: 500,
        fee: 2,
        note: "test"
      }
    ];

    saveTransactions(transactions);

    expect(loadTransactions()).toEqual(transactions);
  });

  it("saves and loads current gold price", () => {
    saveCurrentGoldPrice(568.5);

    expect(loadCurrentGoldPrice()).toBe(568.5);
  });

  it("saves and loads transaction filter", () => {
    saveTransactionFilter("sell");

    expect(loadTransactionFilter()).toBe("sell");
  });

  it("falls back to defaults for invalid data", () => {
    localStorage.setItem("gold-ledger:transactions", "{bad json");
    localStorage.setItem("gold-ledger:current-price", "not-a-number");
    localStorage.setItem("gold-ledger:filter", "unknown");

    expect(loadTransactions()).toEqual([]);
    expect(loadCurrentGoldPrice()).toBe(0);
    expect(loadTransactionFilter()).toBe("all");
  });
});
