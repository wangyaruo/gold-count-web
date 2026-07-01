import { describe, expect, it } from "vitest";
import { deriveLinkedTransactionFields } from "./transactionFields";

describe("transactionFields", () => {
  it("derives unit price from grams and amount", () => {
    expect(
      deriveLinkedTransactionFields(
        { grams: 10, amount: 5230, unitPrice: 0 },
        "amount"
      )
    ).toEqual({ grams: 10, amount: 5230, unitPrice: 523 });
  });

  it("derives amount from grams and unit price", () => {
    expect(
      deriveLinkedTransactionFields(
        { grams: 3.5, amount: 0, unitPrice: 520 },
        "unitPrice"
      )
    ).toEqual({ grams: 3.5, amount: 1820, unitPrice: 520 });
  });

  it("derives grams from amount and unit price", () => {
    expect(
      deriveLinkedTransactionFields(
        { grams: 0, amount: 999.99, unitPrice: 333.33 },
        "unitPrice"
      )
    ).toEqual({ grams: 3, amount: 999.99, unitPrice: 333.33 });
  });
});
