import { describe, expect, it } from "vitest";
import {
  calculateLedger,
  sortTransactionsForDisplay,
  validateTransactionDraft
} from "./goldLedger";

describe("goldLedger", () => {
  it("calculates buy-only holdings with fees", () => {
    const summary = calculateLedger(
      [
        {
          id: "buy-1",
          type: "buy",
          date: "2026-06-01",
          grams: 10,
          unitPrice: 520,
          fee: 30,
          note: "first"
        }
      ],
      560
    );

    expect(summary.holdingGrams).toBe(10);
    expect(summary.remainingCost).toBe(5230);
    expect(summary.currentValue).toBe(5600);
    expect(summary.unrealizedProfitLoss).toBe(370);
    expect(summary.realizedProfitLoss).toBe(0);
    expect(summary.totalProfitLoss).toBe(370);
  });

  it("matches sells against oldest buy lots first", () => {
    const summary = calculateLedger(
      [
        {
          id: "buy-1",
          type: "buy",
          date: "2026-06-01",
          grams: 10,
          unitPrice: 500,
          fee: 0,
          note: ""
        },
        {
          id: "buy-2",
          type: "buy",
          date: "2026-06-02",
          grams: 10,
          unitPrice: 550,
          fee: 0,
          note: ""
        },
        {
          id: "sell-1",
          type: "sell",
          date: "2026-06-03",
          grams: 12,
          unitPrice: 600,
          fee: 0,
          note: ""
        }
      ],
      580
    );

    expect(summary.realizedProfitLoss).toBe(1100);
    expect(summary.holdingGrams).toBe(8);
    expect(summary.remainingCost).toBe(4400);
  });

  it("applies sell fees to realized profit", () => {
    const summary = calculateLedger(
      [
        {
          id: "buy-1",
          type: "buy",
          date: "2026-06-01",
          grams: 5,
          unitPrice: 500,
          fee: 25,
          note: ""
        },
        {
          id: "sell-1",
          type: "sell",
          date: "2026-06-02",
          grams: 5,
          unitPrice: 560,
          fee: 10,
          note: ""
        }
      ],
      560
    );

    expect(summary.realizedProfitLoss).toBe(265);
    expect(summary.holdingGrams).toBe(0);
    expect(summary.remainingCost).toBe(0);
  });

  it("keeps remaining cost after partial sells", () => {
    const summary = calculateLedger(
      [
        {
          id: "buy-1",
          type: "buy",
          date: "2026-06-01",
          grams: 10,
          unitPrice: 500,
          fee: 100,
          note: ""
        },
        {
          id: "sell-1",
          type: "sell",
          date: "2026-06-02",
          grams: 4,
          unitPrice: 550,
          fee: 0,
          note: ""
        }
      ],
      540
    );

    expect(summary.realizedProfitLoss).toBe(160);
    expect(summary.holdingGrams).toBe(6);
    expect(summary.remainingCost).toBe(3060);
    expect(summary.unrealizedProfitLoss).toBe(180);
  });

  it("calculates unrealized and total profit from current price", () => {
    const summary = calculateLedger(
      [
        {
          id: "buy-1",
          type: "buy",
          date: "2026-06-01",
          grams: 3,
          unitPrice: 600,
          fee: 30,
          note: ""
        }
      ],
      580
    );

    expect(summary.currentValue).toBe(1740);
    expect(summary.remainingCost).toBe(1830);
    expect(summary.unrealizedProfitLoss).toBe(-90);
    expect(summary.totalProfitLoss).toBe(-90);
  });

  it("reports oversell validation errors", () => {
    const errors = validateTransactionDraft(
      {
        type: "sell",
        date: "2026-06-02",
        grams: 6,
        unitPrice: 560,
        fee: 0,
        note: ""
      },
      [
        {
          id: "buy-1",
          type: "buy",
          date: "2026-06-01",
          grams: 5,
          unitPrice: 500,
          fee: 0,
          note: ""
        }
      ]
    );

    expect(errors).toContain("卖出克数不能超过当前持仓");
  });

  it("sorts transactions by newest date first and then newest creation first", () => {
    const rows = sortTransactionsForDisplay([
      {
        id: "old",
        type: "buy",
        date: "2026-06-01",
        grams: 1,
        unitPrice: 500,
        fee: 0,
        note: ""
      },
      {
        id: "newer-id",
        type: "sell",
        date: "2026-06-02",
        grams: 1,
        unitPrice: 520,
        fee: 0,
        note: ""
      },
      {
        id: "newest-id",
        type: "buy",
        date: "2026-06-02",
        grams: 1,
        unitPrice: 510,
        fee: 0,
        note: ""
      }
    ]);

    expect(rows.map((row) => row.id)).toEqual(["newest-id", "newer-id", "old"]);
  });
});
