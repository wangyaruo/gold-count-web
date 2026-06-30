import type {
  GoldTransaction,
  LedgerSummary,
  TransactionDraft
} from "../types";

interface BuyLot {
  remainingGrams: number;
  remainingCost: number;
}

const EPSILON = 0.000001;

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundGrams(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}

function sortForCalculation(
  transactions: GoldTransaction[]
): GoldTransaction[] {
  return transactions
    .map((transaction, index) => ({ transaction, index }))
    .sort((left, right) => {
      const byDate = left.transaction.date.localeCompare(right.transaction.date);
      return byDate === 0 ? left.index - right.index : byDate;
    })
    .map(({ transaction }) => transaction);
}

function summarizeHoldings(transactions: GoldTransaction[]): {
  holdingGrams: number;
  remainingCost: number;
  realizedProfitLoss: number;
  totalBuyCost: number;
  totalSellIncome: number;
  oversold: boolean;
} {
  const lots: BuyLot[] = [];
  let realizedProfitLoss = 0;
  let totalBuyCost = 0;
  let totalSellIncome = 0;
  let oversold = false;

  for (const transaction of sortForCalculation(transactions)) {
    if (transaction.type === "buy") {
      const cost = transaction.grams * transaction.unitPrice + transaction.fee;
      totalBuyCost += cost;
      lots.push({
        remainingGrams: transaction.grams,
        remainingCost: cost
      });
      continue;
    }

    let gramsToSell = transaction.grams;
    let matchedCost = 0;
    const sellIncome = transaction.grams * transaction.unitPrice - transaction.fee;
    totalSellIncome += sellIncome;

    for (const lot of lots) {
      if (gramsToSell <= EPSILON) {
        break;
      }

      if (lot.remainingGrams <= EPSILON) {
        continue;
      }

      const matchedGrams = Math.min(lot.remainingGrams, gramsToSell);
      const costPortion =
        lot.remainingGrams <= EPSILON
          ? 0
          : (lot.remainingCost * matchedGrams) / lot.remainingGrams;

      lot.remainingGrams = roundGrams(lot.remainingGrams - matchedGrams);
      lot.remainingCost = roundCurrency(lot.remainingCost - costPortion);
      gramsToSell = roundGrams(gramsToSell - matchedGrams);
      matchedCost += costPortion;
    }

    if (gramsToSell > EPSILON) {
      oversold = true;
    }

    realizedProfitLoss += sellIncome - matchedCost;
  }

  return {
    holdingGrams: roundGrams(
      lots.reduce((sum, lot) => sum + lot.remainingGrams, 0)
    ),
    remainingCost: roundCurrency(
      lots.reduce((sum, lot) => sum + lot.remainingCost, 0)
    ),
    realizedProfitLoss: roundCurrency(realizedProfitLoss),
    totalBuyCost: roundCurrency(totalBuyCost),
    totalSellIncome: roundCurrency(totalSellIncome),
    oversold
  };
}

export function calculateLedger(
  transactions: GoldTransaction[],
  currentGoldPrice: number
): LedgerSummary {
  const holdings = summarizeHoldings(transactions);
  const currentValue = roundCurrency(
    holdings.holdingGrams * Math.max(currentGoldPrice, 0)
  );
  const unrealizedProfitLoss = roundCurrency(
    currentValue - holdings.remainingCost
  );
  const totalProfitLoss = roundCurrency(
    holdings.realizedProfitLoss + unrealizedProfitLoss
  );

  return {
    holdingGrams: holdings.holdingGrams,
    remainingCost: holdings.remainingCost,
    currentValue,
    unrealizedProfitLoss,
    realizedProfitLoss: holdings.realizedProfitLoss,
    totalProfitLoss,
    totalBuyCost: holdings.totalBuyCost,
    totalSellIncome: holdings.totalSellIncome
  };
}

export function validateTransactionDraft(
  draft: TransactionDraft,
  existing: GoldTransaction[],
  editingId?: string
): string[] {
  const errors: string[] = [];

  if (!draft.date) {
    errors.push("请选择交易日期");
  }

  if (!draft.type) {
    errors.push("请选择交易类型");
  }

  if (!Number.isFinite(draft.grams) || draft.grams <= 0) {
    errors.push("克数必须大于 0");
  }

  if (!Number.isFinite(draft.unitPrice) || draft.unitPrice <= 0) {
    errors.push("单价必须大于 0");
  }

  if (!Number.isFinite(draft.fee) || draft.fee < 0) {
    errors.push("费用不能小于 0");
  }

  if (errors.length > 0) {
    return errors;
  }

  const candidate: GoldTransaction = {
    id: editingId ?? "__draft__",
    ...draft
  };
  const candidateTransactions = [
    ...existing.filter((transaction) => transaction.id !== editingId),
    candidate
  ];

  if (summarizeHoldings(candidateTransactions).oversold) {
    errors.push("卖出克数不能超过当前持仓");
  }

  return errors;
}

export function sortTransactionsForDisplay(
  transactions: GoldTransaction[]
): GoldTransaction[] {
  return [...transactions].sort((left, right) => {
    const byDate = right.date.localeCompare(left.date);
    return byDate === 0 ? right.id.localeCompare(left.id) : byDate;
  });
}
