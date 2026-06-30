import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultLedgerData } from "./ledgerDataDefaults";
import { loadLedgerData, saveLedgerData } from "./storage";
import type { LedgerData } from "../types";

describe("storage API client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads ledger data from the mock API", async () => {
    const data: LedgerData = {
      currentGoldPrice: 588.5,
      transactionFilter: "buy",
      transactions: [
        {
          id: "buy-1",
          type: "buy",
          date: "2026-06-01",
          grams: 10,
          unitPrice: 520,
          fee: 30,
          note: "金条"
        }
      ]
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data)
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(loadLedgerData()).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith("/api/ledger-data");
  });

  it("saves ledger data to the mock API", async () => {
    const data: LedgerData = {
      currentGoldPrice: 601,
      transactionFilter: "sell",
      transactions: []
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data)
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(saveLedgerData(data)).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith("/api/ledger-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  });

  it("returns defaults when the mock API request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(loadLedgerData()).resolves.toEqual(defaultLedgerData);
  });
});
