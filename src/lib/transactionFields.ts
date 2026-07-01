export type LinkedTransactionField = "grams" | "amount" | "unitPrice";

export interface LinkedTransactionValues {
  grams: number;
  amount: number;
  unitPrice: number;
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundGrams(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}

function positive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function deriveLinkedTransactionFields(
  values: LinkedTransactionValues,
  changedField: LinkedTransactionField
): LinkedTransactionValues {
  const nextValues = { ...values };

  if (changedField === "grams") {
    if (positive(nextValues.grams) && positive(nextValues.amount)) {
      nextValues.unitPrice = roundCurrency(nextValues.amount / nextValues.grams);
    } else if (positive(nextValues.grams) && positive(nextValues.unitPrice)) {
      nextValues.amount = roundCurrency(nextValues.grams * nextValues.unitPrice);
    }
  }

  if (changedField === "amount") {
    if (positive(nextValues.grams) && positive(nextValues.amount)) {
      nextValues.unitPrice = roundCurrency(nextValues.amount / nextValues.grams);
    } else if (positive(nextValues.amount) && positive(nextValues.unitPrice)) {
      nextValues.grams = roundGrams(nextValues.amount / nextValues.unitPrice);
    }
  }

  if (changedField === "unitPrice") {
    if (positive(nextValues.grams) && positive(nextValues.unitPrice)) {
      nextValues.amount = roundCurrency(nextValues.grams * nextValues.unitPrice);
    } else if (positive(nextValues.amount) && positive(nextValues.unitPrice)) {
      nextValues.grams = roundGrams(nextValues.amount / nextValues.unitPrice);
    }
  }

  return nextValues;
}
