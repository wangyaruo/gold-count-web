import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  defaultLedgerData,
  readLedgerDataFile,
  writeLedgerDataFile
} from "./mockDataStore";

let tempDir = "";
let dataFile = "";

describe("mockDataStore", () => {
  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "gold-ledger-"));
    dataFile = join(tempDir, "ledger-data.json");
  });

  afterEach(async () => {
    await rm(tempDir, { force: true, recursive: true });
  });

  it("returns default data when the data file does not exist", async () => {
    await expect(readLedgerDataFile(dataFile)).resolves.toEqual(
      defaultLedgerData
    );
  });

  it("falls back to default data when the data file is invalid", async () => {
    await writeFile(dataFile, "{bad json", "utf8");

    await expect(readLedgerDataFile(dataFile)).resolves.toEqual(
      defaultLedgerData
    );
  });

  it("writes ledger data as formatted JSON", async () => {
    const nextData = {
      currentGoldPrice: 588.5,
      transactionFilter: "sell" as const,
      transactions: [
        {
          id: "buy-1",
          type: "buy" as const,
          date: "2026-06-01",
          grams: 10,
          unitPrice: 520,
          fee: 30,
          note: "金条"
        }
      ]
    };

    await writeLedgerDataFile(dataFile, nextData);

    const raw = await readFile(dataFile, "utf8");
    expect(raw).toContain("\n  \"currentGoldPrice\": 588.5");
    await expect(readLedgerDataFile(dataFile)).resolves.toEqual(nextData);
  });
});
