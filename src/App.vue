<template>
  <main class="app-shell">
    <section class="app-header">
      <div>
        <p class="eyebrow">Gold Ledger</p>
        <h1>黄金小账本</h1>
        <p>记录每一笔黄金买卖，清楚看到持仓、浮盈和已实现盈亏。</p>
      </div>
      <GoldPriceInput
        :model-value="currentGoldPrice"
        @save="handleGoldPriceSave"
      />
    </section>

    <SummaryCards :summary="summary" />

    <section class="workspace-grid">
      <TransactionForm
        :editing-transaction="editingTransaction"
        :reset-token="formResetToken"
        @cancel-edit="editingTransaction = null"
        @save="handleTransactionSave"
      />

      <div class="ledger-panel">
        <TransactionTable
          v-if="transactions.length > 0"
          :filter="transactionFilter"
          :transactions="filteredTransactions"
          @delete="handleTransactionDelete"
          @edit="handleTransactionEdit"
          @update:filter="handleFilterChange"
        />
        <EmptyLedger v-else />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import EmptyLedger from "./components/EmptyLedger.vue";
import GoldPriceInput from "./components/GoldPriceInput.vue";
import SummaryCards from "./components/SummaryCards.vue";
import TransactionForm from "./components/TransactionForm.vue";
import TransactionTable from "./components/TransactionTable.vue";
import {
  calculateLedger,
  sortTransactionsForDisplay,
  validateTransactionDraft
} from "./lib/goldLedger";
import {
  loadCurrentGoldPrice,
  loadTransactionFilter,
  loadTransactions,
  saveCurrentGoldPrice,
  saveTransactionFilter,
  saveTransactions
} from "./lib/storage";
import type {
  GoldTransaction,
  TransactionDraft,
  TransactionFilter
} from "./types";

const transactions = ref<GoldTransaction[]>(loadTransactions());
const currentGoldPrice = ref(loadCurrentGoldPrice());
const transactionFilter = ref<TransactionFilter>(loadTransactionFilter());
const editingTransaction = ref<GoldTransaction | null>(null);
const formResetToken = ref(0);

const summary = computed(() =>
  calculateLedger(transactions.value, currentGoldPrice.value)
);

const filteredTransactions = computed(() => {
  const rows = sortTransactionsForDisplay(transactions.value);
  return transactionFilter.value === "all"
    ? rows
    : rows.filter((transaction) => transaction.type === transactionFilter.value);
});

function createTransactionId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function persistTransactions(nextTransactions: GoldTransaction[]): void {
  transactions.value = nextTransactions;
  saveTransactions(nextTransactions);
}

function handleGoldPriceSave(price: number): void {
  currentGoldPrice.value = price;
  saveCurrentGoldPrice(price);
  ElMessage.success("当前金价已保存");
}

function handleFilterChange(filter: TransactionFilter): void {
  transactionFilter.value = filter;
  saveTransactionFilter(filter);
}

function handleTransactionEdit(transaction: GoldTransaction): void {
  editingTransaction.value = transaction;
}

function handleTransactionDelete(id: string): void {
  persistTransactions(
    transactions.value.filter((transaction) => transaction.id !== id)
  );

  if (editingTransaction.value?.id === id) {
    editingTransaction.value = null;
  }

  ElMessage.success("交易已删除");
}

function handleTransactionSave(draft: TransactionDraft): void {
  const editingId = editingTransaction.value?.id;
  const errors = validateTransactionDraft(
    draft,
    transactions.value,
    editingId
  );

  if (errors.length > 0) {
    ElMessage.error(errors[0]);
    return;
  }

  if (editingId) {
    persistTransactions(
      transactions.value.map((transaction) =>
        transaction.id === editingId ? { id: editingId, ...draft } : transaction
      )
    );
    editingTransaction.value = null;
    ElMessage.success("交易已更新");
  } else {
    persistTransactions([
      ...transactions.value,
      {
        id: createTransactionId(),
        ...draft
      }
    ]);
    ElMessage.success("交易已添加");
  }

  formResetToken.value += 1;
}
</script>
