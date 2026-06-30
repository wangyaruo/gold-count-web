export type TransactionType = "buy" | "sell";

export interface GoldTransaction {
  id: string;
  type: TransactionType;
  date: string;
  grams: number;
  unitPrice: number;
  fee: number;
  note: string;
}

export type TransactionDraft = Omit<GoldTransaction, "id">;

export type TransactionFilter = "all" | TransactionType;

export interface LedgerData {
  currentGoldPrice: number;
  transactionFilter: TransactionFilter;
  transactions: GoldTransaction[];
}

export interface LedgerSummary {
  holdingGrams: number;
  remainingCost: number;
  currentValue: number;
  unrealizedProfitLoss: number;
  realizedProfitLoss: number;
  totalProfitLoss: number;
  totalBuyCost: number;
  totalSellIncome: number;
}
