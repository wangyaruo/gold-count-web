import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { defaultLedgerData } from "../src/lib/ledgerDataDefaults";
import type { LedgerData } from "../src/types";

export { defaultLedgerData };

function isLedgerData(value: unknown): value is LedgerData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<LedgerData>;
  const validFilter =
    candidate.transactionFilter === "all" ||
    candidate.transactionFilter === "buy" ||
    candidate.transactionFilter === "sell";
  const validTransactions =
    Array.isArray(candidate.transactions) &&
    candidate.transactions.every((transaction) => {
      if (!transaction || typeof transaction !== "object") {
        return false;
      }

      const item = transaction as unknown as Record<string, unknown>;
      return (
        typeof item.id === "string" &&
        (item.type === "buy" || item.type === "sell") &&
        typeof item.date === "string" &&
        typeof item.grams === "number" &&
        typeof item.unitPrice === "number" &&
        typeof item.fee === "number" &&
        typeof item.note === "string"
      );
    });

  return (
    typeof candidate.currentGoldPrice === "number" &&
    Number.isFinite(candidate.currentGoldPrice) &&
    candidate.currentGoldPrice >= 0 &&
    validFilter &&
    validTransactions
  );
}

export async function readLedgerDataFile(filePath: string): Promise<LedgerData> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return isLedgerData(parsed) ? parsed : defaultLedgerData;
  } catch {
    return defaultLedgerData;
  }
}

export async function writeLedgerDataFile(
  filePath: string,
  data: LedgerData
): Promise<LedgerData> {
  const nextData = isLedgerData(data) ? data : defaultLedgerData;
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(nextData, null, 2)}\n`, "utf8");
  return nextData;
}
