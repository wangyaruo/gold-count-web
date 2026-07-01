import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { defaultLedgerData } from "../src/lib/ledgerDataDefaults";
import type { LedgerData } from "../src/types";

export { defaultLedgerData };

function normalizeLedgerData(value: unknown): LedgerData | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<LedgerData>;
  const validFilter =
    candidate.transactionFilter === "all" ||
    candidate.transactionFilter === "buy" ||
    candidate.transactionFilter === "sell";

  if (
    typeof candidate.currentGoldPrice !== "number" ||
    !Number.isFinite(candidate.currentGoldPrice) ||
    candidate.currentGoldPrice < 0 ||
    !validFilter ||
    !Array.isArray(candidate.transactions)
  ) {
    return null;
  }

  const transactions = candidate.transactions.map((transaction) => {
    if (!transaction || typeof transaction !== "object") {
      return null;
    }

    const item = transaction as unknown as Record<string, unknown>;
    const amount = item.amount ?? item.fee;
    if (
      typeof item.id !== "string" ||
      (item.type !== "buy" && item.type !== "sell") ||
      typeof item.date !== "string" ||
      typeof item.grams !== "number" ||
      typeof item.unitPrice !== "number" ||
      typeof amount !== "number" ||
      typeof item.note !== "string"
    ) {
      return null;
    }

    return {
      id: item.id,
      type: item.type,
      date: item.date,
      grams: item.grams,
      unitPrice: item.unitPrice,
      amount,
      note: item.note
    };
  });

  if (transactions.some((transaction) => transaction === null)) {
    return null;
  }

  return {
    currentGoldPrice: candidate.currentGoldPrice,
    transactionFilter: candidate.transactionFilter,
    transactions: transactions as LedgerData["transactions"]
  };
}

export async function readLedgerDataFile(filePath: string): Promise<LedgerData> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return normalizeLedgerData(parsed) ?? defaultLedgerData;
  } catch {
    return defaultLedgerData;
  }
}

export async function writeLedgerDataFile(
  filePath: string,
  data: LedgerData
): Promise<LedgerData> {
  const nextData = normalizeLedgerData(data) ?? defaultLedgerData;
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(nextData, null, 2)}\n`, "utf8");
  return nextData;
}
