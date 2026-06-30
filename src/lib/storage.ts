import { defaultLedgerData } from "./ledgerDataDefaults";
import type { LedgerData } from "../types";

const LEDGER_DATA_ENDPOINT = "/api/ledger-data";

export async function loadLedgerData(): Promise<LedgerData> {
  try {
    const response = await fetch(LEDGER_DATA_ENDPOINT);
    if (!response.ok) {
      return defaultLedgerData;
    }

    return (await response.json()) as LedgerData;
  } catch {
    return defaultLedgerData;
  }
}

export async function saveLedgerData(data: LedgerData): Promise<LedgerData> {
  const response = await fetch(LEDGER_DATA_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("保存账本数据失败");
  }

  return (await response.json()) as LedgerData;
}
